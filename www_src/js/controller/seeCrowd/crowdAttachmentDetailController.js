app.controller('crowdAttachmentDetailController', ['$scope',
  function($scope) {
    $scope.crowd = app.navi.topPage.pushedOptions.crowd;

    $scope.onPageShown = function(){
        modal.hide();
    };
  }
]);
