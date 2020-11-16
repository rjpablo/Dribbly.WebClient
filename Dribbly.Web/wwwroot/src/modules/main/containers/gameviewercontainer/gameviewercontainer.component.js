﻿(function () {
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
        var _priceComponent;

        gcc.$onInit = function () {
            _gameId = $stateParams.id;
            gcc.gameStatusEnum = constants.enums.gameStatus;
            gcc.gameDetailsOverlay = drbblyOverlayService.buildOverlay();
            loadGame();
            buildSubPages();
        };

        function loadGame() {
            gcc.gameDetailsOverlay.setToBusy();
            drbblyGamesService.getGame(_gameId)
                .then(function (data) {
                    gcc.game = angular.copy(data);
                    gcc.game.start = drbblyDatetimeService.toLocalDateTime(data.start);
                    gcc.isOwned = gcc.game.addedById === authService.authentication.userId;
                    gcc.gameDetailsOverlay.setToReady();
                    createPriceComponent();
                })
                .catch(gcc.gameDetailsOverlay.setToError);
        }

        gcc.onGameUpdate = function () {
            loadGame();
        };

        gcc.previewCourtDetails = function (event, court) {
            event.preventDefault();
            event.stopPropagation();
            modalService.show({
                view: '<drbbly-courtpreviewmodal></drbbly-courtpreviewmodal>',
                model: { court: court }
            });
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

        gcc.startGame = function () {
            // TODO: Implement
            alert('Not yet implemented');
        };

        gcc.updateGame = function () {
            var model = {
                gameId: _gameId,
                isEdit: true
            };
            drbblyGameshelperService.openAddEditGameModal(model)
                .then(function (game) {
                    if (game) {
                        loadGame();
                    }
                })
                .catch(function () { /* do nothing */ })
        };

        gcc.cancelGame = function () {
            // TODO: Implement
            alert('Not yet implemented');
        };

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
