(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyEventviewercontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'gvc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyEvtService', 'authService', '$stateParams', '$state', 'drbblyOverlayService',
        'constants', 'drbblyDatetimeService', 'modalService', 'drbblyCommonService',
        'drbblyFileService', 'i18nService'];
    function controllerFunc(drbblyEvtService, authService, $stateParams, $state, drbblyOverlayService,
        constants, drbblyDatetimeService, modalService, drbblyCommonService,
        drbblyFileService, i18nService) {
        var gvc = this;
        var _eventId;

        gvc.$onInit = function () {
            gvc.overlay = drbblyOverlayService.buildOverlay();
            _eventId = $stateParams.id;
            gvc.overlay.setToBusy();
            loadEvent()
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
                    drbblyFileService.upload([imageData], 'api/events/setLogo/' + gvc.event.id)
                        .then(function (result) {
                            if (result && result.data) {
                                gvc.event.logo = result.data;
                                gvc.event.logoId = result.data.id;
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
            drbblyEvtService.openEventDetailsModal
                ({
                    ...gvc.event,
                    isEdit: true
                })
                .then(function (event) {
                    if (event) {
                        loadEvent();
                    }
                });
        };

        function loadEvent() {
            return drbblyEvtService.getEventViewerData(_eventId)
                .then(function (data) {
                    gvc.event = data;
                    gvc.event.dateAdded = new Date(drbblyDatetimeService.toUtcString(gvc.event.dateAdded));
                    gvc.event.startDate = new Date(drbblyDatetimeService.toUtcString(data.startDate));
                    gvc.event.logo = gvc.event.logo || constants.images.defaultEventLogo;
                    gvc.event.currentAttendees = gvc.event.attendees.drbblyWhere(a => a.isApproved);
                    gvc.event.joinRequests = gvc.event.attendees.drbblyWhere(a => !a.isApproved);
                    gvc.isAdmin = gvc.event.userRelationship.isAdmin;
                    gvc.app.mainDataLoaded();
                    gvc.shouldDisplayAsPublic = true; //TODO should be conditional
                    buildSubPages();
                })
        }

        gvc.joinEvent = function () {
            gvc.isBusy = true;
            drbblyEvtService.joinEvent(_eventId)
                .then(function (result) {
                    gvc.event.userRelationship.hasJoinRequest = true;
                    gvc.isBusy = false;
                    loadEvent();
                })
                .catch(function () {
                    gvc.isBusy = false;
                });
        };

        gvc.cancelJoinRequest = function () {
            gvc.isBusy = true;
            drbblyEvtService.cancelJoinRequest(gvc.event.id)
                .then(function () {
                    loadEvent();
                    gvc.event.userRelationship.hasJoinRequest = false;
                    gvc.isBusy = false;
                }, function () {
                    gvc.isBusy = false;
                });
        };

        gvc.leaveEvent = function () {
            modalService.confirm({
                msg1Raw: `Leave event?`
            })
                .then(function (confirmed) {
                    if (confirmed) {
                        gvc.isBusy = true;
                        drbblyEvtService.leaveEvent(gvc.event.id)
                            .then(function () {
                                loadEvent();
                                gvc.event.userRelationship.isCurrentMember = false;
                            })
                            .catch(function (e) {
                                drbblyCommonService.handleError(e);
                            })
                            .finally(() => gvc.isBusy = false);
                    }
                })
                .catch(function () {
                    //user cancelled, no action needed
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
            var url = `https://www.facebook.com/sharer/sharer.php?s=100&p[url]=${location.host}/event/${_eventId}`;
            window.open(url, 'targetWindow', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=250');
            return false;
        }

        function viewLogo() {
            gvc.methods.open(0);
        }

        gvc.onEventUpdate = function () {
            loadEvent();
        };

        gvc.$onDestroy = function () {
            gvc.app.toolbar.clearNavItems();
        };

        function buildSubPages() {
            gvc.app.toolbar.setNavItems([
                {
                    textKey: 'site.Home',
                    targetStateName: 'main.event.home',
                    targetStateParams: { id: _eventId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Attendees',
                    targetStateName: 'main.event.attendees',
                    targetStateParams: { id: _eventId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                }
            ]);
        }
    }
})();
