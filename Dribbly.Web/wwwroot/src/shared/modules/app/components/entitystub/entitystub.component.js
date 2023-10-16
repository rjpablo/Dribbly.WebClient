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

    controllerFn.$inject = ['constants', '$state'];
    function controllerFn(constants, $state) {
        var dus = this;

        dus.$onInit = function () {
            if (!dus.entity.iconUrl) {
                if (dus.entity.entityType === constants.enums.entityType.Account) {
                    dus.entity.iconUrl = constants.images.defaultProfilePhoto.url;
                }
            }
            setLink();
        };

        function setLink() {
            if (dus.entity.entityType === constants.enums.entityType.Court) {
                dus.link = $state.href('main.court.home', { id: dus.entity.id });
            }
            else if (dus.entity.entityType === constants.enums.entityType.Account) {
                dus.link = $state.href('main.account.home', { username: dus.entity.username });
            }
        };
    }
})();
