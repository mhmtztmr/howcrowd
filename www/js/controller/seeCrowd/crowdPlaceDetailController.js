app.controller('crowdPlaceDetailController', ['$scope', 'mapService',

  function($scope, mapService) {
    $scope.selectedPlaceBasedCrowd = app.navi.getCurrentPage().options.selectedPlaceBasedCrowd;
    var baseLocation = $scope.selectedPlaceBasedCrowd.crowdLocation;
    var boundingBox = mapService.getBoundingBox(baseLocation, 0.1);
    var map = mapService.initMap('map', boundingBox.latitude.lower,
      boundingBox.longitude.lower, boundingBox.latitude.upper,
      boundingBox.longitude.upper);

    mapService.markPlaceOnMap(map, baseLocation.latitude, baseLocation.longitude,
      $scope.selectedPlaceBasedCrowd.crowdAverage,
      function() {});
  }
]);
