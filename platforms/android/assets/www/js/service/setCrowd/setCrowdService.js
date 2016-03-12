var setCrowdService = function(dbService) {

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    dbService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }

  return {
    insertCrowd: insertCrowd
  };
};

angular.module('setCrowd.Service', ['db'])
  .factory('setCrowdService', ['dbService', setCrowdService]);
