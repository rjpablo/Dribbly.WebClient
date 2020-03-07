(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTimegridevent', {
            bindings: {
                event: '<'
            },
            controllerAs: 'tge',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });
    controllerFn.$inject = ['$element'];
    function controllerFn($element) {
        var tge = this;

        tge.$onInit = function () {
            addClasses(tge.event);
        };

        function addClasses(event) {
            var classes;
            if (event.isStart) {
                classes += 'fc-start ';
            }
            if (event.isEnd) {
                classes += 'fc-end ';
            }
            //if (event.startEditable) {
            //    classes += 'fc-draggable ';
            //}
            //if (event.durationEditable) {
            //    //classes += 'fc-resizable ';
            //}
            $element.addClass(classes + 'fc-time-grid-event fc-event');
        }
    }

})();
