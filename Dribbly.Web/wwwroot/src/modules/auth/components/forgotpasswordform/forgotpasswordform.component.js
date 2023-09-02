(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyForgotpasswordform', {
            bindings: {
                goToLogin: '<',
                app: '<'
            },
            controllerAs: 'fpf',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'modalService', '$stateParams'];
    function controllerFunc(authService, modalService, $stateParams) {
        var fpf = this;

        fpf.$onInit = function () {
            if (fpf.app) {
                fpf.app.updatePageDetails({
                    title: 'Forgot Password'
                });
            }
        };

        fpf.submit = function () {
            fpf.isBusy = true;
            authService.sendResetPasswordLink(fpf.model)
                .then(function () {
                    fpf.isBusy = false;
                    fpf.emailIssent = true;
                })
                .catch(function (err) {
                    modalService.showGenericErrorModal();
                    fpf.emailIssent = false;
                    fpf.isBusy = false;
                });
        };

        fpf.goBackToLogin = function () {
            fpf.goToLogin();
        };
    }
})();
