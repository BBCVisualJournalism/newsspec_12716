define(['lib/news_special/bootstrap', 'd3', 'utils'], function (news, d3, Utils) {

    function MultiLineChart(selector, data, fallbackImage) {
        if (!d3.isLegacy) {
            // remove fallback element for non-SVG browsers
            news.$(selector + '-alternative').remove();

            this.selector = selector;
            this.d3El = d3.select(selector);
            this.data = data;
            this.minY = -0.8;
            this.maxY = 1.2;
            this.anim = 0;
            this.animStopped = false;
            this.hasAnimatedIn = false;
            this.animFrameDur = 200;
            this.xAxislabelsOffset = 16;
            this.temperatureChartReached = false;

            // For this chart, we need to denote data outliers
            this.lowestEntries = [
                1908,
                1911,
                1909,
                1904,
                1910,
                1907,
                1903,
                1912,
                1890,
                1913
            ];
            this.highestEntries = [
                2016,
                2015,
                2017,
                2014,
                2010,
                2013,
                2005,
                2009,
                1998,
                2012
            ];

            this.init();
        } else {
            news.$(selector).parent().remove();
        }
    }

    MultiLineChart.prototype = {
        init: function () {
            if (window.addEventListener) {
                window.addEventListener('optimizedScroll', this.handleOptimizedScroll.bind(this));
            }

            // news.$(window).on('optimizedScroll', this.handleOptimizedScroll.bind(this));

            var multiLineChart = this;

            news.$(multiLineChart.selector).parent().css('display', 'block');

            multiLineChart.initHeaderState();

            multiLineChart.margin = {top: 18, right: 16, bottom: 40, left: 98};
            multiLineChart.setChartDimensions();
            multiLineChart.setChartScale();

            multiLineChart.line = d3.svg.line()
                .defined(function (d) {
                    return d !== null;
                })
                .x(function (d, i) {
                    return multiLineChart.xScale(i);
                })
                .y(function (d) {
                    return multiLineChart.yScale(d);
                });

            multiLineChart.graph = multiLineChart.d3El
                .attr('width', multiLineChart.width + multiLineChart.margin.right + multiLineChart.margin.left)
                .attr('height', multiLineChart.height + multiLineChart.margin.top + multiLineChart.margin.bottom)
            .append('g')
                .attr('transform', 'translate(' + multiLineChart.margin.left + ',' + multiLineChart.margin.top + ')');

            multiLineChart.setChartDomain();

            multiLineChart.xAxisContainer = multiLineChart.graph.append('g')
                .attr('class', 'x-axis-container');
            multiLineChart.addLines();

            multiLineChart.yAxisContainer = multiLineChart.graph.append('g')
                .attr('class', 'y-axis-container');
            multiLineChart.drawAxes();

            // multiLineChart.tooltipContainer = multiLineChart.graph.append('g')
            //     .attr('class', 'newsspec_12716__temperature-chart__tooltip')
            //     .append('text')
            //     .attr('class', 'newsspec_12716__temperature-chart__tooltip__text')
            //     .text('');



            news.pubsub.on('temperature-chart-replay', function (ev) {
                multiLineChart.replay(ev);
            });

            news.$('.newsspec_12716__temperature-chart__replay').on('click', function (ev) {
                news.pubsub.emit('temperature-chart-replay', [ev]);
                return false;
            });

            d3.select(window).on('resize' + multiLineChart.selector, multiLineChart.redraw.bind(multiLineChart));

            // setTimeout(function () {
            //     multiLineChart.animateIn(100);
            // }, 600);
        },

        redraw: function () {
            var multiLineChart = this;
            multiLineChart.setChartDimensions();

            /* Update the range of the scale with new width/height */
            multiLineChart.setChartScale();
            multiLineChart.setChartDomain();

            multiLineChart.drawAxes();

            /* Force D3 to recalculate and update the lines */
            multiLineChart.lineEls = multiLineChart.graph.selectAll('.newsspec_12716__temperature-chart__line');
            multiLineChart.lineEls.each(function () {
                d3.select(this)
                    .attr('d', multiLineChart.line);
            });
        },

        reset: function () {
            var multiLineChart = this;
            multiLineChart.hasAnimatedIn = false;
                
            multiLineChart.initHeaderState();
            news.$('.newsspec_12716__temperature-chart__header').removeClass('newsspec_12716__temperature-chart__header--coldest');
            news.$('.newsspec_12716__temperature-chart__header').removeClass('newsspec_12716__temperature-chart__header--warmest');
            
            d3.selectAll('.newsspec_12716__temperature-chart__line')
            .style('display', 'none');
            window.setTimeout(function () {
                d3.selectAll('.newsspec_12716__temperature-chart__line')
                .style({
                    'opacity': 0,
                    'display': 'block'
                });
            }, multiLineChart.animFrameDur + 10);
        },

        replay: function () {
            var multiLineChart = this;
            multiLineChart.animStopped = true;
            window.setTimeout(function () {
                multiLineChart.animateIn(multiLineChart.animFrameDur);
            }, multiLineChart.animFrameDur + 10);
            news.istats.log('temperature-chart-replay', 'newsspec-interaction');
        },

        drawAxes: function () {
            var multiLineChart = this;
            var yPos = multiLineChart.height;
            var width = multiLineChart.width;
            var xAxisLabels = [];

            news.$('.newsspec_12716__line-chart__key__months__label').each(function (i) {
                xAxisLabels.push(news.$(this).text());
            });

            multiLineChart.xAxisContainer.selectAll('*').remove();

            var xGroup = multiLineChart.xAxisContainer.append('g');
            for (var l = 0; l < xAxisLabels.length; l++) {
                var xPos = multiLineChart.xScale(l);

                xGroup.attr('class', 'x-axis-ticks');

                // draw x axis ticks
                xGroup.append('line')
                    .attr('x1', xPos)
                    .attr('y1', 0)
                    .attr('x2', xPos)
                    .attr('y2', yPos)
                    .attr('class', 'x-axis-tick');

                // draw x axis labels
                xGroup.append('text')
                    .attr('x', xPos)
                    .attr('y', yPos + multiLineChart.xAxislabelsOffset)
                    .attr('text-anchor', 'middle')
                    .attr('class', 'newsspec_12716__temperature-chart__text--x-axis-label')
                    .text(xAxisLabels[l]);
            }

            // draw x axis title label
            multiLineChart.xAxisContainer.append('text')
                .attr('x', -3)
                .attr('y', yPos + multiLineChart.xAxislabelsOffset + 18)
                .attr('text-anchor', 'start')
                .attr('class', 'newsspec_12716__temperature-chart__text--x-axis-title-label')
                .text(news.$('.newsspec_12716__line-chart__key__months__title-label').text());

            multiLineChart.yAxisContainer.selectAll('*').remove();

            var yGroup = multiLineChart.yAxisContainer.append('g');
            for (var j = multiLineChart.minY; j <= multiLineChart.maxY; j += 0.2) {
                yPos = multiLineChart.yScale(j);

                yGroup.attr('class', 'y-axis-ticks');

                var labelClass = 'y-axis-label';
                var labelText = '';
                if (Math.round(j * 10) / 10 === 0) {
                    labelClass = 'newsspec_12716__temperature-chart__text--avg';
                    labelText = news.$('.newsspec_12716__line-chart__key--avg').text();

                    yGroup.append('line')
                    .attr('x1', -8)
                    .attr('y1', yPos)
                    .attr('x2', multiLineChart.width)
                    .attr('y2', yPos)
                    .attr('class', 'y-axis-tick--avg');
                } else {
                    labelText = (j > 0 ? '+' : '') + parseFloat(Math.round(j * 100) / 100).toFixed(1);
                }

                // // draw y axis labels
                yGroup.append('text')
                    .attr('x', -12)
                    .attr('y', yPos + 4)
                    .attr('text-anchor', 'end')
                    .attr('class', labelClass)
                    .text(labelText);
            }

            // Wrap the text label for 20th century average to fit available width
            yGroup.selectAll('.newsspec_12716__temperature-chart__text--avg')
            .call(multiLineChart.wrapTextToWidth, 70);

            // // draw y axis extremes labels
            yGroup.append('text')
                .attr('x', -52)
                .attr('y', multiLineChart.yScale(multiLineChart.minY) + 4)
                .attr('text-anchor', 'end')
                .attr('class', 'newsspec_12716__temperature-chart__label--extremes')
                .text(news.$('.newsspec_12716__line-chart__key--colder').text());
            yGroup.append('text')
                .attr('x', -52)
                .attr('y', multiLineChart.yScale(multiLineChart.maxY) + 4)
                .attr('text-anchor', 'end')
                .attr('class', 'newsspec_12716__temperature-chart__label--extremes')
                .text(news.$('.newsspec_12716__line-chart__key--hotter').text());
        },

        addLines: function () {
            var multiLineChart = this;
            for (var i = 0; i < multiLineChart.data.length; i++) {
                var classStr = 'newsspec_12716__temperature-chart__line newsspec_12716__line';
                var yearPath = multiLineChart.graph.append('path')
                    .datum(multiLineChart.data[i][1])
                    .attr('class', classStr)
                    .attr('id', 'year-path-' + i)
                    .attr('d', multiLineChart.line)
                    .style('opacity', 0);
                    // .datum(multiLineChart.data[i][0])
                    // .on('mouseover', multiLineChart.showTooltip)
                    // .on('mouseout', multiLineChart.hideTooltip);
            }
        },

        initHeaderState: function () {
            var multiLineChart = this;
            news.$('.newsspec_12716__temperature-chart__header')
                .removeClass('newsspec_12716__temperature-chart__header--warmest');
            news.$('.newsspec_12716__temperature-chart__header__year').html('');
            news.$('.newsspec_12716__temperature-chart__header__rank').css({
                'display': 'none',
                'opacity': 0
            });
        },

        setChartDimensions: function () {
            var multiLineChart = this;
            multiLineChart.width = parseInt(multiLineChart.d3El.style('width'), 10) - multiLineChart.margin.right - multiLineChart.margin.left;
            multiLineChart.height = parseInt(multiLineChart.d3El.style('height'), 10) - multiLineChart.margin.top - multiLineChart.margin.bottom;
        },

        setChartScale: function () {
            var multiLineChart = this;
            multiLineChart.xScale = d3.time.scale()
                .range([0, multiLineChart.width]);
            multiLineChart.yScale = d3.scale.linear()
                .range([multiLineChart.height, 0]);
        },

        setChartDomain: function () {
            var multiLineChart = this;
            multiLineChart.xScale.domain(d3.extent(multiLineChart.data[0][1], function (d, i) { return i; }));
            multiLineChart.yScale.domain(d3.extent([multiLineChart.minY, multiLineChart.maxY], function (d) { return d; }));
        },

        setYearLabelText: function (datum) {
            var mySubstring = datum.substring(datum.length - 2);
            return parseInt(mySubstring, 10) > 58 ? '19' + mySubstring : '20' + mySubstring;
        },

        // showTooltip: function (d) {
        //     d3.selectAll('.newsspec_12716__temperature-chart__tooltip__text')
        //         .text(d);
        //     d3.select('.newsspec_12716__temperature-chart__tooltip')
        //         .style('opacity', 0.8);

        // },

        // hideTooltip: function () {
        //     d3.selectAll('.newsspec_12716__temperature-chart__tooltip__text')
        //         .text('');
        //     d3.select('.newsspec_12716__temperature-chart__tooltip')
        //         .style('opacity', 0);

        // },

        animateIn: function (frameDur) {
            var multiLineChart = this;

            if (multiLineChart.hasAnimatedIn) {
                return;
            }
            multiLineChart.animStopped = false;
            multiLineChart.hasAnimatedIn = true;
            news.$('.newsspec_12716__temperature-chart__header__rank--warmest-0').css('display', 'block');

            var animFrame = 0;
            multiLineChart.anim = window.setInterval(function () {
                if (multiLineChart.animStopped) {
                    window.clearInterval(multiLineChart.anim);
                    multiLineChart.reset();
                    return false;
                }

                if (animFrame < multiLineChart.data.length) {
                    multiLineChart.playAnimFrame(animFrame);
                    animFrame++;
                }
            }, frameDur);
        },

        playAnimFrame: function (i) {
            var multiLineChart = this;

            // bring in the new line - full bright
            var yearPath = d3.select('#year-path-' + i)
                .transition()
                .duration(multiLineChart.animFrameDur / 2)
                .style('opacity', 1);

            // knock back the previous line
            if (i > 0) {
                var previousYearPath = d3.select('#year-path-' + (i - 1))
                    .transition()
                    .duration(multiLineChart.animFrameDur)
                    .style('opacity', 0.5);
            }

            news.$('.newsspec_12716__temperature-chart__header__year').html(multiLineChart.data[i][0]);

            if (i === multiLineChart.data.length - 1) {
            news.$('.newsspec_12716__temperature-chart__header__year').html(this.highestEntries[0]);
                news.$('.newsspec_12716__temperature-chart__header__rank--warmest-0').css('opacity', 1);
            }

            var classStr = '';
            for (var c = 0; c < multiLineChart.lowestEntries.length; c++) {
                if (multiLineChart.data[i][0] === multiLineChart.lowestEntries[c]) {

                    if (c === 0) {
                        classStr = 'newsspec_12716__temperature-chart__line--coldest newsspec_12716__extreme newsspec_12716__temperature-chart__line newsspec_12716__line';
                    } else {
                        classStr = 'newsspec_12716__temperature-chart__line--cold newsspec_12716__extreme newsspec_12716__temperature-chart__line newsspec_12716__line';
                    }
                    yearPath.attr('class', classStr);

                    news.$('.newsspec_12716__temperature-chart__header').addClass('newsspec_12716__temperature-chart__header--coldest');
                    news.$('.newsspec_12716__temperature-chart__header').removeClass('newsspec_12716__temperature-chart__header--warmest');
                    return true;
                }
            }

            for (var h = 0; h < multiLineChart.highestEntries.length; h++) {
                if (multiLineChart.data[i][0] === multiLineChart.highestEntries[h]) {

                    if (h === 0) {
                        classStr = 'newsspec_12716__temperature-chart__line--warmest newsspec_12716__extreme newsspec_12716__temperature-chart__line newsspec_12716__line';
                    } else {
                        classStr = 'newsspec_12716__temperature-chart__line--warm newsspec_12716__extreme newsspec_12716__temperature-chart__line newsspec_12716__line';
                    }
                    yearPath
                        .attr('class', classStr);
                    // yearPath
                    //     .on('mouseover', multiLineChart.showTooltip(multiLineChart.data[i][0]));

                    news.$('.newsspec_12716__temperature-chart__header').addClass('newsspec_12716__temperature-chart__header--warmest');
                    news.$('.newsspec_12716__temperature-chart__header').removeClass('newsspec_12716__temperature-chart__header--coldest');
                    return true;
                }
            }
            
            news.$('.newsspec_12716__temperature-chart__header').removeClass('newsspec_12716__temperature-chart__header--coldest');
            news.$('.newsspec_12716__temperature-chart__header').removeClass('newsspec_12716__temperature-chart__header--warmest');
                
        },

        // wrapTextToWidth() adapted from http://bl.ocks.org/mbostock/7555321
        wrapTextToWidth: function (text, width) {
            text.each(function () {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr('y'),
                    dy = parseFloat(text.attr('dy')) - lineHeight || 0 - lineHeight,
                    x = parseFloat(text.attr('x')) || 0,
                    tspan = text.text(null)
                        .append('tspan')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('dy', dy + 'em');

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(' '));
                    if (tspan.node().getComputedTextLength() > width + 40) {
                        line.pop();
                        tspan.text(line.join(' '));
                        line = [word];
                        tspan = text.append('tspan')
                            .attr('x', x)
                            .attr('y', y)
                            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                            .text(word);
                    }
                }
            });
        },

        handleOptimizedScroll: function () {
            if (Utils.isElementInViewport(news.$(this.selector))) {
                this.animateIn(this.animFrameDur);
                if (!this.temperatureChartReached) {
                    news.istats.log('temperature-chart-reached', 'newsspec-interaction');
                }
                this.temperatureChartReached = true;
            }
        }
    };

    return MultiLineChart;
});