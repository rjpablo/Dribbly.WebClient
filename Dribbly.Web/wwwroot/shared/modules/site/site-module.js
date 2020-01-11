(function () {
    'use strict';

    var module = angular.module('siteModule', [
        'ui.router',
        'drrbly.ui.router.title',
        'ngSanitize',
        'ngAnimate',
        'ngTouch',
        'ui.bootstrap'
    ]);

    module.constant('constants', {
        site: {
            name: 'Dribbly'
        }
    });

    module.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', configFn]);
    function configFn($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

        $urlRouterProvider.otherwise('home');

        $stateProvider
            .state('main', {
                abstract: true,
                url: '',
                template: '<drbbly-main-container app="app"></drbbly-main-container>'
            })

            .state('main.home', {
                url: '/home',
                template: '<drbbly-home-container></drbbly-home-container>',
                resolve: {
                    $titleKey: function () {
                        return 'site.Home';
                    }
                }
            })

            .state('main.courts', {
                url: '/courts',
                template: '<drbbly-courts-container></drbbly-courts-container>',
                resolve: {
                    $titleKey: () => { return 'site.Courts'; }
                }
            })

            .state('auth', {
                abstract: true,
                url: '',
                template: '<ui-view></ui-view>'
            })

            .state('auth.login', {
                url: '/login',
                template: '<drbbly-login-container app="app"></drbbly-login-container>',
                resolve: {
                    $titleKey: () => { return 'auth.LogIn'; }
                }
            })

            .state('auth.signUp', {
                url: '/signup',
                template: '<drbbly-signup-container app="app"></drbbly-signup-container>',
                resolve: {
                    $titleKey: () => { return 'auth.SignUp'; }
                }
            });

        $locationProvider.hashPrefix('');

        $httpProvider.interceptors.push('authInterceptorService');
    }

    module.config(['$titleProvider', 'constants', function ($titleProvider, constants) {
        $titleProvider.documentTitle(function ($rootScope) {
            return $rootScope.$root.$title ? $rootScope.$root.$title + ' - ' + constants.site.name : constants.site.name;
        });
    }]);

    module.run(['authService', '$transitions', '$rootScope', runFn]);
    function runFn(authService, $transitions, $rootScope) {
        authService.fillAuthData();
        $rootScope.$root = {
            auth: authService.authentication
        };

        $transitions.onSuccess({}, function (transition) {

        });

        $transitions.onRetain({}, function (transition, state) {
            console.log('State retained: ' + state.name);
        });
    }
})();
