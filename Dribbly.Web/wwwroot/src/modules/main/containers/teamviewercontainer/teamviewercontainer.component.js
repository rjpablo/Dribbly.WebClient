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

    controllerFunc.$inject = ['drbblyTeamsService', 'authService', '$stateParams', '$state', 'drbblyOverlayService',
        'constants'];
    function controllerFunc(drbblyTeamsService, authService, $stateParams, $state, drbblyOverlayService,
        constants) {
        var avc = this;
        var _teamId;

        avc.$onInit = function () {
            avc.overlay = drbblyOverlayService.buildOverlay();
            _teamId = $stateParams.id;
            loadTeam();
        };

        function loadTeam() {
            avc.overlay.setToBusy();
            drbblyTeamsService.getTeamViewerData(_teamId)
                .then(function (data) {
                    avc.overlay.setToReady();
                    avc.team = data.team;
                    avc.team.logo = avc.team.logo || getDefaultLogo();
                    avc.team.photos = avc.team.photos || [];
                    avc.team.photos.push(avc.team.logo);
                    avc.isOwned = authService.isCurrentUserId(avc.team.addedById);
                    avc.app.mainDataLoaded();
                    avc.shouldDisplayAsPublic = true; //TODO should be conditional
                    buildSubPages();
                })
                .catch(avc.overlay.setToError);
        }

        function getDefaultLogo() {
            return {
                url: '../../../../../' + constants.images.defaultTeamLogoUrl,
                isDefault: true
            };
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
                    targetStateParams: { id: _teamId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Members',
                    targetStateName: 'main.team.members',
                    targetStateParams: { id: _teamId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                }
            ]);
        }
    }
})();
