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

    controllerFunc.$inject = ['authService', '$state'];
    function controllerFunc(authService, $state) {
        var suf = this;

        suf.signUp = function () {
            suf.isBusy = true;
            authService.signUp(suf.model)
                .then(function (response) {
                    $state.go('auth.login')
                        .catch(function () {
                            suf.isBusy = false;
                        });
                })
                .catch(function (error) {
                    alert('Registration failed');
                    console.log(error); //TODO: remove when error handling is implemented
                    suf.model.password = '';
                    suf.model.confirmPassword = '';
                    suf.isBusy = false;
                });
        };
    }
})();
