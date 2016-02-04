var app = angular.module('app', ['onsen', 'ui.router', 'seeCrowd', 'setCrowd',
  'contact', 'about', 'db', 'device.id', 'map.Service', 'lang',
  'config'
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
  'configService',
  function($rootScope, $scope, dbService, identificationService,
    mapService, $interval, langService, configService) {

    $rootScope.checkLocation = function() {
      mapService.checkCurrentLocation();
    };
    dbService.init();
    $rootScope.checkLocation();
    $interval(function() {
      if (!$rootScope.location.error) {
        $rootScope.checkLocation();
      }
    }, 10000);

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

    langService.loadLangData();

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
