var app = angular.module('app', ['ngCordova', 'onsen', 'seeCrowd.Model', 'setCrowd.Model',
    'seeCrowd.Service', 'setCrowd.Service', 'identification', 'map.Service', 'crowdDisplay.Service',
    'config', 'connection', 'feedback', 'date', 'lang', 'db', 'settings', 'location.Service', 'interface'
]);

app.run(['langService', 'dbService', 'settingsService', 'locationService', '$rootScope', function(langService, dbService, settingsService, locationService, $rootScope) {
    window.console.log('App running...');

    alert("APP RUN...");
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

    // ons.ready(function() {
    //     ons.setDefaultDeviceBackButtonListener(function() {
    //         $rootScope.exitApp();
    //     });
    // });
}]);

app.controller('appController', ['$rootScope', '$scope', 'dbService',
    'identificationService', 'mapService', '$interval', 'langService',
    'configService', 'connection', 'feedbackModel', 'settingsService', '$cordovaGeolocation', 'INTERFACE',
    function($rootScope, $scope, dbService, identificationService,
        mapService, $interval, langService, configService,
        connection, feedbackModel, settingsService, $cordovaGeolocation, INTERFACE) {

        alert("APP CONTROLLER...");

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

app.controller('aboutController', ['$scope', function($scope) {
}]);

app.controller('reportIssueController', ['$scope', function($scope) {
	$scope.reportIssue = function(issueDescription){
		var subject = issueDescription.substring(0, Math.min(10, issueDescription.length)) + "...";
	    // prepare message bodies (plain and html) and attachment
	    var bodyParts = new Bodyparts();
	    // bodyParts.textmessage = "Check out this awesome code generation result";
	    bodyParts.htmlmessage = "<b>" + issueDescription + "</b>";
	    var attachments = [];
	    Backendless.Messaging.sendEmail( "[CROWD] " + subject, bodyParts, [ "mahmutoztemur@gmail.com" ], attachments );
	    menu.setMainPage('templates/see-crowd.html');
	};
}]);

app.controller('crowdPlaceDetailController', ['$scope', 'mapService', '$timeout',

  function($scope, mapService, $timeout) {
    $scope.selectedPlaceBasedCrowd = app.navi.topPage.pushedOptions.selectedPlaceBasedCrowd;
    var boundingBox = mapService.getBoundingBox($scope.selectedPlaceBasedCrowd.crowdLocation, 0.1);
    $timeout(function(){
	    var map = mapService.initMap('single-map', boundingBox.latitude.lower,
	      boundingBox.longitude.lower, boundingBox.latitude.upper,
	      boundingBox.longitude.upper);

	    mapService.markPlaceOnMap(map, $scope.selectedPlaceBasedCrowd,
	      function() {});
	},100);
  }
]);

app.controller('seeCrowdController', ['$rootScope', '$scope', '$filter',
    'seeCrowdModel', 'dateService', 'mapService', '$timeout',
    function($rootScope, $scope, $filter, seeCrowdModel, dateService, mapService, $timeout) {
        var placeBasedCrowdsArray, tab = 'list';
        $scope.crowds = 'pending';

        function loadCrowds(success, fail){
            seeCrowdModel.loadCrowds(function(pbca) {
                placeBasedCrowdsArray = pbca;
                $scope.crowds = $filter('orderBy')(placeBasedCrowdsArray, ['distanceGroup', 'crowdLast.lastUpdatePass']);
                if(tab === 'map'){
                    loadMap();
                }
                if(success) success();
            }, fail);
        }

        function loadMap(){
            seeCrowdModel.loadMap();
        }

        function clearMap() {
            seeCrowdModel.clearMap();
        }

        $scope.refreshCrowds = function($done) {
            clearMap();
            if($scope.crowds === 'pending' || $scope.crowds === undefined) {
                if($done) $done();
            }
            if($rootScope.location.latitude) {
                loadCrowds($done);
            }
            else if($scope.crowds !== 'pending' && $scope.crowds !== undefined){
                $scope.crowds = undefined;
                $scope.$apply();
                if($done) $done();
            }
        };

        if($rootScope.location.latitude) {
            loadCrowds();
        }

        $scope.showMap = function(){
            tab = 'map';
            if($scope.crowds instanceof Array) {
                loadMap();
            }
        };
        $scope.showList = function(){
            tab = 'list';
        };

        $scope.$on('$destroy', $rootScope.$on("locationChanged", function(event, args) {
            //pending or undefined
            if(!($scope.crowds instanceof Array)) {
                clearMap();
                if($rootScope.location.latitude) {
                    $scope.crowds = 'pending';
                    loadCrowds();
                }
                else {
                    $scope.crowds = undefined;
                    $scope.$apply();
                }
            }
        }));

        $scope.selectPlaceBasedCrowd = function(placeBasedCrowd) {
            seeCrowdModel.selectPlaceBasedCrowd(placeBasedCrowd);
        };

        $scope.searchStatus = {started : false};
        $scope.startSearch = function(){
            $scope.searchStatus.started = true;
            setTimeout(function(){
                document.getElementById('search-input').focus();
            }, 100);
        };
        $scope.searchInput = {value: ''};
        $scope.stopSearch = function() {
            $scope.clearSearchInput();
            $scope.searchStatus.started = false;
        };

        $scope.searchInputChange = function() {
            if ($scope.searchInput.value.length > 1) {
                $scope.crowds = $filter('filter')(placeBasedCrowdsArray, $scope.searchInput.value);
            } else {
                $scope.crowds = placeBasedCrowdsArray;
            }
            $scope.crowds = $filter('orderBy')($scope.crowds, ['distanceGroup', 'crowdLast.lastUpdatePass']);
        };
        $scope.clearSearchInput = function(){
            $scope.searchInput.value = '';
            $scope.searchInputChange();
        };
       
        $scope.MyDelegate = {
            configureItemScope: function(index, itemScope) {
                itemScope.item = $scope.crowds[index];
            },
            calculateItemHeight: function(index) {
                return 88;
            },
            countItems: function() {
                return $scope.crowds.length;
            }
        };
    }
]);

app.controller('seeCrowdDetailController', ['$rootScope', '$scope',
  'seeCrowdModel', 'feedbackModel', 'seeCrowdService',
  function($rootScope, $scope, seeCrowdModel,
    feedbackModel, seeCrowdService) {
    $scope.selectedPlaceBasedCrowd = seeCrowdModel.getSelectedPlaceBasedCrowd();
    var lastCrowd = $scope.selectedPlaceBasedCrowd.crowds[0];
    var myFeedback = feedbackModel.getFeedback(lastCrowd.crowdId);
    if (myFeedback) {
      $scope.myFeedback = myFeedback.isPositive;
    }

    $scope.givePositiveFeedback = function() {
      giveFeedback(true);
    };

    $scope.giveNegativeFeedback = function() {
      giveFeedback(false);
    };

    function giveFeedback(isPositive) {
      if ($scope.myFeedback === undefined) {
        var crowd = $scope.selectedPlaceBasedCrowd.crowds[0];
        if (crowd.deviceId === $rootScope.device.id) {
          return;
        }
        $scope.myFeedback = isPositive;
        if (isPositive) {
          $scope.selectedPlaceBasedCrowd.crowds[0].crowdFeedback.positiveFeedback++;
        } else {
          $scope.selectedPlaceBasedCrowd.crowds[0].crowdFeedback.negativeFeedback++;
        }
        seeCrowdModel.giveFeedback(crowd, isPositive,
          function() {
            feedbackModel.insertFeedback(crowd.crowdId, isPositive);
          },
          function() {
            $scope.myFeedback = undefined;
            if (isPositive) {
              $scope.selectedPlaceBasedCrowd.crowds[0].crowdFeedback.positiveFeedback--;
            } else {
              $scope.selectedPlaceBasedCrowd.crowds[0].crowdFeedback.negativeFeedback--;
            }
          });
      }
    }

    $scope.dialogs = {
      'templates/share-crowd.html': {},
      'templates/report-crowd.html': {}
    };
    ons.createDialog('templates/share-crowd.html',  {
      parentScope: $scope
    }).then(
    function(
      dialog) {
      $scope.dialogs['templates/share-crowd.html'] = dialog;
    });
    ons.createDialog('templates/report-crowd.html',  {
      parentScope: $scope
    }).then(
    function(
      dialog) {
      $scope.dialogs['templates/report-crowd.html'] = dialog;
    });

    ons.createPopover('templates/popover.html', {
      parentScope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });
    $scope.options = [{
      label: $rootScope.lang.SEE_CROWD_DETAIL_POPOVER_MENU.INFO,
      fnc: function() {
        app.navi.pushPage('templates/crowd-place-detail.html', {
          selectedPlaceBasedCrowd: $scope.selectedPlaceBasedCrowd, 
          animation:'lift'
        });
      }
    }, {
      label: $rootScope.lang.SEE_CROWD_DETAIL_POPOVER_MENU.SHARE,
      fnc: function() {
        var placeName = $scope.selectedPlaceBasedCrowd.placeName,
        lastUpdateDate = new Date($scope.selectedPlaceBasedCrowd.crowdLast.crowdDate).toLocaleString(),
        averageValue = $scope.selectedPlaceBasedCrowd.crowdAverage;

        window.plugins.socialsharing.share(placeName + ' [' + lastUpdateDate + ']\n' +
            $rootScope.lang.SEE_CROWD_MENU.AVERAGE_VALUE + ': ' + averageValue + '%'); 

      }
    }];
    if ($scope.selectedPlaceBasedCrowd.placeSource === 'custom') {
      $scope.options.push({
        label: $rootScope.lang.SEE_CROWD_DETAIL_POPOVER_MENU.REPORT,
        fnc: function() {
          $scope.dialogs['templates/report-crowd.html'].show();
        }
      });
    }

    $scope.reportReasons = [{
      label: $rootScope.lang.CROWD_REPORT_MENU.INAPPROPRIATE,
      value: 'inappropriate'
    }, {
      label: $rootScope.lang.CROWD_REPORT_MENU.PRIVATE,
      value: 'private'
    }, {
      label: $rootScope.lang.CROWD_REPORT_MENU.MISLEADING,
      value: 'misleading'
    }];

    $scope.report = function() {
      seeCrowdService.reportCrowd($scope.selectedPlaceBasedCrowd.crowds[
        0], $scope.reportReason);
      app.navi.resetToPage('templates/see-crowd.html');
    };

    $scope.reportReason = $scope.reportReasons[0].value;
  }
]);

app.controller('setCrowdController', ['$rootScope', '$scope', '$timeout', 'mapService', 'setCrowdModel', '$filter',
    function($rootScope, $scope, $timeout, mapService, setCrowdModel, $filter) {

        var nearbyPlaces;
        $scope.nearbyPlaces = 'pending';

        function loadNearbyPlaces(success, fail){
            setCrowdModel.loadNearbyPlaces().then(
                function(nbp) {
                    nearbyPlaces = nbp;
                    $scope.nearbyPlaces = nbp;
                    if(success) success();
                }, fail);
        }

        $scope.refreshNearbyPlaces = function($done) {
            if($scope.nearbyPlaces === 'pending' || $scope.nearbyPlaces === undefined) {
                if($done) $done();
            }
            if($rootScope.location.latitude) {
                loadNearbyPlaces($done);
            }
            else if($scope.nearbyPlaces !== 'pending' && $scope.nearbyPlaces !== undefined){
                $scope.nearbyPlaces = undefined;
                $scope.$apply();
                if($done) $done();
            }
        };

        if($rootScope.location.latitude) {
            loadNearbyPlaces();
        }

        $scope.$on('$destroy', $rootScope.$on("locationChanged", function(event, args) {
            //pending or undefined
            if(!($scope.nearbyPlaces instanceof Array)) {
                if($rootScope.location.latitude) {
                    $scope.nearbyPlaces = 'pending';
                    loadNearbyPlaces();
                }
                else {
                    $scope.nearbyPlaces = undefined;
                    $scope.$apply();
                }
            }
        }));


        $scope.selectPlace = function(place) {
            setCrowdModel.selectPlace(place);
        };

        $scope.searchStatus = {started : false};
        $scope.startSearch = function(){
            $scope.searchStatus.started = true;
            setTimeout(function(){
                document.getElementById('search-input').focus();
            }, 100);
        };
        $scope.searchInput = {value: ''};
        $scope.stopSearch = function() {
            $scope.clearSearchInput();
            $scope.searchStatus.started = false;
        };

        $scope.searchInputChange = function() {
            if ($scope.searchInput.value.length > 1) {
                $scope.nearbyPlaces = $filter('filter')(
                    nearbyPlaces, $scope.searchInput.value);
            } else {
                $scope.nearbyPlaces = nearbyPlaces;
            }
        };
        $scope.clearSearchInput = function(){
            $scope.searchInput.value = '';
            $scope.searchInputChange();
        };
    }
]);

app.controller('setCrowdLevelController', ['$rootScope', '$scope',
  'setCrowdModel', 'setCrowdService', 'guidService', 'dateService', 'mapService', 'crowdDisplayService', 'INTERFACE',
  function($rootScope, $scope, setCrowdModel, setCrowdService, guidService, dateService, mapService, crowdDisplayService, INTERFACE) {

    $scope.levels = [{
      value: 95,
      text: crowdDisplayService.getCrowdDisplayText(95)
    }, {
      value: 70,
      text: crowdDisplayService.getCrowdDisplayText(70)
    }, {
      value: 50,
      text: crowdDisplayService.getCrowdDisplayText(50)
    }, {
      value: 30,
      text: crowdDisplayService.getCrowdDisplayText(30)
    }, {
      value: 5,
      text: crowdDisplayService.getCrowdDisplayText(5)
    }];

    $scope.selectedPlace = setCrowdModel.getSelectedPlace();

    $scope.insertCrowd = function(crowdValue, customPlaceName) {
      if($scope.crowdPhoto){
          var fileName = $rootScope.device.id + (new Date()).valueOf() + '.png';
          setCrowdService.uploadFile($scope.crowdPhoto, fileName, function(photoUrl){
              insertCrowd(photoUrl.data);
          }, function(){
               ons.notification.alert({
                  title: $rootScope.lang.ALERT.ALERT,
                  message: $rootScope.lang.ALERT.FAIL,
                  buttonLabel: $rootScope.lang.ALERT.OK,
                });
          });
      }
      else {
        insertCrowd();
      }

      function insertCrowd(photoUrl) {
          var locationForCustomVicinity = $rootScope.location;
          if (!$scope.selectedPlace) {
            if (customPlaceName) {
              var id = guidService.get();
              var source = 'custom';
              $scope.selectedPlace = {
                sid: id,
                name: customPlaceName,
                location: $rootScope.location,
                source: source
              };
            } else {
              $scope.selectedPlace = undefined;
              return;
            }
          }

          if ($scope.selectedPlace && crowdValue && $rootScope.device) {
            var place = $scope.selectedPlace;
            place.key = $scope.selectedPlace.source +
              '|' + $scope.selectedPlace.sid;
            delete place['$$hashKey'];
            var crowd = {
              value: crowdValue,
              date: dateService.getDBDate(new Date()),
              agree: 1,
              disagree: 0,
              photo: photoUrl
            };

            //TODO: To be discussed if needed or not
            if($scope.selectedPlace.source !== 'custom') {
              locationForCustomVicinity = undefined;
            }

            mapService.getAddressByLocation(locationForCustomVicinity, function(vicinity){

                //TODO: To be discussed if needed or not
                if(vicinity) {
                  place.vicinity = vicinity;
                  place.district = vicinity;
                }
                setCrowdModel.insertCrowd(place, crowd, $rootScope.device,
                  function() {
                    ons.notification.alert({
                      title: $rootScope.lang.ALERT.ALERT,
                      message: $rootScope.lang.ALERT.SUCCESS,
                      buttonLabel: $rootScope.lang.ALERT.OK,
                    });
                  },
                  function() {
                    ons.notification.alert({
                      title: $rootScope.lang.ALERT.ALERT,
                      message: $rootScope.lang.ALERT.FAIL,
                      buttonLabel: $rootScope.lang.ALERT.OK,
                    });
                  });
            });

          }
      }
      
    };

    $scope.takePhoto= function(){
        INTERFACE.takePhoto(function(photoData){
            $scope.crowdPhoto = photoData;
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }, function(){

        });
    };
  }
]);

app.controller('settingsController', ['$scope', '$rootScope', 'settingsService', function($scope, $rootScope, settingsService) {

	//custom place
	$scope.isCustomPlacesEnabled = $rootScope.settings.isCustomPlacesEnabled;
	setTimeout(function(){document.getElementById('custom-place-switch').addEventListener('change', function(e) {
		settingsService.saveSettings();
	});},100);
}]);

app.controller('splashController', [function() {
    if (localStorage.getItem('skipTutorial')) {
        menu.setMainPage('templates/see-crowd.html');
    } else {
        menu.setMainPage('templates/about.html');
        localStorage.setItem('skipTutorial', true);
    }
}]);

var feedbackModel = function() {
  var myFeedbacks = {};

  function insertFeedback(crowdId, isPositive) {
    var myTempFeedbacks = {},
      feedbackId, now = (new Date()).getTime();
    if (Object.keys(myFeedbacks).length > 20) {
      for (feedbackId in myFeedbacks) {
        var feedback = myFeedbacks[feedbackId];
        var timeDiff = now - feedback.time;
        if (timeDiff < 3600000) {
          myTempFeedbacks[feedbackId] = myFeedbacks[feedbackId];
        }
      }
      myFeedbacks = myTempFeedbacks;
    }
    myFeedbacks[crowdId] = {
      time: now,
      isPositive: isPositive
    };
    saveFeedbacks();
  }

  function getFeedback(crowdId) {
    return myFeedbacks[crowdId];
  }

  function saveFeedbacks() {
    localStorage.setItem('feedbacks', angular.toJson(myFeedbacks));
  }

  function loadFeedbacks() {
    myFeedbacks = angular.fromJson(localStorage.getItem('feedbacks'));
    if (!myFeedbacks) {
      myFeedbacks = {};
    }
  }

  return {
    loadFeedbacks: loadFeedbacks,
    insertFeedback: insertFeedback,
    getFeedback: getFeedback
  };
};

angular.module('feedback', [])
  .factory('feedbackModel', feedbackModel);

angular.module('seeCrowd.Model', ['seeCrowd.Service', 'map.Service', 'date', 'location.Service', 'config'])
    .factory('seeCrowdModel', ['seeCrowdService', 'mapService',
        'configService', 'dateService', '$rootScope', 'locationService', function(seeCrowdService, mapService,
            configService, dateService, $rootScope, locationService) {
            var selectedPlaceBasedCrowd, placeBasedCrowdsArray = [], boundingBox,
            mapDivId = 'map', map, markers = [], reload = true;

            function loadCrowds(onSuccess, onFailure) {
                boundingBox = mapService.getBoundingBox($rootScope.location, 0.1);
                seeCrowdService.retrieveCrowds().then(function(results) {
                        onSuccess(loadPlaceBasedCrowds(results));
                    },
                    function() {
                        onFailure();
                    });
            }

            function loadPlaceBasedCrowds(crowds) {
                var i, crowd, crowdFeedbackMargin, now = new Date().getTime(), distance, placeBasedCrowds = {};
                placeBasedCrowdsArray = [];
                for (i = 0; i < crowds.length; i++) {
                    crowd = crowds[i];
                    crowd.lastUpdatePass = Math.round((now - crowd.crowdDate) / (1000 * 60));
                    if (!placeBasedCrowds[crowd.placeKey]) {
                        placeBasedCrowds[crowd.placeKey] = {
                            crowds: [],
                            crowdCount: 0,
                            crowdValue: 0
                        };
                    }
                    placeBasedCrowds[crowd.placeKey].crowdLocation = crowd.crowdLocation;
                    placeBasedCrowds[crowd.placeKey].placeName = crowd.placeName;
                    placeBasedCrowds[crowd.placeKey].placeSource = crowd.placeSource;
                    placeBasedCrowds[crowd.placeKey].placeDistrict = crowd.placeDistrict;
                    placeBasedCrowds[crowd.placeKey].placePhoto = crowd.placePhoto;
                    placeBasedCrowds[crowd.placeKey].placeDistance = 10;
                    if (!placeBasedCrowds[crowd.placeKey].crowdLast) {
                        placeBasedCrowds[crowd.placeKey].crowdLast = crowd;
                    }

                    //average algorithm including feedbacks
                    crowdFeedbackMargin = 1 + crowd.crowdFeedback.positiveFeedback - crowd.crowdFeedback.negativeFeedback
                    if(crowdFeedbackMargin > 0) {
                        placeBasedCrowds[crowd.placeKey].crowdCount += crowdFeedbackMargin;
                        placeBasedCrowds[crowd.placeKey].crowdValue += crowdFeedbackMargin * crowd.crowdValue;
                    }
                    placeBasedCrowds[crowd.placeKey].crowdAverage = Math.round(
                        placeBasedCrowds[crowd.placeKey].crowdValue / placeBasedCrowds[
                            crowd.placeKey].crowdCount);
                    placeBasedCrowds[crowd.placeKey].crowds.push(crowd);

                    //here algorithm
                    if($rootScope.location.latitude) {
                        distance = locationService.getDistanceBetweenLocations($rootScope.location, crowd.crowdLocation);
                        if(distance > configService.NEARBY_DISTANCE) {
                            placeBasedCrowds[crowd.placeKey].distanceGroup = 10; //not here
                        }
                        else {
                            placeBasedCrowds[crowd.placeKey].distanceGroup = 0; //here
                        }
                    }
                }
                placeBasedCrowdsArray = Object.keys(placeBasedCrowds).map(function(key) {
                    return placeBasedCrowds[key];
                });
                return placeBasedCrowdsArray;
            }

            function markPlaces() {
                var placeBasedCrowd, i;
                for (i = 0; i < placeBasedCrowdsArray.length; i++) {
                    placeBasedCrowd = placeBasedCrowdsArray[i];
                    (function(placeBasedCrowd) {
                        markers.push(mapService.markPlaceOnMap(map, placeBasedCrowd,
                            function() {
                                selectPlaceBasedCrowd(placeBasedCrowd);
                            })
                        );
                    })(placeBasedCrowd);
                }
            }

            function clearMap(){
                for (var i = 0; i < markers.length; i++ ) {
                    markers[i].setMap(null);
                }
                markers.length = 0;
                reload = true;
            }

            function loadMap() {
                if(!map) {
                    setTimeout(function(){
                        map = mapService.initMap(mapDivId, boundingBox.latitude.lower, boundingBox.longitude.lower, boundingBox.latitude.upper, boundingBox.longitude.upper);
                        markPlaces();
                        reload = false;
                    }, 100);
                }
                else if(reload && markers.length === 0) {
                    mapService.setMapBoundingBox(map, boundingBox.latitude.lower, boundingBox.longitude.lower, boundingBox.latitude.upper, boundingBox.longitude.upper);
                    markPlaces();
                    reload = false;
                }
            }

            function selectPlaceBasedCrowd(placeBasedCrowd) {
                selectedPlaceBasedCrowd = placeBasedCrowd;
                if (placeBasedCrowd) {
                    app.navi.pushPage('templates/see-crowd-detail.html', {animation:'lift'});
                }
            }

            function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
                seeCrowdService.giveFeedback(crowd, isPositive, onSuccess, onFailure);
            }

            function getSelectedPlaceBasedCrowd() {
                return selectedPlaceBasedCrowd;
            }

            return {
                loadCrowds: loadCrowds,
                loadMap: loadMap,
                clearMap: clearMap,
                selectPlaceBasedCrowd: selectPlaceBasedCrowd,
                getSelectedPlaceBasedCrowd: getSelectedPlaceBasedCrowd,
                giveFeedback: giveFeedback
            };
        }
    ]);
var setCrowdModel = function($q, setCrowdService, mapService) {
    var selectedPlace;

    function insertCrowd(place, crowd, device, onSuccess, onFailure) {
        setCrowdService.insertCrowd(place, crowd, device, onSuccess, onFailure);
    }

    function selectPlace(place) {
        selectedPlace = place;
        app.navi.pushPage('templates/set-crowd-level.html', {animation: 'lift'});
    }

    function getSelectedPlace() {
        return selectedPlace;
    }

    function loadNearbyPlaces() {
        var def = $q.defer(), nearbyPlaces = [],
            servicePromiseArray = [],
            services = [mapService, setCrowdService];

        angular.forEach(services, function(value, key) {
            servicePromiseArray.push(value.retrieveNearbyPlaces().then(
                function(entries) {
                    if(entries && entries.length > 0) {
                        Array.prototype.push.apply(nearbyPlaces,entries);
                    }
                }));
        });

        $q.all(servicePromiseArray).then(function() {
            def.resolve(nearbyPlaces);
        },
        function() {
            def.reject();
        });
        return def.promise;
    }

    return {
        insertCrowd: insertCrowd,
        selectPlace: selectPlace,
        getSelectedPlace: getSelectedPlace,
        loadNearbyPlaces: loadNearbyPlaces
    };
};

angular.module('setCrowd.Model', ['setCrowd.Service', 'map.Service'])
  .factory('setCrowdModel', ['$q', 'setCrowdService', 'mapService',
    setCrowdModel
  ]);

var backendlessService = function($rootScope, $q, crowdRest, formatterService, FileUploader) {

    function init() {
        var APPLICATION_ID = 'A556DD00-0405-02E1-FFF4-43454755FC00',
            JS_SECRET_KEY = '98B3E3B5-F807-2E77-FF87-8A7D553DE200',
            VERSION = 'v1'; //default application version;
        Backendless.initApp(APPLICATION_ID, JS_SECRET_KEY, VERSION);
    }

    /******* DB Models */
    function Crowd(args) {
        args = args || {};
        this.deviceId = args.deviceId || "";
        this.deviceReliability = args.deviceReliability || 1;
        this.placeKey = args.placeKey || "";
        this.placeName = args.placeName || "";
        this.placeSource = args.placeSource || "";
        this.placeSid = args.placeSid || "";
        this.crowdValue = args.crowdValue || "";
        this.crowdDate = args.crowdDate || "";
        this.crowdPhoto = args.crowdPhoto || "";
        this.crowdLocationLatitude = args.crowdLocationLatitude || "";
        this.crowdLocationLongitude = args.crowdLocationLongitude || "";
        this.crowdPositiveFeedback = args.crowdPositiveFeedback || 0;
        this.crowdNegativeFeedback = args.crowdNegativeFeedback || 0;
        this.crowdReportReason = args.crowdReportReason || '';
        this.placeVicinity = args.placeVicinity || '';
        this.placeDistrict = args.placeDistrict || '';
        this.placePhoto = args.placePhoto || '';
    }

    function Device(args) {
        args = args || {};
        this.deviceId = args.deviceId || "";
        this.positiveFeedback = args.positiveFeedback || 1;
        this.negativeFeedback = args.negativeFeedback || 0;
    }

    function Place(args) {
        args = args || {};
        this.placeKey = args.placeKey || "";
        this.placeName = args.placeName || "";
        this.placeSource = args.placeSource || "";
        this.placeSid = args.placeSid || "";
        this.placeLocationLatitude = args.placeLocationLatitude || "";
        this.placeLocationLongitude = args.placeLocationLongitude || "";
        this.placeVicinity = args.placeVicinity || '';
        this.placeDistrict = args.placeDistrict || '';
        this.placePhoto = args.placePhoto || '';
    }
    /* DB Models ******/

    function insertCrowd(place, crowd, device, onSuccess, onFailure) {
        var crowds = Backendless.Persistence.of(Crowd);
        var crowdObject = new Crowd({
            deviceId: device.id,
            deviceReliability: device.positiveFeedback / (device.positiveFeedback +
                device.negativeFeedback),
            placeKey: place.key,
            placeName: place.name,
            placeSource: place.source,
            placeSid: place.sid,
            crowdValue: crowd.value,
            crowdDate: crowd.date,
            crowdPhoto: crowd.photo,
            crowdLocationLatitude: place.location.latitude,
            crowdLocationLongitude: place.location.longitude,
            placeVicinity: place.vicinity,
            placeDistrict: place.district,
            placePhoto: place.photo
        });
        crowds.save(crowdObject, new Backendless.Async(onSuccess, onFailure));
    }

    function insertDevice(device, onSuccess, onFailure) {
        var devices = Backendless.Persistence.of(Device);
        var deviceObject = new Device({
            deviceId: device.id,
            positiveFeedback: device.positiveFeedback,
            negativeFeedback: device.negativeFeedback
        });
        devices.save(deviceObject, new Backendless.Async(onSuccess, onFailure));
    }

    function retrieveDevice(deviceId) {
        var def = $q.defer();
        var devices = Backendless.Persistence.of(Device);
        var query = new Backendless.DataQuery();
        query.condition = "deviceId = '" + deviceId + "'";
        devices.find(query, new Backendless.Async(function(result) {
            if (result.data.length > 0) {
                def.resolve(result.data[0]);
            } else {
                def.resolve(undefined);
            }
        }, function(error) {
            def.resolve(undefined);
        }));
        return def.promise;
    }

    function retrieveCrowdsAndFormat(filter, formatterFunction) {
        var def = $q.defer();
        var q = '1 = 1', j;

        if (filter) {
            if (filter.date) {
                if (filter.date.start) {
                    q += ' and crowdDate >= ' + filter.date.start.valueOf();
                }
                if (filter.date.end) {
                    q += ' and crowdDate <= ' + filter.date.end.valueOf();
                }

                if (filter.location && filter.location.latitude && filter.location.latitude
                    .upper && filter.location.latitude.lower && filter.location.longitude &&
                    filter.location.longitude.upper && filter.location.longitude.lower
                ) {
                    q += ' and crowdLocationLatitude >= ' + filter.location.latitude.lower;
                    q += ' and crowdLocationLatitude <= ' + filter.location.latitude.upper;
                    q += ' and crowdLocationLongitude >= ' + filter.location.longitude.lower;
                    q += ' and crowdLocationLongitude <= ' + filter.location.longitude.upper;
                }
            }
            if(filter.sources && filter.sources.length > 0) {
                q += ' and (';
                for (j = 0; j < filter.sources.length; j++) {
                    q += " placeSource = '" + filter.sources[j] + "'";
                    if(j !==  filter.sources.length - 1) {
                        q += " or ";
                    }
                }
                q += ")";
            }
        }

        q += " and (crowdReportReason is null or crowdReportReason = '')";

        if ($rootScope.settings.isCustomPlacesEnabled !== true) {
          q += " and placeSource != 'custom'";
        }

        var query = new Backendless.DataQuery();
        query.options = {
            sortBy: 'crowdDate desc',
            pageSize: 100
        };
        query.condition = q;

        var crowds = Backendless.Persistence.of(Crowd);
        crowds.find(query, new Backendless.Async(function(result) {
            var i, formattedResults = [];
            for (i = 0; i < result.data.length; i++) {
                formattedResults.push(formatterFunction(result.data[
                    i]));
            }
            var nextPage = result._nextPage;
            while (nextPage) {
                result = result.nextPage();
                for (i = 0; i < result.data.length; i++) {
                    formattedResults.push(formatterFunction(
                        result.data[i]));
                }
                nextPage = result._nextPage;
            }
            def.resolve(formattedResults);
        }, function(error) {
            def.reject();
        }));

        return def.promise;
    }

    function retrieveCrowds(filter) {
        return retrieveCrowdsAndFormat(filter, formatterService.formatCrowdToSee);
    }

    function retrieveNearbyPlaces(filter) {
        var def = $q.defer(),
            uniquePlaces = {};
        retrieveCrowdsAndFormat(filter, formatterService.formatPlaceToSet).then(function(entries) {
            for (i = 0; i < entries.length; i++) {
                uniquePlaces[entries[i].sid] = entries[i];
            }
            def.resolve(Object.keys(uniquePlaces).map(function(key) {
                return uniquePlaces[key]
            }));
        });
        return def.promise;
    }

    function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
        var counterName = "counter for " + crowd.crowdId + (isPositive ?
            "positive" : "negative") + " feedback";
        var successCallback = function(response) {
            console.log("[ASYNC] counter value is - " + response);
            var crowdStorage = Backendless.Persistence.of(Crowd);
            var dbCrowd = crowdStorage.findById(crowd.crowdId);
            if (isPositive) {
                dbCrowd.crowdPositiveFeedback = response;
            } else {
                dbCrowd.crowdNegativeFeedback = response;
            }
            crowdStorage.save(dbCrowd);
            onSuccess();
        };

        var failureCallback = function(fault) {
            console.log("error - " + fault.message);
            onFailure();
        };

        var callback = new Backendless.Async(successCallback, failureCallback);
        var myCounter = Backendless.Counters.of(counterName);
        // async call
        myCounter.incrementAndGet(callback);
    }

    function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
        crowdRest.update({
            placeKey: crowd.placeKey
        }, {
            crowdReportReason: reportReason
        });
    }

    function uploadFile(base64Source, fileName, onSuccess, onFailure){
        FileUploader.upload('crowd-photos', fileName, base64Source, onSuccess, onFailure);
    }

    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
    }

    return {
        init: init,
        insertCrowd: insertCrowd,
        retrieveCrowds: retrieveCrowds,
        giveFeedback: giveFeedback,
        insertDevice: insertDevice,
        retrieveDevice: retrieveDevice,
        //insertPlace: insertPlace,
        reportCrowd: reportCrowd,
        retrieveNearbyPlaces: retrieveNearbyPlaces,
        uploadFile: uploadFile
    };
};

