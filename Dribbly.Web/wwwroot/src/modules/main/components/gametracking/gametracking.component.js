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
        'drbblyOverlayService', '$stateParams', '$scope', '$state', '$interval',
        'drbblyGameshelperService', 'drbblyDatetimeService'];
    function controllerFunc(drbblyGamesService, modalService, constants, authService,
        drbblyOverlayService, $stateParams, $scope, $state, $interval,
        drbblyGameshelperService, drbblyDatetimeService) {
        var gdg = this;
        var _gameId;
        var _periodDuration

        gdg.$onInit = function () {
            _gameId = $stateParams.id;
            gdg.gameStatusEnum = constants.enums.gameStatus;
            gdg.gameDetailsOverlay = drbblyOverlayService.buildOverlay();
            _periodDuration = 12 * 60 * 1000; // 12mins
            loadGame();
        };

        gdg.onTimerReady = function (timer) {
            gdg.timer = timer;
            gdg.timer.onUpdate(displayTime);
            gdg.timer.onStop(function () {
                updateTime(gdg.timer.remainingTime, false);
            });
            gdg.timer.onStart(function () {
                updateTime(gdg.timer.remainingTime, true);
            });
        }

        function displayTime(duration) {
            var min = Math.floor(duration / 60000).toString();
            var sec = Math.floor((duration % 60000) / 1000).toString();
            var ms = Math.floor((duration % 1000) / 100).toString();
            gdg.time = '';
            if (min > 0) {
                gdg.time += `${min.padStart(2, '0')}:`;
            }
            gdg.time += `${sec.padStart(2, '0')}`;
            if (min === '0') {
                gdg.time += `.${ms}`;
            }
        }

        function displayPeriod(period) {
            if (period < 5) {
                gdg._period = 'Q' + period;
            } else {
                gdg._period = 'OT' + (period - 4);
            }
        }

        gdg.toggleClock = function () {
            gdg.timer.toggle();
        }

        gdg.togglePlayerSelection = function (player) {
            if (player.isSelected) {
                gdg.unselectPlayer(player);
            }
            else {
                if (gdg.selectedPlayer) {
                    gdg.selectedPlayer.isSelected = false;
                }
                gdg.selectPlayer(player);
            }
        }

        gdg.selectPlayer = function (player) {
            player.isSelected = true;
            gdg.selectedPlayer = player;
        }

        gdg.unselectPlayer = function (player) {
            player.isSelected = false;
            gdg.selectedPlayer = null;
        }

        gdg.recordShot = function (points, isMiss) {
            var shot = {
                points: points,
                isMiss: isMiss,
                takenById: gdg.selectedPlayer.id,
                teamId: gdg.selectedPlayer.teamId,
                gameId: gdg.game.id
            };

            drbblyGamesService.recordShot(shot)
                .then(function (data) {
                    gdg.game.team1Score = data.team1Score;
                    gdg.game.team2Score = data.team2Score;
                    if (!isMiss) {
                        gdg.selectedPlayer.points += points;
                    }
                    gdg.unselectPlayer(gdg.selectedPlayer);
                })
                .catch(gdg.gameDetailsOverlay.setToError);
        }

        gdg.endGame = function () {
            if (gdg.game.team1Score === gdg.game.team2Score) {
                modalService.alert({ msg1Key: 'app.Error_EndGame_Tied', titleKey: 'app.EndGame' })
                    .then(function () {
                        bgm.cancel();
                    });
                return;
            }

            modalService.show({
                view: '<drbbly-endgamemodal></drbbly-endgametmodal>',
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
        }

        function loadGame() {
            gdg.gameDetailsOverlay.setToBusy();
            drbblyGamesService.getGame(_gameId)
                .then(function (data) {
                    gdg.game = angular.copy(data);

                    if (gdg.game.isTimed) {
                        
                        if (gdg.game.isLive) {
                            gdg.timer.run(new Date(drbblyDatetimeService.toUtcString(gdg.game.remainingTimeUpdatedAt)), gdg.game.remainingTime);
                        } else {
                            gdg.timer.setRemainingTime(gdg.game.remainingTime);
                        }

                        //displayTime(gdg.game.remainingTime);
                        displayPeriod(gdg.game.currentPeriod);
                    }

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
            if (toStatus === gdg.gameStatusEnum.Started || toStatus === gdg.gameStatusEnum.Finished
                || toStatus === gdg.gameStatusEnum.WaitingToStart) {
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

        function updateTime(duration, isLive) {
            var timeStamp = drbblyDatetimeService.getUtcNow();
            var input = {
                gameId: _gameId,
                timeRemaining: duration,
                updatedAt: timeStamp,
                isLive: isLive
            };
            drbblyGamesService.updateRemainingTime(input)
                .then(function () {
                    // do nothing
                })
                .catch(function () {
                    // TODO: handle error
                });
        }

        gdg.goToNextPeriod = function () {
            var period = gdg.game.currentPeriod + 1;
            var newTime = period > 4 ?
                5 * 60 * 1000 : //5mins
                _periodDuration;
            gdg.isBusy = true;
            drbblyGamesService.advancePeriod(_gameId, period, newTime)
                .then(function () {
                    gdg.game.currentPeriod = period;
                    _periodDuration = newTime;
                    gdg.timer.reset(newTime);
                    displayPeriod(gdg.game.currentPeriod);
                    displayTime(gdg.timer.remainingTime);
                })
                .catch(function () {
                    // do nothing
                })
                .finally(function () {
                    gdg.isBusy = false;
                });
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

        class BadTimer {
            duration = 0;
            running = false;
            constructor(duration) {
                this.origDuration = duration;
                this.duration = duration;
            }
            start() {
                this.run(new Date(), this.duration)
                if (this.onStartCallback) {
                    this.onStartCallback();
                }
            }
            run(start, startDuration) {
                this.running = true;
                var _this = this;
                this.timerInterval = $interval(function () {
                    if (_this.isRunning) {
                        var now = new Date();
                        _this.duration = startDuration - (now - start);
                        if (_this.duration <= 0) {
                            _this.duration = 0;
                            _this.stop();
                        }
                        _this.onUpdateCallback(_this.duration);
                    }
                }, 100);
            }
            onUpdate(cb) {
                this.onUpdateCallback = cb;
            }
            onStop(cb) {
                this.onStopCallback = cb;
            }
            onStart(cb) {
                this.onStartCallback = cb;
            }
            reset(duration) {
                if (duration !== null && duration !== undefined) {
                    this.origDuration = duration;
                }
                this.duration = this.origDuration;
            }
            stop() {
                this.running = false;
                $interval.cancel(this.timerInterval);
                if (this.onStopCallback) {
                    this.onStopCallback();
                }
            }
            isRunning() {
                return this.running;
            }
            isOver() {
                return this.duration === 0;
            }
            toggle() {
                if (this.running) {
                    this.stop();
                } else {
                    this.start();
                }
            }
            get remainingTime() {
                return this.duration;
            }
        }
    }

})();
