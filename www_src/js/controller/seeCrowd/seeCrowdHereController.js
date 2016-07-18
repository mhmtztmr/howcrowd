app.controller('seeCrowdHereController', ['$rootScope', '$scope',
    '$filter', 'seeCrowdHereModel', 'dateService', 'mapService',
    function($rootScope, $scope, $filter, seeCrowdHereModel, dateService,
        mapService) {
        console.log('see crowd here controller initialized');
        $scope.crowds = 'pending';
        var placeBasedCrowdsArray;
        $scope.filteredPlaceBasedCrowdsArray = [];

        function getFilter() {
            var now = dateService.getDBDate(new Date());
            var oneHourAgo = new Date(new Date(now).setHours(now.getHours() - 1));
            var boundingBox = mapService.getBoundingBox($rootScope.location, 0.05);

            return {
                date: {
                    start: oneHourAgo,
                    end: now
                },
                location: boundingBox
            };
        }

        $scope.loadCrowds = function(serverRequest, onSuccess, onFailure) {
            if ($rootScope.location && $rootScope.location.latitude &&
                $rootScope.location.longitude) {
                var filter = getFilter();
                seeCrowdHereModel.loadCrowds(filter, serverRequest).then(
                    function() {
                        $scope.crowds = seeCrowdHereModel.getCrowds();
                        var placeBasedCrowds = seeCrowdHereModel.getPlaceBasedCrowds();
                        placeBasedCrowdsArray = Object.keys(placeBasedCrowds).map(
                            function(key) {
                                return placeBasedCrowds[key];
                            });
                        $scope.filteredPlaceBasedCrowdsArray =
                            placeBasedCrowdsArray;
                        if (onSuccess) {
                            onSuccess();
                        }
                    },
                    function() {
                        if (onFailure) {
                            onFailure();
                        }
                    });
            } else {
                if (onFailure) {
                    onFailure();
                }
            }
        };

        $scope.checkLocation = function() {
            $scope.crowds = 'pending';
            $rootScope.checkLocation();
        }

        if ($rootScope.location && $rootScope.location.latitude && $rootScope.location
            .longitude) {
            $scope.loadCrowds(true);
        } else {
            $scope.checkLocation();
        }

        $scope.$on('$destroy', $rootScope.$on("locationChanged", function(event, args) {
            var newLocation = $rootScope.location,
                oldLocation = args.oldLocation;
            if (newLocation && newLocation.latitude && newLocation.longitude) {
                if (oldLocation && oldLocation.latitude && oldLocation.longitude) {
                    var distance = mapService.getDistanceBetweenLocations(
                        newLocation, oldLocation);
                    if (distance > 0.01) { //10 m
                        $scope.loadCrowds(true);
                    }
                } else {
                    $scope.loadCrowds(true);
                }
            } else {
                if (oldLocation && oldLocation.latitude && oldLocation.longitude) {} else {
                    $scope.crowds = undefined;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            }
        }));

        $scope.selectPlaceBasedCrowd = function(placeBasedCrowd) {
            seeCrowdHereModel.selectPlaceBasedCrowd(placeBasedCrowd);
        };

        $scope.searchInputChange = function(searchInput) {
            if (searchInput.length > 1) {
                $scope.filteredPlaceBasedCrowdsArray = $filter('filter')(
                    placeBasedCrowdsArray, searchInput);
            } else {
                $scope.filteredPlaceBasedCrowdsArray = placeBasedCrowdsArray;
            }
        };

        $scope.MyDelegate = {
            configureItemScope: function(index, itemScope) {
                itemScope.item = $scope.filteredPlaceBasedCrowdsArray[index];
            },
            calculateItemHeight: function(index) {
                return 108;
            },
            countItems: function() {
                return $scope.filteredPlaceBasedCrowdsArray.length;
            },
            destroyItemScope: function(index, scope) {}
        };
    }
]);
