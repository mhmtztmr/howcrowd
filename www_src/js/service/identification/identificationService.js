//TODO: file system integartion with INTERFACE


angular.module('identification', ['guid', 'file', 'db'])
  .factory('identificationService', ['guidService', 'fileService', 'dbService',
    function(guidService, fileService, dbService) {
      var self = {};

      function getDeviceId(onSuccess) {
        var deviceID;
        // if (window.cordova) {
        //   deviceID = readDeviceIdFromLocalStorage();
        //   if (deviceID) {
        //     onSuccess(deviceID);
        //     writeDeviceIdToInternalStorage(deviceID);
        //   } else {
        //     readDeviceIdFromInternalStorage(function(_deviceId) {
        //       deviceID = _deviceId;
        //       if (deviceID) {
        //         onSuccess(deviceID);
        //         writeDeviceIdToLocalStorage(deviceID);
        //       } else {
        //         deviceID = guidService.get();
        //         onSuccess(deviceID);
        //         writeDeviceIdToLocalStorage(deviceID);
        //         writeDeviceIdToInternalStorage(deviceID);
        //       }
        //     }, function() {
        //       deviceID = guidService.get();
        //       onSuccess(deviceID);
        //       writeDeviceIdToLocalStorage(deviceID);
        //       writeDeviceIdToInternalStorage(deviceID);
        //     });
        //   }
        // } else {
          deviceID = readDeviceIdFromLocalStorage();
          if (deviceID) {
            onSuccess(deviceID);
          } else {
            deviceID = guidService.get();
            writeDeviceIdToLocalStorage(deviceID);
            onSuccess(deviceID);
          }
        // }
      }

      self.getRobotDeviceObject = function() {
        return new Promise(function(resolve, reject) {
          dbService.selectDevice('mac-hi-ne').then(function(deviceObject) {
            if(deviceObject) {
              resolve(deviceObject);
            }
            else {
              dbService.createDevice({ID:'mac-hi-ne'}).then(function(deviceObject) {
                resolve(deviceObject);
              }, reject);
            }
          }, reject);
        });
      };

      self.getDeviceObject = function() {
        return new Promise(function(resolve, reject) {
          getDeviceId(function(deviceID){
            dbService.selectDevice(deviceID).then(function(deviceObject) {
              if(deviceObject) {
                resolve(deviceObject);
              }
              else {
                dbService.createDevice({ID:deviceID}).then(function(deviceObject) {
                  resolve(deviceObject);
                }, reject);
              }
            }, reject);
          }, reject);
        });
      };

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

      return self;
    }]);