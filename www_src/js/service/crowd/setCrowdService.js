var setCrowdService = function($rootScope, dbService, dateService, mapService, configService) {

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    dbService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }

  function retrieveNearbyPlaces() {

    function getFilter() {
      var now = dateService.getDBDate(new Date()),
      oneHourAgo = new Date(new Date(now).setHours(now.getHours() - configService.NEARBY_TIME)),
      boundingBox = mapService.getBoundingBox(angular.fromJson(localStorage.getItem('location')), configService.NEARBY_DISTANCE);

      return {
        date: {
          start: oneHourAgo,
          end: now
        },
        location: boundingBox,
        sources: ['custom']
      };
    }

    return dbService.retrieveNearbyPlaces(getFilter());
  }

  return {
    insertCrowd: insertCrowd,
    retrieveNearbyPlaces: retrieveNearbyPlaces
  };
};

angular.module('setCrowd.Service', ['db', 'date', 'map.Service', 'config'])
  .factory('setCrowdService', ['$rootScope' ,'dbService', 'dateService', 'mapService', 'configService', setCrowdService]);
