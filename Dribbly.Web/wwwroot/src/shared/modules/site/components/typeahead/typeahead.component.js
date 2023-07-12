(function () {
    'use strict';

    angular.module('siteModule')
        /** 
         * @namespace drbblyTypeahead
         */
        .component('drbblyTypeahead', {
            bindings: {
                /** The list of items selected from the suggestion.
                 * @type {Dribbly.Model.Shared.ChoiceItemModel[]}
                 * @memberof drbblyTypeahead
                 */
                selectedItems: '=',
                name: '<',
                ngModel: '=',
                config: '<'
            },
            require: { ngModelCtrl: 'ngModel' },
            controllerAs: 'dta',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblySharedService', '$element', '$timeout'];
    function controllerFn(drbblySharedService, $element, $timeout) {
        var dta = this;

        dta.$onInit = function () {
            $element.on('click', function () {
                angular.element($element).find('input.typeahead-text-input')[0].focus();
            });
            dta.selectedItems = dta.selectedItems || [];
        };

        dta._getItems = function (keyword) {
            dta.isShowingStatus = true;
            var resultPromise
            if (dta.config.onGetSuggestions) { //host uses own function to get suggestions
                resultPromise = dta.config.onGetSuggestions(keyword)
            }
            else {
                var input = {
                    keyword: keyword,
                    entityTypes: dta.config.entityTypes,
                    maxCount: dta.config.maxCount
                };
                resultPromise = drbblySharedService.getTypeAheadSuggestions(input);
            }
            return resultPromise
                .then(function (suggestions) {
                    if (suggestions && suggestions.length) {
                        dta.isShowingStatus = false;
                    }
                    if (dta.config.onSuggestionsUpdated) {
                        dta.config.onSuggestionsUpdated(suggestions);
                    }
                    return suggestions;
                });
        };

        dta.keywordChanged = function (keyword) {
            dta.isShowingStatus = false;
            if (!keyword && dta.config.onCleared) {
                dta.config.onCleared();
            }
        };

        dta._onSelect = function (item, model, label, event) {
            if (!dta.selectedItems) {
                dta.selectedItems = [];
            }

            dta.selectedItems.push(item);

            if (dta.config.isMultiple) {
                dta.ngModel = dta.selectedItems.map(item => item.value);
                if (dta.config.onSelect) {
                    dta.config.onSelect(item, dta.selectedItems, event);
                }
            }
            else {
                dta.ngModel = item.value;
                if (dta.config.onSelect) {
                    dta.config.onSelect(item, dta.selectedItems, event);
                }
            }

            dta.keyword = ''; //clear the textbox
        };

        dta.unselect = function (unselectedItem) {
            dta.selectedItems.drbblyRemove(unselectedItem);
            if (dta.config.isMultiple) {
                dta.ngModel = dta.selectedItems.map(item => item.value);
                if (dta.config.onUnselect) {
                    dta.config.onUnselect(unselectedItem, dta.selectedItems, event);
                }
            }
            else {
                dta.ngModel = null;
                if (dta.config.onUnselect) {
                    dta.config.onUnselect(unselectedItem, null, event);
                }
            }
        };
    }
})();
