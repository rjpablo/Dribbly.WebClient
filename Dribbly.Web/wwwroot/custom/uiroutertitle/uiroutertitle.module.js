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
                $get: ['$state', function ($state) {
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
        }]);
})(window.angular);