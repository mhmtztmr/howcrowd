'use strict';

angular.module('myconn', ['btford.phonegap.ready'])
  .factory('myconnection', function($rootScope, $window, phonegapReady) {
    return {
      getConnectionType: phonegapReady(function(onSuccess, onFailure) {
        if (onSuccess) {
          $rootScope.$apply(function() {
            onSuccess(navigator.connection.type);
          });
        }
      }),
      addConnectionListener: function(connectedCallback, disconnectedCallback) {
        if (connectedCallback) {
          document.addEventListener(
            'online',
            function() {
              $rootScope.$apply(connectedCallback);
            },
            false
          );
        }
        if (disconnectedCallback) {
          document.addEventListener(
            'offline',
            function() {
              $rootScope.$apply(disconnectedCallback);
            },
            false
          );
        }
      }
    };
  });
