app.controller('reportIssueController', ['$scope','configService', '$log', 'INTERFACE' , function($scope, configService, $log, INTERFACE) {

	$scope.reportInfo = {
		email: '',
		description: ''
	};
	$scope.reportIssue = function(){
		$log.log('reporting issue...');
		modal.show();
		var subject = $scope.reportInfo.description.substring(0, Math.min(10, $scope.reportInfo.description.length)) + "...",
		body = '';

		body += "<b>Reporter: </b>"+ $scope.reportInfo.email + "<br>";
		body += "<b>Description: </b>" + $scope.reportInfo.description + "<br>";
		body += "<b>Device Info: </b>" + INTERFACE.deviceInfo + "<br>";
		body += "<br><br><b>Logs: </b><br>" + $log.getAllLogsAsString();
	    // prepare message bodies (plain and html) and attachment
	    var bodyParts = new Bodyparts();
	    // bodyParts.textmessage = "Check out this awesome code generation result";
	    bodyParts.htmlmessage = body;
	    var attachments = [];

	    // asynchronous call
	    var successCallback = function( response ) {
		  	$log.log('issue successfully reported');
		  	modal.hide();
		  	app.navi.popPage();
		};
 
		var failureCallback = function( fault ) {
		  	$log.log('reporting issue failed');
		  	modal.hide();
		  	app.navi.popPage();
		};
		var responder = new Backendless.Async( successCallback, failureCallback );
	    Backendless.Messaging.sendEmail( "[HOWCROWD] " + subject, bodyParts, 
	    	configService.REPORT_EMAIL,
	    	attachments,
	    	responder );
	};
}]);
