angular.module('rest', ['ngResource']).factory('crowdRest', ['$resource',
  function($resource) {
    return $resource(
      "https://api.backendless.com/v1/data/bulk/Crowd?where=placeKey%3D':placeKey'",
      null, {
        update: {
          method: 'PUT',
          headers: {
            'application-id': '<%=APPLICATION_ID%>',
            'secret-key': '<%=REST_SECRET_KEY%>',
            'Content-Type': 'application/json',
            'application-type': 'REST'
          }
        }
      });
  }
]);
