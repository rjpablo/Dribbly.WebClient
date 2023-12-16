﻿(function () {
    'use strict';

    angular
        .module('appModule')
        .component('drbblyPost', {
            bindings: {
                post: '<',
                options: '<',
                onDelete: '<'
            },
            controllerAs: 'drl',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'modalService', 'permissionsService', 'constants', '$state', '$sce',
        'drbblyPostsService', 'drbblyCommonService', 'drbblyCommentsService', 'drbblyDatetimeService'];
    function controllerFunc(authService, modalService, permissionsService, constants, $state, $sce,
        drbblyPostsService, drbblyCommonService, drbblyCommentsService, drbblyDatetimeService) {
        var drl = this;
        var _commentsPage

        drl.$onInit = function () {
            drl.postTypeEnum = constants.enums.postTypeEnum;
            drl.methods = {};
            drl.post.additionalData = JSON.parse(drl.post.additionalData);
            if (!drl.post.addedBy.iconUrl) {
                drl.post.addedBy.iconUrl = constants.images.defaultProfilePhoto.url;
            }
            if (drl.post.embedCode) {
                drl.embedCode = $sce.trustAsHtml(drl.post.embedCode);
            }
            setLink();
            drl.files = drl.post.files.map(f => f.file);
            drl.post.files.sort((a, b) => a.order - b.order);
            drl.reactionCount = drl.post.reactions.length
            drl.liked = drl.post.reactions.drbblyAny(r => r.reactorId === authService.authentication.accountId)
            drl.galleryOptions = {
                hideCaptions: true,
                methods: drl.methods,
                imageAsBackdrop: false,
                inline: true,
                imgBubbles: true,
                bubbleSize: 30
            };
            drl.getCommentsInput = {
                commentedOnType: constants.enums.entityTypeEnum.Post,
                commentedOnId: drl.post.id,
                pageSize: 2,
                page: 0,
                afterDate: null
            };
            drl.comments = [];
            drl.loadComments();
        };

        function setLink() {
            if (drl.post.addedBy.entityType === constants.enums.entityType.Court) {
                drl.link = $state.href('main.court.home', { id: drl.post.addedBy.id });
            }
            else if (drl.post.addedBy.entityType === constants.enums.entityType.Account) {
                drl.link = $state.href('main.account.home', { username: drl.post.addedBy.username });
            }
        };

        drl.loadComments = function () {
            drl.getCommentsInput.page++;
            drl.loadingComments = true;
            drbblyCommentsService.getComments(drl.getCommentsInput)
                .then(comments => {
                    comments = comments.map(c => {
                        return { ...c, dateAdded: drbblyDatetimeService.toUtcString(c.dateAdded) };
                    })
                    drl.comments.push(...comments);
                    drl.hasMoreComments = comments.length == drl.getCommentsInput.pageSize;
                    drl.getCommentsInput.pageSize = 5;
                    if (comments.length > 0) {
                        drl.getCommentsInput.afterDate = drbblyDatetimeService.toUtcDate(comments[comments.length - 1].dateAdded);
                    }
                })
                .catch(e => drbblyCommonService.handleError(e))
                .finally(() => drl.loadingComments = false);
        }

        drl.postComment = () => {
            drl.isBusy = true;
            var comment = {
                commentedOnType: constants.enums.entityTypeEnum.Post,
                commentedOnId: drl.post.id,
                message: drl.message
            };

            drbblyCommentsService.addComment(comment)
                .then(comment => {
                    drl.message = '';
                    drl.comments.unshift(comment);
                })
                .catch(e => drbblyCommonService.handleError(e))
                .finally(() => drl.isBusy = false);
        }

        drl.showReactors = function () {
            modalService.show({
                view: '<drbbly-accountlistmodal></drbbly-accountlistmodal>',
                model: {
                    accounts: drl.post.reactions.map(r => r.reactor)
                },
                size: 'sm'
            })
        }

        drl.toggleLike = function () {
            drl.liked = !drl.liked;
            drl.reactionCount += drl.liked ? 1 : -1;
            drl.isBusy = true;
            var method = drl.liked ? drbblyPostsService.addReaction : drbblyPostsService.removeReaction;
            method({
                postId: drl.post.id,
                reactionType: constants.enums.reactionTypeEnum.Like
            })
                .catch((e) => {
                    drl.reactionCount += drl.liked ? -1 : 1;
                    drl.liked = !drl.liked;
                    drbblyCommonService.handleError(e);
                })
                .finally(() => drl.isBusy = false);
        }

        drl.editPost = function () {
            return authService.checkAuthenticationThen(function () {
                return modalService.show({
                    view: '<drbbly-postdetailsmodal></drbbly-postdetailsmodal>',
                    model: {
                        isEdit: true,
                        post: drl.post
                    },
                    backdrop: 'static'
                }).then(function (result) {
                    if (result) {
                        drl.post = result;
                        drl.post.additionalData = JSON.parse(drl.post.additionalData);
                        drl.files.length = 0;
                        drl.post.files.forEach(f => drl.files.push(f.file));
                        drl.post.files.sort((a, b) => a.order - b.order);
                        if (drl.onUpdate) {
                            drl.onUpdate(drl.post);
                        }
                    }
                });
            });
        };

        drl.shouldShowMenu = function () {
            return drl.canEdit() || drl.canDelete();
        };

        drl.canEdit = function () {
            return drl.post.addedById === authService.authentication.accountId
                && drl.post.type !== drl.postTypeEnum.GameCreated;
        };

        drl.canDelete = function () {
            return drl.post.addedById === authService.authentication.accountId ||
                permissionsService.hasPermission('Post.DeleteNotOwned');
        };

        drl.deletePost = function () {
            drl.onDelete(drl.post)
                .finally(function () {
                    drl.isBusy = false;
                });
        };

        drl.deleteComment = function (comment) {
            modalService.confirm({
                msg1Raw: 'Delete this comment?'
            })
                .then(function (result) {
                    if (result) {
                        drbblyCommentsService.deleteComment(comment.id)
                            .then(() => {
                                drl.comments.drbblyRemove(c => c.id == comment.id);
                            })
                            .catch(drbblyCommonService.handleError());
                    }
                })
                .catch(function () {
                    // user cancelled. Do nothing
                });
        };
    }
})();
