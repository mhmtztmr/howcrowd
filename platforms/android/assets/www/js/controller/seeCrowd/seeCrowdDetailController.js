app.controller('seeCrowdDetailController', ['$rootScope', '$scope',
  'seeCrowdHereModel', 'seeCrowdIncityModel', 'feedbackModel',
  function($rootScope, $scope, seeCrowdHereModel, seeCrowdIncityModel,
    feedbackModel) {
    $scope.crowdType = app.navi.getCurrentPage().options.crowdType;
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
    //
    // $scope.show = function(dlg) {
    //   ons.createDialog(dlg).then(function(dialog) {
    //     dialog.show();
    //   });
    // };

    ons.createPopover('templates/popover.html', {
      parentScope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $scope.options = [{
      label: 'Bilgi / Harita',
      fnc: function() {
        app.navi.pushPage('templates/see-crowd-inmap.html');
      }
    }, {
      label: 'Paylaş',
      fnc: function() {
        //alert('hey');
      }
    }, {
      label: 'Bildir',
      fnc: function() {
        ons.createDialog('templates/report-crowd.html').then(function(
          dialog) {
          dialog.show();
        });
      }
    }];
  }
]);
