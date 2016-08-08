var app = angular.module('app', ['ngCordova', 'onsen', 'seeCrowd.Model', 'setCrowd.Model',
    'seeCrowd.Service', 'identification', 'map.Model', 'map.Service',
    'config', 'connection', 'feedback', 'date', 'lang', 'db', 'settings', 'location.Service'
]);

app.run(['langService', 'dbService', 'settingsService', 'locationService', '$rootScope', function(langService, dbService, settingsService, locationService, $rootScope) {
    langService.loadLangData();
    dbService.init();
    settingsService.loadSettings();

    function exitApp() {
        navigator.app.exitApp();
    }

    $rootScope.location = {};
    locationService.checkLocationAvailability(function(){
        //location is enabled
        locationService.startLocationInterval();
    }, function(){
        locationService.openLocationDialog(function(){
            //turn gps on rejected
            exitApp();
        }, function(){
            //turn gps on skipped. not available now.
        }, function(){
            //turn gps on accepted, going to settings...
            console.log('gps settings initiazlied');
            var stillNotTurnedOn = 0;
            var locationAvailabilityInterval = setInterval(function(){
                if(stillNotTurnedOn < 3) {
                    console.log('gps not turned on: ' + stillNotTurnedOn + ', checking location availability...');
                    locationService.checkLocationAvailability(function(){
                        console.log('location now available. clearing hard check interval...reseting counter...starting location interval');
                        stillNotTurnedOn = 0;
                        clearInterval(locationAvailabilityInterval);
                        locationService.startLocationInterval();
                    }, function(){
                        console.log('location not available. incrementing counter...');
                        stillNotTurnedOn++;
                    });
                }
                else {
                    console.log('counter exceeded. clearing hard check interval...reseting counter...starting location interval');
                    stillNotTurnedOn = 0;
                    clearInterval(locationAvailabilityInterval);
                    locationService.startLocationInterval();
                }
            }, 3000);
        });
    }, function(){
        //TODO: location availability check failure...
    });

    $rootScope.exitApp = function() {
        menu.closeMenu();
        ons.notification.confirm({
            title: $rootScope.lang.CONFIRM.CONFIRM,
            message: $rootScope.lang.CONFIRM.QUIT_CONFIRM,
            modifier: 'material',
            buttonLabels: [$rootScope.lang.CONFIRM.CANCEL, $rootScope.lang
                .CONFIRM.OK
            ],
            callback: function(answer) {
                if (answer === 1) { // OK button
                    exitApp();
                }
            }
        });
    };

    ons.ready(function() {
        ons.setDefaultDeviceBackButtonListener(function() {
            $rootScope.exitApp();
        });
    });
}]);

app.controller('appController', ['$rootScope', '$scope', 'dbService',
    'identificationService', 'mapService', '$interval', 'langService',
    'configService', 'connection', 'feedbackModel', 'settingsService', '$cordovaGeolocation',
    function($rootScope, $scope, dbService, identificationService,
        mapService, $interval, langService, configService,
        connection, feedbackModel, settingsService, $cordovaGeolocation) {

        function initAppFncs() {
            feedbackModel.loadFeedbacks();
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

            // $interval(function() {
            //     if (!$rootScope.location.error && myApp.isCordovaApp) {
            //         //if (myApp.isCordovaApp) {
            //         $rootScope.checkLocation();
            //     }
            // }, 5000);
        }

        if (!myApp.isCordovaApp) {
            initAppFncs();
        } else {
            connection.getConnectionType(function(connType) {
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
                    initAppFncs();
                    connection.addConnectionListener(function() {
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
    }
]);
