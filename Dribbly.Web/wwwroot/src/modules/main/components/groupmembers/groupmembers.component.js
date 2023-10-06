(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGroupmembers', {
            bindings: {
                app: '<',
                group: '<',
                onUpdate: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$stateParams', 'modalService', 'drbblyOverlayService', 'drbblyGroupsService'];
    function controllerFunc($stateParams, modalService, drbblyOverlayService, drbblyGroupsService) {
        var dad = this;

        dad.$onInit = function () {
            dad.groupId = $stateParams.id;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.isBusy = true;
            //loadCurrentMembers();

            if (dad.isManager) { // only the manager should be able to see pending requests
                loadPendingRequests();
            }

            dad.memberListSettings = {
                wrapItems: true,
                loadSize: 6,
                initialItemCount: 0
            }
            dad.app.updatePageDetails({
                title: (dad.group.name) + ' - Members',
                image: dad.group.logo.url
            });
        };

        dad.processRequest = function (request, isApproved) {
            request.isBusy = true;
            drbblyGroupsService.processJoinRequest(request.id, isApproved)
                .then(() => {
                    dad.group.joinRequests.drbblyRemove(r => r.id === request.id);
                })
                .catch(() => request.isBusy = false);
        };

        dad.onMemberRemoved = function (member) {
            // use reassignment to trigger $onChanges handler in groupmembers component
            dad.currentMembers = dad.currentMembers.drbblyWhere(m => m.id !== member.id);
        };

        function loadCurrentMembers() {
            dad.overlay.setToBusy()
            drbblyGroupsService.getCurrentMembers(dad.groupId)
                .then(function (data) {
                    dad.isBusy = false;
                    dad.currentMembers = data;
                    dad.overlay.setToReady();
                }, function (error) {
                    dad.overlay.setToError();
                    dad.isBusy = false;
                });
        }

        dad.removeMember = function (member) {
            modalService.confirm({
                msg1Raw: `Remove ${member.name} from the group?`
            })
                .then(function (confirmed) {
                    if (confirmed) {
                        member.isBusy = true;
                        drbblyGroupsService.removeMember(dad.group.id, member.accountId)
                            .then(function () {
                                dad.group.members.drbblyRemove(m => m.accountId === member.accountId);
                            })
                            .catch(function (e) {
                                drbblyCommonService.handleError(e);
                            })
                            .finally(() => member.isBusy = true);
                    }
                })
                .catch(function () {
                    //user cancelled, no action needed
                });
        };

        function loadPendingRequests() {
            drbblyGroupsService.getJoinRequests(dad.groupId)
                .then(function (data) {
                    dad.isBusy = false;
                    dad.requestingMembers = data;
                }, function (error) {
                    dad.isBusy = false;
                });
        }
    }
})();
