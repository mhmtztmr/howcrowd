app.controller('setCrowdLevelController', ['$rootScope', '$scope',
  'setCrowdModel', 'setCrowdService', 'guidService', 'dateService', 'mapService', 'crowdDisplayService', 'INTERFACE',
  function($rootScope, $scope, setCrowdModel, setCrowdService, guidService, dateService, mapService, crowdDisplayService, INTERFACE) {

    $scope.levels = [{
      value: 95,
      text: crowdDisplayService.getCrowdDisplayText(95)
    }, {
      value: 70,
      text: crowdDisplayService.getCrowdDisplayText(70)
    }, {
      value: 50,
      text: crowdDisplayService.getCrowdDisplayText(50)
    }, {
      value: 30,
      text: crowdDisplayService.getCrowdDisplayText(30)
    }, {
      value: 5,
      text: crowdDisplayService.getCrowdDisplayText(5)
    }];

    $scope.selectedPlace = setCrowdModel.getSelectedPlace();

    $scope.insertCrowd = function(crowdValue, customPlaceName) {
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
          if (!$scope.selectedPlace) {
            if (customPlaceName) {
              var id = guidService.get();
              var source = 'custom';
              $scope.selectedPlace = {
                sid: id,
                name: customPlaceName,
                location: $rootScope.location,
                source: source
              };
            } else {
              $scope.selectedPlace = undefined;
              return;
            }
          }

          if ($scope.selectedPlace && crowdValue && $rootScope.device) {
            var place = $scope.selectedPlace;
            place.key = $scope.selectedPlace.source +
              '|' + $scope.selectedPlace.sid;
            delete place['$$hashKey'];
            var crowd = {
              value: crowdValue,
              date: dateService.getDBDate(new Date()),
              agree: 1,
              disagree: 0,
              photo: photoUrl
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
  }
]);
