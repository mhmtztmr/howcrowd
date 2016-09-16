app.controller('seeCrowdInlistController', ['$rootScope', '$scope', '$filter',
    'seeCrowdModel', 'dateService', 'mapService', '$timeout', 'seeCrowdService',
    function($rootScope, $scope, $filter, seeCrowdModel, dateService, mapService, $timeout, seeCrowdService) {
        $scope.places = 'pending';

        function loadPlaces(done) {
            seeCrowdModel.loadPlaces().then(function(_places) {
                var places = $filter('orderBy')(_places, ['-isNearby', '-lastUpdateDatetime']);
                $timeout(function() {
                    $scope.places = places;
                    $scope.more = seeCrowdModel.getPlacesNextPage();
                });
                if(done) done();
            }, function() {
                ons.notification.alert({
                  title: $rootScope.lang.ALERT.ALERT,
                  message: $rootScope.lang.ALERT.LOAD_FAIL,
                  buttonLabel: $rootScope.lang.ALERT.OK
                });
                $scope.places = [];
                if(done) done();
            });
        }

        $scope.loadMorePlaces = function() {
            $scope.more = 'pending';
            seeCrowdModel.loadPlacesNextPage().then(function(_places) {
                $timeout(function() {
                    $scope.places = $scope.places.concat(_places);
                    $scope.more = seeCrowdModel.getPlacesNextPage();
                });
            }, function() {
                $scope.more = seeCrowdModel.getPlacesNextPage();
                ons.notification.alert({
                  title: $rootScope.lang.ALERT.ALERT,
                  message: $rootScope.lang.ALERT.LOAD_FAIL,
                  buttonLabel: $rootScope.lang.ALERT.OK
                });
            });
        };

        function clearMap() {
            seeCrowdModel.clearMap();
        }

        $scope.refreshPlaces = function($done) {
            clearMap();
            if($scope.places === 'pending' || $scope.places === undefined) {
                if($done) $done();
            }
            if($rootScope.location.latitude) {
                loadPlaces($done);
            }
            else if($scope.places !== 'pending' && $scope.places !== undefined){
                $scope.places = undefined;
                if($done) $done();
            }
        };

        if($rootScope.location.latitude) {
            loadPlaces();
        }

        $scope.$on('$destroy', $rootScope.$on("locationChanged", function(event, args) {
            //pending or undefined
            if(!($scope.places instanceof Array)) {
                clearMap();
                if($rootScope.location.latitude) {
                    $scope.places = 'pending';
                    loadPlaces();
                }
                else {
                    $scope.places = undefined;
                }
            }
        }));

        $scope.selectPlace = function(place) {
            modal.show();
            seeCrowdModel.selectPlace(place).then(function(_place) {
                modal.hide();
                app.seeCrowdNavi.pushPage('templates/see-crowd-detail.html', {animation:'lift', selectedPlace: _place});
            }, function() {
                modal.hide();
                ons.notification.alert({
                  title: $rootScope.lang.ALERT.ALERT,
                  message: $rootScope.lang.ALERT.LOAD_FAIL,
                  buttonLabel: $rootScope.lang.ALERT.OK
                });
            });
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
                $scope.crowds = $filter('filter')(placeBasedCrowdsArray, $scope.searchInput.value);
            } else {
                $scope.crowds = placeBasedCrowdsArray;
            }
            $scope.crowds = $filter('orderBy')($scope.crowds, ['distanceGroup', 'crowdLast.lastUpdatePass']);
        };
        $scope.clearSearchInput = function(){
            $scope.searchInput.value = '';
            $scope.searchInputChange();
        };
       
        $scope.MyDelegate = {
            configureItemScope: function(index, itemScope) {
                itemScope.item = $scope.places[index];
            },
            calculateItemHeight: function(index) {
                return 88;
            },
            countItems: function() {
                return $scope.places.length;
            }
        };
    }
]);
