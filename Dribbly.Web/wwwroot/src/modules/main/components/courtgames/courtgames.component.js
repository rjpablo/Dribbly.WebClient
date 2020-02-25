(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtgames', {
            bindings: {
                app: '<'
            },
            controllerAs: 'cgc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtsService', '$stateParams'];
    function controllerFunc(drbblyCourtsService, $stateParams) {
        var cgc = this;

        cgc.$onInit = function () {
            cgc.courtId = $stateParams.id;
            drbblyCourtsService.getCourtGames(cgc.courtId)
                .then(function (games) {
                    cgc.games = games;
                });
        };

        cgc.courtFilter = function (item) {
            return item.title.toLowerCase().indexOf((cgc.titleFilter || '').toLowerCase()) > -1;
        };
    }
})();
