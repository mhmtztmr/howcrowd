angular.module('seeCrowd', ['map.Service', 'seeCrowd.Model', 'config'])
  .controller('seeCrowdController', ['$rootScope', '$scope', '$timeout',
    'seeCrowdModel', 'mapService', 'configService',

    function($rootScope, $scope, $timeout, seeCrowdModel, mapService,
      configService) {
      console.log('see crowd');
      $scope.crowds = 'pending';
      seeCrowdModel.setCenterPoint(angular.fromJson(localStorage.getItem(
        'location')));
      if (seeCrowdModel.getCenterPoint) {
        loadCrowds(true);
      } else {
        $scope.crowds = undefined;
      }

      $scope.$watch(function() {
        return $rootScope.location;
      }, function(newValue, oldValue) {
        if (newValue) {
          if (newValue.latitude && newValue.longitude) {
            if (!oldValue) {
              seeCrowdModel.setCenterPoint($rootScope.location);
              loadCrowds();
            } else if (newValue.latitude !== oldValue.latitude ||
              newValue.longitude !== oldValue.longitude) {
              seeCrowdModel.setCenterPoint($rootScope.location);
              loadCrowds();
            }
          }
        }
      }, true);

      function loadCrowds(serverRequest) {
        seeCrowdModel.loadCrowds(undefined, serverRequest).then(function() {
            $scope.crowds = seeCrowdModel.getCrowds();
            $scope.placeBasedCrowds = seeCrowdModel.getPlaceBasedCrowds();
          },
          function() {});
      }

      $scope.selectPlaceBasedCrowd = function(placeBasedCrowd) {
        seeCrowdModel.selectPlaceBasedCrowd(placeBasedCrowd);
      };

      // $scope.showCrowdDetailDialog = function(dlg) {
      //   ons.createDialog(dlg).then(function(dialog) {
      //     dialog.show();
      //   });
      // };
    }
  ])
  .controller('seeCrowdInMapController', ['$rootScope', '$scope', '$timeout',
    'mapService', 'seeCrowdModel',
    function($rootScope, $scope, $timeout, mapService, seeCrowdModel) {
      console.log('see crowd in map');

      seeCrowdModel.loadMap('map');
      seeCrowdModel.markPlaceBasedCrowdsOnMap();
    }
  ])
  .controller('seeCrowdDetailDialogController', ['$rootScope', '$scope',
    '$timeout', 'seeCrowdModel', 'guidUtil', 'dateUtil',
    function($rootScope, $scope, $timeout, seeCrowdModel, guidUtil, dateUtil) {
      $scope.selectedPlaceBasedCrowd = seeCrowdModel.getSelectedPlaceBasedCrowd();
    }
  ]);
