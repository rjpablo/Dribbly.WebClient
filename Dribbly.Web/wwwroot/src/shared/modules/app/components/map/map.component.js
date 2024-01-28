(function () {
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
        var _markers = [];
        var defaultIconOptions = {
            iconSize: [38, 38],
            iconAnchor: [19, 38],
            popupAnchor: [0, -19]
        };

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
                dbm.map = L.map(document.getElementById(dbm._options.id), dbm._options)
                    .setView([dbm._options.center.lat, dbm._options.center.lng], dbm._options.zoom);

                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(dbm.map);

                dbm.map.on('click', dbm._mapClicked);

                if (dbm.onMapReady) {
                    dbm.onMapReady(_widget);
                }
                if (dbm._options.allowSearch) {
                    addSearchControl();
                }
            });
        };

        function initializeWidget() {
            _widget = {
                addMarker,
                addMarkers,
                addCourtMarker,
                addPlayerMarker,
                addPopup,
                resetMarkers,
                panTo
            }
        }

        function panTo(latLng) {
            dbm.map.panTo(latLng);
        }

        function addPlayerMarker(account) {
            var latLng = { lat: account.latitude, lng: account.longitude };
            var popUp = L.popup({ minWidth: 100, keepInView: true })
                .setLatLng(latLng);
            var mapOptions = {
                icon: L.icon({
                    ...defaultIconOptions,
                    iconUrl: constants.images.mapMarkerPlayer.url
                })
            };
            var marker = L.marker([latLng.lat, latLng.lng], mapOptions).addTo(dbm.map);
            marker.bindPopup(popUp);
            marker.on('popupopen', e => {
                var popupScope = $scope.$new()
                popupScope.account = account;
                popupScope.onClick = account => alert(account.name);
                var popupContent = $compile('<drbbly-playerinfocard style="max-width: 100%" player="account"></drbbly-playerinfocard>')(popupScope);
                popUp.setContent(popupContent[0]);
                var el = popUp.getElement();
                angular.element(el.querySelector('.leaflet-popup-content')).addClass('m-1');
            });
            _markers.push(marker);
        }

        function addCourtMarker(court) {
            var latLng = { lat: court.latitude, lng: court.longitude };
            var popUp = L.popup({ minWidth: 190, keepInView: true })
                .setLatLng(latLng);
            var mapOptions = {
                icon: L.icon({
                    ...defaultIconOptions,
                    iconUrl: constants.images.mapMarkerCourt.url
                })
            };
            var marker = L.marker([latLng.lat, latLng.lng], mapOptions).addTo(dbm.map);
            marker.bindPopup(popUp);
            marker.on('popupopen', e => {
                var popupScope = $scope.$new()
                popupScope.court = court;
                popupScope.onClick = account => alert(account.name);
                var popupContent = $compile('<drbbly-courtinfocard court="court"></drbbly-courtinfocard>')(popupScope);
                popUp.setContent(popupContent[0]);
                var el = popUp.getElement();
                angular.element(el.querySelector('.leaflet-popup-content')).addClass('m-1');
            });
            _markers.push(marker);
        }

        /**
         * Adds markers to the map
         * @param {array} markers array objects with the properties `latitude` and `longitude`
         */
        function addMarkers(markers) {
            angular.forEach(markers, function (marker) {
                _markers.push(mapService.addMarker(marker, dbm.map));
            });
        }

        function addMarker(latLng) {
            var marker = mapService.addMarker(latLng, dbm.map);
            _markers.push(marker);
            return marker;
        }

        function resetMarkers(markers) {
            angular.forEach(_markers, function (marker) {
                dbm.map.removeLayer(marker);
            });
            _markers.length = 0;
            addMarkers(markers);
        }

        function addSearchControl() {

            const addressSearchControl = L.control.addressSearch(settingsService.geoapifyKey, {
                position: 'topleft',

                //set it true to search addresses nearby first
                mapViewBias: true,

                //Text shown in the Address Search field when it's empty
                placeholder: dbm._searchOptions.inputPlaceholder,

                // /Callback to notify when a user has selected an address
                resultCallback: (address) => {
                    //Prevent throwing Errors when the address search box is empty
                    if (!address) {
                        return;
                    }
                    dbm.map.setView([address.lat, address.lon], 18);
                    console.log('selected suggestion:', address);
                    var res = mapService.searchResultToPlace(address);
                    dbm._placeChanged(res);
                },

                //Callback to notify when new suggestions have been obtained for the entered text
                suggestionsCallback: (suggestions) => {
                    console.log(suggestions);
                }
            });

            dbm.map.addControl(addressSearchControl);
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
                },
                zoomControl: false
            };
        }

        function getDefaultSearchOptions() {
            return {
                size: 80,
                markSelectedPlace: true,
                inputPlaceholder: 'Enter an address to search'
            };
        }

        dbm._mapClicked = function (e) {
            if (dbm.onMapClicked) {
                dbm.onMapClicked({ latLng: e.latlng });
            }
            if (dbm.options.canAddCourt) {

            }
        };

        function addPopup(popup){
            return popup.openOn(dbm.map);
        }

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
