(function () {
    'use strict';

    angular
        .module('appModule')
        .component('drbblyPosts', {
            bindings: {
                options: '<'
            },
            controllerAs: 'drl',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'modalService', 'drbblyPostsService', 'constants', 'drbblyCommonService'];
    function controllerFunc(authService, modalService, drbblyPostsService, constants, drbblyCommonService) {
        var drl = this;
        var _loadSize = 5;
        var _ceilingPostId;

        drl.$onInit = function () {
            drl.canPost = true; //TODO set value
            drl.posts = [];
            getPosts();
        };

        function getPosts() {
            var input = {
                postedOnType: drl.options.postedOnType,
                postedOnId: drl.options.postedOnId,
                getCount: _loadSize,
                ceilingPostId: _ceilingPostId
            };

            drl.isLoading = true;
            drbblyPostsService.getPosts(input)
                .then(function (posts) {
                    drl.isLoading = false;
                    if (posts && posts.length) {
                        posts.sort((a, b) => {
                            return a.dateAdded - b.dateAdded;
                        })
                        drl.posts.push(...posts);
                        drl.hasLoadedAll = posts.length < _loadSize;
                        _ceilingPostId = posts[posts.length - 1].id;
                    }
                    else {
                        drl.hasLoadedAll = true;
                    }
                }, function () {
                    drl.isLoading = false;
                });
        }

        drl.editPost = function () {
            return authService.checkAuthenticationThen(function () {
                return modalService.show({
                    view: '<drbbly-postdetailsmodal></drbbly-postdetailsmodal>',
                    model: {
                        isEdit: true,
                        post: drl.post
                    }
                }).then(function (result) {
                    if (result) {
                        drl.post.content = result.content;
                    }
                });
            });
        };

        drl.toggleDropdown = function (post) {
            post.isDropdownOpen = !post.isDropdownOpen;
        };

        drl.$onChanges = function (change) {
            if (change.reviews) {
                drl.currentSize = Math.min((change.reviews.currentValue || []).length, _loadSize);
                setDisplayedReviews();
            }
        };

        drl.loadMore = function () {
            getPosts();
        };

        drl.onPostDelete = function (post) {
            return modalService.confirm("app.DeletePostConfirmationMsg")
                .then(function (response) {
                    if (response) {
                        return drbblyPostsService.deletePost(post.id)
                            .then(function (result) {
                                if (result) {
                                    drl.posts.drbblyRemove(post);
                                }
                                return result;
                            })
                            .catch(function (error) {
                                drbblyCommonService.handleError(error);
                            })
                    }

                    return false;
                });
        };

        function setDisplayedReviews() {
            drl.displayedReviews = (drl.reviews || []).slice(0, drl.currentSize);
        }

        drl.createPost = function () {
            return authService.checkAuthenticationThen(function () {
                return modalService.show({
                    view: '<drbbly-postdetailsmodal></drbbly-postdetailsmodal>',
                    model: {
                        post: {
                            postedOnType: drl.options.postedOnType,
                            postedOnId: drl.options.postedOnId,
                            addedByType: constants.enums.entityType.Account //TODO temporary. Set this on the modal
                        }
                    }
                }).then(function (post) {
                    if (post) {
                        drl.posts.unshift(post);
                    }
                });
            });
        };
    }
})();
