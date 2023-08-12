(function () {

    var originalOnError = window.onerror;
    window.onerror = function (errorMsg, url, lineNo, column, errorObj) {
        if (originalOnError) {
            originalOnError(msg);
        }

        window.Dribbly.logClientException("Client Exception", errorMsg, url, null, errorObj ? errorObj.stack : null,
            lineNo, column);

        // Tell browser to run its own error handler as well
        return false;
    };
})();
