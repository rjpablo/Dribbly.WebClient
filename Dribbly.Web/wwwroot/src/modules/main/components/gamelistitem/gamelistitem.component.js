(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGamelistitem', {
            bindings: {
                game: '<',
                onDeleted: '<',
                onUpdated: '<',
                canEdit: '<',
                canDelete: '<'
            },
            controllerAs: 'cli',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element', '$state', 'modalService', 'drbblyGamesService', 'constants',
        'drbblyGameshelperService', '$window'];
    function controllerFunc($element, $state, modalService, drbblyGamesService, constants,
        drbblyGameshelperService, $window) {
        var cli = this;

        cli.$onInit = function () {};

        cli.clicked = function () {
            $state.go('main.game.details', { id: cli.game.id });
        };
        cli.toggleOptions = function (event) {
            event.preventDefault();
            event.stopPropagation();
            cli.isOpen = !cli.isOpen;
        }

        cli.stopPropagation = function (event) {
            event.stopPropagation();
        };

        cli._canDelete = function () {
            return cli.game.status === constants.enums.gameStatusEnum.WaitingToStart
                && (cli.canDelete && cli.canDelete(cli.game));
        };

        cli._canEdit = function () {
            return cli.game.status === constants.enums.gameStatusEnum.WaitingToStart
                && (cli.canEdit && cli.canEdit(cli.game));
        };

        cli.remove = function (game, event) {
            event.stopPropagation();
            modalService.confirm({ msg1Key: 'app.DeleteTournamentGameComfirmationMsg', titleKey: 'app.DeleteGame' })
                .then(function (result) {
                    if (result) {
                        drbblyGamesService.updateStatus(game.id, constants.enums.gameStatusEnum.Deleted)
                            .then(function () {
                                if (cli.onDeleted) {
                                    cli.onDeleted(game);
                                }
                            })
                            .catch(function () {
                                // do nothing
                            });
                    }
                });

        };

        cli.edit = function (game, event) {
            event.stopPropagation();
            var model = {
                gameId: game.id,
                isEdit: true
            };
            drbblyGameshelperService.openAddEditGameModal(model)
                .then(function (game) {
                    if (game && cli.onUpdated) {
                        cli.onUpdated(game);
                    }
                })
                .catch(function () { /* do nothing */ });
        };

        cli._openInNewTab = function (game, event) {
            event.stopPropagation();
            var url = $state.href('main.game.details', { id: game.id });
            $window.open(url, '_blank');
        };

    }
})();
