<template>
    <div :id="id" class="sunburst-container" :style="containerStyles">
        <div class="main">
            <div class="chart">
                <div class="explanation" style="visibility: hidden;">
                    <div class="percentage">
                    </div>
                </div>
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
            width: {
                type: Number,
                default: 400
            },
            height: {
                type: Number,
                default: 400
            }
        },
        data() {
            return {
                id: 0,
                totalSize: 0,
                vis: null,
                partition: null,
                arc: null,
                radius: 0
            };
        },
        created() {
            this.id = `sunburst${this._uid}`;
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
                    .style("fill", d => d.data.color)
                    .style("opacity", 1)
                    .style("stroke", "#fff")
                    .style("stroke-width", '1px')
                    .on("mouseover", this.mouseOver);

                d3.select(`#${this.id} #container`).on("mouseleave", this.mouseLeave);

                this.totalSize = path.datum().value;
            },
            mouseOver(d) {
                let percentage = (100 * d.value / this.totalSize).toPrecision(3);
                let percentageString = percentage < 0.1 ? `< ${percentage}%` : `${percentage}%`;
                percentageString = `<span class="percentage">${percentageString}</span><br /> ${d.data.name}`
                d3.select(`#${this.id} div.percentage`)
                    .html(percentageString);
                d3.select(`#${this.id} div.explanation`)
                    .style("visibility", "");

                let sequenceArray = d.ancestors().reverse();
                sequenceArray.shift();
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