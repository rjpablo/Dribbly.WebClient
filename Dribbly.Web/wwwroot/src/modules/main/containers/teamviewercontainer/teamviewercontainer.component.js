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
        'constants', 'drbblyDatetimeService'];
    function controllerFunc(drbblyTeamsService, authService, $stateParams, $state, drbblyOverlayService,
        constants, drbblyDatetimeService) {
        var avc = this;
        var _teamId;

        avc.$onInit = function () {
            avc.overlay = drbblyOverlayService.buildOverlay();
            _teamId = $stateParams.id;
            loadTeam()
                .then(function () {
                    avc.isBusy = true;
                    return drbblyTeamsService.getUserTeamRelation(_teamId)
                        .then(function (data) {
                            avc.isBusy = false;
                            avc.userTeamRelation = data;
                            avc.overlay.setToReady();
                        }, function (error) {
                            avc.overlay.setToError();
                            avc.isBusy = false;
                        });
                })
                .catch(() => { avc.overlay.setToError(); });
        };

        function loadTeam() {
            avc.overlay.setToBusy();
            return drbblyTeamsService.getTeamViewerData(_teamId)
                .then(function (data) {
                    avc.team = data.team;
                    avc.team.dateAdded = new Date(drbblyDatetimeService.toUtcString(avc.team.dateAdded))
                    avc.team.logo = avc.team.logo || getDefaultLogo();
                    avc.team.photos = avc.team.photos || [];
                    avc.team.photos.push(avc.team.logo);
                    avc.isOwned = authService.isCurrentAccountId(avc.team.addedById);
                    avc.app.mainDataLoaded();
                    avc.shouldDisplayAsPublic = true; //TODO should be conditional
                    buildSubPages();
                })
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
