(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamentstages', {
            bindings: {
                app: '<',
                tournament: '<'
            },
            controllerAs: 'tsc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTournamentsService', 'modalService', 'drbblyCommonService', 'drbblyCourtshelperService',
        'authService', 'drbblyOverlayService'];
    function controllerFunc(drbblyTournamentsService, modalService, drbblyCommonService, drbblyCourtshelperService,
        authService, drbblyOverlayService) {
        var tsc = this;

        tsc.$onInit = function () {
            tsc.overlay = drbblyOverlayService.buildOverlay();
            loadStages();
        };

        function loadStages() {
            tsc.isBusy = true;
            drbblyTournamentsService.getTournamentStages(tsc.tournament.id)
                .then(function (stages) {
                    tsc.tournament.stages = stages;
                })
                .catch(error => drbblyCommonService.handleError(error))
                .finally(() => tsc.isBusy = false);
        }

        tsc.addStage = function () {
            modalService.show({
                view: '<drbbly-addstagemodal></drbbly-addstagemodal>',
                model: {
                    tournament: tsc.tournament
                }
            })
                .then(loadStages)
                .catch(function () { /* do nothing */ })
        };

        tsc.canDeleteItem = function (stage) {
            return tsc.tournament.addedById === authService.authentication.userId;
        }

        tsc.canEditItem = function (stage) {
            return tsc.tournament.addedById === authService.authentication.userId;
        }
    }
})();
