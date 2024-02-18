(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyEventhome', {
            bindings: {
                app: '<',
                event: '<',
                onUpdate: '<'
            },
            controllerAs: 'ghc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', 'drbblyFileService', '$stateParams', 'authService', 'permissionsService',
        'drbblyOverlayService', 'modalService', 'i18nService', 'drbblyEvtService', 'drbblyGamesService',
        'drbblyCarouselhelperService'];
    function controllerFunc(constants, drbblyFileService, $stateParams, authService, permissionsService,
        drbblyOverlayService, modalService, i18nService, drbblyEvtService, drbblyGamesService,
        drbblyCarouselhelperService) {
        var ghc = this;

        ghc.$onInit = function () {
            ghc.eventId = $stateParams.id;
            ghc.overlay = drbblyOverlayService.buildOverlay();
            ghc.upcomingGamesOverlay = drbblyOverlayService.buildOverlay();
            ghc.topPlayersOverlay = drbblyOverlayService.buildOverlay();
            ghc.carouselSettings = drbblyCarouselhelperService.buildSettings();
            ghc.isManager = authService.isCurrentAccountId(ghc.event.addedById);
            ghc.postsOptions = {
                postedOnType: constants.enums.entityType.Event,
                postedOnId: ghc.event.id
            };
            ghc.overlay.setToBusy()
            ghc.isBusy = true
            ghc.app.updatePageDetails({
                title: (ghc.event.name) + ' - Home',
                image: ghc.event.iconUrl || constants.images.defaultEventLogo.url
            });
            ghc.postsOptions = {
                postedOnType: constants.enums.entityTypeEnum.Event,
                postedOnId: ghc.event.id,
                title: 'Posts',
                addButtonLabel: 'Add a Post',
                emplyLabel: 'No posts found.',
                canPost: ghc.event.isAdmin
            };
        };

        ghc.$onChanges = (updates) => {
            console.log(updates);
        }

        ghc.getAttendees = (isApproved) => {
            return ghc.event.attendees.drbblyCount(a => a.isApproved === null || (isApproved && a.isApproved) || (!isApproved && !a.isApproved));
        }

        ghc.edit = function () {
            drbblyEventshelperService.editEvent(ghc.event)
                .then(function () {
                    ghc.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        ghc.followEvent = function () {
            alert('Not yet implemented');
        };

        ghc.onDeletePhoto = function (img, callback) {
            modalService.confirm('app.DeletePhotoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyEvtService.deletePhoto(img.id, ghc.event.id)
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
