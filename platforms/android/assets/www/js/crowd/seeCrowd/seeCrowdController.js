angular.module('seeCrowd', ['map.Service', 'seeCrowd.Model', 'config'])
  .controller('seeCrowdController', ['$rootScope', '$scope', '$timeout',
    '$filter', 'seeCrowdModel', 'mapService', 'configService',

    function($rootScope, $scope, $timeout, $filter, seeCrowdModel, mapService,
      configService) {
      console.log('see crowd controller initialized');
      $scope.crowds = 'pending';
      var placeBasedCrowdsArray;

      $scope.loadCrowds = function(serverRequest, $done) {
        seeCrowdModel.loadCrowds(undefined, serverRequest).then(function() {
            $scope.crowds = seeCrowdModel.getCrowds();
            var placeBasedCrowds = seeCrowdModel.getPlaceBasedCrowds();
            placeBasedCrowdsArray = Object.keys(placeBasedCrowds).map(
              function(key) {
                return placeBasedCrowds[key];
              });
            $scope.filteredPlaceBasedCrowdsArray = placeBasedCrowdsArray;
          },
          function() {
            if ($done) {
              $done();
            }
          });
      };

      seeCrowdModel.setCenterPoint(angular.fromJson(localStorage.getItem(
        'location')));
      if (seeCrowdModel.getCenterPoint()) {
        $scope.loadCrowds(true);
      } else {
        $scope.crowds = undefined;
      }

      $rootScope.$on("locationChanged", function(event, args) {
        console.log('location change event caught');
        if (!seeCrowdModel.getCenterPoint()) {
          if ($rootScope.location && $rootScope.location.latitude &&
            $rootScope.location.longitude) {
            seeCrowdModel.setCenterPoint($rootScope.location);
            $scope.loadCrowds();
          } else {
            $scope.crowds = undefined;
          }
        }
      });

      $scope.checkLocation = function() {
        $scope.crowds = 'pending';
        $rootScope.checkLocation();
      };

      $scope.selectPlaceBasedCrowd = function(placeBasedCrowd) {
        seeCrowdModel.selectPlaceBasedCrowd(placeBasedCrowd);
      };

      $scope.searchInputChange = function(searchInput) {
        if (searchInput.length > 1) {
          $scope.filteredPlaceBasedCrowdsArray = $filter('filter')(
            placeBasedCrowdsArray, searchInput);
        } else {
          $scope.filteredPlaceBasedCrowdsArray = placeBasedCrowdsArray;
        }
      };

      $scope.MyDelegate = {
        configureItemScope: function(index, itemScope) {
          console.log("Created item #" + index);
          itemScope.item = $scope.filteredPlaceBasedCrowdsArray[index];
        },
        calculateItemHeight: function(index) {
          return 44;
        },
        countItems: function() {
          return $scope.filteredPlaceBasedCrowdsArray.length;
        },
        destroyItemScope: function(index, scope) {
          console.log("Destroyed item #" + index);
        }
      };

      $scope.showInfo = function() {
        ons.notification.alert({
          message: 'You need to enable location to see crowds around you, and feedback them.'
        });
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

      $scope.givePositiveFeedback = function() {
        giveFeedback(true);
      };

      $scope.giveNegativeFeedback = function() {
        giveFeedback(false);
      };

      function giveFeedback(isPositive) {
        seeCrowdModel.giveFeedback($scope.selectedPlaceBasedCrowd.crowds[0],
          isPositive);
      }
    }
  ]);