angular.module('backendless', ['rest', 'formatter'])
    .factory('backendlessService', ['$rootScope', '$q', 'crowdRest', 'formatterService', 'FileUploader', backendlessService]);

var formatterService = function() {

  function formatCrowdToSee(crowd) {
    return {
      deviceId: crowd.deviceId,
      placeKey: crowd.placeKey,
      placeName: crowd.placeName,
      placeSource: crowd.placeSource,
      placeSid: crowd.placeSid,
      crowdId: crowd.objectId,
      crowdLocation: {
        latitude: crowd.crowdLocationLatitude,
        longitude: crowd.crowdLocationLongitude
      },
      crowdValue: crowd.crowdValue,
      crowdDate: crowd.crowdDate,
      crowdPhoto: crowd.crowdPhoto,
      crowdFeedback: {
        positiveFeedback: crowd.crowdPositiveFeedback,
        negativeFeedback: crowd.crowdNegativeFeedback
      },
      placeVicinity: crowd.placeVicinity,
      placeDistrict: crowd.placeDistrict,
      placePhoto: crowd.placePhoto
    };
  }

  function formatPlaceToSet(crowd) {
    return {
      sid:crowd.placeSid,
      name: crowd.placeName,
      location: {
        latitude: crowd.crowdLocationLatitude,
        longitude: crowd.crowdLocationLongitude
      },
      source: crowd.placeSource,
      vicinity: crowd.placeVicinity,
      district: crowd.placeDistrict,
      photo: crowd.placePhoto
    };
  }

  return {
    formatCrowdToSee: formatCrowdToSee,
    formatPlaceToSet: formatPlaceToSet
  };
};

