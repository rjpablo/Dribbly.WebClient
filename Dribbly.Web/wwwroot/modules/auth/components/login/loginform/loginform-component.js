(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyLoginform', {
            bindings: {},
            controllerAs: 'dlf',
            templateUrl: '/modules/auth/components/login/loginform/loginform-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dlf = this;

        dlf.login = function () {
            console.log('log in');
        };

        dlf.signUp = function () {
            console.log('sign up');
        };

        dlf.loginExternal = function (type) {
            alert('log in with ' + type + ' - Not yet implemented.');
        };
    }
})();
