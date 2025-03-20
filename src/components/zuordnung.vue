<template>
<div class="zuordnung" :class="print? '':'no-print'">
  <h3>Zuordnung #{{ nummer }}</h3>
  <div>
    <Checkbox v-model="print" binary/> Ausdrucken
  </div>
  <div>
    Anzahl Teilnehmer*innen: {{ teilnehmerCount }}
  </div>
  <div>
    Anzahl Plätze: {{ plaetzeCount }}
  </div>
  <div>
    Zimmergrößen: <template v-for="(z,i) in zuordnung.zimmer">{{(i>0? ', ':'')+ z.maxSize }}</template>
  </div>
  <div class="no-print">
    <div>
      Mindestanzahl Wünsche (wer weniger Wünsche angibt, wird zuletzt zugeordnet)
      <InputText v-model="zuordnung.minimumWishCount" placeholder="Mindestanzahl Wünsche"/>
    </div>
    <div>
      Teilnehmer*innen mit zu wenig Wünschen:
      <template v-if="zuWenigWuensche.length>0">
        {{ zuWenigWuensche.length }}
        <div>
          <span v-for="(t,i) in zuWenigWuensche">{{ (i>0? ', ':'')+t.name }}</span>
        </div>
      </template>
      <template v-else>
        keine
      </template>
    </div>
    <div>
      Strafen für: Kein Wunsch erfüllt, nur 1 Wunsch erfüllt, nur 2 Wünsche erfüllt, ...
      <InputText v-model="strafen" placeholder="Strafen, mit Komma getrennt"/>
    </div>
    <Button label="Suchen" :disabled="searching" @click="starteSuche()"/>
    <div v-show="searching">Suche läuft {{ searchAnimation }} 
      <div><Button label="Stopp" @click="stoppeSuche()"/></div>
    </div>
    <div>
      <Button label="Löschen" @click="$root.removeZuordnung(i)"/>
    </div>
  </div>
  <div v-if="besteEinteilung">
    <div>Strafe: {{ besteEinteilung.strafe }}</div>
    <div v-if="!searching">Statistik:
      <table>
        <tr>
          <th># erfüllte Wünsche</th>
          <th># TN</th>
          <th>Strafe</th>
        </tr>
        <tr v-for="(w,i) in statistik.einzelWerte">
          <td>{{ w.anzahlWuensche + (i===0? '+':'')}}</td>
          <td>{{ w.anzahlTN }}</td>
          <td>{{ w.gesamtStrafe }}</td>
        </tr>
        <tr class="summary">
          <td>Gesamt</td>
          <td>{{ statistik.gesamtTN }}</td>
          <td>{{ statistik.gesamtStrafe }}</td>
        </tr>
      </table>
    </div>
    <div>Anzahl Versuche: {{ anzahlVersuche }}</div>
    <template v-if="!searching">
      <div v-for="(g,i) in besteEinteilung.gruppen">
        <div style="page-break-inside: avoid;" v-if="g.teilnehmer.length>0">
          <h3>#Personen: {{ g.teilnehmer.length }}, Strafe: {{ g.strafe }}</h3>
          <ol>
            <li v-for="(t,j) in g.teilnehmerFinalised">{{ t.name }} ({{t.strafe}})
              <div style="color: green">
                <span class="pi pi-check"/> <span v-html="t.erfuellt"/>
              </div>
              <div style="color: red" v-if="t.nichtErfuellt">
                <span class="pi pi-times"/> <span v-html="t.nichtErfuellt"/>
  </div>
            </li>
          </ol>
        </div>
      </div>
    </template>
  </div>
</div>
</template>

