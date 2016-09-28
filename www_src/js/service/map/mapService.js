angular.module('map.Service', ['google'])
    .factory('mapService', ['$q', '$rootScope', 'googleService',  
        function($q, $rootScope, googleService) {
        var self = {};

        self.initMap = function(DOMElementId, center, events) {
            return googleService.initMap(DOMElementId, center, events);
        };

        self.resetMap = function(map, center) {
            googleService.resetMap(map, center);
        };

        self.getMapBoundingBox = function(map) {
            return googleService.getMapBoundingBox(map);
        };

        self.setMapBoundingBox = function(map, swLat, swLng, neLat, neLng) {
            googleService.setMapBoundingBox(map, swLat, swLng, neLat, neLng);
        };

        self.createMarker = function(map, location, markerData, onMarkerClick, infoWindowData, onInfoWindowClick) {
            return googleService.createMarker(map, location, markerData, onMarkerClick, infoWindowData, onInfoWindowClick);
        };

        self.initAutocomplete = function(map, DOMElementId, boundingBox, onPlaceSelected){
            googleService.initAutocomplete(map, DOMElementId, boundingBox, onPlaceSelected);
        };

        self.searchPlaces = function(map, query, location, radius){
            return new Promise(function(resolve, reject){
                googleService.searchPlaces(map, query, location, radius).then(resolve, reject).catch(reject);
            });
        };

        return self;
    }])
    .constant('mapConstants', {
        MARKERS: {
            CROWD: {
                INFO: {
                    anchor: {x:7, y: 40},
                    scaledSize: {w: 14, h: 40}
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
                    'ASK': 'ask'
                }
            },
            OTHER: {
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