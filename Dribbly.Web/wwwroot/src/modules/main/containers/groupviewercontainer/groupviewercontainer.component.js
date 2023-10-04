(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGroupviewercontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'gvc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyGroupsService', 'authService', '$stateParams', '$state', 'drbblyOverlayService',
        'constants', 'drbblyDatetimeService', 'modalService', 'drbblyEventsService',
        'drbblyFileService', 'i18nService'];
    function controllerFunc(drbblyGroupsService, authService, $stateParams, $state, drbblyOverlayService,
        constants, drbblyDatetimeService, modalService, drbblyEventsService,
        drbblyFileService, i18nService) {
        var gvc = this;
        var _groupId;

        gvc.$onInit = function () {
            gvc.overlay = drbblyOverlayService.buildOverlay();
            _groupId = $stateParams.id;
            gvc.overlay.setToBusy();
            loadGroup()
                .catch(() => { gvc.overlay.setToError(); })
                .finally(() => { gvc.overlay.setToReady(); });
        };

        gvc.onLogoSelect = function (file) {
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
                    drbblyFileService.upload([imageData], 'api/groups/setLogo/' + gvc.group.id)
                        .then(function (result) {
                            if (result && result.data) {
                                gvc.group.logo = result.data;
                                gvc.group.logoId = result.data.id;
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

        gvc.update = function () {
            drbblyGroupsService.openGroupDetailsModal
                ({
                    id: gvc.group.id,
                    name: gvc.group.name,
                    isEdit: true
                })
                .then(function (group) {
                    if (group) {
                        gvc.group.name = group.name;
                    }
                });
        };

        function loadGroup() {
            return drbblyGroupsService.getGroupViewerData(_groupId)
                .then(function (data) {
                    gvc.group = data;
                    gvc.group.dateAdded = new Date(drbblyDatetimeService.toUtcString(gvc.group.dateAdded))
                    gvc.group.logo = gvc.group.logo || constants.images.defaultGroupLogo;
                    gvc.isAdmin = gvc.group.userRelationship.isAdmin;
                    gvc.app.mainDataLoaded();
                    gvc.shouldDisplayAsPublic = true; //TODO should be conditional
                    buildSubPages();
                })
        }

        gvc.joinGroup = function () {
            gvc.isBusy = true;
            drbblyGroupsService.joinGroup(_groupId)
                .then(function (result) {
                    gvc.group.userRelationship.hasJoinRequest = true;
                    gvc.isBusy = false;
                })
                .catch(function () {
                    gvc.isBusy = false;
                });
        };

        gvc.leaveGroup = function () {
            gvc.isBusy = true;
            return modalService.confirm({
                msg1Raw: 'Leave Group?'
            })
                .then(function (result) {
                    if (result) {
                        return authService.checkAuthenticationThen(function () {
                            return drbblyGroupsService.leaveGroup(gvc.group.id)
                                .then(function (result) {
                                    gvc.userGroupRelation = result;
                                    gvc.isBusy = false;
                                }, function () {
                                    gvc.isBusy = false;
                                });
                        }, function () { gvc.isBusy = false; });
                    }
                })
                .finally(function () {
                    gvc.isBusy = false;
                });
        };

        gvc.cancelJoinRequest = function () {
            gvc.isBusy = true;
            drbblyGroupsService.cancelJoinRequest(gvc.group.id)
                .then(function () {
                    gvc.group.userRelationship.hasJoinRequest = false;
                    gvc.isBusy = false;
                }, function () {
                    gvc.isBusy = false;
                });
        };

        gvc.onLogoClick = function () {
            if (!gvc.isAdmin) {
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
                            isHidden: () => !gvc.isAdmin,
                            class: 'btn-secondary'
                        }
                    ],
                    hideHeader: true
                },
                size: 'sm',
                backdrop: true
            });
        };

        gvc.fbShare = function () {
            var url = `https://www.facebook.com/sharer/sharer.php?s=100&p[url]=${location.host}/group/${_groupId}`;
            window.open(url, 'targetWindow', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=250');
            return false;
        }

        function viewLogo() {
            gvc.methods.open(0);
        }

        gvc.onGroupUpdate = function () {
            loadGroup();
        };

        gvc.$onDestroy = function () {
            gvc.app.toolbar.clearNavItems();
        };

        function buildSubPages() {
            gvc.app.toolbar.setNavItems([
                {
                    textKey: 'site.Home',
                    targetStateName: 'main.group.home',
                    targetStateParams: { id: _groupId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Members',
                    targetStateName: 'main.group.members',
                    targetStateParams: { id: _groupId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                }
            ]);
        }
    }
})();
