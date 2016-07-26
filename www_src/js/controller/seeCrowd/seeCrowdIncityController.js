app.controller('seeCrowdIncityController', ['$rootScope', '$scope', '$filter',
    'seeCrowdIncityModel', 'dateService', 'mapService',
    function($rootScope, $scope, $filter, seeCrowdIncityModel, dateService, mapService) {
        console.log('see crowd incity controller initialized');
        $scope.crowds = 'pending';
        var placeBasedCrowdsArray;
        var locationFromStorage = angular.fromJson(localStorage.getItem('location'));

        function getFilter() {
            var now = dateService.getDBDate(new Date());
            var oneHourAgo = new Date(new Date(now).setDate(now.getDate() - 20));
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
            seeCrowdIncityModel.loadCrowds(getFilter(), serverRequest, function(){
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
            }, function(){
                if (onFailure) {
                    onFailure();
                }
            });
        };

        if (locationFromStorage) {
            $scope.loadCrowds(true);
        }

        $scope.$on('$destroy', $rootScope.$on("locationChanged", function(event, args) {
            var newLocation = $rootScope.location,
            oldLocation = args.oldLocation;
            //if location changed to a valid value
            if(newLocation && newLocation.latitude && newLocation.longitude) {
                if(oldLocation && oldLocation.latitude && oldLocation.longitude){
                    var distance = mapService.getDistanceBetweenLocations(
                        newLocation, oldLocation);
                    if (distance > 0.01) { //10 m
                        $scope.loadCrowds(true);
                    }
                }
                else if(!locationFromStorage){
                    $scope.crowds = 'pending';
                    $scope.$apply();
                    $scope.loadCrowds(true);
                }                
            }
            //if location changed to an invalid value and there were already no valid location value
            else if(!locationFromStorage && (!oldLocation || !oldLocation.latitude || !oldLocation.longitude)) {
                $scope.crowds = undefined;
                $scope.$apply();
            }
        }));

        $scope.selectPlaceBasedCrowd = function(placeBasedCrowd) {
            seeCrowdIncityModel.selectPlaceBasedCrowd(placeBasedCrowd);
        };

        $scope.searchStatus = {started : false};
        $scope.startSearch = function(){
            $scope.searchStatus.started = true;
            setTimeout(function(){
                document.getElementById('search-input').focus();
            }, 100);
        };
        $scope.stopSearch = function(){
            $scope.searchInput = '';
            $scope.searchInputChange($scope.searchInput);
            $scope.searchStatus.started = false;
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
