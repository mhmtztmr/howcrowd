angular.module('askCrowd.Model', ['askCrowd.Service', 'map.Service', 'config', 'location'])
    .factory('askCrowdModel', ['askCrowdService', 'mapService', 'mapConstants', 'configService', '$rootScope', 'locationService',
        function(askCrowdService, mapService, mapConstants, configService, $rootScope, locationService) {
            var self = {},
            mapDivId = 'askMap', searchInputDivId = 'search-input', 
            placesMap = {},
            map, currentLocationMarker, markersMap = {}, infowindow;

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
                        $rootScope.lang.MAP.YOUR_LOCATION
                    );
                }
            }

            function markPlaces(places) {
                var place, i;
                for (i = 0; i < places.length; i++) {
                    place = places[i];
                    if(!markersMap[place.sourceID]) {
                        (function(place) {
                            var distance = Math.floor(locationService.getDistanceBetweenLocations(place.location, $rootScope.location));
                            var marker = mapService.createMarker(
                                map, 
                                place.location, 
                                {
                                    path: mapConstants.MARKERS.CROWD.PATHS.ASK,
                                    anchor: mapConstants.MARKERS.CROWD.INFO.anchor,
                                    scaledSize: mapConstants.MARKERS.CROWD.INFO.scaledSize
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
                                            $rootScope.$broadcast('askMarkerSelected', { place: mappedPlace});
                                        }
                                        else {
                                            askCrowdService.getPlace(place.sourceID).then(function(__place) {
                                                var _place = place;
                                                if(__place) {
                                                    _place = __place;
                                                }
                                                placesMap[place.sourceID] = _place;
                                                $rootScope.$broadcast('askMarkerSelected', { place: _place});
                                            });
                                        }
                                    }
                                },
                                '<div><strong>' + place.name + '</strong>' + 
                                (place.address ? ('<br>' + place.address) : '') +
                                (distance > configService.FAR_DISTANCE ? ('<br><div style="color:red; font-style: italic">' + $rootScope.lang.ASK_CROWD_MENU.TOO_FAR_TO_ASK + ': ' + distance + ' km</div>') : '') +
                                '</div>'
                            );
                            markersMap[place.sourceID] = marker;
                        })(place);
                    }
                }
            }

            self.searchPlaces = function(query){
                return new Promise(function(resolve, reject) {
                    mapService.searchPlaces(map, query, $rootScope.location, configService.FAR_DISTANCE).then(function(places){
                        self.clearMap();
                        markPlaces(places);
                        resolve();
                    }, reject);
                });               
            };

            function initAutocomplete(){
                var boundingBox = locationService.getBoundingBox($rootScope.location, configService.FAR_DISTANCE);
                mapService.initAutocomplete(map, searchInputDivId, boundingBox, function(place){
                    $rootScope.$broadcast('unsearchableAsk', {value: place.name});
                    self.clearMap();
                    if (!place.location.latitude) {
                        self.searchPlaces(place.name);
                        return;
                    }
                    mapService.resetMap(map, place.location);
                    var places = [];
                    places.push(place);
                    markPlaces(places);
                });
            }

            self.loadMap = function() {
                if(!map) {
                    setTimeout(function(){
                        map = mapService.initMap(mapDivId, $rootScope.location, {
                            'mousedown': function(){
                                $rootScope.$broadcast('askMarkerDeselected');
                                if (infowindow) {
                                    infowindow.close();
                                }
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
                                    mapService.searchPlaces(undefined, undefined, location, configService.LONGPRESS_ASK_DISTANCE).then(function(places){
                                        self.clearMap();
                                        markPlaces(places);
                                        $rootScope.$broadcast('unsearchableAsk', {value: location.latitude.toFixed(2) + ', ' + location.longitude.toFixed(2)});
                                    }, function() {
                                        $rootScope.$broadcast('longpressForAskRequiresZoom');
                                    });
                                }
                            }
                        });
                        initAutocomplete();
                        markCurrentLocation();
                    }, 100);
                }
            };

            self.clearMap = function(){
                $rootScope.$broadcast('askMarkerDeselected');
                if(infowindow) {
                    infowindow.close();
                }
                var i;
                for(i in markersMap) {
                    if(markersMap.hasOwnProperty(i)) {
                        markersMap[i].setMap(null);
                        delete markersMap[i];
                    }
                }
            };

            self.selectPlace = function(place) {
                return new Promise(function(resolve) {
                    resolve(place);
                });
            };

            return self;
        }
    ]);