var backendlessService = function($rootScope, $q, crowdRest, formatterService, FileUploader) {

    function init() {
        var APPLICATION_ID = '<%=APPLICATION_ID%>',
            JS_SECRET_KEY = '<%=JS_SECRET_KEY%>',
            VERSION = '<%=VERSION%>'; //default application version;
        Backendless.initApp(APPLICATION_ID, JS_SECRET_KEY, VERSION);
    }

    /******* DB Models */
    function Crowd(args) {
        args = args || {};
        this.deviceId = args.deviceId || "";
        this.deviceReliability = args.deviceReliability || 1;
        this.placeKey = args.placeKey || "";
        this.placeName = args.placeName || "";
        this.placeSource = args.placeSource || "";
        this.placeSid = args.placeSid || "";
        this.crowdValue = args.crowdValue || "";
        this.crowdDate = args.crowdDate || "";
        this.crowdPhoto = args.crowdPhoto || "";
        this.crowdText = args.crowdText || "";
        this.crowdLocationLatitude = args.crowdLocationLatitude || "";
        this.crowdLocationLongitude = args.crowdLocationLongitude || "";
        this.crowdPositiveFeedback = args.crowdPositiveFeedback || 0;
        this.crowdNegativeFeedback = args.crowdNegativeFeedback || 0;
        this.crowdReportReason = args.crowdReportReason || '';
        this.placeVicinity = args.placeVicinity || '';
        this.placeDistrict = args.placeDistrict || '';
        this.placePhoto = args.placePhoto || '';
        this.placeType = args.placeType || '';
    }

    function Device(args) {
        args = args || {};
        this.deviceId = args.deviceId || "";
        this.positiveFeedback = args.positiveFeedback || 1;
        this.negativeFeedback = args.negativeFeedback || 0;
    }

    function Place(args) {
        args = args || {};
        this.placeKey = args.placeKey || "";
        this.placeName = args.placeName || "";
        this.placeSource = args.placeSource || "";
        this.placeSid = args.placeSid || "";
        this.placeLocationLatitude = args.placeLocationLatitude || "";
        this.placeLocationLongitude = args.placeLocationLongitude || "";
        this.placeVicinity = args.placeVicinity || '';
        this.placeDistrict = args.placeDistrict || '';
        this.placePhoto = args.placePhoto || '';
        this.placeType = args.placeType || '';
    }
    /* DB Models ******/

    function insertCrowd(place, crowd, device, onSuccess, onFailure) {
        var crowds = Backendless.Persistence.of(Crowd);
        var crowdObject = new Crowd({
            deviceId: device.id,
            deviceReliability: device.positiveFeedback / (device.positiveFeedback +
                device.negativeFeedback),
            placeKey: place.key,
            placeName: place.name,
            placeSource: place.source,
            placeSid: place.sid,
            crowdValue: crowd.value,
            crowdDate: crowd.date,
            crowdPhoto: crowd.photo,
            crowdText: crowd.text,
            crowdLocationLatitude: place.location.latitude,
            crowdLocationLongitude: place.location.longitude,
            placeVicinity: place.vicinity,
            placeDistrict: place.district,
            placePhoto: place.photo,
            placeType: place.type
        });
        crowds.save(crowdObject, new Backendless.Async(onSuccess, onFailure));
    }

    function insertDevice(device, onSuccess, onFailure) {
        var devices = Backendless.Persistence.of(Device);
        var deviceObject = new Device({
            deviceId: device.id,
            positiveFeedback: device.positiveFeedback,
            negativeFeedback: device.negativeFeedback
        });
        devices.save(deviceObject, new Backendless.Async(onSuccess, onFailure));
    }

    function retrieveDevice(deviceId) {
        var def = $q.defer();
        var devices = Backendless.Persistence.of(Device);
        var query = new Backendless.DataQuery();
        query.condition = "deviceId = '" + deviceId + "'";
        devices.find(query, new Backendless.Async(function(result) {
            if (result.data.length > 0) {
                def.resolve(result.data[0]);
            } else {
                def.resolve(undefined);
            }
        }, function(error) {
            def.resolve(undefined);
        }));
        return def.promise;
    }

    function retrieveCrowdsAndFormat(filter, formatterFunction) {
        var def = $q.defer();
        var q = '1 = 1', j;

        if (filter) {
            if (filter.date) {
                if (filter.date.start) {
                    q += ' and crowdDate >= ' + filter.date.start.valueOf();
                }
                if (filter.date.end) {
                    q += ' and crowdDate <= ' + filter.date.end.valueOf();
                }

                if (filter.location && filter.location.latitude && filter.location.latitude
                    .upper && filter.location.latitude.lower && filter.location.longitude &&
                    filter.location.longitude.upper && filter.location.longitude.lower
                ) {
                    q += ' and crowdLocationLatitude >= ' + filter.location.latitude.lower;
                    q += ' and crowdLocationLatitude <= ' + filter.location.latitude.upper;
                    q += ' and crowdLocationLongitude >= ' + filter.location.longitude.lower;
                    q += ' and crowdLocationLongitude <= ' + filter.location.longitude.upper;
                }
            }
            if(filter.sources && filter.sources.length > 0) {
                q += ' and (';
                for (j = 0; j < filter.sources.length; j++) {
                    q += " placeSource = '" + filter.sources[j] + "'";
                    if(j !==  filter.sources.length - 1) {
                        q += " or ";
                    }
                }
                q += ")";
            }
        }

        q += " and (crowdReportReason is null or crowdReportReason = '')";

        if ($rootScope.settings.isCustomPlacesEnabled !== true) {
          q += " and placeSource != 'custom'";
        }

        var query = new Backendless.DataQuery();
        query.options = {
            sortBy: 'crowdDate desc',
            pageSize: 100
        };
        query.condition = q;

        var crowds = Backendless.Persistence.of(Crowd);
        crowds.find(query, new Backendless.Async(function(result) {
            var i, formattedResults = [];
            for (i = 0; i < result.data.length; i++) {
                formattedResults.push(formatterFunction(result.data[
                    i]));
            }
            var nextPage = result._nextPage;
            while (nextPage) {
                result = result.nextPage();
                for (i = 0; i < result.data.length; i++) {
                    formattedResults.push(formatterFunction(
                        result.data[i]));
                }
                nextPage = result._nextPage;
            }
            def.resolve(formattedResults);
        }, function(error) {
            def.reject();
        }));

        return def.promise;
    }

    function retrieveCrowds(filter) {
        return retrieveCrowdsAndFormat(filter, formatterService.formatCrowdToSee);
    }

    function retrieveNearbyPlaces(filter) {
        var def = $q.defer(),
            uniquePlaces = {};
        retrieveCrowdsAndFormat(filter, formatterService.formatPlaceToSet).then(function(entries) {
            for (i = 0; i < entries.length; i++) {
                uniquePlaces[entries[i].sid] = entries[i];
            }
            def.resolve(Object.keys(uniquePlaces).map(function(key) {
                return uniquePlaces[key]
            }));
        });
        return def.promise;
    }

    function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
        var counterName = "counter for " + crowd.crowdId + (isPositive ?
            "positive" : "negative") + " feedback";
        var successCallback = function(response) {
            console.log("[ASYNC] counter value is - " + response);
            var crowdStorage = Backendless.Persistence.of(Crowd);
            var dbCrowd = crowdStorage.findById(crowd.crowdId);
            if (isPositive) {
                dbCrowd.crowdPositiveFeedback = response;
            } else {
                dbCrowd.crowdNegativeFeedback = response;
            }
            crowdStorage.save(dbCrowd);
            onSuccess();
        };

        var failureCallback = function(fault) {
            console.log("error - " + fault.message);
            onFailure();
        };

        var callback = new Backendless.Async(successCallback, failureCallback);
        var myCounter = Backendless.Counters.of(counterName);
        // async call
        myCounter.incrementAndGet(callback);
    }

    function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
        crowdRest.update({
            placeKey: crowd.placeKey
        }, {
            crowdReportReason: reportReason
        });
    }

    function uploadFile(base64Source, fileName, onSuccess, onFailure){
        FileUploader.upload('crowd-photos', fileName, base64Source, onSuccess, onFailure);
    }

    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
    }

    return {
        init: init,
        insertCrowd: insertCrowd,
        retrieveCrowds: retrieveCrowds,
        giveFeedback: giveFeedback,
        insertDevice: insertDevice,
        retrieveDevice: retrieveDevice,
        //insertPlace: insertPlace,
        reportCrowd: reportCrowd,
        retrieveNearbyPlaces: retrieveNearbyPlaces,
        uploadFile: uploadFile
    };
};

angular.module('backendless', ['rest', 'formatter'])
    .factory('backendlessService', ['$rootScope', '$q', 'crowdRest', 'formatterService', 'FileUploader', backendlessService]);
