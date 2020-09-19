(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyNotificationitem', {
            bindings: {
                item: '<'
            },
            controllerAs: 'dni',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$state', 'constants'];
    function controllerFn($state, constants) {
        var dni = this;
        var _notificationTypes;

        dni.$onInit = function () {
            _notificationTypes = constants.enums.notificationType;
            setTargetLink();
        };

        function setTargetLink() {
            if (dni.item.type === _notificationTypes.gameBookedForBooker || dni.item.type === _notificationTypes.gameBookedForOwner) {
                dni.targetLink = $state.href('main.game', { id: dni.item.gameId });
            }
        }
    }
})();
