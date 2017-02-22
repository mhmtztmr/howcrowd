angular.module('map.Service', ['google'])
    .factory('mapService', ['$q', '$rootScope', 'googleService',  
        function($q, $rootScope, googleService) {
        var self = {};

        self.initMap = function(DOMElementId, center, events) {
            return googleService.initMap(DOMElementId, center, events);
        };

        self.setMapClickable = function(map, clickable) {
            googleService.setMapClickable(map, clickable);
        };

        self.resetMapPosition = function(map, center) {
            googleService.resetMapPosition(map, center);
        };

        self.getMapBoundingBox = function(map) {
            return googleService.getMapBoundingBox(map);
        };

        self.getMapZoom = function(map) {
            return googleService.getMapZoom(map);
        };

        self.getMapCenter = function(map) {
            return googleService.getMapCenter(map);
        };

        self.setMapZoom = function(map, zoom) {
            googleService.setMapZoom(map, zoom);
        };

        self.setMapCenter = function(map, center) {
            googleService.setMapCenter(map, center);
        };

        self.moveMapTo = function(map, center, zoom) {
            googleService.moveMapTo(map, center, zoom);
        };

        self.createMarker = function(map, location, markerData, onMarkerClick, infoWindowData, onInfoWindowClick, extraData) {
            return googleService.createMarker(map, location, markerData, onMarkerClick, infoWindowData, onInfoWindowClick, extraData);
        };

        self.removeMarker = function(marker) {
            googleService.removeMarker(marker);
        };

        self.createCurrentLocationMarker = function(map, location, markerData, onMarkerClick, infoWindowData, onInfoWindowClick, extraData) {
            return googleService.createCurrentLocationMarker(map, location, markerData, onMarkerClick, infoWindowData, onInfoWindowClick, extraData);
        };

        self.initAutocomplete = function(map, DOMElementId, boundingBox, onPlaceSelected){
            return new Promise(function(resolve, reject){
                googleService.initAutocomplete(map, DOMElementId, boundingBox, onPlaceSelected).then(resolve, reject).catch(reject);
            });
        };

        self.isAutocompleteVisible = function() {
            return googleService.isAutocompleteVisible();
        };

        self.searchPlaces = function(mapDOMElementId, query, location, radius){
            return new Promise(function(resolve, reject){
                googleService.searchPlaces(mapDOMElementId, query, location, radius).then(resolve, reject).catch(reject);
            });
        };

        return self;
    }])
    .constant('mapConstants', {
        MARKERS: {
            CROWD: {
                ID: "crowd",
                INFO: {
                    anchor: {x:6, y: 40},
                    scaledSize: {w: 12, h: 40}
                },
                PATHS: {
                    '0': '0',
                    '10': '10',
                    '20': '20',
                    '30': '30',
                    '40': '40',
                    '50': '50',
                    '60': '60',
                    '70': '70',
                    '80': '80',
                    '90': '90',
                    '100': '100',
                    'DEFAULT': 'default'
                }
            },
            SEARCH: {
                ID: "search",
                INFO: {
                    anchor: {x:9, y: 60},
                    scaledSize: {w: 18, h: 60}
                },
                PATHS: {
                    '0': '0',
                    '10': '10',
                    '20': '20',
                    '30': '30',
                    '40': '40',
                    '50': '50',
                    '60': '60',
                    '70': '70',
                    '80': '80',
                    '90': '90',
                    '100': '100',
                    'DEFAULT': 'default'
                }
            },
            OTHER: {
                ID: "other",
                INFO: {
                    anchor: {x:12, y: 12},
                    scaledSize: {w: 24, h: 24}
                },
                PATHS: {
                    'CURRENT_LOCATION': 'gpsloc'
                }
            }
            
        }
    });