(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeammembers', {
            bindings: {
                team: '<',
                onUpdate: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', '$stateParams', 'authService', 'permissionsService',
        'drbblyOverlayService', 'modalService', 'i18nService', 'drbblyTeamsService'];
    function controllerFunc(constants, $stateParams, authService, permissionsService,
        drbblyOverlayService, modalService, i18nService, drbblyTeamsService) {
        var dad = this;

        dad.$onInit = function () {
            dad.teamId = $stateParams.id;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.joinRequestsOverlay = drbblyOverlayService.buildOverlay();
            dad.isOwned = authService.isCurrentAccountId(dad.team.addedById);
            dad.isBusy = true;
            dad.isManager = authService.isCurrentAccountId(dad.team.managedById);
            loadCurrentMembers();

            if (dad.isManager) { // only the manager should be able to see pending requests
                loadPendingRequests();
            }

            dad.memberListSettings = {
                wrapItems: true,
                loadSize: 6,
                initialItemCount: 0
            }
        };

        dad.onRequestProcessed = function (isApproved) {
            if (isApproved) {
                loadCurrentMembers();
            }
        };

        dad.onMemberRemoved = function (member) {
            // use reassignment to trigger $onChanges handler in teammembers component
            dad.currentMembers = dad.currentMembers.drbblyWhere(m => m.id !== member.id);
        };

        function loadCurrentMembers() {
            dad.overlay.setToBusy()
            drbblyTeamsService.getCurrentMembers(dad.teamId)
                .then(function (data) {
                    dad.isBusy = false;
                    dad.currentMembers = data;
                    dad.overlay.setToReady();
                }, function (error) {
                    dad.overlay.setToError();
                    dad.isBusy = false;
                });
        }

        function loadPendingRequests() {
            dad.joinRequestsOverlay.setToBusy();
            drbblyTeamsService.getJoinRequests(dad.teamId)
                .then(function (data) {
                    dad.isBusy = false;
                    dad.requestingMembers = data;
                    dad.joinRequestsOverlay.setToReady();
                }, function (error) {
                    dad.joinRequestsOverlay.setToError();
                    dad.isBusy = false;
                });
        }
    }
})();
