(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyTypeahead', {
            bindings: {
                selectedItems: '=', // this will always be an array
                config: '<'
            },
            controllerAs: 'dta',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['settingsService', '$element'];
    function controllerFn(settingsService, $element) {
        var dta = this;

        dta.$onInit = function () {
            console.log(dta.ngModel);

            $element.on('click', function () {
                angular.element($element).find('input.typeahead-text-input')[0].focus();
            });
        };

        dta._getItems = function (keyword) {
            return dta.config.onGetSuggestions(keyword);
        };

        dta._onSelect = function (item, model, label, event) {
            if (!dta.selectedItems) {
                dta.selectedItems = [];
            }
            dta.selectedItems.push(item);
            dta.config.onSelect(item, dta.selectedItems, event);
            dta.ngModel = '';
        };

        dta.unselect = function (item) {
            dta.selectedItems.drbblyRemove(item);
            if (dta.config.onUnselect) {
                dta.config.onUnselect(item, dta.selectedItems, event);
            }
        };
    }
})();
