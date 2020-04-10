(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblySignupform', {
            bindings: {},
            controllerAs: 'suf',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', '$state', 'drbblyCommonService'];
    function controllerFunc(authService, $state, drbblyCommonService) {
        var suf = this;

        suf.$onInit = function () {
            suf.errors = [];
        };

        suf.signUp = function () {
            suf.errors = [];
            suf.isBusy = true;
            authService.signUp(suf.model)
                .then(function (response) {
                    $state.go('auth.login')
                        .catch(function () {
                            suf.isBusy = false;
                        });
                })
                .catch(function (error) {
                    suf.isBusy = false;
                    if (error.data && error.data.modelState) {
                        // TODO: localize error messages
                        suf.errors = error.data.modelState[""];
                    }
                    else {
                        drbblyCommonService.handleError(error, 'site.Error_Common_UnexpectedError');
                    }
                });
        };
    }
})();
