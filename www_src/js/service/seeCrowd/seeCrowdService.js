var seeCrowdService = function(dbService) {

  //filter.date.start, filter.date.end,
  //filter.location.latitude.upper, filter.location.latitude.lower, filter.location.longitude.upper, filter.location.longitude.lower
  function retrieveCrowds(filter) {
    return dbService.retrieveCrowds(filter);
  }

  function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
    dbService.giveFeedback(crowd, isPositive, onSuccess, onFailure);
  }

  function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
    dbService.reportCrowd(crowd, reportReason, onSuccess, onFailure);
  }

  return {
    retrieveCrowds: retrieveCrowds,
    giveFeedback: giveFeedback,
    reportCrowd: reportCrowd
  };
};

angular.module('seeCrowd.Service', ['db'])
  .factory('seeCrowdService', ['dbService', seeCrowdService]);
