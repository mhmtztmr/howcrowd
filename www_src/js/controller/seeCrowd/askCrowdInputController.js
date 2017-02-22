app.controller('askCrowdInputController', ['$rootScope', '$scope', 'seeCrowdService', 'seeCrowdModel',
  function($rootScope, $scope, seeCrowdService, seeCrowdModel) {
    $scope.selectedPlace =  app.navi.topPage.pushedOptions.selectedPlace;
    
    $scope.askCrowdText = {value: ''};

    $scope.askCrowd = function() {
      var crowdData = {
        text: $scope.askCrowdText.value
      };

      modal.show();
      seeCrowdService.askCrowd(crowdData, $scope.selectedPlace, $rootScope.deviceObject).then(function(){
          seeCrowdModel.setReload({list: true, map: true});
          while( app.navi.pages.length > 2) {
            app.navi.pages[app.navi.pages.length - 1]._destroy();
          }
          app.navi.popPage({animation: 'lift'});
          app.seeCrowdTabbar.setActiveTab(0, {animation: 'none'});
        }, function(){
          modal.hide();
          this.loadingFailedDialog.show();
        });
    };
  }
]);
