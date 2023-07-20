(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamentlistitem', {
            bindings: {
                tournament: '<'
            },
            controllerAs: 'tli',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element'];
    function controllerFunc($element) {
        var tli = this;

        tli.$onInit = function () {
            
        };
    }
})();
