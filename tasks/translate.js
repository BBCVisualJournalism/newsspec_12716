module.exports = function (grunt) {

    grunt.registerTask('translate', [
        'clean:beforeTranslate',
        'newsBanner:build_all_other_sites',
        'default',
        'copyRequiredJs',
        'images',
        'multi_lang_site_generator:build_all_other_sites',
        'clean:inlineCss',
        'copy_source',
        'orbify:build_all_other_sites',
        'newsBanner:replace_language_news_banners',
        'urlEncodeContent:languageServices'
    ]);
};
