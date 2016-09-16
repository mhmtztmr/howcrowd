angular.module('askCrowd.Service', ['db', 'date'])
	.factory('askCrowdService', ['dbService', 'dateService',
		function(dbService, dateService) {

			var self = {};

			self.askCrowd = function(crowdData, placeData, deviceObject) {
				return new Promise(function(resolve, reject){
			        dbService.selectPlace(placeData.sourceID).then(function(placeObject) {
			          if(placeObject) {
			            dbService.createCrowd(crowdData, placeObject, deviceObject);
			          }
			          else {
			            dbService.createPlace(placeData, crowdData).then(function(placeObject) { //a place created with given data
			              dbService.createCrowd(crowdData, placeObject, deviceObject).then(resolve, reject);
			            }, reject);
			          }
			        }, reject);
			    });
			};
	
			return self;
		}
	]);
