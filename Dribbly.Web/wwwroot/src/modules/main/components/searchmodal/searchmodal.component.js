(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblySearchmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'src',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyCommonService', 'drbblyEventsService', 'drbblyCourtsService', 'settingsService',
        'mapService', 'constants', 'modalService', '$filter', 'orderByFilter'];
    function controllerFn($scope, drbblyCommonService, drbblyEventsService, drbblyCourtsService, settingsService,
        mapService, constants, modalService, $filter, orderByFilter) {
        var src = this;
        var _okToClose;
        var _markers;
        var _clusterer;
        var _removeListener;

        src.$onInit = function () {
            src.mapApiKey = settingsService[constants.settings.googleMapApiKey];
            src.filteredCourts = [];
            src.mapOptions = {
                id: 'court-search-map',
                zoom: 15,
                disableDefaultUI: false,
                streetViewControl: false
            };
            src.isBusy = true;
            src.isFiltersCollapsed = false;
            src.resultView = 'map';
            src.sortOptions = [
                { field: 'dateAdded', textKey: 'app.DateAdded', reverse: true },
                { field: 'ratePerHour', textKey: 'app.RatePerHour', reverse: false },
                { field: 'name', textKey: 'site.Name', reverse: false }
            ];
            _markers = [];

            src.context.setOnInterrupt(src.onInterrupt);
            _removeListener = drbblyEventsService.on('modal.closing', function (event) {
                if (!_okToClose) {
                    event.preventDefault();
                    src.onInterrupt();
                }
            }, $scope);
        };

        src.onMapReady = function (map) {
            src.map = map;
            drbblyCourtsService.getAllCourts()
                .then(function (result) {
                    src.isBusy = false;
                    src.allCourts = result;
                    src.filteredCourts = result;
                    sortCourts(src.sortOptions[0]); // sort by dateAdded by default

                    _clusterer = new MarkerClusterer(src.map, [],
                        {
                            imagePath: '../src/custom/markerclusterer/m'
                        });

                    updateCourtsList(result);
                    goToCurrentPosition();
                })
                .catch(function (error) {
                    drbblyCommonService.handleError(error);
                });
        };

        src.filterCourts = function () {
            src.filteredCourts = $filter('courts')(src.allCourts, src.searchInput);
            updateCourtsList(src.filteredCourts);
        };

        src.clearFilters = function () {
            src.searchInput = null;
            src.filterCourts();
        };

        src.sortCourts = function (data) {
            if (src.sortField === data.field) {
                data.reverse = !data.reverse;
            }
            sortCourts(data);
        };

        function sortCourts(data) {
            src.sortField = data.field;
            src.filteredCourts = orderByFilter(src.filteredCourts, data.field, data.reverse);
        }

        function goToCurrentPosition() {
            mapService.getCurrentPosition(function (position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                src.map.setCenter(pos);
            }, function () {
                handleLocationError(true, infoWindow, map.getCenter());
            });
        }

        src.onInterrupt = function (reason) {
            _okToClose = true;
            src.context.dismiss(reason);
        };

        function updateCourtsList(courts) {
            src.hasPerformedSearch = true;
            setCourtMarkers(courts);
        }

        function setCourtMarkers(courts) {
            clearMarkers();
            angular.forEach(courts, function (court) {
                var marker = mapService.addMarker({ lat: court.latitude, lng: court.longitude }, src.map, false);
                _markers.push(marker);
                google.maps.event.addListener(marker, 'click', function () {
                    previewCourt(court);
                });
            });
            if (src.resultView === 'map' && courts.length) {
                _clusterer.addMarkers(_markers);
                _clusterer.fitMapToMarkers();
            }
        }

        function clearMarkers() {
            _clusterer.clearMarkers();
            angular.forEach(_markers, function (marker) {
                marker.setMap(null);
                marker = null;
            });
            _markers = [];
        }

        function previewCourt(court) {
            modalService.show({
                view: '<drbbly-courtpreviewmodal></drbbly-courtpreviewmodal>',
                model: { court: court }
            })
                .then(function () { /*do nothing*/ })
                .catch(function () { /*do nothing*/ });
        }

        src.mapClicked = function (e) {
            console.log('Map clicked', e);
        };

        src.cancel = function () {
            src.onInterrupt('cancelled');
        };

        src.isValidSearchCriteria = function () {
            return src.searchInput && src.searchInput.name;
        };

        src.$onDestroy = function () {
            _removeListener();
        }
    }
})();
