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
