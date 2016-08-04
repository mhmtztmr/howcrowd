app.controller('setCrowdController', ['$rootScope', '$scope', '$timeout',
    'mapModel', 'mapService', 'setCrowdModel',
    function($rootScope, $scope, $timeout, mapModel, mapService,
        setCrowdModel) {
        $scope.nearbyPlaces = 'pending';

        if ($rootScope.location && $rootScope.location.latitude && $rootScope.location
            .longitude) {
            loadNearbyPlaces();
        }

        $scope.$on('$destroy',$rootScope.$on("locationChanged", function(event, args) {
            var newLocation = $rootScope.location,
            oldLocation = args.oldLocation;
            //if location changed to a valid value
            if(newLocation && newLocation.latitude && newLocation.longitude) {
                if(oldLocation && oldLocation.latitude && oldLocation.longitude){
                    if (newLocation.delta > 0.01) { //10 m
                        loadNearbyPlaces();
                    }
                }
                else{
                    $scope.nearbyPlaces = 'pending';
                    $scope.$apply();
                    loadNearbyPlaces();
                }                
            }
            //if location changed to an invalid value and there were already no valid location value
            else {
                $scope.nearbyPlaces = undefined;
                $scope.$apply();
            }
        }));

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
