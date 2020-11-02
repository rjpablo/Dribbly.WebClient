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

                function deletePost(id) {
                    return drbblyhttpService.post(api + 'deletePost/' + id);
                }

                var _service = {
                    addPost: addPost,
                    deletePost: deletePost,
                    getPosts: getPosts,
                    updatePost: updatePost,
                };

                return _service;
            }]);

})();