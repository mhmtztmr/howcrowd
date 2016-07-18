app.controller('seeCrowdIncityController', ['$rootScope', '$scope', '$filter',
    'seeCrowdIncityModel', 'dateService', 'mapService',
    function($rootScope, $scope, $filter, seeCrowdIncityModel, dateService, mapService) {
        console.log('see crowd incity controller initialized');
        $scope.crowds = 'pending';
        var placeBasedCrowdsArray;
        var locationFromStorage = angular.fromJson(localStorage.getItem('location'));

        function getFilter() {
            var now = dateService.getDBDate(new Date());
            var oneHourAgo = new Date(new Date(now).setHours(now.getHours() - 1));
            var boundingBox = mapService.getBoundingBox(angular.fromJson(localStorage.getItem('location')), 15);

            return {
                date: {
                    start: oneHourAgo,
                    end: now
                },
                location: boundingBox
            };
        }

        $scope.filteredPlaceBasedCrowdsArray = [];

        $scope.loadCrowds = function(serverRequest, onSuccess, onFailure) {
            seeCrowdIncityModel.loadCrowds(getFilter(), serverRequest).then(
                function() {
                    $scope.crowds = seeCrowdIncityModel.getCrowds();
                    var placeBasedCrowds = seeCrowdIncityModel.getPlaceBasedCrowds();
                    placeBasedCrowdsArray = Object.keys(placeBasedCrowds).map(
                        function(key) {
                            return placeBasedCrowds[key];
                        });
                    $scope.filteredPlaceBasedCrowdsArray = placeBasedCrowdsArray;
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                function() {
                    if (onFailure) {
                        onFailure();
                    }
                });
        };

        if (locationFromStorage) {
            $scope.loadCrowds(true);
        } else {
            $scope.crowds = undefined;
        }

        $scope.$on('$destroy',$rootScope.$on("locationChanged", function(event, args) {
            var newLocation = $rootScope.location,
                oldLocation = args.oldLocation;
            if (newLocation && newLocation.latitude && newLocation.longitude) {
                if (oldLocation && oldLocation.latitude && oldLocation.longitude) {

                } else {
                    $scope.loadCrowds(true);
                }
            }
        }));

        $scope.checkLocation = function() {
            $scope.crowds = 'pending';
            $rootScope.checkLocation();
        };

        $scope.selectPlaceBasedCrowd = function(placeBasedCrowd) {
            seeCrowdIncityModel.selectPlaceBasedCrowd(placeBasedCrowd);
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
