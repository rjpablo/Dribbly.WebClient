(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyEndgamemodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'bgm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyGamesService', 'drbblyCommonService',
        'drbblyDatetimeService', 'constants', 'drbblyOverlayService', 'i18nService', '$timeout'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGamesService, drbblyCommonService,
        drbblyDatetimeService, constants, drbblyOverlayService, i18nService, $timeout) {
        var bgm = this;

        bgm.$onInit = function () {
            bgm.overlay = drbblyOverlayService.buildOverlay();
            bgm.gameStatus = constants.enums.gameStatus;
            bgm.saveModel = {};

            bgm.isBusy = true;
            bgm.overlay.setToBusy();
            drbblyGamesService.getGame(bgm.model.gameId)
                .then(function (game) {
                    bgm.overlay.setToReady();
                    bgm.isBusy = false;
                    game.start = drbblyDatetimeService.toLocalDateTime(game.start);
                    bgm.saveModel = angular.copy(game || {});
                    if (game.team1Score > game.team2Score) {
                        bgm.winningTeam = game.team1;
                    }
                    else if (game.team2Score > game.team1Score) {
                        bgm.winningTeam = game.team2;
                    }
                    else {
                        modalService.alert({ msg1Key: 'app.Error_EndGame_Tied', titleKey: 'app.EndGame' })
                            .then(function () {
                                bgm.cancel();
                            });
                    }
                })
                .catch(function (error) {
                    bgm.isBusy = false;
                    bgm.overlay.setToError();
                });

            bgm.context.setOnInterrupt(bgm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!bgm.context.okToClose) {
                    event.preventDefault();
                    bgm.onInterrupt();
                }
            }, $scope);
        };

        bgm.winnerChanged = function () {
            bgm.saveModel.winningTeamId = bgm.winningTeamId;
        };

        bgm.onInterrupt = function (reason) {
            bgm.context.okToClose = true;
            bgm.context.dismiss(reason);
        };

        bgm.handleSubmitClick = function () {
            var saveModel = angular.copy(bgm.saveModel);
            submit(saveModel);
        };

        function submit(saveModel) {
            saveModel.gameId = saveModel.id;
            bgm.isBusy = true;
            bgm.isSaving = true;
            drbblyGamesService.endGame(bgm.model.gameId, bgm.winningTeam.id)
                .then(function () {
                    bgm.isBusy = false;
                    bgm.isSaving = false;
                    close({ savedChanges: true });
                }, function (error) {
                    bgm.isBusy = false;
                    bgm.isSaving = false;
                    drbblyCommonService.handleError(error);
                });
        }

        function close(result) {
            bgm.context.okToClose = true;
            bgm.context.submit(result);
        }

        bgm.cancel = function () {
            bgm.onInterrupt('cancelled');
        };
    }
})();
