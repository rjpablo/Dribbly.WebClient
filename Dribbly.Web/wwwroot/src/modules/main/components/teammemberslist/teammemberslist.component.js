(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeammemberslist', {
            bindings: {
                members: '<',
                titleKey: '<',
                listTitle: '<',
                settings: '<',
                onRequestProcessed: '<',
                onMemberRemoved: '<',
                team: '<',
                canRemove: '<',
                canProcessRequest: '<'
            },
            controllerAs: 'tml',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['modalService', '$element', 'drbblyTeamsService', 'authService',
        'drbblyCommonService'];
    function controllerFunc(modalService, $element, drbblyTeamsService, authService,
        drbblyCommonService) {
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
            //modalService.show({
            //    view: '<drbbly-memberpreviewmodal></drbbly-memberpreviewmodal>',
            //    model: { member: member }
            //})
            //    .then(function () { /*do nothing*/ })
            //    .catch(function () { /*do nothing*/ });
        };

        tml.loadMore = function () {
            tml.currentSize = Math.min(tml.members.length, tml.currentSize + tml._settings.loadSize);
            setDisplayedMembers();
        };

        tml.editRequest = function (member) {
            tml.isBusy = true;
            return authService.checkAuthenticationThen(function () {
                return modalService.show({
                    view: '<drbbly-jointeammodal></drbbly-jointeammodal>',
                    model: {
                        teamName: tml.team.name,
                        teamId: tml.team.id,
                        isEditByManager: true,
                        request: {
                            id: member.id,
                            teamId: tml.team.id,
                            jerseyNo: member.jerseyNo,
                            position: member.position,
                            requestedByName: member.name,
                            memberAccountId: member.memberAccountId
                        }
                    },
                    size: 'sm'
                })
                    .then(function (result) {
                        if (result.shouldApprove) {
                            member.jerseyNo = result.request.jerseyNo;
                            member.position = result.request.position;
                            tml.processRequest(member, true);
                        }
                    })
                    .catch(function () {
                        tml.isBusy = false;
                    });
            }, function () { tml.isBusy = false; })
                .catch(function (e) {
                    tml.isBusy = false;
                    drbblyCommonService.handleError(e);
                });;
        }

        tml.removeMember = function (member) {
            tml.isBusy = true;
            return authService.checkAuthenticationThen(function () {
                return modalService.confirm({
                    msg1Raw: `Remove ${member.name}?`
                })
                    .then(function (confirmed) {
                        if (confirmed) {
                            drbblyTeamsService.removeMember(tml.team.id, member.id)
                                .then(function () {
                                    if (tml.onMemberRemoved) {
                                        tml.onMemberRemoved(member);
                                    }
                                })
                                .catch(function (e) {
                                    tml.isBusy = false;
                                    drbblyCommonService.handleError(e);
                                });
                        }
                    })
                    .catch(function () {
                        tml.isBusy = false;
                    });
            }, function () { tml.isBusy = false; })
                .catch(function (e) {
                    tml.isBusy = false;
                    drbblyCommonService.handleError(e);
                });
        }

        function setDisplayedMembers() {
            tml.displayedMembers = (tml.members || []).slice(0, tml.currentSize);
        }
    }
})();
