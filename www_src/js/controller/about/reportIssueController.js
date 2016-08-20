app.controller('reportIssueController', ['$scope','configService' , function($scope, configService) {
	$scope.reportIssue = function(issueDescription){
		var subject = issueDescription.substring(0, Math.min(10, issueDescription.length)) + "...";
	    // prepare message bodies (plain and html) and attachment
	    var bodyParts = new Bodyparts();
	    // bodyParts.textmessage = "Check out this awesome code generation result";
	    bodyParts.htmlmessage = "<b>" + issueDescription + "</b>";
	    var attachments = [];
	    Backendless.Messaging.sendEmail( "[HOWCROWD] " + subject, bodyParts, [ configService.REPORT_EMAIL ], attachments );
	    menu.setMainPage('templates/see-crowd.html');
	};
}]);
