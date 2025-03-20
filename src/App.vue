<template>
  <Startmenu
    ref="startMenu"
    @confirm-data="confirmData"
    @save-inputs="setInputs"
    v-show="screen==='start'"
  />
  <Mainscreen
    v-if="screen==='main'"
    :zuordnungen="zuordnungen"
    @back="screen='start'"
  />
  <div style="position: fixed; right: 0.5rem; top: 0.5rem;">
    <InputText v-model="projectname" type="search"/>
    <Button @click="uploadProject()" icon="pi pi-upload"/>
    <Button @click="downloadProject()" icon="pi pi-download"/>
  </div>
</template>

<script >
import { Button, InputText } from 'primevue';
import Mainscreen from './components/mainscreen.vue';
import Startmenu from './components/startmenu.vue';
import { storage } from './functions/storage';
import { download, upload } from './functions/helper';

const STORAGE_DATA="GRUPPENEINTEILUNG-USER-DATA";

export default{
  components: {
    Startmenu, Mainscreen, Button, InputText
  },
  data() {
    return {
      projectname: "",
      input: null,
      teilnehmer: null,
      zimmer: null,
      zuordnungen: [],
      screen: "start"
    }
  },
  computed: {
    teilnehmerCount(){
      if(!this.teilnehmer) return 0;
      let c=0;
      for(let a in this.teilnehmer){
        c++;
      }
      return c;
    }
  },
  mounted(){
    //this.loadLocally();
    // setInterval(()=>{
    //   this.saveLocally();
    // },1000);
  },
  methods: {
    downloadProject(){
      let so=this.getSaveObject();
      download(JSON.stringify(so),this.projectname+".json");
    },
    async uploadProject(){
      let so=await upload();
      so=JSON.parse(so.code);
      this.loadFromSaveObject(so);
    },
    createZuordnung(){
      let z={
        zimmer: JSON.parse(JSON.stringify(this.zimmer)),
        teilnehmer: JSON.parse(JSON.stringify(this.teilnehmer)),
        strafen: [1000,100,10,1],
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
        projectname: this.projectname,
        input: this.input,
        teilnehmer: this.teilnehmer,
        zimmer: this.zimmer,
        zuordnungen: this.zuordnungen
      }
    },
    loadFromSaveObject(obj){
      if(!obj) return;
      this.projectname=obj.projectname;
      this.input=obj.input;
      this.$refs.startMenu.setInputs(this.input);
      this.teilnehmer=obj.teilnehmer;
      this.zimmer=obj.zimmer;
      this.zuordnungen=obj.zuordnungen;
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
