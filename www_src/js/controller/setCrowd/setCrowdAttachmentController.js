app.controller('setCrowdAttachmentController', ['$rootScope', '$scope',
  'setCrowdModel', 'setCrowdService', 'dateService', 'mapService', 'INTERFACE',
  function($rootScope, $scope, setCrowdModel, setCrowdService, dateService, mapService, INTERFACE) {
    $scope.selectedPlace =  app.setCrowdNavi.topPage.pushedOptions.selectedPlace;
    $scope.selectedCrowdLevel = app.setCrowdNavi.topPage.pushedOptions.selectedCrowdLevel;

    $scope.crowdText = {value: ''};

    $scope.insertCrowd = function() {
      if($scope.crowdPhoto){
          var fileName = $rootScope.device.id + (new Date()).valueOf() + '.png';
          setCrowdService.uploadFile($scope.crowdPhoto, fileName, function(photoUrl){
              insertCrowd(photoUrl.data);
          }, function(){
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
          var place = $scope.selectedPlace;
          place.key = $scope.selectedPlace.source +
            '|' + $scope.selectedPlace.sid;
          delete place['$$hashKey'];
          var crowd = {
            value: $scope.selectedCrowdLevel.value,
            date: dateService.getDBDate(new Date()),
            agree: 1,
            disagree: 0,
            photo: photoUrl,
            text: $scope.crowdText.value
          };

          //TODO: To be discussed if needed or not
          if($scope.selectedPlace.source !== 'custom') {
            locationForCustomVicinity = undefined;
          }

          mapService.getAddressByLocation(locationForCustomVicinity, function(vicinity){

              //TODO: To be discussed if needed or not
              if(vicinity) {
                place.vicinity = vicinity;
                place.district = vicinity;
              }
              app.navi.resetToPage('templates/crowd.html');
              setCrowdModel.insertCrowd(place, crowd, $rootScope.device,
                function() {
                  ons.notification.alert({
                    title: $rootScope.lang.ALERT.ALERT,
                    message: $rootScope.lang.ALERT.SUCCESS,
                    buttonLabel: $rootScope.lang.ALERT.OK,
                  });
                },
                function() {
                  ons.notification.alert({
                    title: $rootScope.lang.ALERT.ALERT,
                    message: $rootScope.lang.ALERT.FAIL,
                    buttonLabel: $rootScope.lang.ALERT.OK,
                  });
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
