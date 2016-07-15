var app = angular.module('app', ['ngCordova', 'onsen', 'seeCrowd.Model', 'setCrowd.Model',
    'seeCrowd.Service', 'identification', 'map.Model', 'map.Service',
    'config', 'connection', 'feedback', 'date', 'lang', 'db', 'settings'
]);

app.run(['langService', 'dbService', 'settingsService', function(langService, dbService, settingsService){
    langService.loadLangData();
    dbService.init();
    settingsService.loadSettings();
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

app.controller('aboutController', ['$scope', function($scope) {
  modal.hide();
}]);

app.controller('reportIssueController', ['$scope', function($scope) {
  	modal.hide();
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

app.controller('seeCrowdController', ['$rootScope','$scope', function($rootScope, $scope) {
  modal.show();
	ons.createPopover('templates/popover.html', {
      parentScope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $scope.options = [{
      label: $rootScope.lang.SEE_CROWD_POPOVER_MENU.DISPLAY_TYPE,
      fnc: function() {
        app.navi.pushPage('templates/crowd-display-type.html', { animation : 'lift'});
      }
    }];
}]);

app.controller('seeCrowdDetailController', ['$rootScope', '$scope',
  'seeCrowdHereModel', 'seeCrowdIncityModel', 'feedbackModel', 'seeCrowdService',
  function($rootScope, $scope, seeCrowdHereModel, seeCrowdIncityModel,
    feedbackModel, seeCrowdService) {
    $scope.crowdType = app.navi.topPage.pushedOptions.crowdType;
    if ($scope.crowdType === 'here') {
      $scope.selectedPlaceBasedCrowd = seeCrowdHereModel.getSelectedPlaceBasedCrowd();
    } else {
      $scope.selectedPlaceBasedCrowd = seeCrowdIncityModel.getSelectedPlaceBasedCrowd();
    }
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
        seeCrowdHereModel.giveFeedback(crowd, isPositive,
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
          selectedPlaceBasedCrowd: $scope.selectedPlaceBasedCrowd
        });
      }
    }, {
      label: $rootScope.lang.SEE_CROWD_DETAIL_POPOVER_MENU.SHARE,
      fnc: function() {
        $scope.dialogs['templates/share-crowd.html'].show();
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

    $scope.shareChannels = [{
      label: $rootScope.lang.CROWD_SHARE_MENU.WHATSAPP,
      fnc: function() {
        window.plugins.socialsharing.shareViaWhatsApp(
          $scope.selectedPlaceBasedCrowd.placeName + ' last crowd value: ' +
          $scope.selectedPlaceBasedCrowd.crowdLast, null /* img */ , null /* url */ ,
          function() {
            console.log('share ok');
          },
          function(errormsg) {
            alert(errormsg);
          });
      }
    }];

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

app.controller('seeCrowdHereController', ['$rootScope', '$scope',
    '$filter', 'seeCrowdHereModel', 'dateService', 'mapService',
    function($rootScope, $scope, $filter, seeCrowdHereModel, dateService,
        mapService) {
        console.log('see crowd here controller initialized');
        $scope.crowds = 'pending';
        var placeBasedCrowdsArray;
        modal.show();
        $scope.filteredPlaceBasedCrowdsArray = [];

        function getFilter() {
            var now = dateService.getDBDate(new Date());
            var oneHourAgo = new Date(new Date(now).setHours(now.getHours() - 1));
            var boundingBox = mapService.getBoundingBox($rootScope.location, 0.05);

            return {
                date: {
                    start: oneHourAgo,
                    end: now
                },
                location: boundingBox
            };
        }

        $scope.loadCrowds = function(serverRequest, onSuccess, onFailure) {
            if ($rootScope.location && $rootScope.location.latitude &&
                $rootScope.location.longitude) {
                var filter = getFilter();
                seeCrowdHereModel.loadCrowds(filter, serverRequest).then(
                    function() {
                        $scope.crowds = seeCrowdHereModel.getCrowds();
                        var placeBasedCrowds = seeCrowdHereModel.getPlaceBasedCrowds();
                        placeBasedCrowdsArray = Object.keys(placeBasedCrowds).map(
                            function(key) {
                                return placeBasedCrowds[key];
                            });
                        $scope.filteredPlaceBasedCrowdsArray =
                            placeBasedCrowdsArray;
                        modal.hide();
                        if (onSuccess) {
                            onSuccess();
                        }
                    },
                    function() {
                        modal.hide();
                        if (onFailure) {
                            onFailure();
                        }
                    });
            } else {
                if (onFailure) {
                    onFailure();
                }
            }
        };

        $scope.checkLocation = function() {
            modal.show();
            $scope.crowds = 'pending';
            $rootScope.checkLocation();
        }

        if ($rootScope.location && $rootScope.location.latitude && $rootScope.location
            .longitude) {
            $scope.loadCrowds(true);
        } else {
            $scope.checkLocation();
        }

        $scope.$on('$destroy', $rootScope.$on("locationChanged", function(event, args) {
            var newLocation = $rootScope.location,
                oldLocation = args.oldLocation;
            if (newLocation && newLocation.latitude && newLocation.longitude) {
                if (oldLocation && oldLocation.latitude && oldLocation.longitude) {
                    var distance = mapService.getDistanceBetweenLocations(
                        newLocation, oldLocation);
                    if (distance > 0.01) { //10 m
                        $scope.loadCrowds(true);
                    }
                } else {
                    $scope.loadCrowds(true);
                }
            } else {
                if (oldLocation && oldLocation.latitude && oldLocation.longitude) {} else {
                    $scope.crowds = undefined;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    modal.hide();
                }
            }
        }));

        $scope.selectPlaceBasedCrowd = function(placeBasedCrowd) {
            seeCrowdHereModel.selectPlaceBasedCrowd(placeBasedCrowd);
        };

        $scope.searchInputChange = function(searchInput) {
            if (searchInput.length > 1) {
                $scope.filteredPlaceBasedCrowdsArray = $filter('filter')(
                    placeBasedCrowdsArray, searchInput);
            } else {
                $scope.filteredPlaceBasedCrowdsArray = placeBasedCrowdsArray;
            }
        };

        $scope.MyDelegate = {
            configureItemScope: function(index, itemScope) {
                itemScope.item = $scope.filteredPlaceBasedCrowdsArray[index];
            },
            calculateItemHeight: function(index) {
                return 108;
            },
            countItems: function() {
                return $scope.filteredPlaceBasedCrowdsArray.length;
            },
            destroyItemScope: function(index, scope) {}
        };
    }
]);

app.controller('seeCrowdIncityController', ['$rootScope', '$scope', '$filter',
    'seeCrowdIncityModel', 'dateService', 'mapService',
    function($rootScope, $scope, $filter, seeCrowdIncityModel, dateService, mapService) {
        console.log('see crowd incity controller initialized');
        $scope.crowds = 'pending';
        var placeBasedCrowdsArray;
        var locationFromStorage = angular.fromJson(localStorage.getItem('location'));

        modal.show();

        function getFilter() {
            var now = dateService.getDBDate(new Date());
            var oneHourAgo = new Date(new Date(now).setHours(now.getHours() - 1));
            var boundingBox = mapService.getBoundingBox(angular.fromJson(localStorage.getItem('location')), 15);

            return {
                date: {
                    start: oneHourAgo,
                    end: now
                },
                location: boundingBox
            };
        }

        $scope.filteredPlaceBasedCrowdsArray = [];

        $scope.loadCrowds = function(serverRequest, onSuccess, onFailure) {
            seeCrowdIncityModel.loadCrowds(getFilter(), serverRequest).then(
                function() {
                    $scope.crowds = seeCrowdIncityModel.getCrowds();
                    modal.hide();
                    var placeBasedCrowds = seeCrowdIncityModel.getPlaceBasedCrowds();
                    placeBasedCrowdsArray = Object.keys(placeBasedCrowds).map(
                        function(key) {
                            return placeBasedCrowds[key];
                        });
                    $scope.filteredPlaceBasedCrowdsArray = placeBasedCrowdsArray;
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                function() {
                    modal.hide();
                    if (onFailure) {
                        onFailure();
                    }
                });
        };

        if (locationFromStorage) {
            $scope.loadCrowds(true);
        } else {
            $scope.crowds = undefined;
        }

        $scope.$on('$destroy',$rootScope.$on("locationChanged", function(event, args) {
            var newLocation = $rootScope.location,
                oldLocation = args.oldLocation;
            if (newLocation && newLocation.latitude && newLocation.longitude) {
                if (oldLocation && oldLocation.latitude && oldLocation.longitude) {

                } else {
                    $scope.loadCrowds(true);
                }
            }
        }));

        $scope.checkLocation = function() {
            modal.show();
            $scope.crowds = 'pending';
            $rootScope.checkLocation();
        };

        $scope.selectPlaceBasedCrowd = function(placeBasedCrowd) {
            seeCrowdIncityModel.selectPlaceBasedCrowd(placeBasedCrowd);
        };

        $scope.searchInputChange = function(searchInput) {
            if (searchInput.length > 1) {
                $scope.filteredPlaceBasedCrowdsArray = $filter('filter')(
                    placeBasedCrowdsArray, searchInput);
            } else {
                $scope.filteredPlaceBasedCrowdsArray = placeBasedCrowdsArray;
            }
        };

        $scope.MyDelegate = {
            configureItemScope: function(index, itemScope) {
                itemScope.item = $scope.filteredPlaceBasedCrowdsArray[index];
            },
            calculateItemHeight: function(index) {
                return 108;
            },
            countItems: function() {
                return $scope.filteredPlaceBasedCrowdsArray.length;
            },
            destroyItemScope: function(index, scope) {}
        };
    }
]);

app.controller('seeCrowdInmapController', ['$rootScope', '$scope', '$timeout',
    'mapService', 'seeCrowdIncityModel',
    function($rootScope, $scope, $timeout, mapService, seeCrowdIncityModel) {
       myTabbar.on('prechange', function(event) {
        //If this is map page
        if(event.index === 2) {
            $timeout(function(){
                var locationFromStorage = angular.fromJson(localStorage.getItem('location'));
                if (locationFromStorage) {
                    $scope.map = true;
                    var boundingBox = mapService.getBoundingBox(locationFromStorage, 0.1);
                    seeCrowdIncityModel.loadMap('map', boundingBox);
                    seeCrowdIncityModel.markPlaceBasedCrowdsOnMap();
                }
            }, 100);
        }
    });

    $scope.selectPlaceBasedCrowd = function(selectPlaceBasedCrowd){
        seeCrowdIncityModel.selectPlaceBasedCrowd(selectPlaceBasedCrowd);
    };
}]);

app.controller('setCrowdController', ['$rootScope', '$scope', '$timeout',
    'mapModel', 'mapService', 'setCrowdModel',
    function($rootScope, $scope, $timeout, mapModel, mapService,
        setCrowdModel) {
        modal.show();
        $scope.nearbyPlaces = 'pending';
        $scope.checkLocation = function() {
            modal.show();
            $scope.nearbyPlaces = 'pending';
            $rootScope.checkLocation();
        };

        if ($rootScope.location && $rootScope.location.latitude && $rootScope.location
            .longitude) {
            loadNearbyPlaces();
        } else {
            $scope.checkLocation();
        }

        $scope.$on('$destroy',$rootScope.$on("locationChanged", function(event, args) {
            var newLocation = $rootScope.location,
                oldLocation = args.oldLocation;
            if (newLocation && newLocation.latitude && newLocation.longitude) {
                if (oldLocation && oldLocation.latitude && oldLocation.longitude) {
                    var distance = mapService.getDistanceBetweenLocations(
                        newLocation, oldLocation);
                    if (distance > 0.01) { //10 m
                        loadNearbyPlaces();
                    }
                } else {
                    loadNearbyPlaces();
                }
            } else {
                if (oldLocation && oldLocation.latitude && oldLocation.longitude) {} else {
                    $scope.nearbyPlaces = undefined;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    modal.hide();
                }
            }
        }));

        function loadNearbyPlaces() {
            setCrowdModel.loadNearbyPlaces($rootScope.location, true).then(
                function() {
                    $scope.nearbyPlaces = setCrowdModel.getNearbyPlaces();
                    modal.hide();
                },
                function() {
                    $scope.nearbyPlaces = [];
                    modal.hide();
                });
        };

        $scope.selectPlace = function(place) {
            setCrowdModel.selectPlace(place);
        };
    }
]);

app.controller('setCrowdLevelController', ['$rootScope', '$scope',
  'setCrowdModel', 'guidService', 'dateService',
  function($rootScope, $scope, setCrowdModel, guidService, dateService) {

    $scope.levels = [{
      value: 100,
      text: 100
    }, {
      value: 90,
      text: 90
    }, {
      value: 80,
      text: 80
    }, {
      value: 70,
      text: 70
    }, {
      value: 60,
      text: 60
    }, {
      value: 50,
      text: 50
    }, {
      value: 40,
      text: 40
    }, {
      value: 30,
      text: 30
    }, {
      value: 20,
      text: 20
    }, {
      value: 10,
      text: 10
    }, {
      value: 0,
      text: 0
    }];

    $scope.selectedPlace = setCrowdModel.getSelectedPlace();

    $scope.insertCrowd = function(crowdValue, customPlaceName) {
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
          disagree: 0
        };

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
      }
    };
  }
]);

app.controller('settingsController', ['$scope', '$rootScope', 'settingsService', function($scope, $rootScope, settingsService) {

	document.getElementById('custom-place-switch').addEventListener('change', function(e) {
		settingsService.saveSettings();
	});
	modal.hide();
}]);

app.controller('splashController', [function() {
    if (localStorage.getItem('skipTutorial')) {
        menu.setMainPage('templates/see-crowd.html');
    } else {
        menu.setMainPage('templates/about.html');
        localStorage.setItem('skipTutorial', true);
    }
}]);

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var myApp = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  isCordovaApp: document.URL.indexOf('http://') === -1 && document.URL.indexOf(
    'https://') === -1,
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    myApp.receivedEvent('deviceready');
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    console.log('Received Event: ' + id);
  }
};

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

var mapModel = function($q, mapService) {
  var nearbyPlaces = [];
  var loadStatus = '';

  function loadNearbyPlaces(location, serverRequest) {
    var def = $q.defer();
    if (serverRequest === true) {
      loadStatus = '';
    }
    if (loadStatus === 'loaded') {
      def.resolve(nearbyPlaces);
    } else if (loadStatus === 'pending') {
      def.resolve([]);
    } else {
      loadStatus = 'pending';
      mapService.retrieveNearbyPlaces(location).then(function(results) {
          nearbyPlaces = results;
          loadStatus = 'loaded';
          def.resolve(nearbyPlaces);
        },
        function() {
          def.resolve(nearbyPlaces);
        });
    }
    return def.promise;
  }

  function getNearbyPlaces() {
    return nearbyPlaces;
  }

  return {
    loadNearbyPlaces: loadNearbyPlaces,
    getNearbyPlaces: getNearbyPlaces
  };
};

angular.module('map.Model', ['map.Service'])
  .factory('mapModel', ['$q', 'mapService', mapModel]);

var seeCrowdHereModel = function($q, seeCrowdService, mapService, dateService) {
    var crowds = [],
        placeBasedCrowds = {},
        loadStatus = '',
        selectedPlaceBasedCrowd;

    function loadCrowds(filter, serverRequest) {
        var def = $q.defer();
        if (serverRequest === true) {
            loadStatus = '';
        }
        if (loadStatus === 'loaded') {
            def.resolve(crowds);
        } else if (loadStatus === 'pending') {
            def.resolve([]);
        } else {
            loadStatus === 'pending';
            seeCrowdService.retrieveCrowds(filter).then(function(results) {
                    crowds = results;
                    loadPlaceBasedCrowds();
                    loadStatus = 'loaded';
                    def.resolve(crowds);
                },
                function() {
                    def.reject;
                });
        }
        return def.promise;
    }

    function loadPlaceBasedCrowds() {
        var i, now = new Date().getTime();
        placeBasedCrowds = {};
        for (i = 0; i < crowds.length; i++) {
            var crowd = crowds[i];
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
            if (!placeBasedCrowds[crowd.placeKey].crowdLast) {
                placeBasedCrowds[crowd.placeKey].crowdLast = crowd;
                // placeBasedCrowds[crowd.placeKey].crowdLast = crowd.crowdValue;
                // placeBasedCrowds[crowd.placeKey].lastUpdateDate = crowd.crowdDate;
                // placeBasedCrowds[crowd.placeKey].lastUpdatePass = crowd.lastUpdatePass;
            }
            placeBasedCrowds[crowd.placeKey].crowdCount += 1;
            placeBasedCrowds[crowd.placeKey].crowdValue += crowd.crowdValue;
            placeBasedCrowds[crowd.placeKey].crowds.push(crowd);
            placeBasedCrowds[crowd.placeKey].crowdAverage = Math.round(
                placeBasedCrowds[crowd.placeKey].crowdValue / placeBasedCrowds[
                    crowd.placeKey].crowdCount);
        }
    }

    function getCrowds() {
        return crowds;
    }

    function getPlaceBasedCrowds() {
        return Object.keys(placeBasedCrowds).length === 0 ? {} :
            placeBasedCrowds;
    }

    function selectPlaceBasedCrowd(placeBasedCrowd) {
        selectedPlaceBasedCrowd = placeBasedCrowd;
        if (placeBasedCrowd) {
            app.navi.pushPage('templates/see-crowd-detail.html', {
                crowdType: 'here'
            });
        }
    }

    function getSelectedPlaceBasedCrowd() {
        return selectedPlaceBasedCrowd;
    }

    function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
        seeCrowdService.giveFeedback(crowd, isPositive, onSuccess, onFailure);
    }

    return {
        loadCrowds: loadCrowds,
        getCrowds: getCrowds,
        getPlaceBasedCrowds: getPlaceBasedCrowds,
        selectPlaceBasedCrowd: selectPlaceBasedCrowd,
        getSelectedPlaceBasedCrowd: getSelectedPlaceBasedCrowd,
        giveFeedback: giveFeedback
    };
};

angular.module('seeCrowd.Model', ['seeCrowd.Service', 'map.Service', 'date'])
.factory('seeCrowdHereModel', ['$q', 'seeCrowdService', 'mapService',
    'dateService', seeCrowdHereModel
]);

var seeCrowdIncityModel = function($q, seeCrowdService, mapService,
    configService, dateService) {
    var crowds = [],
        placeBasedCrowds = {},
        loadStatus = '';
    var map, selectedPlaceBasedCrowd;

    function loadCrowds(filter, serverRequest) {
        var def = $q.defer();
        if (serverRequest === true) {
            loadStatus = '';
        }
        if (loadStatus === 'loaded') {
            def.resolve(crowds);
        } else if (loadStatus === 'pending') {
            def.resolve([]);
        } else {
            loadStatus = 'pending';
            seeCrowdService.retrieveCrowds(filter).then(function(results) {
                    crowds = results;
                    loadPlaceBasedCrowds();
                    loadStatus = 'loaded';
                    def.resolve(crowds);
                },
                function() {
                    def.reject;
                });
        }
        return def.promise;
    }

    function loadPlaceBasedCrowds() {
        var i, now = new Date().getTime();
        placeBasedCrowds = {};
        for (i = 0; i < crowds.length; i++) {
            var crowd = crowds[i];
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
            if (!placeBasedCrowds[crowd.placeKey].crowdLast) {
                placeBasedCrowds[crowd.placeKey].crowdLast = crowd;
                // placeBasedCrowds[crowd.placeKey].crowdLast = crowd.crowdValue;
                // placeBasedCrowds[crowd.placeKey].lastUpdateDate = crowd.crowdDate;
                // placeBasedCrowds[crowd.placeKey].lastUpdatePass = crowd.lastUpdatePass;
            }
            placeBasedCrowds[crowd.placeKey].crowdCount += 1;
            placeBasedCrowds[crowd.placeKey].crowdValue += crowd.crowdValue;
            placeBasedCrowds[crowd.placeKey].crowds.push(crowd);
            placeBasedCrowds[crowd.placeKey].crowdAverage = Math.round(
                placeBasedCrowds[crowd.placeKey].crowdValue / placeBasedCrowds[
                    crowd.placeKey].crowdCount);
        }
    }

    function getCrowds() {
        return crowds;
    }

    function getPlaceBasedCrowds() {
        return Object.keys(placeBasedCrowds).length === 0 ? {} :
            placeBasedCrowds;
    }

    function loadMap(DOMElementId, boundingBox) {
        map = mapService.initMap(DOMElementId, boundingBox.latitude.lower,
            boundingBox.longitude.lower, boundingBox.latitude.upper, boundingBox.longitude
            .upper);
    }

    function markPlaceBasedCrowdsOnMap() {
        var placeBasedCrowdKey, placeBasedCrowd;
        for (placeBasedCrowdKey in placeBasedCrowds) {
            placeBasedCrowd = placeBasedCrowds[placeBasedCrowdKey];

            (function(placeBasedCrowd) {
                mapService.markPlaceOnMap(map, placeBasedCrowd,
                    function() {
                        selectPlaceBasedCrowd(placeBasedCrowd);
                    });
            })(placeBasedCrowd);
        }
    }

    function selectPlaceBasedCrowd(placeBasedCrowd) {
        selectedPlaceBasedCrowd = placeBasedCrowd;
        if (placeBasedCrowd) {
            app.navi.pushPage('templates/see-crowd-detail.html', {
                crowdType: 'incity'
            });
        }
    }

    function getSelectedPlaceBasedCrowd() {
        return selectedPlaceBasedCrowd;
    }

    return {
        loadCrowds: loadCrowds,
        getCrowds: getCrowds,
        getPlaceBasedCrowds: getPlaceBasedCrowds,
        loadMap: loadMap,
        markPlaceBasedCrowdsOnMap: markPlaceBasedCrowdsOnMap,
        selectPlaceBasedCrowd: selectPlaceBasedCrowd,
        getSelectedPlaceBasedCrowd: getSelectedPlaceBasedCrowd
    };
};

angular.module('seeCrowd.Model')
    .factory('seeCrowdIncityModel', ['$q', 'seeCrowdService', 'mapService',
        'configService', 'dateService', seeCrowdIncityModel
    ]);

var setCrowdModel = function($q, setCrowdService, mapService) {
  var selectedPlace;
  var nearbyPlaces = [];
  var loadStatus = '';

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    setCrowdService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }

  function selectPlace(place) {
    selectedPlace = place;
    app.navi.pushPage('templates/set-crowd-level.html');
  }

  function getSelectedPlace() {
    return selectedPlace;
  }

  function loadNearbyPlaces(location, serverRequest) {
    var def = $q.defer(),
      servicePromiseArray = [],
      services = [mapService, setCrowdService];

    if (serverRequest === true) {
      nearbyPlaces = [];
      loadStatus = '';
    }
    if (loadStatus === 'loaded') {
      def.resolve(nearbyPlaces);
    } else if (loadStatus === 'pending') {
      def.resolve([]);
    } else {
      loadStatus = 'pending';

      angular.forEach(services, function(value, key) {
        servicePromiseArray.push(value.retrieveNearbyPlaces(location).then(
          function(entries) {
            if(entries && entries.length > 0) {
              Array.prototype.push.apply(nearbyPlaces,entries);
            }
          }));
      });

      $q.all(servicePromiseArray).then(function() {
          loadStatus = 'loaded';
          def.resolve(nearbyPlaces);
        },
        function() {
          def.resolve(nearbyPlaces);
        });
      return def.promise;
    }
    return def.promise;
  }

  function getNearbyPlaces() {
    return nearbyPlaces;
  }
  return {
    insertCrowd: insertCrowd,
    selectPlace: selectPlace,
    getSelectedPlace: getSelectedPlace,
    getNearbyPlaces: getNearbyPlaces,
    loadNearbyPlaces: loadNearbyPlaces
  };
};

angular.module('setCrowd.Model', ['setCrowd.Service', 'map.Service'])
  .factory('setCrowdModel', ['$q', 'setCrowdService', 'mapService',
    setCrowdModel
  ]);

var backendlessService = function($rootScope, $q, crowdRest, formatterService) {

    function init() {
        var APPLICATION_ID = 'A556DD00-0405-02E1-FFF4-43454755FC00',
            SECRET_KEY = '98B3E3B5-F807-2E77-FF87-8A7D553DE200',
            VERSION = 'v1'; //default application version;
        Backendless.initApp(APPLICATION_ID, SECRET_KEY, VERSION);
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
            crowdLocationLatitude: place.location.latitude,
            crowdLocationLongitude: place.location.longitude,
            placeVicinity: place.vicinity,
            placeDistrict: place.district,
            placePhoto: place.photo
        });
        crowds.save(crowdObject, new Backendless.Async(onSuccess, onFailure));
    }

    // function retrievePlace(placeKey, onSuccess) {
    //   var def = $q.defer();
    //   var places = Backendless.Persistence.of(Place);
    //   var query = new Backendless.DataQuery();
    //   query.condition = "placeKey = '" + placeKey + "'";
    //   places.find(query, new Backendless.Async(function(result) {
    //     if (result.data.length > 0) {
    //       def.resolve(result.data[0]);
    //     } else {
    //       def.resolve(undefined);
    //     }
    //   }, function(error) {
    //     def.resolve(undefined);
    //   }));
    //   return def.promise;
    // }
    //
    // function insertPlace(place, onSuccess, onFailure) {
    //
    //   retrievePlace(place.placeKey).then(function(existingPlace) {
    //       if (existingPlace) {
    //         onSuccess(existingPlace);
    //       } else {
    //         var places = Backendless.Persistence.of(Place);
    //         var placeObject = new Place({
    //           placeKey: place.key,
    //           placeName: place.name,
    //           placeSource: place.source,
    //           placeSid: place.sid,
    //           placeLocationLatitude: place.location.latitude,
    //           placeLocationLongitude: place.location.longitude
    //         });
    //         places.save(placeObject, new Backendless.Async(onSuccess,
    //           onFailure));
    //       }
    //     },
    //     function() {
    //       def.reject;
    //     });
    // }

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

    return {
        init: init,
        insertCrowd: insertCrowd,
        retrieveCrowds: retrieveCrowds,
        giveFeedback: giveFeedback,
        insertDevice: insertDevice,
        retrieveDevice: retrieveDevice,
        //insertPlace: insertPlace,
        reportCrowd: reportCrowd,
        retrieveNearbyPlaces: retrieveNearbyPlaces
    };
};

angular.module('backendless', ['rest', 'formatter'])
    .factory('backendlessService', ['$rootScope', '$q', 'crowdRest', 'formatterService', backendlessService]);

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
    SEE_CROWDS_IN_RADIUS: 0.5
  };
};

angular.module('config', [])
  .factory('configService', configService);

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

  return {
    init: init,
    insertCrowd: insertCrowd,
    retrieveCrowds: retrieveCrowds,
    giveFeedback: giveFeedback,
    insertDevice: insertDevice,
    retrieveDevice: retrieveDevice,
    //insertPlace: insertPlace,
    reportCrowd: reportCrowd,
    retrieveNearbyPlaces: retrieveNearbyPlaces
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

var identificationService = function($q, guidService, fileService) {
  var DID;

  function loadDeviceId(fileSystemIncluded) {
    var def = $q.defer();
    if (fileSystemIncluded === true && myApp.isCordovaApp) {
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
            "DATE": "Date",
            "NAME": "Place Name",
            "LAST_VALUE": "Last",
            "AVERAGE_VALUE": "Avg.",
            "MIN_AGO": "min(s) ago",
            "NO_PLACE": "No recent crowd. Tab to enter one!",
            "NO_LOCATION": "No location data. Make sure your device's location service is accessible, then tab to refresh!",
            "SEARCH_INCITY": "Search: Last One Hour, Around 15 kilometers",
            "SEARCH_HERE": "Search: Last One Hour, Around 50 meters"
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
            "NO_PLACE": "No places around. Tab to enter a custom place!",
            "NO_LOCATION": "No location data. Make sure your device's location service is accessible, then tab to refresh!",
            "PULL_TO_REFRESH": "Pull down to refresh",
            "RELEASE_TO_REFRESH": "Release to refresh"
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
  function loadLangData() {
    if (navigator.globalization !== null && navigator.globalization !==
      undefined) {
      navigator.globalization.getPreferredLanguage(
        function(language) {
          getLangFile(language.value);
        },
        function(error) {
          getLangFile();
        }
      );
      //Normal browser detection
    } else {
      if (window.navigator.language !== null && window.navigator.language !==
        undefined) {
        getLangFile(window.navigator.language);
      }
    }
  }

  function getLangFile(lang) {
    if (!lang) {
      $rootScope.lang = defaultLanguageModel;
    } else {
      prefLang = lang.substring(0, 2);
    }
    $http.get("lang/" + prefLang + ".json").then(function(response) {
      $rootScope.lang = response.data;
    }, function() {
      getLangFile();
    });
  }

  return {
    loadLangData: loadLangData
  };
};

angular.module('lang')
  .factory('langService', ['$q', '$http', '$rootScope', langService]);


angular.module('google', []).factory('googleService', ['$compile','$rootScope', function($compile, $rootScope) {
	
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

		var contentString = '<div ng-controller="seeCrowdInmapController">'+
		'<div class="crowd-main-body" ng-click="selectPlaceBasedCrowd(placeBasedCrowd)">' +
		'<div class="crowd-left">' +
		'<div class="crowd-source-icon">' +
		'<img ng-src="img/sources/{{placeBasedCrowd.placeSource}}.png" />' +
		'</div>' +
		'</div>' +
		'<div class="crowd-center">' +
		'<div class="crowd-place-name">{{placeBasedCrowd.placeName}}</div>' +
		'<div class="crowd-time">{{placeBasedCrowd.crowdLast.lastUpdatePass}} {{$root.lang.SEE_CROWD_MENU.MIN_AGO}}</div>' +
		'</div>' +
		'<div class="crowd-right">' +
		'<div class="crowd-last-value">Last {{placeBasedCrowd.crowdLast.crowdValue}}%</div>' +
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
		'<div class="crowd-average-text">Avg. {{placeBasedCrowd.crowdAverage}}%</div>'+
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
			radius: 75,
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
		return vicinity.replace("No:", "<notoreplaceback>").replace("No, ", "").replace("No", "").replace("<notoreplaceback>", "No:");
	}

	return {
		initMap: initMap,
		setMapBoundingBox: setMapBoundingBox,
		markPlaceOnMap: markPlaceOnMap,
		getNearbyPlaces: getNearbyPlaces
	};
}]);
var mapService = function($q, $rootScope, googleService) {

    function checkCurrentLocation() {
        var watchId, newLocation, oldLocation;
        if (!$rootScope.location) {
            $rootScope.location = {};
        }
        oldLocation = $rootScope.location;
        console.log('checking location...location was: ' + JSON.stringify(
            oldLocation));
        navigator.geolocation.getCurrentPosition(function(position) {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
            watchId = navigator.geolocation.watchPosition(function() {});
            newLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            console.log('location successfully gained: ' + JSON.stringify(
                newLocation));
            $rootScope.location = newLocation;
            localStorage.setItem('location', angular.toJson(newLocation));
            $rootScope.$broadcast('locationChanged', {
                oldLocation: oldLocation
            });
        }, function(err) {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
            console.log('location failed...');
            $rootScope.location = {
                error: {
                    code: err.code,
                    message: err.message
                }
            };
            $rootScope.$broadcast('locationChanged', {
                oldLocation: oldLocation
            });
        }, {
            enableHighAccuracy: true,
            timeout: 10000
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
        googleService.markPlaceOnMap(map, placeBasedCrowd, clickEvent);
    }

    function retrieveNearbyPlaces(location) {
        var def = $q.defer();
        googleService.getNearbyPlaces(location, function(nearbyPlaces) {
                def.resolve(nearbyPlaces);
            },
            function() {
                def.resolve([]);
            });
        return def.promise;
    }

    return {
        getBoundingBox: getBoundingBox,
        retrieveNearbyPlaces: retrieveNearbyPlaces,
        checkCurrentLocation: checkCurrentLocation,
        initMap: initMap,
        setMapBoundingBox: setMapBoundingBox,
        markPlaceOnMap: markPlaceOnMap,
        getDistanceBetweenLocations: getDistanceBetweenLocations
    };
};

angular.module('map.Service', ['google'])
    .factory('mapService', ['$q', '$rootScope', 'googleService', mapService
    ]);

angular.module('rest', ['ngResource']).factory('crowdRest', ['$resource',
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
]);

var seeCrowdService = function(dbService) {

  //filter.date.start, filter.date.end,
  //filter.location.latitude.upper, filter.location.latitude.lower, filter.location.longitude.upper, filter.location.longitude.lower
  function retrieveCrowds(filter) {
    return dbService.retrieveCrowds(filter);
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

angular.module('seeCrowd.Service', ['db'])
  .factory('seeCrowdService', ['dbService', seeCrowdService]);

var setCrowdService = function($rootScope, dbService, dateService, mapService) {

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    dbService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }


  function retrieveNearbyPlaces(location) {

    function getFilter() {
      var now = dateService.getDBDate(new Date());
      var oneHourAgo = new Date(new Date(now).setHours(now.getHours() - 1));
      var boundingBox = mapService.getBoundingBox($rootScope.location, 0.05);

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

  return {
    insertCrowd: insertCrowd,
    retrieveNearbyPlaces: retrieveNearbyPlaces
  };
};

angular.module('setCrowd.Service', ['db', 'date', 'map.Service'])
  .factory('setCrowdService', ['$rootScope' ,'dbService', 'dateService', 'mapService', setCrowdService]);

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
