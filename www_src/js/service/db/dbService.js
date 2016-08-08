var dbService = function(backendlessService) {

  function init() {
    backendlessService.init();
  }

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    backendlessService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }

  // function insertPlace(place, onSuccess, onFailure) {
  //   backendlessService.insertPlace(place, onSuccess, onFailure);
  // }

  function retrieveDevice(deviceId) {
    return backendlessService.retrieveDevice(deviceId);
  }

  function insertDevice(device, onSuccess, onFailure) {
    backendlessService.insertDevice(device, onSuccess, onFailure);
  }

  function retrieveCrowds(filter) {
    return backendlessService.retrieveCrowds(filter);
  }

  function retrieveNearbyPlaces(filter) {
    return backendlessService.retrieveNearbyPlaces(filter);
  }

  function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
    backendlessService.giveFeedback(crowd, isPositive, onSuccess, onFailure);
  }

  function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
    backendlessService.reportCrowd(crowd, reportReason, onSuccess, onFailure);
  }

  return {
    init: init,
    insertCrowd: insertCrowd,
    retrieveCrowds: retrieveCrowds,
    giveFeedback: giveFeedback,
    insertDevice: insertDevice,
    retrieveDevice: retrieveDevice,
    //insertPlace: insertPlace,
    reportCrowd: reportCrowd,
    retrieveNearbyPlaces: retrieveNearbyPlaces
  };
};

angular.module('db', ['backendless'])
  .factory('dbService', ['backendlessService', dbService]);
