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
        'drbblyOverlayService', 'modalService', 'i18nService', 'drbblyTeamsService'];
    function controllerFunc(constants, drbblyFileService, $stateParams, authService, permissionsService,
        drbblyOverlayService, modalService, i18nService, drbblyTeamsService) {
        var dad = this;

        dad.$onInit = function () {
            dad.teamId = $stateParams.id;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.isOwned = authService.isCurrentAccountId(dad.team.addedById);
            dad.postsOptions = {
                postedOnType: constants.enums.entityType.Team,
                postedOnId: dad.team.id
            };
            dad.overlay.setToBusy()
            dad.isBusy = true;
            drbblyTeamsService.getUserTeamRelation(dad.teamId)
                .then(function (data) {
                    dad.isBusy = false;
                    dad.userTeamRelation = data;
                    dad.overlay.setToReady();
                }, function (error) {
                    dad.overlay.setToError();
                    dad.isBusy = false;
                });
        };

        dad.leaveTeam = function () {
            dad.isBusy = true;
            return modalService.confirm({
                msg1Raw: i18nService.getString('app.LeaveTeamConfirmationPrompt', { teamName: dad.team.name })
            })
                .then(function (result) {
                    if (result) {
                        return authService.checkAuthenticationThen(function () {
                            return drbblyTeamsService.leaveTeam(dad.teamId)
                                .then(function (result) {
                                    dad.userTeamRelation = result;
                                    dad.isBusy = false;
                                }, function () {
                                    dad.isBusy = false;
                                });
                        }, function () { dad.isBusy = false; });
                    }
                })
                .finally(function () {
                    dad.isBusy = false;
                });
        };

        dad.cancelJoinRequest = function () {
            dad.isBusy = true;
            drbblyTeamsService.cancelJoinRequest(dad.teamId)
                .then(function () {
                    dad.userTeamRelation.hasPendingJoinRequest = false;
                    dad.isBusy = false;
                }, function () {
                    dad.isBusy = false;
                });
        };

        dad.edit = function () {
            drbblyTeamshelperService.editTeam(dad.team)
                .then(function () {
                    dad.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        dad.onLogoClick = function () {
            var options = {
                items: []
            };
            if (!dad.team.logo.isDefault) {
                options.items.push({
                    textKey: 'app.ViewLogo',
                    action: viewLogo
                });
            }
            if (dad.isOwned || permissionsService.hasPermission('Team.UpdatePhotoNotOwned')) {
                options.items.push({
                    textKey: 'app.ReplaceLogo',
                    action: function () {
                        angular.element('#btn-replace-photo').triggerHandler('click');
                    }
                });
                modalService.showOptionsList(options);
            }
            else if (!dad.team.logo.isDefault) {
                viewLogo();
            }
        };

        function viewLogo() {
            var logoIndex = dad.team.photos.findIndex(value => value.id === dad.team.logoId);
            dad.methods.open(logoIndex);
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
            dad.isBusy = true;
            return authService.checkAuthenticationThen(function () {
                return modalService.show({
                    view: '<drbbly-jointeammodal></drbbly-jointeammodal>',
                    model: { teamName: dad.team.name, teamId: dad.team.id },
                    size: 'sm'
                })
                    .then(function (result) {
                        dad.userTeamRelation = result;
                        dad.isBusy = false;
                    })
                    .catch(function () {
                        dad.isBusy = false;
                    });
            }, function () { dad.isBusy = false; })
                .catch(function () {
                    dad.isBusy = false;
                });;
        };

        dad.followTeam = function () {
            alert('Not yet implemented');
        };

        dad.onLogoSelect = function (file) {
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
                    drbblyFileService.upload(imageData, 'api/teams/uploadLogo/' + dad.team.id)
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
                })
                .finally(function () {
                    URL.revokeObjectURL(url)
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
