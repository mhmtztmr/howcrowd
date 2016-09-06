var dbService = function(backendlessService) {

  function init() {
    backendlessService.init();
    window.console.log('Backend initialized.');
  }

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    backendlessService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }

  function askCrowd(place, crowd, device, onSuccess, onFailure) {
    backendlessService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }

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

  function uploadFile(base64Source, fileName, onSuccess, onFailure){
    backendlessService.uploadFile(base64Source, fileName, onSuccess, onFailure);
  }

  return {
    init: init,
    insertCrowd: insertCrowd,
    askCrowd: askCrowd,
    retrieveCrowds: retrieveCrowds,
    giveFeedback: giveFeedback,
    insertDevice: insertDevice,
    retrieveDevice: retrieveDevice,
    //insertPlace: insertPlace,
    reportCrowd: reportCrowd,
    retrieveNearbyPlaces: retrieveNearbyPlaces,
    uploadFile: uploadFile
  };
};

angular.module('db', ['backendless'])
  .factory('dbService', ['backendlessService', dbService]);
