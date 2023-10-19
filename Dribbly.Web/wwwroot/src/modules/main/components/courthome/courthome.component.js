(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourthome', {
            bindings: {
                court: '<',
                onUpdate: '<',
                app: '<'
            },
            controllerAs: 'dcd',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'drbblyGamesService', 'drbblyAccountsService', '$stateParams', 'i18nService',
        'drbblyOverlayService', 'drbblyCourtsService', 'drbblyCarouselhelperService', 'permissionsService', 'modalService',
        'drbblyGameshelperService', '$state', 'constants'];
    function controllerFunc(authService, drbblyGamesService, drbblyAccountsService, $stateParams, i18nService,
        drbblyOverlayService, drbblyCourtsService, drbblyCarouselhelperService, permissionsService, modalService,
        drbblyGameshelperService, $state, constants) {
        var dcd = this;
        var _priceComponent;

        dcd.$onInit = function () {
            dcd.courtId = $stateParams.id;
            dcd.overlay = drbblyOverlayService.buildOverlay();
            dcd.localPlayersOverlay = drbblyOverlayService.buildOverlay();
            dcd.upcomingGamesOverlay = drbblyOverlayService.buildOverlay();
            dcd.carouselSettings = drbblyCarouselhelperService.buildSettings();
            dcd.isOwned = authService.isCurrentAccountId(dcd.court.ownerId);
            dcd.mapOptions = {
                id: 'location-picker-map',
                height: '300px'
            };
            dcd.postsOptions = {
                postedOnType: constants.enums.entityType.Court,
                postedOnId: dcd.courtId
            };
            dcd.loadUpcomingGames();
            dcd.loadLocalPlayersInput = {
                courtIds: [dcd.courtId],
                pageSize: 10,
                page: 1
            };
            dcd.localPlayers = [];
            dcd.loadLocalPlayers();
            dcd.overlay.setToReady();
            dcd.app.updatePageDetails({
                title: dcd.court.name + ' - Home',
                image: (dcd.court.primaryPhoto || constants.images.defaultCourtLogo).url
            });
        };

        dcd.onMapReady = function () {
            this.addMarkers([dcd.court]);
        };

        dcd.editDescription = function () {
            dcd.isEditingDescription = true;
            dcd.tempDescription = dcd.court.additionalInfo;
        };

        dcd.loadUpcomingGames = function () {
            var input = {
                courtIds: [dcd.courtId],
                upcomingOnly: true
            };
            dcd.upcomingGamesOverlay.setToBusy();
            drbblyGamesService.getGames(input)
                .then(result => {
                    dcd.upcomingGamesOverlay.setToReady();
                    dcd.upcomingGames = result;
                })
                .catch(() => dcd.upcomingGamesOverlay.setToError());
        }

        dcd.loadLocalPlayers = function () {
            dcd.localPlayersOverlay.setToBusy('');
            drbblyAccountsService.getPlayers(dcd.loadLocalPlayersInput)
                .then(result => {
                    dcd.localPlayersOverlay.setToReady();
                    dcd.loadLocalPlayersInput.page++;
                    dcd.localPlayers = dcd.localPlayers.concat(result);
                    dcd.allLocalPlayersLoaded = result.length < dcd.loadLocalPlayersInput.pageSize;
                })
                .catch(() => dcd.localPlayersOverlay.setToError());
        }

        dcd.updateDescription = function () {
            dcd.isBusy = true;
            drbblyCourtsService.updateCourtProperties({ id: dcd.court.id, properties: { "AdditionalInfo": dcd.tempDescription } })
                .then(function () {
                    dcd.court.additionalInfo = dcd.tempDescription;
                })
                .catch(function () {
                    //TODO: handle error
                })
                .finally(function () {
                    dcd.isBusy = false;
                    dcd.isEditingDescription = false;
                });
        }
    }
})();
