angular.module('rest', ['ngResource']).factory('crowdRest', ['$resource',
  function($resource) {
    return $resource(
      "https://api.backendless.com/v1/data/bulk/Crowd?where=placeKey%3D':placeKey'",
      null, {
        update: {
          method: 'PUT',
          headers: {
            'application-id': 'A556DD00-0405-02E1-FFF4-43454755FC00',
            'secret-key': 'F2FE2852-98DD-67CB-FFF6-61CE115F9800',
            'Content-Type': 'application/json',
            'application-type': 'REST'
          }
        }
      });
  }
]);
