"use strict"
var TemplateService = require("./templateService")
var cache = require('memory-cache');
var cacheEnabled = false;
var cacheTimeout = 1000 * 60 * 20 //20min

function getCache(path){
	for (var i = 0; i < cache.length; i++) {
		if(cache[i].path == path) return cache[i];
	}
	return false;
}


//COM CACHE
module.exports = function (filePath, options, callback) { // define the template engine
	console.log(options)
	var ts = options.ts;
	//console.log(options)
	
	var cached = cache.get(filePath);
	if(cached && options.settings['view cache']){
		return callback(null,cached)
	} 
	else {
		for(var key in options.reg){
			ts.registrarString(key, options.reg[key]);
		}
		ts.registrarString('importsJs', ts.prepararImportsJs(options.jsFiles));
		ts.registrarString('importsCss', ts.prepararImportsCss(options.cssFiles));
		ts.carregarPagina(filePath, function(err, content){
			if (err){
				return callback(err)
			}
			cache.put(filePath, content, cacheTimeout);
			return callback(null,content)
		})
	}
}


//SEM CACHE
 var x = function (filePath, options, callback) { // define the template engine
 	var ts = options.ts;

	/*ts.listaStringsSalvas.angular_objects = ts.prepararVariaveisAngular({
		teste:123,
		arrayobjs:[{obj1:1},{obj2:2}],
		string:"4123",
		obj:{nome:"nome", pessoa:"teste"}
	})*/

	ts.carregarPagina(filePath, function(err, content){
		if (err){
			return callback(err)
		}
		return callback(null,content)
	})

}