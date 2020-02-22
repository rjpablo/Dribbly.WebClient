(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyLoginform', {
            bindings: {},
            controllerAs: 'dlf',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', '$state', '$stateParams', '$location'];
    function controllerFunc(authService, $state, $stateParams, $location) {
        var dlf = this;

        dlf.login = function () {
            var resumeUrl = $stateParams.resumeUrl;
            dlf.isBusy = true;
            authService.login(dlf.loginData)
                .then(function () {
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
                })
                .catch(function (err) {
                    dlf.loginData.password = '';
                    dlf.isBusy = false;
                });
        };
    }
})();
