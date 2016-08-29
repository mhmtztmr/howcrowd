app.controller('seeCrowdDetailController', ['$rootScope', '$scope',
  'seeCrowdModel', 'feedbackModel', 'seeCrowdService', 'setCrowdModel', 'setCrowdService',
  function($rootScope, $scope, seeCrowdModel,
    feedbackModel, seeCrowdService, setCrowdModel, setCrowdService) {
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

    $scope.setCrowd = function(){
        var setCrowdItem = setCrowdService.convertSeeCrowdItemToSetCrowdItem($scope.selectedPlaceBasedCrowd);
        setCrowdModel.selectPlace(setCrowdItem);
    };

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
      app.seeCrowdNavi.resetToPage('templates/see-crowd.html');
    };

    $scope.reportReason = $scope.reportReasons[0].value;

    $scope.seeCrowdAttachment = function(crowd) {
      app.seeCrowdNavi.pushPage('templates/crowd-attachment-detail.html', {
        crowd: crowd, 
        animation:'slide'
      });
    };
  }
]);
