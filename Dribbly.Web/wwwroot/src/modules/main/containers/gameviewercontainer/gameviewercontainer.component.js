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

    controllerFunc.$inject = ['drbblyGamesService', 'drbblyToolbarService',
        'drbblyOverlayService', '$stateParams', 'drbblyFooterService', '$scope', '$state'];
    function controllerFunc(drbblyGamesService, drbblyToolbarService,
        drbblyOverlayService, $stateParams, drbblyFooterService, $scope, $state) {
        var gcc = this;
        var _gameId;
        var _priceComponent;

        gcc.$onInit = function () {
            _gameId = $stateParams.id;
            gcc.gameDetailsOverlay = drbblyOverlayService.buildOverlay();
            loadGame();
            buildSubPages();
        };

        function loadGame() {
            gcc.gameDetailsOverlay.setToBusy();
            drbblyGamesService.getGame(_gameId)
                .then(function (data) {
                    gcc.game = data;
                    gcc.gameDetailsOverlay.setToReady();
                    createPriceComponent();
                })
                .catch(gcc.gameDetailsOverlay.setToError);
        }

        gcc.onGameUpdate = function () {
            loadGame();
        };

        function createPriceComponent() {

            if (_priceComponent) {
                _priceComponent.remove();
            }

            _priceComponent = drbblyFooterService.addFooterItem({
                scope: $scope,
                template: '<drbbly-gameprice game="gcc.game"></dribbly-gameprice>'
            });
        }

        gcc.$onDestroy = function () {
            _priceComponent.remove();
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
