angular.module('askCrowd.Model', ['askCrowd.Service', 'map.Service', 'config'])
    .factory('askCrowdModel', ['askCrowdService', 'mapService', 'mapConstants', 'configService', '$rootScope', 
        function(askCrowdService, mapService, mapConstants, configService, $rootScope) {
            var selectedPlace, boundingBox,
            mapDivId = 'askMap', 
            searchInputDivId = 'search-input', 
            map, markers = [], infowindow;

            function markCurrentLocation() {
                if($rootScope.location.latitude) {
                    var marker = mapService.createMarker(
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
                    markers.push(marker);
                }
            }

            function markPlaces(results) {
                var place, i, address;
                for (i = 0; i < results.length; i++) {
                    place = results[i];
                    address = '';
                    if (place.address_components) {
                        address = [
                            (place.address_components[0] && place.address_components[0].short_name || ''),
                            (place.address_components[1] && place.address_components[1].short_name || ''),
                            (place.address_components[2] && place.address_components[2].short_name || '')
                        ].join(' ');
                    }

                    (function(place) {
                        var marker = mapService.createMarker(
                            map,
                            {
                                latitude: place.geometry.location.lat(),
                                longitude: place.geometry.location.lng()
                            },
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
                            '<div><strong>' + place.name + '</strong><br>' + address
                        );
                        markers.push(marker);
                    })(place);
                }
            }

            function searchByText(query){
                clearMap();
                mapService.searchByText(query, $rootScope.location, configService.FAR_DISTANCE, map, function(results){
                    markPlaces(results);
                });
            }

            function initAutocomplete(){
                mapService.initAutocomplete(map, searchInputDivId, boundingBox, function(place){
                    clearMap();
                    if (!place.geometry) {
                        searchByText(place.name);
                        return;
                    }

                    map.setCenter(place.geometry.location);
                    map.setZoom(15);
                    var places = [];
                    places.push(place);
                    markPlaces(places);
                });
            }

            function loadMap() {
                if(!map) {
                    setTimeout(function(){
                        boundingBox = mapService.getBoundingBox(angular.fromJson(localStorage.getItem('location')), configService.FAR_DISTANCE);
                        map = mapService.initMap(mapDivId, boundingBox.latitude.lower, boundingBox.longitude.lower, boundingBox.latitude.upper, boundingBox.longitude.upper, {
                            'mousedown': function(){
                                $rootScope.$broadcast('askMarkerDeselected');
                                if (infowindow) {
                                    infowindow.close();
                                }
                            },
                            'longpress': function(event){
                                clearMap();
                                var latLng = event.latLng, location = {
                                    latitude: latLng.lat(),
                                    longitude: latLng.lng()
                                };
                                mapService.getAddressByLocation(map, location, function(places){
                                    markPlaces(places);
                                });
                            }
                        });
                        initAutocomplete();
                        markCurrentLocation();
                    }, 100);
                }
            }

            function clearMap(){
                if(infowindow) {
                    infowindow.close();
                }
                var i;
                for (i = 0; i < markers.length; i++ ) {
                    markers[i].setMap(null);
                }
                markers.length = 0;
                markCurrentLocation();
            }

            function selectPlace(place) {
                selectedPlace = place;
                if (place) {
                    app.askCrowdNavi.pushPage('templates/ask-crowd-input.html', {animation:'lift', selectedPlace: place});
                }
            }

            function askCrowd(place, crowd, device, onSuccess, onFailure) {
                askCrowdService.askCrowd(place, crowd, device, onSuccess, onFailure);
            }

            return {
                loadMap: loadMap,
                initAutocomplete: initAutocomplete,
                searchByText: searchByText,
                clearMap: clearMap,
                selectPlace: selectPlace,
                askCrowd: askCrowd
            };
        }
    ]);