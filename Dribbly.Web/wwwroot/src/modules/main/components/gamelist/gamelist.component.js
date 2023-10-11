(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGamelist', {
            bindings: {
                games: '<',
                breakpoints: '<',
                titleKey: '@',
                settings: '<',
                canDeleteItem: '<',
                canEditItem: '<',
                onGameDeleted: '<'
            },
            controllerAs: 'dgl',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element'];
    function controllerFunc($element) {
        var dgl = this;

        dgl.$onInit = function () {
            $element.addClass('py-3');
            setSettings(dgl.settings || {});
            setColumnClasses(dgl.breakpoints || {});
        };

        function setColumnClasses(breakpoints) {
            dgl.columnClasses = '';
            if (breakpoints.xs) {
                dgl.columnClasses += 'col-' + breakpoints.xs;
            }
            else {
                dgl.columnClasses += 'col-12';
            }
            if (breakpoints.sm) {
                dgl.columnClasses += ' col-sm-' + breakpoints.sm
            }
            if (breakpoints.md) {
                dgl.columnClasses += ' col-md-' + breakpoints.md
            }
            if (breakpoints.lg) {
                dgl.columnClasses += ' col-lg-' + breakpoints.lg
            }
            if (breakpoints.xl) {
                dgl.columnClasses += ' col-xl-' + breakpoints.xl
            }
        }

        dgl.onItemDeleted = function (game) {
            if (dgl.onGameDeleted) {
                dgl.onGameDeleted(game);
            }
            dgl.games.drbblyRemove(g => g.id === game.id);
        };

        dgl.canDelete = function (game) {
            return dgl.canDeleteItem && dgl.canDeleteItem(game);
        };

        dgl.canEditItem = function (game) {
            return dgl.canEditItem && dgl.canEditItem(game);
        };

        dgl.onItemUpdated = function (game) {
            var orig = dgl.games.drbblySingle(g => g.id === game.id);
            Object.assign(orig, game);

        };

        function setSettings(settings) {
            var defaultSettings = {
                wrapItems: true,
                loadSize: 6,
                initialItemCount: 6
            };

            dgl._settings = Object.assign({}, defaultSettings, settings);
        }
    }
})();
