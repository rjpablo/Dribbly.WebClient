﻿(function () {
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

    controllerFn.$inject = ['$scope', '$timeout', 'drbblyEventsService', 'drbblyCourtsService', 'settingsService',
        'mapService', 'constants', 'NgMap', 'modalService', '$filter'];
    function controllerFn($scope, $timeout, drbblyEventsService, drbblyCourtsService, settingsService,
        mapService, constants, NgMap, modalService, $filter) {
        var src = this;
        var _okToClose;
        var _markers;
        var _clusterer;

        src.$onInit = function () {
            src.mapApiKey = settingsService[constants.settings.googleMapApiKey];
            src.filteredCourts = [];
            src.mapOptions = {
                zoom: 5
            };
            src.isBusy = true;
            src.isFiltersCollapsed = false;
            src.resultView = 'map';
            _markers = [];

            drbblyCourtsService.getAllCourts()
                .then(function (result) {
                    src.isBusy = false;
                    src.allCourts = result;
                    src.filteredCourts = result;

                    $timeout(function () {
                        src.frmCourtDetails.txtName.$$element.focus();
                        NgMap.getMap({ id: 'court-search-map' })
                            .then(function (map) {
                                src.map = map;
                                _clusterer = new MarkerClusterer(src.map, [],
                                    {
                                        imagePath: '../src/custom/markerclusterer/m'
                                    });

                                updateCourtsList(result);
                                goToCurrentPosition();
                            })
                            .catch(function (err) {
                                console.log('error', err);
                            });
                    }, 500); //this delay is required to get the map instance
                })
                .catch(function (error) {

                });

            src.context.setOnInterrupt(src.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event) {
                if (!_okToClose) {
                    event.preventDefault();
                    src.onInterrupt();
                }
            }, $scope);
        };

        src.filterCourts = function () {
            src.filteredCourts = $filter('courts')(src.allCourts, src.searchInput);
            updateCourtsList(src.filteredCourts);
        };

        src.clearFilters = function () {
            src.searchInput = null;
            src.filterCourts();
        };

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

        src.go = function () {
            src.isBusy = true;
            drbblyCourtsService.FindCourts(src.searchInput)
                .then(function (result) {
                    updateCourtsList(result);
                    src.isBusy = false;
                })
                .catch(function () {
                    src.isBusy = false;
                });
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
    }
})();
