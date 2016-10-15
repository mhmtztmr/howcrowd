angular.module('seeCrowd.Service', ['db', 'config', 'date', 'location', 'feedback'])
  .factory('seeCrowdService', ['dbService', 'configService', 'dateService', 'locationService', '$rootScope', 'feedbackModel',
    function(dbService, configService, dateService, locationService, $rootScope, feedbackModel) {

      var self = {};

      function getNearbyFilter() {
        var center = angular.fromJson(localStorage.getItem('location')),
        location = locationService.getBoundingBox(center, configService.NEARBY_DISTANCE);
        return getFilter(location);
      }

      function getFarFilter(query) {
        var center = angular.fromJson(localStorage.getItem('location')),
        location = locationService.getBoundingBox(center, configService.FAR_DISTANCE);
        return getFilter(location, undefined, query);
      }

      /**
        *
        *
      */
      function getFilter(location, date, query, mapPlaces, nextPage) {
        var filter = {
          date: {},
          location: location,
          query: query,
          nextPage: nextPage,
          mapPlaces: mapPlaces
        };

        if(date) {
          filter.date = date;
        }
        else{
          filter.date.start = dateService.getNearbyTime();
          filter.date.end = dateService.getNow();
        }

        return filter;
      }

      self.getNearbyPlaces = function() {
        return new Promise(function(resolve, reject){
          dbService.selectPlaces(getNearbyFilter()).then(function(placesObject) {
            resolve(placesObject);
          }, reject);
        });
      };

      self.getPlacesNextPage = function(nextPage) {
        return new Promise(function(resolve, reject){
          dbService.selectPlaces(getFilter(undefined, {}, undefined, undefined, nextPage)).then(function(placesObject) {
            resolve(placesObject);
          }, reject);
        });
      };

      self.getPlacesBySourceIDs = function(mapPlaces) {
        return new Promise(function(resolve, reject){
          dbService.selectPlaces(getFilter(undefined, {}, undefined, mapPlaces)).then(function(placesObject) {
            resolve(placesObject);
          }, reject);
        });
      };

      self.getPlaces = function() {
        return new Promise(function(resolve, reject){
          dbService.selectPlaces(getFarFilter()).then(function(placesObject) {
            resolve(placesObject);
          }, reject);
        });
      };

      self.getPlacesInBox = function(boundingBox) {
        return new Promise(function(resolve, reject){
          dbService.selectPlaces(getFilter(boundingBox)).then(function(placesObject) {
            resolve(placesObject);
          }, reject);
        });
      };

      self.searchPlaces = function(query) {
        return new Promise(function(resolve, reject){
          dbService.selectPlaces(getFarFilter(query)).then(function(placesObject) {
            resolve(placesObject);
          }, reject);
        });
      };

      self.getPlaceBySourceID = function(mapPlace) {
        return self.getPlacesBySourceIDs([mapPlace]);
      };

      self.askCrowd = function(crowdData, placeObject, deviceObject) {
        return new Promise(function(resolve, reject){
          if(placeObject.objectId) {
            dbService.createCrowd(crowdData, placeObject, deviceObject).then(resolve, reject);
          }
          else {
            dbService.createPlace(placeObject, crowdData).then(function(placeObject) { //a place created with given data
                dbService.createCrowd(crowdData, placeObject, deviceObject).then(resolve, reject);
              }, reject);
            }
          });
      };

      self.getCrowds = function(placeObject) {
        return new Promise(function(resolve, reject){
          dbService.selectCrowds(placeObject, getFilter()).then(function(_crowds) {
            var i, now = dateService.getNow(), crowd;
            for(i = 0; i < _crowds.length; i++) {
              crowd = _crowds[i];
              crowd.datetimePass = Math.round((now - crowd.datetime) / (1000 * 60)); //mins
              crowd.feedbackable = 
                crowd.datetimePass <= configService.FEEDBACK_TIME * 60 && //entered just now
                placeObject.isNearby && //here
                crowd.device.ID !== $rootScope.deviceObject.ID; //not me
              crowd.myFeedback = feedbackModel.getFeedback(crowd.objectId);
              if(crowd.myFeedback) {
                crowd.myFeedback = crowd.myFeedback.isPositive;
              }
            }
            resolve(_crowds);
          }, reject);
        });
      };

      self.giveFeedback = function(crowdObject, isPositive) {
        return new Promise(function(resolve, reject){
          dbService.giveFeedback(crowdObject, isPositive).then(function() {
            feedbackModel.insertFeedback(crowdObject.objectId, isPositive);
            resolve();
          }, reject);
        });
      };

      // function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
      //   dbService.reportCrowd(crowd, reportReason, onSuccess, onFailure);
      // }

      return self;
    }
  ]);