angular.module('seeCrowd.Model', ['seeCrowd.Service', 'map.Service', 'date', 'location', 'config', 'feedback'])
    .factory('seeCrowdModel', ['seeCrowdService', 'mapService', 'mapConstants','feedbackModel',
        'configService', 'dateService', '$rootScope', 'locationService', function(seeCrowdService, mapService, mapConstants,
            feedbackModel, configService, dateService, $rootScope, locationService) {
            var self = {}, 
            mapDivId = 'map', map, 
            currentLocationMarker, markersMap = {}, infowindow, 
            reload = true, loading,
            placesNextPage, placesMap = {};

            /*
            function loadNearbyPlaces() {
                return new Promise(function(resolve, reject){
                    seeCrowdService.getNearbyPlaces().then(function(placesObject) {
                        nearbyPlaceSourceIDs = [];
                        var i;
                        for(i = 0; i < placesObject.data.length; i++) {
                            placesObject.data[i].isNearby = true;
                            nearbyPlaceSourceIDs.push(placesObject.data[i].sourceID);
                        }
                        resolve(placesObject);
                    }, reject);
                });
            }
            */

            function isNearby(placeObject) {
                return nearbyPlaceSourceIDs.indexOf(placeObject.sourceID) > -1;
            }

            self.loadPlacesNextPage = function() {
                return new Promise(function(resolve, reject){
                    var farPromise = seeCrowdService.getPlaces(placesNextPage);
                    Promise.all([farPromise]).then(function(result) {
                        var i, places = [],
                        _places = result[0].data;
                        placesNextPage = result[0].nextPage.bind({_nextPage: result[0]._nextPage});
                        
                        for(i = 0; i < _places.length; i++) {
                            if(!placesMap[_places[i].sourceID]) {
                                _places[i].isNearby = false;
                                placesMap[_places[i].sourceID] = _places[i];
                            }
                            places.push(placesMap[_places[i].sourceID]);
                        }
                        resolve(places);
                    }, reject);
                });
            };

            self.getPlacesNextPage = function() {
                return placesNextPage;
            };

            self.loadPlaces = function() {
                return new Promise(function(resolve, reject){
                    if(loading === true) {
                        resolve(places);
                    }
                    else {
                        loading = true;
                        var nearbyPromise = seeCrowdService.getNearbyPlaces(),
                        farPromise = seeCrowdService.getPlaces();
                        Promise.all([nearbyPromise, farPromise]).then(function(result) {
                            var i, places = [],
                            _nearbyPlaces = result[0].data;
                            _places = result[1].data;
                            placesNextPage = result[1].nextPage.bind({_nextPage: result[1]._nextPage});
                            
                            for(i = 0; i < _nearbyPlaces.length; i++) {
                                if(!placesMap[_nearbyPlaces[i].sourceID]) {
                                    _nearbyPlaces[i].isNearby = true;
                                    placesMap[_nearbyPlaces[i].sourceID] = _nearbyPlaces[i];
                                    places.push(placesMap[_nearbyPlaces[i].sourceID]);
                                }
                                else {
                                    places.push(placesMap[_nearbyPlaces[i].sourceID]);   
                                }

                            }

                            for(i = 0; i < _places.length; i++) {
                                if(!placesMap[_places[i].sourceID]) {
                                    _places[i].isNearby = false;
                                    placesMap[_places[i].sourceID] = _places[i];
                                    places.push(placesMap[_places[i].sourceID]);
                                }
                                else if(!placesMap[_places[i].sourceID].isNearby) {
                                    places.push(placesMap[_places[i].sourceID]);
                                }
                            }

                            loading = false;
                            resolve(places);
                        }, function() {
                            loading = false;
                            reject();
                        });
                    }
                });
            };

            function loadPlacesInMapBox() {
                return new Promise(function(resolve, reject){
                    var boundingBox = mapService.getMapBoundingBox(map),
                    farPromise = seeCrowdService.getPlacesInBox(boundingBox);
                    Promise.all([farPromise]).then(function(result) {
                        var i, places = [],
                        _places = result[0].data;
                        for(i = 0; i < _places.length; i++) {
                            if(!placesMap[_places[i].sourceID]) {
                                _places[i].isNearby = false;
                                placesMap[_places[i].sourceID] = _places[i];
                            }
                            places.push(placesMap[_places[i].sourceID]);
                        }
                        resolve(places);
                    }, reject);
                });
            };

            function loadPlaceBasedCrowds(crowds) {
                var i, crowd, crowdFeedbackMargin, now = new Date().getTime(), distance, placeBasedCrowds = {};
                placeBasedCrowdsArray = [];
                for (i = 0; i < crowds.length; i++) {
                    crowd = crowds[i];
                    crowd.lastUpdatePass = Math.round((now - crowd.crowdDate) / (1000 * 60)); //mins
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
                    placeBasedCrowds[crowd.placeKey].placeSid = crowd.placeSid;
                    placeBasedCrowds[crowd.placeKey].placeDistrict = crowd.placeDistrict;
                    placeBasedCrowds[crowd.placeKey].placeVicinity = crowd.placeVicinity;
                    placeBasedCrowds[crowd.placeKey].placePhoto = crowd.placePhoto;
                    placeBasedCrowds[crowd.placeKey].placeType = crowd.placeType;

                    if (!placeBasedCrowds[crowd.placeKey].crowdLast) {
                        placeBasedCrowds[crowd.placeKey].crowdLast = crowd;
                    }

                    if(crowd.crowdValue >= 0) {
                        if(crowd.crowdPhoto){
                            placeBasedCrowds[crowd.placeKey].hasPhoto = true;
                        }
                        if(crowd.crowdText){
                            placeBasedCrowds[crowd.placeKey].hasText = true;
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
                    }
                    else {
                        placeBasedCrowds[crowd.placeKey].hasAsk = true;
                    }
                    placeBasedCrowds[crowd.placeKey].crowds.push(crowd);

                    //here algorithm
                    if($rootScope.location.latitude) {
                        distance = locationService.getDistanceBetweenLocations($rootScope.location, crowd.crowdLocation);
                        if(distance > configService.NEARBY_DISTANCE) {
                            placeBasedCrowds[crowd.placeKey].distanceGroup = 10; //not here
                        }
                        else {
                            placeBasedCrowds[crowd.placeKey].distanceGroup = 0; //here
                        }
                    }

                    crowd.feedbackable = 
                        crowd.lastUpdatePass <= configService.FEEDBACK_TIME * 60 && //entered just now
                        placeBasedCrowds[crowd.placeKey].distanceGroup === 0 && //here
                        $rootScope.device.id !== crowd.deviceId; //not me

                    crowd.myFeedback = feedbackModel.getFeedback(crowd.crowdId);
                    if(crowd.myFeedback) {
                        crowd.myFeedback = crowd.myFeedback.isPositive;
                    }
                }
                placeBasedCrowdsArray = Object.keys(placeBasedCrowds).map(function(key) {
                    return placeBasedCrowds[key];
                });
                return placeBasedCrowdsArray;
            }

            function markCurrentLocation() {
                if($rootScope.location.latitude) {
                    if(currentLocationMarker) {
                        currentLocationMarker.setMap(null);
                    }
                    currentLocationMarker = mapService.createMarker(
                        map, 
                        $rootScope.location, 
                        {
                            path: mapConstants.MARKERS.OTHER.PATHS.CURRENT_LOCATION,
                            anchor: mapConstants.MARKERS.OTHER.INFO.anchor,
                            scaledSize: mapConstants.MARKERS.OTHER.INFO.scaledSize
                        },
                        function(_infowindow){
                            if (infowindow) {
                                infowindow.close();
                            }
                            infowindow = _infowindow;
                        },
                        "your location"
                    );
                }
            }

            function markPlaces(places) {
                var place, i;
                for (i = 0; i < places.length; i++) {
                    place = places[i];
                    if(!markersMap[place.sourceID]) {
                        (function(place) {
                            var marker = mapService.createMarker(
                                map, 
                                place.location, 
                                {
                                    path: mapConstants.MARKERS.CROWD.PATHS[(Math.ceil(place.averageCrowdValue / 10) * 10)],
                                    anchor: mapConstants.MARKERS.CROWD.INFO.anchor,
                                    scaledSize: mapConstants.MARKERS.CROWD.INFO.scaledSize
                                },
                                function(_infowindow){
                                    if (infowindow) {
                                        infowindow.close();
                                    }
                                    infowindow = _infowindow;
                                    $rootScope.$broadcast('markerSelected', { place: place});
                                },
                                '<div><strong>' + place.name + '</strong>' + (place.address ? ('<br>' + place.address) : '')
                            );
                            markersMap[place.sourceID] = marker;
                        })(place);
                    }
                }
            }

            self.clearMap = function() {
                var i;
                for(i in markersMap) {
                    markersMap[i].setMap(null);
                    delete markersMap[i];
                }
                reload = true;
            };

            self.loadMap = function() {
                if(!map) {
                    setTimeout(function(){
                        var loaderTimeout;
                        map = mapService.initMap(mapDivId, $rootScope.location, {
                            'mousedown': function(){
                                $rootScope.$broadcast('markerDeselected');
                                if (infowindow) {
                                    infowindow.close();
                                }
                            },
                            'idle': function() {
                                if(loaderTimeout) {
                                    clearTimeout(loaderTimeout);
                                }
                                loaderTimeout = setTimeout(function() {
                                    loadPlacesInMapBox().then(function(places) {
                                        //self.clearMap();
                                        markPlaces(places);
                                    });
                                }, 1000);

                            }
                        });
                        markCurrentLocation();
                        reload = false;
                    }, 100);
                }
                else if(reload && Object.keys(markersMap).length === 0) {
                    //mapService.resetMap(map, $rootScope.location);
                    markCurrentLocation();
                    loadPlacesInMapBox().then(function(places) {
                        markPlaces(places);
                    });
                    reload = false;
                }
            };

            self.selectPlace = function(place) {
                return new Promise(function(resolve, reject) {
                    if(place.crowds) {
                        resolve(place);
                    }
                    else {
                        seeCrowdService.getCrowds(place).then(function(_crowds) {
                            place.crowds = _crowds;
                            resolve(place);
                        }, reject);
                    }
                });
            };

            return self;
        }
    ]);