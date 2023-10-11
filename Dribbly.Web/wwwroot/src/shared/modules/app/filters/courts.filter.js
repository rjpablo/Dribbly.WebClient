(function () {
    'use strict';

    angular.module('appModule')
        .filter('courts', function () {
            return function (input, criteria) {
                if (!input || !input.length) {
                    return input;
                }

                if (!criteria) {
                    return input;
                }

                var result = [];
                input.forEach(function (court) {
                    if (criteria.name && court.name.toLowerCase().indexOf(criteria.name.toLowerCase()) === -1) {
                        return;
                    }

                    // Rate per hour
                    if (criteria.rateMin && court.ratePerHour < criteria.rateMin) {
                        return;
                    }

                    if ((criteria.rateMax || criteria.rateMax === 0) && court.ratePerHour > criteria.rateMax) {
                        return;
                    }

                    result.push(court);
                });
                return result;
            };
        });
})();