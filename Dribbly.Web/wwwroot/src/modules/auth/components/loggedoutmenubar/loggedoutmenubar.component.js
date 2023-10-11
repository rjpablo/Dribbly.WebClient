(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyLoggedoutmenubar', {
            bindings: {},
            controllerAs: 'lmb',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element'];
    function controllerFunc($element) {
        var lmb = this;

        lmb.$onInit = function () {
            $element.addClass('logged-out-menu-bar');
        };
    }
})();
