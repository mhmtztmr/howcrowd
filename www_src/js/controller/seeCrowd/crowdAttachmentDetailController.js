app.controller('crowdAttachmentDetailController', ['$scope',

  function($scope) {
    $scope.crowd = app.seeCrowdNavi.topPage.pushedOptions.crowd;
  }
]);
