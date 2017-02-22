app.controller('splashController', [function() {
    if (localStorage.getItem('skipTutorial')) {
        menu.setMainPage('templates/crowd.html');
    } else {
        menu.setMainPage('templates/about.html');
        localStorage.setItem('skipTutorial', true);
    }
}]);
