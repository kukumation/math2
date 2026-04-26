var bgTimer=null,bgKey=null,bgSpeedMult=1.0;
var THEMES={
  home:{bpm:140,w:'square',
    seq:[523,659,784,659,523,0,659,784,880,784,659,523,440,523,659,0,784,880,1047,880,784,659,523,0,659,523,440,523,659,784,659,0],
    bass:[131,0,0,131,165,0,0,165,175,0,0,175,110,0,131,0,131,0,0,131,165,0,0,165,131,0,110,131,165,0,131,0],
    arp:[659,784,880,1047,880,784,659,523,784,880,1047,1175,1047,880,784,659,880,1047,1175,1319,1175,1047,880,784,659,523,440,523,659,784,880,0],
    counter:[0,0,392,0,0,330,0,392,0,0,523,0,0,440,0,392,0,0,523,0,0,659,0,523,0,0,440,0,392,0,523,0],
    pad:[131,0,0,0,165,0,0,0,175,0,0,0,110,0,0,0,131,0,0,0,165,0,0,0,131,0,0,0,110,0,0,0],
    drum:[1,0,0,1,0,0,1,0,1,0,0,1,1,0,1,0,1,0,0,1,0,0,1,0,1,0,1,0,1,0,1,1],
    hihat:[0,1,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1]},
  castle:{bpm:108,w:'sine',
    seq:[349,440,523,440,349,294,330,440,523,440,349,0,392,440,523,587,523,440,349,330,349,440,523,0,349,440,523,659,587,523,440,0],
    bass:[175,0,0,0,131,0,0,0,196,0,0,0,175,0,0,0,196,0,0,0,147,0,0,0,175,0,0,0,131,0,196,0],
    arp:[523,659,784,659,523,440,349,440,659,784,880,784,659,523,440,0,587,659,784,880,784,659,523,440,523,659,784,1047,880,784,659,0],
    counter:[0,0,262,0,0,220,0,0,0,0,294,0,0,0,262,0,0,0,330,0,0,0,294,0,0,0,262,0,0,330,262,0],
    pad:[175,0,0,0,131,0,0,0,196,0,0,0,175,0,0,0,196,0,0,0,147,0,0,0,175,0,0,0,131,0,0,0],
    drum:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
    hihat:[0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1]},
  w0:{bpm:168,w:'square',
    seq:[784,880,1047,880,784,659,523,587,659,784,880,1047,880,659,784,0,1047,1175,1319,1175,1047,880,784,659,784,880,1047,1175,1047,880,784,0],
    bass:[196,0,0,196,131,0,0,131,220,0,0,220,165,0,196,0,262,0,0,262,196,0,0,196,165,0,0,165,196,0,220,0],
    arp:[1047,1175,1319,1175,1047,880,784,880,1047,1175,1319,1568,1319,1175,1047,880,1319,1568,1760,1568,1319,1175,1047,1175,1568,1760,1568,1319,1175,1047,1175,0],
    counter:[0,0,523,0,0,440,0,0,0,0,587,0,0,0,523,0,0,0,659,0,0,0,587,0,0,0,523,0,0,659,523,0],
    pad:[196,0,0,0,131,0,0,0,220,0,0,0,165,0,0,0,262,0,0,0,196,0,0,0,165,0,0,0,196,0,0,0],
    drum:[1,0,0,1,0,0,1,0,1,0,1,0,1,0,0,1,1,0,0,1,0,0,1,0,1,0,0,1,1,0,1,1],
    hihat:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
  w1:{bpm:135,w:'square',
    seq:[349,440,523,659,587,523,440,523,587,659,784,880,784,659,523,0,587,659,784,659,587,523,440,349,440,523,587,659,523,440,523,0],
    bass:[87,0,0,87,110,0,0,110,131,0,0,131,110,0,0,0,73,0,0,73,87,0,0,87,110,0,0,65,87,0,87,0],
    arp:[523,659,784,659,523,440,349,440,659,784,880,784,659,523,440,523,440,523,659,523,440,349,262,349,523,659,523,440,349,523,659,0],
    counter:[0,262,0,0,349,0,262,0,0,349,0,440,523,0,440,0,0,220,0,0,262,0,0,349,0,262,0,220,0,349,440,0],
    pad:[87,0,0,0,110,0,0,0,131,0,0,0,110,0,0,0,73,0,0,0,87,0,0,0,110,0,0,0,87,0,0,0],
    drum:[1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,1],
    hihat:[0,0,1,0,0,0,1,1,0,0,1,0,0,1,0,0,0,0,1,0,0,0,1,1,0,0,1,0,0,1,0,0]},
  w2:{bpm:185,w:'sawtooth',
    seq:[220,262,330,262,220,330,392,440,392,330,262,330,392,440,523,0,440,523,659,523,440,392,330,262,330,392,440,523,440,330,262,0],
    bass:[55,0,55,0,65,0,82,0,65,0,82,0,98,0,82,0,55,0,65,0,82,0,110,0,82,0,65,0,55,0,82,0],
    arp:[440,523,659,784,659,523,440,523,659,784,880,784,659,784,880,0,659,784,880,1047,880,784,659,784,880,784,659,523,659,784,1047,0],
    counter:[0,330,0,262,0,220,0,262,0,330,0,392,0,262,0,0,0,392,0,523,0,440,0,330,0,262,0,330,0,220,0,0],
    pad:[55,0,0,0,65,0,0,0,82,0,0,0,98,0,0,0,55,0,0,0,82,0,0,0,110,0,0,0,82,0,0,0],
    drum:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1],
    hihat:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
  w3:{bpm:100,w:'sine',
    seq:[330,370,440,494,523,494,440,370,330,294,330,370,440,494,523,0,587,523,494,440,370,440,494,523,440,370,330,294,330,370,330,0],
    bass:[82,0,0,0,110,0,0,0,65,0,0,0,82,0,0,0,73,0,0,0,98,0,0,0,110,0,0,0,82,0,65,0],
    arp:[494,659,784,659,494,554,659,494,440,494,554,659,587,494,440,0,370,494,587,659,784,659,587,494,659,587,494,440,494,554,494,0],
    counter:[0,0,262,0,0,294,0,0,0,0,247,0,0,262,0,0,0,0,220,0,0,262,0,0,0,294,0,0,0,247,0,0],
    pad:[82,0,0,0,110,0,0,0,131,0,0,0,98,0,0,0,73,0,0,0,98,0,0,0,110,0,0,0,82,0,0,0],
    drum:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
    hihat:[0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1]},
  w4:{bpm:155,w:'square',
    seq:[392,494,587,659,784,880,784,659,587,494,392,440,523,659,784,0,880,1047,880,784,659,523,659,784,880,1047,1175,1047,880,784,1047,0],
    bass:[98,0,0,98,147,0,0,147,124,0,0,124,131,0,0,0,110,0,0,110,131,0,0,131,147,0,0,147,131,0,131,0],
    arp:[587,784,1047,784,587,659,880,659,784,1047,1175,1047,784,880,1047,0,880,1047,1319,1047,880,659,784,880,1047,1319,1175,1047,880,1047,1319,0],
    counter:[0,330,0,0,392,0,0,349,0,0,294,0,0,330,0,0,0,440,0,0,349,0,0,392,0,0,494,0,440,0,523,0],
    pad:[98,0,0,0,147,0,0,0,124,0,0,0,131,0,0,0,110,0,0,0,131,0,0,0,147,0,0,0,131,0,0,0],
    drum:[1,0,0,1,1,0,0,1,1,0,1,0,1,0,1,1,1,0,0,1,1,0,1,0,1,0,0,1,1,0,1,1],
    hihat:[1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0]},
  w5:{bpm:120,w:'triangle',
    seq:[196,220,262,294,330,294,262,220,196,175,196,220,262,294,330,0,349,330,294,262,220,196,175,196,220,262,294,330,349,330,262,0],
    bass:[49,0,0,49,55,0,0,55,65,0,0,65,55,0,0,0,44,0,0,44,49,0,0,49,65,0,0,65,55,0,49,0],
    arp:[294,392,494,587,494,392,330,392,440,523,587,659,587,523,440,0,330,392,494,523,659,784,659,523,494,392,330,294,330,440,392,0],
    counter:[0,0,147,0,0,131,0,0,165,0,0,147,0,0,131,0,0,0,110,0,0,131,0,0,147,0,0,131,0,0,110,0],
    pad:[49,0,0,0,65,0,0,0,82,0,0,0,65,0,0,0,44,0,0,0,55,0,0,0,65,0,0,0,55,0,0,0],
    drum:[1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0],
    hihat:[0,0,1,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1,0,0,1,0]}
};
var _AC=null;
function AC(){if(!_AC){try{_AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}return _AC;}
function setMusicSpeed(m){if(Math.abs(m-bgSpeedMult)<0.05)return;bgSpeedMult=m;if(bgKey&&bgKey!=='boss'&&!S.muted){var k=bgKey;stopBg();bgKey=null;playBg(k);}}
function playBossTheme(){
  var BPM=Math.round(340*bgSpeedMult),ms=60000/BPM;
  // Intense chromatic melody — dramatic minor runs
  var mel=[165,0,196,220,262,247,220,196,165,0,147,165,196,220,262,0,330,294,262,247,220,196,220,262,294,330,349,330,294,262,220,0];
  // Pounding bass octaves
  var bas=[55,55,0,55,65,65,0,65,73,73,0,73,82,0,65,0,55,55,0,55,49,49,0,49,65,65,0,65,73,0,55,0];
  // Ominous harmony — diminished fifth + minor third
  var harm=[110,0,131,0,139,0,110,0,147,0,131,0,165,0,147,0,110,0,98,0,110,0,131,0,139,0,131,0,110,0,98,0];
  // Frantic arp — sweeping runs
  var arp=[330,392,440,494,523,587,659,784,880,1047,880,784,659,587,523,494,440,523,659,784,1047,880,784,659,523,440,392,330,262,330,440,0];
  // Low drone with pulsing
  var padV=[55,0,55,0,65,0,65,0,73,0,73,0,65,0,55,0,55,0,55,0,49,0,49,0,65,0,65,0,73,0,55,0];
  // Aggressive drums — rapid double kick + snare
  var drumP=[1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1];
  var hhP=[1,1,0,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,1,1];
  // Snare accents
  var snareP=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0];
  var bi=0;
  function tick(){
    var ctx=AC();if(!ctx)return;
    var mf=mel[bi%mel.length],bf=bas[bi%bas.length],hf=harm[bi%harm.length];
    var af=arp[bi%arp.length],pf=padV[bi%padV.length];
    var t=ctx.currentTime;
    var dur=ms/1000;
    // Lead — sawtooth with heavy vibrato for tension
    if(mf>0){var o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='sawtooth';o.frequency.value=mf;var lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.connect(lg);lg.connect(o.frequency);lfo.frequency.value=8;lg.gain.value=6;o.start(t);lfo.start(t);o.stop(t+dur+.01);lfo.stop(t+dur+.01);g.gain.setValueAtTime(0.04,t);g.gain.setValueAtTime(0.04,t+dur*.1);g.gain.exponentialRampToValueAtTime(0.001,t+dur*.6);}
    // Bass — thick sub-bass with slight detuning
    if(bf>0){var o2=ctx.createOscillator(),g2=ctx.createGain();o2.connect(g2);g2.connect(ctx.destination);o2.type='sawtooth';o2.frequency.value=bf;g2.gain.setValueAtTime(0.05,t);g2.gain.setValueAtTime(0.05,t+dur*.5);g2.gain.exponentialRampToValueAtTime(0.001,t+dur*.9);o2.start(t);o2.stop(t+dur+.01);var o2b=ctx.createOscillator(),g2b=ctx.createGain();o2b.connect(g2b);g2b.connect(ctx.destination);o2b.type='triangle';o2b.frequency.value=bf*2;g2b.gain.setValueAtTime(0.02,t);g2b.gain.exponentialRampToValueAtTime(0.001,t+dur*.7);o2b.start(t);o2b.stop(t+dur);}
    // Harmony — eerie triangle
    if(hf>0){var o3=ctx.createOscillator(),g3=ctx.createGain();o3.connect(g3);g3.connect(ctx.destination);o3.type='triangle';o3.frequency.value=hf;var lfo3=ctx.createOscillator(),lg3=ctx.createGain();lfo3.connect(lg3);lg3.connect(o3.frequency);lfo3.frequency.value=4;lg3.gain.value=3;lfo3.start(t);lfo3.stop(t+dur+.01);g3.gain.setValueAtTime(0.025,t);g3.gain.exponentialRampToValueAtTime(0.001,t+dur*.5);o3.start(t);o3.stop(t+dur+.01);}
    // Frantic arp — staccato square
    if(af>0){var oa=ctx.createOscillator(),ga=ctx.createGain();oa.connect(ga);ga.connect(ctx.destination);oa.type='square';oa.frequency.value=af;ga.gain.setValueAtTime(0.02,t);ga.gain.exponentialRampToValueAtTime(0.001,t+dur*.2);oa.start(t);oa.stop(t+dur*.25);}
    // Low drone pad with beating
    if(pf>0&&bi%2===0){var op=ctx.createOscillator(),gp=ctx.createGain();op.connect(gp);gp.connect(ctx.destination);op.type='sine';op.frequency.value=pf;gp.gain.setValueAtTime(0.02,t);gp.gain.setValueAtTime(0.02,t+dur*1.5);gp.gain.exponentialRampToValueAtTime(0.001,t+dur*3);op.start(t);op.stop(t+dur*3.5);var op2=ctx.createOscillator(),gp2=ctx.createGain();op2.connect(gp2);gp2.connect(ctx.destination);op2.type='sine';op2.frequency.value=pf*1.01;gp2.gain.setValueAtTime(0.015,t);gp2.gain.exponentialRampToValueAtTime(0.001,t+dur*2.5);op2.start(t);op2.stop(t+dur*3);}
    // Aggressive kick drums
    var dHit=drumP[bi%drumP.length];
    if(dHit){
      var ko=ctx.createOscillator(),kg=ctx.createGain();ko.connect(kg);kg.connect(ctx.destination);
      ko.type='sine';ko.frequency.setValueAtTime(250,t);ko.frequency.exponentialRampToValueAtTime(30,t+0.04);
      kg.gain.setValueAtTime(0.14,t);kg.gain.exponentialRampToValueAtTime(0.001,t+0.07);
      ko.start(t);ko.stop(t+0.1);
      if(bi%2===0){var so=ctx.createOscillator(),sg=ctx.createGain();so.connect(sg);sg.connect(ctx.destination);so.type='square';so.frequency.value=120+Math.random()*180;sg.gain.setValueAtTime(0.035,t);sg.gain.exponentialRampToValueAtTime(0.001,t+0.04);so.start(t);so.stop(t+0.06);}
    }
    // Snare accents
    var snHit=snareP[bi%snareP.length];
    if(snHit){
      var sn=ctx.createOscillator(),sng=ctx.createGain();sn.connect(sng);sng.connect(ctx.destination);
      sn.type='sawtooth';sn.frequency.value=200+Math.random()*100;sng.gain.setValueAtTime(0.06,t);sng.gain.exponentialRampToValueAtTime(0.001,t+0.08);
      sn.start(t);sn.stop(t+0.1);
      var nz=ctx.createOscillator(),nzg=ctx.createGain();nz.connect(nzg);nzg.connect(ctx.destination);
      nz.type='square';nz.frequency.value=3000+Math.random()*2000;nzg.gain.setValueAtTime(0.03,t);nzg.gain.exponentialRampToValueAtTime(0.001,t+0.04);
      nz.start(t);nz.stop(t+0.06);
    }
    // Hi-hat
    if(hhP[bi%hhP.length]){var ho=ctx.createOscillator(),hg=ctx.createGain();ho.connect(hg);hg.connect(ctx.destination);ho.type='square';ho.frequency.value=8000+Math.random()*4000;hg.gain.setValueAtTime(0.01,t);hg.gain.exponentialRampToValueAtTime(0.001,t+0.015);ho.start(t);ho.stop(t+0.025);}
    // Cymbal crash every 16 beats
    if(bi%16===15){var co=ctx.createOscillator(),cg=ctx.createGain();co.connect(cg);cg.connect(ctx.destination);co.type='sawtooth';co.frequency.value=3000+Math.random()*3000;cg.gain.setValueAtTime(0.035,t);cg.gain.exponentialRampToValueAtTime(0.001,t+0.5);co.start(t);co.stop(t+0.55);}
    // Timpani roll every 32 beats
    if(bi%32===31){var tp=ctx.createOscillator(),tpg=ctx.createGain();tp.connect(tpg);tpg.connect(ctx.destination);tp.type='sine';tp.frequency.setValueAtTime(200,t);tp.frequency.exponentialRampToValueAtTime(60,t+0.3);tpg.gain.setValueAtTime(0.08,t);tpg.gain.exponentialRampToValueAtTime(0.001,t+0.4);tp.start(t);tp.stop(t+0.45);}
    bi++;bgTimer=setTimeout(tick,ms);
  }
  tick();
}
function playBg(key){
  if(key===bgKey&&bgTimer)return;
  stopBg();bgKey=key;if(S.muted)return;
  if(key==='boss'){playBossTheme();return;}
  var thKey='w'+(parseInt(key.replace('w',''))||0)%6;
  var th=THEMES[key]||THEMES[thKey]||THEMES.home;
  if(!th)return;
  var ii=0;
  function tick2(){
    var ctx=AC();if(!ctx)return;
    var ms=(60000/th.bpm)/bgSpeedMult;
    var t=ctx.currentTime;
    var dur=ms/1000;
    // Melody with optional vibrato on longer notes
    var f=th.seq[ii%th.seq.length];
    if(f>0){var o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type=th.w;o.frequency.value=f;
      // Add vibrato for sine/triangle voices
      if(th.w==='sine'||th.w==='triangle'){var lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.connect(lg);lg.connect(o.frequency);lfo.frequency.value=4.5;lg.gain.value=2.5;lfo.start(t);lfo.stop(t+dur+.01);}
      g.gain.setValueAtTime(0.05,t);g.gain.setValueAtTime(0.05,t+dur*.3);g.gain.exponentialRampToValueAtTime(0.001,t+dur*.82);o.start(t);o.stop(t+dur);}
    // Bass line
    if(th.bass){
      var bf=th.bass[ii%th.bass.length];
      if(bf>0){var bo=ctx.createOscillator(),bg=ctx.createGain();bo.connect(bg);bg.connect(ctx.destination);bo.type='triangle';bo.frequency.value=bf;bg.gain.setValueAtTime(0.04,t);bg.gain.exponentialRampToValueAtTime(0.001,t+dur*.9);bo.start(t);bo.stop(t+dur);}
    }
    // Arpeggio layer
    if(th.arp){
      var af=th.arp[ii%th.arp.length];
      if(af>0){var ao=ctx.createOscillator(),ag=ctx.createGain();ao.connect(ag);ag.connect(ctx.destination);ao.type='sine';ao.frequency.value=af;ag.gain.setValueAtTime(0.018,t);ag.gain.exponentialRampToValueAtTime(0.001,t+dur*.35);ao.start(t);ao.stop(t+dur*.4);}
    }
    // Counter-melody
    if(th.counter){
      var cf=th.counter[ii%th.counter.length];
      if(cf>0){var co2=ctx.createOscillator(),cg2=ctx.createGain();co2.connect(cg2);cg2.connect(ctx.destination);co2.type='triangle';co2.frequency.value=cf;cg2.gain.setValueAtTime(0.022,t);cg2.gain.exponentialRampToValueAtTime(0.001,t+dur*.65);co2.start(t);co2.stop(t+dur*.7);}
    }
    // Pad / sustained chord (every 4th beat)
    if(th.pad&&ii%4===0){
      var pf=th.pad[ii%th.pad.length];
      if(pf>0){var po=ctx.createOscillator(),pg=ctx.createGain();po.connect(pg);pg.connect(ctx.destination);po.type='sine';po.frequency.value=pf;pg.gain.setValueAtTime(0.012,t);pg.gain.setValueAtTime(0.012,t+dur*2);pg.gain.exponentialRampToValueAtTime(0.001,t+dur*3);po.start(t);po.stop(t+dur*3.5);
        // Add fifth above for richness
        var po2=ctx.createOscillator(),pg2=ctx.createGain();po2.connect(pg2);pg2.connect(ctx.destination);po2.type='sine';po2.frequency.value=pf*1.5;pg2.gain.setValueAtTime(0.008,t);pg2.gain.exponentialRampToValueAtTime(0.001,t+dur*2.5);po2.start(t);po2.stop(t+dur*3);}
    }
    // Drum pattern
    if(th.drum){
      var d=th.drum[ii%th.drum.length];
      if(d){
        var ko=ctx.createOscillator(),kg=ctx.createGain();ko.connect(kg);kg.connect(ctx.destination);
        ko.type='sine';ko.frequency.setValueAtTime(150,t);ko.frequency.exponentialRampToValueAtTime(40,t+0.08);
        kg.gain.setValueAtTime(0.08,t);kg.gain.exponentialRampToValueAtTime(0.001,t+0.12);
        ko.start(t);ko.stop(t+0.15);
      }
    }
    // Hi-hat pattern
    if(th.hihat){
      var hh=th.hihat[ii%th.hihat.length];
      if(hh){var ho=ctx.createOscillator(),hg=ctx.createGain();ho.connect(hg);hg.connect(ctx.destination);ho.type='square';ho.frequency.value=5000+Math.random()*3000;hg.gain.setValueAtTime(0.012,t);hg.gain.exponentialRampToValueAtTime(0.001,t+0.03);ho.start(t);ho.stop(t+0.04);}
    }
    // Tom fill every 16 beats
    if(ii%16===15){
      var to=ctx.createOscillator(),tg=ctx.createGain();to.connect(tg);tg.connect(ctx.destination);
      to.type='sine';to.frequency.setValueAtTime(100,t);to.frequency.exponentialRampToValueAtTime(50,t+0.15);
      tg.gain.setValueAtTime(0.05,t);tg.gain.exponentialRampToValueAtTime(0.001,t+0.2);
      to.start(t);to.stop(t+0.25);
    }
    // Cymbal crash every 32 beats
    if(ii%32===31){
      var co=ctx.createOscillator(),cg=ctx.createGain();co.connect(cg);cg.connect(ctx.destination);
      co.type='sawtooth';co.frequency.value=4000+Math.random()*2000;
      cg.gain.setValueAtTime(0.015,t);cg.gain.exponentialRampToValueAtTime(0.001,t+0.4);
      co.start(t);co.stop(t+0.45);
    }
    // Harmony chord (every 4th beat, major third interval)
    if(ii%4===0&&f>0){
      var ho2=ctx.createOscillator(),hg2=ctx.createGain();ho2.connect(hg2);hg2.connect(ctx.destination);
      ho2.type='sine';ho2.frequency.value=f*1.25;
      hg2.gain.setValueAtTime(0.02,t);hg2.gain.exponentialRampToValueAtTime(0.001,t+dur*2);
      ho2.start(t);ho2.stop(t+dur*2.5);
    }
    // Sparkle / chime layer (every 8th beat) for liveliness
    if(ii%8===0){
      var cf2=th.seq[((ii/th.seq.length|0)+3)%th.seq.length];
      if(cf2>0){
        var co3=ctx.createOscillator(),cg3=ctx.createGain();co3.connect(cg3);cg3.connect(ctx.destination);
        co3.type='sine';co3.frequency.value=cf2*2;
        cg3.gain.setValueAtTime(0.015,t);cg3.gain.exponentialRampToValueAtTime(0.001,t+dur*1.5);
        co3.start(t);co3.stop(t+dur*2);
        var co4=ctx.createOscillator(),cg4=ctx.createGain();co4.connect(cg4);cg4.connect(ctx.destination);
        co4.type='sine';co4.frequency.value=cf2*2.5;
        cg4.gain.setValueAtTime(0.01,t);cg4.gain.exponentialRampToValueAtTime(0.001,t+dur);
        co4.start(t);co4.stop(t+dur*1.2);
      }
    }
    // Snare ghost hit every other bar for groove
    if(th.drum&&ii%8===4){
      var sn2=ctx.createOscillator(),sn2g=ctx.createGain();sn2.connect(sn2g);sn2g.connect(ctx.destination);
      sn2.type='triangle';sn2.frequency.value=180+Math.random()*60;
      sn2g.gain.setValueAtTime(0.025,t);sn2g.gain.exponentialRampToValueAtTime(0.001,t+0.06);
      sn2.start(t);sn2.stop(t+0.08);
    }
    ii++;bgTimer=setTimeout(tick2,ms);
  }
  tick2();
}
function stopBg(){if(bgTimer){clearTimeout(bgTimer);bgTimer=null;}bgKey=null;}
function sfx(type){
  if(S.muted)return;
  var ctx=AC();if(!ctx)return;
  var g=ctx.createGain();g.connect(ctx.destination);g.gain.value=0.3;
  function n(f,wv,t,dur){var o=ctx.createOscillator(),gg=ctx.createGain();o.connect(gg);gg.connect(g);o.type=wv;o.frequency.value=f;gg.gain.setValueAtTime(1,ctx.currentTime+t);gg.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+t+dur);o.start(ctx.currentTime+t);o.stop(ctx.currentTime+t+dur+.01);}
  var FX={
    coin:function(){n(988,'square',0,.07);n(1319,'square',.07,.12);},
    ok:function(){[523,659,784,1047].forEach(function(f,i){n(f,'square',i*.07,.1);});},
    ng:function(){n(220,'sawtooth',0,.3);n(160,'sawtooth',.1,.25);},
    done:function(){[523,659,784,1047,1319,1568].forEach(function(f,i){n(f,'square',i*.08,.15);});n(1047,'triangle',.5,.3);n(1319,'triangle',.55,.25);n(1568,'triangle',.6,.4);},
    boss:function(){n(180,'sawtooth',0,.08);n(90,'square',.04,.18);n(60,'sawtooth',.12,.25);n(45,'square',.2,.15);n(300,'square',.05,.06);n(800,'square',.08,.03);},
    bossentry:function(){[110,147,165,220,294,330,440,659].forEach(function(f,i){n(f,'sawtooth',i*.07,.22);});n(82,'sawtooth',0,.5);n(110,'sawtooth',.2,.4);},
    power:function(){[262,330,392,523,659,784,1047,1319].forEach(function(f,i){n(f,'square',i*.05,.12);});n(1047,'triangle',.4,.5);},
    build:function(){[523,659,784,880,1047].forEach(function(f,i){n(f,'square',i*.07,.1);});n(440,'triangle',.3,.2);n(880,'triangle',.4,.15);},
    tick:function(){n(600,'sine',0,.04);},
    combo:function(){n(659,'square',0,.05);n(784,'square',.05,.05);n(1047,'square',.1,.1);},
    combo2x:function(){[523,659,784,1047,1319].forEach(function(f,i){n(f,'square',i*.05,.1);});}
  };
  if(FX[type])FX[type]();
}
function applyMute(){if(S.muted)stopBg();else{var k=bgKey||'home';bgKey=null;playBg(k);}}
function audBtn(id){
  var c=$(id);if(!c)return;c.innerHTML='';c.style.display='flex';c.style.gap='4px';c.style.alignItems='center';
  var b=el('div','width:34px;height:34px;background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.22);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;',S.muted?'🔇':'🔊');
  b.onclick=function(){S.muted=!S.muted;b.innerHTML=S.muted?'🔇':'🔊';applyMute();save();};
  c.appendChild(b);
  var tb=el('div','width:34px;height:34px;background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.22);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;',S.ttsMuted?'🤐':'🗣️');
  tb.title='Read questions aloud';
  tb.onclick=function(){S.ttsMuted=!S.ttsMuted;tb.innerHTML=S.ttsMuted?'🤐':'🗣️';save();};
  c.appendChild(tb);
}
function speak(t,p,r){
  p=p||1.1;r=r||1.0;if(S.muted||!t)return;
  try{window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.pitch=p;u.rate=r;u.volume=.8;var vs=window.speechSynthesis.getVoices();var v=vs.filter(function(x){return /samantha|karen|zira|female/i.test(x.name)&&x.lang.indexOf('en')===0;})[0]||vs.filter(function(x){return x.lang.indexOf('en')===0;})[0];if(v)u.voice=v;window.speechSynthesis.speak(u);}catch(e){}
}
function speakQ(t){
  if(S.ttsMuted||S.muted||!t)return;
  speak(t,1.0,0.9);
}
function speakBoss(t,cb){
  if(S.muted||!t){if(cb)cb();return;}
  try{
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(t);
    u.lang='en-US';u.pitch=0.3;u.rate=0.85;u.volume=1.0;
    var vs=window.speechSynthesis.getVoices();
    var v=vs.filter(function(x){return /daniel|james|david|male|thomas|alex|google us english/i.test(x.name)&&x.lang.indexOf('en')===0;})[0]
      ||vs.filter(function(x){return !/samantha|karen|zira|fiona|victoria|female/i.test(x.name)&&x.lang.indexOf('en')===0;})[0]
      ||vs.filter(function(x){return x.lang.indexOf('en')===0;})[0];
    if(v)u.voice=v;
    u.onend=function(){if(cb)cb();};
    u.onerror=function(){if(cb)cb();};
    window.speechSynthesis.speak(u);
  }catch(e){if(cb)cb();}
}
