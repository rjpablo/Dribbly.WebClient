(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGameeventslist', {
            bindings: {
                game: '<',
                events: '<',
                onItemClicked: '<',
                onReady: '<',
                sideBySideThreshold: '<'
            },
            controllerAs: 'gel',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTimerhelperService', '$window', 'constants', 'settingsService', '$timeout', '$element'];
    function controllerFunc(drbblyTimerhelperService, $window, constants, settingsService, $timeout, $element) {
        var gel = this;
        var _connection, _hub;
        var _allPlayers;

        gel.$onInit = function () {
            gel.latestFirst = true;
            angular.element($window).on('resize', setOrientation);
            if (gel.onReady) {
                gel.onReady({
                    removeItem: removeItem,
                    updateItem: updateItem,
                    upsertItem: upsertItem
                });
            }
            setOrientation();
        };

        gel.$onChanges = function (changes) {
            if (changes.game && changes.game.currentValue) {
                _allPlayers = gel.game.team1.players.concat(gel.game.team2.players);
                gel.events = gel.game.gameEvents;
                gel.events.forEach(massageItem);
                gel.periods = gel.events.drbblyGroupBy('period', 'period');
                gel.periods.forEach(p => p.label = getPeriodLabel(p.period));
                initializeHub();
            }
        }

        gel.latestFirstChanged = function () {
            console.log(gel.latestFirst);
        }

        function initializeHub() {
            gel.hubInitialized = true;
            _connection = $.hubConnection();
            _hub = _connection.createHubProxy('gameHub');
            _connection.url = settingsService.serviceBase + 'signalr';

            _hub.on('upsertGameEvent', upsertItem);

            _hub.on('deleteGameEvent', removeItem);

            _connection.reconnecting(function () {
                gel.hubIsReconnecting = true;
            });

            _connection.reconnected(function () {
                gel.hubIsReconnecting = false;
                joinGameHub();
            });

            _connection.disconnected(function () {
                gel.hubIsReconnecting = true;
                $timeout(function () {
                    _connection.start()
                        .done(function () {
                            joinGameHub();
                        })
                        .fail(function (err) {
                            console.log('Could not re-establish connection!');
                        });
                }, 5000); // Restart connection after 5 seconds.
            });

            _connection.start()
                .done(function () {
                    gel.hubIsReconnecting = false;
                    joinGameHub();
                })
                .fail(function (err) {
                    broadcast('connectionFailed');
                });
        }

        function joinGameHub() {
            _hub.invoke('joinGroup', _connection.id, gel.game.id);
        }

        function getPeriodLabel(period) {
            return period > gel.game.numberOfRegulationPeriods ?
                ('OT' + (period - gel.game.numberOfRegulationPeriods)) :
                (period || 0).toOrdinal();
        }

        function setOrientation() {
            gel.isSideBySide = gel.sideBySideThreshold && window.innerWidth >= gel.sideBySideThreshold;
        }

        function removeItem(data) {
            var event = gel.events.drbblySingleOrDefault(e => e.id === data.id);
            if (event) {
                var period = gel.periods.drbblySingleOrDefault(p => p.period === event.period);
                if (period) {
                    period.items.drbblyRemove(e => e.id === event.id);
                }
                gel.events.drbblyRemove(e => e.id === event.id);
            }
        }

        function upsertItem(event) {
            if (event) {
                $timeout(function () {
                    event.performedBy = _allPlayers.drbblySingle(p => p.accountId === event.performedById).account;
                    massageItem(event);
                    var period = gel.periods.drbblySingleOrDefault(p => p.period === event.period);
                    if (period) {
                        if (period.items.drbblyAny(e => e.id === event.id)) {
                            updateItem(event);
                        }
                        else {
                            period.items.push(event);
                            gel.events.push(event);
                        }
                    }
                    else {
                        period = {
                            period: event.period,
                            label: getPeriodLabel(event.period),
                            items: [event]
                        };
                        gel.periods.push(period);
                        gel.events.push(event);
                    }
                });
            }
        }

        gel.$onDestroy = function () {
            angular.element($window).off('resize', setOrientation);
        }

        gel.getEventDescription = event => {
            return event.type === constants.enums.gameEventTypeEnum.ShotMade ? '<span class="text-white font-weight-semibold">Shot&nbsp;Made</span> (+' + event.additionalData.points + 'pts)' :
                event.type === constants.enums.gameEventTypeEnum.ShotMissed ? '<span class="text-white font-weight-semibold">MISS</span>' :
                    event.type === constants.enums.gameEventTypeEnum.FoulCommitted ? '<span class="text-white font-weight-semibold">FOUL</span> (' + event.additionalData.foulName + ')' :
                        event.type === constants.enums.gameEventTypeEnum.ShotBlock ? '<span class="text-white font-weight-semibold">BLOCK</span>' :
                            event.type === constants.enums.gameEventTypeEnum.Assist ? '<span class="text-white font-weight-semibold">ASSIST</span>' :
                                event.type === constants.enums.gameEventTypeEnum.OffensiveRebound ? '<span class="text-white font-weight-semibold">REBOUND</span> (off)' :
                                    event.type === constants.enums.gameEventTypeEnum.DefensiveRebound ? '<span class="text-white font-weight-semibold">REBOUND</span> (def)' :
                                        event.type === constants.enums.gameEventTypeEnum.Timeout ? (`<span class="text-white font-weight-semibold">${event.additionalData.isOfficial ? 'OFFICAL ' : ''}TIMEOUT</span>`) :
                                            event.type === constants.enums.gameEventTypeEnum.Steal ? '<span class="text-white font-weight-semibold">STEAL</span>' :
                                                event.type === constants.enums.gameEventTypeEnum.Turnover ? '<span class="text-white font-weight-semibold">TURNOVER</span> (' + event.additionalData.cause + ')' :
                                                    event.type === constants.enums.gameEventTypeEnum.FreeThrowMade ? '<span class="text-white font-weight-semibold">FREE THROW</span> (Made)' :
                                                        event.type === constants.enums.gameEventTypeEnum.FreeThrowMissed ? '<span class="text-white font-weight-semibold">FREE THROW</span> (Missed)' :
                                                            event.type;
        }

        function updateItem(e) {
            var orig = gel.events.drbblySingle(ev => ev.id === e.id);
            Object.assign(orig, e);
            massageItem(orig);
            orig.additionalData = typeof e.additionalData === 'string' ?
                JSON.parse(e.additionalData) :
                e.additionalData;
            orig.isTeam1 = e.teamId === gel.game.team1.teamId;
            orig.isTeam2 = e.teamId === gel.game.team2.teamId;
            orig.isBothTeams = e.teamId === null;
            orig.timeDisplay = drbblyTimerhelperService.breakupDuration(e.clockTime).formattedTime
        }

        function massageItem(e) {
            if (!e.additionalData) {
                e.additionalData = {};
            }
            else if (typeof e.additionalData === 'string') {
                e.additionalData = JSON.parse(e.additionalData);
            }
            if (e.performedById) {
                var p = _allPlayers.drbblySingleOrDefault(p => p.accountId === e.performedById);
                if (p) {
                    e.performedBy = p.account
                }
                else {
                    console.log(e);
                }
            }
            e.game = gel.game;
            e.isTeam1 = e.teamId === gel.game.team1.teamId;
            e.isTeam2 = e.teamId === gel.game.team2.teamId;
            e.isBothTeams = e.teamId === null;
            e.timeDisplay = drbblyTimerhelperService.breakupDuration(e.clockTime).formattedTime
            e.eventDescriptionTemplate = gel.getEventDescription(e);
        }

        gel._onItemClicked = function (event) {
            if (gel.onItemClicked) {
                gel.onItemClicked(event);
            }
        };
    }
})();
