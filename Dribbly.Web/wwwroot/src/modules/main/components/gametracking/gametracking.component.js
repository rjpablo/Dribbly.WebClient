(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGametracking', {
            bindings: {

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
        var _team2;

        gdg.$onInit = function () {
            _gameId = $stateParams.id;
            gdg.gameStatusEnum = constants.enums.gameStatus;
            gdg.gameDetailsOverlay = drbblyOverlayService.buildOverlay();
            loadGame();
        };

        function loadGame() {
            gdg.gameDetailsOverlay.setToBusy();
            drbblyGamesService.getGame(_gameId)
                .then(function (data) {
                    gdg.game = angular.copy(data);
                    loadTeams(gdg.game);
                    gdg.game.start = drbblyDatetimeService.toLocalDateTime(data.start);
                    gdg.isOwned = gdg.game.addedBy.identityUserId === authService.authentication.userId;
                    checkTeamLogos();
                    gdg.gameDetailsOverlay.setToReady();
                })
                .catch(gdg.gameDetailsOverlay.setToError);
        }

        function loadTeams(game) {
            if (game.team1) {
                drbblyGamesService.getGameTeam(game.id, game.team1.id)
                    .then(function (data) {
                        gdg.team1 = data;
                    })
                    .catch(gdg.gameDetailsOverlay.setToError);
            }

            if (game.team2) {
                drbblyGamesService.getGameTeam(game.id, game.team2.id)
                    .then(function (data) {
                        gdg.team2 = data;
                    })
                    .catch(gdg.gameDetailsOverlay.setToError);
            }
        }

        function checkTeamLogos() {
            if (gdg.game.team1 && !gdg.game.team1.logo) {
                gdg.game.team1.logo = {
                    url: constants.images.defaultTeamLogoUrl
                };
            }
            if (gdg.game.team2 && !gdg.game.team2.logo) {
                gdg.game.team2.logo = {
                    url: constants.images.defaultTeamLogoUrl
                };
            }
        }

        gdg.onGameUpdate = function () {
            loadGame();
        };

        gdg.setResult = function () {
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

        gdg.previewCourtDetails = function (event, court) {
            event.preventDefault();
            event.stopPropagation();
            modalService.show({
                view: '<drbbly-courtpreviewmodal></drbbly-courtpreviewmodal>',
                model: { court: court }
            });
        };

        gdg.updateStatus = function (toStatus) {
            if (toStatus === gdg.gameStatusEnum.Started || toStatus === gdg.gameStatusEnum.Finished) {
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

        gdg.reopenGame = function () {
            var model = {
                gameId: _gameId,
                isEdit: true,
                toStatus: gdg.gameStatusEnum.WaitingToStart
            };
            drbblyGameshelperService.openAddEditGameModal(model)
                .then(function (game) {
                    if (game) {
                        loadGame();
                    }
                })
                .catch(function () { /* do nothing */ });
        };

        gdg.updateGame = function () {
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

        gdg.cancelGame = function () {
            modalService.confirm({ msg1Key: 'app.CancelGamePrompt' })
                .then(function (result) {
                    if (result) {
                        drbblyGamesService.updateStatus(_gameId, gdg.gameStatusEnum.Cancelled)
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
