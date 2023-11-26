(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyPlayersearchcontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'psc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['mapService', 'drbblyCommonService', '$stateParams', '$state'];
    function controllerFunc(mapService, drbblyCommonService, $stateParams, $state) {
        var psc = this;
        var awaitingPlaceResult;

        psc.$onInit = function () {
            psc.app.mainDataLoaded();
            setDefaults();
            psc.app.updatePageDetails({
                title: 'Player Search',
                description: 'Search for Basketball Players'
            });
        };

        function setDefaults() {
            psc.searchData = {
                position: $stateParams.position,
                minHeightInches: $stateParams.minheightinches,
                maxHeightInches: $stateParams.maxheightinches
            };

            if ($stateParams.placeid) {
                psc.searchData.placeId = $stateParams.placeid;
                awaitingPlaceResult = true;
                mapService.getPlaceById($stateParams.placeid)
                    .then(results => {
                        psc.searchKey = results.length > 0 ? results[0].formatted_address : '';
                        if (results.length > 0) {
                            psc.searchComponent && psc.searchComponent.setPlace(results[0]);
                            psc.searchComponent.search(psc.searchData);
                        }
                        else {
                            drbblyCommonService.toast.error('The provided Place ID is invalid.');
                        }
                    })
                    .catch(e => {
                        if (e.code === 'ZERO_RESULTS') {
                            drbblyCommonService.toast.error('The provided Place ID is invalid.');
                        }
                        else {
                            drbblyCommonService.handleError(e);
                        }
                    });
            }
        }

        psc.onSearchComponentReady = (searchComponent) => {
            psc.searchComponent = searchComponent;
            if (!awaitingPlaceResult) {
                psc.searchComponent.search(psc.searchData);
            }
        };

        psc.onSearch = searchData => {
            var params = {
                placeid: searchData.placeId,
                position: searchData.position,
                minheightinches: searchData.minHeightInches,
                maxheightinches: searchData.maxHeightInches
            };
            $state.go('main.playersearch', params, { notify: false, location: 'replace' })
        }
    }
})();
