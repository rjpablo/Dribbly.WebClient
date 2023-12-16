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

                function deleteComment(commentId) {
                    return drbblyhttpService.post(api + 'delete/' + commentId);
                }

                var _service = {
                    addComment,
                    deleteComment,
                    getComments
                };

                return _service;
            }]);

})();