angular.module('backendless').
    // factory('crowdRest', ['$resource',
    //   function($resource) {
    //     return $resource(
    //       "<%=SERVER_URL%>/v1/data/bulk/Crowd?where=placeKey%3D':placeKey'",
    //       null, {
    //         update: {
    //           method: 'PUT',
    //           headers: {
    //             'application-id': '<%=APPLICATION_ID%>',
    //             'secret-key': '<%=REST_SECRET_KEY%>',
    //             'Content-Type': 'application/json',
    //             'application-type': 'REST'
    //           }
    //         }
    //       });
    //   }
    // ]).
    factory('fileUploaderService',['$http', function($http){
        var self = {};
        self.upload = function(folder, fileName, fileData, onSuccess, onFailure) {
            var req = {
               method: 'PUT',
               url: "<%=SERVER_URL%>/<%=VERSION%>/files/binary/"+folder+"/"+fileName+"?overwrite=true",
               headers: {
                'application-id': '<%=APPLICATION_ID%>',
                'secret-key': '<%=REST_SECRET_KEY%>',
                'Content-Type': 'text/plain',
                'application-type': 'REST'
               },
               data: fileData
            };

            $http(req).then(onSuccess, onFailure);
        };

        return self;
    }]);
