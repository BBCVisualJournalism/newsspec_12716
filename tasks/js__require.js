module.exports = function (grunt) {

    // *************************************************************************
    // REQUIRE PATHS
    // Add any paths here you want shortened. Relative to the 'js' dir.
    // *************************************************************************
    var config = grunt.config.get('config');
    var _ = require('lodash-node');

    var amdModulePaths = {
        'pubsub': './lib/vendors/jquery/pubsub',
        'istats-1': 'empty:',
    };

    if(config.debug !== "true") {
        var emptyPaths = {
            'bump-3': 'empty:'
        };
        amdModulePaths = _.merge(emptyPaths, amdModulePaths);
    }

    // *************************************************************************
    // GRUNT CONFIG
    // You shouldn't need to edit anything below here
    // *************************************************************************

    requirePathsForJquery1build = _.merge({'d3': './lib/vendors/d3.legacy', 'jquery': './lib/vendors/jquery/jquery-1.11.3'}, amdModulePaths);
    requirePathsForJquery2build = _.merge({'d3': './lib/vendors/d3', 'jquery': './lib/vendors/jquery/jquery-2.1.4'}, amdModulePaths);

    grunt.config(['amdModulePaths'], amdModulePaths);
    grunt.config(['requirejs', 'jquery1'], {
        options: {
            baseUrl: './source/js',
            paths: requirePathsForJquery1build,
            optimize: 'uglify2',
            generateSourceMaps: false,
            preserveLicenseComments: false,
            name: './app',
            out: './content/<%= config.services.default %>/js/all-legacyie.js'
        }
    });
    grunt.config(['requirejs', 'jquery2'], {
        options: {
            baseUrl: './source/js',
            paths: requirePathsForJquery2build,
            optimize: 'uglify2',
            generateSourceMaps: true,
            preserveLicenseComments: false,
            name: './app',
            out: './content/<%= config.services.default %>/js/all-html5.js'
        }
    })
};
