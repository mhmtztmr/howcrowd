var configService = function() {
  return {
    SEE_CROWDS_IN_RADIUS: 15,
    SEE_CROWDS_ON_RADIUS: 15
  };
};

angular.module('config', [])
  .factory('configService', configService);
