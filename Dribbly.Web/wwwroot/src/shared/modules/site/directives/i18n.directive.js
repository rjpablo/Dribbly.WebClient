(function () {
    'use strict';

    angular.module('siteModule')
        .directive('i18n', ['i18nService', '$sanitize',
            function (i18nService, $sanitize) {

                function update(elm, exp, subs) {
                    var text = i18nService.getString(exp, subs);
                    var html = $sanitize(text);
                    if (html !== elm.html()) {
                        elm.html(html);
                    }
                }

                function linkFunc(scope, elm, attrs) {
                    var subs;

                    //the i18n attribute might be "{{vm.template}}" (dynamic)
                    //or it might be "library.key" (static)

                    //attrs contains the values AFTER they are digested by angular

                    //attr is raw name, all lower with hyphens  (ex: i18n-meter-no)
                    //normAttr is normalized attr name ("data-" prefix removed, all hyphens removed, camel-case) (ex: i18nMeterNo)
                    //simpleName removes i18n- prefix (ex: meterNo)

                    angular.forEach(attrs.$attr, function (attr, normAttr) {
                        if (attr.substring(0, 5) === 'i18n-') {
                            subs = subs || {};
                            var simpleName = normAttr.charAt(4).toLowerCase() + normAttr.slice(5);

                            //don't set up an observation unless we have to
                            var attrRawValue = elm.attr(attr);

                            if (isDynamic(attrRawValue)) {
                                subs[simpleName] = ''; //optimize for first hit

                                var updateOnce = isOneTimeBind(attrRawValue);

                                var stop = attrs.$observe(normAttr, function (newVal, oldVal) {
                                    if (subs[simpleName] !== newVal) {
                                        subs[simpleName] = newVal;
                                        update(elm, attrs.i18n, subs);

                                        if (updateOnce) {
                                            stop();
                                        }
                                    }
                                });
                            }
                            else {
                                subs[simpleName] = attrs[normAttr];
                                update(elm, attrs.i18n, subs); //take the currently digested value (string or one-time-bind)
                            }
                        }
                    });

                    //don't set up an observation unless we have to
                    var i18nRawToken = elm.attr('i18n');

                    if (isDynamic(i18nRawToken)) {
                        var updateOnce = isOneTimeBind(i18nRawToken);

                        var stop = attrs.$observe('i18n', function (newVal, oldVal) {
                            if (newVal && newVal !== oldVal) {
                                update(elm, newVal, subs);

                                if (updateOnce) {
                                    stop();
                                }
                            }
                        });
                    }
                    else {
                        update(elm, attrs.i18n, subs); //take the currently digested value (static string)
                    }

                    function isDynamic(rawAttrVal) {
                        return rawAttrVal.substring(0, 2) === '{{';
                    }

                    function isOneTimeBind(rawAttrVal) {
                        return rawAttrVal.indexOf('::') > -1;
                    }
                }

                return {
                    restrict: 'A',
                    link: linkFunc
                };
            }
        ]);
})();
