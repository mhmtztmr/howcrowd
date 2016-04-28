var dateService = function() {

	function getParseDate(date) {
		return new Date(date.toString() + " UTC");
	}

	function getBackendlessDate(date) {
		return date;
	}

	function getDBDate(date) {
		return getBackendlessDate(date);
	}

	return {
		getDBDate: getDBDate
	};
};

angular.module('date', [])
	.factory('dateService', [dateService]);
