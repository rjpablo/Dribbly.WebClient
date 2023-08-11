(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtviewercontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dcc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtsService', 'permissionsService', 'drbblyCourtshelperService',
        'drbblyOverlayService', '$stateParams', 'drbblyFooterService', '$scope', '$state', 'authService',
        'drbblyGameshelperService', 'i18nService', 'modalService', 'drbblyFileService'];
    function controllerFunc(drbblyCourtsService, permissionsService, drbblyCourtshelperService,
        drbblyOverlayService, $stateParams, drbblyFooterService, $scope, $state, authService,
        drbblyGameshelperService, i18nService, modalService, drbblyFileService) {
        var dcc = this;
        var _courtId;
        var _priceComponent;

        dcc.$onInit = function () {
            _courtId = $stateParams.id;
            dcc.courtsDetailsOverlay = drbblyOverlayService.buildOverlay();
            loadCourt();
            buildSubPages();
        };

        dcc.$onDestroy = function () {
            _priceComponent.remove();
            dcc.app.toolbar.clearNavItems();
        };

        function loadCourt() {
            dcc.courtsDetailsOverlay.setToBusy();
            drbblyCourtsService.getCourt(_courtId)
                .then(function (data) {
                    dcc.court = data;
                    dcc.isOwned = authService.isCurrentAccountId(dcc.court.ownerId);
                    dcc.courtsDetailsOverlay.setToReady();
                    createPriceComponent();
                    dcc.app.mainDataLoaded();
                })
                .catch(dcc.courtsDetailsOverlay.setToError);
        }

        dcc.onCourtUpdate = function () {
            loadCourt();
        };

        function createPriceComponent() {

            if (_priceComponent) {
                _priceComponent.remove();
            }

            _priceComponent = drbblyFooterService.addFooterItem({
                scope: $scope,
                template: '<drbbly-courtprice court="dcc.court"></dribbly-courtprice>'
            });
        }

        dcc.onPrimaryPhotoClick = function () {
            drbblyCourtsService.getCourtPhotos(dcc.courtId)
                .then(function (photos) {
                    dcc.photos = massagePhotos(photos);
                    var primaryPhotoIndex = dcc.photos.findIndex(photo => photo.id === dcc.court.primaryPhoto.id);
                    dcc.methods.open(primaryPhotoIndex);
                })
                .catch(function (error) {
                    // TODO: Display error in toast
                });
        };

        dcc.deleteCourt = function () {
            modalService.confirm({ msg1Key: 'app.DeleteCourtPrompt' })
                .then(function (result) {
                    if (result) {
                        drbblyCourtsService.deleteCourt(dcc.court.id)
                            .then(function () {
                                $state.go('main.home', { reload: true });
                            });
                    }
                });
        };

        function massagePhotos(photos) {
            var canDeleteNotOwned = permissionsService.hasPermission('Court.DeletePhotoNotOwned');
            for (var i = 0; i < photos.length; i++) {
                photos[i].deletable = photos[i].id !== dcc.court.primaryPhoto.id &&
                    (dcc.isOwned || canDeleteNotOwned);
            }
            return photos;
        }

        dcc.addGame = function () {
            drbblyGameshelperService.openAddEditGameModal({ courtId: dcc.courtId })
                .then(function (game) {
                    if (game) {
                        $state.go('main.game.details', { id: game.id });
                    }
                })
                .catch(function () { /* do nothing */ })
        };

        dcc.showContact = function () {
            if (dcc.court.contact) {
                var template = i18nService.getString('app.PleaseContactTheFollowingNumberForInquiries',
                    { number: dcc.court.contact.number });
                modalService.alert({ bodyTemplate: template });
            }
            else {
                modalService.alert('app.CourtNoContact');
            }
        };

        dcc.follow = function () {
            dcc.isBusy = true;
            drbblyCourtsService.followCourt(dcc.court.id, !dcc.court.isFollowed)
                .then(function (result) {
                    dcc.isBusy = false;
                    if (result.isSuccessful) {
                        dcc.court.isFollowed = !dcc.court.isFollowed;
                        dcc.court.followerCount = result.newFollowerCount;
                    }
                    else {
                        dcc.court.isFollowed = result.isAlreadyFollowing;
                        //TODO show error
                        console.log('Failed to save court following');
                    }
                }, function (error) {
                    dcc.isBusy = false;
                    console.log('FollowCourt Failed', error);
                });
        };

        dcc.deletePhoto = function (photo, done) {
            modalService.confirm('app.DeletePhotoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyCourtsService.deletePhoto(dcc.courtId, photo.id)
                            .then(function () {
                                done();
                            })
                            .catch(function (error) {
                                // TODO: Display error in toast
                            });
                    }
                });
        };

        dcc.edit = function () {
            drbblyCourtshelperService.editCourt(dcc.court)
                .then(function () {
                    dcc.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        dcc.changePrimaryPicture = function (file) {
            if (!file) { return; }
            drbblyFileService.upload(file, 'api/courts/updateCourtPhoto/' + dcc.court.id)
                .then(function (result) {
                    //loadCourt();
                    dcc.onUpdate();
                })
                .catch(function (error) {
                    console.log(error);
                });
        };

        function buildSubPages() {
            dcc.app.toolbar.setNavItems([
                {
                    textKey: 'site.Home',
                    targetStateName: 'main.court.home',
                    targetStateParams: { id: _courtId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Details',
                    targetStateName: 'main.court.details',
                    targetStateParams: { id: _courtId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'site.Games',
                    targetStateName: 'main.court.games',
                    targetStateParams: { id: _courtId }
                },
                {
                    textKey: 'app.Photos',
                    targetStateName: 'main.court.photos',
                    targetStateParams: { id: _courtId }
                },
                {
                    textKey: 'site.Videos',
                    targetStateName: 'main.court.videos',
                    targetStateParams: { id: _courtId }
                },
                {
                    textKey: 'site.Bookings',
                    isRemoved: true,
                    targetStateName: 'main.court.bookings',
                    targetStateParams: { id: _courtId }
                },
                {
                    textKey: 'site.Schedule',
                    isRemoved: true,
                    targetStateName: 'main.court.schedule',
                    targetStateParams: { id: _courtId }
                },
                {
                    textKey: 'site.Reviews',
                    isRemoved: true,
                    targetStateName: 'main.court.reviews',
                    targetStateParams: { id: _courtId }
                }
            ]);
        }
    }
})();
