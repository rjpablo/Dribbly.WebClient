(function () {
    'use strict';
    var module = angular.module('mainModule', [
        'appModule'
    ]);

    module.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', '$sceDelegateProvider', configFn]);
    function configFn($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {

        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain. **.
            'https://www.facebook.com/**',
            'https://facebook.com/**',
            'https://www.fb.watch/**',
            'https://fb.watch/**',
            'https://www.youtube.com/**',
            'https://youtube.com/**',
        ]);

        $urlRouterProvider.otherwise('home');

        $stateProvider
            // #region MAIN
            .state('main', {
                abstract: true,
                url: '',
                resolve: {
                    settings: ['settingsService', '$q', '$rootScope', function (settingsService, $q, $rootScope) {
                        var deferred = $q.defer();

                        settingsService.getInitialSettings()
                            .then((data) => {
                                deferred.resolve(data);
                                $rootScope.$broadcast('set-app-overlay', { status: '' });
                            })
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

            .state('main.home', {
                url: '/home',
                component: 'drbblyHomeContainer'
            })
            // #endregion MAIN

            // #region ACCOUNT
            .state('main.players', {
                url: '/players',
                component: 'drbblyAccountscontainer'
            })

            .state('main.account', {
                abstract: true,
                url: '/account/:username',
                component: 'drbblyAccountviewercontainer'
            })

            .state('main.account.home', {
                url: '',
                component: 'drbblyAccounthome'
            })

            .state('main.account.games', {
                url: '/games',
                component: 'drbblyPlayergames'
            })

            .state('main.account.details', {
                url: '/details',
                component: 'drbblyAccountdetails'
            })

            .state('main.account.settings', {
                url: '/settings',
                component: 'drbblyAccountsettings'
            })

            .state('main.account.photos', {
                url: '/photos',
                component: 'drbblyAccountphotos'
            })

            .state('main.account.videos', {
                url: '/videos',
                component: 'drbblyAccountvideos'
            })
            // #endregion ACCOUNT

            // PLAYER SEARCH

            .state('main.playersearch', {
                url: '/player-search?placeid&position&minheightinches&maxheightinches',
                component: 'drbblyPlayersearchcontainer'
            })

            // #region Court
            .state('main.courts', {
                url: '/courts',
                component: 'drbblyCourtsContainer'
            })

            .state('main.court', {
                abstract: true,
                url: '/court/:id',
                component: 'drbblyCourtviewercontainer'
            })

            .state('main.court.home', {
                url: '',
                component: 'drbblyCourthome'
            })

            .state('main.court.details', {
                url: '/details',
                component: 'drbblyCourtdetails'
            })

            .state('main.court.photos', {
                url: '/photos',
                component: 'drbblyCourtphotos'
            })

            .state('main.court.videos', {
                url: '/videos',
                component: 'drbblyCourtvideos'
            })

            .state('main.court.games', {
                url: '/games',
                component: 'drbblyCourtgames'
            })

            .state('main.court.bookings', {
                url: '/bookings',
                component: 'drbblyCourtbookings'
            })

            .state('main.court.schedule', {
                params: {
                    focusedEventId: null,
                    defaultDate: null
                },
                url: '/schedule',
                component: 'drbblyCourtschedulecontainer'
            })

            .state('main.court.reviews', {
                url: '/reviews',
                component: 'drbblyCourtreviews'
            })

            // #endregion Court

            // #region TEAM
            .state('main.teams', {
                url: '/teams',
                component: 'drbblyTeamscontainer'
            })

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
                component: 'drbblyTeamhome'
            })

            .state('main.team.members', {
                url: '/members/',
                component: 'drbblyTeammembers'
            })

            .state('main.team.games', {
                url: '/games/',
                component: 'drbblyTeamgames'
            })
            // #endregion TEAM

            // #region EVENTS
            .state('main.events', {
                url: '/events',
                component: 'drbblyEventscontainer'
            })

            .state('main.event', {
                params: {
                    id: ''
                },
                abstract: true,
                url: '/event/:id',
                component: 'drbblyEventviewercontainer'
            })

            .state('main.event.home', {
                url: '',
                component: 'drbblyEventhome'
            })

            .state('main.event.attendees', {
                url: '/attendees/',
                component: 'drbblyEventattendees'
            })
            // #endregion EVENTS
            // #region BOOKING

            .state('main.booking', {
                url: '/booking/:id',
                component: 'drbblyBookingviewercontainer'
            })

            .state('main.booking.details', {
                url: '/details',
                component: 'drbblybookingdetails'
            })
            // #endregion BOOKING

            // #region GAME
            .state('main.game', {
                params: {
                    id: ''
                },
                url: '/game/:id',
                abstract: true,
                component: 'drbblyGameviewercontainer'
            })

            .state('main.game.details', {
                url: '',
                component: 'drbblyGamedetails'
            })

            .state('main.game.playByPlay', {
                url: '/play-by-play',
                component: 'drbblyPlaybyplay'
            })

            .state('main.game.stats', {
                url: '/stats',
                component: 'drbblyGamestats'
            })

            .state('main.game.track', {
                url: '/track',
                component: 'drbblyGametracking',
                resolve: {
                    authorization: ['authService', '$state', 'drbblyToastService', 'drbblyGamesService', '$stateParams',
                        function (authService, $state, drbblyToastService, drbblyGamesService, $stateParams) {
                            function reject() {
                                $state.go('main.home')
                                drbblyToastService.error('Sorry, you don\'t have access to the requested page.')
                            }

                            // this line executes before verify token finishes so authData is empty and login modal is raised
                            return authService.checkAuthenticationThen(function () {
                                return drbblyGamesService.canTrackGame($stateParams.id)
                                    .then(isManager => {
                                        if (!isManager) {
                                            reject();
                                        }
                                    })
                                    .catch(reject);
                            })
                                .catch(reject);
                        }]
                }
            })
            // #endregion GAME

            // #region TOURNAMENTS
            .state('main.tournament', {
                abstract: true,
                url: '/tournament/:id',
                component: 'drbblyTournamentviewercontainer'
            })
            .state('main.tournament.home', {
                url: '',
                component: 'drbblyTournamenthome'
            })
            .state('main.tournament.games', {
                url: '/games',
                component: 'drbblyTournamentgames'
            })
            .state('main.tournament.teams', {
                url: '/teams',
                component: 'drbblyTournamentteams'
            })
            .state('main.tournament.stats', {
                url: '/stats',
                component: 'drbblyTournamentstats'
            })
            .state('main.tournament.stages', {
                url: '/stages',
                component: 'drbblyTournamentstages',
                resolve: {
                    authorization: ['authService', '$state', 'drbblyToastService', 'drbblyTournamentsService', '$stateParams',
                        function (authService, $state, drbblyToastService, drbblyTournamentsService, $stateParams) {
                            function reject() {
                                $state.go('main.home')
                                drbblyToastService.error('Sorry, you don\'t have access to the requested page.')
                            }

                            return authService.checkAuthenticationThen(function () {
                                return drbblyTournamentsService.isCurrentUserManager($stateParams.id)
                                    .then(isManager => {
                                        if (!isManager) {
                                            reject();
                                        }
                                    })
                                    .catch(reject);
                            })
                                .catch(reject);
                        }]
                }
            })
            .state('main.tournament.settings', {
                url: '/settings',
                component: 'drbblyTournamentsettings',
                resolve: {
                    authorization: ['authService', '$state', 'drbblyToastService', 'drbblyTournamentsService', '$stateParams',
                        function (authService, $state, drbblyToastService, drbblyTournamentsService, $stateParams) {
                            function reject() {
                                $state.go('main.home')
                                drbblyToastService.error('Sorry, you don\'t have access to the requested page.')
                            }

                            return authService.checkAuthenticationThen(function () {
                                return drbblyTournamentsService.isCurrentUserManager($stateParams.id)
                                    .then(isManager => {
                                        if (!isManager) {
                                            reject();
                                        }
                                    })
                                    .catch(reject);
                            })
                                .catch(reject);
                        }]
                }
            })
            // #endregion TOURNAMENTS

            // #region GROUPS

            .state('main.group', {
                params: {
                    id: ''
                },
                abstract: true,
                url: '/group/:id',
                component: 'drbblyGroupviewercontainer'
            })

            .state('main.group.home', {
                url: '',
                component: 'drbblyGrouphome'
            })

            .state('main.group.members', {
                url: '/members',
                component: 'drbblyGroupmembers'
            })
            // #endregion GROUPS

            // #region LEAGUE
            .state('main.league', {
                params: {
                    id: ''
                },
                abstract: true,
                url: '/league/:id',
                component: 'drbblyLeagueviewercontainer'
            })

            .state('main.league.seasons', {
                url: '/seasons',
                component: 'drbblyLeagueseasons'
            })
            // #endregion LEAGUE

            // #region AUTH
            .state('auth', {
                abstract: true,
                url: '',
                resolve: {
                    settings: ['$q', '$rootScope', function ($q, $rootScope) {
                        $rootScope.$broadcast('set-app-overlay', { status: '' });
                        return $q.resolve();
                    }]
                },
                component: 'drbblyAuthcontainer'
            })

            .state('auth.login', {
                url: '/login',
                params: {
                    resumeUrl: '',
                    messageKey: ''
                },
                component: 'drbblyLoginform'
            })

            .state('auth.passwordReset', {
                url: '/passwordreset?token&email',
                params: {
                    email: '',
                    token: ''
                },
                component: 'drbblyPasswordresetform'
            })

            .state('auth.forgotPassword', {
                url: '/forgotpassword',
                component: 'drbblyForgotpasswordform'
            })

            .state('auth.signUp', {
                url: '/signup?lat&lng',
                params: {
                    data: null
                },
                component: 'drbblySignupform'
            })
            // #endregion AUTH

            // #region TRACKING

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
                    }]
                },
                component: 'drbblyTrackingcontainer'
            })
            // #endregion TRACKING

            // #region POST

            .state('main.post', {
                url: '/post/:id',
                component: 'drbblyPostcontainer'
            })
            // #endregion POST

            // #region BLOGS
            .state('main.blogs', {
                url: '/blogs',
                component: 'drbblyBlogscontainer'
            })

            .state('main.blog', {
                url: '/blog/:slug',
                component: 'drbblyBlogcontainer'
            })
            // #endregion POST

            // #region PRIVACY POLICY
            .state('main.privacypolicy', {
                params: {
                    id: ''
                },
                url: '/privacy-policy',
                component: 'drbblyPrivacypolicycontainer'
            })
        // #endregion PRIVACY POLICY

        $locationProvider.html5Mode(true);

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
