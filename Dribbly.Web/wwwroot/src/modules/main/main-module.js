(function () {
    'use strict';
    var module = angular.module('mainModule', [
        'appModule'
    ]);

    module.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', configFn]);
    function configFn($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

        $urlRouterProvider.otherwise('home');

        $stateProvider
            .state('main', {
                abstract: true,
                url: '',
                resolve: {
                    settings: ['settingsService', function (settingsService) {
                        return settingsService.getInitialSettings();
                    }]
                },
                component: 'drbblyMainContainer'
                //template: '<drbbly-main-container app="app"></drbbly-main-container>'
            })

            .state('main.home_tmp', {
                url: '/home_tmp',
                template: '<drbbly-home-container></drbbly-home-container>',
                resolve: {
                    $titleKey: function () {
                        return 'site.Home';
                    }
                }
            })

            .state('main.home', {
                url: '/home',
                template: '<drbbly-courts-container></drbbly-courts-container>',
                resolve: {
                    $titleKey: () => { return 'site.Home'; }
                }
            })

            .state('main.court', {
                abstract: true,
                url: '/court/:id',
                component: 'drbblyCourtviewercontainer',
                resolve: {
                    $titleKey: () => { return 'site.CourtDetails'; }
                }
            })

            .state('main.court.details', {
                url: '/details',
                component: 'drbblyCourtdetails',
                resolve: {
                    $titleKey: () => { return 'site.CourtDetails'; }
                }
            })

            .state('main.court.photos', {
                url: '/photos',
                component: 'drbblyCourtphotos',
                resolve: {
                    $titleKey: () => { return 'site.CourtDetails'; }
                }
            })

            .state('main.court.games', {
                url: '/games',
                component: 'drbblyCourtgames',
                resolve: {
                    $titleKey: () => { return 'site.CourtGames'; }
                }
            })

            .state('main.court.schedule', {
                url: '/schedule',
                component: 'drbblyCourtschedulecontainer',
                resolve: {
                    $titleKey: () => { return 'site.CourtSchedule'; }
                }
            })

            .state('main.game', {
                url: '/game/:id',
                component: 'drbblyGameviewercontainer',
                resolve: {
                    $titleKey: () => { return 'app.GameDetails'; }
                }
            })

            .state('main.game.details', {
                url: '/details',
                component: 'drbblygamedetails',
                resolve: {
                    $titleKey: () => { return 'app.GameDetails'; }
                }
            })

            .state('auth', {
                abstract: true,
                url: '',
                template: '<ui-view></ui-view>'
            })

            .state('auth.login', {
                url: '/login',
                params: {
                    resumeUrl: ''
                },
                template: '<drbbly-logincontainer app="app"></drbbly-logincontainer>',
                resolve: {
                    $titleKey: () => { return 'auth.LogIn'; }
                }
            })

            .state('auth.signUp', {
                url: '/signup',
                template: '<drbbly-signupcontainer app="app"></drbbly-signupcontainer>',
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
