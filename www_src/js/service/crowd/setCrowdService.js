angular.module('setCrowd.Service', ['db'])
  .factory('setCrowdService', ['dbService', function(dbService) {
    var self = {};

    self.setCrowd = function(crowdData, placeData, deviceObject) {
      return new Promise(function(resolve, reject){
        dbService.selectPlace(placeData.sourceID).then(function(placeObject) {
          if(placeObject) {
            dbService.createCrowd(crowdData, placeObject, deviceObject).then(resolve, reject);
          }
          else {
            dbService.createPlace(placeData, crowdData).then(function(placeObject) { //a place created with given data
              dbService.createCrowd(crowdData, placeObject, deviceObject).then(resolve, reject);
            }, reject);
          }
        }, reject);
      });
    };

    self.uploadFile = function(base64Source, fileName, onSuccess, onFailure){
      dbService.uploadFile(base64Source, fileName, onSuccess, onFailure);
    };

    return self;
  }
]);