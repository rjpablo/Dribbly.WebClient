(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyHomeContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dhc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTeamsService', 'drbblyToolbarService', '$state', 'drbblyAccountsService',
        'drbblyOverlayService', '$timeout', 'drbblyTournamentsService', 'drbblyCarouselhelperService',
        'drbblyCourtsService', 'authService', 'drbblyTeamshelperService', 'modalService', 'constants'];
    function controllerFunc(drbblyTeamsService, drbblyToolbarService, $state, drbblyAccountsService,
        drbblyOverlayService, $timeout, drbblyTournamentsService, drbblyCarouselhelperService, drbblyCourtsService,
        authService, drbblyTeamshelperService, modalService, constants) {
        var dhc = this;

        dhc.$onInit = function () {
            dhc.app.updatePageDetails({
                description: constants.site.description
            });
            dhc.topPlayersOverlay = drbblyOverlayService.buildOverlay();
            dhc.carouselSettings = drbblyCarouselhelperService.buildSettings();
            dhc.tournamentsOverlay = drbblyOverlayService.buildOverlay();
            dhc.tournamentsCarouselSettings = drbblyCarouselhelperService.buildSettings();
            dhc.teamsOverlay = drbblyOverlayService.buildOverlay();
            dhc.teamsCarouselSettings = drbblyCarouselhelperService.buildSettings();
            dhc.courtsListOverlay = drbblyOverlayService.buildOverlay();
            dhc.courtsCarouselSettings = drbblyCarouselhelperService.buildSettings();
            drbblyToolbarService.setItems([]);
            showFeatures();

            loadTopPlayers();
            loadTournaments();
            loadCourts();
            loadTeams();

            dhc.postsOptions = {
                postedOnType: constants.enums.entityTypeEnum.Account,
                getCount: 10,
                title: 'Latest Posts',
                canPost: true
            }
            dhc.app.mainDataLoaded();
        };

        function loadTopPlayers() {
            dhc.topPlayersOverlay.setToBusy();
            drbblyAccountsService.getTopPlayers()
                .then(data => {
                    dhc.topPlayers = data;
                    $timeout(function () {
                        dhc.carouselSettings.enabled = true;
                        dhc.topPlayersOverlay.setToReady();
                    }, 300);
                })
                .catch(e => {
                    dhc.topPlayersOverlay.setToError();
                });
        }

        // #region Features

        function showFeatures() {
            dhc.featuresCarouselSettings = drbblyCarouselhelperService.buildSettings();
            dhc.featuresCarouselSettings.slidesToShow = 1;
            dhc.featuresCarouselSettings.responsive = null;
            dhc.featuresCarouselSettings.autoplaySpeed = 5000;
            dhc.features = [
                {
                    name: 'Show the World What You Got',
                    description: 'Build your profile, upload your highlights and showcase your skills, achievements and stats and catch the eye of talent scouts and fellow basketball enthusiasts.',
                    backgroundUrl: 'src/images/features_carousel/player_profile.png',
                    action: function () { $state.go('auth.signUp') },
                    actionLabel: 'Sign Up Now',
                    backgroundPosition: 'left top',
                    isHidden: authService.authentication.isAuthenticated
                },
                {
                    name: 'Join a Team or Build Your Own',
                    description: 'Team up with your best basketball buddies and conquer tournaments together.',
                    backgroundUrl: 'src/images/features_carousel/team_formation.jpg',
                    action: function () {
                        drbblyTeamshelperService.openAddTeamModal({})
                            .then(function (team) {
                                if (team) {
                                    $state.go('main.team.home', { id: team.id });
                                }
                            });
                    },
                    actionLabel: 'Create a Team',
                    backgroundPosition: 'left center'
                },
                {
                    name: 'Easily Manage Tournaments',
                    description: 'Effortlessly manage tournament data such as players, teams, game results, etc. in one place, available anytime, anywhere.',
                    backgroundUrl: 'src/images/features_carousel/tournament_hub.jpg',
                    action: createTournament,
                    actionLabel: 'Host a Tournament',
                    backgroundPosition: 'left top'
                },
                {
                    name: 'Track Game Results',
                    description: 'Use our intuitive interface to log scores, fouls, and crucial plays as they happen in real time.',
                    backgroundUrl: 'src/images/features_carousel/game_tracking.png',
                    action: trackGames,
                    actionLabel: 'Track Games',
                    backgroundPosition: 'left top'
                }
            ];
            dhc.featuresCarouselSettings.enabled = true;
        }

        function trackGames() {
            modalService.alert({
                msg1Raw: 'Use the \'Track Results\' button in the details page of the game ' +
                    'that you created to start tracking game results.'
            });
        }

        function createTournament() {
            authService.checkAuthenticationThen(function () {
                return modalService.show({
                    view: '<drbbly-addtournamentmodal></drbbly-addtournamentmodal>',
                    model: {}
                });
            })
                .then(function (tournament) {
                    $state.go('main.tournament.home', { id: tournament.id });
                })
                .catch(function () { /* do nothing */ });
        };

        // #endregion Features

        function loadTournaments() {
            dhc.tournamentsOverlay.setToBusy();
            drbblyTournamentsService.getNew({ page: 1, pageSize: 10 })
                .then(data => {
                    dhc.tournaments = data;
                    $timeout(function () {
                        dhc.tournamentsCarouselSettings.enabled = true;
                        dhc.tournamentsOverlay.setToReady();
                    }, 300);
                })
                .catch(e => {
                    dhc.tournamentsOverlay.setToError();
                });
        }

        function loadTeams() {
            dhc.teamsOverlay.setToBusy();
            drbblyTeamsService.getTopTeams({ page: 1, pageSize: 10 })
                .then(data => {
                    dhc.teams = data;
                    $timeout(function () {
                        dhc.teamsCarouselSettings.enabled = true;
                        dhc.teamsOverlay.setToReady();
                    }, 300);
                })
                .catch(e => {
                    dhc.teamsOverlay.setToError();
                });
        }

        function loadCourts() {
            dhc.courtsListOverlay.setToBusy();
            drbblyCourtsService.getAllCourts()
                .then(function (data) {
                    dhc.courts = data;
                    $timeout(function () {
                        dhc.courtsCarouselSettings.enabled = true;
                        dhc.courtsListOverlay.setToReady();
                    }, 300);
                })
                .catch(dhc.courtsListOverlay.setToError);
        }
    }
})();
