(function () {
    'use strict';

    angular.module('appModule')
        .service('drbblyPostsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Posts/';

                function getPosts(input) {
                    return drbblyhttpService.post(api + 'getPosts', input);
                }

                function addPost(postDetails) {
                    return drbblyhttpService.post(api + 'addPost', postDetails);
                }

                function updatePost(postDetails) {
                    return drbblyhttpService.post(api + 'updatePost', postDetails);
                }

                var _service = {
                    getPosts: getPosts,
                    addPost: addPost,
                    updatePost: updatePost,
                };

                return _service;
            }]);

})();