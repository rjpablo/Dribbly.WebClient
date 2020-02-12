(function () {
    'use strict';

    Object.defineProperty(Array.prototype, 'drbblyWhere', {
        value: function (filter, maxHits) {

            var collection = this;

            switch (typeof filter) {

                case 'function':
                    //return $.grep(collection, filter);  //doesn't support short-circuiting
                    var returnCollection = [];
                    for (var i = 0; i < collection.length; i++) {
                        if (filter(collection[i])) {
                            returnCollection.push(collection[i]);
                            if (maxHits && returnCollection.length === maxHits) {
                                break;
                            }
                        }
                    }
                    return returnCollection;

                case 'object':
                    //there may be multiple properties on filter object like this { foo: true, bar: 42 }
                    //match all properties like as an "and"

                    //$.grep doesn't short-circuit, so we do this manually

                    var properties = [];
                    for (var property in filter) {
                        //only get "real" properties on our filter object.
                        if (filter.hasOwnProperty(property)) {
                            properties.push(property);
                        }
                    }

                    return this.drbblyWhere(function (item) {

                        for (var i = 0; i < properties.length; i++) {
                            if (item[properties[i]] !== filter[properties[i]]) {
                                return false; //no match
                            }
                        }

                        return true; //matched all properties

                    }, maxHits);

                default:
                    throw new TypeError('func must be either a ' +
                        ' function or an object of properties and values to filter by.');
            }
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyExclude', {
        value: function (filter) {

            var unwanteds = angular.isArray(filter) ? filter : this.drbblyWhere(filter);

            //TODO: This is not every efficient...
            return $.grep(this, function (item) {
                return $.inArray(item, unwanteds) === -1;
            });
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyFirst', {
        value: function (filter) {
            var item = this.drbblyFirstOrDefault(filter);

            if (!item) {
                throw new Error('.drbblyFirst() is not applicable if there are no items. ' +
                    'Use .drbblyFirstOrDefault() if null is acceptable.');
            }

            return item;
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyFirstOrDefault', {
        value: function (filter, defaultValue) {
            var items = this;

            if (filter) {
                items = this.drbblyWhere(filter, 1);
            }

            if (!items.length) {
                if (arguments.length === 2) {
                    return defaultValue;
                }
                return null;
            }

            return items[0];
        }
    });

    Object.defineProperty(Array.prototype, 'drbblySingle', {
        value: function (filter) {
            var item = this.drbblySingleOrDefault(filter);

            if (!item) {
                throw new Error('.drbblySingle() is not applicable if there is not exactly one match. ' +
                    'Use .drbblySingleOrDefault() if null is acceptable.');
            }

            return item;
        }
    });

    Object.defineProperty(Array.prototype, 'drbblySingleOrDefault', {
        value: function (filter, defaultValue) {
            var items = this;

            if (filter) {
                items = this.drbblyWhere(filter, 2); //pull back max of 2 so we can throw exception below
            }

            if (items.length === 1) {
                return items[0];
            }

            if (items.length > 1) {
                throw new Error('.drbblySingle() is not applicable if there is not exactly one match. Multiple matches found.');
            }

            if (arguments.length === 2) {
                return defaultValue;
            }

            return null;
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyLast', {
        value: function () {
            var item = this.drbblyLastOrDefault();

            if (!item) {
                throw new Error('.drbblyLast is not applicable if there is not exactly one match. ' +
                    'Use .drbblyLastOrDefault() if null is acceptable.');
            }

            return item;
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyLastOrDefault', {
        value: function (defaultValue) {
            if (this.length > 0) {
                return this[this.length - 1];
            }

            if (arguments.length === 1) {
                return defaultValue;
            }

            return null;
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyAny', {
        value: function (filter) {
            if (filter) {
                return this.drbblyWhere(filter, 1).length > 0;
            }

            return this.length > 0;
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyContains', {
        value: function (item) {
            if (angular.isDate(item)) {
                var serializedItems = $.map(this, function (i) {
                    return i.toString();
                });
                return serializedItems.indexOf(item.toString()) !== -1;
            }

            return this.indexOf(item) !== -1;
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyRemove', {
        value: function (item) {

            if (angular.isNumber(item)) {
                this.splice(item, 1);
            }
            else {

                //assume the item is an item to remove
                var index = this.indexOf(item);
                if (index > -1) {
                    this.splice(index, 1);
                }
                else {
                    //else, assume the item is a filter of item(s) to remove
                    var objects = this.drbblyWhere(item);
                    for (var i = 0; i < objects.length; i++) {
                        this.drbblyRemove(objects[i]);
                    }
                }

            }

            return this;
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyMove', {
        value: function (fromIndex, toIndex) {
            //move the item without destroying the reference (this is not a copy)
            this.splice(toIndex, 0, this.splice(fromIndex, 1)[0]);
            return this; //for chaining
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyCount', {
        value: function (filter) {
            if (filter) {
                return this.drbblyWhere(filter).length;
            }

            return this.length;
        }
    });

    Object.defineProperty(Array.prototype, 'drbblySum', {
        value: function (propertyOrFunc) {

            var sum = 0;
            var isFunc = angular.isFunction(propertyOrFunc);

            for (var i = 0; i < this.length; i++) {

                var value = (isFunc ? propertyOrFunc(this[i]) : this[i][propertyOrFunc]) || 0;
                value = drbbly.isNumber(value) ? parseFloat(value) : 0;

                sum += value;
            }

            return sum;
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyMax', {
        value: function (propertyOrFunc) {

            var max = Number.MIN_VALUE;
            var isFunc = angular.isFunction(propertyOrFunc);

            for (var i = 0; i < this.length; i++) {

                var value = (isFunc ? propertyOrFunc(this[i]) : this[i][propertyOrFunc]) || Number.MIN_VALUE;
                value = drbbly.isNumber(value) ? parseFloat(value) : Number.MIN_VALUE;

                max = Math.max(max, value);
            }

            return max;
        }
    });

    //similar to foreach but returns the array for chaining
    Object.defineProperty(Array.prototype, 'drbblyPipe', {
        value: function (func) {

            for (var i = 0; i < this.length; i++) {
                func(this[i]);
            }

            return this;
        }
    });

    /*
    * Wrapping the map function to get left to right fluency
    */
    Object.defineProperty(Array.prototype, 'drbblySelect', {
        value: function (func) {

            return $.map(this, function (item) {
                return func(item);
            });
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyDistinct', {
        value: function (propertyOrFunc) {
            var uniqueItems = [];
            var isFunc = angular.isFunction(propertyOrFunc);

            for (var i = 0; i < this.length; i++) {

                var value = isFunc ? propertyOrFunc(this[i]) : this[i][propertyOrFunc];

                if (!uniqueItems.drbblyContains(value)) {
                    uniqueItems.push(value);
                }
            }
            return uniqueItems;
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyAll', {
        value: function (filter) {
            if (filter) {
                return this.drbblyWhere(filter).length === this.length;
            }
            throw new Error('filter is required');
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyIntersect', {
        value: function (array) {
            if (array) {
                return this.drbblyWhere(function (i) {
                    return array.drbblyContains(i);
                });
            }
            throw new Error('array is required');
        }
    });

    Object.defineProperty(Array.prototype, 'drbblyAdd', {
        value: function (item) {
            this.push(item);
            return this;
        }
    });

})();
