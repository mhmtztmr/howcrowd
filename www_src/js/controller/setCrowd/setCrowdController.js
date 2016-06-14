app.controller('setCrowdController', ['$rootScope', '$scope', '$timeout',
    'mapModel', 'mapService', 'setCrowdModel',
    function($rootScope, $scope, $timeout, mapModel, mapService,
        setCrowdModel) {
        modal.show();
        $scope.nearbyPlaces = 'pending';
        $scope.checkLocation = function() {
            modal.show();
            $scope.nearbyPlaces = 'pending';
            $rootScope.checkLocation();
        };

        if ($rootScope.location && $rootScope.location.latitude && $rootScope.location
            .longitude) {
            loadNearbyPlaces();
        } else {
            $scope.checkLocation();
        }

        $scope.$on('$destroy',$rootScope.$on("locationChanged", function(event, args) {
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
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    modal.hide();
                }
            }
        }));

        function loadNearbyPlaces() {
            setCrowdModel.loadNearbyPlaces($rootScope.location, true).then(
                function() {
                    $scope.nearbyPlaces = setCrowdModel.getNearbyPlaces();
                    modal.hide();
                },
                function() {
                    $scope.nearbyPlaces = [];
                    modal.hide();
                });
        };

        $scope.selectPlace = function(place) {
            setCrowdModel.selectPlace(place);
        };
    }
]);
