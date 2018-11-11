// 'Squeevents' source code
// (c) 2018 Ellie Hawk "@squeevee"
// See 'Squeevents' license for copyright info

var squeevents;
{
  function validate(moduleName, methodName, callback) {
    if (window.squeevents.closed)
        throw new Error('Squeevents are closed: no new Squeevents may be registered.');
    if (!moduleName || !methodName)
      throw new Error('Squeevent must include a module and a method');
    if (!callback || typeof callback !== 'function')
      throw new Error('Squeevent callback must be a valid function');
  };

  squeevents = {
    data: { squeevents: [], requisites: [] },
    enable_log: false,
    closed: false,

    extend: function(moduleName, methodName, callback) {
      validate(moduleName, methodName, callback);
      this.data.squeevents.push({
        moduleName: moduleName,
        methodName: methodName,
        extend: callback
      });
    },
    override: function(moduleName, methodName, callback) {
      validate(moduleName, methodName, callback);
      this.data.squeevents.push({
        moduleName: moduleName,
        methodName: methodName,
        override: callback
      });
    },
    require: function(moduleName, alias, exportName) {
      this.data.requisites.push({
        moduleName: moduleName,
        alias: alias,
        exportName: exportName
      });
    }
  };
}
