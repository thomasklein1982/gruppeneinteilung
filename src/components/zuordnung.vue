<template>
<div class="zuordnung">
  <h3>Zuordnung #{{ nummer }}</h3>
  <div>
    Zimmergrößen: <template v-for="(z,i) in zuordnung.zimmer">{{(i>0? ', ':'')+ z.maxSize }}</template>
  </div>
  <div>
    Mindestanzahl Wünsche (wer weniger Wünsche angibt, wird zuletzt zugeordnet)
    <InputText v-model="zuordnung.minimumWishCount" placeholder="Mindestanzahl Wünsche"/>
  </div>
  <div>
    Strafen für: Kein Wunsch erfüllt, nur 1 Wunsch erfüllt, nur 2 Wünsche erfüllt, ...
    <InputText @change="strafenChanged()" v-model="strafen" placeholder="Strafen, mit Komma getrennt"/>
  </div>
  <Button label="Suchen" :disabled="searching" @click="starteSuche()"/>
  <div v-show="searching">Suche läuft {{ searchAnimation }} 
    <div><Button label="Stopp" @click="stoppeSuche()"/></div>
  </div>
  <div>
    <Button label="Löschen" @click="$root.removeZuordnung(i)"/>
  </div>
  <div v-if="besteEinteilung">
    <div>Strafe: {{ besteEinteilung.strafe }}</div>
    <div>Anzahl Versuche: {{ anzahlVersuche }}</div>
    <template v-if="!searching">
      <div v-for="(g,i) in besteEinteilung.gruppen">
        <template v-if="g.teilnehmer.length>0">
          <h3>#Personen: {{ g.teilnehmer.length }}, Strafe: {{ g.strafe }}</h3>
          <ol>
            <li v-for="(t,j) in g.teilnehmerFinalised">{{ t.name }} [{{ t.gewuenscht }}&times;] ({{t.strafe}})
              <div style="color: green">
                <span class="pi pi-check"/> <span v-html="t.erfuellt"/>
              </div>
              <div style="color: red" v-if="t.nichtErfuellt">
                <span class="pi pi-times"/> <span v-html="t.nichtErfuellt"/>
  </div>
            </li>
          </ol>
        </template>
      </div>
    </template>
  </div>
</div>
</template>

<script>
import { Button, InputText } from 'primevue';
import { sleep } from '../functions/sleep';
import { finaliseZuordnung, macheZuordnung } from '../functions/macheZuordnung';
export default{
  components: {
    Button,InputText
  },
  props: {
    zuordnung: Object,
    nummer: Number
  },
  data(){
    return{
      searchAnimation: ".",
      searching: false,
      strafen: "1000,100,50,10",
      besteEinteilung: null,
      anzahlVersuche: 0
    }
  },
  watch: {
    zuordnung(){
      if(this.zuordnung.result){
        this.besteEinteilung=this.zuordnung.result;
        this.anzahlVersuche=this.zuordnung.result.anzahlVersuche;
      }else{
        this.besteEinteilung=null;
        this.anzahlVersuche=0;
      }
    }
  },
  mounted(){
    
    this.strafenChanged();
  },
  methods: {
    strafenChanged(){
      let p=this.strafen.split(",");
      this.zuordnung.strafen=[];
      for(let i=0;i<p.length;i++){
        this.zuordnung.strafen.push(p[i]*1);
      }
    },
    async starteSuche(){
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
</style>