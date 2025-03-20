<template>
  <div class="screen">
    <div class="no-print">
      <h1>Gruppeneinteilung v{{ version }}</h1>
      <p>
        <Button @click="$emit('back')" label="Zurück zur Dateneingabe"/>
      </p>
      {{ $root.teilnehmerCount }} Teilnehmer <Button label="Details" @click="showDialogDetails=true"/>
      <p>
        <Button label="Neue Zuordnung" @click="$root.createZuordnung()"/>
      </p>
    </div>
    <Zuordnung 
      v-for="(z,i) in zuordnungen"
      :nummer="zuordnungen.length-i"
      :zuordnung="z"
    />
    <Dialog v-model:visible="showDialogDetails" maximizable ref="dialogDetails" header="Teilnehmer*innen">
      <Details :teilnehmer="$root.teilnehmer"/>
    </Dialog>
  </div>
</template>

<script>
import { Button, Dialog } from 'primevue';
import {version} from '../../package.json';
import Zuordnung from './zuordnung.vue';
import Details from './details.vue';

export default{
  components: {
    Button, Zuordnung, Dialog, Details
  },
  props: {
    zuordnungen: Array
  },
  data(){
    return {
      version,
      showDialogDetails: false
    }
  },
};
</script>