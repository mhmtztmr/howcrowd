app.controller('seeCrowdInlistController', ['$rootScope', '$scope', '$filter',
    'seeCrowdModel', 'dateService', 'mapService', '$timeout', 'askCrowdModel',
    function($rootScope, $scope, $filter, seeCrowdModel, dateService, mapService, $timeout, askCrowdModel) {
        var searchTimeout, initialPlaces;
        $scope.places = 'pending';

        function loadPlaces(done) {
            seeCrowdModel.loadPlaces().then(function(_places) {
                var places = $filter('orderBy')(_places, ['-isNearby', '-lastUpdateDatetime']);
                $timeout(function() {
                    $scope.places = places;
                    $scope.more = seeCrowdModel.hasPlacesNextPage();
                    initialPlaces = $scope.places;
                });
                if(done) {
                    done();
                }
            }, function() {
                this.loadingFailedDialog.show();
                $scope.places = [];
                if(done) {
                    done();
                }
            });
        }

        $scope.loadMorePlaces = function() {
            $scope.more = 'pending';
            seeCrowdModel.loadPlacesNextPage().then(function(_places) {
                $timeout(function() {
                    $scope.places = $scope.places.concat(_places);
                    $scope.more = seeCrowdModel.hasPlacesNextPage();
                });
            }, function() {
                $scope.more = seeCrowdModel.hasPlacesNextPage();
                this.loadingFailedDialog.show();
            });
        };

        function clearMap() {
            seeCrowdModel.clearMap();
        }

        $scope.refreshPlaces = function(done) {
            clearMap();
            $scope.stopSearch();
            if($scope.places === 'pending' || $scope.places === undefined) {
                if(done) {
                    done();
                }
            }
            if($rootScope.location.latitude) {
                loadPlaces(done);
            }
            else if($scope.places !== 'pending' && $scope.places !== undefined){
                $scope.places = undefined;
                if(done) {
                    done();
                }
            }
        };

        if($rootScope.location.latitude) {
            loadPlaces();
        }

        $scope.$on('$destroy', $rootScope.$on("locationChanged", function() {
            //pending or undefined
            if(!($scope.places instanceof Array)) {
                clearMap();
                if($rootScope.location.latitude) {
                    seeCrowdModel.markCurrentLocation();
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
                this.loadingFailedDialog.show();
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
            if($scope.searchInput.value.length > 2) {
                if(searchTimeout) {
                    clearTimeout(searchTimeout);
                }
                searchTimeout = setTimeout(function() {
                    seeCrowdModel.searchPlaces($scope.searchInput.value).then(function(_places) {
                        var places = $filter('orderBy')(_places, ['-isNearby', '-lastUpdateDatetime']);
                        $timeout(function() {
                            $scope.places = places;
                        });
                    }, function() {
                        this.loadingFailedDialog.show();
                        $scope.places = [];
                    });
                }, 1000);
            }
            else if($scope.searchInput.value.length === 0) {
                if(searchTimeout) {
                    clearTimeout(searchTimeout);
                }
                $scope.places = initialPlaces;
            }
        };
        $scope.clearSearchInput = function(){
            $scope.searchInput.value = '';
            $scope.searchInputChange();
        };

        $scope.askCrowd = function(query) {
			askCrowdModel.setAskQuery(query);
            $scope.stopSearch    ();
            crowdTabbar.setActiveTab(0);
        };
       
        $scope.MyDelegate = {
            configureItemScope: function(index, itemScope) {
                itemScope.item = $scope.places[index];
            },
            calculateItemHeight: function() {
                return 88;
            },
            countItems: function() {
                return $scope.places.length;
            }
        };
    }
]);
