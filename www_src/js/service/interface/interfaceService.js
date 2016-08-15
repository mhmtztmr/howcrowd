angular.module('interface', [])
    .provider('INTERFACE', function () {
        this.$get = function () {
            return window.Interface.instance;
        };
    });
