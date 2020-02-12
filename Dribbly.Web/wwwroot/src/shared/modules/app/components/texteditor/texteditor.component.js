(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyTexteditor', {
            bindings: {
                value: '=',
                options: '<'
            },
            controllerAs: 'dte',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = [];
    function controllerFn() {
        var dte = this;

        dte.$onInit = function () {
            dte._options = Object.assign(getDefaultOptions(), dte.options | {});
        };

        function getDefaultOptions() {
            return {
                textAreaId: null,
                textAreaClass: 'form-control',
                textAreaHeight: '8rem',
                textAreaName: null,
                required: false,
                showToolTips: true,
                disabled: true,
                customMenu: [
                    ['bold', 'italic', 'strikethrough'],
                    ['font-color', 'hilite-color'],
                    ['remove-format'],
                    ['ordered-list', 'unordered-list', 'outdent', 'indent']
                ]
            };
        }
    }
})();
