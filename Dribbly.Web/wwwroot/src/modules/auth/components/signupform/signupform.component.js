(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblySignupform', {
            bindings: {
                app: '<'
            },
            controllerAs: 'suf',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', '$state', 'drbblyCommonService', '$stateParams', '$timeout', '$element'];
    function controllerFunc(authService, $state, drbblyCommonService, $stateParams, $timeout, $element) {
        var suf = this;

        suf.$onInit = function () {
            suf.errors = [];
            suf.externalData = $stateParams.data;
            suf.isExternal = !!suf.externalData;
            if (suf.externalData) {
                suf.model = {
                    firstName: suf.externalData.given_name,
                    lastName: suf.externalData.family_name,
                    email: suf.externalData.email,
                    userId: suf.externalData.user_id,
                    picture: suf.externalData.picture,
                    provider: suf.externalData.provider,
                    externalAccessToken: suf.externalData.externalAccessToken
                }
                $timeout(function () {
                    $element.find('[name=username]').focus();
                },)
            }
            if (suf.app) {
                suf.app.updatePageDetails({
                    title: 'Sign Up'
                });
            }
        };

        suf.signUp = function () {
            suf.errors = [];
            suf.isBusy = true;
            if (suf.isExternal) {
                authService.registerExternal(suf.model)
                    .then(function (response) {
                        $state.go('main.accout.home', { username: response.data.username })
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
            }
            else {
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
            }
        };
    }
})();
