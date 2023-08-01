(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTournamentstats', {
            bindings: {
                app: '<',
                tournament: '<'
            },
            controllerAs: 'dgs',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyTournamentsService', 'modalService', 'constants', 'authService',
        'drbblyOverlayService', '$stateParams', '$scope', '$timeout',
        'drbblyGameshelperService', 'drbblyDatetimeService'];
    function controllerFunc(drbblyTournamentsService, modalService, constants, authService,
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
            loadTeams();
        };

        function loadTeams() {
            drbblyTournamentsService.getTopTeams({ tournamentId: dgs.tournament.id })
                .then(data => {
                    dgs.tournament.topTeams = data;
                })
                .catch(e => drbblyCommonService.handleError(e));
        }

        dgs.onTeam1TableReady = function (table) {
            dgs.team1StatTable = table;
            initializeTable(dgs.team1StatTable, dgs.game.team1.players);
        }

        dgs.onTeam2TableReady = function (table) {
            dgs.team2StatTable = table;
            initializeTable(dgs.team2StatTable, dgs.game.team2.players);
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

        dgs.onTeamStatTableReady = function (table) {
            dgs.teamStatTable = table;
            initializeTeamTable(dgs.teamStatTable, dgs.tournament.topTeams);
        }

        function initializeTeamTable(table, data) {
            hasInitialized = true;
            table.setOptions({
                pagination: false,
                columns: [{
                    field: 'name',
                    headerText: 'Team',
                    dataTemplate: () => dgs.tournamentTeamColumnTemplate,
                    columnClass: 'team',
                    headerClass: 'team'
                },
                {
                    field: 'gw',
                    headerText: 'GW',
                    headerTooltip: 'Games Won'
                },
                {
                    field: 'gp',
                    headerText: 'GP',
                    headerTooltip: 'Games Played'
                },
                {
                    field: 'ppg',
                    headerText: 'PPG',
                    dataTemplate: () => '{{rowData.dataItem.ppg | number : 1}}',
                    headerTooltip: 'Points Per Game'
                },
                {
                    field: 'apg',
                    headerText: 'APG',
                    dataTemplate: () => '{{rowData.dataItem.apg | number : 1}}',
                    headerTooltip: 'Assists Per Game'
                },
                {
                    field: 'rpg',
                    headerText: 'RPG',
                    dataTemplate: () => '{{rowData.dataItem.rpg | number : 1}}',
                    headerTooltip: 'Rebounds Per Game'
                },
                {
                    field: 'bpg',
                    headerText: 'BPG',
                    dataTemplate: () => '{{rowData.dataItem.bpg | number : 1}}',
                    headerTooltip: 'Blocks Per Game'
                },
                {
                    field: 'threePP',
                    headerText: '3P%',
                    dataTemplate: () => '{{rowData.dataItem.threePP * 100 | number : 1}}',
                    headerTooltip: '3-Points Percentage'
                },
                {
                    field: 'fgp',
                    headerText: 'FG%',
                    dataTemplate: () => '{{rowData.dataItem.fgp * 100 | number : 1}}',
                    headerTooltip: 'Field Goal Percentage'
                }]
            });
            table.setData(data);
        }
    }
})();
