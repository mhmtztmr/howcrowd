app.controller('seeCrowdIncityController', ['$rootScope', '$scope', '$filter',
    'seeCrowdIncityModel', 'dateService', 'mapService',
    function($rootScope, $scope, $filter, seeCrowdIncityModel, dateService, mapService) {
        var placeBasedCrowdsArray;
        $scope.filteredPlaceBasedCrowdsArray = [];
        $scope.crowds = 'pending';

        $scope.loadCrowds = function(serverRequest, onSuccess, onFailure) {
            seeCrowdIncityModel.loadCrowds(getFilter(), serverRequest, function(){
                $scope.crowds = seeCrowdIncityModel.getCrowds();
                var placeBasedCrowds = seeCrowdIncityModel.getPlaceBasedCrowds();
                placeBasedCrowdsArray = Object.keys(placeBasedCrowds).map(
                    function(key) {
                        return placeBasedCrowds[key];
                    });
                $scope.filteredPlaceBasedCrowdsArray = $filter('orderBy')(placeBasedCrowdsArray, 'distanceGroup');
                if (onSuccess) {
                    onSuccess();
                }
            }, function(){
                if (onFailure) {
                    onFailure();
                }
            });
        };

        $scope.groupDistance = function() {
            var placeBasedCrowds = seeCrowdIncityModel.groupDistance();
            placeBasedCrowdsArray = Object.keys(placeBasedCrowds).map(
                function(key) {
                    return placeBasedCrowds[key];
                });
            $scope.filteredPlaceBasedCrowdsArray = $filter('orderBy')(placeBasedCrowdsArray, 'distanceGroup');
            if (onSuccess) {
                onSuccess();
            }
        };

        if($rootScope.location.latitude) {
            $scope.loadCrowds(true);
        }
 
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


        $scope.$on('$destroy', $rootScope.$on("locationChanged", function(event, args) {
            var oldLocation = args.oldLocation;

            //if location changed to a valid value
            if($rootScope.location.latitude) {
                //if old location was a valid value
                if(oldLocation.latitude){
                    //if user changed its location remarkably (1 km)
                    if (($rootScope.location.cumulativeDelta === 0 && $rootScope.location.overallDelta > 0) || 
                        (!$scope.crowds || $scope.crowds === 'pending')) {
                        //load data from scratch
                        $scope.loadCrowds(true);
                    }
                    //if user changed its location slightly
                    else if ($rootScope.location.delta > 0.01) { //10 m
                        //reset here places
                        $scope.groupDistance();
                    }
                }
                // if old location is not valid
                else {
                    //load data from scratch
                    $scope.crowds = 'pending';
                    $scope.$apply();
                    $scope.loadCrowds(true);
                }            
            }
            //if location changed to an invalid value and there were already no valid location value
            else if(!oldLocation.latitude && (!$scope.crowds || $scope.crowds === 'pending')) {
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
        $scope.stopSearch = function() {
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
            }
            //,destroyItemScope: function(index, scope) {}
        };
    }
]);
