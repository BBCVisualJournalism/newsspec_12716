module.exports = function (grunt) {

    grunt.registerTask('urlEncodeContent', function () {

        var config      = grunt.config.get('config');
        var languageConfig      = grunt.config.get('languageConfig');
        var done        = this.async();
        var fs          = require('fs');

        var languageIndexIncContents = fs.readFileSync('content/' + config.services.default + '/index.inc', 'utf8');
        var languageTestHtmlContents = fs.readFileSync('content/' + config.services.default + '/test.html', 'utf8');

        var incCount = (languageIndexIncContents.match(/<!-- urlencodeme-start -->/g) || []).length;
        var htmlCount = (languageTestHtmlContents.match(/<!-- urlencodeme-start -->/g) || []).length;

        var a;
        
        if (!htmlCount) {
            done();
        }

        for (a = 0; a < htmlCount; a++) {
            var incStartIndex = languageIndexIncContents.indexOf('<!-- urlencodeme-start -->');
            var incEndIndex = languageIndexIncContents.indexOf('<!-- urlencodeme-end -->');

            var htmlStartIndex = languageTestHtmlContents.indexOf('<!-- urlencodeme-start -->');
            var htmlEndIndex = languageTestHtmlContents.indexOf('<!-- urlencodeme-end -->');

            var plainTextStrToReplace, urlEncodedStr;
            if (incStartIndex > -1 && incEndIndex > -1) {
                plainTextStrToReplace = languageIndexIncContents.substring(incStartIndex + 26, incEndIndex);
                urlEncodedStr = encodeURIComponent(plainTextStrToReplace);
                languageIndexIncContents = languageIndexIncContents.substring(0, incStartIndex) + urlEncodedStr + languageIndexIncContents.substring(incEndIndex + 24);
            }

            if (htmlStartIndex > -1 && htmlEndIndex > -1) {
                plainTextStrToReplace = languageTestHtmlContents.substring(htmlStartIndex + 26, htmlEndIndex);
                urlEncodedStr = encodeURIComponent(plainTextStrToReplace);
                languageTestHtmlContents = languageTestHtmlContents.substring(0, htmlStartIndex) + urlEncodedStr + languageTestHtmlContents.substring(htmlEndIndex + 24);
            }
        }

        fs.writeFileSync('content/' + config.services.default + '/index.inc', languageIndexIncContents);
        fs.writeFileSync('content/' + config.services.default + '/test.html', languageTestHtmlContents);

        done();
        
    });

    grunt.registerTask('urlEncodeContent:languageServices', function () {
        var services = grunt.iframeScaffold.services;
        var config      = grunt.config.get('config');
        var languageConfig      = grunt.config.get('languageConfig');
        var done        = this.async();
        var fs          = require('fs');

        services.forEach(function (service) {

            var languageIndexIncContents = fs.readFileSync('content/' + service + '/index.inc', 'utf8');
            var languageTestHtmlContents = fs.readFileSync('content/' + service + '/test.html', 'utf8');

            var incCount = (languageIndexIncContents.match(/<!-- urlencodeme-start -->/g) || []).length;
            var htmlCount = (languageTestHtmlContents.match(/<!-- urlencodeme-start -->/g) || []).length;

            var a;
            
            if (!htmlCount) {
                done();
            }

            for (a = 0; a < htmlCount; a++) {
                var incStartIndex = languageIndexIncContents.indexOf('<!-- urlencodeme-start -->');
                var incEndIndex = languageIndexIncContents.indexOf('<!-- urlencodeme-end -->');

                var htmlStartIndex = languageTestHtmlContents.indexOf('<!-- urlencodeme-start -->');
                var htmlEndIndex = languageTestHtmlContents.indexOf('<!-- urlencodeme-end -->');

                var plainTextStrToReplace, urlEncodedStr;
                if (incStartIndex > -1 && incEndIndex > -1) {
                    plainTextStrToReplace = languageIndexIncContents.substring(incStartIndex + 26, incEndIndex);
                    urlEncodedStr = encodeURIComponent(plainTextStrToReplace);
                    languageIndexIncContents = languageIndexIncContents.substring(0, incStartIndex) + urlEncodedStr + languageIndexIncContents.substring(incEndIndex + 24);
                }

                if (htmlStartIndex > -1 && htmlEndIndex > -1) {
                    plainTextStrToReplace = languageTestHtmlContents.substring(htmlStartIndex + 26, htmlEndIndex);
                    urlEncodedStr = encodeURIComponent(plainTextStrToReplace);
                    languageTestHtmlContents = languageTestHtmlContents.substring(0, htmlStartIndex) + urlEncodedStr + languageTestHtmlContents.substring(htmlEndIndex + 24);
                }
            }

            fs.writeFileSync('content/' + service + '/index.inc', languageIndexIncContents);
            fs.writeFileSync('content/' + service + '/test.html', languageTestHtmlContents);

        });

        done();
    });
};
