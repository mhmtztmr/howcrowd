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

                    app.navi.pages[2]._destroy();
                    app.navi.popPage({animation: 'lift'});

                    setCrowdService.setCrowd(crowdData, placeData, $rootScope.deviceObject).then(function(){
                        seeCrowdModel.setReload({list: true, map: true});
                        crowdTabbar.setActiveTab(0);
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
