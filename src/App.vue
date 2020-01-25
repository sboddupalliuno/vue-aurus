<template>
    <div id="app">
        <Swarm
                :data="dataswarm.data"
                :colors="dataswarm.colors"
                :width="600"
                :height="500"
                :is_vertical="true"
        />
        <Sunburst
                :data="datasunburst"
                :width="500"
                :height="500"
        />
    </div>
</template>

<script>

    import {Swarm, Sunburst} from './index.js';
    import dataswarm from '../data/data-swarm.json'
    import datasunburst from '../data/data-sunburst.json'
    export default {
        name: 'app',
        data() {
            return {
                dataswarm: dataswarm,
                datasunburst: datasunburst,
            }
        },
        mounted(){

        },
        components: {
            Swarm,
            Sunburst
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
