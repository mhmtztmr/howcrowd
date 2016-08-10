var langService = function($q, $http, $rootScope) {
  function loadLangData(callback) {
    window.console.log('Loading language data...');
    if (navigator.globalization !== null && navigator.globalization !==
      undefined) {
      navigator.globalization.getPreferredLanguage(
        function(language) {
          getLangFile(language.value).then(function(){
            window.console.log('Lang loaded: ' + language.value);
            callback();
          });
        },
        function(error) {
          getLangFile().then(function(){
            window.console.log('Lang loaded');
            callback();
          });
        }
      );
      //Normal browser detection
    } else {
      if (window.navigator.language !== null && window.navigator.language !==
        undefined) {
        getLangFile(window.navigator.language).then(function(){
          window.console.log('Lang loaded: ' + window.navigator.language);
          callback();
        });
      }
    }
  }

  function getLangFile(lang) {
    var def = $q.defer();
    if (!lang) {
        $rootScope.lang = defaultLanguageModel;
        def.resolve();
    } else {
        prefLang = lang.substring(0, 2);
        $http.get("lang/" + prefLang + ".json").then(function(response) {
            $rootScope.lang = response.data;
            def.resolve();
        }, function() {
            $rootScope.lang = defaultLanguageModel;
            def.resolve();
        });
    }

    return def.promise;
  }

  return {
    loadLangData: loadLangData
  };
};

angular.module('lang')
  .factory('langService', ['$q', '$http', '$rootScope', langService]);
