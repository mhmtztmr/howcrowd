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
                askCrowdModel.searchByText($scope.searchInput.value);
            } 
        };

        $scope.clearSearchInput = function(){
            $scope.searchInput.value = '';
            askCrowdModel.clearMap();
        };

        $scope.selectPlace = function(){
            askCrowdModel.selectPlace($scope.selectedPlace);
        };

        $scope.$on('$destroy', $rootScope.$on("askMarkerSelected", function(event, args) {
            $scope.selectedPlace = {
              sid: args.place.place_id,
              name: args.place.name,
              location: {
                latitude: args.place.geometry.location.lat(),
                longitude: args.place.geometry.location.lng()
              },
              source: 'google',
              vicinity: args.place.vicinity
            };
            $scope.$apply();
        }));
        $scope.$on('$destroy', $rootScope.$on("askMarkerDeselected", function(event, args) {
            $scope.selectedPlace = undefined;
            $scope.$apply();
        }));
    }
]);
