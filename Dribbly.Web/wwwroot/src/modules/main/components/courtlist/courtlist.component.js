(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtlist', {
            bindings: {
                courts: '<',
                titleKey: '@',
                settings: '<'
            },
            controllerAs: 'dcl',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['modalService', '$element'];
    function controllerFunc(modalService, $element) {
        var dcl = this;

        dcl.$onInit = function () {
            $element.addClass('drbbly-court-list');
            setSettings(dcl.settings || {});
            if (!dcl._settings.wrapItems) {
                $element.addClass('no-wrap');
            }

            dcl.currentSize = Math.min((dcl.courts || []).length, dcl._settings.initialItemCount);
            setDisplayedCourts();
        };

        function setSettings(settings) {
            var defaultSettings = {
                wrapItems: true,
                loadSize: 6,
                initialItemCount: 6
            };

            dcl._settings = Object.assign({}, defaultSettings, settings);
        }

        dcl.onItemClick = function (court) {
            modalService.show({
                view: '<drbbly-courtpreviewmodal></drbbly-courtpreviewmodal>',
                model: { court: court }
            })
                .then(function () { /*do nothing*/ })
                .catch(function () { /*do nothing*/ });
        };

        dcl.loadMore = function () {
            dcl.currentSize = Math.min(dcl.courts.length, dcl.currentSize + dcl._settings.loadSize);
            setDisplayedCourts();
        };

        function setDisplayedCourts() {
            dcl.displayedCourts = (dcl.courts || []).slice(0, dcl.currentSize);
        }
    }
})();
