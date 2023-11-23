(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyPlayersearch', {
            bindings: {
                searchKey: '<',
                onReady: '<',
                redirectOnSubmit: '<',
                onSearch: '<'
            },
            controllerAs: 'dps',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyFormshelperService', 'drbblyAccountsService', 'drbblyCommonService',
        '$state', 'constants', 'drbblyOverlayService'];
    function controllerFn(drbblyFormshelperService, drbblyAccountsService, drbblyCommonService,
        $state, constants, drbblyOverlayService) {
        var dps = this;

        dps.$onInit = function () {
            dps.overlay = drbblyOverlayService.buildOverlay();
            dps.searchData = {
                page: 0,
                pageSize: 10
            };
            dps.players = [];
            dps.searchOptions = {
                types: ['locality', 'administrative_area_level_3'],
                textInput: { borderless: true },
                placeHolder: 'Any City',
                onBlur: onCityBlur
            };
            dps.ddlPositionOptions = drbblyFormshelperService
                .getDropDownListChoices({
                    enumKey: 'app.PlayerPositionEnum',
                    emptyText: 'Any Position',
                    excludeValues: [constants.enums.playerPositionEnum.Coach]
                });
        };

        dps.placeChanged = function (place) {
            dps.searchData.placeId = null;
            if (place) {
                dps.mapSearch.setText(place.formatted_address);
                dps.searchData.place = {
                    googleId: place.place_id,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    name: place.formatted_address
                };
                dps.searchData.placeId = place.place_id;
            }
            else {
                dps.mapSearch.setText('');
            }
        };

        function onCityBlur() {
            dps.mapSearch.setText(dps.searchData.place ? dps.searchData.place.name : '');
        }

        dps.onMapSearchReady = (mapSearch) => {
            dps.mapSearch = mapSearch;
            mapSearch.setText(dps.searchKey);
            if (dps.onReady) {
                dps.onReady({
                    setPlace: place => {
                        dps.searchData.place = place;
                        mapSearch.setText(place.formatted_address);
                    },
                    search: data => {
                        dps.searchData = Object.assign(dps.searchData, data);
                        dps.submit();
                    }
                })
            }
        }

        dps.editCity = () => {
            dps.editingCity = true;
            if (dps.searchData.place) {
                dps.citySearchKeyword = dps.searchData.place.name;
            }
        };

        dps.removeCity = () => {
            dps.searchData.placeId = null;
            dps.searchData.place = null;
            dps.mapSearch.setText('');
        };

        dps.submit = () => {
            if (dps.redirectOnSubmit) {
                var params = {
                    placeid: dps.searchData.placeId,
                    position: dps.searchData.position

                };
                $state.go('main.playersearch', params);
                return;
            }
            dps.players.length = 0;
            dps.searchData.page = 0;
            dps.loadNextPage();
            dps.isLastPage = false;
            dps.hasSearched = true;
        }

        dps.loadNextPage = () => {
            dps.searchData.page++;
            dps.onSearch && dps.onSearch(dps.searchData);
            dps.overlay.setToBusy('');
            return drbblyAccountsService.getPlayers(dps.searchData)
                .then(result => {
                    dps.isLastPage = result.length < dps.searchData.pageSize;
                    dps.players = dps.players.concat(result);
                })
                .catch(e => drbblyCommonService.handleError(e))
                .finally(() => dps.overlay.setToReady());
        }
    }
})();
