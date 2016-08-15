app.controller('seeCrowdController', ['$rootScope', '$scope', '$filter',
    'seeCrowdModel', 'dateService', 'mapService', '$timeout',
    function($rootScope, $scope, $filter, seeCrowdModel, dateService, mapService, $timeout) {
        var placeBasedCrowdsArray;
        $scope.crowds = 'pending';
        $scope.tab = 'list';

        function loadCrowds(success){
            seeCrowdModel.loadCrowds(function(pbca) {
                placeBasedCrowdsArray = pbca;
                $timeout(function() {
                    $scope.crowds = $filter('orderBy')(placeBasedCrowdsArray, ['distanceGroup', 'crowdLast.lastUpdatePass']);
                });
                if($scope.tab === 'map'){
                    loadMap();
                }
                if(success) success();
            }, function(){
                ons.notification.alert({
                  title: $rootScope.lang.ALERT.ALERT,
                  message: $rootScope.lang.ALERT.LOAD_FAIL,
                  buttonLabel: $rootScope.lang.ALERT.OK
                });
                $scope.crowds = [];
                if(!$scope.$$phase) {
                    $scope.$apply();
                }
                if(success) success();
            });
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
            $scope.tab = 'map';
            if($scope.crowds instanceof Array) {
                loadMap();
            }
        };
        $scope.showList = function(){
            $scope.tab = 'list';
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
