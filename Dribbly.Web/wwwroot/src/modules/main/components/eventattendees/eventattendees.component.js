(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyEventattendees', {
            bindings: {
                app: '<',
                event: '<',
                onUpdate: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$stateParams', 'modalService', 'drbblyOverlayService', 'drbblyEvtService',
        'drbblyCommonService'];
    function controllerFunc($stateParams, modalService, drbblyOverlayService, drbblyEvtService,
        drbblyCommonService) {
        var dad = this;

        dad.$onInit = function () {
            dad.eventId = $stateParams.id;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.isBusy = true;
            //loadCurrentAttendees();

            if (dad.isManager) { // only the manager should be able to see pending requests
                loadPendingRequests();
            }

            dad.attendeeListSettings = {
                wrapItems: true,
                loadSize: 6,
                initialItemCount: 0
            }
            dad.app.updatePageDetails({
                title: (dad.event.name) + ' - Attendees',
                image: dad.event.logo.url
            });
        };

        dad.processRequest = function (request, isApproved) {
            request.isBusy = true;
            drbblyEvtService.processJoinRequest(request.id, isApproved)
                .then(() => {
                    if (isApproved) {
                        request.isApproved = true;
                        request.isBusy = false;
                    }
                    else {
                        dad.event.attendees.drbblyRemove(r => r.id === request.id);
                        dad.event.joinRequests.drbblyRemove(r => r.id === request.id);
                    }
                    dad.onUpdate();
                })
                .catch(() => request.isBusy = false);
        };

        dad.attendeeFilter = (isApproved) => {
            return a => a.isApproved == isApproved;
        }

        dad.onAttendeeRemoved = function (attendee) {
            // use reassignment to trigger $onChanges handler in eventattendees component
            dad.currentAttendees = dad.currentAttendees.drbblyWhere(m => m.id !== attendee.id);
        };

        dad.removeAttendee = function (attendee) {
            modalService.confirm({
                msg1Raw: `Remove ${attendee.name} from the event?`
            })
                .then(function (confirmed) {
                    if (confirmed) {
                        attendee.isBusy = true;
                        drbblyEvtService.removeAttendee(dad.event.id, attendee.accountId)
                            .then(function () {
                                dad.event.attendees.drbblyRemove(m => m.accountId === attendee.accountId);
                                dad.onUpdate();
                            })
                            .catch(function (e) {
                                drbblyCommonService.handleError(e);
                            })
                            .finally(() => attendee.isBusy = false);
                    }
                })
                .catch(function () {
                    //user cancelled, no action needed
                });
        };

        function loadPendingRequests() {
            drbblyEvtService.getJoinRequests(dad.eventId)
                .then(function (data) {
                    dad.isBusy = false;
                    dad.requestingAttendees = data;
                }, function (error) {
                    dad.isBusy = false;
                });
        }
    }
})();
