(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyCommonService', ['drbblyToastService', '$log', '$location', 'i18nService',
            function (drbblyToastService, $log, $location, i18nService) {

                var _handleError = function (error, friendlyMsgKey, friendlyMsgRaw) {
                    var friendlyMsg;
                    var serverErrorMsg;
                    if (friendlyMsgKey) {
                        friendlyMsg = i18nService.getString(friendlyMsgKey);
                    }
                    else {
                        friendlyMsg = friendlyMsgRaw;
                    }

                    if (error.status) {
                        switch (error.status) {
                            case 400: //bad request
                                serverErrorMsg = error.data.error_description;
                                $log.error(error.error_description);
                                break;
                            case 401: //unauthorized
                                serverErrorMsg = 'Access denied.';
                                $log.error(error.data.Message);
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

                    drbblyToastService.error(friendlyMsg || serverErrorMsg || 'An unknown error occured.');
                };

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
                this.log = $log;
                this.prompt = _prompt;
                this.redirectToUrl = _redirectToUrl;
                this.parseQueryString = _parseQueryString;
                this.setPageTitle = _setPageTitle;

            }]);
})();