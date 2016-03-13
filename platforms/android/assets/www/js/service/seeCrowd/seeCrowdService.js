var seeCrowdService = function(dbService) {

  //filter.date.start, filter.date.end,
  //filter.location.latitude.upper, filter.location.latitude.lower, filter.location.longitude.upper, filter.location.longitude.lower
  function retrieveCrowds(filter) {
    return dbService.retrieveCrowds(filter);
  }

  function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
    dbService.giveFeedback(crowd, isPositive, onSuccess, onFailure);
  }

  return {
    retrieveCrowds: retrieveCrowds,
    giveFeedback: giveFeedback
  };
};

angular.module('seeCrowd.Service', ['db'])
  .factory('seeCrowdService', ['dbService', seeCrowdService]);