(function () {
    'use strict';

    angular.module('appModule')
        .service('mapService', ['drbblyToastService', 'modalService', '$q', map]);

    function map(drbblyToastService, modalService, $q) {

        var _geocoder = new google.maps.Geocoder;

        var _getAddressCoordinates = function (address, callback) {
            var geocoder = new google.maps.Geocoder;
            return geocoder.geocode({ address: address }, callback);
        };

        var _addMarker = function (latLng, map, panToMarker) {
            var marker = new google.maps.Marker({ position: latLng, map: map });
            if (panToMarker) {
                map.panTo(latLng);
            }
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

        this.getAddressCoordinates = _getAddressCoordinates;
        this.addMarker = _addMarker;
        this.getAddress = _getAddress;
        this.getCurrentPosition = _getCurrentPosition;
        this.getLatFromLocation = _getLatFromLocation;
        this.getLngFromLocation = _getLngFromLocation;
        this.getAddressComponents = _getAddressComponents;
        this.getCityFromLocation = _getCityFromLocation;
        this.getPlaceComponents = _getAddressComponents;
        this.validateCity = _validateCity;
        return this;
    }

})();