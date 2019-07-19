(function () {
    'use strict';

    angular.module('siteModule')
        .service('i18nService', [function () {
            var _entries = {
                site: {
                    ConfirmPassword: 'Confirm Password',
                    Courts: 'Courts',
                    Email: 'Email',
                    Home: 'Home',
                    LoggedInAs: 'logged in as ',
                    LogOut: 'Log Out',
                    Or: 'Or',
                    Password: 'Password',
                    Players: 'Players',
                    Search: 'Search',
                    SiteName: 'Dribbly',
                    Teams: 'Teams',
                    WelcomeToDribblyExclamation: 'Welcome to dribbly!'
                },
                auth: {
                    AlreadyHaveAnAccount: 'Already have an account?',
                    DontHaveAnAccount: 'Don\'t have an account?',
                    LogIn: 'Log In',
                    LogInWithFacebook: 'Log in with Facebook',
                    LogInWithGoogle: 'Log in with Google',
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