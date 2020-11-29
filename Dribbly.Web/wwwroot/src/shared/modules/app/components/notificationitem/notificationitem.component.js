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
            if (dni.item.type === _notificationTypes.NewBookingForBooker || dni.item.type === _notificationTypes.NewBookingForOwner) {
                dni.targetLink = $state.href('main.booking', { id: dni.item.bookingId });
            }
            else if(dni.item.type === _notificationTypes.JoinTeamRequest){
                //TO DO set proper link
            }
        }
    }
})();
