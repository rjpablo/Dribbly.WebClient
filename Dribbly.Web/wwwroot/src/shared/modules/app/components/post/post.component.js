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

    controllerFunc.$inject = ['authService', 'modalService', 'permissionsService', 'constants', 'drbblyCommonService'];
    function controllerFunc(authService, modalService, permissionsService, constants, drbblyCommonService) {
        var drl = this;

        drl.$onInit = function () {

        };

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
            return drl.post.addedById === authService.authentication.userId;
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
