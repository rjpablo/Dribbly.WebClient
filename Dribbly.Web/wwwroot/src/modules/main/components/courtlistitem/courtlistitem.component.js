(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtlistitem', {
            bindings: {
                court: '<',
                onClick: '<?'
            },
            controllerAs: 'cli',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element'];
    function controllerFunc($element) {
        var cli = this;

        cli.$onInit = function () {
            $element.addClass('drbbly-court-list-item');
        };

        cli.clicked = function (e) {
            if (cli.onClick) {
                cli.onClick(cli.court);
                e.preventDefault();
            }
        };
    }
})();
