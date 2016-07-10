app.controller('crowdPlaceDetailController', ['$scope', 'mapService',

  function($scope, mapService) {
    $scope.selectedPlaceBasedCrowd = app.navi.topPage.pushedOptions.selectedPlaceBasedCrowd;
    var boundingBox = mapService.getBoundingBox($scope.selectedPlaceBasedCrowd.crowdLocation, 0.1);
    var map = mapService.initMap('map', boundingBox.latitude.lower,
      boundingBox.longitude.lower, boundingBox.latitude.upper,
      boundingBox.longitude.upper);

    mapService.markPlaceOnMap(map, $scope.selectedPlaceBasedCrowd,
      function() {});
  }
]);
