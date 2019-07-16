(function () {
    'use strict';

    var module = angular.module('siteModule', [
        'ui.router'
    ]);

    module.constant('constants', {
        site: {
            name: 'Dribbly'
        }
    });

    module.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', configFn]);
    function configFn($stateProvider, $urlRouterProvider, $locationProvider) {

        $urlRouterProvider.otherwise('home');

        $stateProvider
            .state('main', {
                abstract: true,
                url: '',
                template: '<drbbly-main-container app="app"></drbbly-main-container>'
            })

            .state('main.home', {
                url: '/home',
                template: '<drbbly-home-container></drbbly-home-container>'
            })

            .state('main.courts', {
                url: '/courts',
                template: '<drbbly-courts-container></drbbly-courts-container>'
            })

            .state('auth', {
                abstract: true,
                url: '',
                template: '<ui-view></ui-view>'
            })

            .state('auth.login', {
                url: '/login',
                template: '<drbbly-login-container app="app"></drbbly-login-container>'
            })

            .state('auth.signUp', {
                url: '/signup',
                template: '<drbbly-signup-container app="app"></drbbly-signup-container>'
            });

        $locationProvider.hashPrefix('');
    }

    module.run(['authService', '$transitions', runFn]);
    function runFn(authService, $transitions) {
        authService.fillAuthData();

        $transitions.onEnter({}, function (transition, state) {
            console.log('Entered new state: ' + state.name);
        });

        $transitions.onRetain({}, function (transition, state) {
            console.log('State retained: ' + state.name);
        });
    }
})();