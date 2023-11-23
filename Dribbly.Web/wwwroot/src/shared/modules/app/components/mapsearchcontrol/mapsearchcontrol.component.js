(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyMapsearchcontrol', {
            bindings: {
                options: '=',
                onPlaceChanged: '<',
                onSearch: '<',
                keyword: '@',
                onReady: '<'
            },
            controllerAs: 'msc',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$timeout', '$scope', '$log'];
    function controllerFn($timeout, $scope, $log) {
        var msc = this;
        var _autocomplete;
        var _geocoder;

        msc.$onInit = function () {
            _autocomplete = new google.maps.places.AutocompleteService();
            _geocoder = new google.maps.Geocoder;
            angular.element(window).on('click.mapSearch', function () {
                clearSuggestions();
            });

            if (msc.onReady) {
                msc.onReady({
                    setText: msc.setText
                });
            }
        };

        msc.$onDestroy = function () {
            angular.element(window).off('click.mapSearch');
        };

        msc.keywordChanged = function () {
            var request = {
                input: msc.keyword,
                types: msc.options.types,
                componentRestrictions: msc.options.componentRestrictions,
                bounds: msc.options.bounds
            };
            clearSuggestions();

            if (msc.keyword) {
                _autocomplete.getPlacePredictions(request, function (result, status) {
                    if (status === 'OK') {
                        msc.suggestions = result;
                        $timeout(function () {
                            $scope.$apply(); //needed for suggestions to show immediately
                        });
                    }
                    else {
                        $log.error(new Error('Map search error. Search key: ' + msc.keyword + ', Status = ' + status));
                    }
                });
            }
        };

        msc.setText = (text) => msc.keyword = text;

        msc.blur = () => {
            msc.options.onBlur && msc.options.onBlur();
        };

        msc.itemClicked = function (prediction) {
            if (msc.onPlaceChanged) {
                _geocoder.geocode({ placeId: prediction.place_id }, function (places, status) {
                    if (status === 'OK') {
                        msc.keyword = places[0].formatted_address;
                        msc.onPlaceChanged(places[0]);
                        clearSuggestions();
                    }
                });
            }
        };

        function clearSuggestions() {
            msc.suggestions = [];
            $timeout(function () {
                $scope.$apply(); //needed for suggestions to show immediately
            });
        }

        msc.getAddress = function (place) {
            var address = '';
            if (place.address_components) {
                address = [
                    place.address_components[0] && place.address_components[0].short_name || '',
                    place.address_components[1] && place.address_components[1].short_name || '',
                    place.address_components[2] && place.address_components[2].short_name || ''
                ].join(' ');
            }
            return address;
        };
    }
})();
