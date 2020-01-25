(function () {
    'use strict';

    angular.drbblyRawModuleNames = [];

    var originalModuleFunc = angular.module;
    angular.module = function () {

        var module = originalModuleFunc.apply(this, arguments);

        //if registering the module for the first time... (vs. retrieving)
        if (arguments.length === 2) {

            var moduleName = arguments[0];
            var dependencies = arguments[1];

            if (moduleName === 'siteModule' || dependencies.drbblyIntersect(angular.drbblyRawModuleNames).drbblyAny()) {
                //this is our module for sure
                //(no one else is writing dependencies on our modules except us)
            }
            else {
                //NOT our module
                return module;
            }

            angular.drbblyRawModuleNames.push(moduleName); //Dribbly only

            overrideComponentFunc(module);
        }

        return module;
    };

    function overrideComponentFunc(module) {
        var originalComponentFn = module.component;
        module.component = function (componentName, options) {
            var moduleName = module.name.replace('Module', '');
            //if registering a component... (vs. retrieving)
            if (arguments.length === 2) {
                //override templateUrl
                if (options.templateUrl === 'drbbly-default') {
                    var trimmedComponentName = componentName.replace('drbbly', '').toLowerCase();
                    if (moduleName === 'main') {
                        if (trimmedComponentName.indexOf('container') > -1) {
                            options.templateUrl = './modules/main/containers/' + trimmedComponentName + '/'
                                + trimmedComponentName + '.component.html';
                        }
                        else {
                            options.templateUrl = './modules/main/components/' + trimmedComponentName + '/'
                                + trimmedComponentName + '.component.html';
                        }
                    }
                    else if (moduleName === 'app') {
                        options.templateUrl = './shared/modules/app/components/' + trimmedComponentName + '/'
                            + trimmedComponentName + '.component.html';
                    }
                    else if (moduleName === 'site') {
                        options.templateUrl = './shared/modules/site/components/' + trimmedComponentName + '/'
                            + trimmedComponentName + '.component.html';
                    }
                }
            }
            originalComponentFn.apply(module, arguments);
        };
    }

})();