var mapModel = function($q, mapService) {
  var nearbyPlaces = {};
  var loadStatus = '';

  function loadNearbyPlaces(location, serverRequest) {
    var def = $q.defer();
    if (serverRequest === true) {
      loadStatus = '';
    }
    if (loadStatus === 'loaded') {
      def.resolve(nearbyPlaces);
    } else if (loadStatus === 'pending') {
      def.resolve({});
    } else {
      nearbyPlaces.status = 'pending';
      loadStatus = 'pending';
      mapService.retrieveNearbyPlaces(location).then(function(results) {
          nearbyPlaces.data = results;
          nearbyPlaces.status = 'done';
          loadStatus = 'loaded';
          def.resolve(nearbyPlaces);
        },
        function() {
          nearbyPlaces = {
            status: 'failed'
          }
          def.resolve(nearbyPlaces);
        });
    }
    return def.promise;
  }

  function getNearbyPlaces() {
    return nearbyPlaces;
  }

  return {
    loadNearbyPlaces: loadNearbyPlaces,
    getNearbyPlaces: getNearbyPlaces
  };
};

angular.module('map.Model', ['map.Service'])
  .factory('mapModel', ['$q', 'mapService', mapModel]);
