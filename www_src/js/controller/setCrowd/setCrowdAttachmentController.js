app.controller('setCrowdAttachmentController', ['$rootScope', '$scope',
  'setCrowdModel', 'setCrowdService', 'mapService', 'INTERFACE', 'dbService',
  function($rootScope, $scope, setCrowdModel, setCrowdService, mapService, INTERFACE, dbService) {
    $scope.selectedPlace =  app.setCrowdNavi.topPage.pushedOptions.selectedPlace;
    $scope.selectedCrowdLevel = app.setCrowdNavi.topPage.pushedOptions.selectedCrowdLevel;

    $scope.crowdText = {value: ''};

    $scope.insertCrowd = function() {
      modal.show();
      if($scope.crowdPhoto){
        var fileName = $rootScope.deviceObject.ID + (new Date()).valueOf() + '.png';
        setCrowdService.uploadFile($scope.crowdPhoto, fileName, function(photoUrl){
          insertCrowd(photoUrl.data);
        }, function(){
          modal.hide();
          ons.notification.alert({
            title: $rootScope.lang.ALERT.ALERT,
            message: $rootScope.lang.ALERT.FAIL,
            buttonLabel: $rootScope.lang.ALERT.OK,
          });
        });
      }
      else {
        insertCrowd();
      }

      function insertCrowd(photoUrl) {
        var locationForCustomVicinity = $rootScope.location;
        var placeData = $scope.selectedPlace;
        var crowdData = {
          value: $scope.selectedCrowdLevel.value,
          photoURL: photoUrl,
          text: $scope.crowdText.value
        };

        app.setCrowdNavi.pages[2]._destroy();
        app.setCrowdNavi.popPage({animation: 'lift'});

        setCrowdService.setCrowd(crowdData, placeData, $rootScope.deviceObject).then(function(){
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
      }
    };

    $scope.takePhoto= function(){
      INTERFACE.takePhoto(function(photoData){
        $scope.crowdPhoto = photoData;
        if(!$scope.$$phase) {
          $scope.$apply();
        }
      }, function(){

      });
    };

    $scope.clearPhoto= function(){
      $scope.crowdPhoto = undefined;
    };
  }
]);
