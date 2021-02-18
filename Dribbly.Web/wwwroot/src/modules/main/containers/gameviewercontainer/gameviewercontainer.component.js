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
                    checkTeamLogos();
                    gcc.gameDetailsOverlay.setToReady();
                })
                .catch(gcc.gameDetailsOverlay.setToError);
        }

        function checkTeamLogos() {
            if (gcc.game.team1 && !gcc.game.team1.logo) {
                gcc.game.team1.logo = {
                    url: constants.images.defaultTeamLogoUrl
                };
            }
            if (gcc.game.team2 && !gcc.game.team2.logo) {
                gcc.game.team2.logo = {
                    url: constants.images.defaultTeamLogoUrl
                };
            }
        }

        gcc.onGameUpdate = function () {
            loadGame();
        };

        gcc.setResult = function () {
            modalService.show({
                view: '<drbbly-gameresultmodal></drbbly-gameresultmodal>',
                model: { gameId: _gameId }
            })
                .then(function (result) {
                    if (result && result.savedChanges) {
                        loadGame();
                    }
                })
                .catch(function () {
                    // do nothing
                });
        };

        gcc.previewCourtDetails = function (event, court) {
            event.preventDefault();
            event.stopPropagation();
            modalService.show({
                view: '<drbbly-courtpreviewmodal></drbbly-courtpreviewmodal>',
                model: { court: court }
            });
        };

        gcc.updateStatus = function (toStatus) {
            if (toStatus === gcc.gameStatusEnum.Started || toStatus === gcc.gameStatusEnum.Finished) {
                drbblyGamesService.updateStatus(_gameId, toStatus)
                    .then(function () {
                        loadGame();
                    })
                    .catch(function () {
                        // do nothing
                    });
            }
            else {
                alert('Not yet implemented');
            }
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
                .catch(function () { /* do nothing */ });
        };

        gcc.cancelGame = function () {
            modalService.confirm({ msg1Key: 'app.CancelGamePrompt' })
                .then(function (result) {
                    if (result) {
                        drbblyGamesService.updateStatus(_gameId, gcc.gameStatusEnum.Cancelled)
                            .then(function () {
                                loadGame();
                            })
                            .catch(function () {
                                // do nothing
                            });
                    }
                });
        };

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
