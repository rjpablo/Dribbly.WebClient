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
            loadPlayers();
        };

        function loadTeams() {
            drbblyTournamentsService.getTopTeams({ tournamentId: dgs.tournament.id })
                .then(data => {
                    dgs.tournament.topTeams = data;
                })
                .catch(e => drbblyCommonService.handleError(e));
        }

        function loadPlayers() {
            drbblyTournamentsService.getPlayers({ tournamentId: dgs.tournament.id })
                .then(data => {
                    dgs.tournament.players = data;
                })
                .catch(e => drbblyCommonService.handleError(e));
        }

        dgs.onPlayersTableReady = function (table) {
            dgs.playerStatTable = table;
            initializeTable(dgs.playerStatTable, dgs.tournament.players);
        }

        function initializeTable(table, data) {
            table.setOptions({
                pagination: { pageSize: 10 },
                columns: [{
                    field: 'jerseyNo',
                    headerText: '#',
                    columnClass: 'text-secondary jersey-no',
                    headerClass: 'jersey-no',
                },
                {
                    field: 'account.name',
                    headerText: 'Player',
                    dataTemplate: () => dgs.playerColumnTemplate,
                    columnClass: 'player',
                    headerClass: 'player'
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
