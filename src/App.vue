<template>
    <div id="app">
        <Swarm
                :data="dataSwarm.data"
                :colors="dataSwarm.colors"
                :width="600"
                :height="500"
                :is_vertical="true"
        />
        <Sunburst
                :data="dataSunburst"
                :width="500"
                :height="500"
        />
        <Bar
                :data="dataBar"
                :width="500"
                :height="300"
                :target="25"
                :is_vertical="true"
        />
    </div>
</template>

<script>

    import {Swarm, Sunburst, Bar} from './index.js';
    import dataSwarm from '../data/data-swarm.json'
    import dataSunburst from '../data/data-sunburst.json'
    import dataBar from '../data/data-bar.json'

    export default {
        name: 'app',
        data() {
            return {
                dataSwarm: dataSwarm,
                dataSunburst: dataSunburst,
                dataBar: dataBar,
            }
        },
        mounted() {

        },
        components: {
            Swarm,
            Sunburst,
            Bar
        }

    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