angular.module('formatter', [])
  .factory('formatterService', [formatterService]);

var configService = function() {
  return {
    NEARBY_DISTANCE: 0.03, //km
    FAR_DISTANCE: 15, //km => city
    NEARBY_TIME: 1 //hour
  };
};

angular.module('config', [])
  .factory('configService', configService);

var crowdDisplayService = function() {

  function getCrowdDisplayText(value){
      if(value <= 10) {
        return "Sinek avlıyor"
      }
      else if(value <= 40) {
        return "Sakin"
      }
      else if(value <= 60) {
        return "Normal"
      }
      else if(value <= 90) {
        return "Kalabalık"
      }
      else {
        return "Tıkılm tıklım"
      }
  }

  return {
    getCrowdDisplayText: getCrowdDisplayText
  };
};

angular.module('crowdDisplay.Service', [])
  .factory('crowdDisplayService', [crowdDisplayService]);

var seeCrowdService = function(dbService, configService, dateService, mapService) {

  //filter.date.start, filter.date.end,
  //filter.location.latitude.upper, filter.location.latitude.lower, filter.location.longitude.upper, filter.location.longitude.lower
  function retrieveCrowds() {

      function getFilter() {
          var now = dateService.getDBDate(new Date()),
          oneHourAgo = new Date(new Date(now).setHours(now.getHours() - configService.NEARBY_TIME)),
          boundingBox = mapService.getBoundingBox(angular.fromJson(localStorage.getItem('location')), configService.FAR_DISTANCE);

          return {
              date: {
                  start: oneHourAgo,
                  end: now
              },
              location: boundingBox
          };
      }
      return dbService.retrieveCrowds(getFilter());
  }

  function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
    dbService.giveFeedback(crowd, isPositive, onSuccess, onFailure);
  }

  function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
    dbService.reportCrowd(crowd, reportReason, onSuccess, onFailure);
  }

  return {
    retrieveCrowds: retrieveCrowds,
    giveFeedback: giveFeedback,
    reportCrowd: reportCrowd
  };
};

