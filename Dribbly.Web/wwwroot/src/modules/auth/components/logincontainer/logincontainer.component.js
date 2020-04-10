(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyLogincontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dlc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$window', '$state', 'authService'];
    function controllerFunc($window, $state, authService) {
        var dlc = this;

        dlc.$onInit = function () {
            checkURL();
        };

        function checkURL() {
            var fragment = getFragment();
            if (fragment) {
                authCompletedCB(fragment);
            }
        }

        function getFragment() {
            var queryString = $window.location.href.substr($window.location.href.indexOf("?") + 1);
            if ($window.location.href.indexOf("?") !== -1) {
                return parseQueryString(queryString);
            } else {
                return null;
            }
        }

        function authCompletedCB(fragment) {

            if (fragment.haslocalaccount === 'False') {

                authService.logOut();

                var externalAuthData = {
                    provider: fragment.provider,
                    userName: fragment.external_user_name.split(" ")[0],
                    externalAccessToken: fragment.external_access_token
                };

                authService.registerExternal(externalAuthData)
                    .then(function (res) {
                        $state.go('main.home');
                    })
                    .cath(function (err) {
                        alert('Login Failed');
                    });

            }
            else {
                var externalData = { provider: fragment.provider, externalAccessToken: fragment.external_access_token };
                authService.obtainAccessToken(externalData)
                    .then(function (response) {
                        $state.go('main.home');
                    })
                    .catch(function (err) {
                        alert('Login Failed');
                    });
            }
        }

        dlc.showLogin = function () {
            dlc.isResettingPassword = false;
        };

        function parseQueryString(queryString) {
            var data = {},
                pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

            if (queryString === null) {
                return data;
            }

            pairs = queryString.split("&");

            for (var i = 0; i < pairs.length; i++) {
                pair = pairs[i];
                separatorIndex = pair.indexOf("=");

                if (separatorIndex === -1) {
                    escapedKey = pair;
                    escapedValue = null;
                } else {
                    escapedKey = pair.substr(0, separatorIndex);
                    escapedValue = pair.substr(separatorIndex + 1);
                }

                key = decodeURIComponent(escapedKey);
                value = decodeURIComponent(escapedValue);

                data[key] = value;
            }

            return data;
        }

        dlc.showResetPassword = function () {
            dlc.isResettingPassword = true;
        };

    }
})();
