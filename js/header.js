// 'Squeevents' source code
// (c) 2018 Ellie Hawk "@squeevee"
// See 'Squeevents' license for copyright info

{
  function validate(module, method, callback) {
    if (window.squeevents.closed)
        throw new Error('Squeevents are closed: no new Squeevents may be registered.');
    if (!module || !method)
      throw new Error('Squeevent must include a module and a method');
    if (!callback || typeof callback !== 'function')
      throw new Error('Squeevent callback must be a valid function');
  }

  window.squeevents = {
    data: [],
    enable_log: false,
    closed: false,
    extend: function(module, method, callback) {
        validate(module, method, callback);
        this.data.push({
            module: module,
            method: method,
            extend: callback
      })
    },
    override: function(module, method, callback) {
        validate(module, method, callback);
        this.data.push({
            module: module,
            method: method,
            override: callback
      })
      }
  };
}
