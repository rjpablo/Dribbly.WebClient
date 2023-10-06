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

    controllerFn.$inject = ['$state', 'constants', 'i18nService'];
    function controllerFn($state, constants, i18nService) {
        var dni = this;
        var _notificationTypes;
        var _i18n = i18nService.getString;

        dni.$onInit = function () {
            _notificationTypes = constants.enums.notificationTypeEnum;
            setTargetLink();
        };

        dni.getTemplate = function (notif) {
            var tmpl = _i18n('app.Notification_' + constants.enums.notificationTypeEnum[notif.type], notif.additionalInfo);
            return tmpl;
        }

        function setTargetLink() {
            switch (dni.item.type) {
                case _notificationTypes.NewGameForBooker:
                case _notificationTypes.NewGameForOwner:
                    dni.targetLink = $state.href('main.game.details', { id: dni.item.additionalInfo.gameId });
                    break;
                case _notificationTypes.AssignedAsTimekeeper:
                    dni.targetLink = $state.href('main.game.track', { id: dni.item.additionalInfo.gameId });
                    break;
                case _notificationTypes.NewBookingForBooker:
                case _notificationTypes.NewBookingForOwner:
                    dni.targetLink = $state.href('main.booking', { id: dni.item.bookingId });
                    break;
                case _notificationTypes.NewJoinTournamentRequest:
                case _notificationTypes.JoinTournamentRequestApproved:
                case _notificationTypes.JoinTournamentRequestRejected:
                case _notificationTypes.TournamentTeamRemoved:
                    dni.targetLink = $state.href('main.tournament.teams', { id: dni.item.additionalInfo.tournamentId });
                    break;
                case _notificationTypes.JoinTeamRequestApproved:
                case _notificationTypes.JoinTeamRequest:
                    dni.targetLink = $state.href('main.team.members', { id: dni.item.additionalInfo.teamId });
                    break;
                case _notificationTypes.JoinGroupRequestApproved:
                    dni.targetLink = $state.href('main.group.home', { id: dni.item.additionalInfo.groupId });
                case _notificationTypes.JoinGroupRequest:
                    dni.targetLink = $state.href('main.group.members', { id: dni.item.additionalInfo.groupId });
                    break;
            }
        }
    }
})();
