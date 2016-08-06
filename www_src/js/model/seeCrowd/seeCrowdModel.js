angular.module('seeCrowd.Model', ['seeCrowd.Service', 'map.Service', 'date', 'location.Service'])
    .factory('seeCrowdModel', ['$q', 'seeCrowdService', 'mapService',
        'configService', 'dateService', '$rootScope', 'locationService', function($q, seeCrowdService, mapService,
            configService, dateService, $rootScope, locationService) {
            var selectedPlaceBasedCrowd, placeBasedCrowdsArray = [], boundingBox,
            mapDivId = 'map', map, markers = [], reload = true;

            function loadCrowds(filter, onSuccess, onFailure) {
                boundingBox = mapService.getBoundingBox($rootScope.location, 0.1);
                seeCrowdService.retrieveCrowds(filter).then(function(results) {
                        onSuccess(loadPlaceBasedCrowds(results));
                    },
                    function() {
                        onFailure();
                    });
            }

            function loadPlaceBasedCrowds(crowds) {
                var i, crowd, crowdFeedbackMargin, now = new Date().getTime(), distance, placeBasedCrowds = {};
                placeBasedCrowdsArray = [];
                for (i = 0; i < crowds.length; i++) {
                    crowd = crowds[i];
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

                    //average algorithm including feedbacks
                    crowdFeedbackMargin = 1 + crowd.crowdFeedback.positiveFeedback - crowd.crowdFeedback.negativeFeedback
                    if(crowdFeedbackMargin > 0) {
                        placeBasedCrowds[crowd.placeKey].crowdCount += crowdFeedbackMargin;
                        placeBasedCrowds[crowd.placeKey].crowdValue += crowdFeedbackMargin * crowd.crowdValue;
                    }
                    placeBasedCrowds[crowd.placeKey].crowdAverage = Math.round(
                        placeBasedCrowds[crowd.placeKey].crowdValue / placeBasedCrowds[
                            crowd.placeKey].crowdCount);

                    placeBasedCrowds[crowd.placeKey].crowds.push(crowd);

                    if($rootScope.location && $rootScope.location.latitude && $rootScope.location.longitude) {
                        distance = locationService.getDistanceBetweenLocations($rootScope.location, crowd.crowdLocation);
                        if(distance > 0.03) {
                            placeBasedCrowds[crowd.placeKey].distanceGroup = 10;
                        }
                        else {
                            placeBasedCrowds[crowd.placeKey].distanceGroup = 0;
                        }
                    }
                }
                placeBasedCrowdsArray = Object.keys(placeBasedCrowds).map(function(key) {
                    return placeBasedCrowds[key];
                });
                return placeBasedCrowdsArray;
            }

            function markPlaces() {
                var placeBasedCrowd, i;
                for (i = 0; i < placeBasedCrowdsArray.length; i++) {
                    placeBasedCrowd = placeBasedCrowdsArray[i];
                    markers.push(mapService.markPlaceOnMap(map, placeBasedCrowd,
                        function() {
                            selectPlaceBasedCrowd(placeBasedCrowd);
                        })
                    );
                }
            }

            function clearMap(){
                for (var i = 0; i < markers.length; i++ ) {
                    markers[i].setMap(null);
                }
                markers.length = 0;
                reload = true;
            }

            function loadMap() {
                if(!map) {
                    setTimeout(function(){
                        map = mapService.initMap(mapDivId, boundingBox.latitude.lower, boundingBox.longitude.lower, boundingBox.latitude.upper, boundingBox.longitude.upper);
                        markPlaces();
                        reload = false;
                    }, 100);
                }
                else if(reload && markers.length === 0) {
                    mapService.setMapBoundingBox(map, boundingBox.latitude.lower, boundingBox.longitude.lower, boundingBox.latitude.upper, boundingBox.longitude.upper);
                    markPlaces();
                    reload = false;
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
                loadMap: loadMap,
                clearMap: clearMap,
                selectPlaceBasedCrowd: selectPlaceBasedCrowd,
                getSelectedPlaceBasedCrowd: getSelectedPlaceBasedCrowd,
                giveFeedback: giveFeedback
            };
        }
    ]);