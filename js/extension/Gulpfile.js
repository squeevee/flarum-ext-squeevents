var flarum = require('flarum-gulp');

flarum({
  modules: {
    'squeevee/squeevents': [
      'src/**/*.js'
    ]
  }
});
