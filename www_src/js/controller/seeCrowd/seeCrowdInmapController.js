app.controller('seeCrowdInmapController', ['$rootScope', '$scope', '$timeout',
    'mapService', 'seeCrowdIncityModel',
    function($rootScope, $scope, $timeout, mapService, seeCrowdIncityModel) {
       myTabbar.on('prechange', function(event) {
        //If this is map page
        if(event.index === 1) {
            $timeout(function(){
                var locationFromStorage = angular.fromJson(localStorage.getItem('location'));
                if (locationFromStorage) {
                    $scope.map = true;
                    var boundingBox = mapService.getBoundingBox(locationFromStorage, 0.1);
                    seeCrowdIncityModel.loadMap('map', boundingBox);
                    seeCrowdIncityModel.markPlaceBasedCrowdsOnMap();
                }
            }, 100);
        }
    });

    $scope.selectPlaceBasedCrowd = function(selectPlaceBasedCrowd){
        seeCrowdIncityModel.selectPlaceBasedCrowd(selectPlaceBasedCrowd);
    };
}]);
