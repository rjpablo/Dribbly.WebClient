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

        };

        dgs.onTableReady = function (table) {
            dgs.statTable = table;
            initializeTable(dgs.statTable, dgs.game.team1.players.concat(dgs.game.team2.players));
        }

        function initializeTable(table, data) {
            hasInitialized = true;
            table.setOptions({
                pagination: { pageSize: 10 },
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
                    field: 'teamMembership.team.name',
                    headerText: 'Team',
                    headerStyle: { width: '1px', 'text-align': 'center' },
                    style: { width: '1px', 'text-align': 'center' },
                    dataTemplate: () => dgs.teamColumnTemplate
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