<script>
import { Button, Checkbox, InputText } from 'primevue';
import { sleep } from '../functions/sleep';
import { finaliseZuordnung, macheZuordnung } from '../functions/macheZuordnung';
import { action } from '@primeuix/themes/lara/image';
export default{
  components: {
    Button,InputText, Checkbox
  },
  props: {
    zuordnung: Object,
    nummer: Number
  },
  data(){
    return{
      print: false,
      searchAnimation: ".",
      searching: false,
      strafen: "1000,100,50,10",
      besteEinteilung: null,
      anzahlVersuche: 0,
      statistik: null
    }
  },
  watch: {
    zuordnung(){
      console.log("zuordnung changed",this.zuordnung);
      this.updateBesteEinteilung();
      this.updateStatistik();
      this.updateStrafen();
    }
  },
  computed: {
    zuWenigWuensche(){
      if(!this.zuordnung) return [];
      let min=this.zuordnung.minimumWishCount;
      let list=[];
      for(let a in this.zuordnung.teilnehmer){
        let t=this.$root.teilnehmer[a];
        if(t.wuensche.length<min){
          list.push(t);
        }
      }
      return list;
    },
    teilnehmerCount(){
      if(!this.zuordnung.teilnehmer) return 0;
      let c=0;
      for(let a in this.zuordnung.teilnehmer){
        c++;
      }
      return c;
    },
    plaetzeCount(){
      if(!this.zuordnung.zimmer) return 0;
      let c=0;
      for(let i=0;i<this.zuordnung.zimmer.length;i++){
        let z=this.zuordnung.zimmer[i];
        c+=z.maxSize;
      }
      return c;
    }
  },
  mounted(){
    console.log("mounted");
    this.updateBesteEinteilung();
    this.updateStatistik();
    this.updateStrafen();
  },
  methods: {
    updateStrafen(){
      if(!this.zuordnung) return;
      let p=this.zuordnung.strafen;
      this.strafen=p.join(",");
    },
    updateBesteEinteilung(){
      if(this.zuordnung.result){
        this.besteEinteilung=this.zuordnung.result;
        this.anzahlVersuche=this.zuordnung.result.anzahlVersuche;
      }else{
        this.besteEinteilung=null;
        this.anzahlVersuche=0;
      }
    },
    async starteSuche(){
      //strafen updaten:
      let p=this.strafen.split(",");
      this.zuordnung.strafen=[];
      for(let i=0;i<p.length;i++){
        this.zuordnung.strafen.push(p[i]*1);
      }
      this.searching=true;
      let besteStrafe=-1;
      if(this.besteEinteilung){
        besteStrafe=this.besteEinteilung.strafe;
      }
      let minCountWuensche=this.zuordnung.minimumWishCount;
      while(this.searching){
        let teilnehmer=[];
        for(let a in this.zuordnung.teilnehmer){
          teilnehmer.push(this.zuordnung.teilnehmer[a]);
        }
        //teilnehmer zufällig mischen, aber TN mit zu wenig wünschen werden weiter hinten einsortiert:
        for(let i=0;i<teilnehmer.length;i++){
          let j=Math.floor(Math.random()*teilnehmer.length);
          if(i!=j){
            let c=teilnehmer[i];
            teilnehmer[i]=teilnehmer[j];
            teilnehmer[j]=c;
          }
        }
        for(let i=0;i<teilnehmer.length;i++){
          let getauscht=false;
          for(let j=0;j<teilnehmer.length-i-1;j++){
            let a=teilnehmer[j];
            let b=teilnehmer[j+1];
            if(a.wuensche.length<minCountWuensche && a.wuensche.length<b.wuensche.length){
              teilnehmer[j]=b;
              teilnehmer[j+1]=a;
              getauscht=true;
            }
          }
          if(!getauscht) break;
        }

        let zimmer=JSON.parse(JSON.stringify(this.zuordnung.zimmer));
        
        let res=macheZuordnung(this.zuordnung.teilnehmer,zimmer,teilnehmer,this.zuordnung.strafen,minCountWuensche);

        if(!this.besteEinteilung || res.strafe<besteStrafe){
          besteStrafe=res.strafe;
          this.besteEinteilung=res;
          
        }

        if(this.anzahlVersuche%1000===0){
          this.searchAnimation+=".";
          if(this.searchAnimation.length>10){
            this.searchAnimation=".";
          }
          await sleep(10);
        }
        
        this.anzahlVersuche++;
      }
    },
    stoppeSuche(){
      this.searching=false;
      this.zuordnung.result=this.besteEinteilung;
      this.zuordnung.result.anzahlVersuche=this.anzahlVersuche;
      finaliseZuordnung(this.zuordnung);
      this.updateStatistik();
    },
    updateStatistik(){
      this.statistik={
        einzelWerte: [],
        gesamtStrafe: 0,
        gesamtTN: 0
      };
      if(!this.zuordnung) return;
      let statistik={};
      for(let i=0;i<=this.zuordnung.strafen.length;i++){
        let n=this.zuordnung.strafen.length;
        let p=this.zuordnung.strafen[n-i];
        if(p===undefined) p=0;
        let s={
          anzahlWuensche: n-i,
          anzahlTN: 0,
          strafe: p,
          gesamtStrafe: 0
        };
        this.statistik.einzelWerte.push(s);
        statistik[p]=s;
      }
      console.log(this.zuordnung.result);
      for(let i=0;i<this.zuordnung.result.gruppen.length;i++){
        let g=this.zuordnung.result.gruppen[i];
        for(let j=0;j<g.teilnehmerFinalised.length;j++){
          let t=g.teilnehmerFinalised[j];
          let s=statistik[t.strafe];
          s.anzahlTN++;
          this.statistik.gesamtTN++;
          this.statistik.gesamtStrafe+=t.strafe;
          s.gesamtStrafe+=t.strafe;
        }
      }
    }
  }
}
</script>

<style scoped>
  .zuordnung{
    background-color: lightgoldenrodyellow;
    border: 1pt solid black;
    margin-bottom: 0.5rem;
  }

  table{
    border-collapse: collapse;
    text-align: center;
  }

  td,th{
    border: 1pt solid black;
  }

  .summary{
    background-color: lightgray;
    font-weight: bold;
  }
</style>