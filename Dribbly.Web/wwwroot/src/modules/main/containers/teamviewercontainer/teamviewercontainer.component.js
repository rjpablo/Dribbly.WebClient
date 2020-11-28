(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeamviewercontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'avc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTeamsService', 'authService', '$stateParams', '$state', 'permissionsService'];
    function controllerFunc(drbblyTeamsService, authService, $stateParams, $state, permissionsService) {
        var avc = this;
        var _teamId;

        avc.$onInit = function () {
            _teamId = $stateParams.id;
            loadTeam();
        };

        function loadTeam() {
            drbblyTeamsService.getTeamViewerData(_teamId)
                .then(function (data) {
                    avc.team = data.team;
                    avc.isOwned = authService.isCurrentUserId(avc.team.addedById);
                    avc.app.mainDataLoaded();
                    avc.shouldDisplayAsPublic = true; //TODO should be conditional
                    buildSubPages();
                }, function (error) {

                });
        }

        avc.onTeamUpdate = function () {
            loadTeam();
        };

        avc.$onDestroy = function () {
            avc.app.toolbar.clearNavItems();
        };

        function buildSubPages() {
            avc.app.toolbar.setNavItems([
                {
                    textKey: 'site.Home',
                    targetStateName: 'main.team.home',
                    targetStateParams: { username: _teamId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                }
            ]);
        }
    }
})();
