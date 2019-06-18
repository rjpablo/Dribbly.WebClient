(function () {
    'use strict';

    var module = angular.module('siteModule', [
        'ui.router'
    ]);

    module.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', configFn]);
    function configFn($stateProvider, $urlRouterProvider, $locationProvider) {

        $urlRouterProvider.otherwise('home');

        $stateProvider
            .state('home', {
                url: '/home',
                template: '<drbbly-home-container></drbbly-home-container>'
            })

            .state('courts', {
                url: '/courts',
                template: '<drbbly-courts-container></drbbly-courts-container>'
            })

            .state('login', {
                url: '/login',
                template: '<drbbly-login-container></drbbly-login-container>'
            });

        $locationProvider.hashPrefix('');
    }
})();