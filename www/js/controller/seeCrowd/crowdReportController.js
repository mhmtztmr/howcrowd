app.controller('crowdReportController', ['$scope', 'seeCrowdService',

  function($scope, seeCrowdService) {
    $scope.reportReasons = [{
      label: 'Uygunsuz',
      value: 'inappropriate'
    }, {
      label: 'Kişisel',
      value: 'private'
    }, {
      label: 'Yanıltıcı',
      value: 'misleading'
    }];

    $scope.report = function() {
      seeCrowdService.reportCrowd($scope.dialog.selectedPlaceBasedCrowd.crowds[
        0], $scope.reportReason);
      app.navi.resetToPage('templates/see-crowd.html');
    };

    $scope.reportReason = $scope.reportReasons[0].value;
  }
]);
