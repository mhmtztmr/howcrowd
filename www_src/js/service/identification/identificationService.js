//TODO: file system integartion with INTERFACE

var identificationService = function($q, guidService, fileService) {
  var DID;

  function loadDeviceId(fileSystemIncluded) {
    var def = $q.defer();
    if (fileSystemIncluded === true && window.cordova) {
      DID = readDeviceIdFromLocalStorage();
      if (DID) {
        writeDeviceIdToInternalStorage(DID,
          function() {
            def.resolve(DID);
          },
          function() {
            def.resolve(DID);
          });
      } else {
        readDeviceIdFromInternalStorage(function(deviceId) {
          DID = deviceId;
          if (DID) {
            writeDeviceIdToLocalStorage(DID);
            def.resolve(DID);
          } else {
            DID = guidService.get();
            writeDeviceIdToLocalStorage(DID);
            writeDeviceIdToInternalStorage(DID, function() {
              def.resolve(DID);
            }, function() {
              def.resolve(DID);
            });
          }

        }, function() {
          DID = guidService.get();
          writeDeviceIdToLocalStorage(DID);
          writeDeviceIdToInternalStorage(DID, function() {
            def.resolve(DID);
          }, function() {
            def.resolve(DID);
          });
        });
      }
    } else {
      DID = readDeviceIdFromLocalStorage();
      if (DID) {
        def.resolve(DID);
      } else {
        DID = guidService.get();
        writeDeviceIdToLocalStorage(DID);
        def.resolve(DID);
      }
    }
    return def.promise;
  }

  function getDeviceId() {;
    return DID;
  }

  function readDeviceIdFromLocalStorage() {
    return localStorage.getItem('deviceId');
  }

  function writeDeviceIdToLocalStorage(deviceId) {
    return localStorage.setItem('deviceId', deviceId);
  }

  function readDeviceIdFromInternalStorage(onSuccess, onFailure) {
    fileService.readData(onSuccess, onFailure);
  }

  function writeDeviceIdToInternalStorage(deviceId, onSuccess, onFailure) {
    fileService.writeData(deviceId, onSuccess, onFailure);
  }

  return {
    loadDeviceId: loadDeviceId,
    getDeviceId: getDeviceId
  };
};

angular.module('identification', ['guid', 'file'])
  .factory('identificationService', ['$q', 'guidService', 'fileService',
    identificationService
  ]);
