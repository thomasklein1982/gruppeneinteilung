<template>
<div>
  <h3>Zuordnung #{{ nummer }}</h3>
  <div>
    Mindestanzahl Wünsche (wer weniger Wünsche angibt, wird zuletzt zugeordnet)
    <InputText v-model="zuordnung.minimumWishCount" placeholder="Mindestanzahl Wünsche"/>
  </div>
  <div>
    Strafen für: Kein Wunsch erfüllt, nur 1 Wunsch erfüllt, nur 2 Wünsche erfüllt, ...
    <InputText @change="penaltiesChanged()" v-model="penalties" placeholder="Strafen, mit Komma getrennt"/>
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
    <div v-for="(g,i) in besteEinteilung.gruppen">
      <h3>Zimmer {{ g.teilnehmer.length }}, Strafe: {{ g.strafe }}</h3>
      <ol>
        <li v-for="(t,j) in g.teilnehmer">{{ t }} [{{ this.zuordnung.teilnehmer[t].wuensche.join(", ") }}]</li>
      </ol>
    </div>
  </div>
</div>
</template>

<script>
import { Button, InputText } from 'primevue';
import { sleep } from '../functions/sleep';
import { macheZuordnung } from '../functions/macheZuordnung';
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
      penalties: "1000,100,50,10",
      besteEinteilung: null
    }
  },
  methods: {
    penaltiesChanged(){
      let p=this.penalties.split(",");
      this.zuordnung.penalties=[];
      for(let i=0;i<p.length;i++){
        this.zuordnung.penalties.push(p[i]*1);
      }
    },
    async starteSuche(){
      this.searching=true;
      let besteStrafe=-1;
      let counter=0;
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
        
        let res=macheZuordnung(this.zuordnung.teilnehmer,zimmer,teilnehmer,this.zuordnung.penalties,minCountWuensche);

        if(!this.besteEinteilung || res.strafe<besteStrafe){
          besteStrafe=res.strafe;
          this.besteEinteilung=res;
        }

        if(counter%10===0){
          this.searchAnimation+=".";
          if(this.searchAnimation.length>10){
            this.searchAnimation=".";
          }
        }
        await sleep(10);
        counter++;
      }
    },
    stoppeSuche(){
      this.searching=false;
    }
  }
}
</script>