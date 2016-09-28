var dateService = function(configService) {

	function getBackendlessDate(date) {
		return date;
	}

	function getDBDate(date) {
		return getBackendlessDate(date);
	}

	function getNow() {
		return getDBDate(new Date());
	}

	function getNearbyTime() {
		var now = getNow();
    	return new Date(new Date(now).setHours(now.getHours() - configService.NEARBY_TIME));
	}

	return {
		getDBDate: getDBDate,
		getNow: getNow,
		getNearbyTime: getNearbyTime
	};
};

angular.module('date', ['config'])
	.factory('dateService', ['configService', dateService]);
