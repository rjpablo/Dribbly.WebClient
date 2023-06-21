﻿(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGamelist', {
            bindings: {
                games: '<',
                titleKey: '@',
                settings: '<'
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
