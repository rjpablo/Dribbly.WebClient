(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyCourtshelperService', ['modalService', function (modalService) {

            function registerCourt() {
                return modalService.show({
                    view: '<drbbly-addeditcourtmodal></drbbly-addeditcourtmodal>',
                    model: {}
                });
            }

            function editCourt(court) {
                return modalService.show({
                    view: '<drbbly-addeditcourtmodal></drbbly-addeditcourtmodal>',
                    model: { court: court },
                    options: { isEdit: true }
                });
            }

            var _service = {
                registerCourt: registerCourt,
                editCourt: editCourt
            };

            return _service;
        }]);

})();