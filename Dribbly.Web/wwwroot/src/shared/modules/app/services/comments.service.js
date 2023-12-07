(function () {
    'use strict';

    angular.module('appModule')
        .service('drbblyCommentsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Comments/';

                function getComments(input) {
                    return drbblyhttpService.post(api + 'getComments', input);
                }

                function addComment(commentDetails) {
                    return drbblyhttpService.post(api + 'addComment', commentDetails);
                }

                var _service = {
                    addComment,
                    getComments
                };

                return _service;
            }]);

})();