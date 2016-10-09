var app = angular.module('app', ['onsen', 'seeCrowd.Model', 'setCrowd.Model',
    'seeCrowd.Service', 'setCrowd.Service', 'identification', 'map.Service', 'crowdDisplay.Service',
    'config', 'feedback', 'date', 'lang', 'db', 'settings', 'location', 'interface'
]);

app.run(['langService', 'dbService', 'settingsService', 'locationService', '$rootScope', 'feedbackModel', 
    function(langService, dbService, settingsService, locationService, $rootScope, feedbackModel) {
    $rootScope.version = version;
    window.console.log('App running...');

    $rootScope.location = {};

    var dbPromise = dbService.init(),
    settingsPromise = settingsService.loadSettings(),
    langPromise = langService.loadLangData(),
    feedbackPromise = feedbackModel.loadFeedbacks();
    
    Promise.all([dbPromise, settingsPromise, langPromise, feedbackPromise]).then(function() {
        $rootScope.$emit('init');
        console.log('app run init');
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
    }, function() {
        console.log('app run init failed');
    });

    function exitApp() {
        navigator.app.exitApp();
    }

    $rootScope.exitApp = function() {
        menu.closeMenu();
        ons.notification.confirm({
            title: $rootScope.lang.CONFIRM.CONFIRM,
            message: $rootScope.lang.CONFIRM.QUIT_CONFIRM,
            modifier: 'material',
            buttonLabels: [$rootScope.lang.CONFIRM.CANCEL, $rootScope.lang.CONFIRM.OK
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

app.controller('appController', ['$rootScope', '$scope', 'identificationService', 'INTERFACE',
    function($rootScope, $scope, identificationService, INTERFACE) {

        function identifyDevice() {
            if(!$rootScope.deviceObject) {
                console.log('identifying device');
                identificationService.getDeviceObject().then(function(deviceObject) {
                    console.log('device identified');
                    $rootScope.deviceObject = deviceObject;
                }, function(e){
                    console.log('identification failed: ' + e);
                });
            }
        }

        function init() {
            var connectionType = INTERFACE.getConnectionType();
            if(connectionType  === 'none') {
                connectionLostDialog.show();
            }
            else {
                identifyDevice();
            }
            INTERFACE.registerConnectionOfflineEvent(function() {
                console.log('connection lost');
                connectionLostDialog.show();
            });
            INTERFACE.registerConnectionOnlineEvent(function() {
                console.log('connected');
                connectionLostDialog.hide();
                identifyDevice();
            });


            $rootScope.seePlaceDetail = function(place) {
                app.navi.pushPage('templates/crowd-place-detail.html', {
                  selectedPlace: place, 
                  animation:'lift'
                });
            };
        }

        var unbindHandler = $rootScope.$on('init', function () {
            init();
            unbindHandler();
        });
    }
]);
