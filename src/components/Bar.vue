<template>
    <div :id="id" class="bar-container" :style="containerStyles">
    </div>
</template>

<script>

    import * as d3 from 'd3';

    export default {
        name: "Bar",
        props: {
            data: Array,
            width: {
                type: Number,
                default: 400
            },
            height: {
                type: Number,
                default: 400
            },
            is_vertical: {
                type: Boolean,
                default: false
            },
            target: {
                type: [Number, Boolean],
                default: false
            }
        },
        data() {
            return {
                id: 0,
                svg: null,
                margin: {top: 20, right: 20, bottom: 30, left: 80},
                xScale: null,
                yScale: null,
                chartWidth: 0,
                chartHeight: 0
            }
        },
        created() {
            this.chartWidth = this.width - this.margin.left - this.margin.right;
            this.chartHeight = this.height - this.margin.top - this.margin.bottom;
            this.id = `bar${this._uid}`;
        },
        mounted() {
            this.renderChart()
        },
        methods: {
            renderChart() {
                this.svg = d3.select(`#${this.id}`)
                    .append("svg")
                    .attr("width", this.chartWidth + this.margin.left + this.margin.right)
                    .attr("height", this.chartHeight + this.margin.top + this.margin.bottom + 40)
                    .append("g")
                    .attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")");

                if (this.is_vertical) {
                    this.xScale = d3.scaleBand()
                        .range([0, this.chartWidth])
                        .domain(this.data.map(function (item) {
                            return item.name
                        }))
                        .padding(0.2);

                    this.yScale = d3.scaleLinear()
                        .range([this.chartHeight, 0])
                        .domain([0, d3.max(this.data, function (d) {
                            return d.value;
                        })]);
                } else {
                    this.xScale = d3.scaleLinear()
                        .range([0, this.chartWidth])
                        .domain([0, d3.max(this.data, function (d) {
                            return d.value;
                        })]);

                    this.yScale = d3.scaleBand()
                        .range([0, this.chartHeight])
                        .domain(this.data.map(function (item) {
                            return item.name
                        }))
                        .padding(0.2);
                }

                this.svg.append("g")
                    .attr("transform", "translate(0," + this.chartHeight + ")")
                    .call(
                        d3.axisBottom(this.xScale)
                            .tickPadding(5)
                            .tickSize(0)
                    )

                this.svg.append("g")
                    .call(
                        d3.axisLeft(this.yScale)
                            .tickSize(0)
                    )
                    .attr("transform", "translate(-5,0 )")

                if (this.is_vertical) {
                    this.svg.selectAll(".bar")
                        .data(this.data)
                        .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", (function (d) {
                            return this.xScale(d.name);
                        }).bind(this))
                        .attr("y", (function (d) {
                            return this.yScale(d.value);
                        }).bind(this))
                        .attr("width", this.xScale.bandwidth())
                        .attr("height", (function (d) {
                            return this.chartHeight - this.yScale(d.value);
                        }).bind(this))
                        .style("fill", (d) => d.color ? d.color : '#9d9d9f');


                    if (this.target) {
                        this.svg.append('line')
                            .attr('x1', 0)
                            .attr('y1', this.yScale(this.target))
                            .attr('x2', this.chartWidth)
                            .attr('y2', this.yScale(this.target))
                            .attr('stroke', 'red');

                        this.svg
                            .append('text')
                            .attr('class', 'target-label')
                            .attr('x', this.yScale(this.target))
                            .attr('y', -this.chartWidth - 5)
                            .attr('transform', 'rotate(90)')
                            .attr('text-anchor', 'middle')
                            .text(this.target)
                    }

                } else {
                    this.svg.selectAll(".bar")
                        .data(this.data)
                        .enter().append("rect")
                        .attr("class", "bar")
                        .attr("y", (function (d) {
                            return this.yScale(d.name);
                        }).bind(this))
                        .attr("height", this.yScale.bandwidth())
                        .attr("width", (function (d) {
                            return this.xScale(d.value);
                        }).bind(this))
                        .style("fill", (d) => d.color ? d.color : '#9d9d9f');

                    if (this.target) {
                        this.svg.append('line')
                            .attr('x1', this.xScale(this.target))
                            .attr('y1', 0)
                            .attr('x2', this.xScale(this.target))
                            .attr('y2', this.chartHeight)
                            .attr('stroke', 'red');

                        this.svg
                            .append('text')
                            .attr('class', 'target-label')
                            .attr('x', this.xScale(this.target))
                            .attr('y', -5)
                            .attr('transform', 'rotate(0)')
                            .attr('text-anchor', 'middle')
                            .text(this.target)
                    }
                }
            },
        },
        computed: {
            containerStyles() {
                return {
                    width: `${this.chartWidth + this.margin.left + this.margin.right}px`,
                    height: `${this.chartHeight + this.margin.top + this.margin.bottom + 40}px`
                }
            }
        }
    }

</script>

<style scoped>
    div.bar-container {
        margin: 0 auto;
    }

    div.bar-container >>> .bar:hover {
        fill-opacity: 0.7;
    }

    div.bar-container >>> .target-label {
        font-weight: bold;
        fill: #636363;
    }

    div.bar-container >>> .domain {
        stroke: #a4a4a4;
        stroke-width: 1px;
    }
</style>