angular.module('seeCrowd.Service', ['db', 'config', 'date', 'map.Service'])
  .factory('seeCrowdService', ['dbService', 'configService', 'dateService', 'mapService', seeCrowdService]);

var setCrowdService = function($rootScope, dbService, dateService, mapService, configService) {

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    dbService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }

  function retrieveNearbyPlaces() {

    function getFilter() {
      var now = dateService.getDBDate(new Date()),
      oneHourAgo = new Date(new Date(now).setHours(now.getHours() - configService.NEARBY_TIME)),
      boundingBox = mapService.getBoundingBox(angular.fromJson(localStorage.getItem('location')), configService.NEARBY_DISTANCE);

      return {
        date: {
          start: oneHourAgo,
          end: now
        },
        location: boundingBox,
        sources: ['custom']
      };
    }

    return dbService.retrieveNearbyPlaces(getFilter());
  }

  function uploadFile(base64Source, fileName, onSuccess, onFailure){
    dbService.uploadFile(base64Source, fileName, onSuccess, onFailure);
  }

  return {
    insertCrowd: insertCrowd,
    retrieveNearbyPlaces: retrieveNearbyPlaces,
    uploadFile: uploadFile
  };
};

angular.module('setCrowd.Service', ['db', 'date', 'map.Service', 'config'])
  .factory('setCrowdService', ['$rootScope' ,'dbService', 'dateService', 'mapService', 'configService', setCrowdService]);

