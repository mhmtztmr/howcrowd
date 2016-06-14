app.controller('settingsController', ['$scope', '$rootScope', 'settingsService', function($scope, $rootScope, settingsService) {

	document.getElementById('custom-place-switch').addEventListener('change', function(e) {
		settingsService.saveSettings();
	});
	modal.hide();
}]);
