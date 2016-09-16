angular.module('seeCrowd.Service', ['db', 'config', 'date', 'location', 'feedback', 'placeType'])
  .factory('seeCrowdService', ['dbService', 'configService', 'dateService', 'locationService', '$rootScope', 'feedbackModel', 'placeTypeService',
    function(dbService, configService, dateService, locationService, $rootScope, feedbackModel, placeTypeService) {

      var self = {};

      //filter.date.start, filter.date.end,
      //filter.location.latitude.upper, filter.location.latitude.lower, filter.location.longitude.upper, filter.location.longitude.lower
      function retrieveCrowds() {
         function getFilter() {
              boundingBox = mapService.getBoundingBox(angular.fromJson(localStorage.getItem('location')), configService.FAR_DISTANCE);
              return {
                  date: {
                      start: dateService.getNearbyTime(),
                      end: dateService.getNow()
                  },
                  location: boundingBox
              };
          }
          return dbService.retrieveCrowds(getFilter());
      }

      function getNearbyFilter() {
        var center = angular.fromJson(localStorage.getItem('location')),
        location = locationService.getBoundingBox(center, configService.NEARBY_DISTANCE);
        return getFilter(location);
      }

      function getFarFilter() {
        var center = angular.fromJson(localStorage.getItem('location')),
        location = locationService.getBoundingBox(center, configService.FAR_DISTANCE);
        return getFilter(location);
      }

      function getFilter(location) {
        var filter = {
          date: {},
          location: location
        };

        filter.date.start = dateService.getNearbyTime();
        filter.date.end = dateService.getNow();

        return filter;
      }

      function formatPlaces(places) {
        var i, place,
        now = dateService.getNow(),
        nearbyTime = dateService.getNearbyTime();
        for(i = 0; i < places.length; i++) {
          place = places[i];
          place.lastUpdatePass = Math.round((now - place.lastUpdateDatetime) / (60000)); //mins
          place.hasText = place.lastTextDatetime > nearbyTime;
          place.hasPhoto = place.lastPhotoDatetime > nearbyTime;
          place.hasAsk = place.lastAskDatetime > nearbyTime;
          place.location = {
            latitude: place.latitude,
            longitude: place.longitude
          };
          place.typeObject = placeTypeService.getTypeObject(place);
        }
      }

      self.getNearbyPlaces = function() {
        return new Promise(function(resolve, reject){
          dbService.selectPlaces(getNearbyFilter()).then(function(placesObject) {
            formatPlaces(placesObject.data);
            resolve(placesObject);
          }, reject);
        });
      };

      self.getPlaces = function(nextPage) {
        return new Promise(function(resolve, reject){
          if(nextPage) {
            var placesObject = nextPage();
            formatPlaces(placesObject.data);
            resolve(placesObject);
          }
          else {
            dbService.selectPlaces(getFarFilter()).then(function(placesObject) {
              formatPlaces(placesObject.data);
              resolve(placesObject);
            }, reject);
          }
        });
      };

      self.getPlacesInBox = function(boundingBox) {
        return new Promise(function(resolve, reject){
          dbService.selectPlaces(getFilter(boundingBox)).then(function(placesObject) {
            formatPlaces(placesObject.data);
            resolve(placesObject);
          }, reject);
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

      function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
        dbService.reportCrowd(crowd, reportReason, onSuccess, onFailure);
      }

      return self;
    }
  ]);