var dateService = function() {

	function getParseDate(date) {
		return new Date(date.toString() + " UTC");
	}

	function getBackendlessDate(date) {
		return date;
	}

	function getDBDate(date) {
		return getBackendlessDate(date);
	}

	return {
		getDBDate: getDBDate
	};
};

angular.module('date', [])
	.factory('dateService', [dateService]);

var dbService = function(backendlessService) {

  function init() {
    backendlessService.init();
    window.console.log('Backend initialized.');
  }

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    backendlessService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }

  // function insertPlace(place, onSuccess, onFailure) {
  //   backendlessService.insertPlace(place, onSuccess, onFailure);
  // }

  function retrieveDevice(deviceId) {
    return backendlessService.retrieveDevice(deviceId);
  }

  function insertDevice(device, onSuccess, onFailure) {
    backendlessService.insertDevice(device, onSuccess, onFailure);
  }

  function retrieveCrowds(filter) {
    return backendlessService.retrieveCrowds(filter);
  }

  function retrieveNearbyPlaces(filter) {
    return backendlessService.retrieveNearbyPlaces(filter);
  }

  function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
    backendlessService.giveFeedback(crowd, isPositive, onSuccess, onFailure);
  }

  function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
    backendlessService.reportCrowd(crowd, reportReason, onSuccess, onFailure);
  }

  function uploadFile(base64Source, fileName, onSuccess, onFailure){
    backendlessService.uploadFile(base64Source, fileName, onSuccess, onFailure);
  }

  return {
    init: init,
    insertCrowd: insertCrowd,
    retrieveCrowds: retrieveCrowds,
    giveFeedback: giveFeedback,
    insertDevice: insertDevice,
    retrieveDevice: retrieveDevice,
    //insertPlace: insertPlace,
    reportCrowd: reportCrowd,
    retrieveNearbyPlaces: retrieveNearbyPlaces,
    uploadFile: uploadFile
  };
};

angular.module('db', ['backendless'])
  .factory('dbService', ['backendlessService', dbService]);

var fileService = function(filesystem) {

  var dataFile = '.crwd';

  function writeData(data, onSuccess, onFailure) {
    filesystem.requestFileSystem(
      function(fs) {
        console.log('request file system done');
        fs.root.getFile(dataFile, {
          create: true,
          exclusive: false
        }, function(fileEntry) {
          console.log('file entry got');
          fileEntry.createWriter(function(writer) {
            console.log('file writer got');
            writer.onwriteend = function(evt) {
              console.log('data written');
              onSuccess();
            };
            writer.write(data);
          }, function(err) {
            console.log('file writer failed: ' + err.code);
            onFailure();
          });
        }, function(err) {
          console.log('file entry failed: ' + err.code);
          onFailure();
        });
      },
      function() {
        console.log('request file system failed');
        onFailure();
      }
    );
  }

  function readData(onSuccess, onFailure) {
    filesystem.requestFileSystem(
      function(fs) {
        console.log('request file system done');
        fs.root.getFile(dataFile, {
          create: true,
          exclusive: false
        }, function(fileEntry) {
          console.log('file entry got');
          fileEntry.file(function(file) {
            console.log('file reader got');
            var reader = new FileReader();
            reader.onloadend = function(evt) {
              console.log('data read');
              onSuccess(evt.target.result);
            }
            reader.readAsText(file);
          }, function(err) {
            console.log('file reader failed: ' + err.code);
            onFailure();
          });
        }, function(err) {
          console.log('file entry failed: ' + err.code);
          onFailure();
        });
      },
      function() {
        console.log('request file system failed');
        onFailure();
      }
    );
  }

  return {
    writeData: writeData,
    readData: readData
  };
};

angular.module('file', ['filesystem'])
  .factory('fileService', ['filesystem', fileService]);

var guidService = function() {

  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  function get() {
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() +
      "-" + S4() + S4() + S4()).toLowerCase();
  }

  return {
    get: get
  };
};

angular.module('guid', [])
  .factory('guidService', [guidService]);

//TODO: file system integartion with INTERFACE

var identificationService = function($q, guidService, fileService) {
  var DID;

  function loadDeviceId(fileSystemIncluded) {
    var def = $q.defer();
    if (fileSystemIncluded === true && window.cordova) {
      DID = readDeviceIdFromLocalStorage();
      if (DID) {
        writeDeviceIdToInternalStorage(DID,
          function() {
            def.resolve(DID);
          },
          function() {
            def.resolve(DID);
          });
      } else {
        readDeviceIdFromInternalStorage(function(deviceId) {
          DID = deviceId;
          if (DID) {
            writeDeviceIdToLocalStorage(DID);
            def.resolve(DID);
          } else {
            DID = guidService.get();
            writeDeviceIdToLocalStorage(DID);
            writeDeviceIdToInternalStorage(DID, function() {
              def.resolve(DID);
            }, function() {
              def.resolve(DID);
            });
          }

        }, function() {
          DID = guidService.get();
          writeDeviceIdToLocalStorage(DID);
          writeDeviceIdToInternalStorage(DID, function() {
            def.resolve(DID);
          }, function() {
            def.resolve(DID);
          });
        });
      }
    } else {
      DID = readDeviceIdFromLocalStorage();
      if (DID) {
        def.resolve(DID);
      } else {
        DID = guidService.get();
        writeDeviceIdToLocalStorage(DID);
        def.resolve(DID);
      }
    }
    return def.promise;
  }

  function getDeviceId() {;
    return DID;
  }

  function readDeviceIdFromLocalStorage() {
    return localStorage.getItem('deviceId');
  }

  function writeDeviceIdToLocalStorage(deviceId) {
    return localStorage.setItem('deviceId', deviceId);
  }

  function readDeviceIdFromInternalStorage(onSuccess, onFailure) {
    fileService.readData(onSuccess, onFailure);
  }

  function writeDeviceIdToInternalStorage(deviceId, onSuccess, onFailure) {
    fileService.writeData(deviceId, onSuccess, onFailure);
  }

  return {
    loadDeviceId: loadDeviceId,
    getDeviceId: getDeviceId
  };
};

