<template>
  <div class="screen">
    <h1>Zimmereinteilung v{{ version }}</h1>
    <p>Mit dieser App kann man Teilnehmer*innen (TN) in Zimmer einteilen.</p>
    <div>Anleitung:
      <ol>
        <li>Geben Sie die Wünsche der TN in folgender Form an:
  <pre>
  Thomas Klein: Alan Turing, Edsger Dijkstra, Carl Gauss, ...
  Alan Turing: Benedict Cumberbatch, Kurt Gödel, ...
  Grace Hopper: Ada Lovelace, Emmy Noether, Marie Curie, ...
  ...
  </pre>
          Links steht also jeweils der Name des*der Teilnehmer*in und hinter dem Doppelpunkt folgt eine mit Komma getrennte Liste mit den Wünschen dieses TN. Groß-/Kleinschreibung spielt dabei keine Rolle!
          <p>Wichtig: Jeder Name muss eindeutig sein!</p>
          <div>
            <Textarea
              auto-resize
              v-model="input.wuensche"
              class="input-textarea"
              placeholder="Teilnehmer und ihre Wünsche..."
            />
          </div>
        </li>
        <li>Geben Sie an, wie viele Zimmer einer bestimmten Maximal-Größe zur Verfügung:
  <pre>
  4: 3
  6: 5
  </pre>
          Das bedeutet, dass es 3 Vierer-Zimmer und 5 Sechser-Zimmer geben soll.
          <div>
            <Textarea
              auto-resize
              v-model="input.zimmer"
              class="input-textarea"
              placeholder="Anzahl Zimmer verschiedener Maximalgrößen..."
            />
          </div>
        </li>
        <li>
          Klicken Sie auf <Button label="Daten übernehmen" @click="confirmData()"/>
          <div v-if="errors && errors.length>0">
            Es sind folgende Probleme bei Ihren Eingaben aufgetreten:
            <ol>
              <li v-for="(e,i) in errors">
                <div>
                  <strong>{{ e.category }}, Zeile {{ e.linenumber }}</strong>: <code style="background-color: lightgray; min-width: 3rem; white-space: pre;">{{ e.rawtext }}</code>
                </div>
                <div>
                  {{ e.message }}
                </div>
              </li>
            </ol>
            <Button label="Probleme ignorieren und weiter" @click="weiter()"/>
          </div>
        </li>
        
      </ol>
    </div>
  </div>
</template>

<script>
import { Textarea, Button } from 'primevue';
import {version} from '../../package.json';
import { readTeilnehmer } from '../functions/readTeilnehmer';
import { readZimmer } from '../functions/readZimmer';
import { createError } from '../functions/createError';

export default{
  components: {
    Textarea, Button
  },
  data(){
    return {
      input: {
        wuensche: "",
        zimmer: ""
      },
      version,
      errors: null
    }
  },
  methods: {
    setInputs(input){
      if(!input) return;
      this.input=input;
    },
    confirmData(){
      this.$emit("save-inputs",this.input);
      this.errors=[];
      let teilnehmer=readTeilnehmer(this.input.wuensche,this.errors);
      let zimmer=readZimmer(this.input.zimmer,this.errors);
      console.log(teilnehmer,zimmer);
      if(teilnehmer.$count===0){
        this.errors.push(createError("Teilnehmer","-","-","Es wurden keine Teilnehmer definiert."));
      }
      if(zimmer.length===0){
        this.errors.push(createError("zimmer","-","-","Es wurden keine zimmer definiert."));
      }
      if(this.errors.length!==0) return;
      this.$emit("confirmData",{teilnehmer, zimmer});
    },
    weiter(){
      let teilnehmer=readTeilnehmer(this.input.wuensche);
      let zimmer=readZimmer(this.input.zimmer);
      this.$emit("confirmData",{teilnehmer, zimmer});
    }
  }
};
</script>