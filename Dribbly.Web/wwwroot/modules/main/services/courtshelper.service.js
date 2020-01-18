(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyCourtshelperService', ['modalService', function (modalService) {

            function registerCourt() {
                return modalService.show({
                    view: '<drbbly-registercourtmodal></drbbly-registercourtmodal>',
                    model: {}
                });
            }

            var _service = {
                registerCourt: registerCourt
            };

            return _service;
        }]);

})();