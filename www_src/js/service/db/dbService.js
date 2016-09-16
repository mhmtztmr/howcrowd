angular.module('db', ['backendless'])
  .factory('dbService', ['backendlessService', 
    function(backendlessService) {
      var self = {};

      self.selectDevice = function(ID) {
        return new Promise(function(resolve, reject){
          backendlessService.selectDevice(ID).then(resolve, reject).catch(reject);
        });
      };

      self.createDevice = function(deviceData) {
        return new Promise(function(resolve, reject){
          backendlessService.createDevice(deviceData).then(resolve, reject).catch(reject);
        });
      };

      self.selectPlace = function(sourceID) {
        return new Promise(function(resolve, reject){
          backendlessService.selectPlace(sourceID).then(resolve, reject).catch(reject);
        });
      };

      self.selectPlaces = function(filter) {
        return new Promise(function(resolve, reject){
          backendlessService.selectPlaces(filter).then(resolve, reject).catch(reject);
        });
      };

      self.createPlace = function(placeData, initialCrowdData) {
        return new Promise(function(resolve, reject){
          backendlessService.createPlace(placeData, initialCrowdData).then(resolve, reject).catch(reject);
        });
      };

      self.updatePlace = function(placeObject, crowdData) {
        return new Promise(function(resolve, reject){
          backendlessService.updatePlace(placeObject, crowdData).then(resolve, reject).catch(reject);
        });
      };

      self.selectCrowds = function(placeObject, filter) {
        return new Promise(function(resolve, reject){
          backendlessService.selectCrowds(placeObject, filter).then(resolve, reject).catch(reject);
        });
      }

      self.createCrowd = function(crowdData, placeObject, deviceObject) {
        return new Promise(function(resolve, reject){
          backendlessService.createCrowd(crowdData, placeObject, deviceObject).then(resolve, reject).catch(reject);
        });
      };

      self.init = function() {
        backendlessService.init();
        window.console.log('Backend initialized.');
      };

      function askCrowd(place, crowd, device, onSuccess, onFailure) {
        backendlessService.insertCrowd(place, crowd, device, onSuccess, onFailure);
      }

      function retrieveDevice(deviceId) {
        return backendlessService.retrieveDevice(deviceId);
      }

      function insertDevice(device, onSuccess, onFailure) {
        backendlessService.insertDevice(device, onSuccess, onFailure);
      }

      self.retrieveCrowds = function(filter) {
        return backendlessService.retrieveCrowds(filter);
      };

      self.retrieveNearbyPlaces = function(filter) {
        return backendlessService.retrieveNearbyPlaces(filter);
      };

      self.giveFeedback = function(crowdObject, isPositive) {
        return new Promise(function(resolve, reject){
          backendlessService.giveFeedback(crowdObject, isPositive).then(resolve, reject).catch(reject);
        });
      };

      function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
        backendlessService.reportCrowd(crowd, reportReason, onSuccess, onFailure);
      }

      self.uploadFile = function(base64Source, fileName, onSuccess, onFailure){
        backendlessService.uploadFile(base64Source, fileName, onSuccess, onFailure);
      };

      return self;
  }]);
