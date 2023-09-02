(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamentsettings', {
            bindings: {
                app: '<',
                onUpdate: '<',
                tournament: '<'
            },
            controllerAs: 'tsc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTournamentsService', 'modalService', 'drbblyCommonService', 'constants',
        'authService', 'drbblyOverlayService', '$timeout'];
    function controllerFunc(drbblyTournamentsService, modalService, drbblyCommonService, constants,
        authService, drbblyOverlayService, $timeout) {
        var tsc = this;

        tsc.$onInit = function () {
            tsc.overlay = drbblyOverlayService.buildOverlay();
            tsc.stageOverlay = drbblyOverlayService.buildOverlay();
            tsc.isManager = tsc.tournament.addedById === authService.authentication.accountId;
            setDefaultCourtEntity();
            tsc.app.updatePageDetails({
                title: (tsc.tournament.name) + ' - Settings',
                image: tsc.tournament.logo.url
            });
        };

        tsc.edit = function () {
            tsc.selectedCourts = tsc.tournament.defaultCourt ?
                [{
                    text: tsc.tournament.defaultCourt.name,
                    value: tsc.tournament.defaultCourt.id,
                    iconUrl: tsc.tournament.defaultCourt.primaryPhoto ?
                        tsc.tournament.defaultCourt.primaryPhoto.url :
                        constants.images.defaultCourtLogoUrl
                }] : [];
            tsc.saveModel = { id: tsc.tournament.id };
            // Timeout Limits
            tsc.saveModel.totalTimeoutLimit = tsc.tournament.totalTimeoutLimit;
            tsc.saveModel.fullTimeoutLimit = tsc.tournament.fullTimeoutLimit;
            tsc.saveModel.shortTimeoutLimit = tsc.tournament.shortTimeoutLimit;

            // Foul Settings
            tsc.saveModel.personalFoulLimit = tsc.tournament.personalFoulLimit;
            tsc.saveModel.technicalFoulLimit = tsc.tournament.technicalFoulLimit;

            // Clock
            tsc.saveModel.isTimed = tsc.tournament.isTimed;
            tsc.saveModel.usesRunningClock = tsc.tournament.usesRunningClock;
            tsc.saveModel.overtimePeriodDuration = tsc.tournament.overtimePeriodDuration;
            tsc.saveModel.defaultShotClockDuration = tsc.tournament.defaultShotClockDuration;
            tsc.saveModel.offensiveRebondShotClockDuration = tsc.tournament.offensiveRebondShotClockDuration;

            // Period and Durations
            tsc.saveModel.numberOfRegulationPeriods = tsc.tournament.numberOfRegulationPeriods;
            tsc.saveModel.regulationPeriodDuration = tsc.tournament.regulationPeriodDuration;

            tsc.isEditing = true;
        };

        function setDefaultCourtEntity() {
            tsc.defaultCourtEntity = null;
            if (tsc.tournament.defaultCourt) {
                tsc.defaultCourtEntity = {
                    iconUrl: tsc.tournament.defaultCourt.primaryPhoto ?
                        tsc.tournament.defaultCourt.primaryPhoto.url :
                        constants.images.defaultCourtLogoUrl,
                    name: tsc.tournament.defaultCourt.name,
                    entityType: constants.enums.entityType.Court,
                    entityStatus: tsc.tournament.defaultCourt.entityStatus
                }
            }
        };

        tsc.cancelEditing = () => tsc.isEditing = false;

        tsc.saveChanges = async function () {
            tsc.isBusy = true;
            var confirmed = await modalService.confirm({
                bodyTemplate: `<p>Do you wish to apply the changes to existing games?</p>
                               <p>NOTE: Only games that have not started will be updated</p>`
            })
            tsc.saveModel.applyToGames = confirmed;
            var result = await drbblyTournamentsService.updateTournamentSettings(tsc.saveModel)
                .catch(error => drbblyCommonService.handleError(error));
            if (result) {
                if (tsc.saveModel.applyToGames) {
                    tsc.onUpdate()
                        .then(() => {
                            setDefaultCourtEntity();
                            tsc.isEditing = false;
                            tsc.isBusy = false;
                        });
                }
                else {
                    applyChanges(result);
                    tsc.isEditing = false;
                    tsc.isBusy = false;
                }
            }
            else {
                tsc.isBusy = false;
            }
        }

        function applyChanges(changes) {
            tsc.defaultCourt = changes.defaultCourt;

            // Timeout Limits
            tsc.tournament.totalTimeoutLimit = changes.totalTimeoutLimit;
            tsc.tournament.fullTimeoutLimit = changes.fullTimeoutLimit;
            tsc.tournament.shortTimeoutLimit = changes.shortTimeoutLimit;

            // Foul Settings
            tsc.tournament.personalFoulLimit = changes.personalFoulLimit;
            tsc.tournament.technicalFoulLimit = changes.technicalFoulLimit;

            // Clock
            tsc.tournament.isTimed = changes.isTimed;
            tsc.tournament.usesRunningClock = changes.usesRunningClock;
            tsc.tournament.overtimePeriodDuration = changes.overtimePeriodDuration;
            tsc.tournament.defaultShotClockDuration = changes.defaultShotClockDuration;
            tsc.tournament.offensiveRebondShotClockDuration = changes.offensiveRebondShotClockDuration;

            // Period and Durations
            tsc.tournament.numberOfRegulationPeriods = changes.numberOfRegulationPeriods;
            tsc.tournament.regulationPeriodDuration = changes.regulationPeriodDuration;

            setDefaultCourtEntity();
        }

        tsc.typeAheadConfig = {
            entityTypes: [constants.enums.entityType.Court]
        };
    }
})();
