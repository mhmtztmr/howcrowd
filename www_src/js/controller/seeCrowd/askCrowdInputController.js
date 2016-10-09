app.controller('askCrowdInputController', ['$rootScope', '$scope', 'seeCrowdService',
  function($rootScope, $scope, seeCrowdService) {
    $scope.selectedPlace =  app.seeCrowdNavi.topPage.pushedOptions.selectedPlace;
    
    $scope.askCrowdText = {value: ''};

    $scope.askCrowd = function() {
      var crowdData = {
        text: $scope.askCrowdText.value
      };

      app.seeCrowdNavi.popPage({animation: 'lift'});
      modal.show();

      seeCrowdService.askCrowd(crowdData, $scope.selectedPlace, $rootScope.deviceObject).then(function(){
          modal.hide();
          crowdTabbar.setActiveTab(1);
        }, function(){
          modal.hide();
          this.loadingFailedDialog.show();
        });
    };
  }
]);
