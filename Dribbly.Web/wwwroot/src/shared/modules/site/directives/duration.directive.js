(function () {
    'use strict';

    angular.module('siteModule')
        .directive('drbblyDuration', ['i18nService', '$sanitize',
            function (i18nService, $sanitize) {

                function update(elm, value) {
                    var text = i18nService.getString('app.FormattedDuration', getDurationComponents(value));
                    var html = $sanitize(text);
                    if (html !== elm.html()) {
                        elm.html(html);
                    }
                }

                function getDurationComponents(minutes) {
                    return {
                        hours: Math.floor(minutes / 60),
                        minutes: minutes % 60
                    };
                }

                function linkFunc(scope, elm, attrs) {
                    update(elm, attrs.drbblyDuration);

                    attrs.$observe('drbblyDuration', function (newVal, oldVal) {
                        if (newVal && newVal !== oldVal) {
                            update(elm, newVal);
                        }
                    });
                }

                return {
                    restrict: 'A',
                    link: linkFunc
                };
            }
        ]);
})();
