<template>
  <div class="screen">
    <h1>Gruppeneinteilung v{{ version }}</h1>
    <Zuordnung 
      v-for="(z,i) in zuordnungen"
      :nummer="zuordnungen.length-i"
      :zuordnung="z"
    />
    <Button label="Neue Zuordnung" @click="$root.createZuordnung()"/>
  </div>
</template>

<script>
import { Button } from 'primevue';
import {version} from '../../package.json';
import Zuordnung from './zuordnung.vue';

export default{
  components: {
    Button, Zuordnung
  },
  props: {
    zuordnungen: Array
  },
  data(){
    return {
      version,
      
    }
  },
  
};
</script>