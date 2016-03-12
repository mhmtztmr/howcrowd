app.controller('seeCrowdInmapController', ['$rootScope', '$scope', '$timeout',
  'mapService', 'seeCrowdIncityModel',
  function($rootScope, $scope, $timeout, mapService, seeCrowdIncityModel) {
    console.log('see crowd in map');

    seeCrowdIncityModel.loadMap('map');
    seeCrowdIncityModel.markPlaceBasedCrowdsOnMap();
  }
]);
