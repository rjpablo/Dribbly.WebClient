(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeamlistitem', {
            bindings: {
                team: '<',
                onClick: '<?'
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
