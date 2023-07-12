(function () {
    'use strict';

    angular
        .module('siteModule')
        .component('drbblyGlobalsearch', {
            bindings: {
                // the commponent will not display the results
                hideResults: '<',
                // callback function to call, passing the results as parameter, when results come back from the server
                onResultsUpdated: '<',
                onReady: '<',
                maxCount: '<'
            },
            controllerAs: 'gcc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', '$state'];
    function controllerFunc(constants, $state) {
        var gcc = this;

        gcc.$onInit = function () {
            setTypeAheadConfig();
            if (gcc.onReady) {
                gcc.onReady({
                    selectItem: onItemSelected
                });
            }
        };

        gcc.search = function () {
            alert('search');
        }

        function setTypeAheadConfig() {
            gcc.typeAheadConfig = {
                entityTypes: [], // All
                maxCount: gcc.maxCount,
                hideResults: gcc.hideResults,
                onSelect: onItemSelected,
                placeholder: 'Search',
                onSuggestionsUpdated: onResultsUpdated
            };
        }

        function onResultsUpdated(matchedModels) {
            matchedModels.forEach(model => {
                if (!model.iconUrl) {
                    switch (model.type) {
                        case constants.enums.entityTypeEnum.Team:
                            model.iconUrl = constants.images.defaultTeamLogoUrl;
                            break;
                        case constants.enums.entityTypeEnum.Court:
                            model.iconUrl = constants.images.defaultCourtLogoUrl;
                            break;
                        case constants.enums.entityTypeEnum.Tournament:
                            model.iconUrl = constants.images.defaultTournamentLogoUrl;
                            break;
                        case constants.enums.entityTypeEnum.Account:
                            model.iconUrl = constants.images.defaultProfilePhotoUrl;
                            break;
                    }
                }
            });

            if (gcc.onResultsUpdated) {
                gcc.onResultsUpdated(matchedModels);
            }
        };

        function onItemSelected(item) {
            switch (item.type) {
                case constants.enums.entityTypeEnum.Team:
                    $state.go('main.team.home', { id: item.value });
                    break;
                case constants.enums.entityTypeEnum.Court:
                    $state.go('main.court.home', { id: item.value });
                    break;
                case constants.enums.entityTypeEnum.Tournament:
                    $state.go('main.tournament.games', { id: item.value });
                    break;
                case constants.enums.entityTypeEnum.Account:
                    $state.go('main.account.home', { username: JSON.parse(item.additionalData).username });
                    break;
                case constants.enums.entityTypeEnum.Game:
                    $state.go('main.game.details', { id: item.value });
                    break;
            }
            gcc.items = [];
        }
    }
})();
