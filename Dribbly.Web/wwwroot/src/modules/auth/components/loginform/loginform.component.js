(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyLoginform', {
            bindings: {
                showResetPassword: '<',
                onLoginSuccess: '<',
                messageKey: '<',
                app: '<'
            },
            controllerAs: 'dlf',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', '$state', '$stateParams', '$location', 'i18nService'];
    function controllerFunc(authService, $state, $stateParams, $location, i18nService) {
        var dlf = this;

        dlf.$onInit = function () {
            dlf.messageKey = dlf.messageKey || $stateParams.messageKey;
            dlf.isBusy = false;
            if (dlf.app) {
                dlf.app.updatePageDetails({
                    title: 'Login'
                });
            }
        };

        dlf.login = function () {
            dlf.isBusy = true;
            dlf.errorMessage = '';
            dlf.isBusy = true;
            authService.login(dlf.loginData)
                .then(function () {
                    if (dlf.onLoginSuccess) {
                        dlf.onLoginSuccess();
                    }
                    else {
                        var resumeUrl = $stateParams.resumeUrl;
                        dlf.loginData.password = '';

                        if (resumeUrl) {
                            $location.url(resumeUrl);
                        }
                        else {
                            $state.go('main.home')
                                .catch(function () {
                                    dlf.isBusy = false;
                                });
                        }
                    }
                })
                .catch(function (err) {
                    dlf.isBusy = false;
                    dlf.errorMessage = err && err.error_description;
                    dlf.errorMessage = dlf.errorMessage || i18nService.getString('site.Error_Common_UnexpectedError');
                    dlf.loginData.password = '';
                });
        };
    }
})();
