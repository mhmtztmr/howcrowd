var configService = function() {
  return {
    NEARBY_DISTANCE: 0.03, //km
    FAR_DISTANCE: 15, //km => city
    NEARBY_TIME: 1, //hour
    REPORT_EMAIL: 'muhahmut@gmail.com'
  };
};

angular.module('config', [])
  .factory('configService', configService);
