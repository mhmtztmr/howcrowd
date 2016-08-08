var setCrowdModel = function($q, setCrowdService, mapService) {
    var selectedPlace;

    function insertCrowd(place, crowd, device, onSuccess, onFailure) {
        setCrowdService.insertCrowd(place, crowd, device, onSuccess, onFailure);
    }

    function selectPlace(place) {
        selectedPlace = place;
        app.navi.pushPage('templates/set-crowd-level.html', {animation: 'lift'});
    }

    function getSelectedPlace() {
        return selectedPlace;
    }

    function loadNearbyPlaces() {
        var def = $q.defer(), nearbyPlaces = [],
            servicePromiseArray = [],
            services = [mapService, setCrowdService];

        angular.forEach(services, function(value, key) {
            servicePromiseArray.push(value.retrieveNearbyPlaces().then(
                function(entries) {
                    if(entries && entries.length > 0) {
                        Array.prototype.push.apply(nearbyPlaces,entries);
                    }
                }));
        });

        $q.all(servicePromiseArray).then(function() {
            def.resolve(nearbyPlaces);
        },
        function() {
            def.reject();
        });
        return def.promise;
    }

    return {
        insertCrowd: insertCrowd,
        selectPlace: selectPlace,
        getSelectedPlace: getSelectedPlace,
        loadNearbyPlaces: loadNearbyPlaces
    };
};

angular.module('setCrowd.Model', ['setCrowd.Service', 'map.Service'])
  .factory('setCrowdModel', ['$q', 'setCrowdService', 'mapService',
    setCrowdModel
  ]);
