<template>
  <div class="screen">
    <h1>Gruppeneinteilung v{{ version }}</h1>
    <p>
      <Button @click="$emit('back')" label="Zurück zur Dateneingabe"/>
    </p>
    {{ $root.teilnehmerCount }} Teilnehmer
    <p>
      <Button label="Neue Zuordnung" @click="$root.createZuordnung()"/>
    </p>
    <Zuordnung 
      v-for="(z,i) in zuordnungen"
      :nummer="zuordnungen.length-i"
      :zuordnung="z"
    />
    
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