﻿(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyPlayerselect', {
            bindings: {
                player: '=',
                choices: '<',
                prompt: '@',
                modalContainer: '<'
            },
            controllerAs: 'psd',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$element', 'modalService'];
    function controllerFn($element, modalService) {
        var psd = this;

        psd.$onInit = function () {
            angular.element($element).on('click', function () {
                modalService
                    .show({
                        view: '<drbbly-playerselectormodal></drbbly-playerselectormodal>',
                        model: {
                            players: psd.choices,
                            title: psd.prompt
                        },
                        container: psd.modalContainer,
                        backdrop: 'static',
                        windowClass: 'player-selector-modal'
                    })
                    .then(player => {
                            psd.player = player;
                    })
                    .catch(err => { /*modal cancelled, do nothing*/ });
            });
        };
    }
})();