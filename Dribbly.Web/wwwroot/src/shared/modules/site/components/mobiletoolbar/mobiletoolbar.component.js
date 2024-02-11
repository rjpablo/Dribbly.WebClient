(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyMobiletoolbar', {
            bindings: {
                // toolbar: '<', // TODO: remove refenrences if app-navigator stays in the footer permanently
                app: '<'
            },
            controllerAs: 'mtb',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$element', 'authService', '$state', '$window', '$rootScope', 'drbblyGameshelperService',
        'drbblyToolbarService', 'modalService', 'drbblyTeamshelperService', 'drbblyCourtshelperService',
        'drbblyGroupsService'];
    function controllerFn($element, authService, $state, $window, $rootScope, drbblyGameshelperService,
        drbblyToolbarService, modalService, drbblyTeamshelperService, drbblyCourtshelperService,
        drbblyGroupsService) {
        var mtb = this;
        mtb.$state = $state;

        mtb.$onInit = function () {
            $element.addClass('mobile-toolbar');
            drbblyToolbarService.onSetItems(onSetToolbarItems);
        };

        mtb.logOut = function () {
            modalService.confirm('site.LogOutConfirmationMsg1', 'site.LogOutConfirmationMsg2', null, 'YesCancel')
                .then(function (response) {
                    if (response) {
                        authService.logOut();
                        $state.go('main.home', { reload: true })
                            .finally(function () {
                                $window.location.reload();
                            });
                    }
                });
        };

        mtb.isAuthenticated = function () {
            return authService.authentication.isAuthenticated;
        };

        mtb.navItems = [{
            textKey: 'site.Home',
            targetState: 'main.home',
            icon: 'players'
        }, {
            textKey: 'site.Players',
            targetState: 'main.players',
            icon: 'players'
        }, {
            textKey: 'site.Courts',
            targetState: 'main.courts',
            icon: 'court-inclined'
        }, {
            textKey: 'site.Teams',
            targetState: 'main.teams',
            icon: 'players'
        }, {
            textKey: 'site.Blogs',
            targetState: 'main.blogs',
            icon: 'players'
        }];

        mtb.openCreateMenu = function () {
            var buttons = [{
                text: 'New Game',
                action: addGame,
                class: 'btn btn-secondary',
                isHidden: () => true
            }, {
                text: 'Create a Team',
                action: addTeam,
                class: 'btn btn-secondary'
            }, {
                text: 'Create a Tournament',
                action: addTournament,
                class: 'btn btn-secondary'
            }, {
                text: 'Register a Court',
                action: addCourt,
                class: 'btn btn-secondary'
            }, {
                text: 'Create a Group',
                action: addGroup,
                class: 'btn btn-secondary'
            },];

            modalService.showMenuModal({
                model: {
                    buttons: buttons,
                    title: 'Create'
                }
            }).catch(err => { /*modal cancelled, do nothing*/ });
        }
        function addGame() {
            drbblyGameshelperService.openAddEditGameModal({})
                .then(function (game) {
                    if (game) {
                        $state.go('main.game.details', { id: game.id });
                    }
                })
                .catch(function () { /* do nothing */ })
        }

        function addTeam() {
            drbblyTeamshelperService.openAddTeamModal({})
                .then(function (team) {
                    if (team) {
                        $state.go('main.team.home', { id: team.id });
                    }
                })
                .catch(function () { /* do nothing */ });
        }

        function addGroup() {
            drbblyGroupsService.openGroupDetailsModal({})
                .then(function (group) {
                    if (group) {
                        $state.go('main.group.home', { id: group.id });
                    }
                });
        };

        function addCourt() {
            drbblyCourtshelperService.registerCourt()
                .then(function (court) {
                    if (court) {
                        $state.go('main.court.details', { id: court.id });
                    }
                })
                .catch(function () { /* do nothing */ });
        }

        function addTournament() {
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

        mtb.openSearchModal = function () {
            modalService.show({
                view: '<drbbly-globalsearchmodal></drbbly-globalsearchmodal>',
                model: {},
                isFull: true
            })
                .catch(() => { /*do nothing*/ });
        };

        function onSetToolbarItems(data) {
            setItems(data.items);
            mtb.app.onSectionResize();
        }

        function setItems(items) {
            mtb.items = items;
        }

        mtb.toggleSideNavigator = () => $rootScope.$broadcast('toggle-sidenavigator');

    }
})();
