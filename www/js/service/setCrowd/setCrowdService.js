var setCrowdService = function(dbService) {

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    dbService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }


  function retrieveNearbyPlaces(location) {

    function getFilter() {
      var now = dateService.getDBDate(new Date());
      var oneHourAgo = new Date(new Date(now).setHours(now.getHours() - 1));
      var boundingBox = mapService.getBoundingBox($rootScope.location);

      return {
        date: {
          start: oneHourAgo,
          end: now
        },
        location: boundingBox
      };
    }

    var nearPlace = {
      sid: place.place_id,
      name: place.name,
      location: {
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng()
      },
      source: 'google'
    };

    dbService.retrieveNearbyPlaces(getFilter()).then(function() {

    }, function() {

    });
  }

  return {
    insertCrowd: insertCrowd,
    retrieveNearbyPlaces: retrieveNearbyPlaces
  };
};

angular.module('setCrowd.Service', ['db'])
  .factory('setCrowdService', ['dbService', setCrowdService]);
