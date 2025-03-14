export function macheZuordnung(alleTeilnehmer,alleZimmer,teilnehmer, strafen, mindestAnzahlWuensche){
  let gruppen=[];
  for(let i=0;i<alleZimmer.length;i++){
    gruppen[i]={
      teilnehmer: [],
      strafe: 0,
      zimmer: null
    }
  }
  //console.log(teilnehmer,gruppen,strafen,mindestAnzahlWuensche);
  for(let i=0;i<teilnehmer.length;i++){
    let t=teilnehmer[i];
    //finde die aktuell beste Gruppe für den Teilnehmer:
    let besteGruppeIndex=-1;
    let besteDifferenz=0;
    let besteStrafe=0;
    for(let j=0;j<gruppen.length;j++){
      let g=gruppen[j];
      if(g.zimmer) continue;
      let alteStrafe=g.strafe;
      g.teilnehmer.push(t.id);
      let neueStrafe=bewerteGruppe(alleTeilnehmer,g,strafen,mindestAnzahlWuensche);
      g.teilnehmer.pop();
      let diff=neueStrafe-alteStrafe+g.teilnehmer.length;
      if(besteGruppeIndex<0 || diff<besteDifferenz){
        besteDifferenz=diff;
        besteStrafe=neueStrafe;
        besteGruppeIndex=j;
      }
    }
    let g=gruppen[besteGruppeIndex];
    g.strafe=besteStrafe;
    g.teilnehmer.push(t.id);
    //pruefe, ob gruppe voll ist:
    let groesstesZimmer=alleZimmer[alleZimmer.length-1];
    if(g.teilnehmer.length===groesstesZimmer.maxSize){
      g.zimmer=groesstesZimmer;
      alleZimmer.pop();
    }
  }

  let strafe=0;
  for(let i=0;i<gruppen.length;i++){
    strafe+=gruppen[i].strafe;
  }
  return {
    strafe, gruppen
  }
}

function bewerteGruppe(alleTeilnehmer,gruppe,strafen,mindestAnzahlWuensche){
  let s=0;
  for(let i=0;i<gruppe.teilnehmer.length;i++){
    let t=gruppe.teilnehmer[i];
    t=alleTeilnehmer[t];
    s+=bewerteGruppeFuerTeilnehmer(t,gruppe,strafen,mindestAnzahlWuensche);
  }
  return s;
}

function bewerteGruppeFuerTeilnehmer(teilnehmer,gruppe,strafen,mindestAnzahlWuensche){
  let count=0;
  let anzWuensche=teilnehmer.wuensche.length;
  for(let i=0;i<anzWuensche;i++){
    let w=teilnehmer.wuensche[i];
    if(gruppe.teilnehmer.indexOf(w)>=0) count++;
  }
  let p=0;
  if(anzWuensche<mindestAnzahlWuensche){
    count+=mindestAnzahlWuensche-anzWuensche;
  }
  if(count<strafen.length){
    p=strafen[count];
  }
  return p;
}