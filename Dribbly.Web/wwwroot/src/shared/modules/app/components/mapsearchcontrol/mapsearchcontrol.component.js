﻿(function () {
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

    controllerFn.$inject = ['$timeout', '$scope', '$log', 'mapService'];
    function controllerFn($timeout, $scope, $log, mapService) {
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
                keyword: msc.keyword,
                type: msc.options.type
            };
            clearSuggestions();

            if (msc.keyword) {
                mapService.search(request)
                    .then((result) => {
                        console.log('search results: ', result);
                        msc.suggestions = result;
                        $timeout(function () {
                            $scope.$apply(); //needed for suggestions to show immediately
                        });
                    });
            }
        };

        msc.setText = (text) => msc.keyword = text;

        msc.blur = () => {
            msc.options.onBlur && msc.options.onBlur();
        };

        msc.itemClicked = function (place) {
            if (msc.onPlaceChanged) {
                msc.keyword = place.name;
                msc.onPlaceChanged(place);
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
