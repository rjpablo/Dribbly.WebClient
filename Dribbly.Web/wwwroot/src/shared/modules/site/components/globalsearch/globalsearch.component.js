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
                onCleared: '<',
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
        var _typeahead;

        gcc.$onInit = function () {
            setTypeAheadConfig();
        };

        gcc.onTypeaheadReady = function (typeahead) {
            _typeahead = typeahead;
            if (gcc.onReady) {
                gcc.onReady({
                    selectItem: onItemSelected,
                    focus: _typeahead.focus
                });
            }
        }

        function setTypeAheadConfig() {
            gcc.typeAheadConfig = {
                entityTypes: [], // All
                maxCount: gcc.maxCount,
                hideResults: gcc.hideResults,
                onSelect: onItemSelected,
                placeholder: 'Search',
                onSuggestionsUpdated: onResultsUpdated,
                onCleared: gcc.onCleared
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
                        case constants.enums.entityTypeEnum.Group:
                            model.iconUrl = constants.images.defaultGroupLogo.url;
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
                case constants.enums.entityTypeEnum.Group:
                    $state.go('main.group.home', { id: item.value });
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
                case constants.enums.entityTypeEnum.Blog:
                    $state.go('main.blog', { slug: JSON.parse(item.additionalData).slug });
                    break;
                case constants.enums.entityTypeEnum.Game:
                    $state.go('main.game.details', { id: item.value });
                    break;
            }
            gcc.items = [];
        }
    }
})();
