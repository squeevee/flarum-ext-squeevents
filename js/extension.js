//============================================================================================
// 'Squeevents' source code
// (c) 2018 Ellie Hawk "@squeevee"
// See 'Squeevents' license for copyright info

'use strict';

//This extension is written in browser-compatible JavaScript rather than ES6, so we can tap into
//the transpiler's helper functions and do some of our own runtime linking.

{
  var _enable_log = window.squeevents && window.squeevents.enable_log;
  try {
    //Most of the validation is done on the API side, but just do a quick check here.
    if (!window.squeevents || !window.squeevents.data)
      throw new Error('Squeevents data missing');

    var _data = window.squeevents.data;

    //And skip if empty
    if (_data.length === 0)
      throw new Error('No Squeevents registered.');

    //Disable the api methods so they don't get called during callbacks or other extensions. Attempting
    //to register more events won't do anything now anyway.
    window.squeevents.closed = true;

    //Register with the system
    function getDependencies () {
      return ['flarum/extend', 'flarum/app'].concat(_data.map(function(squeevent) {
        return squeevent.module;
      }));
    }
    System.register('squeevee/squeevents/main', getDependencies(), function (_export, _context) {
      "use strict";

      var extend, override, app;
      var squeeventModules = [];

      //Chuck any bad modules
      data = _data.filter(function(squeevent) {
        var result = System.has(squeevent.module);
        if (!result && _enable_log)
          console.log({
            squeevents_message: 'module not found',
            module: squeevent.module
          });
      });

      //used while populating the module with its dependencies
      function getSetters() {
        var result = [function (_flarumExtend) {
            extend = _flarumExtend.extend;
            override = _flarumExtend.override;
          }, function (_flarumApp) {
            app = _flarumApp.default;
          }];

          _data.forEach(function(_, index) {
            result.push(function(_squeeventModule) {
              squeeventModules[index] = _squeeventModule.default;
            });
          });

          return result;
      }

      return {
        setters: getSetters(),
        execute: function () {
          try {
            app.initializers.add('squeevee-squeevents', function () {
              //The app is now initialized.
              try {
                _data.forEach(function(squeevent, index) {
                  var moduleObject = squeeventModules[index].prototype;

                  //skip any bad methods
                  if (!moduleObject[squeevent.method] || typeof moduleObject[squeevent.method] !== 'function') {
                    if (_enable_log)
                      console.log({squeevents_message: 'Method does not exist',
                        method: squeevent.method,
                        module: squeevent.module,
                        caller: moduleObject
                      });
                      return; //skip to next squeevent
                  }

                  if (squeevent.extend) {
                    extend(moduleObject, squeevent.method, function(args) {
                      try {
                        if (_enable_log) {
                          console.log({squeevents_message: 'Executing Squeevent extend function',
                            caller: this,
                            eventType: 'extend',
                            module: squeevent.module,
                            method: squeevent.method,
                            callback: squeevent.extend});
                        }
                        squeevent.extend.apply(this, args);
                      } catch(e) {
                        if (_enable_log)
                          console.log({squeevents_message: 'Execution error', error: e});
                      }
                    });
                  }
                  else if (squeevent.override) {
                    override(moduleObject, squeevent.method, function(args) {
                      try {
                        if (_enable_log) {
                          console.log({squeevents_message: 'Executing Squeevent override function',
                            caller: this,
                            eventType: 'override',
                            module: squeevent.module,
                            method: squeevent.method,
                            callback: squeevent.override});
                        }
                        return squeevent.override.apply(this, args);
                      } catch(e) {
                        if (_enable_log)
                          console.log({squeevents_message: 'Execution error', error: e});
                      }
                    });
                  } else {
                    throw new Error('Unexpected fallthrough: Squeevent had no extend or override');
                  }
                })
              } catch (e) {}
            });
          } catch (e) {}
        }
      };
    });
  } catch (e) {
    //it's easier to give the System a dummy module that doesn't require or do anything
    //than to try and convince it not to come looking for this module.
    System.register('squeevee/squeevents/main', [], function() {
      return {
        setters: [],
        execute: function() {}
      }
    });
  }
}
//End 'Squeevents' source code
//============================================================================================
