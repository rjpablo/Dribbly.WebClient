(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyEventshelperService', ['modalService', 'authService',
            function (modalService, authService) {

                var _service = {
                    openEventDetailsModal: function (data) {
                        return authService.checkAuthenticationThen(function () {
                            return modalService.show({
                                view: '<drbbly-addeventmodal></drbbly-addeventmodal>',
                                model: data || {},
                                backdrop: 'static'
                            });
                        });
                    }
                };

                return _service;
            }]);

})();