app.controller('aboutController', ['$scope', function($scope) {

	$scope.onPageShown = function(){
        modal.hide();
    };
        
	$scope.skip = function(){
		if(app.navi) {
			app.navi.popPage();
		}
		else {
			menu.setMainPage('templates/crowd.html');
		}
	};
}]);
