var dateUtil = function() {

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

angular.module('util.date', [])
	.factory('dateUtil', [dateUtil]);
