(function () {
    'use strict';

    angular.module('siteModule')
        .service('i18nService', [function () {
            var _entries = {
                site: {
                    Courts: 'Courts',
                    Home: 'Home',
                    Login: 'Login',
                    Or: 'Or',
                    Players: 'Players',
                    Search: 'Search',
                    SiteName: 'Dribbly',
                    Teams: 'Teams',
                    WelcomeToDribblyExclamation: 'Welcome to dribbly!'
                },
                auth: {
                    LogIn: 'Log In',
                    SignUp: 'Sign Up'
                }
            };

            function _getValue(key) {
                var keys = key.split('.');
                var app = _entries[keys[0]];
                var value = app[keys[1]];
                return value;
            }

            this.getValue = _getValue;

            return this;
        }]);
})();