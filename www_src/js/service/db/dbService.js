angular.module('db', ['backendless', 'date', 'placeType'])
  .factory('dbService', ['backendlessService', 'dateService', 'placeTypeService', '$log',
    function(backendlessService, dateService, placeTypeService, $log) {
      var self = {}, backendService = backendlessService;

      self.init = function() {
        return new Promise(function(resolve, reject){
          backendService.init().then(function() {
            $log.log('Backend initialized.');
            resolve();
          }, reject).catch(reject);
        });
      };

      function formatPlaces(places) {
        var i, place,
        now = dateService.getNow(),
        nearbyTime = dateService.getNearbyTime();
        for(i = 0; i < places.length; i++) {
          place = places[i];
          if(place.lastUpdateDatetime > nearbyTime) {
            place.lastUpdatePass = Math.round((now - place.lastUpdateDatetime) / (60000)); //mins
          }
          else {
            place.averageCrowdValue = undefined;
          }
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

      self.selectDevice = function(ID) {
        return new Promise(function(resolve, reject){
          backendService.selectDevice(ID).then(resolve, reject).catch(reject);
        });
      };

      self.createDevice = function(deviceData) {
        return new Promise(function(resolve, reject){
          backendService.createDevice(deviceData).then(resolve, reject).catch(reject);
        });
      };

      self.selectPlace = function(sourceID) {
        return new Promise(function(resolve, reject){
          backendService.selectPlace(sourceID).then(function(placeObject) {
            if(placeObject) {
              formatPlaces([placeObject]);
            }
            resolve(placeObject);
          }, reject).catch(reject);
        });
      };

      self.selectPlaces = function(filter) {
        return new Promise(function(resolve, reject){
          if(filter.nextPage) {
            var placesObject = filter.nextPage();
            formatPlaces(placesObject.data);
            resolve(placesObject);
          }
          else {
            backendService.selectPlaces(filter).then(function(placesObject) {
              formatPlaces(placesObject.data);
              resolve(placesObject);
            }, reject).catch(reject);
          }
        });
      };

      self.createPlace = function(placeData, initialCrowdData) {
        return new Promise(function(resolve, reject){
          var _placeObject = new Place(placeData);
          backendService.createPlace(_placeObject, initialCrowdData).then(resolve, reject).catch(reject);
        });
      };

      self.updatePlace = function(placeObject, crowdData) {
        return new Promise(function(resolve, reject){
          var _placeObject = new Place(placeObject);
          backendService.updatePlace(_placeObject, crowdData).then(resolve, reject).catch(reject);
        });
      };

      self.selectCrowds = function(placeObject, filter) {
        return new Promise(function(resolve, reject){
          backendService.selectCrowds(placeObject, filter).then(resolve, reject).catch(reject);
        });
      };

      self.createCrowd = function(crowdData, placeObject, deviceObject) {
        return new Promise(function(resolve, reject){
          var _placeObject = new Place(placeObject);
          backendService.createCrowd(crowdData, _placeObject, deviceObject).then(resolve, reject).catch(reject);
        });
      };

      self.retrieveCrowds = function(filter) {
        return backendService.retrieveCrowds(filter);
      };

      self.retrieveNearbyPlaces = function(filter) {
        return backendService.retrieveNearbyPlaces(filter);
      };

      self.giveFeedback = function(crowdObject, isPositive) {
        return new Promise(function(resolve, reject){
          var _crowdObject = new Crowd(crowdObject);
          backendService.giveFeedback(_crowdObject, isPositive).then(resolve, reject).catch(reject);
        });
      };

      // function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
      //   backendService.reportCrowd(crowd, reportReason, onSuccess, onFailure);
      // }

      self.uploadFile = function(base64Source, fileName, onSuccess, onFailure){
        backendService.uploadFile(base64Source, fileName, onSuccess, onFailure);
      };

      return self;
  }]);
