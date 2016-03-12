app.controller('crowdReportController', ['$scope',
  function($scope) {
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
      alert($scope.reportReason);
    };

    $scope.reportReason = $scope.reportReasons[0].value;
  }
]);
