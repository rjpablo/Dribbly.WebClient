(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyLocationpicker', {
            bindings: {
                onLocationSelected: '<?',
                pickOnSearch: '<',          // whether to automatically pick the location selected in search results
                initialPosition: '<?',
                selectedLocation: '<'
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
                allowSearch: true,
                zoomControl: false,
                height: '300px'
            };
            if (dlp.initialPosition) {
                dlp.mapOptions.center = { lat: dlp.initialPosition.lat, lng: dlp.initialPosition.lng };
            }
            dlp.searchOptions = {
                onPlaceChanged: dlp.onPlaceChanged,
                markSelectedPlace: false
            };
        };

        dlp.$onChanges = function (changes) {
            if (changes.selectedLocation && dlp.map) {
                resetMark(changes.selectedLocation.currentValue ?
                    { lat: dlp.selectedLocation.latitude, lng: dlp.selectedLocation.longitude } :
                    null);
                dlp.map.panTo({ lat: dlp.selectedLocation.latitude, lng: dlp.selectedLocation.longitude });
            }
        }

        dlp.onMapReady = function (map) {
            dlp.map = map;
            if (dlp.selectedLocation) {
                resetMark({ lat: dlp.selectedLocation.latitude, lng: dlp.selectedLocation.longitude });
                dlp.map.panTo({ lat: dlp.selectedLocation.latitude, lng: dlp.selectedLocation.longitude });
            }
            else {
                setInitialPosition();
            }
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
                    centerMap({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                function (error) {
                    console.log('Unable to get location: ' + error.message);
                },
                { enableHighAccuracy: true });
        }

        function centerMap(latLng) {
            dlp.map.panTo(latLng);
        }

        dlp.onMapClicked = function (e) {
            mapService.getAddress(e.latLng).then(function (location) {
                if (location) {
                    if (validatePlace(location)) {
                        resetMark(e.latLng);
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
            dlp.onLocationSelected && dlp.onLocationSelected(place);
        }

        function resetMark(latLng) {
            if (dlp.locationMarker) { //delete marker if existing
                dlp.map.resetMarkers([]);
            }

            if (latLng) {
                dlp.locationMarker = dlp.map.addMarker(latLng);
            }
            else {
                dlp.locationMarker = null;
            }
        }

        dlp.onPlaceChanged = function (place) {
            if (dlp.map) {
                if (place) {
                    if (validatePlace(place)) {
                        dlp.map.panTo({ lat: place.latitude, lng: place.longitude }, 18);
                        if (dlp.pickOnSearch) {
                            resetMark({ lat: place.latitude, lng: place.longitude });
                            returnSelectedLocation(place);
                        }
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
            if (!phOnly || place.countryCode === 'PH') {
                dlp.completeAddress = place.displayName;
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
