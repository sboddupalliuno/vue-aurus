<template>
    <div id="app">
        <Sunburst
                :data="data"
                :width="300"
                :height="300"
        />
    </div>
</template>

<script>

    import {Sunburst} from './index.js';
    import datafile from '../public/data-sunburst.json'
    export default {
        name: 'app',
        data() {
            return {
                data: datafile
            }
        },
        mounted(){
            window.console.log(this.data);
        },
        components: {
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
