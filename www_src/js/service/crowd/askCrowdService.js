angular.module('askCrowd.Service', ['db', 'date'])
	.factory('askCrowdService', ['dbService', 'dateService',
		function(dbService, dateService) {

			var self = {};

			self.getPlace = function(sourceID) {
		        return new Promise(function(resolve, reject){
		          	dbService.selectPlace(sourceID).then(resolve, reject);
		        });
		    };

			self.askCrowd = function(crowdData, placeObject, deviceObject) {
				return new Promise(function(resolve, reject){
					if(placeObject.objectId) {
						dbService.createCrowd(crowdData, placeObject, deviceObject).then(resolve, reject);
					}
					else {
						dbService.createPlace(placeObject, crowdData).then(function(placeObject) { //a place created with given data
			              dbService.createCrowd(crowdData, placeObject, deviceObject).then(resolve, reject);
			            }, reject);
					}
			    });
			};
	
			return self;
		}
	]);
