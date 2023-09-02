﻿(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeamhome', {
            bindings: {
                app: '<',
                team: '<',
                onUpdate: '<'
            },
            controllerAs: 'thc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', 'drbblyFileService', '$stateParams', 'authService', 'permissionsService',
        'drbblyOverlayService', 'modalService', 'i18nService', 'drbblyTeamsService', 'drbblyGamesService',
        'drbblyCarouselhelperService'];
    function controllerFunc(constants, drbblyFileService, $stateParams, authService, permissionsService,
        drbblyOverlayService, modalService, i18nService, drbblyTeamsService, drbblyGamesService,
        drbblyCarouselhelperService) {
        var thc = this;

        thc.$onInit = function () {
            thc.teamId = $stateParams.id;
            thc.overlay = drbblyOverlayService.buildOverlay();
            thc.upcomingGamesOverlay = drbblyOverlayService.buildOverlay();
            thc.topPlayersOverlay = drbblyOverlayService.buildOverlay();
            thc.carouselSettings = drbblyCarouselhelperService.buildSettings();
            thc.isManager = authService.isCurrentAccountId(thc.team.addedById);
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
            thc.loadTopPlayers();
            thc.app.updatePageDetails({
                title: (thc.team.name) + ' - Home',
                image: thc.team.logo.url
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

        thc.loadTopPlayers = function () {
            thc.topPlayersOverlay.setToBusy();
            drbblyTeamsService.getTopPlayers(thc.teamId)
                .then(result => {
                    thc.topPlayersOverlay.setToReady();
                    thc.topPlayers = result;
                    thc.carouselSettings.enabled = true;
                })
                .catch(() => thc.topPlayersOverlay.setToError());
        }

        thc.edit = function () {
            drbblyTeamshelperService.editTeam(thc.team)
                .then(function () {
                    thc.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        thc.followTeam = function () {
            alert('Not yet implemented');
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
