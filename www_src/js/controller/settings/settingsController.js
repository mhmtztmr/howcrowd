app.controller('settingsController', ['$scope', '$rootScope', 'settingsService', function($scope, $rootScope, settingsService) {

  $scope.saveChanges = function() {
    settingsService.saveSettings();
  };
  modal.hide();
}]);
