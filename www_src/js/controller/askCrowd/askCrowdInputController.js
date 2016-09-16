app.controller('askCrowdInputController', ['$rootScope', '$scope', 'askCrowdService', 'dateService',
  function($rootScope, $scope, askCrowdService, dateService) {
    $scope.selectedPlace =  app.askCrowdNavi.topPage.pushedOptions.selectedPlace;
    
    $scope.askCrowdText = {value: ''};

    $scope.askCrowd = function() {
      var locationForCustomVicinity = $rootScope.location;
      var placeData = $scope.selectedPlace;

      var crowdData = {
        text: $scope.askCrowdText.value
      };

      app.askCrowdNavi.popPage({animation: 'lift'});
      modal.show();

      askCrowdService.askCrowd(crowdData, placeData, $rootScope.deviceObject).then(function(){
          modal.hide();
          crowdTabbar.setActiveTab(1);
        }, function(){
          modal.hide();
          ons.notification.alert({
            title: $rootScope.lang.ALERT.ALERT,
            message: $rootScope.lang.ALERT.FAIL,
            buttonLabel: $rootScope.lang.ALERT.OK,
          });
        });
    };
  }
]);
