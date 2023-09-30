(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyPlayerselect', {
            bindings: {
                player: '=',
                choices: '<',
                prompt: '@',
                modalContainer: '<',
                openOnInit: '<',
                onSelect: '<'
            },
            controllerAs: 'psd',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$element', 'modalService'];
    function controllerFn($element, modalService) {
        var psd = this;

        psd.$onInit = function () {
            angular.element($element).on('click', open);
            if (psd.openOnInit) {
                open();
            }
        };

        function open() {
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
                    psd.onSelect && psd.onSelect(player);
                })
                .catch(err => { /*modal cancelled, do nothing*/ });
        }
    }
})();
