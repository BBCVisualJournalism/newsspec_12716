module.exports = function (grunt) {

    // *************************************************************************
    // PROJECT FILES
    // Make a list of templates you want converted to files
    // *************************************************************************

    var projectFiles = {
        'test.html': 'test.html.tmpl',
        'index.inc':  'index.inc.tmpl',
        'head_meta.inc':  'head_meta.inc.tmpl'
    };

    // *************************************************************************
    // GRUNT CONFIG
    // You shouldn't need to edit anything below here
    // *************************************************************************

    grunt.registerTask('perform_multi_lang_site_generator', function () {

        var config = grunt.config.get('config'),
            languageConfig = grunt.config.get('languageConfig'),
            orb = grunt.file.readJSON('tasks/orb.json'),
            inlineStyleElm = grunt.file.read("content/" + config.services.default + "/css/inline.css"),
            inlineLiteJs = '',
            multi_lang_site_generator_data;

        inlineLiteJs   = '<script>' + inlineLiteJs + '</script>';
        inlineStyleElm = '<style>' + inlineStyleElm + '</style>';

        multi_lang_site_generator_data = {
            version:             '<%= pkg.version %>',
            inlineLiteJs:        inlineLiteJs,
            inlineStyleElm:      inlineStyleElm,
            path:                '<%= env[config.whichEnv].domain %>/news/special/<%= config.year %>/newsspec_<%= config.project_number %>/content',
            pathStatic:          '<%= env[config.whichEnv].domainStatic %>/news/special/<%= config.year %>/newsspec_<%= config.project_number %>/content',
            projectNumber:       '<%= config.project_number %>',
            debug:               '<%= config.debug %>',
            amdModulePaths:      '<%= JSON.stringify(amdModulePaths) %>',
            panelname:           '<%= panelname %>',
            panelcontent:        '<%= panelcontent %>',
            defaultLang:         '<%= languageConfig.languageLookup[config.services.default].code %>',
            languageConfig:      '<%= languageConfig %>'
        };

        grunt.config('multi_lang_site_generator', {
            default: {
                options: {
                    vocabs:             ['<%= config.services.default %>'],
                    vocab_directory:    'source/vocabs',
                    template_directory: 'source/tmpl/',
                    output_directory:   'content',
                    data:               multi_lang_site_generator_data,
                    templatetoken: {
                         evaluate:      /\{\{(.+?)\}\}/g,
                         interpolate:   /\{\{=(.+?)\}\}/g,
                         escape:        /\{\{-(.+?)\}\}/g
                    }
                },
                files: projectFiles
            },
            build_all_other_sites: {
                options: {
                    vocabs:             '<%= config.services.others %>',
                    vocab_directory:    'source/vocabs',
                    template_directory: 'source/tmpl/',
                    output_directory:   'content',
                    data:               multi_lang_site_generator_data,
                    templatetoken: {
                         evaluate:      /\{\{(.+?)\}\}/g,
                         interpolate:   /\{\{=(.+?)\}\}/g,
                         escape:        /\{\{-(.+?)\}\}/g
                    }
                },
                files: projectFiles
            }
        });

        grunt.task.run('multi_lang_site_generator:default');
    });
};
