(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyFormshelperService', serviceFn);

    serviceFn.$inject = ['i18nService']
    function serviceFn(i18nService) {
        function getDropDownListChoices(options) {
            var choices = i18nService.convertEnumToChoices(options.enumKey);
            addDdlNullChoice(choices);
            return choices;
        }

        function addDdlNullChoice(choices) {
            choices.unshift({
                text: i18nService.getString('site.NotSet'),
                value: null
            });
        }

        return {
            addDdlNullChoice: addDdlNullChoice, 
            getDropDownListChoices: getDropDownListChoices
        };

    }
})();