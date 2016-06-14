var app = angular.module('app', ['onsen', 'seeCrowd.Model', 'setCrowd.Model',
    'seeCrowd.Service', 'identification', 'map.Model', 'map.Service',
    'config', 'connection', 'feedback', 'date', 'lang', 'db', 'settings'
]);

app.controller('appController', ['$rootScope', '$scope', 'dbService',
    'identificationService', 'mapService', '$interval', 'langService',
    'configService', 'connection', 'feedbackModel', 'settingsService',
    function($rootScope, $scope, dbService, identificationService,
        mapService, $interval, langService, configService,
        connection, feedbackModel, settingsService) {

        langService.loadLangData();
        dbService.init();
        settingsService.loadSettings();

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

            $rootScope.checkLocation = function() {
                mapService.checkCurrentLocation();
            };
            $rootScope.checkLocation();

            $interval(function() {
                if (!$rootScope.location.error && myApp.isCordovaApp) {
                    //if (myApp.isCordovaApp) {
                    $rootScope.checkLocation();
                }
            }, 5000);
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

        $scope.exitApp = function() {
            ons.notification.confirm({
                title: $rootScope.lang.CONFIRM.CONFIRM,
                message: $rootScope.lang.CONFIRM.QUIT_CONFIRM,
                modifier: 'material',
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

        // ons.setDefaultDeviceBackButtonListener(function() {
        //     $scope.exitApp();
        // });
    }
]);
