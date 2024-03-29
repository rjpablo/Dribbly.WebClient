﻿(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeammembers', {
            bindings: {
                app: '<',
                team: '<',
                onUpdate: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$stateParams', 'authService', 'drbblyOverlayService', 'drbblyTeamsService'];
    function controllerFunc($stateParams, authService, drbblyOverlayService, drbblyTeamsService) {
        var dad = this;

        dad.$onInit = function () {
            dad.teamId = $stateParams.id;
            dad.overlay = drbblyOverlayService.buildOverlay();
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
            dad.app.updatePageDetails({
                title: (dad.team.name) + ' - Members',
                image: dad.team.logo.url
            });
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
            drbblyTeamsService.getJoinRequests(dad.teamId)
                .then(function (data) {
                    dad.isBusy = false;
                    dad.requestingMembers = data;
                }, function (error) {
                    dad.isBusy = false;
                });
        }
    }
})();
