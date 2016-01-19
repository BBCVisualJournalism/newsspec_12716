define(['lib/news_special/bootstrap', 'd3', 'utils'], function (news, d3, Utils) {

    function LineChart(selector, data, fallbackImage) {
        if (!d3.isLegacy) {
            // remove fallback element for non-SVG browsers
            news.$(selector + '-alternative').remove();

            this.selector = selector;
            this.d3El = d3.select(selector);
            this.data = data;
            this.hasAnimatedIn = false;
            this.xAxislabelsOffset = 16;
            this.greenHouseGasesChartReached = false;
            this.init();
        } else {
            news.$(selector).remove();
        }
    }

    LineChart.prototype = {
        init: function () {
            if (window.addEventListener) {
                window.addEventListener('optimizedScroll', this.handleOptimizedScroll.bind(this));
            }

            var lineChart = this;
            news.$(lineChart.selector).css('display', 'block');


            lineChart.margin = {top: 50, right: 70, bottom: 54, left: 70};
            var width = parseInt(lineChart.d3El.style('width'), 10) - lineChart.margin.right - lineChart.margin.left,
                height = parseInt(lineChart.d3El.style('height'), 10) - lineChart.margin.top - lineChart.margin.bottom;

            lineChart.xScale = d3.time.scale()
                .range([0, width]);

            lineChart.yScale = d3.scale.linear()
                .range([height, 0]);

            lineChart.line = d3.svg.line()
                .defined(function (d) {
                    return d[1] !== null;
                })
                .x(function (d, i) { return lineChart.xScale(i); })
                .y(function (d) { return lineChart.yScale(d[1]); });


            lineChart.graph = lineChart.d3El
                .attr('width', width + lineChart.margin.right + lineChart.margin.left)
                .attr('height', height + lineChart.margin.top + lineChart.margin.bottom)
            .append('g')
                .attr('transform', 'translate(' + lineChart.margin.left + ',' + lineChart.margin.top + ')');

            lineChart.xScale.domain(d3.extent(lineChart.data, function (d, i) { return i; }));
            lineChart.yScale.domain(d3.extent(lineChart.data, function (d) { return d[1]; }));

            lineChart.axisContainer = lineChart.graph.append('g')
                .attr('class', 'axis-container');

            lineChart.graph.append('path')
                .datum(lineChart.data)
                .attr('class', 'newsspec_12716__line')
                .attr('d', lineChart.line);

            lineChart.mask = lineChart.graph.append('g')
                .attr('class', 'graph-mask animate')
                .attr('x', -6)
                .attr('y', -6);

            lineChart.overlayContainer = lineChart.graph.append('g')
                .attr('class', 'overlay-container');

            lineChart.redraw();
            d3.select(window).on('resize' + lineChart.selector, lineChart.redraw.bind(lineChart));

            // setTimeout(function () {
            //     lineChart.animateIn();
            // }, 600);
        },

        redraw: function () {
            var lineChart = this;
            var width = parseInt(lineChart.d3El.style('width'), 10) - lineChart.margin.right - lineChart.margin.left;
            var height = parseInt(lineChart.d3El.style('height'), 10) - lineChart.margin.top - lineChart.margin.bottom;


            /* Update the range of the scale with new width/height */
            lineChart.xScale.range([0, width]);
            lineChart.yScale.range([height, 0]);

            lineChart.setMask(width, height);
            lineChart.drawAxes(height);
            // this.addDataPoints();
            // this.addBoundsLabels({
            //     'start': this.data[0][1],
            //     'end': this.data[this.data.length - 1][1]
            // });

            /* Force D3 to recalculate and update the line */
            lineChart.lineEl = lineChart.graph.selectAll('.newsspec_12716__line');
            lineChart.lineEl.attr('d', lineChart.line);

            if (lineChart.hasAnimatedIn === false) {
                lineChart.mask = lineChart.graph.selectAll('.graph-mask')
                    .attr('class', 'graph-mask')
                    .attr('x', -6)
                    .attr('y', -6)
                    .attr('width', width + 12)
                    .attr('height', height + 12);
            } else {
                //
            }
        },

        setMask: function (width, height) {
            var lineChart = this;
            lineChart.mask.selectAll('*').remove();

            if (lineChart.hasAnimatedIn === false) {
                lineChart.maskCurtainGroup = lineChart.mask.append('g')
                    .attr('class', 'curtain')
                    .attr('x', 0)
                    .attr('y', -6);
            }

            lineChart.maskCurtainArea = lineChart.maskCurtainGroup.append('rect')
                .attr('width', width)
                .attr('height', height + 28)
                .attr('x', 0)
                .attr('y', -6);

            lineChart.maskLeft = lineChart.mask.append('rect')
                .attr('class', 'mask-left')
                .attr('x', -2)
                .attr('y', -6)
                .attr('width', 2)
                .attr('height', height + 24);

            lineChart.maskRight = lineChart.mask.append('rect')
                .attr('class', 'mask-right')
                .attr('x', width)
                .attr('y', -lineChart.margin.top)
                .attr('width', lineChart.margin.right)
                .attr('height', height + lineChart.margin.top + 30);
        },

        // addBoundsLabels: function (boundsData) {

        //     var group = this.overlayContainer.append('g');
        //     group.attr('class', 'bounds-labels');
        //     group.append('text')
        //             .attr('class', 'bounds')
        //             .attr('x', 0)
        //             .attr('y', this.yScale(boundsData.start) - 12)
        //             .attr('text-anchor', 'end')
        //             .text(boundsData.start);

        //     group.append('text')
        //             .attr('class', 'bounds')
        //             .attr('x', parseInt(this.d3El.style('width'), 10) - this.margin.right - this.margin.left)
        //             .attr('y', this.yScale(boundsData.end) + 28)
        //             .attr('text-anchor', 'start')
        //             .text(boundsData.end);
        // },

        drawAxes: function () {
            var lineChart = this;
            var yPos = lineChart.yScale(300);
            var width = parseInt(lineChart.d3El.style('width'), 10) - lineChart.margin.right - lineChart.margin.left;
            var labels = [];
            lineChart.axisContainer.selectAll('*').remove();

            for (var i = 13; i < lineChart.data.length; i += 60) {
                var labelText = lineChart.setYearLabelText(lineChart.data[i][0]);
                labels.push(labelText);
            }

            for (var l = 0; l < labels.length; l++) {
                var xPos = lineChart.xScale((l * 60) + 13);
                var xGroup = lineChart.axisContainer.append('g');

                xGroup.attr('class', 'x-axis-ticks');

                // draw x axis ticks
                xGroup.append('line')
                    .attr('x1', xPos)
                    .attr('y1', yPos)
                    .attr('x2', xPos)
                    .attr('y2', yPos + 4)
                    .attr('class', 'x-axis-tick');

                // draw x axis labels
                xGroup.append('text')
                    .attr('x', xPos)
                    .attr('y', yPos + lineChart.xAxislabelsOffset)
                    .attr('text-anchor', 'middle')
                    .text(labels[l]);
            }

            for (var j = 0; j <= 110; j += 10) {
                yVal = 300 + j;
                yPos = lineChart.yScale(yVal);
                var yGroup = lineChart.axisContainer.append('g');
                var yGroupMask = lineChart.maskCurtainGroup.append('g');
                var tickClass = j === 0 ? 'x-axis' : 'y-axis-tick';

                yGroup.attr('class', 'y-axis-ticks');

                // draw y axis ticks
                yGroup.append('line')
                    .attr({
                        x1: 0,
                        y1: yPos,
                        x2: width,
                        y2: yPos,
                        'class': tickClass
                    });

                // draw y axis ticks on mask
                yGroupMask.append('line')
                    .attr({
                        x1: 0,
                        y1: yPos,
                        x2: width,
                        y2: yPos,
                        'class': tickClass
                    });

                // // draw y axis labels
                yGroup.append('text')
                    .attr('x', -4)
                    .attr('y', yPos + 3)
                    .attr('text-anchor', 'end')
                    .text(yVal);
            }
        },

        setYearLabelText: function (datum) {
            var mySubstring = datum.substring(datum.length - 2);
            return parseInt(mySubstring, 10) > 58 ? '19' + mySubstring : '20' + mySubstring;
        },

        animateIn: function () {
            var width = parseInt(this.d3El.style('width'), 10) - this.margin.right - this.margin.left;
            // this.lineEl.transition()
            //     .delay(100)
            //     .duration(600)
            //     .attr('stroke-dashoffset', 0);

            // Slide the mask off to make the line look like it's animating
            this.maskCurtainGroup.transition()
                .delay(100)
                .duration(3200)
                .attr('transform', 'translate(' + width + ', 0)');

            this.hasAnimatedIn = true;
        },

        numberWithCommas: function (x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },

        handleOptimizedScroll: function () {
            if (Utils.isElementInViewport(news.$(this.selector))) {
                this.animateIn();
                if (!this.greenHouseGasesChartReached) {
                    news.istats.log('greenhouse-gases-chart-reached', 'newsspec-interaction');
                }
                this.greenHouseGasesChartReached = true;
            }
        }
    };

    return LineChart;
});
