(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeamgames', {
            bindings: {
                app: '<',
                team: '<'
            },
            controllerAs: 'tgc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyGamesService', 'authService', 'drbblyOverlayService', 'drbblyDatetimeService'];
    function controllerFunc(drbblyGamesService, authService, drbblyOverlayService, drbblyDatetimeService) {
        var tgc = this;

        tgc.$onInit = function () {
            tgc.overlay = drbblyOverlayService.buildOverlay();
            tgc.isManager = tgc.team.addedById === authService.authentication.accountId;
            tgc._activeTabIndex = 1;
            loadGames();
            tgc.app.updatePageDetails({
                title: (tgc.team.name) + ' - Games',
                image: tgc.team.logo.url
            });
        };

        function loadGames() {
            var input = {
                teamIds: [tgc.team.id],
                upcomingOnly: false,
                pageSize: 5
            };
            tgc.overlay.setToBusy();
            drbblyGamesService.getGames(input)
                .then(result => {
                    tgc.overlay.setToReady();
                    tgc.team.games = result;
                    massageGames(tgc.team.games);
                })
                .catch(() => tgc.overlay.setToError());
        }

        function massageGames(games) {
            games.forEach(game => {
                game.start = new Date(drbblyDatetimeService.toUtcString(game.start))
            })
        }

        tgc.upcomingFilter = function (item) {
            return item.start > new Date();
        }
    }
})();
