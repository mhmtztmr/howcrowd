var askCrowdService = function(dbService) {

  function askCrowd(place, crowd, device, onSuccess, onFailure) {
    dbService.askCrowd(place, crowd, device, onSuccess, onFailure);
  }

  return {
    askCrowd: askCrowd
  };
};

angular.module('askCrowd.Service', ['db'])
  .factory('askCrowdService', ['dbService', askCrowdService]);
