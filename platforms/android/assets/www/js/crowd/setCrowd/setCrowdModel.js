var setCrowdModel = function($q, setCrowdService) {
  var selectedPlace;

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    setCrowdService.insertCrowd(place, crowd, device, onSuccess, onFailure);
  }

  function selectPlace(place) {
    selectedPlace = place;
    ons.createDialog('crowd-level.html').then(function(dialog) {
      dialog.show();
    });
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
