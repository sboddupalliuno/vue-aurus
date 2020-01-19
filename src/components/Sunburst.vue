<template>
    <div :id="id" class="sunburst-container" :style="containerStyles">
        <div class="main">
            <div v-if="is_breadcrumbs" class="sequence"></div>
            <div class="chart">
                <div class="explanation" style="visibility: hidden;">
                    <div>
                        <span class="percentage"></span>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="this.is_legend" class="sidebar">
            <div class="button">
                <input type="checkbox" class="togglelegend"> Legend
            </div>
            <div>
                <div class="legend" style="visibility: hidden;"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import * as d3 from 'd3';

    export default {
        name: "Sunburst",
        props: {
            data: Object,
            is_legend: Boolean,
            is_breadcrumbs: Boolean
        },
        data() {
            return {
                id:0,
                fild: this.ban,
                width: 400,
                height: 400,
                breadcrumbsDimmensions: {
                    w: 53,
                    h: 20,
                    s: 3,
                    t: 10
                },
                colors: {
                    "home": "#e8c1a0",
                    "product": "#f47560",
                    "search": "#f1e15b",
                    "account": "#e8a838",
                    "other": "#61cdbb",
                    "end": "#97e3d5"
                },
                totalSize: 0,
                vis: null,
                partition: null,
                arc: null,
                radius: 0
            };
        },
        created(){
            this.id= `sunburst${this._uid}`;
        },
        mounted() {
            this.renderChart()

        },
        methods: {
            log(...data) {
                window.console.log(data);
            },
            renderChart() {
                this.radius = Math.min(this.width, this.height) / 2;
                this.vis = d3.select(`#${this.id} div.chart`)
                    .append("svg:svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .append("swg:g")
                    .attr("id", "container")
                    .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

                this.partition = d3.partition()
                    .size([2 * Math.PI, this.radius * this.radius]);

                this.arc = d3.arc()
                    .startAngle(d => d.x0)
                    .endAngle(d => d.x1)
                    .innerRadius(d => Math.sqrt(d.y0))
                    .outerRadius(d => Math.sqrt(d.y1));

                this.createVisualization()
            },
            createVisualization() {

                this.initBreadcrumbTrail();
                this.drawLegend();

                d3.select(`#${this.id} input.togglelegend`).on("click", this.toggleLegend);
                this.vis.append("svg:circle")
                    .attr("r", this.radius)
                    .style("opacity", 0);


                let root = d3.hierarchy(this.data)
                    .sum(d => d.size)
                    .sort((a, b) => b.value - a.value)

                let nodes = this.partition(root).descendants()
                    .filter(d => d.x1 - d.x0 > 0.005);

                let path = this.vis.data([this.data]).selectAll("path")
                    .data(nodes)
                    .enter().append("svg:path")
                    .attr("display", d => d.depth ? null : 'none')
                    .attr("d", this.arc)
                    .attr("fill-rule", "evenodd")
                    .style("fill", d => this.colors[d.data.name])
                    .style("opacity", 1)
                    .style("stroke", "#fff")
                    .style("stroke-width", '1px')
                    .on("mouseover", this.mouseOver);

                d3.select(`#${this.id} #container`).on("mouseleave", this.mouseLeave);

                this.totalSize = path.datum().value;
            },
            initBreadcrumbTrail() {
                let trail = d3.select(`#${this.id} div.sequence`)
                    .append("svg:svg")
                    .attr("width", this.width)
                    .attr("height", 30)
                    .attr("id", "trail");

                trail.append("svg:text")
                    .attr("id", "endlabel")
                    .style("fill", "#676767")


            },
            drawLegend() {
                let li = {
                    w: 75, h: 30, s: 3, r: 3
                };

                let legend = d3.select(`#${this.id} div.legend`).append("svg:svg")
                    .attr("width", li.w)
                    .attr("height", d3.keys(this.colors).length * (li.h + li.s));

                let g = legend.selectAll("g")
                    .data(d3.entries(this.colors))
                    .enter().append("svg:g")
                    .attr("transform", function (d, i) {
                        return "translate(0," + i * (li.h + li.s) + ")";
                    });

                g.append("svg:rect")
                    .attr("rx", li.r)
                    .attr("ry", li.r)
                    .attr("width", li.w)
                    .attr("height", li.h)
                    .style("fill", function (d) {
                        return d.value;
                    });

                g.append("svg:text")
                    .attr("x", li.w / 2)
                    .attr("y", li.h / 2)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "middle")
                    .text(function (d) {
                        return d.key;
                    });

            },
            toggleLegend() {
                var legend = d3.select(`#${this.id} div.legend`);
                if (legend.style("visibility") == "hidden") {
                    legend.style("visibility", "");
                } else {
                    legend.style("visibility", "hidden");
                }

            },
            mouseOver(d) {
                let percentage = (100 * d.value / this.totalSize).toPrecision(3);
                let percentageString = percentage < 0.1 ? `< ${percentage}%` : `${percentage}%`;

                d3.select(`#${this.id} span.percentage`)
                    .text(percentageString);
                d3.select(`#${this.id} div.explanation`)
                    .style("visibility", "");

                let sequenceArray = d.ancestors().reverse();
                sequenceArray.shift();
                this.updateBreadcrumbs(sequenceArray, percentageString);
                d3.selectAll(`#${this.id} path`)
                    .style("opacity", 0.3);
                this.vis.selectAll("path")
                    .filter(node => (sequenceArray.indexOf(node) >= 0))
                    .style("opacity", 1);


            },
            mouseLeave() {
                d3.select(`#${this.id} #trail`)
                    .style("visibility", "hidden");
                d3.selectAll(`#${this.id} path`)
                    .style("opacity", 1);

                d3.select(`#${this.id} div.explanation`)
                    .style("visibility", "hidden")
            },
            updateBreadcrumbs(nodeArray, percentageString) {
                let trail = d3.select(`#${this.id} #trail`)
                    .selectAll("g")
                    .data(nodeArray, d => d.data.name + d.depth);

                trail.exit().remove();
                let entering = trail.enter().append("svg:g");
                entering.append("svg:polygon")
                    .attr("points", this.breadcrumbPoints)
                    .style("fill", d => this.colors[d.data.name])

                entering.append("svg:text")
                    .attr("x", (this.breadcrumbsDimmensions.w + this.breadcrumbsDimmensions.t) / 2)
                    .attr("y", this.breadcrumbsDimmensions.h / 2)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "middle")
                    .style("font-size", "12px")
                    .text(d => d.data.name);


                entering.merge(trail).attr("transform", (function (d, i) {
                    return `translate(${i * (this.breadcrumbsDimmensions.w + this.breadcrumbsDimmensions.s)},0)`;
                }).bind(this));

                d3.select(`#${this.id} #trail`).select(`#${this.id} #endlabel`)
                    .attr("x", (nodeArray.length + 0.65) * (this.breadcrumbsDimmensions.w + this.breadcrumbsDimmensions.s))
                    .attr("y", this.breadcrumbsDimmensions.h / 2)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "middle")
                    .text(percentageString);

                d3.select(`#${this.id} #trail`)
                    .style("visibility", "");


            },
            breadcrumbPoints(d, i) {
                let points = [];
                points.push("0,0");
                points.push(`${this.breadcrumbsDimmensions.w},0`);
                points.push(`${this.breadcrumbsDimmensions.w + this.breadcrumbsDimmensions.t},${this.breadcrumbsDimmensions.h / 2}`);
                points.push(`${this.breadcrumbsDimmensions.w},${this.breadcrumbsDimmensions.h}`);
                points.push(`0,${this.breadcrumbsDimmensions.h}`);
                if (i > 0) {
                    points.push(`${this.breadcrumbsDimmensions.t},${this.breadcrumbsDimmensions.h / 2}`);
                }

                return points.join(" ");
            }
        },
        computed: {
            containerStyles() {
                return {
                    width: `${this.width}px`,
                    height: `${this.height}px`
                }
            }
        }


    }
</script>
<style scoped>
    div.sunburst-container {
        display: flex;
        align-items: center;
    }

    div.main {
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
    }

    div.sidebar {
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
        min-width: 100px;
    }

    div.sequence {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    div.legend {
        padding: 10px 0 0 3px;
    }

    div.sequence text, div.legend text {
        font-size: 12px;
        fill: #fff;
    }

    div.chart {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    div.chart path {
        stroke: #fff;
    }

    div.explanation {
        text-align: center;
        color: #666;
        display: flex;
        position: absolute;
        align-items: center;
        justify-content: center;
    }

    span.percentage {
        font-size: 18px;
        font-weight: 700;
    }


</style>