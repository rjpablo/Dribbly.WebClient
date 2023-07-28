(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyPlaybyplay', {
            bindings: {
                app: '<',
                game: '<'
            },
            controllerAs: 'pbp',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyGamesService', 'modalService', 'constants', 'authService',
        'drbblyOverlayService', '$stateParams', '$scope', '$state',
        'drbblyGameshelperService', 'drbblyDatetimeService'];
    function controllerFunc(drbblyGamesService, modalService, constants, authService,
        drbblyOverlayService, $stateParams, $scope, $state,
        drbblyGameshelperService, drbblyDatetimeService) {
        var pbp = this;
        var _gameId;

        pbp.$onInit = function () {
            _gameId = $stateParams.id;
            pbp.gameStatusEnum = constants.enums.gameStatus;
            pbp.gameDetailsOverlay = drbblyOverlayService.buildOverlay();
            //loadGame();
        };

        function loadGame() {
            pbp.gameDetailsOverlay.setToBusy();
            drbblyGamesService.getGame(_gameId)
                .then(function (data) {
                    pbp.game = angular.copy(data);
                    pbp.game.start = new Date(drbblyDatetimeService.toUtcString(data.start));
                    pbp.isOwned = authService.isCurrentAccountId(pbp.game.addedById);
                    pbp.canManage = authService.isCurrentAccountId(pbp.game.addedById);
                    checkTeamLogos();
                    pbp.gameDetailsOverlay.setToReady();
                    pbp.app.mainDataLoaded();
                })
                .catch(pbp.gameDetailsOverlay.setToError);
        }

        function checkTeamLogos() {
            if (pbp.game.team1 && !pbp.game.team1.logo) {
                pbp.game.team1.logo = {
                    url: constants.images.defaultTeamLogoUrl
                };
            }
            if (pbp.game.team2 && !pbp.game.team2.logo) {
                pbp.game.team2.logo = {
                    url: constants.images.defaultTeamLogoUrl
                };
            }
        }

        pbp.onGameUpdate = function () {
            loadGame();
        };

        pbp.setResult = function () {
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

        pbp.previewCourtDetails = function (event, court) {
            event.preventDefault();
            event.stopPropagation();
            modalService.show({
                view: '<drbbly-courtpreviewmodal></drbbly-courtpreviewmodal>',
                model: { court: court }
            });
        };

        pbp.updateStatus = function (toStatus) {
            if (toStatus === pbp.gameStatusEnum.Started || toStatus === pbp.gameStatusEnum.Finished) {
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

        pbp.reopenGame = function () {
            var model = {
                gameId: _gameId,
                isEdit: true,
                toStatus: pbp.gameStatusEnum.WaitingToStart
            };
            drbblyGameshelperService.openAddEditGameModal(model)
                .then(function (game) {
                    if (game) {
                        loadGame();
                    }
                })
                .catch(function () { /* do nothing */ });
        };

        pbp.updateGame = function () {
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

        pbp.cancelGame = function () {
            modalService.confirm({ msg1Key: 'app.CancelGamePrompt' })
                .then(function (result) {
                    if (result) {
                        drbblyGamesService.updateStatus(_gameId, pbp.gameStatusEnum.Cancelled)
                            .then(function () {
                                loadGame();
                            })
                            .catch(function () {
                                // do nothing
                            });
                    }
                });
        };
    }
})();
