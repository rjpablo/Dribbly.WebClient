(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeamscontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dtc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyToolbarService', 'drbblyCommonService', 'drbblyTeamsService',
        'drbblyOverlayService', '$timeout', 'drbblyCarouselhelperService', 'constants', '$q', '$filter'];
    function controllerFunc(drbblyToolbarService, drbblyCommonService, drbblyTeamsService,
        drbblyOverlayService, $timeout, drbblyCarouselhelperService, constants, $q, $filter) {
        var dtc = this;

        dtc.$onInit = function () {
            dtc.app.updatePageDetails({
                title: 'Teams',
                description: 'Find basketball teams grouped and sorted by their performance statistics, a testament to their dedication and skill.'
            });
            dtc.topTeamsOverlay = drbblyOverlayService.buildOverlay();
            dtc.leadersOverlay = drbblyOverlayService.buildOverlay();
            dtc.carouselSettings = drbblyCarouselhelperService.buildSettings();
            drbblyToolbarService.setItems([]);

            loadTeams();
            loadLeaders();
            dtc.app.mainDataLoaded();
        };

        function loadLeaders() {
            var sortByEnum = constants.enums.statEnum;
            var categories = [
                {
                    sortBy: sortByEnum.PPG,
                    getValue: player => {
                        return $filter('number')(player.ppg, 1);
                    }
                },
                {
                    sortBy: sortByEnum.APG,
                    getValue: player => {
                        return $filter('number')(player.apg, 1);
                    }
                },
                {
                    sortBy: sortByEnum.RPG,
                    getValue: player => {
                        return $filter('number')(player.rpg, 1);
                    }
                },
                {
                    sortBy: sortByEnum.ThreePP,
                    getValue: player => {
                        return $filter('number')(player.threePP * 100, 0);
                    }
                },
                {
                    sortBy: sortByEnum.BPG,
                    getValue: player => {
                        return $filter('number')(player.bpg, 1);
                    }
                },
                {
                    sortBy: sortByEnum.SPG,
                    getValue: player => {
                        return $filter('number')(player.spg, 1);
                    }
                }
            ];
            dtc.leaderGroups = categories.map(c => {
                var group = {
                    category: c.sortBy,
                    getValue: c.getValue,
                    load: function () {
                        var input = {
                            sortBy: group.category,
                            sortDirection: constants.enums.sortDirection.Descending,
                            pageSize: 5
                        };
                        return drbblyTeamsService.getTeams(input)
                            .then(result => group.teams = result)
                            .catch(() => group.failedToLoad = true)
                            .finally(() => group.isLoading = false);

                    }
                };
                return group;
            });
            dtc.leadersOverlay.setToBusy();
            var tasks = dtc.leaderGroups.map(g => g.load());
            $q.all(tasks)
                .then(dtc.leadersOverlay.setToReady)
                .catch(() => dtc.leadersOverlay.setToError());

        }

        function loadTeams() {
            dtc.topTeamsOverlay.setToBusy();
            drbblyTeamsService.getTopTeams({ page: 1, pageSize: 10 })
                .then(data => {
                    dtc.topTeams = data;
                    $timeout(function () {
                        dtc.carouselSettings.enabled = true;
                        dtc.topTeamsOverlay.setToReady();
                    }, 300);
                })
                .catch(e => {
                    dtc.topTeamsOverlay.setToError();
                });
        }
    }
})();
