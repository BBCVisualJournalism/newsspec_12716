define(['lib/news_special/bootstrap', 'scrollListener', 'multiLineChart', 'lineChart', 'slideShow', 'data'], function (news, scrollListener, MultiLineChart, LineChart, SlideShow, Data) {
    new scrollListener();

    new MultiLineChart(
        '.newsspec_12716__temperature-chart__svg',
        Data['temperature'], 'http://news.bbcimg.co.uk/news/special/2015/newsspec_12716/content/english/img/temperature_fallback.gif'
    );
    new LineChart(
        '.newsspec_12716__greenhouse-gases-chart__svg',
        Data['greenhouse-gases'], 'http://news.bbcimg.co.uk/news/special/2015/newsspec_12716/content/english/img/greenhouse_gases_fallback.gif'
    );
    new SlideShow('.newsspec_12716__ice-caps-vis__maps__section');

    // new BarChart('.newsspec-12716--bar-chart', Data['school-charts'], ['total', 'boys', 'girls'], 'http://news.bbcimg.co.uk/news/special/2015/newsspec_12716/content/english/img/primary_school_completion_rates.png');

    $.emit('init_images');
    news.istats.log('app-initiated', 'newsspec-nonuser');
    news.sendMessageToremoveLoadingImage();

    // news.$('.newsspec_12716__onward-journeys li a').on('click', function (e) {
    //     news.istats.log('onward-journey-click', 'newsspec-interaction');
    // });
});