var seeCrowdService = function(dbService, configService, dateService, mapService) {

  //filter.date.start, filter.date.end,
  //filter.location.latitude.upper, filter.location.latitude.lower, filter.location.longitude.upper, filter.location.longitude.lower
  function retrieveCrowds() {

      function getFilter() {
          var now = dateService.getDBDate(new Date()),
          oneHourAgo = new Date(new Date(now).setHours(now.getHours() - configService.NEARBY_TIME)),
          boundingBox = mapService.getBoundingBox(angular.fromJson(localStorage.getItem('location')), configService.FAR_DISTANCE);

          return {
              date: {
                  start: oneHourAgo,
                  end: now
              },
              location: boundingBox
          };
      }
      return dbService.retrieveCrowds(getFilter());
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

angular.module('seeCrowd.Service', ['db', 'config', 'date', 'map.Service'])
  .factory('seeCrowdService', ['dbService', 'configService', 'dateService', 'mapService', seeCrowdService]);
