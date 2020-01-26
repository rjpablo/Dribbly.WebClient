(function () {
    'use strict';
    var module = angular.module('mainModule', [
        'appModule'
    ]);

    module.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', configFn]);
    function configFn($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

        $urlRouterProvider.otherwise('courts');

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

            .state('main.court', {
                url: '/court/:id',
                template: '<drbbly-courtviewercontainer></drbbly-courtviewercontainer>',
                resolve: {
                    $titleKey: () => { return 'site.CourtDetails'; }
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

    module.run(['authService', '$transitions', '$rootScope', runFn]);
    function runFn(authService, $transitions, $rootScope) {

        $transitions.onSuccess({}, function (transition) {

        });

        $transitions.onRetain({}, function (transition, state) {

        });
    }
})();
