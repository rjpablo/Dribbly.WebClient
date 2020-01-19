(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyLocationpicker', {
            bindings: {
                context: '<',
                startPosition: '<',
                onLocationSelect: '&',
                requiredCompleteAddress: '<?'
            },
            controllerAs: 'dlp',
            templateUrl: '/shared/modules/app/components/locationpicker/locationpicker.component.html',
            controller: controllerFn
        });

    controllerFn.$inject = ['NgMap', 'mapService', '$timeout'];
    function controllerFn(NgMap, mapService, $timeout) {
        var dlp = this;

        dlp.$onInit = function () {
            dlp.address;
            dlp.completeAddress;
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
            if (dlp.startPosition) {
                dlp.address = dlp.startPosition.formatted_address;
                dlp.completeAddress = dlp.startPosition.formatted_address;
                dlp.selectedLocation = dlp.startPosition;
                resetMark(dlp.startPosition.geometry);
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
            mapService.getAddress(e.latLng).then(function (res) {
                if (res.data.results.length > 0) {
                    var place = res.data.results[0];
                    validatePlace(place);
                } else {
                    console.log('No address was retrieved.' +
                        'Please try a different location.');
                }
            }, function () {
                console.log('An error occured while trying to retrieve address' +
                    ' based on clicked location.');
            });
        };

        function resetMark(e) {
            if (dlp.locationMarker) { //delete marker if existing
                dlp.locationMarker.setMap(null);
                dlp.locationMarker = null;
            }

            dlp.locationMarker = mapService.addMarker(e.latLng || e.location, dlp.map, true);
        }

        dlp.placeChanged = function (a, b, c, d) {
            if (dlp.map) {
                var place = this.getPlace();
                if (place.geometry) {
                    validatePlace(place);
                } else {
                    mapService.getAddressCoordinates(dlp.address, function (res, t) {
                        if (res.length > 0) {
                            place = res[0];

                            if (validatePlace(place)) {
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
            var city = mapService.getCityFromLocation(place);

            if (mapService.validateCity(city)) {
                dlp.completeAddress = place.formatted_address;
                dlp.selectedLocation = place;
                dlp.selectedLocation.city = city;
                resetMark(place.geometry);
                dlp.map.setCenter(place.geometry.location || place.geometry.latLng);
                return true;
            }
        }

        dlp.ok = function (theForm) {
            theForm.$submitted = true;
            if (!(dlp.requireCompleteAddress && theForm.fullAddress.$invalid) && dlp.selectedLocation.geometry) {
                dlp.selectedLocation.formatted_address = theForm.fullAddress.$modelValue;
                dlp.context.submit(dlp.selectedLocation);
            } else {
                console.log('Please fix error(s).');
            }
        };

        dlp.cancel = function (e) {
            dlp.context.dismiss('cancel');
        };


    }
})();
