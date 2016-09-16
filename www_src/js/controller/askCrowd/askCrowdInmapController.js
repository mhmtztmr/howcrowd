app.controller('askCrowdInmapController', ['$rootScope', '$scope', 'mapService', '$filter', 'configService', 'askCrowdModel',
    function($rootScope, $scope, mapService, $filter, configService, askCrowdModel) {

        function loadMap() {
            console.log('loading ask map...');
            askCrowdModel.loadMap();
        }

        crowdTabbar.on('prechange', function(event){
            if(event.index === 0) { //if switched to ask crowd tab
                loadMap();
            }
        });

        $scope.searchInput = {value: ''};

        $scope.searchPlace = function() {
            if ($scope.searchInput.value.length > 1) {
                askCrowdModel.searchPlaces($scope.searchInput.value);
            } 
        };

        $scope.clearSearchInput = function(){
            $scope.searchInput.value = '';
            askCrowdModel.clearMap();
        };

        $scope.selectPlace = function(){
            askCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
                app.askCrowdNavi.pushPage('templates/ask-crowd-input.html', {animation: 'lift', selectedPlace: _place});
            });
        };

        $scope.$on('$destroy', $rootScope.$on("askMarkerSelected", function(event, args) {
            $scope.selectedPlace = args.place;
            $scope.$apply();
        }));
        $scope.$on('$destroy', $rootScope.$on("askMarkerDeselected", function(event, args) {
            $scope.selectedPlace = undefined;
            $scope.$apply();
        }));
    }
]);
