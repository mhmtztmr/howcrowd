app.controller('seeCrowdIncityController', ['$rootScope', '$scope', '$filter',
  'seeCrowdIncityModel',
  function($rootScope, $scope, $filter, seeCrowdIncityModel) {
    console.log('see crowd incity controller initialized');
    var placeBasedCrowdsArray;
    $scope.crowds = 'pending';
    $scope.filteredPlaceBasedCrowdsArray = [];

    $scope.loadCrowds = function(serverRequest, onSuccess, onFailure) {
      seeCrowdIncityModel.loadCrowds(undefined, serverRequest).then(
        function() {
          $scope.crowds = seeCrowdIncityModel.getCrowds();
          var placeBasedCrowds = seeCrowdIncityModel.getPlaceBasedCrowds();
          placeBasedCrowdsArray = Object.keys(placeBasedCrowds).map(
            function(key) {
              return placeBasedCrowds[key];
            });
          $scope.filteredPlaceBasedCrowdsArray = placeBasedCrowdsArray;
          if (onSuccess) {
            onSuccess();
          }
        },
        function() {
          if (onFailure) {
            onFailure();
          }
        });
    };

    var locationFromStorage = angular.fromJson(localStorage.getItem(
      'location'));
    if (locationFromStorage) {
      seeCrowdIncityModel.setBaseLocation(locationFromStorage);
      $scope.loadCrowds(true);
    } else {
      $scope.crowds = undefined;
    }

    $rootScope.$on("locationChanged", function(event, args) {
      var newLocation = $rootScope.location,
        oldLocation = args.oldLocation;
      if (newLocation && newLocation.latitude && newLocation.longitude) {
        if (oldLocation && oldLocation.latitude && oldLocation.longitude) {
          // var distance = getDistanceBetweenLocations(newLocation,
          //   oldLocation);
          // if (distance > 0.01) { //10 m
          //   seeCrowdModel.setBaseLocation(newLocation);
          //   $scope.loadCrowds(true);
          // }
        } else {
          seeCrowdIncityModel.setBaseLocation(newLocation);
          $scope.loadCrowds(true);
        }
      }
    });

    $scope.checkLocation = function() {
      $scope.crowds = 'pending';
      $rootScope.checkLocation();
    };

    $scope.selectPlaceBasedCrowd = function(placeBasedCrowd) {
      seeCrowdIncityModel.selectPlaceBasedCrowd(placeBasedCrowd);
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
        itemScope.item = $scope.filteredPlaceBasedCrowdsArray[index];
      },
      calculateItemHeight: function(index) {
        return 44;
      },
      countItems: function() {
        return $scope.filteredPlaceBasedCrowdsArray.length;
      },
      destroyItemScope: function(index, scope) {}
    };
  }
]);
