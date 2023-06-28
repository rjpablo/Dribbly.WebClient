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
        'drbblyOverlayService', '$stateParams', '$interval', 'drbblyCommonService',
        'drbblyGameshelperService', 'drbblyDatetimeService', 'drbblyGameeventsService'];
    function controllerFunc(drbblyGamesService, modalService, constants, authService,
        drbblyOverlayService, $stateParams, $interval, drbblyCommonService,
        drbblyGameshelperService, drbblyDatetimeService, drbblyGameeventsService) {
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
                updateTime(gdg.timer.remainingTime, gdg.shotTimer.remainingTime, false);
                gdg.shotTimer.stop();
            });
            gdg.timer.onStart(function () {
                updateTime(gdg.timer.remainingTime, gdg.shotTimer.remainingTime, true);
                if (gdg.shotTimer.isOver()) {
                    gdg.shotTimer.reset();
                }
                gdg.shotTimer.start();
            });
            gdg.timer.onEditted(function (time, commit) {
                updateTime(time.totalMs, gdg.shotTimer.remainingTime, false)
                    .then(commit);
            });
        }

        gdg.onShotTimerReady = function (timer) {
            gdg.shotTimer = timer;
            gdg.shotTimer.onStop(function () {
                //game clock timer already takes care of this
                //updateTime(gdg.timer.remainingTime, gdg.shotTimer.remainingTime, false);
            });
            gdg.shotTimer.onStart(function () {
                //game clock timer already takes care of this
                //updateTime(gdg.timer.remainingTime, gdg.shotTimer.remainingTime, true);
            });
            gdg.shotTimer.onReset(function () {
                if (gdg.timer.isRunning()) {
                    gdg.shotTimer.start();
                }
            });
            gdg.shotTimer.onEditted(function (time, commit) {
                updateTime(gdg.timer.remainingTime, time.totalMs, false)
                    .then(commit);
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

        gdg.recordShot = async function (points, isMiss) {

            var modalResult = await modalService
                .show({
                    view: '<drbbly-recordshotmodal></drbbly-recordshotmodal>',
                    model: {
                        game: gdg.game,
                        takenBy: gdg.selectedPlayer.teamMembership,
                        points: points,
                        isMiss: isMiss.toString()
                    }
                }).catch(err => { /*modal cancelled, do nothing*/ });

            if (modalResult) {
                if (modalResult.shot) {
                    var shotResult = await drbblyGamesService.recordShot(modalResult)
                        .then(data => data)
                        .catch(function (err) {
                            drbblyCommonService.handleError(err, null, 'The shot was not recoded due to an error.')
                        });
                    if (shotResult) {
                        gdg.game.team1Score = shotResult.team1Score;
                        gdg.game.team2Score = shotResult.team2Score;
                        if (modalResult.shot.isMiss !== 'true') {
                            gdg.selectedPlayer.points = shotResult.totalPoints;
                        }
                        if (modalResult.withFoul) {
                            modalResult.foul.performedBy.fouls = shotResult.foulResult.totalPersonalFouls;
                        }
                        gdg.unselectPlayer(gdg.selectedPlayer);

                        if (modalResult.withFoul) {
                            applyFoulResult(shotResult.foulResult, modalResult.foul.performedByGamePlayer);
                        }
                    }
                }
            }
        }

        gdg.recordFoul = async function () {
            var modalResult = await modalService
                .show({
                    view: '<drbbly-fouldetailsmodal></drbbly-fouldetailsmodal>',
                    model: {
                        game: gdg.game,
                        performedBy: gdg.selectedPlayer,
                    }
                }).catch(err => { /*modal cancelled, do nothing*/ });

            if (modalResult) {
                var foulResult = await drbblyGameeventsService.upsertFoul(modalResult)
                    .then(data => data)
                    .catch(function (err) {
                        drbblyCommonService.handleError(err, null, 'The foul was not recoded due to an error.');
                    });
                if (foulResult) {
                    applyFoulResult(foulResult, gdg.selectedPlayer);
                }
            }
        }

        function applyFoulResult(foulResult, performedBy) {
            if (foulResult) {
                performedBy.fouls = foulResult.totalPersonalFouls;
                performedBy.ejectionStatus = foulResult.ejectionStatus;

                if (foulResult.ejectionStatus !== constants.enums.ejectionStatusEnum.NotEjected) {
                    var msg = '';
                    if (foulResult.ejectionStatus == constants.enums.ejectionStatusEnum.Ejected2FlagrantFouls) {
                        msg = `${performedBy.teamMembership.name} is ejected for committing 2 Flagrant Fouls.`
                    } else if (foulResult.ejectionStatus == constants.enums.ejectionStatusEnum.EjectedFlagrantFoul2) {
                        msg = `${performedBy.teamMembership.name} is ejected for committing Flagrant Foul 2.`
                    } else {
                        msg = `${performedBy.teamMembership.name} is now ejected.`;
                    }

                    modalService.alert({
                        titleRaw: 'EJECTED',
                        msg1Raw: msg
                    })
                }
                else if (foulResult.totalPersonalFouls >= gdg.game.allowedPersonalFouls) {
                    performedBy.hasFouledOut = true;
                    modalService.alert({
                        titleRaw: 'FOULED OUT',
                        msg1Raw: `${performedBy.teamMembership.name} has committed 6 personal fouls.`
                    });
                }
                gdg.unselectPlayer(performedBy);
            }
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

        gdg.canRecordShot = function () {
            return gdg.selectedPlayer && !(gdg.isEjected(gdg.selectedPlayer) || gdg.selectedPlayer.hasFouledOut);
        }

        gdg.canRecordFoul = function () {
            return gdg.selectedPlayer && !(gdg.isEjected(gdg.selectedPlayer) || gdg.selectedPlayer.hasFouledOut);
        }

        gdg.isEjected = function (player) {
            return player && player.ejectionStatus !== constants.enums.ejectionStatusEnum.NotEjected;
        }

        function loadGame() {
            gdg.gameDetailsOverlay.setToBusy();
            drbblyGamesService.getGame(_gameId)
                .then(function (data) {
                    gdg.game = angular.copy(data);

                    if (gdg.game.isTimed) {
                        gdg.timer.init(_periodDuration);
                        gdg.shotTimer.init(gdg.game.defaultShotClockDuration * 1000);
                        if (gdg.game.isLive) {
                            gdg.timer.run(new Date(drbblyDatetimeService.toUtcString(gdg.game.remainingTimeUpdatedAt)), gdg.game.remainingTime);
                            gdg.shotTimer.run(new Date(drbblyDatetimeService.toUtcString(gdg.game.remainingTimeUpdatedAt)), gdg.game.remainingShotTime);
                        } else {
                            gdg.timer.setRemainingTime(gdg.game.remainingTime);
                            gdg.shotTimer.setRemainingTime(gdg.game.remainingShotTime);
                        }

                        //displayTime(gdg.game.remainingTime);
                        displayPeriod(gdg.game.currentPeriod);
                    }

                    //loadTeams(gdg.game);
                    gdg.game.start = drbblyDatetimeService.toLocalDateTime(data.start);
                    gdg.isOwned = gdg.game.addedBy.identityUserId === authService.authentication.userId;
                    checkTeamLogos();
                    gdg.gameDetailsOverlay.setToReady();
                })
                .catch(gdg.gameDetailsOverlay.setToError);
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
                    .catch(function (err) {
                        drbblyCommonService.handleError(err);
                    });
            }
            else {
                alert('Not yet implemented');
            }
        };

        function updateTime(gameTimeRemaining, shotTimeRemaining, isLive) {
            var timeStamp = drbblyDatetimeService.getUtcNow();
            var input = {
                gameId: _gameId,
                timeRemaining: gameTimeRemaining,
                updatedAt: timeStamp,
                isLive: isLive,
                shotTimeRemaining: shotTimeRemaining
            };
            return drbblyGamesService.updateRemainingTime(input);
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
                .catch(function (err) { /* do nothing */ });
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
