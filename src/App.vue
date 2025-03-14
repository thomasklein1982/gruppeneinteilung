<template>
  <Startmenu
    ref="startMenu"
    @confirm-data="confirmData"
    @save-inputs="setInputs"
    v-show="screen==='start'"
  />
  <Mainscreen
    v-show="screen==='main'"
    :zuordnungen="zuordnungen"
  />
</template>

<script >
import Mainscreen from './components/mainscreen.vue';
import Startmenu from './components/startmenu.vue';
import { storage } from './functions/storage';

const STORAGE_DATA="GRUPPENEINTEILUNG-USER-DATA";

export default{
  components: {
    Startmenu, Mainscreen
  },
  data() {
    return {
      input: null,
      teilnehmer: null,
      zimmer: null,
      zuordnungen: [],
      screen: "start"
    }
  },
  mounted(){
    this.loadLocally();
    setInterval(()=>{
      this.saveLocally();
    },1000);
  },
  methods: {
    createZuordnung(){
      let z={
        zimmer: JSON.parse(JSON.stringify(this.zimmer)),
        teilnehmer: JSON.parse(JSON.stringify(this.teilnehmer)),
        penalties: [1000,100,10,1],
        minimumWishCount: 4
      };
      this.zuordnungen.splice(0,0,z);
    },
    removeZuordnung(index){
      this.zuordnungen.splice(index,1);
    },
    setInputs(input){
      this.input=input;
    },
    confirmData(data){
      this.teilnehmer=data.teilnehmer;
      this.zimmer=data.zimmer;
      this.screen="main";
    },
    getSaveObject(){
      return {
        input: JSON.stringify(this.input),
        teilnehmer: JSON.stringify(this.teilnehmer),
        zimmer: JSON.stringify(this.zimmer),
        zuordnungen: JSON.stringify(this.zuordnungen)
      }
    },
    loadFromSaveObject(obj){
      if(!obj) return;
      this.input=JSON.parse(obj.input);
      this.$refs.startMenu.setInputs(this.input);
      this.teilnehmer=JSON.parse(obj.teilnehmer);
      this.zimmer=JSON.parse(obj.zimmer);
      this.zuordnungen=JSON.parse(obj.zuordnungen);
    },
    async loadLocally(){
      let data=await storage.getItem(STORAGE_DATA);
      this.loadFromSaveObject(data);
    },
    saveLocally(){
      storage.setItem(STORAGE_DATA,this.getSaveObject());
    }
  }
}

</script>



<style scoped>

</style>
