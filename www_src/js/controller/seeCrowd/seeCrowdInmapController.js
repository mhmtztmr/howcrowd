app.controller('seeCrowdInmapController', ['$rootScope', '$scope', '$timeout',
    'mapService', 'seeCrowdIncityModel',
    function($rootScope, $scope, $timeout, mapService, seeCrowdIncityModel) {
    console.log('see crowd in map');
    var locationFromStorage = angular.fromJson(localStorage.getItem('location'));
    if (locationFromStorage) {
        $scope.map = true;
        var boundingBox = mapService.getBoundingBox(locationFromStorage, 0.1);
        seeCrowdIncityModel.loadMap('map', boundingBox);
        seeCrowdIncityModel.markPlaceBasedCrowdsOnMap();
    }
}]);
