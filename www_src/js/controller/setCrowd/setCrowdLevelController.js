app.controller('setCrowdLevelController', ['$rootScope', '$scope',
  'setCrowdModel', 'setCrowdService', 'guidService', 'dateService', 'mapService', 'crowdDisplayService',
  function($rootScope, $scope, setCrowdModel, setCrowdService, guidService, dateService, mapService, crowdDisplayService) {

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

    $scope.selectedPlace = app.setCrowdNavi.topPage.pushedOptions.selectedPlace;
    $scope.customPlaceName = {value: ''};

    $scope.selectCrowd = function(crowdLevelIndex){
      if ($scope.selectedPlace === undefined) {
        if ($scope.customPlaceName.value.length > 0) {
          var id = guidService.get();
          var source = 'custom';
          $scope.selectedPlace = new Place({
            sourceID: id,
            name: $scope.customPlaceName.value,
            latitude: $rootScope.location.latitude,
            longitude: $rootScope.location.longitude,
            source: source
          });
        } else {
          $scope.selectedPlace = undefined;
          ons.notification.alert({
            title: $rootScope.lang.ALERT.ALERT,
            message: 'enter place name',
            buttonLabel: $rootScope.lang.ALERT.OK,
          });
          return;
        }
      }

      if ($scope.selectedPlace && crowdLevelIndex !== undefined && $rootScope.deviceObject) {
        app.setCrowdNavi.pushPage('templates/set-crowd-attachment.html', {
          animation: 'slide', crowdLevels: $scope.levels,  selectedCrowdLevelIndex: crowdLevelIndex, selectedPlace: $scope.selectedPlace
        });
      }
    };
  }
]);
