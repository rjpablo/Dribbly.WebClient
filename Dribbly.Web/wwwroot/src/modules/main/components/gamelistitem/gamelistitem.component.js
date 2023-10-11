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

        cli.$onInit = function () { };

        cli.clicked = function (event) {
            if (!isControl(event.target))
                $state.go('main.game.details', { id: cli.game.id });
        };

        function isControl(element) {
            var controlsContainer = $element.find('.controls')[0];
            var node = element.parentNode;
            while (node != null && node !== $element[0]) {
                if (node == controlsContainer) {
                    return true;
                }
                node = node.parentNode;
            }
        }

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

        cli.fbShare = function (event) {
            event.stopPropagation();
            var url = `https://www.facebook.com/sharer/sharer.php?s=100&p[url]=${location.host}/game/${cli.game.id}`;
            window.open(url, 'targetWindow', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=250');
            return false;
        }

    }
})();
