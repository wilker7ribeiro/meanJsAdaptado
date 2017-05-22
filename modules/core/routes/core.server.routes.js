'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core');

  // Define error pages
  

  // Return a 404 for all undefined api, module or lib routes
  

  // Define application route
  app.route('/').get(core.renderIndex);
  app.route('/teste/').get(function(req, res){res.send('Path not found')});

  //app.get('/:url'core.renderNotFound);
};
