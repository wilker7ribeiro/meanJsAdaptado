	"use strict"
	var fs = require('fs');
	var glob = require('glob');
	var _ = require('lodash');

	var getGlobbedPaths = function (globPatterns, excludes) {
	  // URL paths regex
	  var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	  // The output array
	  var output = [];

	  // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
	  if (_.isArray(globPatterns)) {
	  	globPatterns.forEach(function (globPattern) {
	  		output = _.union(output, getGlobbedPaths(globPattern, excludes));
	  	});
	  } else if (_.isString(globPatterns)) {
	  	if (urlRegex.test(globPatterns)) {
	  		output.push(globPatterns);
	  	} else {
	  		var files = glob.sync(globPatterns);
	  		if (excludes) {
	  			files = files.map(function (file) {
	  				if (_.isArray(excludes)) {
	  					for (var i in excludes) {
	  						if (excludes.hasOwnProperty(i)) {
	  							file = file.replace(excludes[i], '');
	  						}
	  					}
	  				} else {
	  					file = file.replace(excludes, '');
	  				}
	  				return file;
	  			});
	  		}
	  		output = _.union(output, files);
	  	}
	  }

	  return output;
	};

	class TemplateService {
		constructor(loc, modulo){
			this.listaStringsSalvas = {};
			this.loc = loc || "pt_BR";
			this.modulo = modulo || 'core';
		}

		getArquivoStrings (loc){
			try{
				var jsonStrings = fs.readFileSync(this.getLocStringsFilePath()+loc+".json");
			} catch(err){

				var jsonStrings = fs.readFileSync(this.getLocStringsFilePath()+"pt_BR"+".json");
			}
			return jsonStrings;
		}


		carregarPagina (path, cb){
			var self = this;
			var conteudoPagina;
			try {
				conteudoPagina = fs.readFileSync(path).toString();
			} catch (err){
				cb(err)
			}

			conteudoPagina = conteudoPagina.replace(REGEX_TEMPLATE_SERVICE, function(match,capture){
				return self.replaceAuto(match, capture);
			})

			cb(null,conteudoPagina);
		}

		processarTemplate (flag){
			//console.log(flag)
			var content;
			var self = this;
			flag = flag.substring(4, flag.length);
			var path = flag.replace(/=/g,"/");
			try {
				
				content = fs.readFileSync(this.getTemplatePath()+path+FILE_SUFFIX).toString();
			} catch (err){
				return "^"+path+"^"
			}

			content = content.replace(REGEX_TEMPLATE_SERVICE, function(match,capture){
				return self.replaceAuto(match, capture)
			})
			return content;
		}


		processarMatchTemplate(flag){
			console.log(flag)
			return this.processarTemplate(flag, this.loc);
		}

		processarMatchLocString(flag){
			flag = flag.substring(4, flag.length);

			return this.getArquivoStrings(this.loc)[flag.toUpperCase()] || flag
		}

		processarMatchString(flag){
			return this.listaStringsSalvas[flag] || flag;
		}

		replaceAuto(match, capture){
			var flag = capture;
			if(capture.startsWith(TEMPLATE_FLAG)){
				return this.processarMatchTemplate(capture, this.loc);
			} else if(capture.startsWith(LOCALIZADED_STRING_FLAG)){
				return this.processarMatchLocString(capture, this.loc);
			}
			else {
				return this.processarMatchString(capture);
			}
		}

		prepararVariaveisAngular(angularObjects){
			if(!angularObjects) return;
			var angularObjectsString = "";
			for (var key in angularObjects){
				angularObjectsString += `$scope.${key}=${JSON.stringify(angularObjects[key])};\n`;
			}
			return angularObjectsString;
		}

		prepararImportsJs(importsJs){
			if(!importsJs){return;}
			var tagsScripts = ''
			for (var i = importsJs.length - 1; i >= 0; i--) {
				tagsScripts += '<script type="text/javascript" src="/'+importsJs[i]+'"></script>\n'
			}
			return tagsScripts;
		}

		prepararImportsCss(importsCss){
			if(!importsCss){return;}
			var tagsCss = ''
			for (var i = importsCss.length - 1; i >= 0; i--) {
				tagsCss += '<link rel="stylesheet" href="/'+importsCss[i]+'">'
			}
			return tagsCss;
		}

		load(path, res){
			res.render(path, {ts : this});
		}

		registrarLoc(key, value){
			this.listaStringsSalvas[key] = value;
		}
		getTemplatePath(){
			return TEMPLATE_PATH;
		}
		getLocStringsFilePath(){
			return STRINGS_FILES_PATH;
		}
		getModulePath(){

		}
		setModulo(){

		}

	}

	var FILE_SUFFIX = ".html";
	var REGEX_TEMPLATE_SERVICE = /\^(\S*)\^/gm;
	var TEMPLATE_FLAG = "tmp_";
	var LOCALIZADED_STRING_FLAG = "loc_";
	console.log(getGlobbedPaths("modules/*/views/**/*.html"))
	var TEMPLATE_PATH = "modules/core/views/template/";//getGlobbedPaths("modules/*/views/*.html").concat(getGlobbedPaths("modules/*/views/**/.html"));;
	var STRINGS_FILES_PATH = "modules/core/client/strings/";

	

	module.exports = TemplateService