var setCrowdModel = function($q, setCrowdService) {
  var selectedPlace;
  var nearbyPlaces = [];
  var loadStatus = '';

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    setCrowdService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }

  function selectPlace(place) {
    selectedPlace = place;
    app.navi.pushPage('templates/set-crowd-level.html');
  }

  function getSelectedPlace() {
    return selectedPlace;
  }

  function loadNearbyPlaces(location, serverRequest) {
    var def = $q.defer(),
      services = [mapService.retrieveNearbyPlaces(location),
        seeCrowdService.retrieveCrowds(
          filter)
      ];
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
    insertCrowd: insertCrowd,
    selectPlace: selectPlace,
    getSelectedPlace: getSelectedPlace,
    getNearbyPlaces: getNearbyPlaces,
    loadNearbyPlaces: loadNearbyPlaces
  };
};

angular.module('setCrowd.Model', ['setCrowd.Service'])
  .factory('setCrowdModel', ['$q', 'setCrowdService', setCrowdModel]);
