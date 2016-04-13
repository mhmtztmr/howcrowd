var langService = function($q, $http, $rootScope) {
  function loadLangData() {
    if (navigator.globalization !== null && navigator.globalization !==
      undefined) {
      navigator.globalization.getPreferredLanguage(
        function(language) {
          getLangFile(language.value);
        },
        function(error) {
          getLangFile();
        }
      );
      //Normal browser detection
    } else {
      if (window.navigator.language !== null && window.navigator.language !==
        undefined) {
        getLangFile(window.navigator.language);
      }
    }
  }

  function getLangFile(lang) {
    if (!lang) {
      $rootScope.lang = defaultLanguageModel;
    } else {
      prefLang = lang.substring(0, 2);
    }
    $http.get("lang/" + prefLang + ".json").then(function(response) {
      $rootScope.lang = response.data;
    }, function() {
      getLangFile();
    });
  }

  return {
    loadLangData: loadLangData
  };
};

angular.module('lang')
  .factory('langService', ['$q', '$http', '$rootScope', langService]);
