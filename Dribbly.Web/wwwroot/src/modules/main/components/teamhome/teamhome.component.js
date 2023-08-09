(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeamhome', {
            bindings: {
                team: '<',
                onUpdate: '<'
            },
            controllerAs: 'thc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', 'drbblyFileService', '$stateParams', 'authService', 'permissionsService',
        'drbblyOverlayService', 'modalService', 'i18nService', 'drbblyTeamsService', 'drbblyGamesService'];
    function controllerFunc(constants, drbblyFileService, $stateParams, authService, permissionsService,
        drbblyOverlayService, modalService, i18nService, drbblyTeamsService, drbblyGamesService) {
        var thc = this;

        thc.$onInit = function () {
            thc.teamId = $stateParams.id;
            thc.overlay = drbblyOverlayService.buildOverlay();
            thc.upcomingGamesOverlay = drbblyOverlayService.buildOverlay();
            thc.isOwned = authService.isCurrentAccountId(thc.team.addedById);
            thc.postsOptions = {
                postedOnType: constants.enums.entityType.Team,
                postedOnId: thc.team.id
            };
            thc.overlay.setToBusy()
            thc.isBusy = true;
            drbblyTeamsService.getUserTeamRelation(thc.teamId)
                .then(function (data) {
                    thc.isBusy = false;
                    thc.userTeamRelation = data;
                    thc.overlay.setToReady();
                }, function (error) {
                    thc.overlay.setToError();
                    thc.isBusy = false;
                });
            thc.loadUpcomingGames();
        };

        thc.leaveTeam = function () {
            thc.isBusy = true;
            return modalService.confirm({
                msg1Raw: i18nService.getString('app.LeaveTeamConfirmationPrompt', { teamName: thc.team.name })
            })
                .then(function (result) {
                    if (result) {
                        return authService.checkAuthenticationThen(function () {
                            return drbblyTeamsService.leaveTeam(thc.teamId)
                                .then(function (result) {
                                    thc.userTeamRelation = result;
                                    thc.isBusy = false;
                                }, function () {
                                    thc.isBusy = false;
                                });
                        }, function () { thc.isBusy = false; });
                    }
                })
                .finally(function () {
                    thc.isBusy = false;
                });
        };

        thc.loadUpcomingGames = function () {
            var input = {
                teamIds: [thc.teamId],
                upcomingOnly: true
            };
            thc.upcomingGamesOverlay.setToBusy();
            drbblyGamesService.getGames(input)
                .then(result => {
                    thc.upcomingGamesOverlay.setToReady();
                    thc.upcomingGames = result;
                })
                .catch(() => thc.upcomingGamesOverlay.setToError());
        }

        thc.cancelJoinRequest = function () {
            thc.isBusy = true;
            drbblyTeamsService.cancelJoinRequest(thc.teamId)
                .then(function () {
                    thc.userTeamRelation.hasPendingJoinRequest = false;
                    thc.isBusy = false;
                }, function () {
                    thc.isBusy = false;
                });
        };

        thc.edit = function () {
            drbblyTeamshelperService.editTeam(thc.team)
                .then(function () {
                    thc.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        thc.onLogoClick = function () {
            if (!thc.isOwned) {
                viewLogo();
                return;
            }

            modalService.showMenuModal({
                model: {
                    buttons: [
                        {
                            text: 'View Logo',
                            action: viewLogo,
                            class: 'btn-secondary'
                        },
                        {
                            text: 'ReplaceLogo',
                            action: function () {
                                angular.element('#btn-replace-photo').triggerHandler('click');
                            },
                            isHidden: () => !thc.isOwned,
                            class: 'btn-secondary'
                        }
                    ],
                    hideHeader: true
                },
                size: 'sm',
                backdrop: true
            });
        };

        function viewLogo() {
            var logoIndex = thc.team.photos.findIndex(value => value.id === thc.team.logoId);
            thc.methods.open(logoIndex);
            //drbblyTeamsService.getTeamPhotos(thc.team.id)
            //    .then(function (photos) {
            //        thc.team.photos = massagePhotos(photos);
            //    })
            //    .catch(function (error) {
            //        // TODO: display error in a toast
            //    });
        }

        function massagePhotos(photos) {
            var canDeleteNotOwned = permissionsService.hasPermission('Team.DeletePhotoNotOwned');
            angular.forEach(photos, function (photo) {
                photo.deletable = photo.id !== thc.team.logoId &&
                    (thc.isOwned || canDeleteNotOwned);
            });
            return photos;
        }

        thc.joinTeam = function () {
            thc.isBusy = true;
            return authService.checkAuthenticationThen(function () {
                return modalService.show({
                    view: '<drbbly-jointeammodal></drbbly-jointeammodal>',
                    model: { teamName: thc.team.name, teamId: thc.team.id },
                    size: 'sm'
                })
                    .then(function (result) {
                        thc.userTeamRelation = result;
                        thc.isBusy = false;
                    })
                    .catch(function () {
                        thc.isBusy = false;
                    });
            }, function () { thc.isBusy = false; })
                .catch(function () {
                    thc.isBusy = false;
                });;
        };

        thc.followTeam = function () {
            alert('Not yet implemented');
        };

        thc.onLogoSelect = function (file) {
            if (!file) { return; }

            var url = URL.createObjectURL(file);

            return modalService.show({
                view: '<drbbly-croppermodal></drbbly-croppermodal>',
                model: {
                    imageUrl: url,
                    cropperOptions: {
                        aspectRatio: 1
                    }
                }
            })
                .then(function (imageData) {
                    var fileNameNoExt = (file.name.split('\\').pop().split('/').pop().split('.'))[0]
                    imageData.name = fileNameNoExt + '.png';
                    drbblyFileService.upload(imageData, 'api/teams/uploadLogo/' + thc.team.id)
                        .then(function (result) {
                            if (result && result.data) {
                                thc.team.logo = result.data;
                                thc.team.logoId = result.data.id;
                                thc.onUpdate();
                            }
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                })
                .finally(function () {
                    URL.revokeObjectURL(url)
                });
        };

        thc.onDeletePhoto = function (img, callback) {
            modalService.confirm('app.DeletePhotoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyTeamsService.deletePhoto(img.id, thc.team.id)
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
