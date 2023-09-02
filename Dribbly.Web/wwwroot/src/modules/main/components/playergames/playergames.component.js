(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyPlayergames', {
            bindings: {
                app: '<',
                account: '<'
            },
            controllerAs: 'tgc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyAccountsService', 'authService', 'drbblyOverlayService', 'drbblyDatetimeService'];
    function controllerFunc(drbblyAccountsService, authService, drbblyOverlayService, drbblyDatetimeService) {
        var tgc = this;

        tgc.$onInit = function () {
            tgc.overlay = drbblyOverlayService.buildOverlay();
            tgc.isManager = tgc.account.id === authService.authentication.accountId;
            tgc._activeTabIndex = 1;
            loadGames();
            tgc.app.updatePageDetails({
                title: tgc.account.name + ' - Games',
                image: tgc.account.profilePhoto.url
            });
        };

        function loadGames() {
            tgc.overlay.setToBusy();
            drbblyAccountsService.getPlayerGames(tgc.account.id)
                .then(result => {
                    tgc.overlay.setToReady();
                    tgc.account.gameStats = result;
                    massageGames(tgc.account.gameStats);
                })
                .catch(e => {
                    console.log(e);
                    tgc.overlay.setToError();
                });
        }

        function massageGames(gameStats) {
            gameStats.forEach(stat => {
                stat.game.start = new Date(drbblyDatetimeService.toUtcString(stat.game.start))
                stat.team = stat.teamId === stat.game.team1Id ?
                    stat.game.team1.team :
                    stat.game.team2.team;

                stat.opponentTeam = stat.teamId === stat.game.team1Id ?
                    stat.game.team2.team :
                    stat.game.team1.team;
            })
        }

        tgc.upcomingFilter = function (item) {
            return item.game.start > new Date();
        }

        tgc.onPlayersTableReady = function (table) {
            initializeTable(table, tgc.account.gameStats);
        }

        function initializeTable(table, data) {
            table.setOptions({
                pagination: { pageSize: 10 },
                columns: [{
                    field: 'game.id',
                    headerText: 'Game ID',
                    dataTemplate: () => tgc.gameIdColumnTemplate,
                    columnClass: 'gameId',
                    headerClass: 'gameId text-nowrap'
                },
                {
                    field: 'team.name',
                    headerText: 'Team',
                    dataTemplate: () => tgc.gameTeamColumnTemplate,
                    columnClass: 'team text-nowrap',
                    headerClass: 'team'
                },
                {
                    field: 'opponentTeam.name',
                    headerText: 'Opponent',
                    dataTemplate: () => tgc.opponentTeamColumnTemplate,
                    columnClass: 'team text-nowrap',
                    headerClass: 'team'
                },
                {
                    field: 'game.dateAdded',
                    headerText: 'Date',
                    columnClass: 'text-nowrap',
                    dataTemplate: () => tgc.dateColumnTemplate
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
                    dataTemplate: (dataItem) => !dataItem.threePA ? '-' :
                        '{{(rowData.dataItem.threePM / rowData.dataItem.threePA * 100) | number : 0}}'
                },
                {
                    field: 'ftm',
                    headerText: 'FTM'
                },
                {
                    field: 'fta',
                    headerText: 'FTA'
                },
                {
                    field: 'ftp',
                    headerText: 'FT%',
                    dataTemplate: (dataItem) => !dataItem.fta ? '-' :
                        '{{(rowData.dataItem.ftm / rowData.dataItem.fta * 100) | number : 0}}'
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
                    dataTemplate: (dataItem) => !dataItem.fga ? '-' :
                        '{{(rowData.dataItem.fgm / rowData.dataItem.fga * 100) | number : 0}}'
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
