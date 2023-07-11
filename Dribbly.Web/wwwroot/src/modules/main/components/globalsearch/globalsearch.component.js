(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGlobalsearch', {
            bindings: {
                keyword: '<'
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
        };

        gcc.search = function () {
            alert('search');
        }

        function setTypeAheadConfig() {
            gcc.typeAheadConfig = {
                entityTypes: [], // All
                maxCount: 10,
                hideResults: true,
                onSelect: onItemSelected,
                placeholder: 'Search',
                onSuggestionsUpdated: onResultsUpdated
            };
        }

        function onResultsUpdated(matcheModels) {
            matcheModels.forEach(model => {
                if (!model.iconUrl){
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

            })
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
            }
            gcc.items = [];
        }
    }
})();
