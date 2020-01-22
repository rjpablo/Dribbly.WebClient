(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyLocationpicker', {
            bindings: {
                onLocationSelected: '<?',
                initialPosition: '<?'
            },
            controllerAs: 'dlp',
            templateUrl: '/shared/modules/app/components/locationpicker/locationpicker.component.html',
            controller: controllerFn
        });

    controllerFn.$inject = ['NgMap', 'mapService', '$timeout', 'modalService'];
    function controllerFn(NgMap, mapService, $timeout, modalService) {
        var dlp = this;

        dlp.$onInit = function () {
            dlp.types = ['geocode'];
            dlp.center = '15,121';

            dlp.selectedLocation = {
                formatted_address: '',
                latLng: {},
                city: {
                    contry: {}
                }
            };

            NgMap.getMap({ id: 'locationPickerMap' }).then(function (map) {
                dlp.map = map;
                setInitialPosition();
            });

            $timeout(function () {
                google.maps.event.trigger(dlp.map, 'resize');
            }, 1000);
        };

        function setInitialPosition() {
            if (dlp.initialPosition) {
                dlp.address = startPosition.formatted_address;
                dlp.completeAddress = startPosition.formatted_address;
                dlp.selectedLocation = startPosition;
                resetMark(startPosition.geometry);
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

        dlp.focusCurrentSelection = function () {
            dlp.map.setCenter(dlp.selectedLocation.geometry.location);
        };

        dlp.mapClicked = function (e) {
            mapService.getAddress(e.latLng).then(function (location) {
                if (location) {
                    if (validatePlace(location)) {
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

            dlp.locationMarker = mapService.addMarker(e.latLng || e.location, dlp.map, true);
        }

        dlp.placeChanged = function () {
            if (dlp.map) {
                var place = this.getPlace();
                if (place.geometry) {
                    validatePlace(mapService.getAddressComponents(place));
                } else {
                    mapService.getAddressCoordinates(dlp.address, function (res, t) {
                        if (res.length > 0) {
                            if (validatePlace(mapService.getAddressComponents(place[0]))) {
                                dlp.$apply();
                            }
                        } else {
                            console.log('Unable to find entered location.');
                        }
                    });
                }
            } else {
                console.log('The map has not been initialized. Please wait until it is initialized.');
            }
        };

        function validatePlace(place) {
            if (place.country_short === 'PH') {
                dlp.completeAddress = place.formatted_address;
                dlp.selectedLocation = place;
                resetMark(place.geometry);
                return true;
                //dlp.map.setCenter(place.geometry.location || place.geometry.latLng);
            } else {
                modalService.alert('site.Error_Map_PhOnly');
                return false;
            }
        }

        dlp.ok = function () {
            var result = {
                latitude: dlp.selectedLocation.geometry.location.lat(),
                longitude: dlp.selectedLocation.geometry.location.lng()
            };
            dlp.context.submit(result);
        };

        dlp.cancel = function (e) {
            dlp.context.dismiss('cancel');
        };


    }
})();
