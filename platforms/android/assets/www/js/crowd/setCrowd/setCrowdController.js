angular.module('setCrowd', ['setCrowd.Model', 'seeCrowd.Model', 'map.Model',
    'map.Service', 'util.guid', 'util.date'
  ])
  .controller('setCrowdController', ['$rootScope', '$scope', '$timeout',
    'mapModel', 'mapService', 'setCrowdModel',
    function($rootScope, $scope, $timeout, mapModel, mapService,
      setCrowdModel) {
      console.log('set crowd');

      $scope.nearbyPlaces = 'pending';
      if ($rootScope.location && $rootScope.location.latitude && $rootScope.location
        .longitude) {
        loadNearbyPlaces();
      }

      $rootScope.$on("locationChanged", function(event, args) {
        alert('newloc: ' + JSON.stringify($rootScope.location));
        alert('oldloc: ' + JSON.stringify(args.oldLocation));
        console.log('location change event caught: ' + JSON.stringify(
          $rootScope.location));
        if ($rootScope.location && $rootScope.location.latitude &&
          $rootScope.location.longitude) {
          loadNearbyPlaces();
        } else {
          $scope.nearbyPlaces = undefined;
        }
      });

      function loadNearbyPlaces() {
        mapModel.loadNearbyPlaces($rootScope.location, true).then(
          function() {
            $scope.nearbyPlaces = mapModel.getNearbyPlaces();
          },
          function() {
            $scope.nearbyPlaces = [];
          });
      };

      $scope.checkLocation = function() {
        $scope.nearbyPlaces = 'pending';
        $rootScope.checkLocation();
      }

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
        }
      };
    }
  ]);
