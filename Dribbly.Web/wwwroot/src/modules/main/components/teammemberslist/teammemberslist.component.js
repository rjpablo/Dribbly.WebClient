(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeammemberslist', {
            bindings: {
                members: '<',
                titleKey: '<',
                title: '<',
                settings: '<',
                onRequestProcessed: '<'
            },
            controllerAs: 'tml',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['modalService', '$element', 'drbblyTeamsService'];
    function controllerFunc(modalService, $element, drbblyTeamsService) {
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

        tml.processRequest = function (request, shouldApprove) {
            request.isBusy = true;
            drbblyTeamsService.processJoinRequest({ request: request, shouldApprove: shouldApprove })
                .then(function () {
                    removeItem(request);
                    if (tml.onRequestProcessed) {
                        tml.onRequestProcessed(shouldApprove);
                    }
                })
                .catch(function () {
                    request.isBusy = false;
                });
        };

        function removeItem(member) {
            tml.members.drbblyRemove({ id: member.id });
            tml.displayedMembers.drbblyRemove({ id: member.id });
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
