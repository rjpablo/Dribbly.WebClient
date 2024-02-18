(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyText', {
            bindings: {
                value: '<',
                clipAt: '<'
            },
            controllerAs: 'dte',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = [];
    function controllerFn() {
        var dte = this;

        dte.$onInit = function () {
            dte.exceedsClipLimit = dte.value.length > dte.clipAt;
            dte.setClipped(dte.exceedsClipLimit);
        };

        dte.$onChanges = (changes) => {
            dte.exceedsClipLimit = dte.value.length > dte.clipAt;
            dte.setClipped(dte.exceedsClipLimit);
        }

        dte.setClipped = function (isClipped) {
            dte.isClipped = isClipped;
            if (isClipped) {
                dte.displayedText = dte.value.substr(0, dte.clipAt);
            }
            else {
                dte.displayedText = dte.value;
            }
        };
    }
})();
