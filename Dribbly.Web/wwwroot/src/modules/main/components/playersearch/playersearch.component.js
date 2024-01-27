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
        '$state', 'constants', 'drbblyOverlayService', '$filter'];
    function controllerFn(drbblyFormshelperService, drbblyAccountsService, drbblyCommonService,
        $state, constants, drbblyOverlayService, $filter) {
        var dps = this;

        dps.$onInit = function () {
            dps.overlay = drbblyOverlayService.buildOverlay();
            dps.searchData = {
                page: 0,
                pageSize: 10
            };
            dps.minHeightInches = 48;
            dps.maxHeightInches = 78;
            dps.anyHeight = true;
            dps.players = [];
            dps.searchOptions = {
                type: 'city',
                //type: ['locality', 'administrative_area_level_3'], //for google maps to search Cities only
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
            dps.sliderOption = {
                floor: 36,
                ceil: 96,
                translate: function (value, sliderId, label) {
                    return $filter('height')(value);
                }
            };
        };

        dps.onAnyHeightChange = anyHeight => {
            dps.anyHeight = anyHeight;
        };

        dps.placeChanged = function (place) {
            dps.searchData.placeId = null;
            if (place) {
                dps.mapSearch.setText(place.name);
                dps.searchData.place = {
                    googleId: place.id,
                    lat: place.latitude,
                    lng: place.longitude,
                    name: place.name
                };
                dps.searchData.placeId = place.id;
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
                        dps.anyHeight = !dps.searchData.minHeightInches && !dps.searchData.maxHeightInches;
                        if (!dps.anyHeight) {
                            dps.minHeightInches = dps.searchData.minHeightInches;
                            dps.maxHeightInches = dps.searchData.maxHeightInches;
                        }
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
                    position: dps.searchData.position,
                    minheightinches: dps.anyHeight ? null : dps.minHeightInches,
                    maxheightinches: dps.anyHeight ? null : dps.maxHeightInches
                };
                $state.go('main.playersearch', params);
                return;
            }
            
            dps.players.length = 0;
            dps.searchData.page = 0;
            dps.searchData.minHeightInches = dps.anyHeight ? null : dps.minHeightInches;
            dps.searchData.maxHeightInches = dps.anyHeight ? null : dps.maxHeightInches;
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
