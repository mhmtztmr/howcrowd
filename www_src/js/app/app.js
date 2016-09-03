var app = angular.module('app', ['ngCordova', 'onsen', 'seeCrowd.Model', 'setCrowd.Model',
    'seeCrowd.Service', 'setCrowd.Service', 'identification', 'map.Service', 'crowdDisplay.Service',
    'config', 'connection', 'feedback', 'date', 'lang', 'db', 'settings', 'location.Service', 'interface'
]);

app.run(['langService', 'dbService', 'settingsService', 'locationService', '$rootScope', function(langService, dbService, settingsService, locationService, $rootScope) {
    $rootScope.version = version;
    window.console.log('App running...');

    $rootScope.location = {};
    dbService.init();
    settingsService.loadSettings();

    function exitApp() {
        navigator.app.exitApp();
    }

    langService.loadLangData(function(){   
        locationService.checkLocationAvailability(function(){
            //location is enabled
            locationService.startLocationInterval();
        }, function(){
            locationService.openGPSDialog(function(){
                //turn gps on rejected
                exitApp();
            }, function(){
                //turn gps on skipped. not available now.
            }, function(){
                //turn gps on accepted, going to settings...
                window.console.log('gps settings initiazlied');
                var stillNotTurnedOn = 0;
                var locationAvailabilityInterval = setInterval(function(){
                    if(stillNotTurnedOn < 5) {
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
                }, 2000);
            });
        });
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
            if(menu._currentPageUrl === "templates/crowd.html") {
                if(crowdTabbar) {
                    //if not see crowd page
                    if(crowdTabbar.getActiveTabIndex() !== 1) {
                        crowdTabbar.setActiveTab(1);
                    }
                    else {
                        //if not see crowd list page
                        if(app.seeCrowdTabbar.getActiveTabIndex() !== 0) {
                            app.seeCrowdTabbar.setActiveTab(0);
                        }
                        else {
                            $rootScope.exitApp();
                        }
                    }
                }                
            }
        });
    });
}]);

app.controller('appController', ['$rootScope', '$scope', 'dbService',
    'identificationService', 'mapService', '$interval', 'langService',
    'configService', 'connection', 'feedbackModel', 'settingsService', '$cordovaGeolocation', 'INTERFACE',
    function($rootScope, $scope, dbService, identificationService,
        mapService, $interval, langService, configService,
        connection, feedbackModel, settingsService, $cordovaGeolocation, INTERFACE) {

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
        }

        INTERFACE.getConnectionType(function(connType) {
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
]);
