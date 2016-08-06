app.controller('seeCrowdController', ['$rootScope', '$scope', '$filter',
    'seeCrowdModel', 'dateService', 'mapService', '$timeout',
    function($rootScope, $scope, $filter, seeCrowdModel, dateService, mapService, $timeout) {
        var placeBasedCrowdsArray, tab = 'list';
        $scope.crowds = 'pending';

        function loadCrowds(success, fail){

            function getFilter() {
                var now = dateService.getDBDate(new Date()),
                oneHourAgo = new Date(new Date(now).setDate(now.getDate() - 20)),
                boundingBox = mapService.getBoundingBox(angular.fromJson(localStorage.getItem('location')), 15);

                return {
                    date: {
                        start: oneHourAgo,
                        end: now
                    },
                    location: boundingBox
                };
            }

            seeCrowdModel.loadCrowds(getFilter(), function(pbca) {
                placeBasedCrowdsArray = pbca;
                $scope.crowds = $filter('orderBy')(placeBasedCrowdsArray, 'distanceGroup');
                if(tab === 'map'){
                    loadMap();
                }
                if(success) success();
            }, fail);
        }

        function loadMap(){
            seeCrowdModel.loadMap();
        }

        function clearMap() {
            seeCrowdModel.clearMap();
        }

        $scope.refreshCrowds = function($done) {
            clearMap();
            if($scope.crowds === 'pending' || $scope.crowds === undefined) {
                if($done) $done();
            }
            if($rootScope.location.latitude) {
                loadCrowds($done);
            }
            else if($scope.crowds !== 'pending' && $scope.crowds !== undefined){
                $scope.crowds = undefined;
                $scope.$apply();
                if($done) $done();
            }
        };

        if($rootScope.location.latitude) {
            loadCrowds();
        }

        $scope.showMap = function(){
            tab = 'map';
            if($scope.crowds instanceof Array) {
                loadMap();
            }
        };
        $scope.showList = function(){
            tab = 'list';
        };

        $scope.$on('$destroy', $rootScope.$on("locationChanged", function(event, args) {
            //pending or undefined
            if(!($scope.crowds instanceof Array)) {
                clearMap();
                if($rootScope.location.latitude) {
                    $scope.crowds = 'pending';
                    loadCrowds();
                }
                else {
                    $scope.crowds = undefined;
                    $scope.$apply();
                }
            }
        }));

        $scope.selectPlaceBasedCrowd = function(placeBasedCrowd) {
            seeCrowdModel.selectPlaceBasedCrowd(placeBasedCrowd);
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
                $scope.crowds = $filter('filter')(
                    placeBasedCrowdsArray, $scope.searchInput.value);
            } else {
                $scope.crowds = placeBasedCrowdsArray;
            }
        };
        $scope.clearSearchInput = function(){
            $scope.searchInput.value = '';
            $scope.searchInputChange();
        };
       
        $scope.MyDelegate = {
            configureItemScope: function(index, itemScope) {
                itemScope.item = $scope.crowds[index];
            },
            calculateItemHeight: function(index) {
                return 108;
            },
            countItems: function() {
                return $scope.crowds.length;
            }
        };
    }
]);
