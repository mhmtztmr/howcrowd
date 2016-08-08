angular.module('geolocation', ['phonegap.ready']).
factory('geolocation', function($rootScope, phonegapReady) {
  return {
    getCurrentPosition: phonegapReady(function(onSuccess, onError, options) {
      navigator.geolocation.getCurrentPosition(function() {
          var that = this,
            args = arguments;

          if (onSuccess) {
            $rootScope.$apply(function() {
              onSuccess.apply(that, args);
            });
          }
        }, function() {
          var that = this,
            args = arguments;

          if (onError) {
            $rootScope.$apply(function() {
              onError.apply(that, args);
            });
          }
        },
        options);
    }),
    watchPosition: phonegapReady(function(onSuccess, onError, options) {
      navigator.geolocation.watchPosition(function() {
          var that = this,
            args = arguments;

          if (onSuccess) {
            $rootScope.$apply(function() {
              onSuccess.apply(that, args);
            });
          }
        }, function() {
          var that = this,
            args = arguments;

          if (onError) {
            $rootScope.$apply(function() {
              onError.apply(that, args);
            });
          }
        },
        options);
    })
  };
});
