define(['lib/news_special/bootstrap', 'utils'], function (news, Utils) {

    function SlideShow(selector) {
        this.slideSelector = selector;
        this.anim = 0;
        this.delay = 1400;
        this.animStopped = false;
        this.hasAnimatedIn = false;
        this.iceVolumeChartReached = false;
        this.init();
    }

    SlideShow.prototype = {
        init: function () {
            if (window.addEventListener) {
                window.addEventListener('optimizedScroll', this.handleOptimizedScroll.bind(this));
            }

            var slideShow = this;

            news.$(slideShow.slideSelector).each(function (i) {
                if (i > 0) {
                    news.$(this).css('visibility', 'hidden');
                    news.$(this).addClass('newsspec_12716--hide');
                }
            });

            news.$(slideShow.slideSelector + ' h4').css('display', 'none');
            news.$('.newsspec_12716__ice-caps-vis__replay-button-container').css('display', 'block');
            news.$(slideShow.slideSelector).parent().parent()
                .addClass('newsspec_12716__ice-caps-vis--js-enabled');
            news.$(slideShow.slideSelector).parent().parent()
                .addClass('newsspec_12716__ice-caps-vis--0');

            news.pubsub.on('ice-chart-replay', function (ev) {
                slideShow.replay(ev);
            });
            news.$('.newsspec_12716__ice-caps-vis__replay').on('click', function (ev) {
                news.pubsub.emit('ice-chart-replay', [ev]);
                return false;
            });
            // slideShow.animateIn(10);
        },

        animateIn: function (frameDur) {
            var slideShow = this;

            if (slideShow.hasAnimatedIn) {
                return;
            }
            slideShow.animStopped = false;
            slideShow.hasAnimatedIn = true;

            news.$(slideShow.slideSelector).css('visibility', 'visible');
            news.$(slideShow.slideSelector).parent().addClass('newsspec_12716__ice-caps-vis--animate');

            var animFrame = 1;
            slideShow.anim = window.setInterval(function () {
                if (slideShow.animStopped) {
                    window.clearInterval(slideShow.anim);
                    slideShow.reset();
                    return false;
                }

                if (animFrame < news.$(slideShow.slideSelector).length) {
                    slideShow.playAnimFrame(animFrame);
                    animFrame++;
                }
            }, frameDur);
        },

        playAnimFrame: function (i) {
            var slideShow = this;

            news.$(slideShow.slideSelector).addClass('newsspec_12716--hide');

            var slideEl = news.$(slideShow.slideSelector).get(i);

            news.$(slideEl).removeClass('newsspec_12716--hide');

            if (i === 0) {
                news.$('.newsspec_12716__ice-caps-vis__area-chart__section--2015')
                    .css('width', 0);
            } else {
                news.$('.newsspec_12716__ice-caps-vis__area-chart__section--2015')
                    .css('width', (100 / 7) * i + '%');
            }

            news.$(slideShow.slideSelector).parent().parent()
                .addClass('newsspec_12716__ice-caps-vis--' + i);
            if (i > 0) {
                news.$(slideShow.slideSelector).parent().parent()
                    .removeClass('newsspec_12716__ice-caps-vis--' + (i - 1));
            }
        },

        reset: function () {
            var slideShow = this;
            slideShow.hasAnimatedIn = false;

            news.$('.newsspec_12716__ice-caps__section--1980').css('visibility', 'visible');
            news.$('.newsspec_12716__ice-caps__section--1980').removeClass('newsspec_12716--hide');

            news.$(slideShow.slideSelector).each(function (i) {
                if (i > 0) {
                    news.$(this).css('visibility', 'hidden');
                    news.$(this).addClass('newsspec_12716--hide');
                }
            });        

            news.$(slideShow.slideSelector + ' h4').css('display', 'none');
            news.$('.newsspec_12716__ice-caps-vis__replay-button-container').css('display', 'block');
            news.$(slideShow.slideSelector).parent().parent()
                .addClass('newsspec_12716__ice-caps-vis--js-enabled');

            for (var j = 1; j < news.$(slideShow.slideSelector).length; j++) {
                news.$(slideShow.slideSelector).parent().parent()
                    .removeClass('newsspec_12716__ice-caps-vis--' + j);
            }
            news.$(slideShow.slideSelector).parent().parent()
                .addClass('newsspec_12716__ice-caps-vis--0');

            news.$('.newsspec_12716__ice-caps-vis__area-chart__section--2015')
                .css('width', 0);
        },

        replay: function () {
            var slideShow = this;
            slideShow.animStopped = true;
            window.setTimeout(function () {
                slideShow.animateIn(slideShow.delay);
            }, slideShow.delay + 10);
            news.istats.log('ice-vis-replay', 'newsspec-interaction');
        },

        handleOptimizedScroll: function () {
            if (Utils.isElementInViewport(news.$(this.slideSelector).parent())) {
                this.animateIn(this.delay);
                if (!this.iceVolumeChartReached) {
                    news.istats.log('ice-volume-chart-reached', 'newsspec-interaction');
                }
                this.iceVolumeChartReached = true;
            }
        }
    };

    return SlideShow;
});
