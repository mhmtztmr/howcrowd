app.controller('askCrowdInputController', ['$rootScope', '$scope', 'askCrowdModel', 'dateService',
  function($rootScope, $scope, askCrowdModel, dateService) {
    $scope.selectedPlace =  app.askCrowdNavi.topPage.pushedOptions.selectedPlace;
    
    $scope.askCrowdText = {value: ''};

    $scope.askCrowd = function() {
      var locationForCustomVicinity = $rootScope.location;
      var place = $scope.selectedPlace;
      place.key = 'google' +
        '|' + $scope.selectedPlace.sid;
      delete place['$$hashKey'];
      var crowd = {
        date: dateService.getDBDate(new Date()),
        text: $scope.askCrowdText.value,
        value: -1
      };

      app.askCrowdNavi.popPage({animation: 'lift'});
      modal.show();

      askCrowdModel.askCrowd(place, crowd, $rootScope.device,
        function() {
          //TODO: seecrowdmodel.loadcrowds should be called to refresh seecrowdinlist page
          crowdTabbar.setActiveTab(1);
          modal.hide();
        },
        function() {
          ons.notification.alert({
            title: $rootScope.lang.ALERT.ALERT,
            message: $rootScope.lang.ALERT.FAIL,
            buttonLabel: $rootScope.lang.ALERT.OK,
          });
        }
      );
    };
  }
]);
