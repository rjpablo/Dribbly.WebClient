(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamenthome', {
            bindings: {
                app: '<',
                tournament: '<'
            },
            controllerAs: 'dth',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'constants'];
    function controllerFunc(authService, constants) {
        var dth = this;

        dth.$onInit = function () {
            dth.filter = {};
            dth.app.updatePageDetails({
                title: (dth.tournament.name) + ' - Home',
                image: dth.tournament.logo.url
            });
        };

        dth.$onChanges = changes => {
            if (changes.tournament && changes.tournament.currentValue) {
                dth.isManager = dth.tournament.addedById === authService.authentication.accountId;
                dth.postsOptions = {
                    postedOnType: constants.enums.entityTypeEnum.Tournament,
                    postedOnId: dth.tournament.id,
                    title: 'Updates',
                    addButtonLabel: 'New Update',
                    emplyLabel: 'No updates found.',
                    canPost: dth.isManager
                };

            }
        }
    }
})();
