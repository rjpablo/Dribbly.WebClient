(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyPasswordresetform', {
            bindings: {
                app: '<'
            },
            controllerAs: 'prf',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'drbblyCommonService', '$stateParams'];
    function controllerFunc(authService, drbblyCommonService, $stateParams) {
        var prf = this;

        prf.$onInit = function () {
            prf.model = {
                email: $stateParams.email,
                token: $stateParams.token
            };
            if (prf.app) {
                prf.app.updatePageDetails({
                    title: 'Password Reset'
                });
            }
        };

        prf.resetPassword = function () {
            prf.isBusy = true;
            authService.resetPassword(prf.model)
                .then(function (response) {
                    prf.isComplete = true;
                })
                .catch(function (error) {
                    if (error.data && error.data.exceptionMessage === 'Invalid token.') {
                        drbblyCommonService.handleError(error, 'site.Error_Common_InvalidLink');
                    }
                    else {
                        drbblyCommonService.handleError(error);
                    }
                })
                .finally(function () {
                    prf.isBusy = false;
                });
        };
    }
})();
