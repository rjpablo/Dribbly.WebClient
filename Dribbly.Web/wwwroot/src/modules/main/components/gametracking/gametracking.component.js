(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGametracking', {
            bindings: {
                app: '<',
                game: '<',
                reloadGame: '<'
            },
            controllerAs: 'gdg',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyGamesService', 'modalService', 'constants', 'authService',
        'drbblyOverlayService', '$stateParams', '$interval', 'drbblyCommonService', '$window',
        'drbblyGameshelperService', 'drbblyDatetimeService', 'drbblyGameeventsService', '$document',
        'drbblyFormshelperService', '$timeout', '$state', 'settingsService', 'drbblyToastService'];
    function controllerFunc(drbblyGamesService, modalService, constants, authService,
        drbblyOverlayService, $stateParams, $interval, drbblyCommonService, $window,
        drbblyGameshelperService, drbblyDatetimeService, drbblyGameeventsService, $document,
        drbblyFormshelperService, $timeout, $state, settingsService, drbblyToastService) {
        var gdg = this;
        var _gameId;
        var _hubListeners = [];
        var _hasInitializedGame;

        gdg.$onInit = function () {
            gdg.app.noHeader = true;
            gdg.app.noFooter = true;
            gdg.app.hideContainerData = true;
            gdg.app.hideChat();
            _gameId = Number($stateParams.id);
            gdg.gameStatusEnum = constants.enums.gameStatus;
            gdg.gameDetailsOverlay = drbblyOverlayService.buildOverlay();
            setOrientation();
            gdg.connectionStatus = drbblyGameshelperService.hub.connectionStatus;

            angular.element($window).on('resize', setOrientation);
            $('body').addClass('game-tracking');
        };

        gdg.$onChanges = function (changes) {
            if (changes.game && changes.game.currentValue) {
                setTeamColors();
                gdg.app.updatePageDetails({
                    title: (gdg.game.title || 'Untitled Game') + ' - Tracker'
                });
                drbblyGameshelperService.track(gdg.game);
                if (!_hasInitializedGame) {
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('updateClock', handleUpdateClockEvent));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('updatePeriod', updatePeriod));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('setTol', handleSetTol));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('setBonus', handleSetBonus));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('setNextPossession', handleSetNextPossession));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('setTeamFoulCount', handleSetTeamFoulCount));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('setScores', handleSetScores));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('setTeamLineup', handleSetTeamLineup));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('soundBuzzer', soundBuzzer));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('connected', () => gdg.connectionStatus = constants.enums.hubConnectionStatusEnum.Connected));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('reconnected', () => gdg.connectionStatus = constants.enums.hubConnectionStatusEnum.Connected));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('reconnecting', () => gdg.connectionStatus = constants.enums.hubConnectionStatusEnum.Reconnecting));
                    _hubListeners.push(drbblyGameshelperService.hub
                        .on('diconnected', () => gdg.connectionStatus = constants.enums.hubConnectionStatusEnum.Reconnecting));
                }
                _hasInitializedGame = true;
            }
        }

        gdg.$onDestroy = function () {
            angular.element($window).off('resize', setOrientation);
            gdg.app.noHeader = false;
            gdg.app.noFooter = false;
            gdg.app.hideContainerData = false;
            gdg.app.showChat();
            drbblyGameshelperService.untrack(gdg.game);
            _hubListeners.forEach(listener => listener()); //unregister hub listeners
            $('body').removeClass('game-tracking');
        }

        function setTeamColors() {
            gdg.game.team1.teamColor = '#1a44d3';
            gdg.game.team1.players.forEach(p => p.teamColor = gdg.game.team1.teamColor);
            gdg.game.team2.teamColor = '#a90329';
            gdg.game.team2.players.forEach(p => p.teamColor = gdg.game.team2.teamColor);
        }

        function setOrientation() {
            var screenWidth = window.innerWidth;
            var screenHeight = window.innerHeight;
            gdg.isVertical = screenHeight > screenWidth;
        }

        gdg.gameIsFinished = function () {
            return gdg.game.status === gdg.gameStatusEnum.Finished;
        }

        gdg.onTimerReady = function (timer) {
            gdg.timer = timer;
            gdg.timer.onUpdate(displayTime);
            gdg.timer.onStop(function () {
                gdg.shotTimer.stop();
                updateTime(gdg.timer.remainingTime, gdg.shotTimer.remainingTime, false);
                broadcastUpdateClock(gdg.timer.remainingTime, gdg.shotTimer.remainingTime, false);
                updateStatusText();
            });
            gdg.timer.onStart(function () {
                if (!gdg.lineupsReady) {
                    return;
                }
                else if (gdg.game.status === gdg.gameStatusEnum.WaitingToStart) {
                    gdg.jumpBall();
                    return false;
                }

                if (gdg.shotTimer.isOver()) {
                    gdg.shotTimer.reset();
                }
                gdg.shotTimer.start();

                updateTime(gdg.timer.remainingTime, gdg.shotTimer.remainingTime, true);
                broadcastUpdateClock(gdg.timer.remainingTime, gdg.shotTimer.remainingTime, true);

                return true;
            });
            gdg.timer.onStarted(function () {
                updateStatusText();
            });
            gdg.timer.onEditted(function (time, commit) {
                updateTime(time.totalMs, gdg.shotTimer.remainingTime, false)
                    .then(commit);
                broadcastUpdateClock(time.totalMs, gdg.shotTimer.remainingTime, false)
            });

            gdg.timer.onEnd(function () {
                soundBuzzer({ gameId: _gameId, isEndOfPeriod: true });
                drbblyGameshelperService.hub.invoke('soundBuzzer', { gameId: _gameId, isEndOfPeriod: true });
                gdg.shotTimer.setRemainingTime(0);
            });

            if (gdg.shotTimer) {
                processGame();
            }
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
                broadcastUpdateClock(gdg.timer.remainingTime, time.totalMs, false)
            });
            gdg.shotTimer.onEnd(function () {
                soundBuzzer({ gameId: _gameId, isShotClockViolation: true });
                drbblyGameshelperService.hub.invoke('soundBuzzer', { gameId: _gameId, isShotClockViolation: true });
                gdg.timer.stop();
            });

            if (gdg.timer) {
                processGame();
            }
        }

        function soundBuzzer(data) {
            if (data.gameId === _gameId) {
                var audio = new Audio(data.isEndOfPeriod ? 'sounds/end-of-period.mp3' : 'sounds/shot-clock-violation.mp3');
                audio.play();
            }
        }

        gdg.setShotTime = function (time, start) {
            time = time < gdg.timer.remainingTime ? time : gdg.timer.remainingTime;
            gdg.shotTimer.setRemainingTime(time, start);
            updateTime(gdg.timer.remainingTime, time, start);
            broadcastUpdateClock(gdg.timer.remainingTime, time, start, gdg.shotTimer.startedAt);
        };

        gdg.setNextPossession = function (nextPossession) {
            var currentValue = gdg.game.nextPossession;
            gdg.game.nextPossession = nextPossession;
            drbblyGamesService.setNextPossession(_gameId, nextPossession)
                .then(function () {
                    drbblyGameshelperService.hub.invoke('setNextPossession',
                        {
                            gameId: _gameId,
                            nextPossession: nextPossession
                        });
                })
                .catch(function (err) {
                    gdg.game.nextPossession = currentValue;
                    drbblyCommonService.handleError(err, null, 'The foul was not recoded due to an error.');
                });
        }

        function handleSetNextPossession(data) {
            if (_gameId === data.gameId) {
                gdg.game.nextPossession = data.nextPossession;
            }
        }

        gdg.setLineup = async function (team) {
            var teams = await modalService
                .show({
                    view: '<drbbly-setlineupmodal></drbbly-setlineupmodal>',
                    model: {
                        teams: gdg.teams,
                        selectedTeam: team
                    }
                }).catch(err => { /*modal cancelled, do nothing*/ });

            if (teams) {
                teams.forEach(t => {
                    drbblyGamesService.updateLineup({
                        gameId: _gameId,
                        teamId: t.teamId,
                        period: gdg.game.currentPeriod,
                        clockTime: gdg.timer.remainingTime,
                        gamePlayerIds: t.selectedPlayers.map(p => p.id)
                    })
                        .then(() => {
                            var data = {
                                gameId: _gameId,
                                team: {
                                    teamId: t.teamId,
                                    selectedPlayerIds: t.selectedPlayers.map(p => p.id)
                                }
                            };
                            drbblyGameshelperService.hub.invoke('setTeamLineup', data);
                            handleSetTeamLineup(data);
                        })
                        .catch(function (err) {
                            drbblyCommonService.handleError(err);
                        });
                })
            }
        }

        function setLineupsReady() {
            gdg.lineupsReady = gdg.game.team1.players.drbblyAny(p => p.isInGame)
                && gdg.game.team2.players.drbblyAny(p => p.isInGame);
        }

        function handleSetTeamLineup(data) {
            if (_gameId === data.gameId) {
                var team = gdg.teams.drbblySingle(tm => tm.teamId === data.team.teamId);
                team.players.forEach(p => {
                    p.isInGame = data.team.selectedPlayerIds.drbblyAny(id => id === p.id);
                });
                team.players.sort((a, b) => {
                    return a.isInGame && !b.isInGame ? -1 :
                        !a.isInGame && b.isInGame ? 1 :
                            0;
                });

                setLineupsReady();
            }
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

            if (gdg.isTimekeeper) {
                if ((!isMiss && !gdg.game.usesRunningClock) || withFoul) {
                    gdg.timer.stop();
                }

                if (!isMiss) {
                    gdg.resetShotClockFull();
                }
            }

            showShotDetails({
                game: gdg.game,
                performedBy: gdg.selectedPlayer,
                shot: {
                    game: gdg.game,
                    points: points,
                    period: gdg.game.currentPeriod,
                    performedBy: gdg.selectedPlayer.teamMembership.account,
                    performedById: gdg.selectedPlayer.teamMembership.memberAccountId,
                    clockTime: gdg.timer.remainingTime,
                    isMiss: isMiss
                },
                withFoul: withFoul
            });
        }

        async function showShotDetails(data) {
            var modalResult = await showPlayerOptionsModal({
                view: '<drbbly-recordshotmodal></drbbly-recordshotmodal>',
                model: data
            }).catch(err => { /*modal cancelled, do nothing*/ });

            if (modalResult) {
                if (modalResult.shotIsDeleted) {
                    return modalResult;
                }
                else if (data.isEdit) {
                    return await drbblyGameeventsService.updateShot(modalResult)
                        .then(data => {
                            return data;
                        })
                        .catch(function (err) {
                            drbblyCommonService.handleError(err, null, 'The shot was not recoded due to an error.')
                        });
                }
                else {
                    if (modalResult.shot) {
                        var shotResult = await drbblyGameeventsService.recordShot(modalResult)
                            .then(data => data)
                            .catch(function (err) {
                                drbblyCommonService.handleError(err, null, 'The shot was not recoded due to an error.')
                            });
                        if (shotResult) {
                            invokeSetScores(shotResult.team1Score, shotResult.team2Score)
                            gdg.game.team1Score = shotResult.team1Score;
                            gdg.game.team1.points = shotResult.team1Score;
                            gdg.game.team1.fga = shotResult.team1.fga;
                            gdg.game.team1.fgm = shotResult.team1.fgm;
                            gdg.game.team1.threePA = shotResult.team1.threePA;
                            gdg.game.team1.threePM = shotResult.team1.threePM;
                            gdg.game.team1.blocks = shotResult.team1.blocks;
                            gdg.game.team1.assists = shotResult.team1.assists;
                            gdg.game.team1.rebounds = shotResult.team1.rebounds;

                            gdg.game.team2Score = shotResult.team2Score;
                            gdg.game.team2.points = shotResult.team2Score;
                            gdg.game.team2.fga = shotResult.team2.fga;
                            gdg.game.team2.fgm = shotResult.team2.fgm;
                            gdg.game.team2.threePA = shotResult.team2.threePA;
                            gdg.game.team2.threePM = shotResult.team2.threePM;
                            gdg.game.team2.blocks = shotResult.team2.blocks;
                            gdg.game.team2.assists = shotResult.team2.assists;
                            gdg.game.team2.rebounds = shotResult.team2.rebounds;

                            gdg.selectedPlayer.points = shotResult.takenBy.points;
                            gdg.selectedPlayer.fga = shotResult.takenBy.fga;
                            gdg.selectedPlayer.fgm = shotResult.takenBy.fgm;
                            gdg.selectedPlayer.threePA = shotResult.takenBy.threePA;
                            gdg.selectedPlayer.threePM = shotResult.takenBy.threePM;

                            if (modalResult.shot.isMiss) {
                                if (modalResult.withBlock) {
                                    modalResult.block.performedByGamePlayer.blocks = shotResult.blockResult.totalBlocks;
                                }
                                if (modalResult.withRebound) {
                                    modalResult.rebound.performedByGamePlayer.rebounds = shotResult.reboundResult.totalRebounds;
                                }
                            }
                            else if (modalResult.withAssist) {
                                modalResult.assist.performedByGamePlayer.assists = shotResult.assistResult.totalAssists;
                            }

                            if (modalResult.withFoul) {
                                applyFoulResult(shotResult.foulResult, modalResult.foul.performedByGamePlayer);
                                gdg.recordFreeThrow(gdg.selectedPlayer);
                            }
                        }
                    }
                }
            }
        }

        function handleSetScores(data) {
            if (_gameId === data.gameId) {
                gdg.game.team1Score = data.team1Score;
                gdg.game.team1.points = data.team1Score;
                gdg.game.team2Score = data.team2Score;
                gdg.game.team2.points = data.team2Score;
            }
        }

        function invokeSetScores(team1Score, team2Score) {
            var data = {
                gameId: _gameId,
                team1Score,
                team2Score
            };
            drbblyGameshelperService.hub.invoke('setScores', data);
        }

        gdg.resetShotClockFull = function () {
            gdg.setShotTime(gdg.game.defaultShotClockDuration * 1000, gdg.timer.isRunning());
        }

        gdg.recordTurnOver = function () {
            var typeChoices = drbblyFormshelperService.getDropDownListChoices({
                enumKey: 'app.TurnoverCauseEnum',
                addDefaultChoice: false
            });
            var buttons = [];
            typeChoices.forEach(choice => {
                buttons.push({
                    text: choice.text,
                    action: turnoverTypeSelected,
                    data: { choice: choice, period: gdg.game.currentPeriod, clockTime: gdg.timer.remainingTime },
                    isHidden: () => choice.value === constants.enums.turnoverCauseEnum.OffensiveFoul,
                    class: 'btn-secondary turnover-cause-choice'
                })
            });

            modalService.showMenuModal({
                model: {
                    buttons: buttons
                },
                container: $document.find('.tabbed-content').eq(0),
                windowClass: 'turnover-cause-choices'
            }).catch(err => { /*modal cancelled, do nothing*/ });
            gdg.resetShotClockFull();
        }

        async function turnoverTypeSelected(data) {
            function updateStat() {
                gdg.selectedPlayer.turnovers++;
                var team = gdg.teams.drbblySingle(t => t.teamId === gdg.selectedPlayer.teamMembership.teamId);
                team.turnovers++;
            }

            var turnover = {
                gameId: gdg.game.id,
                teamId: gdg.selectedPlayer.teamMembership.teamId,
                period: data.period,
                clockTime: data.clockTime,
                type: constants.enums.gameEventTypeEnum.Turnover,
                performedById: gdg.selectedPlayer.teamMembership.memberAccountId,
                additionalData: JSON.stringify({ cause: data.choice.text, causeId: data.choice.value })
            };

            drbblyGameeventsService.recordTurnover(turnover)
                .then(updateStat)
                .catch(function (err) {
                    drbblyCommonService.handleError(err, null, 'The turnover was not recorded due to an error.');
                });

            if (data.choice.value === constants.enums.turnoverCauseEnum.Stolen) {
                var opponentTeam = gdg.teams.drbblySingle(t => t.teamId != gdg.selectedPlayer.teamMembership.teamId);
                var stolenBy = await showPlayerOptionsModal({
                    view: '<drbbly-playerselectormodal></drbbly-playerselectormodal>',
                    model: {
                        players: opponentTeam.players.drbblyWhere(p => p.isInGame),
                        title: 'Stolen by:'
                    },
                    container: $document.find('.tabbed-content').eq(0),
                    backdrop: 'static',
                    windowClass: 'player-selector-modal',
                    noBorder: true,
                    noBackground: true
                }).catch(err => { /*modal cancelled, do nothing*/ });

                if (stolenBy) {
                    var steal = {
                        gameId: gdg.game.id,
                        teamId: stolenBy.teamMembership.teamId,
                        period: data.period,
                        clockTime: data.clockTime,
                        type: constants.enums.gameEventTypeEnum.Steal,
                        performedById: stolenBy.teamMembership.memberAccountId
                    }

                    var stealResult = await drbblyGameeventsService.upsert(steal)
                        .then(data => data)
                        .catch(function (err) {
                            drbblyCommonService.handleError(err, null, 'The steal was not recorded due to an error.');
                        });
                    if (stealResult) {
                        stolenBy.steals++;
                        var team = gdg.teams.drbblySingle(t => t.teamId === stolenBy.teamMembership.teamId);
                        team.steals++;
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
                setStatus('FINAL', 'my-3');
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

        gdg.openColorSelector = function (team) {
            showPlayerOptionsModal({
                view: '<drbbly-teamcolorselectormodal></drbbly-teamcolorselectormodal>',
                model: {
                    title: 'Select Color'
                }
            })
                .then(color => {
                    team.teamColor = color;
                    team.players.forEach(p => p.teamColor = color);
                })
                .catch(err => { /*modal cancelled, do nothing*/ });
        }

        async function showPlayerOptionsModal(config) {
            config.container = $document.find('.tabbed-content').eq(0);
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

        function onJumpball() {
            var input = {
                gameId: gdg.game.id,
                startedAt: new Date(new Date().toUTCString()),
                jumpball: {
                    gameId: gdg.game.id,
                    type: constants.enums.gameEventTypeEnum.Jumpball,
                    clockTime: gdg.timer.remainingTime,
                    period: gdg.game.currentPeriod
                }
            };

            var time = gdg.timer.remainingTime;
            var shotTime = gdg.shotTimer.remainingTime;
            drbblyGamesService.startGame(input)
                .catch(() => {
                    updateTime(time, shotTime, false)
                    broadcastUpdateClock(time, shotTime, false, new Date());
                    gdg.updateStatus(gdg.gameStatusEnum.WaitingToStart);
                    gdg.timer.setRemainingTime(time, false, true);
                    gdg.shotTimer.setRemainingTime(shotTime, false, true);
                });
            drbblyToastService.info('The game has started.');
            gdg.game.status = gdg.gameStatusEnum.Started;
            gdg.timer.start();
        }

        gdg.recordFoul = async function () {

            if (gdg.isTimekeeper) {
                gdg.timer.stop();
            }

            var modalResult = await showPlayerOptionsModal({
                view: '<drbbly-fouldetailsmodal></drbbly-fouldetailsmodal>',
                model: {
                    game: gdg.game,
                    performedBy: gdg.selectedPlayer,
                    period: gdg.game.currentPeriod,
                    clockTime: gdg.timer.remainingTime
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

        gdg.recordFreeThrow = function (player) {
            var event = {
                gameId: gdg.game.id,
                clockTime: gdg.timer.remainingTime,
                period: gdg.game.currentPeriod,
                performedById: player.teamMembership.account.id,
                type: constants.enums.gameEventTypeEnum.FreeThrowMade, //this is temporary
                isNew: true
            }

            gdg.showGameEventDetails(event);
        }

        gdg.timeout = async function () {
            if (gdg.isTimekeeper) {
                gdg.timer.stop();
            }
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

        // #region Play-by-Play

        gdg.onPlayByPlayReady = function (widget) {
            gdg.playByPlayWidget = widget;
        };

        gdg.showGameEventDetails = async function (event) {
            var result;
            if (gdg.scoreKeeper && !gdg.gameIsFinished()) {
                var eventIsShot = event.type === constants.enums.gameEventTypeEnum.ShotMade
                    || event.type === constants.enums.gameEventTypeEnum.ShotMissed;
                var eventIsRebound = event.type === constants.enums.gameEventTypeEnum.DefensiveRebound
                    || event.type === constants.enums.gameEventTypeEnum.OffensiveRebound;
                var eventIsAssist = event.type === constants.enums.gameEventTypeEnum.Assist;
                var eventIsShotBlock = event.type === constants.enums.gameEventTypeEnum.ShotBlock;
                var eventIsTurnover = event.type === constants.enums.gameEventTypeEnum.Turnover;
                var eventIsFreeThrow = event.type === constants.enums.gameEventTypeEnum.FreeThrowMade
                    || event.type === constants.enums.gameEventTypeEnum.FreeThrowMissed;

                var associatedPlays = gdg.game.gameEvents
                    .drbblyWhere(e => (event.shotId !== null && (e.id === event.shotId || e.shotId === event.shotId)) ||
                        (e.shotId === event.id));

                if (eventIsRebound || eventIsAssist || eventIsShotBlock || eventIsTurnover
                    || event.type === constants.enums.gameEventTypeEnum.FoulCommitted
                    || event.type === constants.enums.gameEventTypeEnum.Steal
                    || eventIsFreeThrow) {
                    var input = {
                        game: gdg.game,
                        event: event,
                        associatedPlays: associatedPlays
                    };

                    result = await showPlayerOptionsModal({
                        view: '<drbbly-gameeventdetailsmodal></drbbly-gameeventdetailsmodal>',
                        model: input
                    }).catch(err => { /*modal cancelled, do nothing*/ });
                }
                else if (eventIsShot) {
                    var input = {
                        game: gdg.game,
                        shot: event,
                        associatedPlays: associatedPlays,
                        isEdit: true,
                        performedBy: gdg.players.drbblySingle(p => p.teamMembership.memberAccountId === event.performedById)
                    };

                    associatedPlays.forEach(e => {
                        if (e.type === constants.enums.gameEventTypeEnum.DefensiveRebound
                            || e.type === constants.enums.gameEventTypeEnum.OffensiveRebound) {
                            input.withRebound = true;
                            input.rebound = e;
                        }
                        else if (e.type === constants.enums.gameEventTypeEnum.Assist) {
                            input.withAssist = true;
                            input.assist = e;
                        }
                        else if (e.type === constants.enums.gameEventTypeEnum.ShotBlock) {
                            input.withBlock = true;
                            input.block = e;
                        }
                        else if (e.type === constants.enums.gameEventTypeEnum.FoulCommitted) {
                            input.withFoul = true;
                            input.foul = e;
                        }
                    });

                    result = await showShotDetails(input);
                }

                if (result) {
                    invokeSetScores(result.game.team1Score, result.game.team2Score)
                    gdg.game.team1Score = result.game.team1Score;
                    gdg.game.team2Score = result.game.team2Score;
                    result.teams.forEach(t => {
                        var team = gdg.teams.drbblySingle(tm => tm.teamId === t.teamId);
                        team.points = t.points;
                        team.teamFoulCount = t.teamFoulCount;
                        team.fta = t.fta;
                        team.ftm = t.ftm;
                    });
                    result.players.forEach(p => {
                        var player = gdg.players.drbblySingle(pl => pl.id === p.id);
                        player.points = p.points;
                        player.fouls = p.fouls;
                        player.rebounds = p.rebounds;
                        player.assists = p.assists;
                        player.blocks = p.blocks;
                        player.fga = p.fga;
                        player.fgm = p.fgm;
                        player.threePA = p.threePA;
                        player.threePM = p.threePM;
                        player.fta = p.fta;
                        player.ftm = p.ftm;
                    });

                    if (!event.isNew) {
                        result.events.forEach(e => {
                            if (e.isDeleted) {
                                gdg.playByPlayWidget.removeItem(e);
                            }
                            else {
                                gdg.playByPlayWidget.upsertItem(e);
                            }
                        });
                    }
                }
            }
        }
        // #endregion Play-by-Play

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
                        drbblyGameshelperService.hub.invoke('setTeamFoulCount',
                            {
                                gameId: _gameId,
                                teamId: gameTeam.teamId,
                                foulCount: value
                            });
                    })
                    .catch(function (err) {
                        drbblyCommonService.handleError(err, null, 'Failed to update team foul count due to an error.');
                    });

            }
        }

        function handleSetTeamFoulCount(data) {
            if (_gameId === data.gameId) {
                var gameTeam = gdg.teams.drbblySingleOrDefault(t => t.teamId === data.teamId);
                if (gameTeam) {
                    gameTeam.teamFoulCount = data.foulCount;
                }
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
                        drbblyGameshelperService.hub.invoke('setTol',
                            {
                                gameId: _gameId,
                                teamId: gameTeam.teamId,
                                timeoutsLeft: value
                            });
                    })
                    .catch(function (err) {
                        drbblyCommonService.handleError(err, null, 'Failed to save T.O.L. due to an error.');
                    });

            }
        }

        function handleSetTol(data) {
            if (_gameId === data.gameId) {
                var gameTeam = gdg.teams.drbblySingleOrDefault(t => t.teamId === data.teamId);
                if (gameTeam) {
                    gameTeam.timeoutsLeft = data.timeoutsLeft;
                }
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
                .then(function () {
                    drbblyGameshelperService.hub.invoke('setBonus',
                        {
                            gameId: _gameId,
                            teamId: gameTeam.teamId,
                            isInBonus: gameTeam.isInBonus
                        });
                })
                .catch(function (err) {
                    drbblyCommonService.handleError(err, null, 'Failed to save bonus status due to an error.');
                });
        }

        function handleSetBonus(data) {
            if (_gameId === data.gameId) {
                var gameTeam = gdg.teams.drbblySingleOrDefault(t => t.teamId === data.teamId);
                if (gameTeam) {
                    gameTeam.isInBonus = data.isInBonus;
                }
            }
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
                        gdg.reloadGame()
                            .then(() => {
                                $timeout(processGame);
                            });
                    }
                })
                .catch(function () {
                    // do nothing
                });
        }

        async function exitGame() {
            var proceed = true;
            if (gdg.game.status === gdg.gameStatusEnum.Started) {
                proceed = await modalService.confirm({ msg1Raw: 'The game is on-going. Do you really wish to exit?', titleRaw: 'Exit Game' })
                    .catch(function () {
                        proceed = false;
                    });
            }
            if (proceed) {
                $state.go('main.game.details', { id: _gameId });
            }
        }

        gdg.canRecordShot = function () {
            return gdg.selectedPlayer && !(gdg.isEjected(gdg.selectedPlayer) || gdg.selectedPlayer.hasFouledOut)
                && gdg.game.status === gdg.gameStatusEnum.Started;
        }

        gdg.canRecordFoul = function () {
            return gdg.selectedPlayer && !(gdg.isEjected(gdg.selectedPlayer) || gdg.selectedPlayer.hasFouledOut)
                && gdg.game.status === gdg.gameStatusEnum.Started;
        }

        gdg.canRecordFreeThrow = function () {
            return gdg.selectedPlayer && !(gdg.isEjected(gdg.selectedPlayer) || gdg.selectedPlayer.hasFouledOut)
                && gdg.game.status === gdg.gameStatusEnum.Started;
        }

        gdg.canRecordTurnOver = function () {
            return gdg.selectedPlayer && !(gdg.isEjected(gdg.selectedPlayer) || gdg.selectedPlayer.hasFouledOut)
                && gdg.game.status === gdg.gameStatusEnum.Started;
        }

        gdg.canCallTimeout = function () {
            return gdg.game && gdg.game.status === gdg.gameStatusEnum.Started && (gdg.timer && !gdg.timer.isOver());
        };

        gdg.canChangeLineup = function () {
            return gdg.game && gdg.game.status !== gdg.gameStatusEnum.Finished;
        };

        gdg.canEndGame = function () {
            return gdg.game && gdg.game.status === gdg.gameStatusEnum.Started // has started
                && (gdg.timer && gdg.timer.isOver()) // time has run out
                && gdg.game.currentPeriod >= gdg.game.numberOfRegulationPeriods // last period or OT
                && gdg.game.team1.points !== gdg.game.team2.points // scores are not tied
                && gdg.isTimekeeper;
        }

        gdg.canGoToNextPeriod = function () {
            return gdg.game && gdg.game.status === gdg.gameStatusEnum.Started // has started
                && (gdg.timer && gdg.timer.isOver()) // time has run out
                && (gdg.game.currentPeriod < gdg.game.numberOfRegulationPeriods // not the last or OT period
                    || (gdg.game.currentPeriod >= gdg.game.numberOfRegulationPeriods // last or OT period
                        && gdg.game.team1.points === gdg.game.team2.points) // but scores are not tied
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

        function processGame() {
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
            gdg.players = [...gdg.game.team1.players, ...gdg.game.team2.players];
            gdg.game.start = drbblyDatetimeService.toLocalDateTime(gdg.game.start);
            gdg.isOwned = gdg.game.addedBy.identityUserId === authService.authentication.userId;
            gdg.isTimekeeper = !gdg.game.timekeeperId
                || authService.authentication.accountId === gdg.game.timekeeperId;
            gdg.scoreKeeper = gdg.isOwned;
            setLineupsReady();
            setTeamColors();
            gdg.gameDetailsOverlay.setToReady();
            gdg.app.mainDataLoaded();
            updateStatusText();
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
                        // Hide this for now
                        //{
                        //    text: 'Change Game Settings',
                        //    action: gdg.showSettings,
                        //    isHidden: () => gdg.game.status === gdg.gameStatusEnum.Finished || !gdg.scoreKeeper,
                        //    class: 'btn-secondary'
                        //},
                        {
                            text: 'Set Timekeeper',
                            action: gdg.setTimekeeper,
                            isHidden: () => gdg.game.status === gdg.gameStatusEnum.Finished || !gdg.scoreKeeper,
                            class: 'btn-secondary'
                        },
                        {
                            text: 'Reset Game',
                            action: () => gdg.updateStatus(gdg.gameStatusEnum.WaitingToStart),
                            isHidden: () => !settingsService.allowGameReset || gdg.game.status === gdg.gameStatusEnum.WaitingToStart || !gdg.scoreKeeper,
                            class: 'btn-secondary'
                        },
                        {
                            text: 'Exit Game',
                            action: exitGame,
                            class: 'btn-secondary'
                        }
                    ],
                    title: 'Game Options'
                },
                container: $document.find('.wrapper').eq(0),
                size: 'sm'
            })
        }

        gdg.setTimekeeper = function () {
            var selectedItems = [];
            if (gdg.game.timekeeper) {
                selectedItems.push({
                    text: gdg.game.timekeeper.name,
                    iconUrl: gdg.game.timekeeper.iconUrl,
                    value: gdg.game.timekeeperId
                })
            }
            modalService
                .input({
                    model: {
                        type: 'typeahead',
                        prompt: 'Assign Timekeeper',
                        value: gdg.game.timekeeperId,
                        typeAheadConfig: {
                            entityTypes: [constants.enums.entityType.Account],
                            excludeValues: gdg.game.timekeeperId ? [gdg.game.timekeeperId] : null,
                            selectedItems: selectedItems
                        }
                    }
                })
                .then(value => {
                    drbblyGamesService.setTimekeeper(gdg.game.id, value)
                        .then(function (result) {
                            gdg.game.timekeeper = result;
                            gdg.game.timekeeperId = value;
                            gdg.isTimekeeper = !gdg.game.timekeeperId
                                || authService.authentication.accountId === gdg.game.timekeeperId;
                        })
                        .catch(function (err) {
                            drbblyCommonService.handleError(err, null, 'Failed to set timekeeper due to an unexpected error.');
                        });
                })
                .catch(function (err) { /* input cancelled */ });
        }

        gdg.showSettings = function () {
            alert('Not yet implemented');
        }

        gdg.onGameUpdate = function () {
            gdg.reloadGame()
                .then(processGame);
        };

        gdg.setResult = function () {
            modalService.show({
                view: '<drbbly-gameresultmodal></drbbly-gameresultmodal>',
                model: { gameId: _gameId }
            })
                .then(function (result) {
                    if (result && result.savedChanges) {
                        gdg.reloadGame()
                            .then(processGame);
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
                        gdg.reloadGame()
                            .then(processGame);
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

        function broadcastUpdateClock(gameTimeRemaining, shotTimeRemaining, isLive, startedAt) {
            var input = {
                gameId: _gameId,
                timeRemaining: gameTimeRemaining,
                updatedAt: isLive ? (startedAt || gdg.timer.startedAt).toUTCString() : null,
                isLive: isLive,
                shotTimeRemaining: shotTimeRemaining
            };
            drbblyGameshelperService.hub.updateClock(input);
        }

        function handleUpdateClockEvent(data) {
            if (data.gameId === _gameId) {
                var suppressEvents = true;
                if (data.isLive) {
                    gdg.timer.run(new Date(drbblyDatetimeService.toUtcString(data.updatedAt)), data.timeRemaining, suppressEvents);
                    gdg.shotTimer.run(new Date(drbblyDatetimeService.toUtcString(data.updatedAt)), data.shotTimeRemaining, suppressEvents);
                }
                else {
                    gdg.shotTimer.setRemainingTime(data.shotTimeRemaining, data.isLive, suppressEvents);
                    gdg.timer.setRemainingTime(data.timeRemaining, data.isLive, suppressEvents);
                }
            }
            updateStatusText();
        }

        function updatePeriod(data) {
            if (data.gameId === _gameId) {
                gdg.game.currentPeriod = data.period;
                gdg.timer.init(data.duration);
                gdg.setShotTime(gdg.game.defaultShotClockDuration * 1000);
                displayPeriod(gdg.game.currentPeriod);
                displayTime(gdg.timer.remainingTime);
                updateStatusText();
            }
        }

        gdg.goToNextPeriod = function () {
            var period = gdg.game.currentPeriod + 1;
            var duration = getCurrentPeriodDuration();
            gdg.isBusy = true;
            drbblyGamesService.advancePeriod(_gameId, period, duration)
                .then(function () {
                    var data = {
                        gameId: _gameId,
                        period: period,
                        duration: duration
                    };
                    updatePeriod(data);
                    drbblyGameshelperService.hub.updatePeriod(data);
                })
                .catch(drbblyCommonService.handleError)
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
                        gdg.reloadGame()
                            .then(processGame);
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
                        gdg.reloadGame()
                            .then(processGame);
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
                                gdg.reloadGame()
                                    .then(processGame);
                            })
                            .catch(function () {
                                // do nothing
                            });
                    }
                });
        };
    }

})();
