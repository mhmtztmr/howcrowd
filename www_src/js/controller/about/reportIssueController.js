app.controller('reportIssueController', ['$scope', function($scope) {
	$scope.reportIssue = function(issueDescription){
		var subject = issueDescription.substring(0, Math.min(10, issueDescription.length)) + "...";
	    // prepare message bodies (plain and html) and attachment
	    var bodyParts = new Bodyparts();
	    // bodyParts.textmessage = "Check out this awesome code generation result";
	    bodyParts.htmlmessage = "<b>" + issueDescription + "</b>";
	    var attachments = [];
	    Backendless.Messaging.sendEmail( "[CROWD] " + subject, bodyParts, [ "mahmutoztemur@gmail.com" ], attachments );
	    menu.setMainPage('templates/see-crowd.html');
	};
}]);
