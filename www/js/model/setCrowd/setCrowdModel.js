var setCrowdModel = function($q, setCrowdService) {
  var selectedPlace;

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    setCrowdService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }

  function selectPlace(place) {
    selectedPlace = place;
    app.navi.pushPage('templates/set-crowd-level.html');
  }

  function getSelectedPlace() {
    return selectedPlace;
  }

  return {
    insertCrowd: insertCrowd,
    selectPlace: selectPlace,
    getSelectedPlace: getSelectedPlace
  };
};

angular.module('setCrowd.Model', ['setCrowd.Service'])
  .factory('setCrowdModel', ['$q', 'setCrowdService', setCrowdModel]);
