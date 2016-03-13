app.controller('crowdShareController', ['$scope',
  function($scope) {


    $scope.shareChannels = [{
      label: 'WhatsApp',
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
