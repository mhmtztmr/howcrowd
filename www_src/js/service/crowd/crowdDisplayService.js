var crowdDisplayService = function() {

  function getCrowdDisplayText(value){
      if(value <= 10) {
        return "Sinek avlıyor"
      }
      else if(value <= 40) {
        return "Sakin"
      }
      else if(value <= 60) {
        return "Normal"
      }
      else if(value <= 90) {
        return "Kalabalık"
      }
      else {
        return "Tıkılm tıklım"
      }
  }

  return {
    getCrowdDisplayText: getCrowdDisplayText
  };
};

angular.module('crowdDisplay.Service', [])
  .factory('crowdDisplayService', [crowdDisplayService]);
