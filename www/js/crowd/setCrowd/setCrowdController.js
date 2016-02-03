angular.module('setCrowd', ['setCrowd.Model', 'seeCrowd.Model', 'map.Model',
    'map.Service', 'util.guid', 'util.date'
  ])
  .controller('setCrowdController', ['$rootScope', '$scope', '$timeout',
    'mapModel', 'mapService', 'setCrowdModel',
    function($rootScope, $scope, $timeout, mapModel, mapService,
      setCrowdModel) {
      console.log('set crowd');
      $scope.nearbyPlaces = {
        status: 'pending',
        data: []
      };

      loadNearbyPlaces();

      $scope.$watch(function() {
        return $rootScope.location;
      }, function(newValue, oldValue) {
        if (newValue) {
          if (newValue.latitude && newValue.longitude) {
            if (!oldValue) {
              loadNearbyPlaces();
            } else if (newValue.latitude !== oldValue.latitude ||
              newValue.longitude !== oldValue.longitude) {
              loadNearbyPlaces();
            }
          } else if (newValue.error) {
            // $scope.nearbyPlaces = {
            //   status: 'failed'
            // };
          }
        } else {
          // $scope.nearbyPlaces = {
          //   status: 'failed'
          // };
        }
      }, true);

      function loadNearbyPlaces() {
        if ($rootScope.location && $rootScope.location.latitude && $rootScope
          .location.longitude) {
          mapModel.loadNearbyPlaces($rootScope.location, true).then(
            function() {
              $scope.nearbyPlaces = mapModel.getNearbyPlaces();
            },
            function() {});
        }
      };

      $scope.selectPlace = function(place) {
        setCrowdModel.selectPlace(place);
      };
    }
  ])
  .controller('setCrowdDialogController', ['$rootScope', '$scope',
    '$timeout', 'setCrowdModel', 'guidUtil', 'dateUtil',
    function($rootScope, $scope, $timeout, setCrowdModel, guidUtil, dateUtil) {
      console.log('set crowd dialog');
      $scope.selectedPlace = setCrowdModel.getSelectedPlace();
      $scope.insertCrowd = function(crowdValue, customPlaceName) {
        if (!$scope.selectedPlace) {
          if (customPlaceName) {
            var id = guidUtil.get();
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
            date: dateUtil.getDBDate(new Date()),
            agree: 1,
            disagree: 0
          };

          setCrowdModel.insertCrowd(place, crowd, $rootScope.device,
            function() {
              ons.notification.alert({
                message: 'Successful!'
              });
            },
            function() {
              ons.notification.alert({
                message: 'Failure!'
              });
            });
        }
      };
    }
  ]);
