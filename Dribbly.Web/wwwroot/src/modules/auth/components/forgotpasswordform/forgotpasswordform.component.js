(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyForgotpasswordform', {
            bindings: {
                goToLogin: '<'
            },
            controllerAs: 'fpf',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'modalService', '$stateParams'];
    function controllerFunc(authService, modalService, $stateParams) {
        var fpf = this;

        fpf.$onInit = function () {
            
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
