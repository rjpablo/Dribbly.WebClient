(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccountscontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dhc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyToolbarService', 'drbblyCommonService', 'drbblyAccountsService',
        'drbblyOverlayService', '$timeout', 'drbblyCarouselhelperService', 'constants', '$q', '$filter'];
    function controllerFunc(drbblyToolbarService, drbblyCommonService, drbblyAccountsService,
        drbblyOverlayService, $timeout, drbblyCarouselhelperService, constants, $q, $filter) {
        var dhc = this;

        dhc.$onInit = function () {
            dhc.app.updatePageDetails({
                title: 'Players',
                description: 'Discover top athletes grouped by statistics, showcasing the game\'s rising stars and seasoned legends.'
            });
            dhc.topPlayersOverlay = drbblyOverlayService.buildOverlay();
            dhc.leadersOverlay = drbblyOverlayService.buildOverlay();
            dhc.carouselSettings = drbblyCarouselhelperService.buildSettings();
            drbblyToolbarService.setItems([]);

            loadTopPlayers();
            loadLeaders();
            dhc.app.mainDataLoaded();
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
                },
                //sortByEnum.APG,
                //sortByEnum.RPG,
                //sortByEnum.ThreePP,
                //sortByEnum.BPG,
                //sortByEnum.FGP
            ];
            dhc.leaderGroups = categories.map(c => {
                var group = {
                    category: c.sortBy,
                    getValue: c.getValue,
                    load: function () {
                        var input = {
                            sortBy: group.category,
                            sortDirection: constants.enums.sortDirection.Descending,
                            pageSize: 5
                        };
                        return drbblyAccountsService.getPlayers(input)
                            .then(result => group.players = result)
                            .catch(() => group.failedToLoad = true)
                            .finally(() => group.isLoading = false);

                    }
                };
                return group;
            });
            dhc.leadersOverlay.setToBusy();
            var tasks = dhc.leaderGroups.map(g => g.load());
            $q.all(tasks)
                .then(dhc.leadersOverlay.setToReady)
                .catch(() => dhc.leadersOverlay.setToError());

        }

        function loadTopPlayers() {
            dhc.topPlayersOverlay.setToBusy();
            drbblyAccountsService.getTopPlayers()
                .then(data => {
                    dhc.topPlayers = data;
                    $timeout(function () {
                        dhc.carouselSettings.enabled = true;
                        dhc.topPlayersOverlay.setToReady();
                    }, 300);
                })
                .catch(e => {
                    dhc.topPlayersOverlay.setToError();
                });
        }
    }
})();
