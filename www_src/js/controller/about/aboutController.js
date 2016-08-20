app.controller('aboutController', ['$scope', function($scope) {
	$scope.skip = function(){
		menu.setMainPage('templates/see-crowd.html');
	};
}]);
