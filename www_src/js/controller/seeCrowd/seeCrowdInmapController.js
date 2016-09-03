app.controller('seeCrowdInmapController', ['$rootScope', '$scope', '$filter',
    'seeCrowdModel', 'dateService', 'mapService', '$timeout',
    function($rootScope, $scope, $filter, seeCrowdModel, dateService, mapService, $timeout) {
        
        function loadMap(){
            seeCrowdModel.loadMap();
        }

        $scope.onMapShow = function(){
            loadMap();
        };

        $scope.selectPlace = function(){
            seeCrowdModel.selectPlaceBasedCrowd($scope.selectedPlace);
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
