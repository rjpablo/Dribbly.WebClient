(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyNavigator', {
            bindings: {},
            controllerAs: 'nav',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['authService', '$state', 'drbblyTeamshelperService', 'settingsService', 'modalService',
        'drbblyCourtshelperService', 'drbblyGameshelperService', 'drbblyGroupsService', 'drbblyEventshelperService'];
    function controllerFn(authService, $state, drbblyTeamshelperService, settingsService, modalService,
        drbblyCourtshelperService, drbblyGameshelperService, drbblyGroupsService, drbblyEventshelperService) {
        var nav = this;

        nav.$onInit = function () {
            nav.$state = $state;
            nav.usingSideNavigator = settingsService.useSideNavigator;
        };

        nav.searchClicked = function () {
            alert('Not yet implemented');
        };

        nav.logOut = function () {
            modalService.confirm('site.LogOutConfirmationMsg1', 'site.LogOutConfirmationMsg2', null, 'YesCancel')
                .then(function (response) {
                    if (response) {
                        authService.logOut();
                        $state.go('auth.login', { reload: true });
                    }
                });
        };

        nav.addTeam = function () {
            drbblyTeamshelperService.openAddTeamModal({})
                .then(function (team) {
                    if (team) {
                        $state.go('main.team.home', { id: team.id });
                    }
                });
        };

        nav.addGroup = function () {
            drbblyGroupsService.openGroupDetailsModal({})
                .then(function (group) {
                    if (group) {
                        $state.go('main.group.home', { id: group.id });
                    }
                });
        };

        nav.addEvent = function () {
            drbblyEventshelperService.openEventDetailsModal({})
                .then(function (event) {
                    if (event) {
                        $state.go('main.event.home', { id: event.id });
                    }
                });
        };

        nav.addLeague = function () {
            authService.checkAuthenticationThen(function () {
                return modalService.show({
                    view: '<drbbly-addleaguemodal></drbbly-addleaguemodal>',
                    model: {}
                });
            })
                .then(function (league) {
                    console.log(league);
                })
                .catch(function () { /* do nothing */ });
        };

        nav.addTournament = function () {
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

        nav.addCourt = function () {
            drbblyCourtshelperService.registerCourt()
                .then(function (court) {
                    if (court) {
                        $state.go('main.court.details', { id: court.id });
                    }
                });
        };

        nav.addGame = function () {
            drbblyGameshelperService.openAddEditGameModal({})
                .then(function (game) {
                    if (game) {
                        $state.go('main.game.details', { id: game.id });
                    }
                })
                .catch(function () { /* do nothing */ })
        };

        nav.isAuthenticated = function () {
            return authService.authentication.isAuthenticated;
        };

        //TEST FUNCTIONALITY ONLY
        nav.test = function () {
            authService.test();
        };
    }
})();
