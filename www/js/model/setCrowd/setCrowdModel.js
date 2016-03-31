var setCrowdModel = function($q, setCrowdService, mapService) {
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
      servicePromiseArray = [],
      services = [mapService, setCrowdService];

    if (serverRequest === true) {
      loadStatus = '';
    }
    if (loadStatus === 'loaded') {
      def.resolve(nearbyPlaces);
    } else if (loadStatus === 'pending') {
      def.resolve([]);
    } else {
      loadStatus = 'pending';

      angular.forEach(services, function(value, key) {
        servicePromiseArray.push(value.retrieveNearbyPlaces(location).then(
          function(entries) {
            nearbyPlaces.push(entries[0]);
          }));
      });

      $q.all(servicePromiseArray).then(function() {
          loadStatus = 'loaded';
          def.resolve(nearbyPlaces);
        },
        function() {
          def.resolve(nearbyPlaces);
        });
      return def.promise;
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

angular.module('setCrowd.Model', ['setCrowd.Service', 'map.Service'])
  .factory('setCrowdModel', ['$q', 'setCrowdService', 'mapService',
    setCrowdModel
  ]);
