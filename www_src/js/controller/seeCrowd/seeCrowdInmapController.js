app.controller('seeCrowdInmapController', ['$rootScope', '$scope', '$filter', 'seeCrowdModel',
    function($rootScope, $scope, $filter, seeCrowdModel) {
        
        function loadMap(){
            seeCrowdModel.loadMap();
        }

        $scope.onMapShow = function(){
            loadMap();
        };

        $scope.askCrowd = function() {
            modal.show();
            seeCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
                modal.hide();
                app.seeCrowdNavi.pushPage('templates/ask-crowd-input.html', {animation: 'lift', selectedPlace: _place});
            }, function() {
                modal.hide();
                this.loadingFailedDialog.show();
            });
        };

        $scope.seeCrowd = function() {
            modal.show();
            seeCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
                modal.hide();
                app.seeCrowdNavi.pushPage('templates/see-crowd-detail.html', {animation:'lift', selectedPlace: _place});
            }, function() {
                modal.hide();
                this.loadingFailedDialog.show();
            });
        };

        $scope.selectPlace = function() {
            modal.show();
            seeCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
                modal.hide();
                if(_place.crowds && _place.crowds.length > 0) {
                    app.seeCrowdNavi.pushPage('templates/see-crowd-detail.html', {animation:'lift', selectedPlace: _place});
                }
                else {
                    app.seeCrowdNavi.pushPage('templates/ask-crowd-input.html', {animation: 'lift', selectedPlace: _place});
                }
            }, function() {
                modal.hide();
                this.loadingFailedDialog.show();
            });
        };

        $scope.searchInput = {value: '', searchable: true};

        $scope.searchPlace = function() {
            if ($scope.searchInput.value.length > 1) {
                seeCrowdModel.searchPlacesOnMap($scope.searchInput.value).then(undefined, function() {
                    this.noPlaceFoundDialog.show();
                });
            } 
        };

        $scope.clearSearchInput = function(){
            $scope.searchInput = {value: '', searchable: true};
            seeCrowdModel.clearSearchMarkers();
        };

        $scope.$on('$destroy', $rootScope.$on("markerSelected", function(event, args) {
            modal.hide();
            $scope.selectedPlace = args.place;
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }));
        $scope.$on('$destroy', $rootScope.$on("markerDeselected", function() {
            $scope.selectedPlace = undefined;
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }));
        $scope.$on('$destroy', $rootScope.$on("longpressForAskRequiresZoom", function() {
            this.zoomForAskDialog.show();
        }));
        //means the place is either selected from dropdown or selected from longpress options
        $scope.$on('$destroy', $rootScope.$on("unsearchableAsk", function(event, args) {
            $scope.searchInput.value = args.value;
            $scope.searchInput.searchable = false;
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }));
    }
]);
