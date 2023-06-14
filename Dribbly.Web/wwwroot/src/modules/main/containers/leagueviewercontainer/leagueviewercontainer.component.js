(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyLeagueviewercontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'lvc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyLeaguesService', 'authService', '$stateParams', '$state', 'drbblyOverlayService',
        'constants'];
    function controllerFunc(drbblyLeaguesService, authService, $stateParams, $state, drbblyOverlayService,
        constants) {
        var lvc = this;
        var _leagueId;

        lvc.$onInit = function () {
            lvc.overlay = drbblyOverlayService.buildOverlay();
            _leagueId = $stateParams.id;
            loadLeague();
        };

        function loadLeague() {
            lvc.overlay.setToBusy();
            drbblyLeaguesService.getLeagueviewer(_leagueId)
                .then(function (league) {
                    lvc.overlay.setToReady();
                    lvc.league = league;
                    lvc.isOwned = authService.isCurrentUserId(lvc.league.addedById);
                    lvc.app.mainDataLoaded();
                    lvc.shouldDisplayAsPublic = true; //TODO should be conditional
                    buildSubPages();
                })
                .catch(lvc.overlay.setToError);
        }

        lvc.onLeagueUpdate = function () {
            loadLeague();
        };

        lvc.$onDestroy = function () {
            lvc.app.toolbar.clearNavItems();
        };

        function buildSubPages() {
        }
    }
})();
