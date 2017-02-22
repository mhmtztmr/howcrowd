app.controller('seeCrowdDetailController', ['$rootScope', '$scope', 'seeCrowdService', '$timeout', 'INTERFACE', 'seeCrowdModel', 'setCrowdModel',
    function($rootScope, $scope, seeCrowdService, $timeout, INTERFACE, seeCrowdModel, setCrowdModel) {
        $scope.selectedPlace = app.navi.topPage.pushedOptions.selectedPlace;

        $scope.onPageShown = function() {
           modal.hide();
        };

    	$scope.givePositiveFeedback = function(crowdObject) {
            giveFeedback(crowdObject, true);
        };

        $scope.giveNegativeFeedback = function(crowdObject) {
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

            var prevReload = seeCrowdModel.setReload({list: true, map: true});
            seeCrowdService.giveFeedback(crowdObject, isPositive).then(function() {},
                function() {
                    seeCrowdModel.setReload(prevReload);
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

        $scope.askCrowd = function() {
            modal.show();
            seeCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
                modal.hide();
                app.navi.pushPage('templates/ask-crowd-input.html', {animation: 'lift', selectedPlace: _place});
            }, function() {
                modal.hide();
                $scope.setMapClickable(false);
                this.loadingFailedDialog.show();
            });
        };

        $scope.setCrowd = function() {
            modal.show();
            setCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
                modal.hide();
                app.navi.pushPage('templates/set-crowd-level.html', {animation:'lift', selectedPlace: _place});
            }, function() {
                modal.hide();
                this.loadingFailedDialog.show();
            });
        };

        ons.createPopover('templates/popover.html', {
            parentScope: $scope
        }).then(function(popover) {
            //This is workaround for back button handler for crowd detail page with popover...
            popover.hide();
            $scope.popover = popover;
        });
        $scope.options = [{
            label: $rootScope.lang.SEE_CROWD_DETAIL_POPOVER_MENU.INFO,
            fnc: function() {
                $rootScope.seePlaceDetail($scope.selectedPlace);
            }
        }, {
            label: $rootScope.lang.SEE_CROWD_DETAIL_POPOVER_MENU.SHARE,
            fnc: function() {
                var placeName = $scope.selectedPlace.name,
                lastUpdateDatetime = new Date($scope.selectedPlace.lastUpdateDatetime).toLocaleString(),
                averageValue = $scope.selectedPlace.averageCrowdValue;

                INTERFACE.socialShare(placeName + ' [' + lastUpdateDatetime + ']\n' +
                    $rootScope.lang.SEE_CROWD_MENU.AVERAGE_VALUE + ': ' + averageValue + '%'); 
            }
        }];
    }
]);
