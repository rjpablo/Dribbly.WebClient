(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGamedetails', {
            bindings: {
                app: '<',
                game: '<'
            },
            controllerAs: 'gdg',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyGamesService', 'modalService', 'constants', 'authService',
        'drbblyOverlayService', '$stateParams', '$scope', '$state',
        'drbblyGameshelperService', 'drbblyDatetimeService'];
    function controllerFunc(drbblyGamesService, modalService, constants, authService,
        drbblyOverlayService, $stateParams, $scope, $state,
        drbblyGameshelperService, drbblyDatetimeService) {
        var gdg = this;
        var _gameId;

        gdg.$onInit = function () {
            _gameId = $stateParams.id;
            gdg.gameStatusEnum = constants.enums.gameStatus;
            gdg.gameDetailsOverlay = drbblyOverlayService.buildOverlay();
        };

        gdg.$onChanges = changes => {
            if (changes.game && changes.game.currentValue) {
                gdg.app.updatePageDetails({
                    title: (gdg.game.title || 'Untitled Game') + ' - Details'
                });
                gdg.isManager = authService.isCurrentAccountId(gdg.game.addedById);
                gdg.postsOptions = {
                    postedOnType: constants.enums.entityType.Game,
                    postedOnId: gdg.game.id,
                    title: 'Updates',
                    addButtonLabel: 'New Update',
                    emplyLabel: 'No updates found.',
                    canPost: gdg.isManager
                };

            }
        }
    }
})();
