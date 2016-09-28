app.controller('askCrowdInputController', ['$rootScope', '$scope', 'askCrowdService',
  function($rootScope, $scope, askCrowdService) {
    $scope.selectedPlace =  app.askCrowdNavi.topPage.pushedOptions.selectedPlace;
    
    $scope.askCrowdText = {value: ''};

    $scope.askCrowd = function() {
      var crowdData = {
        text: $scope.askCrowdText.value
      };

      app.askCrowdNavi.popPage({animation: 'lift'});
      modal.show();

      askCrowdService.askCrowd(crowdData, $scope.selectedPlace, $rootScope.deviceObject).then(function(){
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

    $scope.seePlaceDetail = function() {
        app.navi.pushPage('templates/crowd-place-detail.html', {
          selectedPlace: $scope.selectedPlace, 
          animation:'lift'
        });
    };
  }
]);