angular.module('identification', ['guid', 'file'])
  .factory('identificationService', ['$q', 'guidService', 'fileService',
    identificationService
  ]);

angular.module('interface', [])
    .provider('INTERFACE', function () {
        this.$get = function () {
            return window.Interface.instance;
        };
    });

var defaultLanguageModel = function() {
    return {
        "MAIN_MENU": {
            "SEE_CROWD": "See Crowd",
            "SET_CROWD": "Set Crowd",
            "SETTINGS": "Settings",
            "ABOUT": "About",
            "REPORT_ISSUE": "Report Issue",
            "EXIT": "Exit",
            "CLOSE": "Close",
            "LOADING": "Loading..."
        },
        "SEE_CROWD_MENU": {
            "HERE": "Here",
            "ON_MAP": "On Map",
            "IN_CITY": "In City",
            "LIST": "List",
            "MAP": "Map",
            "DATE": "Date",
            "NAME": "Place Name",
            "LAST_VALUE": "Last",
            "AVERAGE_VALUE": "Avg.",
            "MIN_AGO": "min(s) ago",
            "NO_PLACE": "No recent crowd. Tap to enter one!",
            "NO_LOCATION": "No location data. Make sure your device's location service is accessible!",
            "SEARCH_INPUT": "Last 1h, Around 15kms"
        },
        "SEE_CROWD_POPOVER_MENU": {
            "DISPLAY_TYPE": "Display Type"
        },
        "SEE_CROWD_DETAIL_POPOVER_MENU": {
            "INFO": "Info",
            "SHARE": "Share",
            "REPORT": "Report"
        },
        "CROWD_SHARE_MENU": {
            "WHATSAPP": "WhatsApp",
            "MESSAGE": "Message",
            "EMAIL": "E-Mail"
        },
        "CROWD_REPORT_MENU": {
            "REPORT": "Report",
            "INAPPROPRIATE": "Inappropriate",
            "PRIVATE": "Private",
            "MISLEADING": "Misleading"
        },
        "SET_CROWD_MENU": {
            "SELECT_PLACE": "Select Place",
            "ENTER_CUSTOM_PLACE": "Enter Custom Place",
            "PLACE_NAME": "Place Name",
            "NO_PLACE": "No places around. Tap to enter a custom place!",
            "NO_LOCATION": "No location data. Make sure your device's location service is accessible!",
            "PULL_TO_REFRESH": "Pull down to refresh",
            "RELEASE_TO_REFRESH": "Release to refresh",
            "SEARCH_INPUT": "Search"
        },
        "CROWD_VALUES" : {
          "100" : "100",
          "90": "90",
          "80": "80",
          "70": "70",
          "60": "60",
          "50": "50",
          "40": "40",
          "30": "30",
          "20": "20",
          "10": "10",
          "0": "0"
        },
        "ABOUT": {
            "DESCRIPTION": "Crowd (Kalabalık), etrafınızdaki yerlerin yoğunluk bilgilerini başkalarıyla kimliğinizi belirtmeden paylaşabileceğiniz, başkalarının paylaştığı yoğunluk bilgilerini de anlık takip edebileceğiniz interaktif bir uygulamadır.Uygulamayı daha etkin kullanabilmek için aygıtınızın konum bilgisinin açık olması gerekmektedir.",
            "SEE_CROWD": {
                "TITLE": "Kalabalık Gör",
                "DESCRIPTION": "Uygulamanın ana modüllerinden biri kalabalık bilgilerini görebileceğiniz kısımdır. Bu modülde kalabalık bilgileri hakkında detayları, geri bildirimleri görebilir ve paylaşabilirsiniz. Özel olarak girilen yoğunluk bilgilerinden uygulama kriterlerine uygun olmayanlarını bildirebilirsiniz.",
                "IN_CITY": {
                    "TITLE": "Şehirde",
                    "DESCRIPTION": "Şehirde konum bilgilerini görmek demek, 15 km uzağınızdaki son 1 saatte girilen yoğunluk bilgilerini görmek demektir. (İleriki aşamada yer ve zaman ayarlanabilir olacaktır.)"
                },
                "HERE": {
                    "TITLE": "Burada",
                    "DESCRIPTION": "Bu seçenek sayesinde hemen yakınınızdaki kalabalık bilgilerini görebilirsiniz. Girilen bilgilerin yararlılığını geri bildirimler vererek diğer kullanıcılarla paylaşabilirsiniz."
                },
                "ON_MAP": {
                    "TITLE": "Haritada",
                    "DESCRIPTION": "Şehirdeki kalabalık bilgilerini haritada üzerinde görebilirsiniz."
                }
            },
            "SET_CROWD": {
                "TITLE": "Kalabalık Gir",
                "DESCRIPTION": "Uygulamanın ana modüllerinden biri kalabalık bilgilerini başkalarıyla paylaşabileceğiniz kısımdır. Yakınınızda, Google Maps'in sağladığı ya da diğer kullanıcıların paylaştığı yerlerden istediğiniz için bir yoğunluk değeri girebilirsiniz."
            }
        },
        "SETTINGS": {
            "CONTENT_SETTINGS": "Content Settings",
            "DISPLAY_CUSTOM_PLACES": "Display custom places"
        },
        "NATIVE_DIALOG": {
            "GPS": {
                "MESSAGE": "Your GPS is Disabled, this app needs to be enable to works.",
                "DESCRIPTION": "Use GPS, with wifi or 3G.",
                "TITLE": "Please Turn on GPS",
                "YES": "Yes",
                "NO": "No"
            }
        },
        "CONFIRM": {
            "CONFIRM": "Confirm",
            "QUIT_CONFIRM": "Are you sure you want to quit?",
            "OK": "Ok",
            "CANCEL": "Cancel"
        },
        "ALERT": {
            "ALERT": "Alert",
            "SUCCESS": "Successful!",
            "FAIL": "Failure!",
            "OK": "Ok"
        },
        "ERROR": {

        }
    }
};
angular.module('lang', [])
    .factory('defaultLanguageModel', [defaultLanguageModel]);

var langService = function($q, $http, $rootScope) {
  function loadLangData(callback) {
    window.console.log('Loading language data...');
    if (navigator.globalization !== null && navigator.globalization !==
      undefined) {
      navigator.globalization.getPreferredLanguage(
        function(language) {
          getLangFile(language.value).then(function(){
            window.console.log('Lang loaded: ' + language.value);
            callback();
          });
        },
        function(error) {
          getLangFile().then(function(){
            window.console.log('Lang loaded');
            callback();
          });
        }
      );
      //Normal browser detection
    } else {
      if (window.navigator.language !== null && window.navigator.language !==
        undefined) {
        getLangFile(window.navigator.language).then(function(){
          window.console.log('Lang loaded: ' + window.navigator.language);
          callback();
        });
      }
    }
  }

  function getLangFile(lang) {
    var def = $q.defer();
    if (!lang) {
        $rootScope.lang = defaultLanguageModel;
        def.resolve();
    } else {
        prefLang = lang.substring(0, 2);
        $http.get("lang/" + prefLang + ".json").then(function(response) {
            $rootScope.lang = response.data;
            def.resolve();
        }, function() {
            $rootScope.lang = defaultLanguageModel;
            def.resolve();
        });
    }

    return def.promise;
  }

  return {
    loadLangData: loadLangData
  };
};

angular.module('lang')
  .factory('langService', ['$q', '$http', '$rootScope', langService]);


