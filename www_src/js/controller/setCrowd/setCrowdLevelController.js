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
    $scope.customPlaceName = {value: ''};

    $scope.selectCrowd = function(crowdLevel){
      if (!$scope.selectedPlace) {
        if ($scope.customPlaceName.value.length > 0) {
          var id = guidService.get();
          var source = 'custom';
          $scope.selectedPlace = {
            sid: id,
            name: $scope.customPlaceName.value,
            location: $rootScope.location,
            source: source
          };
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
      if ($scope.selectedPlace && crowdLevel && $rootScope.device) {
        app.navi.pushPage('templates/set-crowd-attachment.html', {
          animation: 'slide', selectedCrowdLevel: crowdLevel, selectedPlace: $scope.selectedPlace
        });
      }
    };
  }
]);
