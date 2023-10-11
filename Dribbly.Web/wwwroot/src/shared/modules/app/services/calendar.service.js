(function () {
    'use strict';

    angular.module('appModule')
        .service('drbblyCalendarService', [null, function () {

            function parseEventObject(event) {
                var parsedEvent = {
                    id: event.id,
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    extendedProps: angular.copy(event)
                };
                return parsedEvent;
            }

            var _service = {
                parseEventObject: parseEventObject
            };
            return _service;
        }]);

})();