angular.module('location.Service', ['map.Service', 'interface'])
    .factory('locationService', ['$rootScope', 'mapService', 'INTERFACE', function($rootScope, mapService, INTERFACE){
		var locationInterval, oldLocation, watchId;
		var intervalTime = 5000, geolocationTimeout = 3000, cumulativeDeltaResetValue = 1; // km
		
		function startLocationInterval() {
			console.log('starting location interval...');
			if (!$rootScope.location) {
				$rootScope.location = {};
			}
		
			locationInterval = setInterval(function(){
        		oldLocation = $rootScope.location;
				navigator.geolocation.getCurrentPosition(function(position) {
					$rootScope.location = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
						delta: 0
					};

					if(oldLocation.latitude) {
						$rootScope.location.delta = getDistanceBetweenLocations($rootScope.location, oldLocation);
						$rootScope.location.cumulativeDelta = oldLocation.cumulativeDelta;
						$rootScope.location.overallDelta = oldLocation.overallDelta;
					}

					if(!$rootScope.location.cumulativeDelta) {
						$rootScope.location.cumulativeDelta = $rootScope.location.delta;
					}
					else {
						$rootScope.location.cumulativeDelta += $rootScope.location.delta;
					}

					if($rootScope.location.cumulativeDelta > cumulativeDeltaResetValue) {
						$rootScope.location.cumulativeDelta = 0;
					}

					if(!$rootScope.location.overallDelta) {
						$rootScope.location.overallDelta = $rootScope.location.delta;
					}
					else {
						$rootScope.location.overallDelta += $rootScope.location.delta;
					}

					console.log('location successfully gained: ' + JSON.stringify(
						$rootScope.location));
					if(!watchId) {
						watchId = navigator.geolocation.watchPosition(function() {});
					}
					localStorage.setItem('location', angular.toJson($rootScope.location));
					$rootScope.$broadcast('locationChanged', {
						oldLocation: oldLocation
					});
				}, function(err) {
					checkLocationAvailability(function(){

					}, function(){
						console.log('location failed...');
						$rootScope.location = {
							error: {
								code: err.code,
								message: err.message
							}
						};
						if(watchId) {
							navigator.geolocation.clearWatch(watchId);
							watchId = undefined;
						}
						$rootScope.$broadcast('locationChanged', {
							oldLocation: oldLocation
						});
					}, function(){});
				}, {
					enableHighAccuracy: true,
					timeout: geolocationTimeout,
					maximumAge: 0
				});
			}, intervalTime);
		}
		
		function stopLocationInterval() {
			console.log('stopping location interval...');
			clearInterval(locationInterval);
			if(watchId) {
				navigator.geolocation.clearWatch(watchId);
				watchId = undefined;
			}
		}

		function checkLocationAvailability(onEnabled, onDisabled){
			window.console.log('Checking location availability...');
			INTERFACE.isLocationEnabled(function(enabled){
				window.console.log('Location availability: ' + enabled);
				if(enabled) {
                    onEnabled();
                }
                else {
                	onDisabled();
                }
			});
		}

		function openGPSDialog(onNo, onLater, onYes){
			window.console.log('Opening GPS dialog...');
			INTERFACE.openGPSDialog($rootScope.lang.NATIVE_DIALOG.GPS.MESSAGE,
			 $rootScope.lang.NATIVE_DIALOG.GPS.DESCRIPTION, 
			 $rootScope.lang.NATIVE_DIALOG.GPS.TITLE, 
			 {
			 	'NO': onNo,
			 	'LATER': onLater,
			 	'YES': onYes
			 },
			 {
			 	'NO': $rootScope.lang.NATIVE_DIALOG.GPS.NO,
			 	'YES': $rootScope.lang.NATIVE_DIALOG.GPS.YES
			 });
		}


	    //in km
	    function getDistanceBetweenLocations(location1, location2) {
	        // helper functions (degrees<–>radians)
	        Number.prototype.degToRad = function() {
	            return this * (Math.PI / 180);
	        };
	        Number.prototype.radToDeg = function() {
	            return (180 * this) / Math.PI;
	        };

	        R = 6378.1; //Radius of the earth in km
	        var dLat = (location2.latitude - location1.latitude).degToRad(); //deg2rad below
	        var dLon = (location2.longitude - location1.longitude).degToRad();
	        var a =
	            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	            Math.cos((location1.latitude).degToRad()) * Math.cos((
	                location2
	                .latitude).degToRad()) *
	            Math.sin(dLon / 2) * Math.sin(dLon / 2);
	        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	        var d = R * c; // Distance in km
	        return d;
	    }

		return {
			openGPSDialog: openGPSDialog,
			checkLocationAvailability: checkLocationAvailability,
			startLocationInterval: startLocationInterval,
			stopLocationInterval: stopLocationInterval,
			getDistanceBetweenLocations: getDistanceBetweenLocations
		};
	}]);

