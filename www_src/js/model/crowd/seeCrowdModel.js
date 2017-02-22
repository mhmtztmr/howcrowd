angular.module('seeCrowd.Model', ['seeCrowd.Service', 'map.Service', 'date', 'location', 'config', 'feedback'])
    .factory('seeCrowdModel', ['seeCrowdService', 'mapService', 'mapConstants','feedbackModel',
        'configService', 'dateService', '$rootScope', 'locationService', '$log', function(seeCrowdService, mapService, mapConstants,
            feedbackModel, configService, dateService, $rootScope, locationService, $log) {
            var self = {},
            mapDivId = 'map', map, searchInputDivId = 'map-search-input',
            currentLocationMarker, markersMap = {}, searchMarkersMap = {}, infowindow,
            loading, 
            reload = {list: true, map: true},
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
                        return;
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
                        }, function(e) {
                            loading = false;
                            reject(e);
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
                    mapService.searchPlaces(mapDivId, query, $rootScope.location, configService.FAR_DISTANCE).then(function(mapResults){
                        var __places = mapResults.places;
                        self.clearSearchMarkers();
                        var promise = seeCrowdService.getPlacesBySourceIDs(__places);
                        Promise.all([promise]).then(function(result) {
                            var i, places = mergePlaces(__places, result[0].data);
                            resolve();
                            mapService.moveMapTo(map, mapResults.center, mapResults.zoom);
                            markSearchPlaces(places);
                        }, reject);
                    }, reject);
                });
            };

            function loadPlacesInMapBox() {
                return new Promise(function(resolve, reject){
                    mapService.getMapBoundingBox(map).then(function(_boundingBox) {
                      var farPromise = seeCrowdService.getPlacesInBox(_boundingBox);
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
                    }, reject);
                });
            }

            self.markCurrentLocation = function() {
                return new Promise(function(resolve, reject){
                    if($rootScope.location.latitude) {
                        if(currentLocationMarker) {
                            mapService.removeMarker(currentLocationMarker);
                        }
                        mapService.createCurrentLocationMarker(
                            map,
                            $rootScope.location,
                            {
                                path: mapConstants.MARKERS.OTHER.PATHS.CURRENT_LOCATION,
                                anchor: mapConstants.MARKERS.OTHER.INFO.anchor,
                                scaledSize: mapConstants.MARKERS.OTHER.INFO.scaledSize
                            },
                            function(_infowindow){
                                if(_infowindow){
                                    if (infowindow) {
                                        infowindow.close();
                                    }
                                    infowindow = _infowindow;
                                }
                            }, {
                                title: $rootScope.lang.MAP.YOUR_LOCATION
                            }
                        ).then(function(_currentLocationMarker) {
                            currentLocationMarker = _currentLocationMarker;
                            resolve();
                        });
                    }
                    else {
                        resolve();
                    }
                });
            };

            function markPlace(place, _markerType) {
                var markerType = mapConstants.MARKERS.CROWD;
                if(_markerType) {
                    markerType = _markerType;
                }

                var distance = Math.floor(locationService.getDistanceBetweenLocations(place.location, $rootScope.location));
                var markerPath = markerType.PATHS.DEFAULT;
                if(place.averageCrowdValue) {
                    markerPath = markerType.PATHS[(Math.ceil(place.averageCrowdValue / 10) * 10)];
                }
                return new Promise(function(resolve, reject) {
                    mapService.createMarker(
                        map,
                        place.location,
                        {
                            path: markerPath,
                            anchor: markerType.INFO.anchor,
                            scaledSize: markerType.INFO.scaledSize
                        },
                        function(_infowindow){
                            if(_infowindow){
                                if (infowindow) {
                                    infowindow.close();
                                }
                                infowindow = _infowindow;
                            }
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
                        }, {
                            title: place.name,
                            snippet: place.address
                        }, undefined, {
                            distanceTooFar: (distance > configService.FAR_DISTANCE ? $rootScope.lang.SEE_CROWD_MENU.TOO_FAR_TO_ASK+ ': ' + distance + ' km' : undefined)
                        }
                    ).then(function(_marker) {
                        if(markerType.ID === mapConstants.MARKERS.SEARCH.ID){
                            searchMarkersMap[place.sourceID] = _marker;
                        }
                        else {
                            markersMap[place.sourceID] = _marker;
                        }
                        resolve();
                    });
                });
            }

            function markSearchPlaces(places) {
                return new Promise(function(resolve, reject) {
                    $log.log('marking search places...');
                    var place, i, promiseArray = [];
                    for (i = 0; i < places.length; i++) {
                        place = places[i];
                        if(markersMap[place.sourceID]) {
                            mapService.removeMarker(markersMap[place.sourceID]);
                            delete markersMap[place.sourceID];
                            promiseArray.push(markPlace(place, mapConstants.MARKERS.CROWD));
                        }
                    }

                    Promise.all(promiseArray).then(function(result) {
                        var searchPromiseArray = [];
                        for (i = 0; i < places.length; i++) {
                            place = places[i];
                            
                            if(markersMap[place.sourceID]) {
                                markersMap[place.sourceID].setVisible(false);
                            }

                            if(searchMarkersMap[place.sourceID]){
                                mapService.removeMarker(searchMarkersMap[place.sourceID]);
                                delete searchMarkersMap[place.sourceID];
                            }

                            searchPromiseArray.push(markPlace(place, mapConstants.MARKERS.SEARCH));
                        }

                        Promise.all(searchPromiseArray).then(resolve, reject);

                    }, reject);
                });
            }

            function markPlaces(places) {
                return new Promise(function(resolve, reject) {
                    $log.log('marking places...');
                    var place, i, promiseArray = [];
                    for (i = 0; i < places.length; i++) {
                        place = places[i];
                        if(!markersMap[place.sourceID]) {
                            promiseArray.push(markPlace(place, mapConstants.MARKERS.CROWD));
                        }
                    }

                    Promise.all(promiseArray).then(function(result) {
                        for (i = 0; i < places.length; i++) {
                            place = places[i];
                            if(searchMarkersMap[place.sourceID]){
                                if(markersMap[place.sourceID]) {
                                    markersMap[place.sourceID].setVisible(false);
                                }
                            }
                        }
                        resolve();
                    }, reject);
                });
            }

            self.clearMarkers = function() {
                $log.log('clearing all markers...');
                self.clearSearchMarkers();
                var i;
                for(i in markersMap) {
                    if(markersMap.hasOwnProperty(i)) {
                        mapService.removeMarker(markersMap[i]);
                        delete markersMap[i];
                    }
                }
            };

            self.clearSearchMarkers = function() {
                $log.log('clearing search markers...');
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
                        mapService.removeMarker(searchMarkersMap[i]);
                        delete searchMarkersMap[i];
                    }
                }
            };

            function resetMap() {
                return new Promise(function(resolve, reject) {
                    mapService.resetMapPosition(map, $rootScope.location);
                    self.clearMarkers();
                    loadPlacesInMapBox().then(function(places) {
                        markPlaces(places).then(resolve, reject);
                    }, reject);
                });
            }

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
                                mapService.moveMapTo(map, place.location, 17);
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

            self.isAutocompleteVisible = function() {
                return mapService.isAutocompleteVisible();
            };

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
                            mapService.initMap(mapDivId, $rootScope.location, {
                                'mousedown': function(){
                                    $rootScope.$broadcast('markerDeselected');
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
                                'longpress': function(location){
                                    mapService.getMapZoom(map).then(function(_zoom) {
                                        if(_zoom < 16) {
                                            $rootScope.$broadcast('longpressForAskRequiresZoom');
                                        }
                                        else {
                                            mapService.searchPlaces(mapDivId, undefined, location, configService.LONGPRESS_ASK_DISTANCE).then(function(mapResults){
                                                var __places = mapResults.places;
                                                self.clearSearchMarkers();
                                                var promise = seeCrowdService.getPlacesBySourceIDs(__places);
                                                Promise.all([promise]).then(function(result) {
                                                    var i, j, places = mergePlaces(__places, result[0].data);
                                                    mapService.moveMapTo(map, mapResults.center, 17);
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
                                    });
                                }
                            }).then(function(_map) {
                              map = _map;
                              self.markCurrentLocation();
                              initAutocomplete().then(resolve, reject);
                            }, reject);
                        }, 100);
                    }
                    else {
                        resetMap().then(resolve, reject);                     
                    }
                });
            };

            self.setMapClickable = function(clickable) {
                mapService.setMapClickable(map, clickable);
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

            self.setReload = function(_reload) {
                var prevReload = reload;
                if(_reload.list !== undefined) {
                    reload.list = _reload.list;
                }
                if(_reload.map !== undefined) {
                    reload.map = _reload.map;
                }
                return prevReload;
            };

            self.isReload = function() {
                return reload;
            };

            return self;
        }
    ]);
