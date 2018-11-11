'use strict';

System.register('squeevee/squeevents/main', ['flarum/extend', 'flarum/app'], function (_export, _context) {
  "use strict";

  var extend, override, app;
  return {
    setters: [function (_flarumExtend) {
      extend = _flarumExtend.extend;
      override = _flarumExtend.override;
    }, function (_flarumApp) {
      app = _flarumApp.default;
    }],
    execute: function () {

      app.initializers.add('squeevee-squeevents', function () {
        if (!squeevents) return;

        if (squeevents.enable_log) console.log({ squeevents_message: 'Starting Squeevents' });

        try {
          var _data = squeevents.data;

          if (!_data) {
            if (squeevents.enable_log) console.log({ squeevents_message: 'No data could be found. Terminating Squeevents.' });
            return;
          }

          if (!_data.squeevents.length) {
            if (squeevents.enable_log) console.log({ squeevents_message: 'No Squeevents were registered. Terminating Squeevents.' });
            return;
          }

          squeevents.requisites = {
            extend: extend,
            override: override,
            app: app
          };

          var requisitesCount = 0;
          _data.requisites.forEach(function (require) {
            var moduleObject = System.get(require.moduleName);
            if (!moduleObject) {
              if (squeevents.enable_log) {
                console.log({
                  squeevents_message: 'Could not load module of required export',
                  require: require
                });
              }
              return;
            }

            var entity = moduleObject[require.exportName];

            if (!entity) {
              if (squeevents.enable_log) {
                console.log({
                  squeevents_message: 'Could not find required export on module',
                  require: require
                });
              }
              return;
            }

            squeevents.requisites[require.alias] = entity;
            requisitesCount++;
          });

          if (requisitesCount > 0 && squeevents.enable_log) {
            console.log({
              squeevee_message: 'Successfully located required exports',
              count: requisitesCount
            });
          }

          var squeeventsCount = 0;
          _data.squeevents.forEach(function (squeevent) {
            var moduleObject = System.get(squeevent.moduleName);
            if (!moduleObject || !moduleObject.default) {
              if (squeevents.enable_log) {
                console.log({
                  squeevents_message: 'Could not load Squeevent module',
                  squeevent: squeevent
                });
              }
              return;
            }

            if (squeevent.extend) {
              extend(moduleObject.default.prototype, squeevent.methodName, function (args) {
                try {
                  if (squeevents.enable_log) {
                    console.log({ squeevents_message: 'Executing Squeevent',
                      squeevent: squeevent,
                      eventType: 'extend',
                      caller: this });
                  }
                  if (!Array.isArray(args)) {
                    args = [args];
                  }
                  squeevent.extend.apply(this, args);
                } catch (e) {
                  if (squeevents.enable_log) console.log({ squeevents_message: 'Execution error', error: e });
                }
              });
              squeeventsCount++;
            } else if (squeevent.override) {
              override(moduleObject.default.prototype, squeevent.methodName, function (args) {
                try {
                  if (squeevents.enable_log) {
                    console.log({ squeevents_message: 'Executing Squeevent',
                      squeevent: squeevent,
                      eventType: 'override',
                      caller: this });
                  }
                  if (!Array.isArray(args)) {
                    args = [args];
                  }
                  return squeevent.override.apply(this, args);
                } catch (e) {
                  if (squeevents.enable_log) console.log({ squeevents_message: 'Execution error', error: e });
                }
              });
              squeeventsCount++;
            } else {
              throw new Error('Unexpected fallthrough');
            }
          });

          if (squeeventsCount > 0 && squeevents.enable_log) {
            console.log({
              squeevee_message: 'Successfully attached Squeevents',
              count: squeeventsCount
            });
          }
        } catch (e) {
          if (squeevents.enable_log) {
            console.log({
              squeevents_message: 'Error starting Squeevents',
              error: e
            });
          }
        }
      });
    }
  };
});