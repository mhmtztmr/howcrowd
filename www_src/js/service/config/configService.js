var configService = function() {
  return {
    NEARBY_DISTANCE: 0.1, //km
    FAR_DISTANCE: 50, //km => city
    NEARBY_TIME: 1, //hour
    REPORT_EMAIL: 'muhahmut@gmail.com'
  };
};

angular.module('config', [])
  .factory('configService', configService);
