(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblySocialauth', {
            bindings: {
                active: '<',
                isBusy: '='
            },
            controllerAs: 'dsa',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', '$state'];
    function controllerFunc(authService, $state) {
        var dsa = this;

        dsa.$onInit = function () {
            if (dsa.active) {
                renderGoogleLoginButton();
            }
        };

        dsa.loginExternal = function (provider) {
            authService.loginExternal(provider);
        };

        function renderGoogleLoginButton() {
            google.accounts.id.initialize({
                client_id: "631124985942-8p2ut6fueiu72olbnl90gm29il7bcv0c.apps.googleusercontent.com",
                callback: handleCredentialResponse
            });
            google.accounts.id.renderButton(
                document.getElementById("buttonDiv"),
                { theme: "outline", size: "large" }  // customization attributes
            );
            google.accounts.id.prompt(); // also display the One Tap dialog
        }

        function handleCredentialResponse(response) {
            dsa.isBusy = true;
            authService.obtainAccessToken({ provider: 'Google', externalAccessToken: response.credential })
                .then(function (response) {
                    if (!response.data.hasRegistered) {
                        $state.go('auth.signUp', { data: response.data });
                    }
                    else {
                        $state.go('main.home');
                    }
                })
                .catch(function (err) {
                    alert('Login Failed');
                })
                .finally(() => dsa.isBusy = false);
        }
    }
})();
