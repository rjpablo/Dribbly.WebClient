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
                    settings: ['settingsService', '$q', '$rootScope', function (settingsService, $q, $rootScope) {
                        var deferred = $q.defer();

                        settingsService.getInitialSettings()
                            .then(deferred.resolve)
                            .catch(function () {
                                //window.location.href = '/ErrorPage';
                                $rootScope.$broadcast('set-app-overlay', { status: 'error' });
                                deferred.reject();
                            });

                        return deferred.promise;
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

            // Account

            .state('main.account', {
                abstract: true,
                url: '/account/:username',
                component: 'drbblyAccountviewercontainer'
            })

            .state('main.account.home', {
                url: '',
                component: 'drbblyAccounthome',
                resolve: {
                    $titleKey: () => { return 'site.Home'; }
                }
            })

            .state('main.account.details', {
                url: '/details',
                component: 'drbblyAccountdetails',
                resolve: {
                    $titleKey: () => { return 'site.AccountDetails'; }
                }
            })

            .state('main.account.settings', {
                url: '/settings',
                component: 'drbblyAccountsettings',
                resolve: {
                    $titleKey: () => { return 'site.AccountSettings'; }
                }
            })

            .state('main.account.photos', {
                url: '/photos',
                component: 'drbblyAccountphotos',
                resolve: {
                    $titleKey: () => { return 'app.Photos'; }
                }
            })

            .state('main.account.videos', {
                url: '/videos',
                component: 'drbblyAccountvideos',
                resolve: {
                    $titleKey: () => { return 'app.AccountVideos'; }
                }
            })

            // Court

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
                    $titleKey: () => { return 'app.CourtPhotos'; }
                }
            })

            .state('main.court.videos', {
                url: '/videos',
                component: 'drbblyCourtvideos',
                resolve: {
                    $titleKey: () => { return 'app.CourtVideos'; }
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
                params: {
                    focusedEventId: null,
                    defaultDate: null
                },
                url: '/schedule',
                component: 'drbblyCourtschedulecontainer',
                resolve: {
                    $titleKey: () => { return 'site.CourtSchedule'; }
                }
            })

            .state('main.court.reviews', {
                url: '/reviews',
                component: 'drbblyCourtreviews',
                resolve: {
                    $titleKey: () => { return 'app.CourtReviews'; }
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
                component: 'drbblyAuthcontainer'
            })

            .state('auth.login', {
                url: '/login',
                params: {
                    resumeUrl: '',
                    messageKey: ''
                },
                component: 'drbblyLoginform',
                resolve: {
                    $titleKey: () => { return 'auth.LogIn'; }
                }
            })

            .state('auth.passwordReset', {
                url: '/passwordreset?token&email',
                params: {
                    email: '',
                    token: ''
                },
                component: 'drbblyPasswordresetform',
                resolve: {
                    $titleKey: () => { return 'auth.ResetPassword'; }
                }
            })

            .state('auth.forgotPassword', {
                url: '/forgotpassword',
                component: 'drbblyForgotpasswordform',
                resolve: {
                    $titleKey: () => { return 'auth.ForgotPassword'; }
                }
            })

            .state('auth.signUp', {
                url: '/signup',
                component: 'drbblySignupform',
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
