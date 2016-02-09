var seeCrowdModel = function($q, seeCrowdService, mapService, configService,
  dateUtil) {
  var crowds = [],
    placeBasedCrowds = {},
    deviceBasedCrowds = {};
  var loadStatus = '';
  var centerPoint;
  var boundingBox;
  var map;
  var selectedPlaceBasedCrowd;

  function setCenterPoint(cp) {
    if (cp) {
      centerPoint = cp;
      boundingBox = mapService.getBoundingBox(centerPoint,
        configService.SEE_CROWDS_IN_RADIUS);
    }
  }

  function getCenterPoint() {
    return centerPoint;
  }

  function setBoundingBox(swLat, swLng, neLat, neLng) {
    boundingBox = {
      latitude: {
        lower: swLat,
        upper: neLat
      },
      longitude: {
        lower: swLng,
        upper: neLng
      }
    }
  }

  function getBoundingBox() {
    return boundingBox;
  }

  function getDefaultFilter() {
    var now = dateUtil.getDBDate(new Date());
    var oneHourAgo = new Date(new Date(now).setHours(now.getHours() - 1));

    return {
      date: {
        start: oneHourAgo,
        end: now
      },
      location: boundingBox
    };
  }

  function loadCrowds(filter, serverRequest) {
    var def = $q.defer();
    if (!filter) {
      filter = getDefaultFilter();
    }
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
      if (placeBasedCrowds[crowd.placeKey]) {
        placeBasedCrowds[crowd.placeKey].crowdCount = placeBasedCrowds[crowd.placeKey]
          .crowdCount + 1;
        placeBasedCrowds[crowd.placeKey].crowdValue = placeBasedCrowds[crowd.placeKey]
          .crowdValue + crowd.crowdValue;
        placeBasedCrowds[crowd.placeKey].crowds.push(crowd);
      } else {
        placeBasedCrowds[crowd.placeKey] = {
          crowds: []
        };
        placeBasedCrowds[crowd.placeKey].crowds.push(crowd);
        placeBasedCrowds[crowd.placeKey].crowdCount = 1;
        placeBasedCrowds[crowd.placeKey].crowdValue = crowd.crowdValue;
        placeBasedCrowds[crowd.placeKey].crowdLocation = crowd.crowdLocation;
        placeBasedCrowds[crowd.placeKey].placeName = crowd.placeName;
        placeBasedCrowds[crowd.placeKey].placeSource = crowd.placeSource;
        placeBasedCrowds[crowd.placeKey].lastUpdateDate = crowd.crowdDate;
        placeBasedCrowds[crowd.placeKey].lastUpdatePass = Math.round((now -
          crowd.crowdDate) / (1000 * 60));
      }
      placeBasedCrowds[crowd.placeKey].crowdAverage = Math.round(
        placeBasedCrowds[crowd.placeKey]
        .crowdValue / placeBasedCrowds[crowd.placeKey].crowdCount);
    }
  }

  function getCrowds() {
    return crowds;
  }

  function getPlaceBasedCrowds() {
    return Object.keys(placeBasedCrowds).length === 0 ? undefined :
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
      ons.createDialog('crowd-detail.html').then(function(dialog) {
        dialog.show();
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
    setCenterPoint: setCenterPoint,
    getCenterPoint: getCenterPoint,
    setBoundingBox: setBoundingBox,
    getBoundingBox: getBoundingBox,
    loadMap: loadMap,
    setMapBoundingBox: setMapBoundingBox,
    markPlaceBasedCrowdsOnMap: markPlaceBasedCrowdsOnMap,
    selectPlaceBasedCrowd: selectPlaceBasedCrowd,
    getSelectedPlaceBasedCrowd: getSelectedPlaceBasedCrowd
  };
};

angular.module('seeCrowd.Model', ['seeCrowd.Service', 'map.Service', 'config',
    'util.date'
  ])
  .factory('seeCrowdModel', ['$q', 'seeCrowdService', 'mapService',
    'configService', 'dateUtil', seeCrowdModel
  ]);
