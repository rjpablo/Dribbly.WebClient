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
            loadGame()
                .then(() => drbblyGameshelperService.track(gcc.game));
        };

        gcc.reloadGame = function () {
            return loadGame();
        }

        gcc.fbShare = function () {
            var url = `https://www.facebook.com/sharer/sharer.php?s=100&p[url]=${location.host}/game/${_gameId}`;
            window.open(url, 'targetWindow', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=250');
            return false;
        }

        function loadGame() {
            gcc.gameDetailsOverlay.setToBusy();
            return drbblyGamesService.getGame(_gameId)
                .then(function (data) {
                    gcc.game = gcc.game || {};
                    Object.assign(gcc.game, data);
                    gcc.game.start = new Date(drbblyDatetimeService.toUtcString(data.start));
                    massageGame();
                    gcc.isOwned = authService.isCurrentAccountId(gcc.game.addedById);
                    gcc.canManage = authService.isCurrentAccountId(gcc.game.addedById);
                    checkTeamLogos();
                    gcc.gameDetailsOverlay.setToReady();
                    gcc.app.mainDataLoaded();
                })
                .catch(gcc.gameDetailsOverlay.setToError);
        }

        function massageGame() {
            [gcc.game.team1, gcc.game.team2].forEach(team => {
                team.players.sort((a, b) => {
                    return a.jerseyNo > b.jerseyNo ? 1 :
                        a.jerseyNo < b.jerseyNo ? -1 :
                            0;
                });
                team.players.forEach(player => {
                    player.teamMembership.team = team.team;
                })
            })
        }

        function checkTeamLogos() {
            if (gcc.game.team1 && !gcc.game.team1.team.logo) {
                gcc.game.team1.team.logo = constants.images.defaultTeamLogo;
            }
            if (gcc.game.team2 && !gcc.game.team2.team.logo) {
                gcc.game.team2.team.logo = constants.images.defaultTeamLogo;
            }
        }

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

        gcc.reopenGame = function () {
            var model = {
                gameId: _gameId,
                isEdit: true,
                toStatus: gcc.gameStatusEnum.WaitingToStart
            };
            drbblyGameshelperService.openAddEditGameModal(model)
                .then(function (game) {
                    if (game) {
                        loadGame();
                    }
                })
                .catch(function () { /* do nothing */ });
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
            drbblyGameshelperService.untrack(gcc.game);
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
                },
                {
                    textKey: 'app.PlayByPlay',
                    targetStateName: 'main.game.playByPlay',
                    targetStateParams: { id: _gameId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Stats',
                    targetStateName: 'main.game.stats',
                    targetStateParams: { id: _gameId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                }
            ]);
        }
    }
})();
