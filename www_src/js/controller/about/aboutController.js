app.controller('aboutController', ['$scope', function($scope) {
	$scope.skip = function(){
		menu.setMainPage('templates/crowd.html');
	};
}]);
