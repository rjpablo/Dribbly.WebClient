(function () {
    'use strict';

    angular.module('appModule')
        .service('drbblyPostsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Posts/';

                function getPosts(input) {
                    return drbblyhttpService.post(api + 'getPosts', input);
                }

                function getPost(postId) {
                    return drbblyhttpService.get(api + `getPost/${postId}`);
                }

                function addPost(postDetails) {
                    return drbblyhttpService.post(api + 'addPost', postDetails);
                }

                function addReaction(input) {
                    return drbblyhttpService.post(api + `addReaction`, input);
                }

                function removeReaction(input) {
                    return drbblyhttpService.post(api + `removeReaction`, input);
                }

                function updatePost(postDetails) {
                    return drbblyhttpService.post(api + 'updatePost', postDetails);
                }

                function deletePost(id) {
                    return drbblyhttpService.post(api + 'deletePost/' + id);
                }

                var _service = {
                    addPost,
                    addReaction,
                    deletePost,
                    getPost,
                    getPosts,
                    removeReaction,
                    updatePost
                };

                return _service;
            }]);

})();