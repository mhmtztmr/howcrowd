var settingsService = function($rootScope) {
    function loadSettings() {
        var settings = localStorage.getItem('settings');
        if (!settings) {
            $rootScope.settings = {
                //isCustomPlacesEnabled : true
                isCustomPlacesEnabled : false
            }
            saveSettings();
        } else {
            //$rootScope.settings = JSON.parse(settings);
            $rootScope.settings = {
                isCustomPlacesEnabled : false
            }
        }
        window.console.log('Settings loaded.');
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
    .factory('settingsService', ['$rootScope', settingsService]);