angular.module('google', ['config']).
	factory('googleService', ['$compile','$rootScope', 'configService', function($compile, $rootScope, configService) {
	
	var placeTypes = ['accounting',
	'airport',
	'amusement_park',
	'aquarium',
	'art_gallery',
	'atm',
	'bakery',
	'bank',
	'bar',
	'beauty_salon',
	'bicycle_store',
	'book_store',
	'bowling_alley',
	'bus_station',
	'cafe',
	'campground',
	'car_dealer',
	'car_rental',
	'car_repair',
	'car_wash',
	'casino',
	'cemetery',
	'church',
	'city_hall',
	'clothing_store',
	'convenience_store',
	'courthouse',
	'dentist',
	'department_store',
	'doctor',
	'electrician',
	'electronics_store',
	'embassy',
	'establishment',
	'finance',
	'fire_station',
	'florist',
	'food',
	'funeral_home',
	'furniture_store',
	'gas_station',
	'general_contractor',
	'grocery_or_supermarket',
	'gym',
	'hair_care',
	'hardware_store',
	'health',
	'hindu_temple',
	'home_goods_store',
	'hospital',
	'insurance_agency',
	'jewelry_store',
	'laundry',
	'lawyer',
	'library',
	'liquor_store',
	'local_government_office',
	'locksmith',
	'lodging',
	'meal_delivery',
	'meal_takeaway',
	'mosque',
	'movie_rental',
	'movie_theater',
	'moving_company',
	'museum',
	'night_club',
	'painter',
	'park',
	'parking',
	'pet_store',
	'pharmacy',
	'physiotherapist',
	'place_of_worship',
	'plumber',
	'police',
	'post_office',
	'real_estate_agency',
	'restaurant',
	'roofing_contractor',
	'rv_park',
	'school',
	'shoe_store',
	'shopping_mall',
	'spa',
	'stadium',
	'storage',
	'store',
	'subway_station',
	'synagogue',
	'taxi_stand',
	'train_station',
	'travel_agency',
	'university',
	'veterinary_care',
	'zoo'], infowindow = null;;

	function initMap(DOMElementId) {
		return new google.maps.Map(document.getElementById(DOMElementId));
	}

	function setMapBoundingBox(map, swLat, swLng, neLat, neLng) {
		map.fitBounds(new google.maps.LatLngBounds({
			lat: swLat,
			lng: swLng
		}, {
			lat: neLat,
			lng: neLng
		}));
	}

	function markPlaceOnMap(map, placeBasedCrowd, clickEvent) {
		var latLng = new google.maps.LatLng(placeBasedCrowd.crowdLocation.latitude, placeBasedCrowd.crowdLocation.longitude);
		var marker = new google.maps.Marker({
			map: map,
			position: latLng,
			icon: {
				url: 'img/markers/' + (Math.ceil(placeBasedCrowd.crowdAverage / 10) * 10) + '.png',
				anchor: new google.maps.Point(7, 40),
				scaledSize: new google.maps.Size(14, 40)
			}
		});

		var scope = $rootScope.$new();
		scope.placeBasedCrowd = placeBasedCrowd;

    	scope.selectPlaceBasedCrowd = clickEvent;

		var contentString = '<div>'+
		'<div class="crowd-main-body crowd-info-window" ng-click="selectPlaceBasedCrowd(placeBasedCrowd)">' +
		'<div class="crowd-left">' +
		'<div class="crowd-source-icon">' +
		'<img ng-src="img/sources/{{placeBasedCrowd.placeSource}}.png" />' +
		'</div>' +
		'</div>' +
		'<div class="crowd-center">' +
		'<div class="crowd-place-name">{{placeBasedCrowd.placeName}}</div>' +
		'<div class="crowd-city" ng-show="placeBasedCrowd.placeDistrict"><ons-icon icon="ion-ios-location-outline"></ons-icon> {{placeBasedCrowd.placeDistrict}}</div>' +
		'<div class="crowd-time"><ons-icon icon="ion-ios-clock-outline"> {{placeBasedCrowd.crowdLast.lastUpdatePass}} {{$root.lang.SEE_CROWD_MENU.MIN_AGO}}</div>' +
		'</div>' +
		'<div class="crowd-right">' +
		'<div class="crowd-last-value">{{$root.lang.SEE_CROWD_MENU.LAST_VALUE}} {{placeBasedCrowd.crowdLast.crowdValue}}%</div>' +
		'<div class="crowd-circle">' +
		'<div class="c100 p{{placeBasedCrowd.crowdLast.crowdValue}} crowd-size center">' +
		'<div class="slice">' +
		'<div class="bar"></div>' +
		'<div class="fill"></div>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'<div class="crowd-feedbacks">' +
		'<div ng-if="placeBasedCrowd.crowdLast.crowdFeedback.negativeFeedback !== 0" class="crowd-negative-feedback">{{placeBasedCrowd.crowdLast.crowdFeedback.negativeFeedback}}</div>' +
		'<div ng-if="placeBasedCrowd.crowdLast.crowdFeedback.positiveFeedback !== 0" class="crowd-positive-feedback">{{placeBasedCrowd.crowdLast.crowdFeedback.positiveFeedback}}</div>' +
		'</div>' +
		'</div>' +
		'</div>'+
		'<div class="crowd-average-container">'+
		'<div class="crowd-average-text">{{$root.lang.SEE_CROWD_MENU.AVERAGE_VALUE}} {{placeBasedCrowd.crowdAverage}}%</div>'+
		'<div class="crowd-average-indicator">'+
		'<div class="crowd-average-bar">'+
		'<div class="crowd-average-fill" style="width: {{placeBasedCrowd.crowdAverage}}%"></div>'+
		'</div>'+
		'</div>'+
		'</div>'+
		'</div>';

		var compiledContent = $compile(contentString)(scope);

		google.maps.event.addListener(marker, 'click', function() {
			if (infowindow) {
				infowindow.close();
			}

			infowindow = new google.maps.InfoWindow({
				content: compiledContent[0]
			});
			infowindow.open(map, marker);
		});
		return marker;
	}
	
	function getNearbyPlaces(location, onSuccess) {
		var nearPlaces = [];
		var latLng = new google.maps.LatLng(location.latitude, location.longitude);
		var mapOptions = {
			zoom: 13,
			center: latLng
		};
		var map = new google.maps.Map(document.createElement('div'), mapOptions);
		var service = new google.maps.places.PlacesService(map);
		var nearbyRequest = {
			location: latLng,
			radius: configService.NEARBY_DISTANCE*1000, //m
			types: placeTypes
		};
		service.nearbySearch(nearbyRequest, function(results, status) {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					var place = results[i];
					var nearPlace = {
						sid: place.place_id,
						name: place.name,
						location: {
							latitude: place.geometry.location.lat(),
							longitude: place.geometry.location.lng()
						},
						source: 'google',
						vicinity: place.vicinity,
						district: getDistrictFromVicinity(place.vicinity)
					};
					if(place.photos){
						nearPlace.photo = place.photos[0].getUrl({'maxWidth': 600, 'maxHeight': 600});
					}
					nearPlaces.push(nearPlace);
				}
			}
			onSuccess(nearPlaces);
		});
	}

	function getDistrictFromVicinity(vicinity){
		if(vicinity)
			return vicinity.replace("No:", "<notoreplaceback>").replace("No, ", "").replace("No", "").replace("<notoreplaceback>", "No:");
	}

	function getAddressByLocation(location, onSuccess){
		if(location) {
			var geocoder = new google.maps.Geocoder;

			var latlng = {lat: location.latitude, lng: location.longitude};
			  geocoder.geocode({'location': latlng}, function(results, status) {
			    if (status === google.maps.GeocoderStatus.OK) {
			      if (results[1]) {
			      	onSuccess(results[1].formatted_address);
			      } else {
			        onSuccess();
			      }
			    } else {
			      onSuccess();
			    }
			  });
		 }
		 else {
		 	onSuccess();
		 }
	}

	return {
		initMap: initMap,
		setMapBoundingBox: setMapBoundingBox,
		markPlaceOnMap: markPlaceOnMap,
		getNearbyPlaces: getNearbyPlaces,
		getAddressByLocation: getAddressByLocation
	};
}]);
var mapService = function($q, $rootScope, googleService) {


    /**
     * @param {number} distance - distance (km) from the point represented by centerPoint
     * @param {array} centerPoint - two-dimensional array containing center coords [latitude, longitude]
     * @description
     *   Computes the bounding coordinates of all points on the surface of a sphere
     *   that has a great circle distance to the point represented by the centerPoint
     *   argument that is less or equal to the distance argument.
     *   Technique from: Jan Matuschek <http://JanMatuschek.de/LatitudeLongitudeBoundingCoordinates>
     * @author Alex Salisbury
     */
    function getBoundingBox(centerPoint, distance) {
        var MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, R, radDist, degLat,
            degLon,
            radLat, radLon, minLat, maxLat, minLon, maxLon, deltaLon;
        if (distance < 0) {
            return 'Illegal arguments';
        }
        // helper functions (degrees<–>radians)
        Number.prototype.degToRad = function() {
            return this * (Math.PI / 180);
        };
        Number.prototype.radToDeg = function() {
            return (180 * this) / Math.PI;
        };
        // coordinate limits
        MIN_LAT = (-90).degToRad();
        MAX_LAT = (90).degToRad();
        MIN_LON = (-180).degToRad();
        MAX_LON = (180).degToRad();
        // Earth's radius (km)
        R = 6378.1;
        // angular distance in radians on a great circle
        radDist = distance / R;
        // center point coordinates (deg)
        degLat = centerPoint.latitude;
        degLon = centerPoint.longitude;
        // center point coordinates (rad)
        radLat = degLat.degToRad();
        radLon = degLon.degToRad();
        // minimum and maximum latitudes for given distance
        minLat = radLat - radDist;
        maxLat = radLat + radDist;
        // minimum and maximum longitudes for given distance
        minLon = void 0;
        maxLon = void 0;
        // define deltaLon to help determine min and max longitudes
        deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
        if (minLat > MIN_LAT && maxLat < MAX_LAT) {
            minLon = radLon - deltaLon;
            maxLon = radLon + deltaLon;
            if (minLon < MIN_LON) {
                minLon = minLon + 2 * Math.PI;
            }
            if (maxLon > MAX_LON) {
                maxLon = maxLon - 2 * Math.PI;
            }
        }
        // a pole is within the given distance
        else {
            minLat = Math.max(minLat, MIN_LAT);
            maxLat = Math.min(maxLat, MAX_LAT);
            minLon = MIN_LON;
            maxLon = MAX_LON;
        }
        return {
            latitude: {
                upper: maxLat.radToDeg(),
                lower: minLat.radToDeg()
            },
            longitude: {
                upper: maxLon.radToDeg(),
                lower: minLon.radToDeg()
            }
        };
    }

    function initMap(DOMElementId, swLat, swLng, neLat, neLng) {
        var map = googleService.initMap(DOMElementId);
        setMapBoundingBox(map, swLat, swLng, neLat, neLng);
        return map;
    }

    function setMapBoundingBox(map, swLat, swLng, neLat, neLng) {
        googleService.setMapBoundingBox(map, swLat, swLng, neLat, neLng);
    }

    function markPlaceOnMap(map, placeBasedCrowd, clickEvent) {
        return googleService.markPlaceOnMap(map, placeBasedCrowd, clickEvent);
    }

    function retrieveNearbyPlaces() {
        var def = $q.defer();
        googleService.getNearbyPlaces(angular.fromJson(localStorage.getItem('location')), function(nearbyPlaces) {
                def.resolve(nearbyPlaces);
            },
            function() {
                def.resolve([]);
            });
        return def.promise;
    }

    function getAddressByLocation(location, onSuccess){
        googleService.getAddressByLocation(location, onSuccess);
    }

    return {
        getBoundingBox: getBoundingBox,
        retrieveNearbyPlaces: retrieveNearbyPlaces,
        initMap: initMap,
        setMapBoundingBox: setMapBoundingBox,
        markPlaceOnMap: markPlaceOnMap,
        getAddressByLocation: getAddressByLocation
    };
};

angular.module('map.Service', ['google'])
    .factory('mapService', ['$q', '$rootScope', 'googleService', mapService
    ]);

angular.module('rest', ['ngResource']).
    factory('crowdRest', ['$resource',
      function($resource) {
        return $resource(
          "https://api.backendless.com/v1/data/bulk/Crowd?where=placeKey%3D':placeKey'",
          null, {
            update: {
              method: 'PUT',
              headers: {
                'application-id': 'A556DD00-0405-02E1-FFF4-43454755FC00',
                'secret-key': 'F2FE2852-98DD-67CB-FFF6-61CE115F9800',
                'Content-Type': 'application/json',
                'application-type': 'REST'
              }
            }
          });
      }
    ]).
    factory('FileUploader',['$http',function($http){
        function upload(folder, fileName, fileData, onSuccess, onFailure) {
            var req = {
               method: 'PUT',
               url: "https://api.backendless.com/v1/files/binary/"+folder+"/"+fileName+"?overwrite=true",
               headers: {
                'application-id': 'A556DD00-0405-02E1-FFF4-43454755FC00',
                'secret-key': 'F2FE2852-98DD-67CB-FFF6-61CE115F9800',
                'Content-Type': 'text/plain',
                'application-type': 'REST'
               },
               data: fileData
            }

            $http(req).then(onSuccess, onFailure);
        }

        return {
            upload: upload
        }
    }]);

var settingsService = function($rootScope) {
    function loadSettings() {
        var settings = localStorage.getItem('settings');
        if (!settings) {
            $rootScope.settings = {
                isCustomPlacesEnabled : true
            }
            saveSettings();
        } else {
            $rootScope.settings = JSON.parse(settings);
        }
        window.console.log('Settings loaded.');
    }

    function saveSettings() {
        localStorage.setItem('settings', JSON.stringify($rootScope.settings));
    }

    return {
        loadSettings: loadSettings,
        saveSettings: saveSettings
    };
};

angular.module('settings', [])
    .factory('settingsService', ['$rootScope', settingsService]);
