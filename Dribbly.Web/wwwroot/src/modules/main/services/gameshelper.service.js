﻿(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGameshelperService', ['modalService', 'authService', '$timeout', 'settingsService',
            'constants',
            function (modalService, authService, $timeout, settingsService, constants) {
                var _hubConnection;
                var _hub;
                var _trackedGames = [];
                var _listeners = [];
                var _hub;
                var _connectionStatus = constants.enums.hubConnectionStatusEnum.Disconnected;
                var events = ['updateClock', 'setTol', 'setBonus', 'updatePeriod', 'setNextPossession',
                    'setTeamFoulCount', 'setScores', 'setTeamLineup'];

                function openAddEditGameModal(model) {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-gamedetailsmodal></drbbly-gamedetailsmodal>',
                            model: model
                        });
                    });
                }

                function initializeGameHub() {
                    _hubConnection = $.hubConnection();
                    _hub = _hubConnection.createHubProxy('gameHub');
                    _hubConnection.url = settingsService.serviceBase + 'signalr';

                    _hub.on('updateScores', data => {
                        if (data) {
                            $timeout(function () {
                                _trackedGames.drbblyWhere(g => g.id === data.id).forEach(game => {
                                    game.team1Score = data.team1Score;
                                    game.team2Score = data.team2Score;
                                })
                            });
                        }
                    });

                    _hub.on('updateGameStatus', data => {
                        if (data) {
                            $timeout(function () {
                                _trackedGames.drbblyWhere(g => g.id === data.id).forEach(game => {
                                    game.status = data.status;
                                })
                            });
                        }
                    });

                    events.forEach(event => {
                        _hub.on(event, data => {
                            if (data) {
                                $timeout(function () {
                                    broadcast(event, data);
                                });
                            }
                        });
                    });

                    _hubConnection.reconnecting(function () {
                        _connectionStatus = constants.enums.hubConnectionStatusEnum.Reconnecting;
                        broadcast('reconnecting');
                    });

                    _hubConnection.reconnected(function () {
                        _connectionStatus = constants.enums.hubConnectionStatusEnum.Connected;
                        broadcast('reconnected');
                        joinGameHubs();
                    });

                    _hubConnection.disconnected(function () {
                        _connectionStatus = constants.enums.hubConnectionStatusEnum.Disconnected;
                        broadcast('disconnected');
                        $timeout(function () {
                            _hubConnection.start()
                                .done(function () {
                                    _connectionStatus = constants.enums.hubConnectionStatusEnum.Connected;
                                    broadcast('connected');
                                    joinGameHubs();
                                })
                                .fail(function (err) {

                                });
                        }, 5000); // Restart connection after 5 seconds.
                    });

                    _hubConnection.start()
                        .done(function () {
                            _connectionStatus = constants.enums.hubConnectionStatusEnum.Connected;
                            broadcast('connected');
                            joinGameHubs();
                        })
                        .fail(function (err) {

                        });
                }

                function joinGameHubs() {
                    _trackedGames.forEach(game => {
                        joinGameHub(game)
                    });
                }

                function joinGameHub(game) {
                    _hub.invoke('joinGroup', _hubConnection.id, game.id);
                }

                function updateClock(input) {
                    _hub.invoke('updateClock', input);
                }

                function updatePeriod(data) {
                    _hub.invoke('updatePeriod', data);
                }

                function invoke(eventName, data) {
                    _hub.invoke(eventName, data);
                }

                function track(game) {
                    _trackedGames.push(game);
                    joinGameHub(game);
                }

                function untrack(game) {
                    _trackedGames.drbblyRemove(game);
                }

                function on(eventName, callback) {
                    if (!_listeners[eventName]) {
                        _listeners[eventName] = [];
                    }
                    var group = _listeners[eventName];
                    group.push(callback);
                    return function () {
                        group.drbblyRemove(callback);
                    }
                }

                function broadcast(eventName, data) {
                    var group = _listeners[eventName];
                    if (group) {
                        angular.forEach(group, listener => listener(data));
                    }
                }

                _hub = {
                    on: on,
                    invoke: invoke,
                    updateClock: updateClock,
                    updatePeriod: updatePeriod,
                    get connectionStatus() {
                        return _connectionStatus;
                    }
                };

                var _service = {
                    hub: _hub,
                    initializeGameHub: initializeGameHub,
                    openAddEditGameModal: openAddEditGameModal,
                    track: track,
                    untrack: untrack
                };

                return _service;
            }]);

})();