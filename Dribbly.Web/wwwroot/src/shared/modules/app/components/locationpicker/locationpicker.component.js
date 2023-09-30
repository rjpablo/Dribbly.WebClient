(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyLocationpicker', {
            bindings: {
                onLocationSelected: '<?',
                initialPosition: '<?'
            },
            controllerAs: 'dlp',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['mapService', 'modalService'];
    function controllerFn(mapService, modalService) {
        var dlp = this;

        dlp.$onInit = function () {
            dlp.mapOptions = {
                id: 'location-picker-map',
                allowSearch: true
            };
            if (dlp.initialPosition && dlp.initialPosition.latlng) {
                dlp.mapOptions.center = dlp.initialPosition.latlng;
            }
            dlp.searchOptions = {
                onPlaceChanged: dlp.onPlaceChanged,
                markSelectedPlace: false
            };
        };

        dlp.onMapReady = function (map) {
            dlp.map = map;
            setInitialPosition();
        };

        function setInitialPosition() {
            if (dlp.initialPosition) {
                resetMark(dlp.initialPosition);
            } else {
                focusCurrentPosition();
            }
        }

        function focusCurrentPosition() {
            mapService.getCurrentPosition(
                function (pos) {
                    var currentPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                    centerMap(currentPos);
                },
                function (error) {
                    console.log('Unable to get location: ' + error.message);
                },
                { enableHighAccuracy: true });
        }

        function centerMap(latLng) {
            dlp.map.setCenter(latLng);
        }

        dlp.onMapClicked = function (e) {
            mapService.getAddress(e.latLng).then(function (location) {
                if (location) {
                    if (validatePlace(location)) {
                        resetMark(e);
                        returnSelectedLocation(location);
                    }
                } else {
                    console.log('No address was retrieved.' +
                        'Please try a different location.');
                }
            }, function () {
                console.log('An error occured while trying to retrieve address' +
                    ' based on clicked location.');
            });
        };

        function returnSelectedLocation(place) {
            if (dlp.onLocationSelected) {
                var latLng = {
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng()
                };
                dlp.onLocationSelected(latLng);
            }
        }

        function resetMark(e) {
            if (dlp.locationMarker) { //delete marker if existing
                dlp.locationMarker.setMap(null);
                dlp.locationMarker = null;
            }

            dlp.locationMarker = mapService.addMarker(e.latLng || e.location, dlp.map, true, true);
        }

        dlp.onPlaceChanged = function (place) {
            if (dlp.map) {
                if (place.geometry) {
                    if (validatePlace(mapService.getAddressComponents(place))) {
                        resetMark(place.geometry);
                        returnSelectedLocation(place);
                    }
                } else {
                    // this is executed when the user presses enter on the address search box
                    // instead of selecting one of the suggestions, if any
                    //mapService.getAddressCoordinates(dlp.address, function (res, t) {
                    //    if (res.length > 0) {
                    //        if (validatePlace(mapService.getAddressComponents(place[0]))) {
                    //            dlp.$apply();
                    //        }
                    //    } else {
                    //        console.log('Unable to find entered location.');
                    //    }
                    //});
                }
            } else {
                console.log('The map has not been initialized. Please wait until it is initialized.');
            }
        };

        function validatePlace(place) {
            var phOnly = false;
            if (!phOnly || place.country_short === 'PH') {
                dlp.completeAddress = place.formatted_address;
                dlp.selectedLocation = place;
                return true;
                //dlp.map.setCenter(place.geometry.location || place.geometry.latLng);
            } else {
                modalService.alert('site.Error_Map_PhOnly');
                return false;
            }
        }
    }
})();
