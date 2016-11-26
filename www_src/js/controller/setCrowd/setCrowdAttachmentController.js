app.controller('setCrowdAttachmentController', ['$rootScope', '$scope',
    'setCrowdModel', 'setCrowdService', 'mapService', 'INTERFACE', 'seeCrowdModel',
        function($rootScope, $scope, setCrowdModel, setCrowdService, mapService, INTERFACE, seeCrowdModel) {
            $scope.selectedPlace =  app.navi.topPage.pushedOptions.selectedPlace;
            var selectedCrowdLevelIndex = app.navi.topPage.pushedOptions.selectedCrowdLevelIndex;
            var crowdLevels = app.navi.topPage.pushedOptions.crowdLevels;
            $scope.selectedCrowdLevel = crowdLevels[selectedCrowdLevelIndex];

            $scope.crowdText = {value: ''};

            $scope.insertCrowd = function() {
                function insertCrowd(photoUrl) {
                    var placeData = $scope.selectedPlace;
                    var crowdData = {
                        value: $scope.selectedCrowdLevel.value,
                        photoURL: photoUrl,
                        text: $scope.crowdText.value
                    };

                    setCrowdService.setCrowd(crowdData, placeData, $rootScope.deviceObject).then(function(){
                        seeCrowdModel.setReload({list: true, map: true});
                        while( app.navi.pages.length > 2) {
                            app.navi.pages[app.navi.pages.length - 1]._destroy();
                        }
                        app.navi.popPage({animation: 'lift'});
                        crowdTabbar.setActiveTab(0);
                        app.seeCrowdTabbar.setActiveTab(0, {animation: 'none'});
                    }, function(){
                        modal.hide();
                        this.loadingFailedDialog.show();
                    });
                }

                modal.show();
                if($scope.crowdPhoto){
                    var fileName = $rootScope.deviceObject.ID + (new Date()).valueOf() + '.png';
                    setCrowdService.uploadFile($scope.crowdPhoto, fileName, function(photoUrl){
                        insertCrowd(photoUrl.data);
                    }, function(){
                        modal.hide();
                        this.loadingFailedDialog.show();
                    });
                }
                else {
                    insertCrowd();
                }
            };

            $scope.decreaseCrowdLevel = function() {
                selectedCrowdLevelIndex = (selectedCrowdLevelIndex + 1) % crowdLevels.length;
                $scope.selectedCrowdLevel = crowdLevels[selectedCrowdLevelIndex];
                if(!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.increaseCrowdLevel = function() {
                selectedCrowdLevelIndex = (selectedCrowdLevelIndex + crowdLevels.length - 1) % crowdLevels.length;
                $scope.selectedCrowdLevel = crowdLevels[selectedCrowdLevelIndex];
                if(!$scope.$$phase) {
                    $scope.$apply();
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

            $scope.clearPhoto= function(){
                $scope.crowdPhoto = undefined;
            };
        }
    ]);
