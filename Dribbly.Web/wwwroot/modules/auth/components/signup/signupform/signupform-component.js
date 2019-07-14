(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblySignupform', {
            bindings: {},
            controllerAs: 'suf',
            templateUrl: '/modules/auth/components/signup/signupform/signupform-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var suf = this;

        suf.signUp = function () {
            console.log('sign up clicked');
        };
    }
})();
