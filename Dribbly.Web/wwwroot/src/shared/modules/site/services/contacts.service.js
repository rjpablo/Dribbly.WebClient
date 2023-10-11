(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyContactsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Contacts/';

                function sendVerificationCode(input) {
                    return drbblyhttpService.post(api + 'sendVerificationCode', input);
                }

                function verifyMobileNumber(input) {
                    return drbblyhttpService.post(api + 'verifyMobileNumber', input);
                }

                var _service = {
                    sendVerificationCode: sendVerificationCode,
                    verifyMobileNumber: verifyMobileNumber
                };

                return _service;

            }]);
})();