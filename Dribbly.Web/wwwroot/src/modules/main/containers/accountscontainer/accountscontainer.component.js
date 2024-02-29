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

    controllerFunc.$inject = ['drbblyToolbarService', 'drbblyCommonService', 'drbblyAccountsService', '$scope',
        'drbblyOverlayService', '$timeout', 'drbblyCarouselhelperService', 'constants', '$q', '$filter', 'authService',
        '$state', '$compile', 'modalService'];
    function controllerFunc(drbblyToolbarService, drbblyCommonService, drbblyAccountsService, $scope,
        drbblyOverlayService, $timeout, drbblyCarouselhelperService, constants, $q, $filter, authService,
        $state, $compile, modalService) {
        var dhc = this;
        var _map;
        dhc.showTopPlayers = false;

        dhc.$onInit = function () {
            dhc.app.updatePageDetails({
                title: 'Players',
                description: 'Discover top athletes grouped by statistics, showcasing the game\'s rising stars and seasoned legends.'
            });
            dhc.topPlayersOverlay = drbblyOverlayService.buildOverlay();
            dhc.newPlayersOverlay = drbblyOverlayService.buildOverlay();
            dhc.featuredPlayersOverlay = drbblyOverlayService.buildOverlay();
            dhc.leadersOverlay = drbblyOverlayService.buildOverlay();
            dhc.carouselSettings = drbblyCarouselhelperService.buildSettings();
            dhc.featuredPlayerCarouselSettings = drbblyCarouselhelperService.buildSettings();
            drbblyToolbarService.setItems([]);
            dhc.mapOptions = {
                id: 'players-page-map',
                zoom: 5,
                height: '50vh'
            };

            dhc.newPlayers = [];
            dhc.newPlayersNextPageNumber = 1;
            dhc.getNewPlayersFilter = {
                sortBy: constants.enums.getPlayersSortByEnum.DateJoined,
                sortDirection: constants.enums.sortDirection.Descending,
                pageSize: 10,
                page: dhc.newPlayersNextPageNumber
            };

            if (dhc.showTopPlayers) loadTopPlayers();
            loadLeaders();
            loadFeaturedPlayers();
            dhc.loadNewPlayers();
            getMappedUsers();
            dhc.app.mainDataLoaded();
        };

        function loadFeaturedPlayers() {
            dhc.featuredPlayersOverlay.setToBusy();
            var input = {
                isFeatured: true
            };
            drbblyAccountsService.getPlayers(input)
                .then(data => {
                    dhc.featuredPlayers = data;
                    $timeout(function () {
                        dhc.featuredPlayerCarouselSettings.enabled = true;
                        dhc.featuredPlayersOverlay.setToReady();
                    }, 300);
                })
                .catch(e => {
                    dhc.topPlayersOverlay.setToError();
                });
        }

        dhc.onMapReady = function (map) {
            _map = map;
        };

        dhc.onMapClicked = (e) => {
            var popupScope = $scope.$new()
            popupScope.onAddMeClick = () => {
                if (authService.authentication.isAuthenticated) {
                    modalService.confirm({ msg1Raw: 'Set your location to here?' })
                        .then(confirmed => {
                            if (confirmed) {
                                drbblyAccountsService.setLocation(authService.authentication.accountId, e.latLng)
                                    .then(getMappedUsers)
                                    .catch(e => drbblyCommonService.handleError(e));
                            }
                        })
                }
                else {
                    $state.go('auth.signUp', { lat: e.latLng.lat, lng: e.latLng.lng });
                }
                popup.remove();
            };
            var popupContent = $compile(`
                <div class="d-flex flex-column">
                    <button class="btn btn-sm btn-primary mb-1" ng-click="onAddMeClick()">Add me here</button>
                </div>`
            )(popupScope);

            var popup = L.popup({ minWidth: 50 })
                .setLatLng(e.latLng)
                .setContent(popupContent[0]);
            _map.addPopup(popup);
        }

        function getMappedUsers() {
            drbblyAccountsService.getAccountsWithLocation()
                .then(data => {
                    if (_map) {
                        _map.resetMarkers([]);
                        data.forEach(player => {
                            _map.addPlayerMarker(player);
                        })
                    }
                });
        }

        function loadLeaders() {
            var sortByEnum = constants.enums.getPlayersSortByEnum;
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

        dhc.loadNewPlayers = function () {
            dhc.getNewPlayersFilter.page = dhc.newPlayersNextPageNumber;
            dhc.newPlayersOverlay.setToBusy();
            return drbblyAccountsService.getPlayers(dhc.getNewPlayersFilter)
                .then(result => {
                    dhc.newPlayersNextPageNumber++;
                    if (result.length > 0) {
                        dhc.getNewPlayersFilter.joinedBeforeDate = result[result.length - 1].dateAdded;
                    }
                    dhc.newPlayers = dhc.newPlayers.concat(result);
                })
                .catch(e => drbblyCommonService.handleError(e))
                .finally(() => dhc.newPlayersOverlay.setToReady());
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
