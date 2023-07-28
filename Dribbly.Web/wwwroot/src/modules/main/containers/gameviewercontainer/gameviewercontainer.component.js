(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGameviewercontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'gcc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyGamesService', 'modalService', 'constants', 'authService',
        'drbblyOverlayService', '$stateParams', 'drbblyFooterService', '$scope', '$state',
        'drbblyGameshelperService', 'drbblyDatetimeService'];
    function controllerFunc(drbblyGamesService, modalService, constants, authService,
        drbblyOverlayService, $stateParams, drbblyFooterService, $scope, $state,
        drbblyGameshelperService, drbblyDatetimeService) {
        var gcc = this;
        var _gameId;

        gcc.$onInit = function () {
            _gameId = $stateParams.id;
            gcc.gameDetailsOverlay = drbblyOverlayService.buildOverlay();
            gcc.gameStatusEnum = constants.enums.gameStatus;
            buildSubPages();
            loadGame();
        };

        function loadGame() {
            gcc.gameDetailsOverlay.setToBusy();
            drbblyGamesService.getGame(_gameId)
                .then(function (data) {
                    gcc.game = angular.copy(data);
                    gcc.game.start = new Date(drbblyDatetimeService.toUtcString(data.start));
                    gcc.isOwned = authService.isCurrentAccountId(gcc.game.addedById);
                    gcc.canManage = authService.isCurrentAccountId(gcc.game.addedById);
                    checkTeamLogos();
                    gcc.gameDetailsOverlay.setToReady();
                    gcc.app.mainDataLoaded();
                })
                .catch(gcc.gameDetailsOverlay.setToError);
        }

        function checkTeamLogos() {
            if (gcc.game.team1 && !gcc.game.team1.team.logo) {
                gcc.game.team1.team.logo = constants.images.defaultTeamLogo;
            }
            if (gcc.game.team2 && !gcc.game.team2.team.logo) {
                gcc.game.team2.team.logo = constants.images.defaultTeamLogo;
            }
        }

        gcc.$onDestroy = function () {
            gcc.app.toolbar.clearNavItems();
        };

        function buildSubPages() {
            gcc.app.toolbar.setNavItems([
                {
                    textKey: 'app.Details',
                    targetStateName: 'main.game.details',
                    targetStateParams: { id: _gameId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                }
            ]);
        }
    }
})();
