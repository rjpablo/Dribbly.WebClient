(function () {
    'use strict';

    angular.module('appModule')
        .service('drbblyToolbarService', [function () {

            /* An item can have the following properties:
            *    buttonClass - the class that will be assigned to the <button> element's ngclass attribute
            *    iconClass - the class that will be assign to the <i> ilement
            *    action - the function that will be executed when the item is clicked
            */

            var _items;
            var _onSetItemsCallbacks = [];

            function setItems(items) {
                _items = items || [];

                _onSetItemsCallbacks.forEach(function (cb) {
                    cb({ items: _items });
                });
            }

            function getItems() {
                return _items;
            }

            function onSetItems(callback) {
                if (_onSetItemsCallbacks.indexOf(callback) === -1) {
                    _onSetItemsCallbacks.push(callback);

                    //return a function for unsubscription
                    return () => {
                        var index = _onSetItemsCallbacks.indexOf(callback);
                        if (index > -1) {
                            _onSetItemsCallbacks(index, 1);
                        }
                    };
                }
            }

            function buildItem(iconClass, action, buttonClass) {
                return {
                    iconClass: iconClass,
                    action: action,
                    buttonClass: buttonClass
                };
            }

            function reset(items) {
                setItems(items || []);
            }

            var _service = {
                buildItem: buildItem,
                getItems: getItems,
                onSetItems: onSetItems,
                reset: reset,
                setItems: setItems
            };

            return _service;
        }]);

})();