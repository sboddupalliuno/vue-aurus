**vue-aurus** provides components to build data visualization apps, it's built on top of d3

## Instalation

````
npm i vue-aurus
````

## Usage

```vue
<template>
  <div id="app">
    <Sunburst :data="data" />
  </div>
</template>

<script>
import {Sunburst} from 'vue-aurus'

import chartData from '../data/data-sunburst.json';

export default {
    data(){
        return {
            data: chartData
        }    
    },
    components:{
        Sunburst
    }
}
</script>

```

## Implemented charts
* Sunburst
* Swarm


## Input data

Full Datasets' examples are in the folder data/[chart name].json

#### Swarm 
````json
{
  "colors": {              //optional
    "group A": "#f47560",
    "group B": "#61cdbb",
    "group C": "#f1e15b"
  },
  "data": [
    {
      "id": "0",
      "group": "group A",
      "value": 76,
      "color": "#cdcdcd",  //optional
      "radius": 10         //optional
    }
  ]
}

````
#### Sunburst

Full Dataset are in the folder data/data-sunburst.json

