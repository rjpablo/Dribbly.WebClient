﻿(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyProfilepicture', {
            bindings: {
                user: '<'
            },
            controllerAs: 'dpp',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$element'];
    function controllerFn($element) {
        var dpp = this;

        dpp.$onInit = function () {
            $element.addClass('drbbly-profilepicture');
        };
    }
})();