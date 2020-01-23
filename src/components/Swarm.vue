<template>
    <div :id="id" class="swarm-container" :style="containerStyles">
    </div>
</template>

<script>

    import * as d3 from 'd3';

    export default {
        name: "Swarm",
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
            }
        },
        data() {
            return {
                id: 0,
                svg: null,
                radius: 5,
                colors: [
                    "#e8c1a0",
                    "#f47560",
                    "#f1e15b",
                    "#e8a838",
                    "#61cdbb",
                    "#97e3d5"
                ],
                step: 50,
                x: null,
                y: null,
                xAxisLabels: [],
                yAxisLabels: [],
                xAxis: null,
                yAxisLeft: null,
                yAxisRight: null,
                tip: null,
                margin: {top: 0, left: 90, bottom: 0, right: 30}
            }
        },
        created() {
            this.margin.top = this.radius * 2.5;
            this.margin.bottom = this.radius;
            this.width= this.width - this.margin.left - this.margin.right;
            this.height=this.height - this.margin.top - this.margin.bottom - 40;
            this.id = `swarm${this._uid}`;
        },
        mounted() {
            this.renderChart()
        },
        methods: {
            renderChart() {

                this.svg = d3.select(`#${this.id}`)
                    .append("svg")
                    .attr("width", this.width + this.margin.left + this.margin.right)
                    .attr("height", this.height + this.margin.top + this.margin.bottom + 40)
                    .append("g")
                    .attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")");

                let xLabelMaxValue = Math.max.apply(Math, this.data.map((item) => item.value));

                this.yAxisLabels = [...new Set(this.data.map((item) => item.group))];
                for (let i = 0; i <= xLabelMaxValue; i += this.step) {
                    this.xAxisLabels.push(i);
                }
                if (this.is_vertical) {
                    this.x = d3.scaleBand()
                        .rangeRound([0, this.width])
                        .domain(this.yAxisLabels);

                    this.xAxis = d3.axisBottom(this.x);

                    this.y = d3.scaleLinear()
                        .range([this.height, 0])
                        .domain([0, xLabelMaxValue]);
                    this.yAxisLeft = d3.axisLeft(this.y)
                        .tickSize(0)

                    this.yAxisRight = d3.axisRight(this.y)
                        .tickSizeOuter(0)
                        .tickSizeInner(-this.width);
                } else {
                    this.x = d3.scaleLinear()
                        .range([0, this.width])
                        .domain([0, xLabelMaxValue]);
                    this.xAxis = d3.axisBottom(this.x);
                    this.y = d3.scaleBand()
                        .rangeRound([0, this.height])
                        .domain(this.yAxisLabels);

                    this.yAxisLeft = d3.axisLeft(this.y)
                        .tickSize(0)

                    this.yAxisRight = d3.axisRight(this.y)
                        .tickSizeOuter(0)
                        .tickSizeInner(-this.width);
                }

                this.tip = d3.select(`#${this.id}`).append("div")
                    .attr("class", "tip")
                    .style("position", "fixed");


                this.svg.append("g")
                    .attr("class", "axis y left")
                    .call(this.yAxisLeft)
                    .selectAll(".tick text")
                    .attr("dx", -this.radius);


                this.svg.append("g")
                    .attr("class", "axis y right")
                    .attr("transform", "translate(" + this.width + ", 0)")
                    .call(this.yAxisRight.tickFormat(() => ''))
                    .selectAll(".tick text")
                    .attr("dx", this.radius);

                this.svg.append("g")
                    .attr("class", "axis x")
                    .attr("transform", "translate(0, " + this.height + ")")
                    .call(this.xAxis)
                    .selectAll(".tick line")
                    .attr('y2', -this.height);

                if (this.is_vertical) {
                    this.forceSimVertical();
                } else {
                    this.forceSimHorizontal();
                }

                this.draw();
            },
            draw() {
                let circle = this.svg.selectAll(".circle-hover")
                    .data(this.data);

                circle.enter().append("circle")
                    .attr("class", "circle-hover")
                    .attr("r", this.radius)
                    .style("stroke", ((d) => this.colors[this.yAxisLabels.findIndex(el => el == d.group)]).bind(this))
                    .style("fill", ((d) => this.colors[this.yAxisLabels.findIndex(el => el == d.group)]).bind(this))
                    .merge(circle)
                    .attr("cx", function (d) {
                        return d ? d.x : null;
                    })
                    .attr("cy", function (d) {
                        return d ? d.y : null;
                    });

                this.svg.selectAll(".circle-hover").on("mouseover", (function (d, index, el) {

                    this.tip.html(`
                <div style="border: 1px solid #cdcdcd; background-color: #fff; padding: 5px;">
                    <span>${d.id}: <b>${d.value}</b></span>
                </div>
                `);
                    let tip_width = this.tip._groups[0][0].clientWidth;
                    let tip_height = this.tip._groups[0][0].clientHeight;
                    let circle_node = d3.select(el[index]).node().getBoundingClientRect();
                    let tip_left = circle_node.left - tip_width / 2 + this.radius;
                    let tip_top = circle_node.top - this.radius * 1.5 - tip_height;
                    this.tip
                        .style("left", tip_left + "px")
                        .style("top", tip_top + "px");

                }).bind(this)).on("mouseout", (function () {
                    this.tip
                        .style("left", "-1000px")
                        .style("top", "-1000px");

                }).bind(this));

            }, forceSimVertical() {
                let simulation = d3.forceSimulation(this.data)
                    .force("x", d3.forceX(((d) => this.x(d.group) + this.x.bandwidth() / 2).bind(this)).strength(1))
                    .force("y", d3.forceY(((d) => this.y(d.value)).bind(this)).strength(1))
                    .force("collide", d3.forceCollide(this.radius + 1))
                    .stop();

                for (let i = 0; i < 200; ++i) simulation.tick();
            },

            forceSimHorizontal() {
                let simulation = d3.forceSimulation(this.data)
                    .force("Y", d3.forceY(((d) => this.y(d.group) + this.y.bandwidth() / 2).bind(this)).strength(1))
                    .force("x", d3.forceX(((d) => this.x(d.value)).bind(this)).strength(1))
                    .force("collide", d3.forceCollide(this.radius + 1))
                    .stop();

                for (let i = 0; i < 200; ++i) simulation.tick();
            }
        },
        computed: {
            containerStyles() {
                return {
                    width: `${this.width + this.margin.left + this.margin.right}px`,
                    height: `${this.height + this.margin.top + this.margin.bottom + 40}px`
                }
            }
        }
    }

</script>

<style scoped>
    div.swarm-container {
        margin: 0 auto;
    }

    div.swarm-container >>> .axis .domain {
        display: none;
    }

    div.swarm-container >>> .axis text {
        fill: rgb(106, 124, 137);
        font-size: 11px;
        font-family: sans-serif;
    }

    div.swarm-container >>> .axis.y.right .tick text {
        fill: #b43d7d;
    }

    div.swarm-container >>> .axis.y .tick line {
        stroke: #eee;
        stroke-width: 1px;
    }

    div.swarm-container >>> .axis.x .tick line {
        stroke: #eee;
        stroke-width: 1px;
    }

    div.swarm-container >>> div.tip {
        position: fixed;
        font-size: .8em;
        text-align: center;
    }
</style>