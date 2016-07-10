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
