app.controller('setCrowdController', ['$rootScope', '$scope', '$timeout',
  'mapModel', 'mapService', 'setCrowdModel',
  function($rootScope, $scope, $timeout, mapModel, mapService,
    setCrowdModel) {

    $scope.nearbyPlaces = 'pending';

    $scope.checkLocation = function() {
      $scope.nearbyPlaces = 'pending';
      $rootScope.checkLocation();
    };

    if ($rootScope.location && $rootScope.location.latitude && $rootScope.location
      .longitude) {
      loadNearbyPlaces();
    } else {
      $scope.checkLocation();
    }

    $rootScope.$on("locationChanged", function(event, args) {
      var newLocation = $rootScope.location,
        oldLocation = args.oldLocation;
      if (newLocation && newLocation.latitude && newLocation.longitude) {
        if (oldLocation && oldLocation.latitude && oldLocation.longitude) {
          var distance = mapService.getDistanceBetweenLocations(
            newLocation, oldLocation);
          if (distance > 0.01) { //10 m
            loadNearbyPlaces();
          }
        } else {
          loadNearbyPlaces();
        }
      } else {
        if (oldLocation && oldLocation.latitude && oldLocation.longitude) {} else {
          $scope.nearbyPlaces = undefined;
        }
      }
    });

    function loadNearbyPlaces() {
      setCrowdModel.loadNearbyPlaces($rootScope.location, true).then(
        function() {
          $scope.nearbyPlaces = setCrowdModel.getNearbyPlaces();
        },
        function() {
          $scope.nearbyPlaces = [];
        });
    };

    $scope.selectPlace = function(place) {
      setCrowdModel.selectPlace(place);
    };
  }
]);
