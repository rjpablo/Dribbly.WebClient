(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyCourtshelperService', ['modalService', 'authService', 'mapService',
            function (modalService, authService, mapService) {

                function registerCourt(data) {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-addeditcourtmodal></drbbly-addeditcourtmodal>',
                            model: data
                        });
                    });
                }

                function editCourt(court) {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-addeditcourtmodal></drbbly-addeditcourtmodal>',
                            model: { court: court },
                            options: { isEdit: true }
                        });
                    });
                }

                function openBookingDetailsModal(booking, options) {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-bookingdetailsmodal></drbbly-bookingdetailsmodal>',
                            model: {
                                booking: booking
                            },
                            options: options
                        });
                    });
                }

                function populateDistance(courts, refLatLng) {
                    angular.forEach(courts, function (court) {
                        court.distance = mapService
                            .computeDistanceBetween(refLatLng, court);
                    });
                }

                var _service = {
                    editCourt: editCourt,
                    openBookingDetailsModal: openBookingDetailsModal,
                    populateDistance: populateDistance,
                    registerCourt: registerCourt
                };

                return _service;
            }]);

})();