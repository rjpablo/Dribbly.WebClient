(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyEvtService', ['drbblyhttpService', 'authService', 'modalService',
            function (drbblyhttpService, authService, modalService) {
                var api = 'api/Events/';

                return {
                    cancelJoinRequest: function (eventId) {
                        return drbblyhttpService.post(api + 'cancelJoinRequest/' + eventId);
                    },
                    createEvent: function (input) {
                        return drbblyhttpService.post(api + 'createEvent', input);
                    },
                    getEventViewerData: function (eventId) {
                        return drbblyhttpService.get(api + 'getEventViewerData/' + eventId);
                    },
                    getEvents: function (input) {
                        return drbblyhttpService.post(api + 'getEvents/', input);
                    },
                    joinEvent: function (eventId) {
                        return drbblyhttpService.post(api + 'joinEvent/' + eventId);
                    },
                    leaveEvent: function (eventId) {
                        return drbblyhttpService.post(api + 'leaveEvent/' + eventId);
                    },
                    openEventDetailsModal: function (data) {
                        return authService.checkAuthenticationThen(function () {
                            return modalService.show({
                                view: '<drbbly-addeventmodal></drbbly-addeventmodal>',
                                model: data || {},
                                backdrop: 'static'
                            });
                        });
                    },
                    processJoinRequest: function (requestId, isApproved) {
                        return drbblyhttpService.post(api + `processJoinRequest/${requestId}/${isApproved}`);
                    },
                    removeAttendee: function (eventId, accountId) {
                        return drbblyhttpService.post(api + `removeAttendee/${eventId}/${accountId}`);
                    },
                    updateEvent: function (input) {
                        return drbblyhttpService.post(api + 'updateEvent', input);
                    }
                }
            }]);

})();