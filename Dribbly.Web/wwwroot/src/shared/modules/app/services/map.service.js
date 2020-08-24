(function () {
    'use strict';

    angular.module('appModule')
        .service('mapService', ['drbblyToastService', 'modalService', '$q', 'NgMap', map]);

    function map(drbblyToastService, modalService, $q, NgMap) {

        var _geocoder = new google.maps.Geocoder;
        var _earthRadius = 6378.137; // Earth radius in km

        var _getAddressCoordinates = function (address, callback) {
            var geocoder = new google.maps.Geocoder;
            return geocoder.geocode({ address: address }, callback);
        };

        var _addMarker = function (latLng, map, panToMarker, animate) {
            var options = { position: latLng, map: map };
            if (animate) {
                options.animation = google.maps.Animation.BOUNCE;
            }
            if (panToMarker) {
                map.panTo(latLng);
            }
            var marker = new google.maps.Marker(options);
            return marker;
        };

        var _getAddress = function (latLng) {
            var deferred = $q.defer();
            _geocoder.geocode({ 'location': latLng }, (results, status) => {
                if (status === 'OK') {
                    deferred.resolve(results.length ? _getAddressComponents(results[0]) : null);
                }
                else {
                    deferred.reject(status);
                }
            });
            return deferred.promise;
            // Old way:
            //return $http.get('https://maps.googleapis.com/maps/api/geocode/json?key=######&latlng='
            //    + latLng.lat() + ',' + latLng.lng() + '&sensor=false');
        };

        var _getCurrentPosition = function (cbSuccess, cbError) {
            navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
        };

        var _getLatFromLocation = function (loc) {
            return angular.isFunction(loc.geometry.location.lat) ? loc.geometry.location.lat() : loc.geometry.location.lat;
        };

        var _getLngFromLocation = function (loc) {
            return angular.isFunction(loc.geometry.location.lng) ? loc.geometry.location.lng() : loc.geometry.location.lng;
        };

        var _getAddressComponents = function (place) {
            var components;

            components = {};

            angular.forEach(place.address_components, function (address_component) {
                angular.forEach(address_component.types, function (type) {
                    components[type] = address_component.long_name;
                    if (type === 'administrative_area_level_2') { //Province
                        components['administrative_area_level_2_short'] = address_component.short_name;
                    } else if (type === 'administrative_area_level_1') { //Region
                        components['administrative_area_level_1_short'] = address_component.short_name;
                    } else if (type === 'country') {
                        components['country_short'] = address_component.short_name;
                    }
                });
            });

            components.geometry = place.geometry;
            return components;
        };

        var _getCityFromLocation = function (loc) {

            var addressComponents = _getAddressComponents(loc);
            var city = { country: {} };

            if (addressComponents) {
                if (addressComponents.locality) {
                    city.shortName = addressComponents.locality;
                    city.longName = city.shortName;
                    if (addressComponents.administrative_area_level_2) {
                        city.longName = city.longName + ', ' + addressComponents.administrative_area_level_2;
                    } else if (addressComponents.administrative_area_level_1) {
                        city.longName = city.longName + ', ' + addressComponents.administrative_area_level_1_short;
                    }
                }

                if (addressComponents.country) {
                    city.country.longName = addressComponents.country;
                    city.country.shortName = addressComponents.country_short;
                }

                return city;
            }

        };

        var _validateCity = function (city) {
            if (!city) {
                modalService.alert('site.Error_Map_FailedToRetrieveLocation');
                return false;
            } else {

                if (city.country) {

                    if (city.country.shortName !== 'PH') {
                        modalService.alert('site.Error_Map_PhOnly');
                        return false;
                    } else if (!city.shortName) {
                        modalService.alert('site.Error_Map_CityNameNotFound');
                        return false;
                    }
                } else {
                    alert('site.Error_Map_CountryNameNotFound');
                    return false;
                }
            }

            return true;
        };

        /**
         * Computes the distance between to coordinates.
         * Accepts object that has the properties `latitude` and `longitude`
         * @param {any} latlng1 the first coordinate
         * @param {any} latlng2 the second coordinate
         * @returns {number} distance in kilometers
         */
        function computeDistanceBetween(latlng1, latlng2) {
            // Had to make our own function because
            // google.maps.geometry.spherical.computeDistanceBetween((latlng1, latlng2))
            // returns an error for some reason

            var lat1 = latlng1.latitude;
            var lat2 = latlng2.latitude;
            var lon1 = latlng1.longitude;
            var lon2 = latlng2.longitude;
            var dLat = degToRad(lat2 - lat1);
            var dLon = degToRad(lon2 - lon1);
            lat1 = degToRad(lat1);
            lat2 = degToRad(lat2);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) *
                Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = _earthRadius * c;

            return d;
        }


        function degToRad(n) {
            return n * Math.PI / 180;
        }

        function getMap(options) {
            return NgMap.getMap(options);
        }

        this.getAddressCoordinates = _getAddressCoordinates;
        this.addMarker = _addMarker;
        this.computeDistanceBetween = computeDistanceBetween;
        this.getAddress = _getAddress;
        this.getCurrentPosition = _getCurrentPosition;
        this.getLatFromLocation = _getLatFromLocation;
        this.getLngFromLocation = _getLngFromLocation;
        this.getAddressComponents = _getAddressComponents;
        this.getCityFromLocation = _getCityFromLocation;
        this.getPlaceComponents = _getAddressComponents;
        this.getMap = getMap;
        this.validateCity = _validateCity;
        return this;
    }

})();