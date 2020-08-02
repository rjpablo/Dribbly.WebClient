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
            $element.on('click', function () {
                angular.element($element).find('input.typeahead-text-input')[0].focus();
            });
        };

        dta._getItems = function (keyword) {
            dta.isShowingStatus = true;
            return dta.config.onGetSuggestions(keyword)
                .then(function (suggestions) {
                    if (suggestions && suggestions.length) {
                        dta.isShowingStatus = false;
                    }
                    return suggestions;
                });
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
