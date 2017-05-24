'use strict';

var validator = require('validator'),
  path = require('path'),
  config = require(path.resolve('./config/config'));

/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
  var safeUserObject = null;
  if (req.user) {
    safeUserObject = {
      displayName: validator.escape(req.user.displayName),
      provider: validator.escape(req.user.provider),
      username: validator.escape(req.user.username),
      created: req.user.created.toString(),
      roles: req.user.roles,
      profileImageURL: req.user.profileImageURL,
      email: validator.escape(req.user.email),
      lastName: validator.escape(req.user.lastName),
      firstName: validator.escape(req.user.firstName),
      additionalProvidersData: req.user.additionalProvidersData
    };
  }

  req.ts.registrarString('angular_objects', req.ts.prepararVariaveisAngular({
  	teste:123,
  	arrayobjs:[{obj1:1},{obj2:2}],
  	string:"4123",
  	obj:{nome:"nome", pessoa:"teste"}
  }))

  req.ts.setModulo('core');
  req.ts.load('modules/core/views/templates/home/view/home', res)
};

/**
 * Render the server error page
 */
/*exports.renderServerError = function (req, res) {
	console.log('teste')
  res.status(500).render('modules/core/views/500', {
    error: 'Oops! Something went wrong...'
  });
};*/

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

  res.status(404).format({
    'text/html': function () {
      res.render('modules/core/views/404', {
        url: req.originalUrl
      });
    },
    'application/json': function () {
      res.json({
        error: 'Path not found'
      });
    },
    'default': function () {
      res.send('Path not found');
    }
  });
};
