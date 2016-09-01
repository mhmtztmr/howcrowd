app.controller('seeCrowdInmapController', ['$rootScope', '$scope', '$filter',
    'seeCrowdModel', 'dateService', 'mapService', '$timeout',
    function($rootScope, $scope, $filter, seeCrowdModel, dateService, mapService, $timeout) {
        
        function loadMap(){
            seeCrowdModel.loadMap();
        }

        $scope.onMapShow = function(){
            loadMap();
        };
    }
]);
