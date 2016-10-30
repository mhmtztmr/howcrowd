app.controller('seeCrowdInlistController', ['$rootScope', '$scope', '$filter', 'seeCrowdModel', '$timeout', '$log',
    function($rootScope, $scope, $filter, seeCrowdModel, $timeout, $log) {
        $log.log('seeCrowdInlistController initialized.');

        var searchTimeout, initialPlaces;

        function loadPlaces() {
            $log.log('Loading see crowd in list places...');
            return new Promise(function(resolve, reject) {
                seeCrowdModel.loadPlaces().then(function(_places) {
                    var places = $filter('orderBy')(_places, ['-isNearby', '-lastUpdateDatetime']);
                    $timeout(function() {
                        $log.log('See crowd in list places are successfully loaded');
                        $scope.places = places;
                        $scope.more = seeCrowdModel.hasPlacesNextPage();
                        initialPlaces = $scope.places;
                        resolve();
                    });
                }, function(e) {
                    $log.error('See crowd in list places load failed.' + e.message, e);
                    this.loadingFailedDialog.show();
                    $scope.places = [];
                    reject();
                });
            });
        }

        $scope.onPageShown = function(){
            $log.log('onPageShown for seeCrowdInlistController...');
            crowdTabbar.setTabbarVisibility(true);
            if($rootScope.location.latitude) {
                if(seeCrowdModel.isReload().list) {
                    $scope.stopSearch();
                    $log.log('Reload list detected');
                    modal.show();
                    seeCrowdModel.setReload({list: false});
                    loadPlaces().then(function() {
                        modal.hide();
                    }, function() {
                        modal.hide();
                    });
                }
                else {
                    $log.log('No reload list detected');
                    modal.hide();
                }
            }
            else {
                $log.log('No location found');
                modal.hide();
            }
        };

        $scope.loadMorePlaces = function() {
            $log.log('Loading more see crowd places...');
            $scope.more = 'pending';
            seeCrowdModel.loadPlacesNextPage().then(function(_places) {
                $timeout(function() {
                    $log.log('More see crowd places successfully loaded');
                    $scope.places = $scope.places.concat(_places);
                    $scope.more = seeCrowdModel.hasPlacesNextPage();
                });
            }, function() {
                $log.error('Loading more see crowd places failed');
                $scope.more = seeCrowdModel.hasPlacesNextPage();
                this.loadingFailedDialog.show();
            });
        };

        $scope.refreshPlaces = function(done) {
            $log.log('Refreshing see crowd places...');
            $scope.stopSearch();
            if($scope.places === undefined) {
                if(done) {
                    done();
                }
            }
            if($rootScope.location.latitude) {
                loadPlaces().then(function() {
                    seeCrowdModel.setReload({map: true});
                    done();
                }, done);
            }
            else if($scope.places !== undefined){
                seeCrowdModel.setReload({list: true, map: true});
                $scope.places = undefined;
                if(done) {
                    done();
                }
            }
        };

        $scope.$on('$destroy', $rootScope.$on("locationChanged", function() {
            //pending or undefined
            if(!$scope.places) {
                if($rootScope.location.latitude) {
                    seeCrowdModel.markCurrentLocation();
                    if(seeCrowdModel.isReload().list) {
                        modal.show();
                        seeCrowdModel.setReload({list: false});
                        loadPlaces().then(function() {
                            modal.hide();
                        }, function() {
                            modal.hide();
                        });
                    }
                }
                else {
                    seeCrowdModel.setReload({list: true, map: true});
                    $scope.places = undefined;
                }
            }
        }));

        $scope.selectPlace = function(place) {
            modal.show();
            seeCrowdModel.selectPlace(place).then(function(_place) {
                modal.hide();
                app.navi.pushPage('templates/see-crowd-detail.html', {animation:'lift', selectedPlace: _place});
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
            app.seeCrowdTabbar.searchInput = $scope.searchInput.value;
            $scope.searchStatus.started = false;
        };

        $scope.searchInputChange = function() {
            if($scope.searchInput.value.length > 2) {
                if(searchTimeout) {
                    clearTimeout(searchTimeout);
                }
                searchTimeout = setTimeout(function() {
                    seeCrowdModel.searchPlacesInList($scope.searchInput.value).then(function(_places) {
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

        $scope.askCrowd = function(){
            if($scope.searchInput.value && $scope.searchInput.value.length > 0) {
                app.seeCrowdTabbar.searchInput = $scope.searchInput.value;
                app.seeCrowdTabbar.setActiveTab(1, {animation: 'none'});
            }
        };
       
        //TODO: was used for infinite loop, could be removed
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
