app.controller('setCrowdController', ['$rootScope', '$scope', '$timeout',
    'mapModel', 'mapService', 'setCrowdModel', '$filter',
    function($rootScope, $scope, $timeout, mapModel, mapService,
        setCrowdModel, $filter) {

        var nearbyPlaces;
        $scope.nearbyPlaces = 'pending';

        function loadNearbyPlaces(success, fail){
            setCrowdModel.loadNearbyPlaces($rootScope.location).then(
                function(nbp) {
                    nearbyPlaces = nbp;
                    $scope.nearbyPlaces = nbp;
                    if(success) success();
                }, fail);
        }

        $scope.refreshNearbyPlaces = function($done) {
            if($scope.nearbyPlaces === 'pending' || $scope.nearbyPlaces === undefined) {
                if($done) $done();
            }
            if($rootScope.location.latitude) {
                loadNearbyPlaces($done);
            }
            else if($scope.nearbyPlaces !== 'pending' && $scope.nearbyPlaces !== undefined){
                $scope.nearbyPlaces = undefined;
                $scope.$apply();
                if($done) $done();
            }
        };

        if($rootScope.location.latitude) {
            loadNearbyPlaces();
        }

        $scope.$on('$destroy', $rootScope.$on("locationChanged", function(event, args) {
            //pending or undefined
            if(!($scope.nearbyPlaces instanceof Array)) {
                if($rootScope.location.latitude) {
                    $scope.nearbyPlaces = 'pending';
                    loadNearbyPlaces();
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

        $scope.searchStatus = {started : false};
        $scope.startSearch = function(){
            $scope.searchStatus.started = true;
            setTimeout(function(){
                document.getElementById('search-input').focus();
            }, 100);
        };
        $scope.searchInput = {value: ''};
        $scope.stopSearch = function() {
            $scope.clearSearchInput();
            $scope.searchStatus.started = false;
        };

        $scope.searchInputChange = function() {
            if ($scope.searchInput.value.length > 1) {
                $scope.nearbyPlaces = $filter('filter')(
                    nearbyPlaces, $scope.searchInput.value);
            } else {
                $scope.nearbyPlaces = nearbyPlaces;
            }
        };
        $scope.clearSearchInput = function(){
            $scope.searchInput.value = '';
            $scope.searchInputChange();
        };
    }
]);
