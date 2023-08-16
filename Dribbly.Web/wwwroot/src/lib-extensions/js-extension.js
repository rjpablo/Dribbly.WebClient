(function () {

    // String extensions
    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1)
    };

    String.prototype.toLowerFirst = function () {
        return this.charAt(0).toLowerCase() + this.slice(1)
    };

    Number.prototype.toOrdinal = function () {
        var ord = 'th';

        if (this % 10 === 1 && this % 100 !== 11) {
            ord = 'st';
        }
        else if (this % 10 === 2 && this % 100 !== 12) {
            ord = 'nd';
        }
        else if (this % 10 === 3 && this % 100 !== 13) {
            ord = 'rd';
        }

        return this + ord;
    };

})();
