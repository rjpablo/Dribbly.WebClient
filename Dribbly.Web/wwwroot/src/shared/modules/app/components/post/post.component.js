(function () {
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

    controllerFunc.$inject = ['authService', 'modalService', 'permissionsService', 'constants', '$state', '$sce'];
    function controllerFunc(authService, modalService, permissionsService, constants, $state, $sce) {
        var drl = this;

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
            drl.galleryOptions = {
                hideCaptions: true,
                methods: drl.methods,
                imageAsBackdrop: false,
                inline: true,
                imgBubbles: true,
                bubbleSize: 30
            };
        };

        function setLink() {
            if (drl.post.addedBy.entityType === constants.enums.entityType.Court) {
                drl.link = $state.href('main.court.home', { id: drl.post.addedBy.id });
            }
            else if (drl.post.addedBy.entityType === constants.enums.entityType.Account) {
                drl.link = $state.href('main.account.home', { username: drl.post.addedBy.username });
            }
        };

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
            return drl.post.addedById === authService.authentication.userId
                && drl.post.type !== drl.postTypeEnum.GameCreated;
        };

        drl.canDelete = function () {
            return drl.post.addedById === authService.authentication.userId ||
                permissionsService.hasPermission('Post.DeleteNotOwned');
        };

        drl.deletePost = function () {
            drl.onDelete(drl.post)
                .finally(function () {
                    drl.isBusy = false;
                });
        };
    }
})();
