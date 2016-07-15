app.controller('crowdPlaceDetailController', ['$scope', 'mapService', '$timeout',

  function($scope, mapService, $timeout) {
    $scope.selectedPlaceBasedCrowd = app.navi.topPage.pushedOptions.selectedPlaceBasedCrowd;
    var boundingBox = mapService.getBoundingBox($scope.selectedPlaceBasedCrowd.crowdLocation, 0.1);
     $timeout(function(){
	    var map = mapService.initMap('single-map', boundingBox.latitude.lower,
	      boundingBox.longitude.lower, boundingBox.latitude.upper,
	      boundingBox.longitude.upper);

	    mapService.markPlaceOnMap(map, $scope.selectedPlaceBasedCrowd,
	      function() {});
	},100);
  }
]);
