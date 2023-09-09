(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGameshelperService', ['modalService', 'authService', '$timeout', 'settingsService',
            function (modalService, authService, $timeout, settingsService) {
                var _hubConnection;
                var _hub;
                var _trackedGames = [];

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

                    _hubConnection.reconnecting(function () {

                    });

                    _hubConnection.reconnected(function () {
                        joinGameHubs();
                    });

                    _hubConnection.disconnected(function () {
                        $timeout(function () {
                            _hubConnection.start()
                                .done(function () {
                                    joinGameHubs();
                                })
                                .fail(function (err) {

                                });
                        }, 5000); // Restart connection after 5 seconds.
                    });

                    _hubConnection.start()
                        .done(function () {
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

                function track(game) {
                    _trackedGames.push(game);
                    joinGameHub(game);
                }

                function untrack(game) {
                    _trackedGames.drbblyRemove(game);
                }

                var _service = {
                    initializeGameHub: initializeGameHub,
                    openAddEditGameModal: openAddEditGameModal,
                    track: track,
                    untrack: untrack
                };

                return _service;
            }]);

})();