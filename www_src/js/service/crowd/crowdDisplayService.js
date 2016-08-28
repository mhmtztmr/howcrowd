angular.module('crowdDisplay.Service', [])
  .factory('crowdDisplayService',['$rootScope' ,function($rootScope) {

  function getCrowdDisplayText(value){
      if(value <= 10) {
        return $rootScope.lang.CROWD_VALUES["0"];
      }
      else if(value <= 40) {
        return $rootScope.lang.CROWD_VALUES["1"];
      }
      else if(value <= 60) {
        return $rootScope.lang.CROWD_VALUES["2"];
      }
      else if(value <= 90) {
        return $rootScope.lang.CROWD_VALUES["3"];
      }
      else {
        return $rootScope.lang.CROWD_VALUES["4"];
      }
  }

  return {
    getCrowdDisplayText: getCrowdDisplayText
  };
}]);
