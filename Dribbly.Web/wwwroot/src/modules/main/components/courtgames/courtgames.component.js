(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtgames', {
            bindings: {
                app: '<',
                court: '<'
            },
            controllerAs: 'cgc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$stateParams', 'drbblyGamesService', 'drbblyOverlayService', 'constants'];
    function controllerFunc($stateParams, drbblyGamesService, drbblyOverlayService, constants) {
        var cgc = this;

        cgc.$onInit = function () {
            cgc.gamesOverlay = drbblyOverlayService.buildOverlay();
            cgc.courtId = $stateParams.id;
            cgc.pagination = {
                currentPage: 1,
                pageSize: 10
            };
            loadGames();
            cgc.app.updatePageDetails({
                title: 'Games at ' + cgc.court.name,
                description: 'Games scheduled at ' + cgc.court.name,
                image: (cgc.court.primaryPhoto || constants.images.defaultCourtLogo).url
            });
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
