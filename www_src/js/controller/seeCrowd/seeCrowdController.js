app.controller('seeCrowdController', ['$rootScope', '$scope', '$filter',
    'seeCrowdModel', 'dateService', 'mapService', '$timeout',
    function($rootScope, $scope, $filter, seeCrowdModel, dateService, mapService, $timeout) {
        var placeBasedCrowdsArray, tab = 'list';
        $scope.crowds = 'pending';

        function loadCrowds(success, fail){
            seeCrowdModel.loadCrowds(function(pbca) {
                placeBasedCrowdsArray = pbca;
                $scope.crowds = $filter('orderBy')(placeBasedCrowdsArray, ['distanceGroup', 'crowdLast.lastUpdatePass']);
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
                itemScope.item = $scope.crowds[index];
            },
            calculateItemHeight: function(index) {
                return 88;
            },
            countItems: function() {
                return $scope.crowds.length;
            }
        };
    }
]);
