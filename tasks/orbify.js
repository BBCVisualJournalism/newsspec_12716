module.exports = function (grunt) {

    grunt.registerTask('orbify', function () {
        var pkg         = grunt.file.readJSON('package.json');
        var config      = grunt.config.get('config');
        var languageConfig      = grunt.config.get('languageConfig');
        var done        = this.async();
        var http        = require('http');
        var fs          = require('fs');
        var _           = require('lodash');
        var parseString = require('xml2js').parseString;
        var moment      = require('moment');
        var directory   = require('path');
        
        var content     = {};
        var options     = {};
        var httpProxy = process.env.HTTP_PROXY;

        var defaultLanguage = languageConfig.languageLookup[config.services.default].code || 'en-GB';


        if (!httpProxy) {
            /* If we're off reith, do standard HTTP request */
            options = {
                host: pkg.orbify['host'],
                path: pkg.orbify['path'] + '?language=' + defaultLanguage,
                cache: pkg.orbify['cache']
            };
        } else {
            /* If on reith, send request through the HTTP proxy */

            /* Regex to extract the host and port number of the HTTP_PROXY enviroment variable */
            var proxyDetails = httpProxy.match(/http:\/\/(.*):((?:[0-9])(?:[0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))/);
            options = {
                host: proxyDetails[1],
                port: proxyDetails[2],
                path: 'http://' + pkg.orbify['host'] + pkg.orbify['path'] + '?language=' + defaultLanguage,
                cache: pkg.orbify['cache']
            };
        }

        callback = function(response) {
            var str = '';

            response.on('data', function (chunk) {
            str += chunk;
            });

            response.on('end', function () {
                //parse json! str
                var result = JSON.parse(str);
                
                //error handling
                if (!result) {
                    grunt.log.writeln('Using cached ORB webservice');
                    done();
                    return;
                }
                if (result.status != 'ok') {
                    grunt.log.writeln('Using cached ORB webservice');
                    done();
                    return;
                }

                //data recieved and parsed successfully
                grunt.log.writeln('Fetch ORB webservice');
                result["timestamp"] = Math.round((new Date()).getTime() / 1000);
                writeOrbFiles(result, done);

            });
        }

        readTemplateFile = function(path, callback) {
            try {
                var filename = require.resolve(path);
                fs.readFile(filename, 'utf8', callback);
             } catch (e) {
                callback(e);
            }
        }

        isOrbOutOfDate = function() {
            var prevTimeStamp;
            var currentTimeStamp = moment.utc();
            var age;

            try {
                content = JSON.parse(fs.readFileSync( directory.resolve(__dirname, 'orb.json'), "utf8"));
             } catch (e) {
                return true;
            }

            prevTimeStamp = moment.unix(content.timestamp);

            age = moment.utc(currentTimeStamp).diff(prevTimeStamp);

            if (age > (6000 * parseInt(options.cache, 10))) {
                return true;
             } else {
                return false;
            }
        }

        writeOrbFiles = function (json, done) {

            fs.writeFileSync(directory.resolve(__dirname, 'orb.json'), JSON.stringify(json));
            grunt.log.writeln('Cached ORB webservice');

            fs.writeFileSync("source/tmpl/includes/top.tmpl", '<!--orbHeadStart-->' + json.barlesque.head + json.barlesque.bodyfirst + '<!--orbHeadEnd-->');

            fs.writeFileSync("source/tmpl/includes/bottom.tmpl",  '<!--orbBodyStart-->' + json.barlesque.bodylast + '<!--orbBodyEnd-->');
            grunt.log.writeln('Template ORB webservice');
            done();
            
        }

        if(isOrbOutOfDate()) {
            http.request(options, callback).end();
         } else {
            grunt.log.writeln('Using cached ORB webservice');
            done();
        }
        
    });

    grunt.registerTask('orbify:build_all_other_sites', function () {

        var pkg         = grunt.file.readJSON('package.json');
        var config      = grunt.config.get('config');
        var languageConfig      = grunt.config.get('languageConfig');
        var done        = this.async();
        var http        = require('http');
        var fs          = require('fs');
        var _           = require('lodash');
        var parseString = require('xml2js').parseString;
        var moment      = require('moment');
        var directory   = require('path');
        var services = grunt.iframeScaffold.services;
        
        var content     = {};
        var options     = {};
        var httpProxy = process.env.HTTP_PROXY;

        var defaultLanguage = languageConfig.languageLookup[config.services.default].code || 'en-GB';

        var languageCount = 0;
        var loadedLanguageCount = 0;

        //create a reverse language lookup to get the full language name from its code
        var reverseWhitelistedLangLookup = {};
        for (var key in languageConfig.languageLookup) {
            reverseWhitelistedLangLookup[languageConfig.languageLookup[key].code] = key;
        }

        languageCallback = function(response) {

            var languageCode = response.req.path.substr(response.req.path.indexOf('language') + 9, 99999);

            var service = reverseWhitelistedLangLookup[languageCode];

            var str = '';

            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                //parse json! str
                var result = JSON.parse(str);
                
                //error handling
                if (!result) {
                    grunt.log.writeln('Using cached ORB webservice');
                    done();
                    return;
                }
                if (result.status != 'ok') {
                    grunt.log.writeln('Using cached ORB webservice');
                    done();
                    return;
                }

                ///////////////////////////
                //replace the orb markup in the language test.html file
                var languageTestHtmlContents = fs.readFileSync('content/' + service + '/test.html', 'utf8');

                var orbBodyStartIndex = languageTestHtmlContents.indexOf('<!--orbBodyStart-->');
                var orbBodyEndIndex = languageTestHtmlContents.indexOf('<!--orbBodyEnd-->');
                languageTestHtmlContents = languageTestHtmlContents.substring(0, orbBodyStartIndex + 19) + result.barlesque.bodylast + languageTestHtmlContents.substring(orbBodyEndIndex, languageTestHtmlContents.length);

                var orbHeadStartIndex = languageTestHtmlContents.indexOf('<!--orbHeadStart-->');
                var orbHeadEndIndex = languageTestHtmlContents.indexOf('<!--orbHeadEnd-->');
                languageTestHtmlContents = languageTestHtmlContents.substring(0, orbHeadStartIndex + 19) + result.barlesque.head + result.barlesque.bodyfirst + languageTestHtmlContents.substring(orbHeadEndIndex, languageTestHtmlContents.length);

                fs.writeFileSync('content/' + service + '/test.html', languageTestHtmlContents);
                ///////////////////////////

                loadedLanguageCount ++;
                if (loadedLanguageCount == languageCount) {
                    done();
                }

            });
        }

        services.forEach(function (service) {
            languageCount ++;
            
            if (!httpProxy) {
                /* If we're off reith, do standard HTTP request */
                options = {
                    host: pkg.orbify['host'],
                    path: pkg.orbify['path'] + '?language=' + languageConfig.languageLookup[service].code,
                    cache: pkg.orbify['cache']
                };
            } else {
                /* If on reith, send request through the HTTP proxy */

                /* Regex to extract the host and port number of the HTTP_PROXY enviroment variable  */
                var proxyDetails = httpProxy.match(/http:\/\/(.*):((?:[0-9])(?:[0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))/);
                options = {
                    host: proxyDetails[1],
                    port: proxyDetails[2],
                    path: 'http://' + pkg.orbify['host'] + pkg.orbify['path'] + '?language=' + languageConfig.languageLookup[service].code,
                    cache: pkg.orbify['cache']
                };
            }

            http.request(options, languageCallback).end();
            
        });

    });
};