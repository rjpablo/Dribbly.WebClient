(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyCommonService', ['drbblyToastService', '$log', '$location', 'i18nService',
            'modalService',
            function (drbblyToastService, $log, $location, i18nService, modalService) {

                var _handleError = function (error, friendlyMsgKey, friendlyMsgRaw) {
                    // Do nothing if an HTTP error is passed because
                    // HTTP errors are automattically logged by the authInterceptor service.
                    if (!isHttpError(error)) {
                        var friendlyMsg;
                        var errorLog;
                        if (friendlyMsgKey) {
                            friendlyMsg = i18nService.getString(friendlyMsgKey);
                        }
                        else {
                            friendlyMsg = friendlyMsgRaw;
                        }

                        errorLog = buildErrorLog(error.message, error.message, null, null, error.stack);
                        $log.error(errorLog);
                    }
                };

                var _handleHttpError = function (error) {
                    var errorLog;
                    if (isHttpError(error)) {
                        switch (error.status) {
                            case 400: //bad request
                                errorLog = buildErrorLog(error.data.error, error.data.error_description, error.config.url,
                                    error.status);
                                break;
                            case 401: //unauthorized
                                errorLog = buildErrorLog(error.data.message, error.data.exceptionMessage, error.config.url,
                                    error.status);
                                break;
                            case 404: //NOT FOUND
                                errorLog = buildErrorLog(error.data.message, error.data.exceptionMessage, error.config.url,
                                    error.status);
                                break;
                            case 500: //internal server error
                                errorLog = buildErrorLog(error.data.message, error.data.exceptionMessage, error.config.url,
                                    error.status, error.data.stackTrace);
                                break;
                            case -1: //Unable to connect to server
                                errorLog = buildErrorLog(null, null, error.config.url,
                                    error.status);
                                break;
                            default: //unknown error
                                errorLog = buildErrorLog(null, null, error.config.url, error.status);
                                if (error.data) {
                                    errorLog.message = error.data.message;
                                    errorLog.errorMessage = error.data.exceptionMessage || error.data.error_description;
                                    errorLog.stack = error.data.stackTrace;
                                }
                        }

                        showFriendlyError(error.data);

                    }
                    else {
                        errorLog = buildErrorLog('Tried to log non-HTTP error as HTTP', error.message, null, null, error.stack);
                    }

                    $log.error(errorLog);
                };

                function isHttpError(error) {
                    return error.config && error.status;
                }

                function showFriendlyError(error) {
                    if (error && (error.friendlyMessage || error.friendlyMessageKey)) {
                        modalService.alert({
                            msg2Key: error.friendlyMessageKey,
                            msg2Raw: error.friendlyMessage
                        });
                    }
                }

                function buildErrorLog(msg, errorMsg, url, errorCode, stackTrace) {
                    return {
                        message: msg,
                        errorMessage: errorMsg,
                        url: url,
                        errorCode: errorCode,
                        stack: stackTrace
                    };
                }

                function logError(error) {
                    var serverErrorMsg;

                    if (error.status) {
                        switch (error.status) {
                            case 400: //bad request
                                serverErrorMsg = error.data.error_description;
                                break;
                            case 401: //unauthorized
                                serverErrorMsg = 'Access denied.';
                                break;
                            case 500: //internal server error
                                if (error.data && error.data.exceptionMessage) {
                                    serverErrorMsg = error.data.exceptionMessage;

                                } else {
                                    serverErrorMsg = 'An internal error occured. Please try again.';
                                }
                                break;
                            case -1: //Unable to connect to server
                                $log.error('Could not send request.');
                                break;
                            default: //unknown error
                                $log.error('An unknown error occured.');
                        }
                    }
                    else {
                        if (error.exceptionMessage) {
                            serverErrorMsg = error.exceptionMessage;
                            $log.error(serverErrorMsg);
                        }
                    }
                }

                function _prompt(prompt, title) {
                    return window.prompt(prompt);
                }

                var _redirectToUrl = function (url) {
                    $location.path(url);
                };

                var _setPageTitle = function (title) {
                    window.document.title = title + ' - Dribbly';
                };

                function _parseQueryString(queryString) {
                    var data = {},
                        pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

                    if (queryString === null) {
                        return data;
                    }

                    pairs = queryString.split("&");

                    for (var i = 0; i < pairs.length; i++) {
                        pair = pairs[i];
                        separatorIndex = pair.indexOf("=");

                        if (separatorIndex === -1) {
                            escapedKey = pair;
                            escapedValue = null;
                        } else {
                            escapedKey = pair.substr(0, separatorIndex);
                            escapedValue = pair.substr(separatorIndex + 1);
                        }

                        key = decodeURIComponent(escapedKey);
                        value = decodeURIComponent(escapedValue);

                        data[key] = value;
                    }

                    return data;
                }

                this.toast = drbblyToastService;
                this.handleError = _handleError;
                this.handleHttpError = _handleHttpError;
                this.log = $log;
                this.prompt = _prompt;
                this.redirectToUrl = _redirectToUrl;
                this.parseQueryString = _parseQueryString;
                this.setPageTitle = _setPageTitle;

            }]);
})();