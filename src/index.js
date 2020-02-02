import Sunburst from './components/Sunburst';
import Swarm from './components/Swarm';
import Bar from './components/Bar';

export {
    Sunburst,
    Swarm,
    Bar
}

function install(Vue) {
    Vue.component('Sunburst', Sunburst)
    Vue.component('Swarm', Swarm)
    Vue.component('Bar', Bar)
}

export default {install: install}