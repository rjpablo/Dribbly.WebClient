(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyMap', {
            bindings: {
                options: '<',
                onMapReady: '<',
                onMapClicked: '<',
                onLocationSelected: '<?'
            },
            controllerAs: 'dbm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['NgMap', 'mapService', '$timeout', 'modalService', 'settingsService', 'constants'];
    function controllerFn(NgMap, mapService, $timeout, modalService, settingsService, constants) {
        var dbm = this;

        dbm.$onInit = function () {
            dbm.mapApiKey = settingsService[constants.settings.googleMapApiKey];
            dbm.types = ['geocode'];
            dbm.center = '15,121';
            dbm._options = Object.assign(getDefaultOptions(), dbm.options);

            dbm.selectedLocation = {
                formatted_address: '',
                latLng: {},
                city: {
                    contry: {}
                }
            };

            NgMap.getMap({ id: dbm._options.id }).then(function (map) {
                dbm.map = map;
                dbm.onMapReady(map);
            });
        };

        function getDefaultOptions() {
            return {
                center: '15,121',
                zoom: 15,
                disableDefaultUI: false,
                steetViewControl: true,
                mapTypeControl: true
            };
        }

        dbm.mapClicked = function (e) {
            dbm.onMapClicked(e);
        };

        function resetMark(e) {
            if (dbm.locationMarker) { //delete marker if existing
                dbm.locationMarker.setMap(null);
                dbm.locationMarker = null;
            }

            dbm.locationMarker = mapService.addMarker(e.latLng || e.location, dbm.map, true);
        }

        dbm.placeChanged = function () {
            if (dbm.map) {
                var place = this.getPlace();
                if (place.geometry) {
                    if (validatePlace(mapService.getAddressComponents(place))) {
                        resetMark(place.geometry);
                        returnSelectedLocation(place);
                    }
                } else {
                    // this is executed when the user presses enter on the address search box
                    // instead of selecting one of the suggestions, if any
                    //mapService.getAddressCoordinates(dbm.address, function (res, t) {
                    //    if (res.length > 0) {
                    //        if (validatePlace(mapService.getAddressComponents(place[0]))) {
                    //            dbm.$apply();
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
            if (place.country_short === 'PH') {
                dbm.completeAddress = place.formatted_address;
                dbm.selectedLocation = place;
                return true;
                //dbm.map.setCenter(place.geometry.location || place.geometry.latLng);
            } else {
                modalService.alert('site.Error_Map_PhOnly');
                return false;
            }
        }

        function returnSelectedLocation(place) {
            if (dbm.onLocationSelected) {
                var latLng = {
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng()
                };
                dbm.onLocationSelected(latLng);
            }
        }


    }
})();
