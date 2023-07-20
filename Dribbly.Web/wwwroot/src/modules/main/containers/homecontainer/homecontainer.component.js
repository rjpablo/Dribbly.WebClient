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

    controllerFunc.$inject = ['drbblyTeamsService', 'drbblyToolbarService', 'drbblyCommonService', 'drbblyAccountsService',
        'drbblyOverlayService', '$timeout', 'drbblyTournamentsService', 'drbblyCarouselhelperService', 'drbblyCourtsService'];
    function controllerFunc(drbblyTeamsService, drbblyToolbarService, drbblyCommonService, drbblyAccountsService,
        drbblyOverlayService, $timeout, drbblyTournamentsService, drbblyCarouselhelperService, drbblyCourtsService) {
        var dhc = this;

        dhc.$onInit = function () {
            dhc.topPlayersOverlay = drbblyOverlayService.buildOverlay();
            dhc.carouselSettings = drbblyCarouselhelperService.buildSettings();
            dhc.tournamentsOverlay = drbblyOverlayService.buildOverlay();
            dhc.tournamentsCarouselSettings = drbblyCarouselhelperService.buildSettings();
            dhc.teamsOverlay = drbblyOverlayService.buildOverlay();
            dhc.teamsCarouselSettings = drbblyCarouselhelperService.buildSettings();
            dhc.courtsListOverlay = drbblyOverlayService.buildOverlay();
            dhc.courtsCarouselSettings = drbblyCarouselhelperService.buildSettings();
            drbblyToolbarService.setItems([]);

            loadTopPlayers();
            loadTournaments();
            loadCourts();
            loadTeams();
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
