app.controller('setCrowdAttachmentController', ['$rootScope', '$scope',
  'setCrowdModel', 'setCrowdService', 'mapService', 'INTERFACE',
  function($rootScope, $scope, setCrowdModel, setCrowdService, mapService, INTERFACE) {
    $scope.selectedPlace =  app.setCrowdNavi.topPage.pushedOptions.selectedPlace;
    var selectedCrowdLevelIndex = app.setCrowdNavi.topPage.pushedOptions.selectedCrowdLevelIndex;
    var crowdLevels = app.setCrowdNavi.topPage.pushedOptions.crowdLevels;
    $scope.selectedCrowdLevel = crowdLevels[selectedCrowdLevelIndex];

    $scope.crowdText = {value: ''};

    $scope.insertCrowd = function() {
      function insertCrowd(photoUrl) {
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
          this.loadingFailedDialog.show();
        });
      }

      modal.show();
      if($scope.crowdPhoto){
        var fileName = $rootScope.deviceObject.ID + (new Date()).valueOf() + '.png';
        setCrowdService.uploadFile($scope.crowdPhoto, fileName, function(photoUrl){
          insertCrowd(photoUrl.data);
        }, function(){
          modal.hide();
          this.loadingFailedDialog.show();
        });
      }
      else {
        insertCrowd();
      }
    };

    $scope.decreaseCrowdLevel = function() {
      selectedCrowdLevelIndex = (selectedCrowdLevelIndex + 1) % crowdLevels.length;
      $scope.selectedCrowdLevel = crowdLevels[selectedCrowdLevelIndex];
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    };

    $scope.increaseCrowdLevel = function() {
      selectedCrowdLevelIndex = (selectedCrowdLevelIndex + crowdLevels.length - 1) % crowdLevels.length;
      $scope.selectedCrowdLevel = crowdLevels[selectedCrowdLevelIndex];
      if(!$scope.$$phase) {
        $scope.$apply();
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
