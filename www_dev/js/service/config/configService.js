var configService = function() {
  return {
    SEE_CROWDS_IN_RADIUS: 0.5
  };
};

angular.module('config', [])
  .factory('configService', configService);
