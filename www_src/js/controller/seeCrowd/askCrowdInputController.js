app.controller('askCrowdInputController', ['$rootScope', '$scope', 'seeCrowdService', 'seeCrowdModel',
  function($rootScope, $scope, seeCrowdService, seeCrowdModel) {
    $scope.selectedPlace =  app.navi.topPage.pushedOptions.selectedPlace;
    
    $scope.askCrowdText = {value: ''};

    $scope.askCrowd = function() {
      var crowdData = {
        text: $scope.askCrowdText.value
      };

      app.navi.popPage({animation: 'lift'});
      modal.show();
      var prevReload = seeCrowdModel.setReload({list: true, map: true});
      seeCrowdService.askCrowd(crowdData, $scope.selectedPlace, $rootScope.deviceObject).then(function(){
          app.seeCrowdTabbar.setActiveTab(0, {animation: 'none'});
        }, function(){
          seeCrowdModel.setReload(prevReload);
          modal.hide();
          this.loadingFailedDialog.show();
        });
    };
  }
]);
