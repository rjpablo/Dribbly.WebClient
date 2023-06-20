﻿(function () {
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

            .state('main.court.home', {
                url: '/home',
                component: 'drbblyCourthome',
                resolve: {
                    $titleKey: () => { return 'site.CourtHome'; }
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

            .state('main.court.bookings', {
                url: '/bookings',
                component: 'drbblyCourtbookings',
                resolve: {
                    $titleKey: () => { return 'site.CourtBookings'; }
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

            // TEAM

            .state('main.team', {
                params: {
                    id: ''
                },
                abstract: true,
                url: '/team/:id',
                component: 'drbblyTeamviewercontainer'
            })

            .state('main.team.home', {
                url: '',
                component: 'drbblyTeamhome',
                resolve: {
                    $titleKey: () => { return 'site.Home'; }
                }
            })

            .state('main.team.members', {
                url: '/members/',
                component: 'drbblyTeammembers',
                resolve: {
                    $titleKey: () => { return 'app.Members'; }
                }
            })

            // BOOKING

            .state('main.booking', {
                url: '/booking/:id',
                component: 'drbblyBookingviewercontainer',
                resolve: {
                    $titleKey: () => { return 'app.BookingDetails'; }
                }
            })

            .state('main.booking.details', {
                url: '/details',
                component: 'drbblybookingdetails',
                resolve: {
                    $titleKey: () => { return 'app.BookingDetails'; }
                }
            })

            // GAME
            .state('main.game', {
                params: {
                    id: ''
                },
                url: '/game/:id',
                abstract: true,
                component: 'drbblyGameviewercontainer',
                resolve: {
                    $titleKey: () => { return 'app.GameDetails'; }
                }
            })

            .state('main.game.details', {
                url: '',
                component: 'drbblyGamedetails',
                resolve: {
                    $titleKey: () => { return 'app.GameDetails'; }
                }
            })

            .state('main.game.track', {
                url: '/track',
                component: 'drbblyGametracking',
                resolve: {
                    $titleKey: () => { return 'app.GameDetails'; }
                }
            })

            // LEAGUE
            .state('main.league', {
                params: {
                    id: ''
                },
                abstract: true,
                url: '/league/:id',
                component: 'drbblyLeagueviewercontainer',
                resolve: {
                    $titleKey: () => { return 'app.LeagueDetails'; }
                }
            })

            .state('main.league.seasons', {
                url: '/seasons',
                component: 'drbblyLeagueseasons',
                resolve: {
                    $titleKey: () => { return 'app.Seasons'; }
                }
            })

            // AUTH
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
            })

            // TRACKING

            .state('tracking', {
                url: 'tracking/:gameId',
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
                    }],
                    $titleKey: () => { return 'app.GameTracking'; }
                },
                component: 'drbblyTrackingcontainer'
            });

        $locationProvider.hashPrefix('');

        $httpProvider.interceptors.push('authInterceptorService');
    }

    module.run(['authService', '$transitions', '$rootScope', runFn]);
    function runFn(authService, $transitions, $rootScope) {

        $transitions.onSuccess({}, function (transition) {
            var root = angular.element('#drbbly-root-container')[0];
            root.scrollTo(0, 0);
        });

        $transitions.onRetain({}, function (transition, state) {

        });
    }
})();
