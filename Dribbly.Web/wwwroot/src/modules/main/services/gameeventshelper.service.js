(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGameeventshelperService', ['constants',
            function (constants) {

                function getDescription(event) {
                    return event.type === constants.enums.gameEventTypeEnum.ShotMade ? 'Shot Made(+' + event.additionalData.points + 'pts)' :
                        event.type === constants.enums.gameEventTypeEnum.ShotMissed ? 'MISS' :
                            event.type === constants.enums.gameEventTypeEnum.FoulCommitted ? 'FOUL(' + event.additionalData.foulName + ')' :
                                event.type === constants.enums.gameEventTypeEnum.ShotBlock ? 'BLOCK' :
                                    event.type === constants.enums.gameEventTypeEnum.Assist ? 'ASSIST' :
                                        event.type === constants.enums.gameEventTypeEnum.OffensiveRebound ? 'REBOUND (OFF)' :
                                            event.type === constants.enums.gameEventTypeEnum.DefensiveRebound ? 'REBOUND (DEF)' :
                                                event.type === constants.enums.gameEventTypeEnum.Timeout ? 'TIMEOUT' :
                                                    event.type
                }

                var _service = {
                    getDescription: getDescription
                };

                return _service;
            }]);

})();