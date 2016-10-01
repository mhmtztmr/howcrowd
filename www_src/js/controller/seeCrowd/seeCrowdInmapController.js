app.controller('seeCrowdInmapController', ['$rootScope', '$scope', '$filter',
    'seeCrowdModel',
    function($rootScope, $scope, $filter, seeCrowdModel) {
        
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
                this.loadingFailedDialog.show();
            });
        };

        $scope.$on('$destroy', $rootScope.$on("markerSelected", function(event, args) {
            $scope.selectedPlace = args.place;
            $scope.$apply();
        }));
        $scope.$on('$destroy', $rootScope.$on("markerDeselected", function() {
            $scope.selectedPlace = undefined;
            $scope.$apply();
        }));
    }
]);
