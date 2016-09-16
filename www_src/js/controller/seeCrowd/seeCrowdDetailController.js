app.controller('seeCrowdDetailController', ['$rootScope', '$scope', 'seeCrowdService', '$timeout',
  function($rootScope, $scope, seeCrowdService, $timeout) {
    $scope.selectedPlace = app.seeCrowdNavi.topPage.pushedOptions.selectedPlace;

    $scope.givePositiveFeedback = function(crowdObject) {
      giveFeedback(crowdObject, true);
    };

    $scope.giveNegativeFeedback = function(crowd) {
      giveFeedback(crowdObject, false);
    };

    function giveFeedback(crowdObject, isPositive) {
      if((crowdObject.myFeedback !== undefined) || 
        (crowdObject.device.ID === $rootScope.deviceObject.ID)) {
        return;
      }

      crowdObject.myFeedback = isPositive;
      var tempPositiveFeedback = crowdObject.positiveFeedback,
      tempNegativeFeedback = crowdObject.negativeFeedback;
      if (isPositive) {
        crowdObject.positiveFeedback++;
      } else {
        crowdObject.negativeFeedback++;
      }

      seeCrowdService.giveFeedback(crowdObject, isPositive).then(function() {
      },
      function() {
        $timeout(function() {
          crowdObject.myFeedback = undefined;
          if (isPositive) {
            crowdObject.positiveFeedback = tempPositiveFeedback;
          } else {
            crowdObject.negativeFeedback = tempNegativeFeedback;
          }
        });
      });
    }

    /*
    $scope.dialogs = {
      'templates/report-crowd.html': {}
    };
    ons.createDialog('templates/report-crowd.html',  {
      parentScope: $scope
    }).then(
    function(
      dialog) {
      $scope.dialogs['templates/report-crowd.html'] = dialog;
    });
    */

    ons.createPopover('templates/popover.html', {
      parentScope: $scope
    }).then(function(popover) {
        //This is workaround for back button handler for crowd detail page with popover...
        //TODO: Blog post
        popover.hide();
        $scope.popover = popover;
    });
    $scope.options = [{
      label: $rootScope.lang.SEE_CROWD_DETAIL_POPOVER_MENU.INFO,
      fnc: function() {
        app.seeCrowdNavi.pushPage('templates/crowd-place-detail.html', {
          selectedPlace: $scope.selectedPlace, 
          animation:'lift'
        });
      }
    }, {
      label: $rootScope.lang.SEE_CROWD_DETAIL_POPOVER_MENU.SHARE,
      fnc: function() {
        var placeName = $scope.selectedPlace.name,
        lastUpdateDatetime = new Date($scope.selectedPlace.lastUpdateDatetime).toLocaleString(),
        averageValue = $scope.selectedPlace.averageCrowdValue;

        window.plugins.socialsharing.share(placeName + ' [' + lastUpdateDatetime + ']\n' +
            $rootScope.lang.SEE_CROWD_MENU.AVERAGE_VALUE + ': ' + averageValue + '%'); 
      }
    }];

    /*
    if ($scope.selectedPlace.source === 'custom') {
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
      app.seeCrowdNavi.resetToPage('templates/see-crowd.html');
    };

    $scope.reportReason = $scope.reportReasons[0].value;
    */

    $scope.seeCrowdAttachment = function(crowd) {
      app.seeCrowdNavi.pushPage('templates/crowd-attachment-detail.html', {
        crowd: crowd, 
        animation:'slide'
      });
    };
  }
]);
