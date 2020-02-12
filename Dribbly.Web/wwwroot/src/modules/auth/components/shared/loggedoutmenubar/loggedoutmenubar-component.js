(function () {
    'use strict';

    angular
        .module('authModule')
        .component('drbblyLoggedoutmenubar', {
            bindings: {},
            controllerAs: 'lmb',
            templateUrl: '/modules/auth/components/shared/loggedoutmenubar/loggedoutmenubar-template.html',
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
