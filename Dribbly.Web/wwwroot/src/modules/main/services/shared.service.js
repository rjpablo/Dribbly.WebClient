(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblySharedService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Shared/';

                return {
                    getTypeAheadSuggestions: function (input) {
                        return drbblyhttpService.post(api + 'getTypeAheadSuggestions', input);
                    }
                };
            }]);

})();