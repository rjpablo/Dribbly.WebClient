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

    controllerFunc.$inject = ['authService', '$state'];
    function controllerFunc(authService, $state) {
        var dlf = this;

        dlf.login = function () {
            dlf.isBusy = true;
            authService.login(dlf.loginData)
                .then(function () {
                    $state.go('main.home')
                        .catch(function () {
                            dlf.loginData.password = '';
                            dlf.isBusy = false;
                        });
                })
                .catch(function (err) {
                    if (err && err.error_description) {
                        alert(err.error_description);
                    }
                    else {
                        alert('Login Failed');
                    }
                    dlf.loginData.password = '';
                    dlf.isBusy = false;
                });
        };
    }
})();
