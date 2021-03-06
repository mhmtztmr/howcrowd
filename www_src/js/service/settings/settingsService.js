var settingsService = function($rootScope, $log) {
    function loadSettings() {
        return new Promise(function(resolve, reject){
            var settings = localStorage.getItem('settings');
            if (!settings) {
                $rootScope.settings = {
                    isCustomPlacesEnabled : true
                };
                saveSettings();
            } else {
                $rootScope.settings = JSON.parse(settings);
            }
            $log.log('Settings loaded.');
            resolve();
        });
    }

    function saveSettings() {
        localStorage.setItem('settings', JSON.stringify($rootScope.settings));
    }

    return {
        loadSettings: loadSettings,
        saveSettings: saveSettings
    };
};

angular.module('settings', [])
    .factory('settingsService', ['$rootScope', '$log', settingsService]);
