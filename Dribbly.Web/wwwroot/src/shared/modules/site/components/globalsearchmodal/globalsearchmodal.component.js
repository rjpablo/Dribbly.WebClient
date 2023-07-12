(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyGlobalsearchmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'gsm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyEventsService', '$element'];
    function controllerFn($scope, drbblyEventsService, $element) {
        var gsm = this;

        gsm.$onInit = function () {

            gsm.resultsContainer = $element.find('.results-container');
            // ^ move the results list in this div

            gsm.context.setOnInterrupt(gsm.onInterrupt);

            gsm.resultGroups = [
                createGroup(constants.enums.entityTypeEnum.Team, 'Teams'),
                createGroup(constants.enums.entityTypeEnum.Account, 'Accounts'),
                createGroup(constants.enums.entityTypeEnum.Court, 'Courts'),
                createGroup(constants.enums.entityTypeEnum.Tournament, 'Tournaments'),
                createGroup(constants.enums.entityTypeEnum.Game, 'Games'),
            ];
        };

        function createGroup(type, groupText) {
            return { type: type, title: title, items:[] };
        }

        gsm.onInterrupt = function (reason) {
            gsm.context.okToClose = true;
            gsm.context.dismiss(reason);
        };

        gsm.onSearchComponentReady = function (widget) {
            gsm.searchWidget = widget;
        };

        gsm.onResultsUpdated = function (results) {
            gsm.results = results;
        };

        gsm.onItemSelected = function (item) {
            close(item);
            gsm.searchWidget.selectItem(item);
        };

        function close(result) {
            gsm.context.okToClose = true;
            gsm.context.submit(result);
        }

        gsm.cancel = function () {
            gsm.onInterrupt('cancelled');
        };
    }
})();
