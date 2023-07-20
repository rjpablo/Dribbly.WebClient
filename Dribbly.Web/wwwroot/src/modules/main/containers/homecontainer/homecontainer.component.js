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

    controllerFunc.$inject = ['constants', 'drbblyToolbarService', 'drbblyCommonService', 'drbblyAccountsService',
        'drbblyOverlayService', '$timeout', 'drbblyTournamentsService', 'drbblyCarouselhelperService'];
    function controllerFunc(constants, drbblyToolbarService, drbblyCommonService, drbblyAccountsService,
        drbblyOverlayService, $timeout, drbblyTournamentsService, drbblyCarouselhelperService) {
        var dhc = this;

        dhc.$onInit = function () {
            dhc.topPlayersOverlay = drbblyOverlayService.buildOverlay();
            dhc.tournamentsOverlay = drbblyOverlayService.buildOverlay();
            dhc.carouselSettings = drbblyCarouselhelperService.buildSettings();
            dhc.tournamentsCarouselSettings = drbblyCarouselhelperService.buildSettings();
            drbblyToolbarService.setItems([]);

            loadTopPlayers();
            loadTournaments();
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
    }
})();
