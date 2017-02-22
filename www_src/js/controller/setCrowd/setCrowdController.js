app.controller('setCrowdController', ['$rootScope', '$scope', '$timeout', 'mapService', 'setCrowdModel', '$filter', '$log', 'seeCrowdService', 'identificationService',
    function($rootScope, $scope, $timeout, mapService, setCrowdModel, $filter, $log, seeCrowdService, identificationService) {
        var nearbyPlaces;
        $scope.nearbyPlaces = 'pending';

        function performInitialAskWorkaround(nearbyPlaces) {
            var latestWorkaroundTime = localStorage.getItem('initialAskWorkaroundTime') || '0',
            now = (new Date()).valueOf(),
            place;

            latestWorkaroundTime = parseInt(latestWorkaroundTime);
            if(now - latestWorkaroundTime > 1000 * 60 * 20) {
                if(nearbyPlaces && nearbyPlaces.length > 0) {
                    var index = Math.floor(Math.random() * nearbyPlaces.length);
                    place = nearbyPlaces[index];
                    localStorage.setItem('initialAskWorkaroundTime', now);
                    seeCrowdService.getPlaceBySourceID(place).then(function(_result) {
                        if(_result.data.length > 0) {
                            place = _result.data[0];
                        }
                        identificationService.getRobotDeviceObject().then(function(_deviceObject) {
                            seeCrowdService.askCrowd({}, place, _deviceObject).then(function(){
                                $rootScope.$broadcast('initialAskWorkaroundDoneEvent');
                            }, function(){
                                modal.hide();
                                this.loadingFailedDialog.show();
                                $rootScope.$broadcast('initialAskWorkaroundDoneEvent');
                            });
                        }, function() {
                            modal.hide();
                            this.loadingFailedDialog.show();
                            $rootScope.$broadcast('initialAskWorkaroundDoneEvent');
                        });
                    }, function() {
                        modal.hide();
                        this.loadingFailedDialog.show();
                        $rootScope.$broadcast('initialAskWorkaroundDoneEvent');
                    });
                }
                else {
                    $rootScope.$broadcast('initialAskWorkaroundDoneEvent');
                }
            }
            else {
                $rootScope.$broadcast('initialAskWorkaroundDoneEvent');
            }
        }

        function loadNearbyPlaces(){
            $log.log('Loading see crowd in list places...');
            return new Promise(function(resolve, reject) {
                setCrowdModel.loadNearbyPlaces().then(function(nbp) {
                    performInitialAskWorkaround(nbp);
                    nearbyPlaces = nbp;
                    $scope.nearbyPlaces = nbp;
                    $scope.$apply();
                    resolve();
                }, function(){
                    performInitialAskWorkaround();
                    this.loadingFailedDialog.show();
                    $scope.nearbyPlaces = [];
                    $scope.$apply();
                    reject();
                });
            });
        }

        $scope.refreshNearbyPlaces = function(done) {
            if($scope.nearbyPlaces === undefined) {
                if(done) {
                    done();
                }
            }
            if($rootScope.location.latitude) {
                loadNearbyPlaces().then(function() {
                    done();
                });
            }
            else if($scope.nearbyPlaces !== undefined){
                $scope.nearbyPlaces = undefined;
                $scope.$apply();
                if(done) {
                    done();
                }
            }
        };

        if($rootScope.location.latitude) {
            loadNearbyPlaces();
        }

        $scope.$on('$destroy', $rootScope.$on("locationChanged", function() {
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
            setCrowdModel.selectPlace(place).then(function(_place) {
                app.navi.pushPage('templates/set-crowd-level.html', {animation: 'lift', selectedPlace: _place});
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
