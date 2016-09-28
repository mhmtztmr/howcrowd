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

        $scope.searchInput = {value: '', searchable: true};

        $scope.searchPlace = function() {
            if ($scope.searchInput.value.length > 1) {
                askCrowdModel.searchPlaces($scope.searchInput.value).then(undefined, function() {
                    this.noPlaceFoundDialog.show();
                });
            } 
        };

        $scope.clearSearchInput = function(){
            $scope.searchInput = {value: '', searchable: true};
            askCrowdModel.clearMap();
        };

        $scope.selectPlace = function(){
            askCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
                app.askCrowdNavi.pushPage('templates/ask-crowd-input.html', {animation: 'lift', selectedPlace: _place});
            });
        };

        $scope.$on('$destroy', $rootScope.$on("askMarkerSelected", function(event, args) {
            modal.hide();
            $scope.selectedPlace = args.place;
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }));
        $scope.$on('$destroy', $rootScope.$on("askMarkerDeselected", function() {
            $scope.selectedPlace = undefined;
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }));
        $scope.$on('$destroy', $rootScope.$on("longpressForAskRequiresZoom", function() {
            this.zoomForAskDialog.show();
        }));
        $scope.$on('$destroy', $rootScope.$on("unsearchableAsk", function(event, args) {
            $scope.searchInput.value = args.value;
            $scope.searchInput.searchable = false;
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }));
    }
]);
