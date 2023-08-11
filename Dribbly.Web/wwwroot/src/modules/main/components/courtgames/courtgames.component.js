(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtgames', {
            bindings: {
                app: '<'
            },
            controllerAs: 'cgc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$stateParams', 'drbblyGamesService', 'drbblyOverlayService'];
    function controllerFunc($stateParams, drbblyGamesService, drbblyOverlayService) {
        var cgc = this;

        cgc.$onInit = function () {
            cgc.gamesOverlay = drbblyOverlayService.buildOverlay();
            cgc.courtId = $stateParams.id;
            cgc.pagination = {
                currentPage: 1,
                pageSize: 10
            };
            loadGames();
        };

        function loadGames() {
            var input = {
                courtIds: [cgc.courtId]
            };
            cgc.gamesOverlay.setToBusy();
            drbblyGamesService.getGames(input)
                .then(result => {
                    cgc.gamesOverlay.setToReady();
                    cgc.games = result;
                    cgc.showPage(cgc.pagination.currentPage, false);
                })
                .catch(() => cgc.gamesOverlay.setToError());
        }

        cgc.showPage = function(pageNumber, scrollToTop) {
            cgc.displayedGames = cgc.games.slice(cgc.pagination.pageSize * (pageNumber - 1), cgc.pagination.pageSize * pageNumber)
            if (scrollToTop !== false) {
                cgc.app.scrollTo(document.getElementById('court-games'), -15);
            }
        }
    }
})();
