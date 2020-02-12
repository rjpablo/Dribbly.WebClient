(function () {
    'use strict';

    angular.module('appModule')
        .service('drbblyFooterService', [function () {

            var _footer;

            function addFooterItem(input) {
                if (_footer) {
                    return _footer.addDynamicContent(input.scope, input.template);
                }
                else {
                    throw new Error('The footer component has not been initialized.');
                }
            }

            function setFooter(footer) {
                _footer = footer;
            }

            function handleFooterResize() {
                console.log(_footer.element[0].offsetHeight);
            }

            var _service = {
                addFooterItem: addFooterItem,
                handleFooterResize: handleFooterResize,
                setFooter: setFooter
            };

            return _service;
        }]);

})();