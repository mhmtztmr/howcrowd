angular.module('seeCrowd', ['map.Service', 'seeCrowd.Model', 'config'])
  .controller('seeCrowdController', ['$rootScope', '$scope', '$timeout',
    'seeCrowdModel', 'mapService', 'configService',

    function($rootScope, $scope, $timeout, seeCrowdModel, mapService,
      configService) {
      console.log('see crowd controller initialized');
      $scope.crowds = 'pending';

      seeCrowdModel.setCenterPoint(angular.fromJson(localStorage.getItem(
        'location')));
      if (seeCrowdModel.getCenterPoint()) {
        loadCrowds(true);
      } else {
        $scope.crowds = undefined;
      }

      $rootScope.$on("locationChanged", function(event, args) {
        console.log('location change event caught');
        if (!seeCrowdModel.getCenterPoint()) {
          if ($rootScope.location && $rootScope.location.latitude &&
            $rootScope.location.longitude) {
            seeCrowdModel.setCenterPoint($rootScope.location);
            loadCrowds();
          } else {
            $scope.crowds = undefined;
          }
        }
      });

      $scope.checkLocation = function() {
        $scope.crowds = 'pending';
        $rootScope.checkLocation();
      }

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
