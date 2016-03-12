var seeCrowdHereModel = function($q, seeCrowdService, mapService, dateService) {
  var crowds = [],
    placeBasedCrowds = {},
    loadStatus = '',
    selectedPlaceBasedCrowd, baseLocation;

  function setBaseLocation(location) {
    baseLocation = location;
  }

  function getBaseLocation() {
    return baseLocation;
  }

  function loadCrowds(filter, serverRequest) {
    var def = $q.defer();
    if (serverRequest === true) {
      loadStatus = '';
    }
    if (loadStatus === 'loaded') {
      def.resolve(crowds);
    } else if (loadStatus === 'pending') {
      def.resolve([]);
    } else {
      loadStatus === 'pending';
      seeCrowdService.retrieveCrowds(filter).then(function(results) {
          crowds = results;
          loadPlaceBasedCrowds();
          loadStatus = 'loaded';
          def.resolve(crowds);
        },
        function() {
          def.reject;
        });
    }
    return def.promise;
  }

  function loadPlaceBasedCrowds() {
    var i, now = new Date().getTime();
    placeBasedCrowds = {};
    for (i = 0; i < crowds.length; i++) {
      var crowd = crowds[i];
      crowd.lastUpdatePass = Math.round((now - crowd.crowdDate) / (1000 * 60));
      if (!placeBasedCrowds[crowd.placeKey]) {
        placeBasedCrowds[crowd.placeKey] = {
          crowds: [],
          crowdCount: 0,
          crowdValue: 0
        };
      }
      placeBasedCrowds[crowd.placeKey].crowdLocation = crowd.crowdLocation;
      placeBasedCrowds[crowd.placeKey].placeName = crowd.placeName;
      placeBasedCrowds[crowd.placeKey].placeSource = crowd.placeSource;
      placeBasedCrowds[crowd.placeKey].lastUpdateDate = crowd.crowdDate;
      placeBasedCrowds[crowd.placeKey].lastUpdatePass = crowd.lastUpdatePass;
      if (!placeBasedCrowds[crowd.placeKey].crowdLast) {
        placeBasedCrowds[crowd.placeKey].crowdLast = crowd.crowdValue;
      }
      placeBasedCrowds[crowd.placeKey].crowdCount += 1;
      placeBasedCrowds[crowd.placeKey].crowdValue += crowd.crowdValue;
      placeBasedCrowds[crowd.placeKey].crowds.push(crowd);
      placeBasedCrowds[crowd.placeKey].crowdAverage = Math.round(
        placeBasedCrowds[crowd.placeKey].crowdValue / placeBasedCrowds[
          crowd.placeKey].crowdCount);
    }
  }

  function getCrowds() {
    return crowds;
  }

  function getPlaceBasedCrowds() {
    return Object.keys(placeBasedCrowds).length === 0 ? {} :
      placeBasedCrowds;
  }

  function selectPlaceBasedCrowd(placeBasedCrowd) {
    selectedPlaceBasedCrowd = placeBasedCrowd;
    if (placeBasedCrowd) {
      app.navi.pushPage('templates/see-crowd-detail.html', {
        crowdType: 'here'
      });
    }
  }

  function getSelectedPlaceBasedCrowd() {
    return selectedPlaceBasedCrowd;
  }

  function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
    seeCrowdService.giveFeedback(crowd, isPositive, onSuccess, onFailure);
  }

  return {
    loadCrowds: loadCrowds,
    getCrowds: getCrowds,
    getPlaceBasedCrowds: getPlaceBasedCrowds,
    selectPlaceBasedCrowd: selectPlaceBasedCrowd,
    getSelectedPlaceBasedCrowd: getSelectedPlaceBasedCrowd,
    giveFeedback: giveFeedback,
    setBaseLocation: setBaseLocation,
    getBaseLocation: getBaseLocation
  };
};

angular.module('seeCrowd.Model', ['seeCrowd.Service', 'map.Service',
    'date'
  ])
  .factory('seeCrowdHereModel', ['$q', 'seeCrowdService', 'mapService',
    'dateService', seeCrowdHereModel
  ]);
