app.controller('settingsController', ['$scope', '$rootScope', 'settingsService', function($scope, $rootScope, settingsService) {

	//custom place
	$scope.isCustomPlacesEnabled = $rootScope.settings.isCustomPlacesEnabled;
	setTimeout(function(){document.getElementById('custom-place-switch').addEventListener('change', function(e) {
		settingsService.saveSettings();
	});},100);
}]);
