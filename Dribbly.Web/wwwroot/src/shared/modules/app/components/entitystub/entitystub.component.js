(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyEntitystub', {
            bindings: {
                entity: '<'
            },
            controllerAs: 'dus',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['modalService', 'constants', '$state'];
    function controllerFn(modalService, constants, $state) {
        var dus = this;

        dus.$onInit = function () {

        };

        dus.onClick = function () {
            if (dus.entity.entityType === constants.enums.entityType.Court) {
                modalService.show({
                    view: '<drbbly-courtpreviewmodal></drbbly-courtpreviewmodal>',
                    model: { court: dus.entity }
                });
            }
            else if (dus.entity.entityType === constants.enums.entityType.Account) {
                $state.go('main.account.home', { username: dus.entity.name });
            }
        };
    }
})();
