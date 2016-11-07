app.controller('crowdPlaceDetailController', ['$scope',

  function($scope) {
    $scope.selectedPlace = app.navi.topPage.pushedOptions.selectedPlace;
  }
]);
