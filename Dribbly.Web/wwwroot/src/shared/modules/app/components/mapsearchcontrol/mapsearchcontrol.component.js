(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyMapsearchcontrol', {
            bindings: {
                options: '<',
                onPlaceChanged: '<'
            },
            controllerAs: 'msc',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$timeout', '$scope'];
    function controllerFn($timeout, $scope) {
        var msc = this;
        var _autocomplete;
        var _geocoder;

        msc.$onInit = function () {
            _autocomplete = new google.maps.places.AutocompleteService();
            _geocoder = new google.maps.Geocoder;
            angular.element(window).on('click.mapSearch', function () {
                clearSuggestions();
            });
        };

        msc.$onDestroy = function () {
            angular.element(window).off('click.mapSearch');
        };

        msc.keywordChanged = function () {
            var request = {
                input: msc.keyword,
                types: msc.options.types,
                componentRestrictions: msc.options.componentRestrictions
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
                });
            }
        };

        msc.itemClicked = function (prediction) {
            if (msc.onPlaceChanged) {
                _geocoder.geocode({ placeId: prediction.place_id }, function (places, status) {
                    if (status === 'OK') {
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
