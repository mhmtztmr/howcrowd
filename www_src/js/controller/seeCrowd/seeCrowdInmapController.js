app.controller('seeCrowdInmapController', ['$rootScope', '$scope', '$filter', 'seeCrowdModel', 'setCrowdModel',
    function($rootScope, $scope, $filter, seeCrowdModel, setCrowdModel) {

        $scope.onPageShown = function(){
            if(seeCrowdModel.isReload().map) {
                $scope.searchInput = {value: '', searchable: true};
                seeCrowdModel.loadMap().then(function() {
                    seeCrowdModel.setReload({map: false});
                }, function() {
                    this.loadingFailedDialog.show();
                    seeCrowdModel.setReload({map: false});
                });
            }
            
            crowdTabbar.setTabbarVisibility(false);

            document.getElementsByClassName('onsen-sliding-menu__menu')[0].previousSibling.previousSibling.style.display = 'none';
            
            [].forEach.call(document.querySelectorAll('.page__background'), function (el) {
                el.style.display = 'none';
            });
        };

        $scope.onPageHidden = function(){
            document.getElementsByClassName('onsen-sliding-menu__menu')[0].previousSibling.previousSibling.style.display = null;

            [].forEach.call(document.querySelectorAll('.page__background'), function (el) {
                el.style.display = null;
            });
        };

        $scope.askCrowd = function() {
            modal.show();
            seeCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
                modal.hide();
                app.navi.pushPage('templates/ask-crowd-input.html', {animation: 'lift', selectedPlace: _place});
            }, function() {
                modal.hide();
                this.loadingFailedDialog.show();
            });
        };

        $scope.seeCrowd = function() {
            modal.show();
            seeCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
                modal.hide();
                app.navi.pushPage('templates/see-crowd-detail.html', {animation:'lift', selectedPlace: _place});
            }, function() {
                modal.hide();
                this.loadingFailedDialog.show();
            });
        };

        //TODO: will be added
        $scope.setCrowd = function() {
            // modal.show();
            // setCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
            //     modal.hide();
            //     app.navi.pushPage('templates/set-crowd-level.html', {animation:'lift', selectedPlace: _place});
            // }, function() {
            //     modal.hide();
            //     this.loadingFailedDialog.show();
            // });
        };

        $scope.selectPlace = function() {
            modal.show();
            seeCrowdModel.selectPlace($scope.selectedPlace).then(function(_place) {
                modal.hide();
                if(_place.crowds && _place.crowds.length > 0) {
                    app.navi.pushPage('templates/see-crowd-detail.html', {animation:'lift', selectedPlace: _place});
                }
                else {
                    app.navi.pushPage('templates/ask-crowd-input.html', {animation: 'lift', selectedPlace: _place});
                }
            }, function() {
                modal.hide();
                this.loadingFailedDialog.show();
            });
        };

        $scope.searchInputChange = function() {
            setTimeout(function() {
                $scope.setMapClickable(!seeCrowdModel.isAutocompleteVisible());
            }, 300);
        };

        $scope.searchInput = {value: '', searchable: true};
        $scope.searchPlace = function() {
            if ($scope.searchInput.value.length > 1) {
                modal.show();
                seeCrowdModel.searchPlacesOnMap($scope.searchInput.value).then(function() {
                    modal.hide();
                }, function() {
                    modal.hide();
                    this.noPlaceFoundDialog.show();
                    $scope.setMapClickable(false);
                });
            } 
        };

        $scope.clearSearchInput = function(){
            $scope.searchInput = {value: '', searchable: true};
            seeCrowdModel.clearSearchMarkers();
        };

        $scope.setMapClickable = function(clickable) {
            seeCrowdModel.setMapClickable(clickable);
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
            $scope.setMapClickable(false);
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
