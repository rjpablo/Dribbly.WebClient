(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyBookingsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Bookings/';

                function getAll() {
                    return drbblyhttpService.get(api + 'getAll');
                }

                function getBooking(id) {
                    return drbblyhttpService.get(api + 'getBooking/' + id);
                }

                function updateBooking(BookingDetails) {
                    return drbblyhttpService.post(api + 'updateBooking', BookingDetails);
                }

                function addBooking(BookingDetails) {
                    return drbblyhttpService.post(api + 'addBooking', BookingDetails);
                }

                var _service = {
                    getAll: getAll,
                    getBooking: getBooking,
                    addBooking: addBooking,
                    updateBooking: updateBooking
                };

                return _service;
            }]);

})();