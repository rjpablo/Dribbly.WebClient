﻿(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyMap', {
            bindings: {
                searchOptions: '<',
                options: '<',
                onMapReady: '<',
                onMapClicked: '<'
            },
            controllerAs: 'dbm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$compile', 'mapService', '$timeout', '$scope', 'settingsService', 'constants'];
    function controllerFn($compile, mapService, $timeout, $scope, settingsService, constants) {
        var dbm = this;
        var _widget;

        dbm.$onInit = function () {
            dbm.mapApiKey = settingsService[constants.settings.googleMapApiKey];
            dbm._options = Object.assign(getDefaultOptions(), dbm.options);
            dbm._searchOptions = Object.assign(getDefaultSearchOptions(), dbm.searchOptions);

            dbm.selectedLocation = {
                formatted_address: '',
                latLng: {},
                city: {
                    contry: {}
                }
            };

            initializeWidget();

            $timeout(function () {
                dbm.map = new google.maps.Map(document.getElementById(dbm._options.id), dbm._options);
                if (dbm.onMapReady) {
                    dbm.onMapReady.apply(_widget, [dbm.map]);
                }
                dbm.map.addListener('click', function (e) {
                    dbm._mapClicked(e);
                });
                if (dbm._options.allowSearch) {
                    addSearchControl();
                }
                dbm.map.addListener('bounds_changed', function () {
                    dbm._searchOptions.bounds = dbm.map.getBounds();
                });
            });
        };

        function initializeWidget() {
            _widget = {
                addMarkers: addMarkers
            }
        }

        /**
         * Adds markers to the map
         * @param {array} markers array objects with the properties `latitude` and `longitude`
         */
        function addMarkers(markers) {
            angular.forEach(markers, function (marker) {
                mapService.addMarker({ lat: marker.latitude, lng: marker.longitude }, dbm.map, true, true);
            });
        }

        function addSearchControl() {
            var component = $compile(dbm.searchControlTemplate)($scope);
            dbm.map.controls[google.maps.ControlPosition.TOP_LEFT].push(component[0]);
        }

        function getDefaultOptions() {
            return {
                center: constants.coordinates.PHILIPPINES,
                zoom: 10,
                height: '500px',
                disableDefaultUI: false,
                streetViewControl: false,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    position: google.maps.ControlPosition.LEFT_BOTTOM
                }
            };
        }

        function getDefaultSearchOptions() {
            return {
                size: 80,
                markSelectedPlace: true
            };
        }

        dbm._mapClicked = function (e) {
            if (dbm.onMapClicked) {
                dbm.onMapClicked(e);
            }
        };

        function resetMarker(geometry) {
            if (dbm.selectionMarker) { //delete marker if existing
                dbm.selectionMarker.setMap(null);
                dbm.selectionMarker = null;
            }

            dbm.selectionMarker = mapService.addMarker(geometry.latLng || geometry.location, dbm.map, true, true);
        }

        dbm._placeChanged = function (place) {
            if (place && dbm.map) {
                if (dbm._searchOptions.onPlaceChanged) {
                    dbm._searchOptions.onPlaceChanged(place);
                }
                if (place.geometry) {
                    if (dbm._searchOptions.markSelectedPlace) {
                        resetMarker(place.geometry);
                    }
                    else {
                        dbm.map.setCenter(place.geometry.latlng || place.geometry.location);
                    }
                }
            } else {
                console.log('The map has not been initialized. Please wait until it is initialized.');
            }
        };
    }
})();