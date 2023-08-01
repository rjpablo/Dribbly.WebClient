(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyGamestats', {
            bindings: {
                app: '<',
                game: '<'
            },
            controllerAs: 'dgs',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyGamesService', 'modalService', 'constants', 'authService',
        'drbblyOverlayService', '$stateParams', '$scope', '$timeout',
        'drbblyGameshelperService', 'drbblyDatetimeService'];
    function controllerFunc(drbblyGamesService, modalService, constants, authService,
        drbblyOverlayService, $stateParams, $scope, $timeout,
        drbblyGameshelperService, drbblyDatetimeService) {
        var dgs = this;
        var hasInitialized;

        dgs.$onInit = function () {
            dgs.tabs = {
                players: 0,
                teams: 1
            };
            dgs.activeTab = dgs.tabs.players;
        };

        dgs.onTeam1TableReady = function (table) {
            dgs.team1StatTable = table;
            initializeTable(dgs.team1StatTable, dgs.game.team1.players);
        }

        dgs.onTeam2TableReady = function (table) {
            dgs.team2StatTable = table;
            initializeTable(dgs.team2StatTable, dgs.game.team2.players);
        }

        dgs.$onChanges = function (changes) {
            if (changes.game && changes.game.currentValue) {
                massageData()
            }
        }

        function massageData() {
            [dgs.game.team1, dgs.game.team2].forEach(team => {
                team.threePP = team.threePM / team.threePA;
                team.fgp = team.fgm / team.fga;

                team.players.forEach(player => {
                    player.threePP = player.threePM / player.threePA;
                    player.fgp = player.fgm / player.fga;
                });
            });
        }

        function initializeTable(table, data) {
            table.setOptions({
                pagination: false,
                columns: [{
                    field: 'jerseyNo',
                    headerText: '#',
                    columnClass: 'text-secondary jersey-no',
                    headerClass: 'jersey-no',
                },
                {
                    field: 'name',
                    headerText: 'Player',
                    dataTemplate: () => dgs.playerColumnTemplate,
                    columnClass: 'player',
                    headerClass: 'player'
                },
                {
                    field: 'points',
                    headerText: 'PTS'
                },
                {
                    field: 'assists',
                    headerText: 'AST'
                },
                {
                    field: 'rebounds',
                    headerText: 'REB'
                },
                {
                    field: 'blocks',
                    headerText: 'BLK'
                },
                {
                    field: 'steals',
                    headerText: 'STL'
                },
                {
                    field: 'threePM',
                    headerText: '3PM'
                },
                {
                    field: 'threePA',
                    headerText: '3PA'
                },
                {
                    field: 'threePP',
                    headerText: '3P%',
                    dataTemplate: (dataItem) => !dataItem.threePA ? '0.0' :
                        '{{rowData.dataItem.threePP * 100 | number : 1}}'
                },
                {
                    field: 'fgm',
                    headerText: 'FGM'
                },
                {
                    field: 'fga',
                    headerText: 'FGA'
                },
                {
                    field: 'fgp',
                    headerText: 'FG%',
                    dataTemplate: (dataItem) => !dataItem.fga ? '0.0' :
                        '{{rowData.dataItem.fgp * 100 | number : 1}}'
                },
                {
                    field: 'turnovers',
                    headerText: 'TO'
                }]
            });
            table.setData(data);
        }

        dgs.onTeamStatTableReady = function (table) {
            dgs.teamStatTable = table;
            initializeTeamTable(dgs.teamStatTable, [dgs.game.team1, dgs.game.team2]);
        }

        function initializeTeamTable(table, data) {
            hasInitialized = true;
            table.setOptions({
                pagination: false,
                columns: [{
                    field: 'name',
                    headerText: 'Team',
                    dataTemplate: () => dgs.gameTeamColumnTemplate,
                    columnClass: 'team',
                    headerClass: 'team'
                },
                {
                    field: 'score',
                    headerText: 'PTS'
                },
                {
                    field: 'assists',
                    headerText: 'AST'
                },
                {
                    field: 'rebounds',
                    headerText: 'REB'
                },
                {
                    field: 'blocks',
                    headerText: 'BLK'
                },
                {
                    field: 'steals',
                    headerText: 'STL'
                },
                {
                    field: 'threePM',
                    headerText: '3PM'
                },
                {
                    field: 'threePA',
                    headerText: '3PA'
                },
                {
                    headerText: '3P%',
                    dataTemplate: (dataItem) => !dataItem.threePA ? '0.0' :
                        '{{(rowData.dataItem.threePM / rowData.dataItem.threePA * 100) | number : 1}}'
                },
                {
                    field: 'fgm',
                    headerText: 'FGM'
                },
                {
                    field: 'fga',
                    headerText: 'FGA'
                },
                {
                    headerText: 'FG%',
                    dataTemplate: (dataItem) => !dataItem.fga ? '0.0' :
                        '{{(rowData.dataItem.fgm / rowData.dataItem.fga * 100) | number : 1}}'
                },
                {
                    field: 'turnovers',
                    headerText: 'TO'
                }]
            });
            table.setData(data);
        }
    }
})();
