(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyFormshelperService', serviceFn);

    serviceFn.$inject = ['i18nService']
    function serviceFn(i18nService) {
        function getDropDownListChoices(options) {
            var choices = i18nService.convertEnumToChoices(options.enumKey);
            choices.unshift({
                text: i18nService.getString('site.NotSet'),
                value: null
            });
            return choices;
        }

        return {
            getDropDownListChoices: getDropDownListChoices
        };

    }
})();