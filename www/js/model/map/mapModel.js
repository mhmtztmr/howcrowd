var mapModel = function($q, mapService) {
  var nearbyPlaces = [];
  var loadStatus = '';

  function loadNearbyPlaces(location, serverRequest) {
    var def = $q.defer();
    if (serverRequest === true) {
      loadStatus = '';
    }
    if (loadStatus === 'loaded') {
      def.resolve(nearbyPlaces);
    } else if (loadStatus === 'pending') {
      def.resolve([]);
    } else {
      loadStatus = 'pending';
      mapService.retrieveNearbyPlaces(location).then(function(results) {
          nearbyPlaces = results;
          loadStatus = 'loaded';
          def.resolve(nearbyPlaces);
        },
        function() {
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
