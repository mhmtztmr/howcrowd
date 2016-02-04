var app = angular.module('app', ['onsen', 'ui.router', 'seeCrowd', 'setCrowd',
  'contact', 'about', 'db', 'device.id', 'map.Service', 'lang',
  'config', 'myconn'
]);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/see-crowd");
  $stateProvider
    .state('app', {
      url: "/",
      templateUrl: 'js/app/app.html'
    })
    .state('app.setCrowd', {
      url: "set-crowd",
      templateUrl: "js/crowd/setCrowd/set-crowd.html",
      controller: "setCrowdController"
    })
    .state('app.seeCrowd', {
      url: "see-crowd",
      templateUrl: "js/crowd/seeCrowd/see-crowd.html",
      controller: "seeCrowdController"
    })
    .state('app.about', {
      url: 'about',
      templateUrl: "js/about/about.html",
      controller: "aboutController"
    })
    .state('app.contact', {
      url: "contact",
      templateUrl: "js/contact/contact.html",
      controller: "contactController"
    });
});

app.controller('appController', ['$rootScope', '$scope', 'dbService',
  'identificationService', 'mapService', '$interval', 'langService',
  'configService', 'myconnection',
  function($rootScope, $scope, dbService, identificationService,
    mapService, $interval, langService, configService,
    myconnection) {

    langService.loadLangData();
    dbService.init();

    function initAppFncs() {
      identificationService.loadDeviceId(true).then(function() {
        var deviceId = identificationService.getDeviceId();
        $rootScope.device = {
          id: deviceId,
          positiveFeedback: 1,
          negativeFeedback: 0
        }
        dbService.retrieveDevice(deviceId).then(function(d) {
          if (!d) {
            dbService.insertDevice($rootScope.device);
          } else {
            $rootScope.device = {
              id: d.deviceId,
              positiveFeedback: d.positiveFeedback,
              negativeFeedback: d.negativeFeedback
            }
          }
        });
      });

      $rootScope.checkLocation = function() {
        mapService.checkCurrentLocation();
      };
      $rootScope.checkLocation();

      $interval(function() {
        if (!$rootScope.location.error) {
          $rootScope.checkLocation();
        }
      }, 10000);
    }

    $rootScope.connection = false;
    if (!myApp.isCordovaApp) {
      $rootScope.connection = true;
      initAppFncs();
    } else {
      myconnection.getConnectionType(function(connType) {
        if (connType === 'none') {
          ons.notification.alert({
            title: $rootScope.lang.ALERT.ALERT,
            message: 'No connection. App will shut down...',
            buttonLabel: $rootScope.lang.ALERT.OK,
            callback: function(answer) {
              navigator.app.exitApp(); // Close the app
            }
          });
        } else {
          $rootScope.connection = true;
          initAppFncs();
          myconnection.addConnectionListener(function() {
            //alert('connected');
          }, function() {
            ons.notification.alert({
              title: $rootScope.lang.ALERT.ALERT,
              message: 'Connection lost. App will shut down...',
              buttonLabel: $rootScope.lang.ALERT.OK,
              callback: function(answer) {
                navigator.app.exitApp(); // Close the app
              }
            });
          });
        }
      });
    }

    $scope.exitApp = function() {
      ons.notification.confirm({
        title: $rootScope.lang.CONFIRM.CONFIRM,
        message: $rootScope.lang.CONFIRM.QUIT_CONFIRM,
        buttonLabels: [$rootScope.lang.CONFIRM.CANCEL, $rootScope.lang
          .CONFIRM.OK
        ],
        callback: function(answer) {
          if (answer === 1) { // OK button
            navigator.app.exitApp(); // Close the app
          }
        }
      });
    };

    ons.setDefaultDeviceBackButtonListener(function() {
      $scope.exitApp();
    });
  }
]);
