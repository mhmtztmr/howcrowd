app.controller('seeCrowdController', ['$rootScope', '$scope', '$filter',
    'seeCrowdModel', 'dateService', 'mapService', '$timeout',
    function($rootScope, $scope, $filter, seeCrowdModel, dateService, mapService, $timeout) {
        app.seeCrowdNavi.bringPageTop('templates/see-crowd-inlist.html', {animation: 'none'});
    }
]);
