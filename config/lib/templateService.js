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
	var coreStrings = {}
	class TemplateService {
		constructor(loc, modulo){
			this.listaStringsSalvas = {};
			this.loc = loc || "pt_BR";
			this.modulo = modulo || 'core';
		}
		static init(){
			var regex = /\/(.._..)\.json/;
			var coreStringsPath = getGlobbedPaths("modules/core/strings/*.json")
			for (var i = coreStringsPath.length - 1; i >= 0; i--) {
				console.log(coreStringsPath[i])
				var linguagem = regex.exec(coreStringsPath[i])[1]
				coreStrings[linguagem] = JSON.parse(fs.readFileSync(coreStringsPath[i]).toString())
			}
			console.log(coreStrings)
		}

		getArquivoLocalizado (){

		}
		getStringLocalizada (flag, loc){
			var preferivelPath = getGlobbedPaths("modules/"+(this.modulo || 'core')+"/strings/"+loc+".json")
			console.log(preferivelPath)
			var jsonStrings = {}
			if(preferivelPath.length) {
				var stringModulo = JSON.parse(fs.readFileSync(preferivelPath[0]).toString())[flag.toUpperCase()];
			} 
			var corePath = getGlobbedPaths("modules/core/strings/"+loc+".json")
			if(corePath.length) {
				var jsonStringsCore = JSON.parse(fs.readFileSync(corePath[0]).toString());
			} 

			var possiveisPaths = getGlobbedPaths("modules/!(core)/strings/"+loc+".json")
			console.log(possiveisPaths)
			if(possiveisPaths.length) {
				var jsonStringsOutros = {};
				for (var i = possiveisPaths.length - 1; i >= 0; i--) {
					Object.assign(JSON.parse(jsonStringsOutros, fs.readFileSync(possiveisPaths[i]).toString()));
				}
				
			}
			Object.assign(jsonStringsOutros, jsonStringsCore);
			Object.assign(jsonStringsCore, jsonStrings);
				
				var jsonStrings = fs.readFileSync(STRINGS_FILES_PATH+loc+".json");
			
				var jsonStrings = fs.readFileSync(STRINGS_FILES_PATH+"pt_BR"+".json");
			
			return JSON.parse(jsonStrings.toString());
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
			var content;
			var self = this;
			flag = flag.substring(4, flag.length);
			var path = flag.replace(/=/g,"/");
			var filePath = this.getTemplatePath(path)

			if(filePath){
				content = fs.readFileSync(filePath).toString();
				content = content.replace(REGEX_TEMPLATE_SERVICE, function(match,capture){
					return self.replaceAuto(match, capture)
				})
				return content;
				
			} 
			return "^"+path+"^"
		}


		processarMatchTemplate(flag){
			return this.processarTemplate(flag, this.loc);
		}

		processarMatchLocString(flag){
			flag = flag.substring(4, flag.length);
			return this.getStringLocalizada(flag, this.loc)
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

		getTemplatePath(filePath){
			var preferivelPath = getGlobbedPaths("modules/"+this.modulo+"/views/templates/"+filePath+FILE_SUFFIX)
			if(preferivelPath.length) {
				return preferivelPath[0];
			} 
			var corePath = getGlobbedPaths("modules/core/views/templates/"+filePath+FILE_SUFFIX)
			if(corePath.length) {
				return corePath[0];
			} 
			var possiveisPaths = getGlobbedPaths("modules/*/views/templates/"+filePath+FILE_SUFFIX)
			if(possiveisPaths.length) {
				return possiveisPaths[0]
			}
			return false;	
		}
		getModulePath(){

		}
		setModulo(module){
			this.modulo = module;
		}

	}

	var FILE_SUFFIX = ".html";
	var REGEX_TEMPLATE_SERVICE = /\^(\S*)\^/gm;
	var TEMPLATE_FLAG = "tmp_";
	var LOCALIZADED_STRING_FLAG = "loc_";
	
	var TEMPLATE_PATH = "modules/core/views/templates/";//getGlobbedPaths("modules/*/views/*.html").concat(getGlobbedPaths("modules/*/views/**/.html"));;
	var STRINGS_FILES_PATH = "modules/core/strings/";

	

	module.exports = TemplateService