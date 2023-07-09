(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyLcddisplay', {
            bindings: {
                text: '<',
                onClick: '<',
                isDanger: '<',
                isWarning: '<',
                fontSize: '<'
            },
            controllerAs: 'lcd',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$interval', 'drbblyTimerhelperService', 'modalService', '$element'];
    function controllerFunc($interval, drbblyTimerhelperService, modalService, $element) {
        var lcd = this;

        lcd.$onInit = function () {

        };

        lcd.clicked = function () {
            if (lcd.onClick) {
                lcd.onClick({
                    text: lcd.text
                });
            }
        }
    }

})();
