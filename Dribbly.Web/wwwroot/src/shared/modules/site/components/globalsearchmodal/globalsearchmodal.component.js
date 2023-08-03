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

    controllerFn.$inject = ['constants', 'drbblyEventsService', '$element', '$scope'];
    function controllerFn(constants, drbblyEventsService, $element, $scope) {
        var gsm = this;
        var _removeListener;

        gsm.$onInit = function () {

            gsm.resultsContainer = $element.find('.results-container');
            // ^ move the results list in this div

            gsm.context.setOnInterrupt(gsm.onInterrupt);

            gsm.resultGroups = [
                createGroup(null, 'All'),
                createGroup(constants.enums.entityTypeEnum.Team, 'Teams'),
                createGroup(constants.enums.entityTypeEnum.Account, 'Accounts'),
                createGroup(constants.enums.entityTypeEnum.Court, 'Courts'),
                createGroup(constants.enums.entityTypeEnum.Tournament, 'Tournaments'),
                createGroup(constants.enums.entityTypeEnum.Game, 'Games'),
            ];

            gsm.context.setOnInterrupt(gsm.onInterrupt);
            _removeListener = drbblyEventsService.on('modal.closing', function (event) {
                if (!gsm.context.okToClose) {
                    event.preventDefault();
                    gsm.onInterrupt();
                }
            }, $scope);
        };

        function createGroup(type, title) {
            return { type: type, title: title, items:[] };
        }

        gsm.onInterrupt = function (reason) {
            gsm.context.okToClose = true;
            gsm.context.dismiss(reason);
        };

        gsm.onCleared = function () {
            gsm.hasSearched = false;
            gsm.results = [];
            classifyResults([]);
        }

        gsm.onSearchComponentReady = function (widget) {
            gsm.searchWidget = widget;
        };

        gsm.onResultsUpdated = function (results) {
            gsm.hasSearched = true;
            gsm.results = results;
            classifyResults(results);
            gsm.selectedGroup = gsm.resultGroups[0]; // All
        };

        gsm.onItemSelected = function (item) {
            close(item);
            gsm.searchWidget.selectItem(item);
        };

        function close(result) {
            gsm.context.okToClose = true;
            gsm.context.submit(result);
        }

        function classifyResults(results) {
            gsm.resultGroups.forEach(group => {
                group.items = results.drbblyWhere(item => group.type === null || item.type === group.type);
            });
        }

        gsm.cancel = function () {
            gsm.onInterrupt('cancelled');
        };

        gsm.$onDestroy = function () {
            _removeListener();
        };
    }
})();
