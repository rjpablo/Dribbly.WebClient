﻿(function () {

    // String extensions
    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1)
    };

    String.prototype.toLowerFirst = function () {
        return this.charAt(0).toLowerCase() + this.slice(1)
    };

})();
