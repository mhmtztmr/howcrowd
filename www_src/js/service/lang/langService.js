var langService = function($q, $http, $rootScope, defaultLanguageModel, $log) {
  function loadLangData() {
    return new Promise(function(resolve, reject){
      $log.log('Loading language data...');
      if (navigator.globalization !== null && navigator.globalization !==
        undefined) {
        navigator.globalization.getPreferredLanguage(
          function(language) {
            getLangFile(language.value).then(function(){
             $log.log('Lang loaded: ' + language.value);
              resolve();
            });
          },
          function() {
            getLangFile().then(function(){
              $log.log('Lang loaded');
              resolve();
            });
          }
        );
        //Normal browser detection
      } else {
        if (window.navigator.language !== null && window.navigator.language !==
          undefined) {
          getLangFile(window.navigator.language).then(function(){
            $log.log('Lang loaded: ' + window.navigator.language);
            resolve();
          });
        }
      }
    });
  }

  function getLangFile(lang) {
    var def = $q.defer(), prefLang;
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
  .factory('langService', ['$q', '$http', '$rootScope', 'defaultLanguageModel', '$log', langService]);
