var setCrowdService = function( dbService, dateService, mapService) {

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    dbService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }


  function retrieveNearbyPlaces(location) {

    function getFilter() {
      var now = dateService.getDBDate(new Date());
      var oneHourAgo = new Date(new Date(now).setHours(now.getHours() - 1));
      var boundingBox = mapService.getBoundingBox(location);

      return {
        date: {
          start: oneHourAgo,
          end: now
        },
        location: boundingBox
      };
    }

    return dbService.retrieveNearbyPlaces(getFilter());
  }

  return {
    insertCrowd: insertCrowd,
    retrieveNearbyPlaces: retrieveNearbyPlaces
  };
};

angular.module('setCrowd.Service', ['db', 'date', 'map.Service'])
  .factory('setCrowdService', ['dbService', 'dateService', 'mapService', setCrowdService]);
