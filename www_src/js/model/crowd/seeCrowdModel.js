angular.module('seeCrowd.Model', ['seeCrowd.Service', 'map.Service', 'date', 'location', 'config', 'feedback'])
    .factory('seeCrowdModel', ['seeCrowdService', 'mapService', 'mapConstants','feedbackModel',
        'configService', 'dateService', '$rootScope', 'locationService', function(seeCrowdService, mapService, mapConstants,
            feedbackModel, configService, dateService, $rootScope, locationService) {
            var self = {}, 
            mapDivId = 'map', map, searchInputDivId = 'map-search-input',
            currentLocationMarker, markersMap = {}, searchMarkersMap = {}, infowindow, 
            loading,
            placesNextPage, hasPlacesNextPage, placesMap = {};

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

            self.loadPlacesNextPage = function() {
                return new Promise(function(resolve, reject){
                    var farPromise = seeCrowdService.getPlacesNextPage(placesNextPage);
                    Promise.all([farPromise]).then(function(result) {
                        var i, places = [],
                        _places = result[0].data;
                        hasPlacesNextPage = result[0]._nextPage;
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

            self.hasPlacesNextPage = function() {
                return hasPlacesNextPage;
            };

            self.loadPlaces = function() {
                return new Promise(function(resolve, reject){
                    if(loading === true) {
                        resolve(places);
                    }
                    else {
                        placesMap = {};
                        loading = true;
                        var nearbyPromise = seeCrowdService.getNearbyPlaces(),
                        farPromise = seeCrowdService.getPlaces();
                        Promise.all([nearbyPromise, farPromise]).then(function(result) {
                            var i, places = [],
                            _nearbyPlaces = result[0].data, _places = result[1].data;
                            hasPlacesNextPage = result[1]._nextPage;
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

            self.searchPlacesInList = function(query) {
                return new Promise(function(resolve, reject){
                    var farPromise = seeCrowdService.searchPlaces(query);
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

            self.searchPlacesOnMap = function(query){
                return new Promise(function(resolve, reject) {
                    mapService.searchPlaces(map, query, $rootScope.location, configService.FAR_DISTANCE).then(function(__places){
                        self.clearSearchMarkers();
                        var promise = seeCrowdService.getPlacesBySourceIDs(__places);
                        Promise.all([promise]).then(function(result) {
                            var i, places = mergePlaces(__places, result[0].data);
                            markSearchPlaces(places);
                            resolve();
                        }, reject);
                    }, reject);
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
            }

            self.markCurrentLocation = function() {
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
                        $rootScope.lang.MAP.YOUR_LOCATION
                    );
                }
            };

            function markPlace(place, _markerType) {
                var markerType = mapConstants.MARKERS.CROWD;
                if(_markerType) {
                    markerType = _markerType;
                }
                (function(place) {
                    var distance = Math.floor(locationService.getDistanceBetweenLocations(place.location, $rootScope.location));
                    var markerPath = markerType.PATHS.DEFAULT;
                    if(place.averageCrowdValue) {
                        markerPath = markerType.PATHS[(Math.ceil(place.averageCrowdValue / 10) * 10)];
                    }
                    var marker = mapService.createMarker(
                        map, 
                        place.location, 
                        {
                            path: markerPath,
                            anchor: markerType.INFO.anchor,
                            scaledSize: markerType.INFO.scaledSize
                        },
                        function(_infowindow){
                            if (infowindow) {
                                infowindow.close();
                            }
                            infowindow = _infowindow;
                            if(distance <= configService.FAR_DISTANCE){
                                modal.show();
                                var mappedPlace = placesMap[place.sourceID];
                                if(mappedPlace) {
                                    $rootScope.$broadcast('markerSelected', { place: mappedPlace});
                                }
                                else {
                                    seeCrowdService.getPlaceBySourceID(place).then(function(result) {
                                        var _place = place, __place = result.data[0];
                                        if(__place) {
                                            _place = __place;
                                        }
                                        placesMap[place.sourceID] = _place;
                                        $rootScope.$broadcast('markerSelected', { place: _place});
                                    });
                                }
                            }
                        },
                        '<div><strong>' + place.name + '</strong>' + 
                        (place.address ? ('<br>' + place.address) : '') +
                        (distance > configService.FAR_DISTANCE ? ('<br><div style="color:red; font-style: italic">' + $rootScope.lang.SEE_CROWD_MENU.TOO_FAR_TO_ASK + ': ' + distance + ' km</div>') : '') +
                        '</div>'
                    );
                    if(markerType.ID === mapConstants.MARKERS.SEARCH.ID){
                        searchMarkersMap[place.sourceID] = marker;
                    }
                    else {
                        markersMap[place.sourceID] = marker;
                    }
                })(place);
            }

            function markSearchPlaces(places) {
                console.log('marking search places...');
                var place, i;
                for (i = 0; i < places.length; i++) {
                    place = places[i];

                    if(markersMap[place.sourceID]) {
                        markersMap[place.sourceID].setMap(null);
                        delete markersMap[place.sourceID];
                        markPlace(place,  mapConstants.MARKERS.CROWD);
                        markersMap[place.sourceID].setVisible(false);
                    }

                    if(searchMarkersMap[place.sourceID]){
                        searchMarkersMap[place.sourceID].setMap(null);
                        delete searchMarkersMap[place.sourceID];
                    }
                    markPlace(place, mapConstants.MARKERS.SEARCH);
                }
            }

            function markPlaces(places) {
                console.log('marking places...');
                var place, i;
                for (i = 0; i < places.length; i++) {
                    place = places[i];
                    if(!markersMap[place.sourceID]) {
                        markPlace(place,  mapConstants.MARKERS.CROWD);
                    }

                    if(searchMarkersMap[place.sourceID]){
                        markersMap[place.sourceID].setVisible(false);
                    }
                }
            }

            self.clearMarkers = function() {
                console.log('clearing all markers...');
                self.clearSearchMarkers();
                var i;
                for(i in markersMap) {
                    if(markersMap.hasOwnProperty(i)) {
                        markersMap[i].setMap(null);
                        delete markersMap[i];
                    }
                }
            };

            self.clearSearchMarkers = function() {
                console.log('clearing search markers...');
                $rootScope.$broadcast('markerDeselected');
                if(infowindow) {
                    infowindow.close();
                }
                var i;
                for(i in searchMarkersMap) {
                    if(searchMarkersMap.hasOwnProperty(i)) {
                        if(markersMap[i]){
                            markersMap[i].setVisible(true);
                        }
                        searchMarkersMap[i].setMap(null);
                        delete searchMarkersMap[i];
                    }
                }
            };

            function initAutocomplete(){
                return new Promise(function(resolve, reject) {
                    var boundingBox = locationService.getBoundingBox($rootScope.location, configService.FAR_DISTANCE);
                    mapService.initAutocomplete(map, searchInputDivId, boundingBox, function(place){
                        $rootScope.$broadcast('unsearchableAsk', {value: place.name});
                        self.clearSearchMarkers();
                        if (!place.location.latitude) {
                            self.searchPlaces(place.name).then(resolve, reject);
                        }
                        else{
                            seeCrowdService.getPlaceBySourceID(place).then(function(result) {
                                var __place = result.data[0];
                                if(__place) {
                                    place = __place;
                                }
                                mapService.resetMap(map, place.location);
                                var places = [];
                                places.push(place);
                                markSearchPlaces(places);
                                placesMap[place.sourceID] = place;
                                $rootScope.$broadcast('markerSelected', { 'place': place});
                            });
                        }
                    }).then(resolve, reject);
                });
            }

            function mergePlaces(mapPlaces, dbPlaces) {
                var i, j, existInDB, places = [];
                for(i = 0; i < mapPlaces.length; i++) {
                    existInDB = false;
                    for(j = 0; j < dbPlaces.length; j++) {
                        if(mapPlaces[i].sourceID === dbPlaces[j].sourceID) {
                            existInDB = true;
                            if(!placesMap[dbPlaces[j].sourceID]) {
                                dbPlaces[j].isNearby = false;
                                placesMap[dbPlaces[j].sourceID] = dbPlaces[j];
                            }
                            places.push(placesMap[dbPlaces[j].sourceID]);
                        }
                        else {
                            existInDB = false;
                            break;
                        }
                    }
                    if(!existInDB){
                        places.push(mapPlaces[i]);
                    }
                }
                return places;
            }

            self.loadMap = function() {
                return new Promise(function(resolve, reject) {
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
                                            markPlaces(places);
                                        });
                                    }, 1000);

                                },
                                'longpress': function(event){
                                    if(map.getZoom() < 16) {
                                        $rootScope.$broadcast('longpressForAskRequiresZoom');
                                    }
                                    else {
                                        var latLng = event.latLng, location = {
                                            latitude: latLng.lat(),
                                            longitude: latLng.lng()
                                        };
                                        mapService.searchPlaces(undefined, undefined, location, configService.LONGPRESS_ASK_DISTANCE).then(function(__places){
                                            self.clearSearchMarkers();
                                            var promise = seeCrowdService.getPlacesBySourceIDs(__places);
                                            Promise.all([promise]).then(function(result) {
                                                var i, j, places = mergePlaces(__places, result[0].data);
                                                //resolve();
                                                markSearchPlaces(places);
                                            }, function() {
                                                //reject();
                                            });
                                            $rootScope.$broadcast('unsearchableAsk', {value: location.latitude.toFixed(2) + ', ' + location.longitude.toFixed(2)});
                                        }, function() {
                                            $rootScope.$broadcast('longpressForAskRequiresZoom');
                                        });
                                    }
                                }
                            });
                            self.markCurrentLocation();
                            initAutocomplete().then(resolve, reject);
                        }, 100);
                    }
                    else if(Object.keys(markersMap).length === 0) {
                        //mapService.resetMap(map, $rootScope.location);
                        loadPlacesInMapBox().then(function(places) {
                            markPlaces(places);
                        });
                    }
                });
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