module.exports = function (grunt) {
    grunt.registerTask('html', ['sass:inline', 'jsonlint', 'perform_multi_lang_site_generator']);
};