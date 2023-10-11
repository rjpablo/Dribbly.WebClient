(function (angular) {

    'use strict';
    var documentTitleCallback = undefined;
    var defaultDocumentTitle = document.title;
    angular.module('drrbly.ui.router.title', ['ui.router'])
        .provider('$title', function $titleProvider() {
            return {
                documentTitle: function (cb) {
                    documentTitleCallback = cb;
                },
                $get: ['$rootScope', '$timeout', '$state', '$injector',
                    function ($rootScope, $timeout, $state, $injector) {
                        return {
                            breadCrumbs: function (trans) {
                                var $breadcrumbs = [];
                                var state = trans.targetState().$state();

                                while (state && state.navigable) {
                                    var hasTitle = state.resolvables.some(s => s.token === '$title');

                                    $breadcrumbs.unshift({
                                        title: hasTitle ? trans.injector(state).get('$title') : state.name,
                                        state: state.name,
                                        stateParams: state.params
                                    });

                                    state = state.parent;
                                }
                                return $breadcrumbs;
                            }
                        };
                    }]
            };
        })
        .run(['$rootScope', '$timeout', '$title', '$injector', '$transitions',
            function ($rootScope, $timeout, $title, $injector, $transitions) {
                $transitions.onSuccess({}, function (trans) {
                    var titleKey = trans.injector().get('$titleKey');
                    var i18n = $injector.get('i18nService').getString;
                    $timeout(function () {
                        $rootScope.$root.$title = i18n(titleKey);
                        var documentTitle = documentTitleCallback ? $injector.invoke(documentTitleCallback) :
                            i18n(titleKey) || defaultDocumentTitle;
                        document.title = documentTitle;
                    });
                    $rootScope.$breadcrumbs = $title.breadCrumbs(trans);
                });
            }])
        .service('$titleService', ['$rootScope', '$timeout', '$state', '$injector',
            function ($rootScope, $timeout, $state, $injector) {
                function setTitle(state) {
                    state = state || $state.current;
                    var titleKey = state.resolve.$titleKey();
                    if (titleKey) {
                        var i18n = $injector.get('i18nService').getString;
                        $rootScope.$root.$title = i18n(titleKey);
                        var documentTitle = documentTitleCallback ? $injector.invoke(documentTitleCallback) :
                            i18n(titleKey) || defaultDocumentTitle;
                        // Use timeout to allow browser history to get updated with the current
                        // value of document.title. There is an issue when preventing backward
                        // redirect where the previous entry in the browser history get updated
                        // with the current item's title
                        $timeout(() => document.title = documentTitle);
                    }
                    else {
                        console.log('No title key provided for state ' + state.name);
                    }
                }

                var service = {
                    setTitle: setTitle
                };

                return service;

            }]);
})(window.angular);