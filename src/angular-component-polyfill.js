'use strict';
(() => {
  if ( angular && (angular.version.major === 1 && angular.version.minor < 5) ) {
    const ng = angular.module;

    angular.module = module;

    function module() {
      const hijacked = ng.apply(this, arguments);

      hijacked.component = component;

      return hijacked;

      function component(name, options) {

        const factory = ($injector) => {
          'ngInject';
          const makeInjectable = (fn) => {
            if (angular.isFunction(fn)) {
              return function (tElement, tAttrs) {
                return $injector.invoke(fn, window, {
                  $element: tElement,
                  $attrs: tAttrs
                });
              };
            } else {
              return fn;
            }
          };

          return {
            controller: options.controller || angular.noop,
            controllerAs: controllerIdentifier(options.controller) || options.controllerAs || name,
            template: makeInjectable(!options.template && !options.templateUrl ? '' : options.template),
            templateUrl: makeInjectable(options.templateUrl),
            transclude: options.transclude === 'undefined' ? true : options.transclude,
            scope: (options.isolate === false ? true : options.bindings),
            bindToController: !!options.bindings,
            restrict: options.restrict || 'E'
          };
        };

        if ( options.$canActivate ) {
          factory.$canActivate = options.$canActivate;
        }

        if ( options.$routeConfig ) {
          factory.$routeConfig = options.$routeConfig;
        }

        return hijacked.directive(name, factory);
      }
    }


  }
})(window);

