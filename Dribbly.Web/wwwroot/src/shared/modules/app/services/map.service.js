/*
 * Place Object Format:
 * {
 *  id: string,             // 
 *  name: string,           // Short name of the place
 *  displayName: string,    // Complete name of the place
 *  latitude: double,
 *  longitude: double,
 *  country: string,        // Country
 *  countryCode: string,    // Country Code
 *  state: string,          // Province/State
 *  city: string,           // Town/City
 *  village: string,        // Village/Barangay
 *  road: string            // Road/Street
 *  placeType: string       // The type of this place (e.g. Country, State, City, Residential, etc)
 * } 
 * 
 * */

(function () {
    'use strict';

    angular.module('appModule')
        .service('mapService', ['drbblyhttpService', 'modalService', '$q', 'NgMap', 'settingsService', 'constants', map]);

    function map(drbblyhttpService, modalService, $q, NgMap, settingsService, constants) {

        var _earthRadius = 6378.137; // Earth radius in km

        var _getAddressCoordinates = function (address, callback) {
            var geocoder = new google.maps.Geocoder;
            return geocoder.geocode({ address: address }, callback);
        };

        var _addMarker = function (latLng, map, panToMarker) {
            if (panToMarker) {
                map.panTo(latLng);
            }

            var options = {};

            if (latLng.type === constants.enums.mapMarkerTypeEnum.Player) {
                options.icon = L.icon({
                    iconUrl: constants.images.mapMarkerPlayer.url,
                    iconSize: [38, 38],
                    iconAnchor: [19, 38]
                });
            }

            var marker = L.marker([latLng.lat, latLng.lng], options).addTo(map);
            return marker;
        };

        function getPlaceById(placeId) {
            const geocoder = new google.maps.Geocoder();
            return geocoder.geocode({ placeId: placeId })
                .then(result => result.results);
        }

        var _getAddress = function (latLng) {
            var deferred = $q.defer();
            drbblyhttpService.getRaw('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + latLng.lat + '&lon=' + latLng.lng)
                .then(result => {
                    console.log(result);
                    if (!result || !result.address) {
                        deferred.resolve(null);
                    }
                    else {
                        var res = {
                            id: result.place_id,
                            name: result.name,
                            displayName: result.display_name,
                            latitude: result.lat,
                            longitude: result.lon,
                            country: result.address.country,
                            countryCode: result.address.country_code.toUpperCase(),
                            state: result.address.state,
                            city: result.address.town || result.address.city,
                            village: result.address.village,
                            road: result.address.road,
                            placeType: result.type
                        };
                        deferred.resolve(res);
                    }
                })
                .catch(deferred.reject);
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

        var _panTo = (map, latLng, zoom) => {
            map.panTo(latLng);
            if (zoom) {
                _setZoom(map, zoom);
            }
        }

        var _setZoom = (map, zoom) => {
            map.setZoom(zoom);
        }

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

        function _search(input) {
            var query = `https://api.geoapify.com/v1/geocode/autocomplete?format=json&apiKey=${settingsService.geoapifyKey}&limit=1`;
            if (input.keyword) {
                query += `&text=${input.keyword}`
            }
            if (input.type === 'city') {
                query += `&type=city`;
            }
            return drbblyhttpService.getRaw(query, { doNotAddBearerToken: true })
                .then(results => {
                    return results.results.map(r => {
                        if (input.type === 'city') {
                            r.name = r.name || r.city;
                        }
                        return _searchResultToPlace(r)
                    });
                });
        }

        function _searchResultToPlace(address) {
            return {
                id: address.place_id,
                name: address.name,
                displayName: address.formatted,
                latitude: address.lat,
                longitude: address.lon,
                country: address.country,
                countryCode: address.country_code?.toUpperCase(),
                state: address.state,
                city: address.town || address.city,
                village: address.village,
                road: address.road,
                placeType: address.result_type
            };
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
        this.getPlaceById = getPlaceById;
        this.panTo = _panTo;
        this.setZoom = _setZoom;
        this.search = _search;
        this.searchResultToPlace = _searchResultToPlace;
        this.validateCity = _validateCity;
        return this;
    }

})();