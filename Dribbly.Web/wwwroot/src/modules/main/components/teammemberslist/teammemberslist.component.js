(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeammemberslist', {
            bindings: {
                members: '<',
                titleKey: '@',
                settings: '<'
            },
            controllerAs: 'tml',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['modalService', '$element'];
    function controllerFunc(modalService, $element) {
        var tml = this;

        tml.$onInit = function () {
        };

        tml.$onChanges = function (change) {
            if (change.members && change.members.currentValue) {
                setSettings(tml.settings || {});
                if (!tml._settings.wrapItems) {
                    $element.addClass('no-wrap');
                }
                tml.currentSize = tml._settings.initialItemCount ?
                    Math.min((tml.members || []).length, tml._settings.initialItemCount) :
                    (tml.members || []).length;
                setDisplayedMembers();
            }
        };

        function setSettings(settings) {
            var defaultSettings = {
                wrapItems: true,
                loadSize: 12,
                initialItemCount: 12
            };

            tml._settings = Object.assign({}, defaultSettings, settings);
        }

        tml.onItemClick = function (member) {
            modalService.show({
                view: '<drbbly-memberpreviewmodal></drbbly-memberpreviewmodal>',
                model: { member: member }
            })
                .then(function () { /*do nothing*/ })
                .catch(function () { /*do nothing*/ });
        };

        tml.loadMore = function () {
            tml.currentSize = Math.min(tml.members.length, tml.currentSize + tml._settings.loadSize);
            setDisplayedMembers();
        };

        function setDisplayedMembers() {
            tml.displayedMembers = (tml.members || []).slice(0, tml.currentSize);
        }
    }
})();
