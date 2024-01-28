﻿(function () {
    'use strict';

    angular
        .module('appModule')
        .component('drbblyPlayerinfocard', {
            bindings: {
                player: '<',
                onClick: '<?'
            },
            controllerAs: 'pli',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element'];
    function controllerFunc($element) {
        var pli = this;

        pli.$onInit = function () {
            
        };
    }
})();
