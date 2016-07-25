var seeCrowdIncityModel = function($q, seeCrowdService, mapService,
    configService, dateService) {
    var crowds = [],
        placeBasedCrowds = {},
        loadStatus = '';
    var map, selectedPlaceBasedCrowd;

    function loadCrowds(filter, serverRequest, onSuccess, onFailure) {
        if (serverRequest === true) {
            loadStatus = '';
        }
        if (loadStatus === 'loaded') {
            onSuccess(crowds);
        } else if (loadStatus === 'pending') {
             onSuccess([]);
        } else {
            loadStatus = 'pending';
            seeCrowdService.retrieveCrowds(filter).then(function(results) {
                    crowds = results;
                    loadPlaceBasedCrowds();
                    loadStatus = 'loaded';
                    onSuccess(crowds);
                },
                function() {
                    onFailure();
                });
        }
    }

    function loadPlaceBasedCrowds() {
        var i, now = new Date().getTime();
        placeBasedCrowds = {};
        for (i = 0; i < crowds.length; i++) {
            var crowd = crowds[i];
            // crowd.crowdFeedback.negativeFeedback = 3;
            // crowd.crowdFeedback.positiveFeedback = 5;
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
            placeBasedCrowds[crowd.placeKey].placeDistrict = crowd.placeDistrict;
            placeBasedCrowds[crowd.placeKey].placePhoto = crowd.placePhoto;
            placeBasedCrowds[crowd.placeKey].placeDistance = 10;
            if (!placeBasedCrowds[crowd.placeKey].crowdLast) {
                placeBasedCrowds[crowd.placeKey].crowdLast = crowd;
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

    function loadMap(DOMElementId, boundingBox) {
        map = mapService.initMap(DOMElementId, boundingBox.latitude.lower,
            boundingBox.longitude.lower, boundingBox.latitude.upper, boundingBox.longitude
            .upper);
    }

    function markPlaceBasedCrowdsOnMap() {
        var placeBasedCrowdKey, placeBasedCrowd;
        for (placeBasedCrowdKey in placeBasedCrowds) {
            placeBasedCrowd = placeBasedCrowds[placeBasedCrowdKey];

            (function(placeBasedCrowd) {
                mapService.markPlaceOnMap(map, placeBasedCrowd,
                    function() {
                        selectPlaceBasedCrowd(placeBasedCrowd);
                    });
            })(placeBasedCrowd);
        }
    }

    function selectPlaceBasedCrowd(placeBasedCrowd) {
        selectedPlaceBasedCrowd = placeBasedCrowd;
        if (placeBasedCrowd) {
            app.navi.pushPage('templates/see-crowd-detail.html');
        }
    }

    function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
        seeCrowdService.giveFeedback(crowd, isPositive, onSuccess, onFailure);
    }

    function getSelectedPlaceBasedCrowd() {
        return selectedPlaceBasedCrowd;
    }

    return {
        loadCrowds: loadCrowds,
        getCrowds: getCrowds,
        getPlaceBasedCrowds: getPlaceBasedCrowds,
        loadMap: loadMap,
        markPlaceBasedCrowdsOnMap: markPlaceBasedCrowdsOnMap,
        selectPlaceBasedCrowd: selectPlaceBasedCrowd,
        getSelectedPlaceBasedCrowd: getSelectedPlaceBasedCrowd,
        giveFeedback: giveFeedback
    };
};

angular.module('seeCrowd.Model', ['seeCrowd.Service', 'map.Service', 'date'])
    .factory('seeCrowdIncityModel', ['$q', 'seeCrowdService', 'mapService',
        'configService', 'dateService', seeCrowdIncityModel
    ]);
