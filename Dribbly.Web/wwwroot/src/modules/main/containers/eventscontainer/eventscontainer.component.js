(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyEventscontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dhc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyToolbarService', 'drbblyCommonService', 'drbblyEvtService', 'modalService',
        'drbblyOverlayService', 'authService'];
    function controllerFunc(drbblyToolbarService, drbblyCommonService, drbblyEvtService, modalService,
        drbblyOverlayService, authService) {
        var dhc = this;

        dhc.$onInit = function () {
            dhc.app.updatePageDetails({
                title: 'Basketball Events',
                description: 'Basketball Events'
            });
            dhc.overlay = drbblyOverlayService.buildOverlay();
            drbblyToolbarService.setItems([]);

            dhc.events = [];
            dhc.app.mainDataLoaded();
            loadEvents();
        };

        function loadEvents() {
            drbblyEvtService.getEvents({})
                .then(result => {
                    dhc.events = result;
                })
        }

        dhc.joinEvent = function (event) {
            event.isBusy = true;
            drbblyEvtService.joinEvent(event.id)
                .then(function (result) {
                    var isOwned = authService.isCurrentUserId(event.addedById);
                    if (isOwned || !event.requireApproval) {
                        event.userRelationship.isCurrentMember = true;
                    }
                    else if (event.requireApproval) {
                        event.userRelationship.hasJoinRequest = true;
                        modalService.alert({ msg1Raw: 'Your request has been sent for the host\'s approval' });
                    }
                })
                .catch(e => drbblyCommonService.handleError(e))
                .finally(() => event.isBusy = false);
        };

        dhc.withdraw = function (event) {
            event.isBusy = true;
            drbblyEvtService.leaveEvent(event.id)
                .then(function () {
                    event.userRelationship.isCurrentMember = false;
                    event.isBusy = false;
                })
                .catch(e => drbblyCommonService.handleError(e))
                .finally(() => event.isBusy = false);
        };

        dhc.cancelRequest = function (event) {
            event.isBusy = true;
            drbblyEvtService.cancelJoinRequest(event.id)
                .then(function () {
                    event.userRelationship.hasJoinRequest = false;
                    event.isBusy = false;
                })
                .catch(e => drbblyCommonService.handleError(e))
                .finally(() => event.isBusy = false);
        };
    }
})();
