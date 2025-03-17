import { createError } from "./createError";

export function readTeilnehmer(rawInput, errors){
  let lines=rawInput.split("\n");
  let teilnehmer={};
  for(let i=0;i<lines.length;i++){
    lines[i]=lines[i].trim();
    if(lines[i].length===0) continue;
    let s=lines[i].split(":");
    if(s.length!==2){
      if(errors) errors.push(createError("Teilnehmer",i+1,lines[i],"Enthält nicht genau einen Doppelpunkt."));
      continue;
    }
    let ok=true;
    let name=s[0].trim();
    if(name.length===0){
      if(errors) errors.push(createError("Teilnehmer",i+1,lines[i],"Es steht kein Name vor dem Doppelpunkt."));
      ok=false;
    }
    let wuensche=s[1].trim();
    if(!ok) continue;
    let id=name.toLowerCase();
    let t={
      id,
      name,
      wuensche,
      lineNo: i+1,
      gewuenscht: 0
    };
    if(teilnehmer[id]){
      if(errors) errors.push(createError("Teilnehmer",i+1,lines[i],"Es gibt bereits einen Teilnehmer mit gleichem Namen."));
    }
    teilnehmer[id]=t;
  }

  for(let name in teilnehmer){
    let t=teilnehmer[name];
    let wuensche=t.wuensche.split(",");
    let liste=[];
    for(let i=0;i<wuensche.length;i++){
      let n=wuensche[i].toLowerCase().replace(/\s+/g," ").replace(/[^a-zßäöüé\- ]/g,"").trim();
      if(n.length===0) continue;
      if(!teilnehmer[n]){
        if(errors) errors.push(createError("Teilnehmer",t.lineNo,lines[t.lineNo-1],"Es gibt keinen Teilnehmer namens '"+n+"'."));
        continue;
      }
      if(n===name){
        if(errors) errors.push(createError("Teilnehmer",t.lineNo,lines[t.lineNo-1],"Der TN hat sich selbst als Wunsch angegeben."));
        continue;
      }
      let tw=teilnehmer[n];
      tw.gewuenscht++;
      liste.push(n);
    }
    t.wuensche=liste;
  }
  return teilnehmer
}