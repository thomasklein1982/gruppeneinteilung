import { createError } from "./createError";

export function readZimmer(rawInput, errors){
  let lines=rawInput.split("\n");
  let exists={};
  let zimmer=[];
  let zimmerNummer=1;
  for(let i=0;i<lines.length;i++){
    let line=lines[i].trim();
    if(line.length===0) continue;
    let s=line.split(":");
    if(s.length!==2){
      if(errors) errors.push(createError("Zimmer",i+1,lines[i],"Enthält nicht genau einen Doppelpunkt."));
      continue;
    }
    let size=s[0];
    if(!/^\d+$/.test(size)){
      if(errors) errors.push(createError("Zimmer",i+1,lines[i],"Vor dem Doppelpunkt steht keine Zahl (Maximalgröße)."));
      continue;
    }
    let count=s[1];
    if(!/^\d+$/.test(count)){
      if(errors) errors.push(createError("Zimmer",i+1,lines[i],"Hinter dem Doppelpunkt steht keine Zahl (Anzahl der zimmer)."));
      continue;
    }
    size*=1;
    count*=1;
    if(exists[size]){
      if(errors) errors.push(createError("Zimmer",i+1,lines[i],"Es gibt bereits eine Zeile mit derselben Maximalgröße."));
      continue;
    }
    exists[size]=true;
    for(let j=0;j<count;j++){
      zimmer.push({
        maxSize: size,
        nummer: zimmerNummer
      });
      zimmerNummer++;
    }
  }
  zimmer.sort((a,b)=>{
    return a.maxSize-b.maxSize;
  });
  return zimmer;
}