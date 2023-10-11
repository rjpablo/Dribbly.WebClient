(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGrouphome', {
            bindings: {
                app: '<',
                group: '<',
                onUpdate: '<'
            },
            controllerAs: 'ghc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', 'drbblyFileService', '$stateParams', 'authService', 'permissionsService',
        'drbblyOverlayService', 'modalService', 'i18nService', 'drbblyGroupsService', 'drbblyGamesService',
        'drbblyCarouselhelperService'];
    function controllerFunc(constants, drbblyFileService, $stateParams, authService, permissionsService,
        drbblyOverlayService, modalService, i18nService, drbblyGroupsService, drbblyGamesService,
        drbblyCarouselhelperService) {
        var ghc = this;

        ghc.$onInit = function () {
            ghc.groupId = $stateParams.id;
            ghc.overlay = drbblyOverlayService.buildOverlay();
            ghc.upcomingGamesOverlay = drbblyOverlayService.buildOverlay();
            ghc.topPlayersOverlay = drbblyOverlayService.buildOverlay();
            ghc.carouselSettings = drbblyCarouselhelperService.buildSettings();
            ghc.isManager = authService.isCurrentAccountId(ghc.group.addedById);
            ghc.postsOptions = {
                postedOnType: constants.enums.entityType.Group,
                postedOnId: ghc.group.id
            };
            ghc.overlay.setToBusy()
            ghc.isBusy = true
            ghc.app.updatePageDetails({
                title: (ghc.group.name) + ' - Home',
                image: ghc.group.iconUrl || constants.images.defaultGroupLogo.url
            });
            ghc.postsOptions = {
                postedOnType: constants.enums.entityTypeEnum.Group,
                postedOnId: ghc.group.id,
                title: 'Posts',
                addButtonLabel: 'Add a Post',
                emplyLabel: 'No posts found.',
                canPost: ghc.group.isAdmin
            };
        };

        ghc.edit = function () {
            drbblyGroupshelperService.editGroup(ghc.group)
                .then(function () {
                    ghc.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        ghc.followGroup = function () {
            alert('Not yet implemented');
        };

        ghc.onDeletePhoto = function (img, callback) {
            modalService.confirm('app.DeletePhotoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyGroupsService.deletePhoto(img.id, ghc.group.id)
                            .then(function () {
                                callback();
                            })
                            .catch(function (error) {
                                // TODO: display error in a toast
                                console.log('Error deleting photo', error);
                            });
                    }
                });
        };
    }
})();
