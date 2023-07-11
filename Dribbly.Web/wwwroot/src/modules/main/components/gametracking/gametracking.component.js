(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGametracking', {
            bindings: {
                app: '<'
            },
            controllerAs: 'gdg',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyGamesService', 'modalService', 'constants', 'authService',
        'drbblyOverlayService', '$stateParams', '$interval', 'drbblyCommonService', '$window',
        'drbblyGameshelperService', 'drbblyDatetimeService', 'drbblyGameeventsService', '$document'];
    function controllerFunc(drbblyGamesService, modalService, constants, authService,
        drbblyOverlayService, $stateParams, $interval, drbblyCommonService, $window,
        drbblyGameshelperService, drbblyDatetimeService, drbblyGameeventsService, $document) {
        var gdg = this;
        var _gameId;

        gdg.$onInit = function () {
            gdg.app.noHeader = true;
            gdg.app.noFooter = true;
            _gameId = $stateParams.id;
            gdg.gameStatusEnum = constants.enums.gameStatus;
            gdg.gameDetailsOverlay = drbblyOverlayService.buildOverlay();
            setOrientation();

            angular.element($window).on('resize', setOrientation);
        };

        function setOrientation() {
            var screenWidth = window.innerWidth;
            var screenHeight = window.innerHeight;
            gdg.isVertical = screenHeight > screenWidth;
        }

        gdg.$onDestroy = function () {
            angular.element($window).off('resize', setOrientation);
            gdg.app.noHeader = false;
            gdg.app.noFooter = false;
        }

        gdg.onTimerReady = function (timer) {
            gdg.timer = timer;
            gdg.timer.onUpdate(displayTime);
            gdg.timer.onStop(function () {
                updateTime(gdg.timer.remainingTime, gdg.shotTimer.remainingTime, false);
                gdg.shotTimer.stop();
                updateStatusText();
            });
            gdg.timer.onStart(function () {
                if (gdg.game.status === gdg.gameStatusEnum.WaitingToStart) {
                    gdg.jumpBall();
                    return false;
                }

                updateTime(gdg.timer.remainingTime, gdg.shotTimer.remainingTime, true);
                if (gdg.shotTimer.isOver()) {
                    gdg.shotTimer.reset();
                }
                gdg.shotTimer.start();
                return true;
            });
            gdg.timer.onStarted(function () {
                updateStatusText();
            });
            gdg.timer.onEditted(function (time, commit) {
                updateTime(time.totalMs, gdg.shotTimer.remainingTime, false)
                    .then(commit);
            });

            gdg.timer.onEnd(function () {
                gdg.shotTimer.setRemainingTime(0);
            });

            loadGame();
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
                return true;
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
            gdg.shotTimer.onEnd(function () {
                gdg.timer.stop();
            });
        }

        gdg.setShotTime = function (time, start) {
            time = time < gdg.timer.remainingTime ? time : gdg.timer.remainingTime;
            updateTime(gdg.timer.remainingTime, time, start);
            gdg.shotTimer.setRemainingTime(time, start);
        };

        gdg.setNextPossession = function (nextPossession) {
            var currentValue = gdg.game.nextPossession;
            gdg.game.nextPossession = nextPossession;
            drbblyGamesService.setNextPossession(_gameId, nextPossession)
                .catch(function (err) {
                    gdg.game.nextPossession = currentValue;
                    drbblyCommonService.handleError(err, null, 'The foul was not recoded due to an error.');
                });
        }

        gdg.setLineup = async function (team) {
            var modalResult = await modalService
                .show({
                    view: '<drbbly-setlineupmodal></drbbly-setlineupmodal>',
                    model: {
                        team: team
                    }
                }).catch(err => { /*modal cancelled, do nothing*/ });

            if (modalResult) {
                team.players.forEach(p => {
                    p.isInGame = modalResult.selectedPlayers.drbblyAny(s => s.id === p.id);
                });
                team.players.sort((a, b) => {
                    return a.isInGame && !b.isInGame ? -1 :
                        !a.isInGame && b.isInGame ? 1 :
                            0;
                });

                setLineupsReady()

                drbblyGamesService.updateLineup({
                    gameId: _gameId,
                    teamId: team.teamId,
                    period: gdg.game.currentPeriod,
                    clockTime: gdg.timer.remainingTime,
                    gamePlayerIds: modalResult.selectedPlayers.map(p => p.id)
                })
                    .catch(function (err) {
                        gdg.game.nextPossession = currentValue;
                        drbblyCommonService.handleError(err);
                    });
            }
        }

        function setLineupsReady() {
            gdg.lineupsReady = gdg.game.team1.players.drbblyCount(p => p.isInGame) > 0
                && gdg.game.team2.players.drbblyCount(p => p.isInGame) > 0;
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
            if (period <= gdg.game.numberOfRegulationPeriods) {
                gdg._period = period;
            } else {
                gdg._period = 'OT' + (period - gdg.game.numberOfRegulationPeriods);
            }
        }

        gdg.togglePlayerSelection = function (player) {
            if (player.isSelected) {
                gdg.unselectPlayer(player);
            }
            else {
                gdg.selectPlayer(player);
            }
        }

        gdg.selectPlayer = function (player) {
            if (gdg.selectedTeam) {
                gdg.unselectTeam(gdg.selectedTeam);
            }
            if (gdg.selectedPlayer) {
                gdg.selectedPlayer.isSelected = false;
            }
            player.isSelected = true;
            gdg.selectedPlayer = player;
        }

        gdg.unselectPlayer = function (player) {
            player.isSelected = false;
            gdg.selectedPlayer = null;
        }

        gdg.toggleTeamSelection = function (team) {
            if (team.isSelected) {
                gdg.unselectTeam(team);
            }
            else {
                gdg.selectTeam(team);
            }
        }

        gdg.selectTeam = function (team) {
            if (gdg.selectedTeam) {
                gdg.selectedTeam.isSelected = false;
            }
            team.isSelected = true;
            gdg.selectedTeam = team;

            if (gdg.selectedPlayer) {
                gdg.unselectPlayer(gdg.selectedPlayer);
            }
        }

        gdg.unselectTeam = function (team) {
            team.isSelected = false;
            gdg.selectedTeam = null;
        }

        gdg.recordShot = async function (points, isMiss, withFoul) {

            if ((!isMiss && !gdg.game.usesRunningClock) || withFoul) {
                gdg.timer.stop();
            }

            if (!isMiss) {
                gdg.setShotTime(gdg.game.defaultShotClockDuration * 1000, gdg.timer.isRunning());
            }

            var modalResult = await showPlayerOptionsModal({
                view: '<drbbly-recordshotmodal></drbbly-recordshotmodal>',
                model: {
                    game: gdg.game,
                    performedBy: gdg.selectedPlayer.teamMembership,
                    points: points,
                    period: gdg.game.currentPeriod,
                    clockTime: gdg.timer.remainingTime,
                    isMiss: isMiss,
                    withFoul: withFoul
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
                        gdg.game.team1.score = shotResult.team1Score;
                        gdg.game.team2Score = shotResult.team2Score;
                        gdg.game.team2.score = shotResult.team2Score;
                        if (modalResult.shot.isMiss) {
                            if (modalResult.withBlock) {
                                modalResult.block.performedByGamePlayer.blocks = shotResult.blockResult.totalBlocks;
                            }
                            if (modalResult.withRebound) {
                                modalResult.rebound.performedByGamePlayer.rebounds = shotResult.reboundResult.totalRebounds;
                            }
                        }
                        else {
                            gdg.selectedPlayer.points = shotResult.totalPoints;
                            if (modalResult.withAssist) {
                                modalResult.assist.performedByGamePlayer.assists = shotResult.assistResult.totalAssists;
                            }
                        }

                        if (modalResult.withFoul) {
                            applyFoulResult(shotResult.foulResult, modalResult.foul.performedByGamePlayer);
                        }
                        gdg.unselectPlayer(gdg.selectedPlayer);

                    }
                }
            }
        }

        function updateStatusText() {
            function setStatus(text, className) {
                gdg.statusText = { text: text, class: className };
            }

            if (gdg.game.status === gdg.gameStatusEnum.WaitingToStart) {
                setStatus('Not Started');
            }
            else if (gdg.game.status === gdg.gameStatusEnum.Finished) {
                setStatus('FINAL');
            }
            else if (gdg.timer.isRunning()) {
                setStatus('At-Play', 'text-success');
            }
            else if (gdg.timer.isOver()) {
                setStatus('End of Period');
            }
            else if (gdg.shotTimer.isOver()) {
                setStatus('Shot Clock Violation!!!', 'text-danger');
            }
            else {
                setStatus('Paused', 'text-warning');
            }
        }

        async function showPlayerOptionsModal(config) {
            config.container = $document.find('.player-options').eq(0);
            return await modalService.show(config);
        }

        gdg.jumpBall = function () {
            modalService
                .show({
                    view: '<drbbly-jumpballmodal></drbbly-jumpballmodal>',
                    model: {
                        game: gdg.game,
                        onClockStart: onJumpball
                    },
                    backdrop: 'static'
                }).catch(err => { /*modal cancelled, do nothing*/ });
        }

        function onJumpball(data) {

            var input = {
                gameId: gdg.game.id,
                startedAt: drbblyDatetimeService.getUtcNow(),
                jumpball: {
                    gameId: gdg.game.id,
                    type: constants.enums.gameEventTypeEnum.Jumpball,
                    clockTime: gdg.timer.remainingTime
                }
            };

            var startResult = drbblyGamesService.startGame(input);

            gdg.game.status = gdg.gameStatusEnum.Started;
            gdg.timer.start();
        }

        gdg.recordFoul = async function () {

            gdg.timer.stop();

            var modalResult = await showPlayerOptionsModal({
                view: '<drbbly-fouldetailsmodal></drbbly-fouldetailsmodal>',
                model: {
                    game: gdg.game,
                    performedBy: gdg.selectedPlayer,
                    period: gdg.game.currentPeriod,
                    clockTime: gdg.timer.remainingTime,
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
                    gdg.unselectPlayer(gdg.selectedPlayer);
                }
            }
        }

        gdg.timeout = async function () {
            gdg.timer.stop();
            var modalResult = await showPlayerOptionsModal({
                view: '<drbbly-timeoutdetailsmodal></drbbly-timeoutdetailsmodal>',
                model: {
                    game: gdg.game,
                    clockTime: gdg.timer.remainingTime,
                    period: gdg.game.currentPeriod
                },
                backdrop: 'static',
                size: 'sm'
            }).catch(err => { /*modal cancelled, do nothing*/ });

            if (modalResult) {
                var timeoutResult = await drbblyGamesService.recordTimeout(modalResult)
                    .catch(function (err) {
                        drbblyCommonService.handleError(err, null, 'The timeout was not recoded due to an error.');
                    });

                if (timeoutResult && !(timeoutResult.type === constants.enums.timeoutTypeEnum.Official)) {
                    var team = timeoutResult.teamId === gdg.game.team1.teamId ?
                        gdg.game.team1 : gdg.game.team2;
                    team.timeoutsLeft = timeoutResult.timeoutsLeft;
                    team.fullTimeoutsUsed = timeoutResult.fullTimeoutsUsed;
                    team.shortTimeoutsused = timeoutResult.shortTimeoutsUsed;
                }
            }
        }

        // #region Team Foul Setting
        gdg.setTeam1FoulCount = function () {
            gdg.setTeamFoulCount(gdg.game.team1);
        };

        gdg.setTeam2FoulCount = function () {
            gdg.setTeamFoulCount(gdg.game.team2);
        };

        gdg.setTeamFoulCount = async function (gameTeam) {
            var value = await modalService
                .input({
                    model: {
                        value: gameTeam.teamFoulCount,
                        prompt: 'Team Foul Count:',
                        type: 'number',
                        titleRaw: 'Set team fouls for ' + gameTeam.name
                    }
                })
                .catch(function (err) { /* input cancelled */ });

            if (value !== null && value !== undefined) {
                await drbblyGamesService.setTeamFoulCount(gameTeam.id, value)
                    .then(function () {
                        gameTeam.teamFoulCount = value;
                    })
                    .catch(function (err) {
                        drbblyCommonService.handleError(err, null, 'Failed to update team foul count due to an error.');
                    });

            }
        }
        // #endregion Team Foul Setting

        // #region TOL Setting

        gdg.setTeam1Tol = function () {
            gdg.setTol(gdg.game.team1);
        };

        gdg.setTeam2Tol = function () {
            gdg.setTol(gdg.game.team2);
        };

        gdg.setTol = async function (gameTeam) {
            var value = await modalService
                .input({
                    model: {
                        value: gameTeam.timeoutsLeft,
                        prompt: 'Timeouts Left:',
                        type: 'number',
                        min: 0,
                        max: 9,
                        titleRaw: 'Set remaining timeouts for ' + gameTeam.name
                    }
                })
                .catch(function (err) { /* input cancelled */ });

            if (value !== null && value !== undefined) {
                await drbblyGamesService.setTimeoutsLeft(gameTeam.id, value)
                    .then(function () {
                        gameTeam.timeoutsLeft = value;
                    })
                    .catch(function (err) {
                        drbblyCommonService.handleError(err, null, 'Failed to save T.O.L. due to an error.');
                    });

            }
        }

        // #endregion TOL Setting

        // #region Bonus Setting

        gdg.toggleTeam1BonusStatus = function () {
            gdg.setBonusStatus(gdg.game.team1);
        };

        gdg.toggleTeam2BonusStatus = function () {
            gdg.setBonusStatus(gdg.game.team2);
        };

        gdg.setBonusStatus = async function (gameTeam) {
            gameTeam.isInBonus = !gameTeam.isInBonus;

            drbblyGamesService.setBonusStatus(gameTeam.id, gameTeam.isInBonus)
                .catch(function (err) {
                    drbblyCommonService.handleError(err, null, 'Failed to save bonus status due to an error.');
                });
        }

        // #endregion TOL Setting

        /**
         * @param {UpsertFoulResultModel} foulResult
         * @param {GamePlayerModel} performedBy 
         * */
        function applyFoulResult(foulResult, performedBy) {
            if (foulResult) {
                performedBy.fouls = foulResult.totalPersonalFouls;
                performedBy.ejectionStatus = foulResult.ejectionStatus;
                var team = gdg.teams.drbblySingle(t => t.teamId === performedBy.teamMembership.teamId)
                team.teamFoulCount = foulResult.teamFoulCount;

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
            return gdg.selectedPlayer && !(gdg.isEjected(gdg.selectedPlayer) || gdg.selectedPlayer.hasFouledOut)
                && gdg.game.status === gdg.gameStatusEnum.Started;
        }

        gdg.canRecordFoul = function () {
            return gdg.selectedPlayer && !(gdg.isEjected(gdg.selectedPlayer) || gdg.selectedPlayer.hasFouledOut)
                && gdg.game.status === gdg.gameStatusEnum.Started;
        }

        gdg.canCallTimeout = function () {
            return gdg.game && gdg.game.status === gdg.gameStatusEnum.Started && !gdg.timer.isOver();
        };

        gdg.canChangeLineup = function () {
            return gdg.selectedTeam && gdg.game && gdg.game.status !== gdg.gameStatusEnum.Finished;
        };

        gdg.canEndGame = function () {
            return gdg.game && gdg.game.status === gdg.gameStatusEnum.Started // has started
                && gdg.timer.isOver() // time has run out
                && gdg.game.currentPeriod >= gdg.game.numberOfRegulationPeriods // last period or OT
                && gdg.game.team1.score !== gdg.game.team2.score; // scores are not tied
        }

        gdg.canGoToNextPeriod = function () {
            return gdg.game && gdg.game.status === gdg.gameStatusEnum.Started // has started
                && gdg.timer.isOver() // time has run out
                && (gdg.game.currentPeriod < gdg.game.numberOfRegulationPeriods // not the last or OT period
                    || (gdg.game.currentPeriod >= gdg.game.numberOfRegulationPeriods // last or OT period
                        && gdg.game.team1.score === gdg.game.team2.score) // but scores are not tied
                );
        }

        gdg.isEjected = function (player) {
            return player && player.ejectionStatus !== constants.enums.ejectionStatusEnum.NotEjected;
        }

        function getCurrentPeriodDuration() {
            return (gdg.game.currentPeriod > gdg.game.numberOfRegulationPeriods ?
                gdg.game.overtimePeriodDuration :
                gdg.game.regulationPeriodDuration) * 60 * 1000
        }

        function loadGame() {
            gdg.gameDetailsOverlay.setToBusy();
            drbblyGamesService.getGame(_gameId)
                .then(function (data) {
                    gdg.game = angular.copy(data);

                    if (gdg.game.isTimed) {
                        gdg.timer.init(getCurrentPeriodDuration());
                        gdg.shotTimer.init(gdg.game.defaultShotClockDuration * 1000);
                        if (gdg.game.isLive) {
                            gdg.timer.run(new Date(drbblyDatetimeService.toUtcString(gdg.game.remainingTimeUpdatedAt)), gdg.game.remainingTime);
                            gdg.shotTimer.run(new Date(drbblyDatetimeService.toUtcString(gdg.game.remainingTimeUpdatedAt)), gdg.game.remainingShotTime);
                        } else {
                            gdg.timer.setRemainingTime(gdg.game.remainingTime);
                            gdg.shotTimer.setRemainingTime(gdg.game.remainingShotTime);
                        }

                        displayPeriod(gdg.game.currentPeriod);
                    }

                    gdg.teams = [gdg.game.team1, gdg.game.team2];
                    gdg.game.start = drbblyDatetimeService.toLocalDateTime(data.start);
                    gdg.isOwned = gdg.game.addedBy.identityUserId === authService.authentication.userId;
                    setLineupsReady();
                    gdg.gameDetailsOverlay.setToReady();
                    gdg.app.mainDataLoaded();
                    updateStatusText();
                })
                .catch(gdg.gameDetailsOverlay.setToError);
        }

        gdg.showGameOptions = function () {
            modalService.showMenuModal({
                model: {
                    buttons: [
                        {
                            text: 'End Game',
                            action: gdg.endGame,
                            isHidden: () => gdg.game.status !== gdg.gameStatusEnum.Started,
                            class: 'btn-secondary'
                        },
                        {
                            text: 'Change Game Settings',
                            action: gdg.showSettings,
                            isHidden: () => gdg.game.status === gdg.gameStatusEnum.Finished,
                            class: 'btn-secondary'
                        },
                        {
                            text: 'Reset Game',
                            action: () => gdg.updateStatus(gdg.gameStatusEnum.WaitingToStart),
                            isHidden: () => gdg.game.status === gdg.gameStatusEnum.WaitingToStart,
                            class: 'btn-secondary'
                        }
                    ],
                    title: 'Game Options'
                },
                container: $document.find('.wrapper').eq(0),
                size: 'sm'
            })
        }

        gdg.showSettings = function () {
            alert('Not yet implemented');
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
            var period = gdg.game.currentPeriod++;
            var newTime = getCurrentPeriodDuration();
            gdg.isBusy = true;
            drbblyGamesService.advancePeriod(_gameId, period, newTime)
                .then(function () {
                    gdg.game.currentPeriod = period;
                    gdg.timer.init(newTime);
                    gdg.setShotTime(gdg.game.defaultShotClockDuration * 1000);
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
