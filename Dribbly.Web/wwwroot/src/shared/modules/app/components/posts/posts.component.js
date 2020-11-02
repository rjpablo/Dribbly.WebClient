﻿(function () {
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

    controllerFunc.$inject = ['authService', 'modalService', 'drbblyPostsService', 'constants'];
    function controllerFunc(authService, modalService, drbblyPostsService, constants) {
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
