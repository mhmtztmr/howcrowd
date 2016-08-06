app.controller('setCrowdController', ['$rootScope', '$scope', '$timeout',
    'mapModel', 'mapService', 'setCrowdModel',
    function($rootScope, $scope, $timeout, mapModel, mapService,
        setCrowdModel) {
        $scope.nearbyPlaces = 'pending';

        $scope.loadNearbyPlaces = function($done) {
            setCrowdModel.loadNearbyPlaces($rootScope.location).then(
                function(nbp) {
                    $scope.nearbyPlaces = nbp;
                    if($done) $done();
                },
                function() {});
        };

        if ($rootScope.location && $rootScope.location.latitude && $rootScope.location
            .longitude) {
            $scope.loadNearbyPlaces();
        }

        $scope.$on('$destroy',$rootScope.$on("locationChanged", function(event, args) {
            //pending or undefined
            if(!($scope.nearbyPlaces instanceof Array)) {
                if($rootScope.location.latitude) {
                    $scope.nearbyPlaces = 'pending';
                    $scope.loadNearbyPlaces();
                }
                else {
                    $scope.nearbyPlaces = undefined;
                    $scope.$apply();
                }
            }
        }));

        $scope.selectPlace = function(place) {
            setCrowdModel.selectPlace(place);
        };
    }
]);
