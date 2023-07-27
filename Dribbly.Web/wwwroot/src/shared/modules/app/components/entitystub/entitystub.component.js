(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyEntitystub', {
            bindings: {
                entity: '<',
                asLink: '<'
            },
            controllerAs: 'dus',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['modalService', 'constants', '$state'];
    function controllerFn(modalService, constants, $state) {
        var dus = this;

        dus.$onInit = function () {
            setLink();
        };

        function setLink() {
            if (dus.entity.entityType === constants.enums.entityType.Court) {
                dus.link = $state.href('main.court.home', { id: dus.entity.id });
            }
            else if (dus.entity.entityType === constants.enums.entityType.Account) {
                dus.link = $state.href('main.account.home', { username: dus.entity.name });
            }
        };
    }
})();
