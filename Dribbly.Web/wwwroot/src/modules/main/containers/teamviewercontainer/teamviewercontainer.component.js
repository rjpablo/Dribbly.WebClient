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
        'constants', 'drbblyDatetimeService', 'drbblyTeamshelperService', 'modalService', 'drbblyEventsService',
        'drbblyFileService', 'i18nService'];
    function controllerFunc(drbblyTeamsService, authService, $stateParams, $state, drbblyOverlayService,
        constants, drbblyDatetimeService, drbblyTeamshelperService, modalService, drbblyEventsService,
        drbblyFileService, i18nService) {
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

        avc.message = function () {
            authService.checkAuthenticationThen(() => {
                if (!avc.isOwned) {
                    drbblyEventsService.broadcast('drbbly.chat.openChat',
                        {
                            team: avc.team,
                            type: constants.enums.chatTypeEnum.Team,
                            getChat: () => drbblyTeamsService.getTeamChat(_teamId)
                        }
                    );
                }
            })
        };

        avc.onLogoSelect = function (file) {
            if (!file) { return; }

            var url = URL.createObjectURL(file);

            return modalService.show({
                view: '<drbbly-croppermodal></drbbly-croppermodal>',
                model: {
                    imageUrl: url,
                    cropperOptions: {
                        aspectRatio: 1
                    }
                }
            })
                .then(function (imageData) {
                    var fileNameNoExt = (file.name.split('\\').pop().split('/').pop().split('.'))[0]
                    imageData.name = fileNameNoExt + '.png';
                    drbblyFileService.upload(imageData, 'api/teams/uploadLogo/' + avc.team.id)
                        .then(function (result) {
                            if (result && result.data) {
                                avc.team.logo = result.data;
                                avc.team.logoId = result.data.id;
                            }
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                })
                .finally(function () {
                    URL.revokeObjectURL(url)
                });
        };

        function loadTeam() {
            avc.overlay.setToBusy();
            return drbblyTeamsService.getTeamViewerData(_teamId)
                .then(function (data) {
                    avc.team = data.team;
                    avc.team.dateAdded = new Date(drbblyDatetimeService.toUtcString(avc.team.dateAdded))
                    avc.team.logo = avc.team.logo || constants.images.defaultTeamLogo;
                    avc.team.photos = avc.team.photos || [];
                    avc.team.photos.push(avc.team.logo);
                    avc.isManager = authService.isCurrentAccountId(avc.team.addedById);
                    avc.app.mainDataLoaded();
                    avc.shouldDisplayAsPublic = true; //TODO should be conditional
                    buildSubPages();
                })
        }

        avc.joinTeam = function () {
            avc.isBusy = true;
            return authService.checkAuthenticationThen(function () {
                return modalService.show({
                    view: '<drbbly-jointeammodal></drbbly-jointeammodal>',
                    model: { teamName: avc.team.name, teamId: avc.team.id },
                    size: 'sm'
                })
                    .then(function (result) {
                        avc.userTeamRelation = result;
                        avc.isBusy = false;
                    })
                    .catch(function () {
                        avc.isBusy = false;
                    });
            }, function () { avc.isBusy = false; })
                .catch(function (e) {
                    avc.isBusy = false;
                });;
        };

        avc.leaveTeam = function () {
            avc.isBusy = true;
            return modalService.confirm({
                msg1Raw: i18nService.getString('app.LeaveTeamConfirmationPrompt', { teamName: avc.team.name })
            })
                .then(function (result) {
                    if (result) {
                        return authService.checkAuthenticationThen(function () {
                            return drbblyTeamsService.leaveTeam(avc.team.id)
                                .then(function (result) {
                                    avc.userTeamRelation = result;
                                    avc.isBusy = false;
                                }, function () {
                                    avc.isBusy = false;
                                });
                        }, function () { avc.isBusy = false; });
                    }
                })
                .finally(function () {
                    avc.isBusy = false;
                });
        };

        avc.cancelJoinRequest = function () {
            avc.isBusy = true;
            drbblyTeamsService.cancelJoinRequest(avc.team.id)
                .then(function () {
                    avc.userTeamRelation.hasPendingJoinRequest = false;
                    avc.isBusy = false;
                }, function () {
                    avc.isBusy = false;
                });
        };

        avc.onLogoClick = function () {
            if (!avc.isManager) {
                viewLogo();
                return;
            }

            modalService.showMenuModal({
                model: {
                    buttons: [
                        {
                            text: 'View Logo',
                            action: viewLogo,
                            class: 'btn-secondary'
                        },
                        {
                            text: 'ReplaceLogo',
                            action: function () {
                                angular.element('#btn-replace-photo').triggerHandler('click');
                            },
                            isHidden: () => !avc.isManager,
                            class: 'btn-secondary'
                        }
                    ],
                    hideHeader: true
                },
                size: 'sm',
                backdrop: true
            });
        };

        avc.fbShare = function () {
            var url = `https://www.facebook.com/sharer/sharer.php?s=100&p[url]=${location.host}/team/${_teamId}`;
            window.open(url, 'targetWindow', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=250');
            return false;
        }

        function viewLogo() {
            avc.methods.open(0);
        }

        avc.onTeamUpdate = function () {
            loadTeam();
        };

        avc.$onDestroy = function () {
            avc.app.toolbar.clearNavItems();
        };

        avc.update = function () {
            drbblyTeamshelperService.openAddTeamModal({
                id: avc.team.id,
                name: avc.team.name,
                shortName: avc.team.shortName,
                isEdit: true
            })
                .then(function (team) {
                    if (team) {
                        avc.team.name = team.name;
                        avc.team.shortName = team.shortName;
                    }
                });
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
                },
                {
                    textKey: 'app.Games',
                    targetStateName: 'main.team.games',
                    targetStateParams: { id: _teamId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                }
            ]);
        }
    }
})();
