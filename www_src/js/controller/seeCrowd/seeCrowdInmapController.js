app.controller('seeCrowdInmapController', ['$rootScope', '$scope', '$filter',
    'seeCrowdModel', 'dateService', 'mapService', '$timeout',
    function($rootScope, $scope, $filter, seeCrowdModel, dateService, mapService, $timeout) {
        
        function loadMap(){
            seeCrowdModel.loadMap();
        }

        $scope.onMapShow = function(){
            loadMap();
        };

        $scope.selectPlace = function() {
            modal.show();
            seeCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
                modal.hide();
                app.seeCrowdNavi.pushPage('templates/see-crowd-detail.html', {animation:'lift', selectedPlace: _place});
            }, function() {
                modal.hide();
                ons.notification.alert({
                  title: $rootScope.lang.ALERT.ALERT,
                  message: $rootScope.lang.ALERT.LOAD_FAIL,
                  buttonLabel: $rootScope.lang.ALERT.OK
                });
            });
        };

        $scope.$on('$destroy', $rootScope.$on("markerSelected", function(event, args) {
            $scope.selectedPlace = args.place;
            $scope.$apply();
        }));
        $scope.$on('$destroy', $rootScope.$on("markerDeselected", function(event, args) {
            $scope.selectedPlace = undefined;
            $scope.$apply();
        }));
    }
]);
