angular.module('askCrowd.Model', ['askCrowd.Service', 'map.Service', 'config', 'location'])
    .factory('askCrowdModel', ['askCrowdService', 'mapService', 'mapConstants', 'configService', '$rootScope', 'locationService',
        function(askCrowdService, mapService, mapConstants, configService, $rootScope, locationService) {
            var selectedPlace, boundingBox,
            mapDivId = 'askMap', searchInputDivId = 'search-input', 
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
                                    path: mapConstants.MARKERS.CROWD.PATHS.ASK,
                                    anchor: mapConstants.MARKERS.CROWD.INFO.anchor,
                                    scaledSize: mapConstants.MARKERS.CROWD.INFO.scaledSize
                                },
                                function(_infowindow){
                                    if (infowindow) {
                                        infowindow.close();
                                    }
                                    infowindow = _infowindow;
                                    $rootScope.$broadcast('askMarkerSelected', { place: place});
                                },
                                '<div><strong>' + place.name + '</strong>' + (place.address ? ('<br>' + place.address) : '')
                            );
                            markersMap[place.sourceID] = marker;
                        })(place);
                    }
                }
            }

            self.searchPlaces = function(query){
                self.clearMap();
                mapService.searchPlaces(map, query, $rootScope.location, configService.FAR_DISTANCE).then(function(places){
                    markPlaces(places);
                });
            };

            function initAutocomplete(){
                var boundingBox = locationService.getBoundingBox($rootScope.location, configService.FAR_DISTANCE);
                mapService.initAutocomplete(map, searchInputDivId, boundingBox, function(place){
                    self.clearMap();
                    if (!place.location.latitude) {
                        searchPlaces(place.name);
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
                                self.clearMap();
                                var latLng = event.latLng, location = {
                                    latitude: latLng.lat(),
                                    longitude: latLng.lng()
                                };
                                mapService.searchPlaces(undefined, undefined, location, configService.LONGPRESS_ASK_DISTANCE).then(function(places){
                                    markPlaces(places);
                                });
                            }
                        });
                        initAutocomplete();
                        markCurrentLocation();
                    }, 100);
                }
            };

            self.clearMap = function(){
                if(infowindow) {
                    infowindow.close();
                }
                var i;
                for(i in markersMap) {
                    markersMap[i].setMap(null);
                    delete markersMap[i];
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