var configService = function() {
  return {
    NEARBY_DISTANCE: 0.1, //km
    FAR_DISTANCE: 50, //km => city,
    LONGPRESS_ASK_DISTANCE: 0.02, //km
    NEARBY_TIME: 1, //hour
    FEEDBACK_TIME: 0.5, //hour
    REPORT_EMAIL: 'muhahmut@gmail.com'
  };
};

angular.module('config', [])
  .factory('configService', configService);
