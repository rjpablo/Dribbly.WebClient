(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGamelistitem', {
            bindings: {
                game: '<'
            },
            controllerAs: 'cli',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element', '$state'];
    function controllerFunc($element, $state) {
        var cli = this;

        cli.$onInit = function () {
            $element.addClass('bg-white p-1');
        };

        cli.clicked = function () {
            $state.go('main.game.details', { id: cli.game.id });
        };
    }
})();
