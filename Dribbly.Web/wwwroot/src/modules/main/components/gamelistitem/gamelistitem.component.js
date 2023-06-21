(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGamelistitem', {
            bindings: {
                game: '<',
                onDeleted: '<',
                canDelete:'<'
            },
            controllerAs: 'cli',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element', '$state', 'modalService', 'drbblyGamesService', 'constants'];
    function controllerFunc($element, $state, modalService, drbblyGamesService, constants) {
        var cli = this;

        cli.$onInit = function () {
            $element.addClass('bg-white p-1');
        };

        cli.clicked = function () {
            $state.go('main.game.details', { id: cli.game.id });
        };
        cli.toggleOptions = function (event) {
            event.preventDefault();
            event.stopPropagation();
            cli.isOpen = !cli.isOpen;
        }

        cli._canDelete = function () {
            return cli.game.status === constants.enums.gameStatusEnum.WaitingToStart
                && (cli.canDelete && cli.canDelete(cli.game));
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

        }

    }
})();
