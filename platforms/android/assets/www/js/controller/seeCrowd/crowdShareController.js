app.controller('crowdShareController', ['$scope','$rootScope',
  function($scope, $rootScope) {
    $scope.shareChannels = [{
      label: $rootScope.lang.CROWD_SHARE_MENU.WHATSAPP,
      fnc: function() {
        var selectedPlaceBasedCrowd = $scope.dialog.selectedPlaceBasedCrowd;
        window.plugins.socialsharing.shareViaWhatsApp(
          selectedPlaceBasedCrowd.placeName + ' last crowd value: ' +
          selectedPlaceBasedCrowd.crowdLast, null /* img */ , null /* url */ ,
          function() {
            console.log('share ok');
          },
          function(errormsg) {
            alert(errormsg);
          });
      }
    }];
  }
]);
