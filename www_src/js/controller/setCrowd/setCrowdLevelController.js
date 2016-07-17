app.controller('setCrowdLevelController', ['$rootScope', '$scope',
  'setCrowdModel', 'guidService', 'dateService', 'mapService',
  function($rootScope, $scope, setCrowdModel, guidService, dateService, mapService) {

    $scope.levels = [{
      value: 100,
      text: 100
    }, {
      value: 90,
      text: 90
    }, {
      value: 80,
      text: 80
    }, {
      value: 70,
      text: 70
    }, {
      value: 60,
      text: 60
    }, {
      value: 50,
      text: 50
    }, {
      value: 40,
      text: 40
    }, {
      value: 30,
      text: 30
    }, {
      value: 20,
      text: 20
    }, {
      value: 10,
      text: 10
    }, {
      value: 0,
      text: 0
    }];

    $scope.selectedPlace = setCrowdModel.getSelectedPlace();

    $scope.insertCrowd = function(crowdValue, customPlaceName) {
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
          disagree: 0
        };

        //TODO: To be discussed if needed or not
        if($scope.selectedPlace.source !== 'custom') {
          locationForCustomVicinity = undefined;
        }

        mapService.getAddressByLocation(locationForCustomVicinity, function(vicinity){
            if(vicinity) {
              place.vicinity = vicinity;
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
    };
  }
]);
