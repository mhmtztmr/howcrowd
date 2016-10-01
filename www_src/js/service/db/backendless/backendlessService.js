angular.module('backendless', ['date'])
    .factory('backendlessService', ['$rootScope', 'fileUploaderService', 'dateService',
        function($rootScope, fileUploaderService, dateService) {

            var self = {};

            self.init = function() {
                var APPLICATION_ID = '<%=APPLICATION_ID%>',
                    JS_SECRET_KEY = '<%=JS_SECRET_KEY%>',
                    VERSION = '<%=VERSION%>'; //default application version;
                Backendless.initApp(APPLICATION_ID, JS_SECRET_KEY, VERSION);
            };

            self.selectDevice = function(ID){
                return new Promise(function(resolve, reject){
                    var callback = new Backendless.Async(function(deviceObjectData){
                        var deviceObject;
                        if(deviceObjectData.data.length > 0) {
                            deviceObject = deviceObjectData.data[0];
                        }
                        resolve(deviceObject);
                    }, reject),
                    devices = Backendless.Persistence.of(Device),
                    query = new Backendless.DataQuery();
                    query.condition = "ID = '" + ID + "'";
                    devices.find(query, callback);
                });
            };

            self.createDevice = function(deviceData){
                return new Promise(function(resolve, reject){
                    var callback = new Backendless.Async(resolve, reject),
                    deviceObject = new Device({
                        ID: deviceData.ID
                    });
                    Backendless.Persistence.of(Device).save(deviceObject, callback);
                });
            };

            self.selectPlace = function(sourceID) {
                return new Promise(function(resolve, reject){
                    var callback = new Backendless.Async(function(placeObjectData){
                        var placeObject;
                        if(placeObjectData.data.length > 0) {
                            placeObject = placeObjectData.data[0];
                        }
                        resolve(placeObject);
                    }, reject),
                    places = Backendless.Persistence.of(Place),
                    query = new Backendless.DataQuery();
                    query.condition = "sourceID = '" + sourceID + "'";
                    places.find(query, callback);
                });
            };

            self.selectPlaces = function(filter) {
                function getDataQuery(filter) {
                    var q = '1 = 1', j, query = new Backendless.DataQuery();

                    if (filter) {
                        if (filter.date) {
                            if (filter.date.start) {
                                q += ' and lastUpdateDatetime >= ' + filter.date.start.valueOf();
                            }
                            if (filter.date.end) {
                                q += ' and lastUpdateDatetime <= ' + filter.date.end.valueOf();
                            }

                            if (filter.location) {

                                q += ' and latitude >= ' + filter.location.latitude.lower;
                                q += ' and latitude <= ' + filter.location.latitude.upper;
                                q += ' and longitude >= ' + filter.location.longitude.lower;
                                q += ' and longitude <= ' + filter.location.longitude.upper;

                                // USE THE FOLLOWONG FOR GEOPOINT RELATION
                                // q += ' and distance( ' + filter.location.latitude + ', '
                                //  + filter.location.longitude + 
                                //  ', location.latitude, location.longitude) <= km(' + 
                                //  filter.location.distance + ')';
                            }
                        }
                        if(filter.sources && filter.sources.length > 0) {
                            q += ' and (';
                            for (j = 0; j < filter.sources.length; j++) {
                                q += " source = '" + filter.sources[j] + "'";
                                if(j !==  filter.sources.length - 1) {
                                    q += " or ";
                                }
                            }
                            q += ")";
                        }
                        if(filter.query && filter.query.length > 0){
                            q += " and name LIKE '%" + filter.query + "%'";
                        }
                    }

                    //q += " and (crowdReportReason is null or crowdReportReason = '')";

                    if ($rootScope.settings.isCustomPlacesEnabled !== true) {
                      q += " and source != 'custom'";
                    }

                    query.options = {
                        sortBy: 'lastUpdateDatetime desc',
                        pageSize: 100
                    };
                    query.condition = q;

                    return query;
                }

                return new Promise(function(resolve, reject){
                    var callback = new Backendless.Async(function(placesObject){
                        resolve(placesObject);
                    }, reject),
                    places = Backendless.Persistence.of(Place),
                    query = getDataQuery(filter);
                    places.find(query, callback);
                });
            };

            self.createPlace = function(placeData) {
                return new Promise(function(resolve, reject){
                    var callback = new Backendless.Async(resolve, reject),
                    placeObject = new Place(placeData),
                    now = dateService.getNow();
                    placeObject.lastUpdateDatetime = now;

                    Backendless.Persistence.of(Place).save(placeObject, callback);
                });
            };

            self.updatePlace = function(placeObject, crowdData) {
                delete placeObject.$$hashKey;
                return new Promise(function(resolve, reject){
                    var callback = new Backendless.Async(resolve, reject),
                    now = dateService.getNow();

                    if(crowdData) {
                        placeObject.lastUpdateDatetime = now;
                        placeObject.averageCrowdValue = crowdData.value;

                        if(crowdData.text) {
                            placeObject.lastTextDatetime = now;
                        }

                        if(crowdData.photoURL) {
                            placeObject.lastPhotoDatetime = now;
                        }

                        if(!crowdData.value) {
                            placeObject.lastAskDatetime = now;
                        }
                    }

                    Backendless.Persistence.of(Place).save(placeObject, callback);
                });
            };

            self.createCrowd = function(crowdData, placeObject, deviceObject) {
                return new Promise(function(resolve, reject){
                    var callback = new Backendless.Async(resolve, reject),
                    crowdObject = new Crowd({
                        device: deviceObject,
                        place: placeObject,
                        value: crowdData.value,
                        text: crowdData.text,
                        photoURL: crowdData.photoURL
                    }),
                    now = dateService.getNow();
                    crowdObject.datetime = now;

                    Backendless.Persistence.of(Crowd).save(crowdObject, callback);
                });
            };

            self.selectCrowds = function(placeObject, filter) {

                function getDataQuery(placeObject, filter) {
                    var q = '1 = 1', query = new Backendless.DataQuery();

                    if (filter) {
                        if (filter.date) {
                            if (filter.date.start) {
                                q += ' and datetime >= ' + filter.date.start.valueOf();
                            }
                            if (filter.date.end) {
                                q += ' and datetime <= ' + filter.date.end.valueOf();
                            }
                        }
                    }
                    if(placeObject) {
                        q += " and place.objectId = '" + placeObject.objectId + "'";
                    }

                    query.options = {
                        sortBy: 'datetime desc',
                        pageSize: 100,
                        relationsDepth: 1
                    };
                    query.condition = q;

                    return query;
                }

                return new Promise(function(resolve, reject){
                    var callback = new Backendless.Async(function(crowdObjectData){
                        resolve(crowdObjectData.data);
                    }, reject),
                    crowds = Backendless.Persistence.of(Crowd),
                    query = getDataQuery(placeObject, filter);
                    crowds.find(query, callback);
                });
            };

            self.updateCrowd = function(crowdObject) {
                delete crowdObject.$$hashKey;
                return new Promise(function(resolve, reject){
                    var callback = new Backendless.Async(resolve, reject);
                    Backendless.Persistence.of(Crowd).save(crowdObject, callback);
                });
            };

            self.giveFeedback = function(crowdObject, isPositive) {
                return new Promise(function(resolve, reject){
                    var counterName = "counter for " + crowdObject.objectId + (isPositive ?
                    "positive" : "negative") + " feedback";
                    var successCallback = function(response) {
                        console.log("[ASYNC] counter value is - " + response);
                        if (isPositive) {
                            crowdObject.positiveFeedback = response;
                        } else {
                            crowdObject.negativeFeedback = response;
                        }
                        self.updateCrowd(crowdObject).then(resolve, reject);
                    };

                    var failureCallback = function(fault) {
                        console.log("error - " + fault.message);
                        reject();
                    };

                    var callback = new Backendless.Async(successCallback, failureCallback);
                    var counter = Backendless.Counters.of(counterName);
                    counter.incrementAndGet(callback);
                });
            };

            // function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
            //     crowdRest.update({
            //         placeKey: crowd.placeKey
            //     }, {
            //         crowdReportReason: reportReason
            //     });
            // }

            self.uploadFile = function(base64Source, fileName, onSuccess, onFailure){
                fileUploaderService.upload('crowd-photos', fileName, base64Source, onSuccess, onFailure);
            };

            return self;
        }]);