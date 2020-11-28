(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeamhome', {
            bindings: {
                team: '<',
                onUpdate: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', 'drbblyFileService', '$stateParams', 'authService', 'permissionsService',
        'drbblyOverlayService', 'modalService', 'drbblyFooterService', '$timeout', 'drbblyTeamsService',
        'drbblyCommonService'];
    function controllerFunc(constants, drbblyFileService, $stateParams, authService, permissionsService,
        drbblyOverlayService, modalService, drbblyFooterService, $timeout, drbblyTeamsService,
        drbblyCommonService) {
        var dad = this;
        var _priceComponent;

        dad.$onInit = function () {
            dad.teamId = $stateParams.id;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.isOwned = authService.isCurrentUserId(dad.team.addedById);
            dad.team.logo = dad.team.logo || getDefaultLogo();
            dad.team.photos = dad.team.photos || [];
            dad.team.photos.push(dad.team.logo);
            dad.postsOptions = {
                postedOnType: constants.enums.entityType.Team,
                postedOnId: dad.team.id
            };
            loadTeam();
        };

        function getDefaultLogo() {
            return {
                url: '../../../../../' + constants.images.defaultProfilePhotoUrl
            };
        }

        function loadTeam() {
            dad.overlay.setToBusy();
            $timeout(dad.overlay.setToReady, 500);
        }

        dad.edit = function () {
            drbblyTeamshelperService.editTeam(dad.team)
                .then(function () {
                    dad.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        dad.onLogoClick = function () {
            var options = {
                items: [{
                    textKey: 'app.ViewPrimaryPhoto',
                    action: viewPrimaryPhoto
                }]
            };
            if (dad.isOwned || permissionsService.hasPermission('Team.UpdatePhotoNotOwned')) {
                options.items.push({
                    textKey: 'app.ReplacePrimaryPhoto',
                    action: function () {
                        angular.element('#btn-replace-photo').triggerHandler('click');
                    }
                });
            }
            if (options.items.length) {
                modalService.showOptionsList(options);
            }
        };

        function viewPrimaryPhoto() {
            var primaryPhotoIndex = dad.team.photos.findIndex(value => value.id === dad.team.logoId);
            dad.methods.open(primaryPhotoIndex);
            //drbblyTeamsService.getTeamPhotos(dad.team.id)
            //    .then(function (photos) {
            //        dad.team.photos = massagePhotos(photos);
            //    })
            //    .catch(function (error) {
            //        // TODO: display error in a toast
            //    });
        }

        function massagePhotos(photos) {
            var canDeleteNotOwned = permissionsService.hasPermission('Team.DeletePhotoNotOwned');
            angular.forEach(photos, function (photo) {
                photo.deletable = photo.id !== dad.team.logoId &&
                    (dad.isOwned || canDeleteNotOwned);
            });
            return photos;
        }

        dad.joinTeam = function () {
            alert('Not yet implemented');
        };

        dad.followTeam = function () {
            alert('Not yet implemented');
        };

        dad.onPrimaryPhotoSelect = function (file) {
            if (!file) { return; }
            drbblyFileService.upload(file, 'api/team/uploadPrimaryPhoto/' + dad.team.id)
                .then(function (result) {
                    if (result && result.data) {
                        dad.team.logo = result.data;
                        dad.team.logoId = result.data.id;
                        dad.onUpdate();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        };

        dad.onDeletePhoto = function (img, callback) {
            modalService.confirm('app.DeletePhotoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyTeamsService.deletePhoto(img.id, dad.team.id)
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
