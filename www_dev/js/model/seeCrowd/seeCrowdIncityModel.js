var seeCrowdIncityModel = function($q, seeCrowdService, mapService,
  configService,
  dateService) {
  var crowds = [],
    placeBasedCrowds = {},
    loadStatus = '',
    baseLocation;
  var boundingBox;
  var map, selectedPlaceBasedCrowd;

  function setBaseLocation(location) {
    baseLocation = location;
    boundingBox = mapService.getBoundingBox(baseLocation,
      configService.SEE_CROWDS_IN_RADIUS);
  }

  function getBaseLocation() {
    return baseLocation;
  }

  function getBoundingBox() {
    return boundingBox;
  }

  function getDefaultFilter() {
    var now = dateService.getDBDate(new Date());
    var oneHourAgo = new Date(new Date(now).setHours(now.getHours() - 1));

    return {
      location: boundingBox
    };
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
      if (!placeBasedCrowds[crowd.placeKey].crowdLast) {
        placeBasedCrowds[crowd.placeKey].crowdLast = crowd.crowdValue;
        placeBasedCrowds[crowd.placeKey].lastUpdateDate = crowd.crowdDate;
        placeBasedCrowds[crowd.placeKey].lastUpdatePass = crowd.lastUpdatePass;
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

  function loadMap(DOMElementId) {
    map = mapService.initMap(DOMElementId, boundingBox.latitude.lower,
      boundingBox.longitude.lower, boundingBox.latitude.upper, boundingBox.longitude
      .upper);
  }

  function setMapBoundingBox(swLat, swLng, neLat, neLng) {
    setBoundingBox(swLat, swLng, neLat, neLng);
    mapService.setMapBoundingBox(map, swLat, swLng, neLat, neLng);
  }

  function markPlaceBasedCrowdsOnMap() {
    var placeBasedCrowdKey, placeBasedCrowd;
    for (placeBasedCrowdKey in placeBasedCrowds) {
      placeBasedCrowd = placeBasedCrowds[placeBasedCrowdKey];

      (function(placeBasedCrowd) {
        mapService.markPlaceOnMap(map, placeBasedCrowd.crowdLocation.latitude,
          placeBasedCrowd.crowdLocation.longitude, placeBasedCrowd.crowdAverage,
          function() {
            selectPlaceBasedCrowd(placeBasedCrowd);
          });
      })(placeBasedCrowd);
    }
  }

  function selectPlaceBasedCrowd(placeBasedCrowd) {
    selectedPlaceBasedCrowd = placeBasedCrowd;
    if (placeBasedCrowd) {
      app.navi.pushPage('templates/see-crowd-detail.html', {
        crowdType: 'incity'
      });
    }
  }

  function getSelectedPlaceBasedCrowd() {
    return selectedPlaceBasedCrowd;
  }

  return {
    loadCrowds: loadCrowds,
    getCrowds: getCrowds,
    getPlaceBasedCrowds: getPlaceBasedCrowds,
    setBaseLocation: setBaseLocation,
    getBaseLocation: getBaseLocation,
    getBoundingBox: getBoundingBox,
    loadMap: loadMap,
    setMapBoundingBox: setMapBoundingBox,
    markPlaceBasedCrowdsOnMap: markPlaceBasedCrowdsOnMap,
    selectPlaceBasedCrowd: selectPlaceBasedCrowd,
    getSelectedPlaceBasedCrowd: getSelectedPlaceBasedCrowd
  };
};

angular.module('seeCrowd.Model')
  .factory('seeCrowdIncityModel', ['$q', 'seeCrowdService', 'mapService',
    'configService', 'dateService', seeCrowdIncityModel
  ]);
