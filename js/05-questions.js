function mkC(ans,ws){
  var a=String(ans),pool=[a];
  ws.forEach(function(w){
    var s=String(Math.max(0,Math.round(w)));
    if(s!==a&&pool.indexOf(s)===-1)pool.push(s);
  });
  var n=Math.abs(+ans)+1;
  while(pool.length<4){var s=String(n);if(pool.indexOf(s)===-1)pool.push(s);n++;}
  return shuffle(pool.slice(0,4));
}
function numRow(parts){
  var html='<div class="eq-row">';
  parts.forEach(function(p){
    if(p.t==='num')html+='<div class="num-display">'+p.v+'</div>';
    else if(p.t==='op')html+='<div class="op-sign">'+p.v+'</div>';
    else if(p.t==='blank')html+='<div class="blank-box">?</div>';
    else if(p.t==='eq')html+='<div class="op-sign">=</div>';
    else if(p.t==='ans')html+='<div class="num-display" style="background:#f0fdf4;border-color:#86efac;">'+p.v+'</div>';
    else html+='<span style="font-size:20px;color:#7c3aed;font-family:var(--px)">'+p.v+'</span>';
  });
  return html+'</div>';
}
function fmtT(h,m){return h+':'+(m===0?'00':m<10?'0'+m:m);}
function clockSVG(h,m,sz){
  sz=sz||90;var c=sz/2;
  function pt(deg,r){return{x:c+r*Math.cos((deg-90)*Math.PI/180),y:c+r*Math.sin((deg-90)*Math.PI/180)};}
  var hp=pt(h%12*30+m*.5,sz*.22),mp=pt(m*6,sz*.32);
  var nums='';
  for(var ni=1;ni<=12;ni++){var np=pt(ni%12*30,sz*.38);nums+='<text x="'+np.x+'" y="'+np.y+'" text-anchor="middle" dominant-baseline="central" font-size="'+(sz*.075)+'" font-weight="bold" fill="#4338ca">'+ni+'</text>';}
  return '<svg viewBox="0 0 '+sz+' '+sz+'" width="'+sz+'" height="'+sz+'" style="display:block;margin:0 auto 6px"><circle cx="'+c+'" cy="'+c+'" r="'+(c-2)+'" fill="#fef9c3" stroke="#fde68a" stroke-width="3"/><circle cx="'+c+'" cy="'+c+'" r="'+(c-6)+'" fill="white"/>'+nums+'<line x1="'+c+'" y1="'+c+'" x2="'+hp.x+'" y2="'+hp.y+'" stroke="#3730a3" stroke-width="'+(sz*.045)+'" stroke-linecap="round"/><line x1="'+c+'" y1="'+c+'" x2="'+mp.x+'" y2="'+mp.y+'" stroke="#db2777" stroke-width="'+(sz*.03)+'" stroke-linecap="round"/><circle cx="'+c+'" cy="'+c+'" r="'+(sz*.03)+'" fill="#1e1b4b"/></svg>';
}
function shapeSVG(shape,color,size){
  size=size||56;var c=size/2,r=c-5;
  var inner='';
  if(shape==='circle')inner='<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="'+color+'" stroke="white" stroke-width="2"/>';
  else if(shape==='square')inner='<rect x="5" y="5" width="'+(size-10)+'" height="'+(size-10)+'" fill="'+color+'" stroke="white" stroke-width="2"/>';
  else if(shape==='triangle')inner='<polygon points="'+c+',5 '+(size-5)+','+(size-5)+' 5,'+(size-5)+'" fill="'+color+'" stroke="white" stroke-width="2"/>';
  else if(shape==='rectangle')inner='<rect x="3" y="'+(c-c/2)+'" width="'+(size-6)+'" height="'+c+'" fill="'+color+'" stroke="white" stroke-width="2"/>';
  else if(shape==='pentagon'){var ppts=[];for(var pi=0;pi<5;pi++){var pa=(pi*72-90)*Math.PI/180;ppts.push((c+r*Math.cos(pa))+','+(c+r*Math.sin(pa)));}inner='<polygon points="'+ppts.join(' ')+'" fill="'+color+'" stroke="white" stroke-width="2"/>';}
  else if(shape==='hexagon'){var hpts=[];for(var hi=0;hi<6;hi++){var ha=(hi*60-90)*Math.PI/180;hpts.push((c+r*Math.cos(ha))+','+(c+r*Math.sin(ha)));}inner='<polygon points="'+hpts.join(' ')+'" fill="'+color+'" stroke="white" stroke-width="2"/>';}
  else if(shape==='diamond')inner='<polygon points="'+c+',5 '+(size-5)+','+c+' '+c+','+(size-5)+' 5,'+c+'" fill="'+color+'" stroke="white" stroke-width="2"/>';
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+inner+'</svg>';
}
// Grid count SVG: show a filled grid
function gridSVG(rows,cols,shaded,sz){
  sz=sz||12;var pad=4;
  var w=cols*sz+pad*2,h=rows*sz+pad*2;
  var svg='<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" style="display:block;margin:0 auto">';
  for(var ri=0;ri<rows;ri++)for(var ci=0;ci<cols;ci++){
    var filled=true;
    if(shaded){var key=ri+','+ci;filled=(shaded.indexOf(key)!==-1);}
    svg+='<rect x="'+(pad+ci*sz)+'" y="'+(pad+ri*sz)+'" width="'+(sz-1)+'" height="'+(sz-1)+'" fill="'+(filled?'#60a5fa':'transparent')+'" stroke="#94a3b8" stroke-width="1" rx="1"/>';
  }
  return svg+'</svg>';
}
// Net SVG: show arrangement of 6 squares (simplified cube net)
function netSVG(cells,sz){
  sz=sz||14;var pad=3;
  var maxR=0,maxC=0;
  cells.forEach(function(c){maxR=Math.max(maxR,c[0]);maxC=Math.max(maxC,c[1]);});
  var w=(maxC+1)*sz+pad*2,h=(maxR+1)*sz+pad*2;
  var svg='<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" style="display:block;margin:0 auto">';
  cells.forEach(function(c){svg+='<rect x="'+(pad+c[1]*sz)+'" y="'+(pad+c[0]*sz)+'" width="'+(sz-1)+'" height="'+(sz-1)+'" fill="#60a5fa" stroke="#fff" stroke-width="1.5" rx="1.5"/>';});
  return svg+'</svg>';
}
var VALID_NETS=[[[0,1],[1,0],[1,1],[1,2],[1,3],[2,1]],[[0,0],[1,0],[2,0],[2,1],[3,0],[4,0]],[[0,0],[0,1],[0,2],[1,2],[2,2],[2,3]],[[0,1],[1,0],[1,1],[1,2],[2,1],[3,1]]];
var INVALID_NETS=[[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5]],[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]],[[0,0],[1,0],[2,0],[3,0],[3,1],[3,2]],[[0,0],[0,1],[1,1],[1,2],[2,2],[3,2]]];

function diff(rId,lIdx){return clamp(1+Math.floor(rId*2)+Math.floor(lIdx/2),1,15);}

var GENS={
  add:function(d){
    var m=d<=2?20:d<=4?50:d<=6?99:d<=9?999:9999;
    var a=rnd(1,m),b=rnd(1,m),ans=a+b,v=rnd(0,1);
    if(v===0)return{type:'add',key:'a:'+a+'+'+b,i:'➕',tts:'What is '+a+' plus '+b+'?',render:true,display:numRow([{t:'num',v:a},{t:'op',v:'+'},{t:'num',v:b},{t:'eq'},{t:'blank'}]),a:String(ans),ch:mkC(ans,[ans+1,ans-1,ans+10])};
    return{type:'add',key:'a:'+a+'+?='+ans,i:'➕',tts:a+' plus what equals '+ans+'?',render:true,display:numRow([{t:'num',v:a},{t:'op',v:'+'},{t:'blank'},{t:'eq'},{t:'ans',v:ans}]),a:String(b),ch:mkC(b,[b+1,b+2,ans])};
  },
  sub:function(d){
    var m=d<=2?20:d<=4?50:d<=6?99:d<=9?999:9999;
    var b=rnd(1,m-1),a=b+rnd(1,m),ans=a-b;
    return{type:'sub',key:'s:'+a+'-'+b,i:'➖',tts:'What is '+a+' minus '+b+'?',render:true,display:numRow([{t:'num',v:a},{t:'op',v:'−'},{t:'num',v:b},{t:'eq'},{t:'blank'}]),a:String(ans),ch:mkC(ans,[ans+1,ans-1,b])};
  },
  mul:function(d){
    var m=d<=3?5:d<=6?9:d<=9?12:15;
    var base=d<=12?1:10;
    var a=rnd(2,m)*base,b=rnd(2,m),ans=a*b;
    return{type:'mul',key:'m:'+a+'x'+b,i:'✖️',tts:'What is '+a+' times '+b+'?',render:true,display:numRow([{t:'num',v:a},{t:'op',v:'×'},{t:'num',v:b},{t:'eq'},{t:'blank'}]),a:String(ans),ch:mkC(ans,[ans+a,ans-b,ans+b+1])};
  },
  div:function(d){
    var m=d<=3?5:d<=6?9:d<=9?12:20;
    var b=rnd(2,m),ans=rnd(2,d<=6?10:20),a=b*ans;
    return{type:'div',key:'d:'+a+'div'+b,i:'➗',tts:'What is '+a+' divided by '+b+'?',render:true,display:numRow([{t:'num',v:a},{t:'op',v:'÷'},{t:'num',v:b},{t:'eq'},{t:'blank'}]),a:String(ans),ch:mkC(ans,[ans+1,ans-1,ans+2])};
  },
  evenodd:function(d){
    var m=d<=2?20:d<=5?99:d<=8?999:9999;
    var n=rnd(1,m),ans=n%2===0?'Even':'Odd';
    return{type:'evenodd',key:'eo:'+n,i:'🎲',tts:'Is '+n+' even or odd?',render:true,display:'<div style="font-size:22px;font-family:var(--px);color:#374151;margin-bottom:8px">'+n+'</div><div style="font-size:14px;color:#555;font-family:var(--px)">Even or Odd?</div>',a:ans,ch:['Even','Odd']};
  },
  compare:function(d){
    var m=d<=2?20:d<=4?99:d<=7?999:9999;
    var a,b;do{a=rnd(1,m);b=rnd(1,m);}while(a===b);
    var ans=a>b?'>':'<';
    return{type:'compare',key:'cmp:'+a+':'+b,i:'⚖️',tts:'Is '+a+' greater than or less than '+b+'?',render:true,display:numRow([{t:'num',v:a},{t:'op',v:'?'},{t:'num',v:b}]),a:ans,ch:shuffle(['<','>','='])};
  },
  pattern:function(d){
    // Each pattern: {seq:[...], ans:N} — answer is pre-computed to avoid detection bugs
    var pools={
      easy:[
        {seq:[2,4,6,'?',10],ans:8},{seq:[5,10,15,'?',25],ans:20},{seq:[1,3,5,'?',9],ans:7},
        {seq:[10,8,6,'?',2],ans:4},{seq:[3,6,9,'?',15],ans:12},{seq:[4,8,12,'?',20],ans:16},
        {seq:[20,15,10,'?',0],ans:5},{seq:[7,14,21,'?',35],ans:28}
      ],
      mid:[
        {seq:[2,4,8,'?',32],ans:16},{seq:[100,90,80,'?',60],ans:70},
        {seq:[1,4,9,'?',25],ans:16},{seq:[3,9,27,'?',243],ans:81},
        {seq:[1,2,4,8,'?'],ans:16},{seq:[5,10,20,'?',80],ans:40},
        {seq:[2,6,18,'?',162],ans:54},{seq:[1,5,25,'?',625],ans:125}
      ],
      hard:[
        {seq:[1,1,2,3,5,'?'],ans:8},{seq:[2,3,5,7,'?',13],ans:11},
        {seq:[1,8,27,'?',125],ans:64},{seq:[100,81,64,'?',36],ans:49},
        {seq:[0,1,4,9,'?',25],ans:16},{seq:[1,2,4,7,11,'?'],ans:16},
        {seq:[0,1,1,2,3,'?'],ans:5},{seq:[1,4,9,16,'?',36],ans:25}
      ]
    };
    var pool=d<=3?pools.easy:d<=7?pools.easy.concat(pools.mid):pools.mid.concat(pools.hard);
    var item=pick(pool);
    var pat=item.seq;
    var ans=item.ans;
    var dispParts='';
    pat.forEach(function(v){if(v==='?')dispParts+='<div class="blank-box">?</div>';else dispParts+='<div class="num-display">'+v+'</div>';});
    return{type:'pattern',key:'p:'+JSON.stringify(pat),i:'🔮',tts:'What is the missing number?',render:true,display:'<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">'+dispParts+'</div>',a:String(Math.round(ans)),ch:mkC(Math.round(ans),[Math.round(ans)+1,Math.round(ans)-1,Math.round(ans)+2])};
  },
  clock:function(d){
    var h=rnd(1,12),m=d<=2?0:d<=5?pick([0,15,30,45]):pick([0,5,10,15,20,25,30,35,40,45,50,55]),ans=fmtT(h,m);
    return{type:'clock',key:'clk:'+h+':'+m,i:'🕐',tts:'What time does the clock show?',render:true,display:clockSVG(h,m)+'<div style="font-size:11px;font-family:var(--px);color:#374151">What time is it?</div>',a:ans,ch:shuffle([ans,fmtT(h%12+1,m),fmtT(h===1?12:h-1,m),fmtT(h,m===0?30:m===30?0:15)])};
  },
  elapsed:function(d){
    var h=rnd(1,10),m=d<=2?0:pick([0,30]),add=d<=2?rnd(1,3):rnd(1,5);
    var nh=h+add;if(nh>12)nh-=12;
    var ans=fmtT(nh,m);
    return{type:'elapsed',key:'el:'+h+':'+m+':'+add,i:'⏰',tts:'It is '+fmtT(h,m)+'. '+add+' hours pass. What time is it now?',render:true,display:clockSVG(h,m)+'<div style="font-size:11px;font-family:var(--px);color:#374151">'+add+' hours later = ?</div>',a:ans,ch:shuffle([ans,fmtT(nh%12+1,m),fmtT(nh===1?12:nh-1,m),fmtT(nh,m===0?30:0)])};
  },
  timediff:function(d){
    var h1=rnd(1,8),add=d<=2?rnd(1,4):rnd(1,7),h2=h1+add,ans=String(add);
    return{type:'timediff',key:'td:'+h1+':'+h2,i:'⏱️',tts:'How many hours between these two clocks?',render:true,display:'<div style="display:flex;gap:10px;align-items:center;justify-content:center">'+clockSVG(h1,0,76)+'<div style="font-size:16px;color:#374151">→</div>'+clockSVG(h2,0,76)+'</div><div style="font-size:10px;font-family:var(--px);color:#374151;margin-top:4px">Hours between them?</div>',a:ans,ch:mkC(add,[add+1,add-1,add+2])};
  },
  length:function(d){
    var n=d<=2?2:d<=5?3:4;
    var bars=[];for(var bi=0;bi<n;bi++)bars.push(rnd(20,90));
    var L=['A','B','C','D'];
    var isLong=Math.random()<.5;
    var target=isLong?Math.max.apply(null,bars):Math.min.apply(null,bars);
    var ans=L[bars.indexOf(target)];
    var bHtml='';
    bars.forEach(function(w,i){bHtml+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-family:var(--px);font-size:14px;color:#374151;width:18px">'+L[i]+'</span><div style="height:22px;width:'+w+'%;max-width:180px;background:'+(['#f87171','#60a5fa','#34d399','#fbbf24'][i])+';border-radius:4px;border:2px solid rgba(0,0,0,.2)"></div></div>';});
    return{type:'length',key:'len:'+JSON.stringify(bars),i:'📏',tts:'Which bar is '+(isLong?'longest':'shortest')+'?',render:true,display:'<div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:10px">Which bar is '+(isLong?'LONGEST?':'SHORTEST?')+'</div><div style="padding:0 4px">'+bHtml+'</div>',a:ans,ch:shuffle(L.slice(0,n))};
  },
  spatial:function(d){
    var SHAPES=['circle','square','triangle','rectangle','pentagon','hexagon','diamond'];
    var COLS=['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa'];
    var SIDES={circle:0,triangle:3,square:4,rectangle:4,pentagon:5,hexagon:6,diamond:4};
    var SYM_LINES={circle:'∞',square:'4',rectangle:'2',triangle:'3',pentagon:'5',hexagon:'6',diamond:'2'};
    // pick sub-type
    var subTypes=d<=3?['name','compose','symmetry']:d<=6?['name','symmetry','compose']:['symmetry','compose','grid','net'];
    var sub=pick(subTypes);
    if(sub==='symmetry'){
      var shape=pick(['square','rectangle','triangle','hexagon',d>=5?'pentagon':'square']);
      var lines=SYM_LINES[shape]||'0';
      var sc=pick(COLS);
      var chArr=lines==='∞'?['∞','4','2','1']:mkC(parseInt(lines)||4,[parseInt(lines)+1||5,parseInt(lines)===0?1:parseInt(lines)-1,2]);
      return{type:'spatial',key:'sp:sym:'+shape,i:'🪞',tts:'How many lines of symmetry does a '+shape+' have?',render:true,display:'<div style="display:flex;flex-direction:column;align-items:center;gap:6px">'+shapeSVG(shape,sc)+'<div style="font-size:10px;font-family:var(--px);color:#374151;text-align:center">Lines of symmetry<br>in a '+shape+'?</div></div>',a:String(lines),ch:chArr};
    }
    if(sub==='compose'){
      var composites=[
        {q:'Two right triangles joined\nmake which shape?',a:'Square',w:['Circle','Pentagon','Hexagon']},
        {q:'A square cut diagonally\ngives you two of what?',a:'Triangles',w:['Circles','Rectangles','Hexagons']},
        {q:'Two identical rectangles\njoined make which shape?',a:'Rectangle',w:['Triangle','Circle','Octagon']},
        {q:'Four small triangles can\narrange to make a ___?',a:'Large triangle',w:['Circle','Hexagon','Diamond']},
        {q:'Six squares arranged\nin a cross shape make a ___?',a:'Cube net',w:['Sphere','Pyramid','Cone']},
      ];
      var comp=pick(composites);
      return{type:'spatial',key:'sp:cmp:'+comp.q.replace(/\s/g,'').slice(0,30)+':'+comp.a,i:'🔷',tts:comp.q.replace(/\n/g,' '),render:true,display:'<div style="font-size:11px;font-family:var(--px);color:#374151;white-space:pre-line;line-height:2;text-align:center">'+comp.q+'</div>',a:comp.a,ch:shuffle([comp.a].concat(comp.w))};
    }
    if(sub==='grid'){
      var gc=d<=6?rnd(2,3):rnd(3,4);
      var gr=d<=6?rnd(2,3):rnd(3,5);
      var total=gc*gr;
      // For harder: L-shaped grid (remove one corner)
      var isLShaped=d>=8&&Math.random()<.5;
      var removed=isLShaped?1:0;
      var actual=total-removed;
      var label=isLShaped?'How many small squares are shaded?':'How many small squares are in this '+gr+'×'+gc+' grid?';
      return{type:'spatial',key:'sp:grid:'+gr+'x'+gc+':'+removed,i:'📐',tts:label,render:true,display:gridSVG(gr,gc,null,14)+'<div style="font-size:10px;font-family:var(--px);color:#374151;margin-top:8px;text-align:center">'+label+'</div>',a:String(actual),ch:mkC(actual,[actual-1,actual+1,actual-gc])};
    }
    if(sub==='net'&&d>=5){
      var vNet=pick(VALID_NETS);
      var iNet=pick(INVALID_NETS);
      var iNet2=pick(INVALID_NETS.filter(function(n){return n!==iNet;}));
      var iNet3=pick(INVALID_NETS.filter(function(n){return n!==iNet&&n!==iNet2;}));
      var opts=[
        {svg:netSVG(vNet),valid:true},
        {svg:netSVG(iNet),valid:false},
        {svg:netSVG(iNet2),valid:false},
        {svg:netSVG(iNet3),valid:false}
      ];
      var shuffled=shuffle(opts);
      var labels=['A','B','C','D'];
      var correctLabel=labels[shuffled.findIndex(function(o){return o.valid;})];
      var dispHtml='<div style="font-size:10px;font-family:var(--px);color:#374151;margin-bottom:10px;text-align:center">Which of these can fold<br>into a cube?</div>';
      var gfxCh=shuffled.map(function(o,i){return{html:o.svg,label:labels[i]};});
      return{type:'spatial',key:'sp:net:'+JSON.stringify(vNet[0]),i:'📦',tts:'Which shape can fold into a cube?',render:true,display:dispHtml,a:correctLabel,ch:['A','B','C','D'],gfxCh:gfxCh};
    }
    // Default: name (identify shape)
      var opts=['circle','triangle','square','pentagon','hexagon'],s=pick(opts),sc=pick(COLS);
      return{type:'spatial',key:'sp:name:'+s,i:'🔷',tts:'What shape is this?',render:true,display:'<div style="display:flex;flex-direction:column;align-items:center;gap:8px">'+shapeSVG(s,sc)+'<div style="font-size:11px;font-family:var(--px);color:#374151;text-align:center">What shape is this?</div></div>',a:s,ch:shuffle([s].concat(shuffle(opts.filter(function(x){return x!==s;})).slice(0,3)))};
  },
  lineup:function(d){
    var names=['Lily','Max','Zoe','Tom','Mia','Jake','Emma','Sam','Leo','Ruby'];
    var name=pick(names);
    var type=d<=3?rnd(0,1):d<=7?rnd(0,2):rnd(0,3);
    if(type===0){
      // front + back + self = total
      var front=rnd(1,d<=3?5:9),back=rnd(1,d<=3?4:8);
      var total=front+back+1;
      return{type:'lineup',key:'lu:0:'+front+':'+back,i:'👫',tts:name+' is in a queue. '+front+' people in front, '+back+' behind. How many in total?',render:true,display:'<div style="font-family:var(--px);font-size:14px;color:#374151;line-height:2.2;text-align:center"><b>'+name+'</b> is in a queue.<br><span style="color:#3b82f6">'+front+' people</span> in front.<br><span style="color:#ef4444">'+back+' people</span> behind.<br>How many <b>total</b> in the queue?</div>',a:String(total),ch:mkC(total,[front+back,total+1,total-1])};
    }
    if(type===1){
      // position + total → behind
      var totP=rnd(6,d<=5?12:20),pos=rnd(2,totP-1);
      var behind=totP-pos;
      return{type:'lineup',key:'lu:1:'+pos+':'+totP,i:'👫',tts:'There are '+totP+' people in a queue. '+name+' is in position '+pos+'. How many people are behind them?',render:true,display:'<div style="font-family:var(--px);font-size:14px;color:#374151;line-height:2.2;text-align:center">There are <b>'+totP+' people</b> in a queue.<br><b>'+name+'</b> is in position <span style="color:#7c3aed;font-size:16px">'+pos+'</span>.<br>How many are <b>behind</b> them?</div>',a:String(behind),ch:mkC(behind,[behind+1,behind-1,pos])};
    }
    if(type===2){
      // position → people in front
      var pos2=rnd(2,d<=5?8:15);
      var inFront=pos2-1;
      return{type:'lineup',key:'lu:2:'+pos2,i:'👫',tts:name+' is in position '+pos2+' in a queue. How many people are in front of them?',render:true,display:'<div style="font-family:var(--px);font-size:14px;color:#374151;line-height:2.2;text-align:center"><b>'+name+'</b> is in position<br><span style="color:#7c3aed;font-size:16px;font-weight:bold">'+pos2+'</span><br>How many are <b>in front</b> of them?</div>',a:String(inFront),ch:mkC(inFront,[inFront+1,pos2,inFront-1])};
    }
    // type 3: two people swap → new positions
    var qTotal=rnd(8,15),pA=rnd(2,qTotal-3),pB=pA+rnd(2,4);
    var moved=pB-pA;
    return{type:'lineup',key:'lu:3:'+pA+':'+pB,i:'👫',tts:name+' moves from position '+pA+' to position '+pB+'. How many places forward did they move?',render:true,display:'<div style="font-family:var(--px);font-size:14px;color:#374151;line-height:2.2;text-align:center"><b>'+name+'</b> moves in the queue.<br>From position <span style="color:#ef4444">'+pA+'</span><br>to position <span style="color:#22c55e">'+pB+'</span>.<br>How many places did they move back?</div>',a:String(moved),ch:mkC(moved,[moved+1,pA,pB])};
  },
  logic:function(d){
    var pool=[
      {q:'Tom has 8 apples.\nSara has 3 fewer than Tom.\nHow many does Sara have?',a:'5',w:[8,3,11]},
      {q:'4 red balls and 5 blue balls are in a bag.\nHow many balls altogether?',a:'9',w:[4,5,1]},
      {q:'A hen lays 3 eggs every day.\nHow many eggs in 4 days?',a:'12',w:[7,3,4]},
      {q:'I am greater than 6 and less than 9.\nI am odd. What number am I?',a:'7',w:[6,8,9]},
      {q:'Mia has 15 stickers.\nShe gives away 4 and gets 2 back.\nHow many does she have now?',a:'13',w:[15,11,19]},
      {q:'Sam ran 5 km on Monday\nand 7 km on Tuesday.\nHow much further on Tuesday?',a:'2',w:[5,7,12]},
      {q:'There are 3 bags with 4 apples each.\nHow many apples in total?',a:'12',w:[7,3,4]},
      {q:'There are 20 birds.\nHalf fly away. How many remain?',a:'10',w:[20,5,15]},
      {q:'Jack has 6 coins.\nHe earns 4 more. He spends 3.\nHow many coins does he have?',a:'7',w:[6,10,3]},
      {q:'A shelf has 3 rows of books.\nEach row has 6 books.\nHow many books in total?',a:'18',w:[9,3,6]},
    ];
    if(d>=7){
      pool=pool.concat([
        {q:'Anna reads 12 pages per day.\nHow many pages in 5 days?',a:'60',w:[17,50,55]},
        {q:'A box of 36 chocolates is shared equally\namong 4 friends.\nHow many each?',a:'9',w:[8,10,12]},
        {q:'Train A has 48 passengers.\nTrain B has 23 fewer.\nHow many on Train B?',a:'25',w:[48,23,71]}
      ]);
    }
    var q=pick(pool);
    return{type:'logic',key:'lg:'+q.q.replace(/\s/g,'').slice(0,40)+':'+q.a,i:'🧩',tts:q.q.replace(/\n/g,' '),render:true,display:'<div style="font-size:11px;font-family:var(--px);color:#374151;white-space:pre-line;line-height:2;text-align:center">'+q.q+'</div>',a:String(q.a),ch:mkC(q.a,q.w)};
  },
  word:function(d){
    var easy=[
      function(){var a=rnd(3,12),b=rnd(2,8);return{k:'wd:e0:'+a+':'+b,q:'There are '+a+' apples and '+b+' oranges.\nHow many fruit altogether?',a:a+b,w:[a,b,a+b+2]};},
      function(){var a=rnd(10,20),b=rnd(2,8);return{k:'wd:e1:'+a+':'+b,q:'There are '+a+' flowers. '+b+' are picked.\nHow many are left?',a:a-b,w:[a,b,a+b]};},
      function(){var p=rnd(2,5),e=rnd(2,6);return{k:'wd:e2:'+p+':'+e,q:p+' friends each have '+e+' sweets.\nHow many sweets in total?',a:p*e,w:[p+e,p*e+p,p*e-e]};},
      function(){var r=rnd(2,4),c=rnd(3,6);return{k:'wd:e3:'+r+':'+c,q:'There are '+r+' rows of chairs.\nEach row has '+c+' chairs.\nHow many chairs in total?',a:r*c,w:[r+c,r*c+r,r*c-c]};}
    ];
    var hard=[
      function(){var s=rnd(40,80),h=rnd(2,4);return{k:'wd:h0:'+s+':'+h,q:'A train travels at '+s+' km/h.\nHow far in '+h+' hours?',a:s*h,w:[s+h,s*h-s,s*h+h]};},
      function(){var b=rnd(20,40),p=rnd(3,8),q=rnd(2,5);return{k:'wd:h1:'+b+':'+p+':'+q,q:'You have $'+b+'. You buy '+q+' items at $'+p+' each.\nHow much is left?',a:b-p*q,w:[p*q,b,b-p]};},
      function(){var d=rnd(10,25),w=rnd(3,7);return{k:'wd:h2:'+d+':'+w,q:'A baker makes '+d+' cakes per day.\nHow many in '+w+' working days?',a:d*w,w:[d+w,d*w-d,d*w+w]};}
    ];
    var v=pick(d<=4?easy:easy.concat(hard))();
    return{type:'word',key:v.k,i:'📖',tts:v.q.replace(/\n/g,' '),render:true,display:'<div style="font-size:11px;font-family:var(--px);color:#374151;white-space:pre-line;line-height:2;text-align:center">'+v.q+'</div>',a:String(v.a),ch:mkC(v.a,v.w)};
  },
  multistep:function(d){
    if(d<=4){var a=rnd(2,7),b=rnd(2,7),c=rnd(1,9),ans=a*b+c;return{type:'multistep',key:'ms:'+a+'x'+b+'+'+c,i:'🧮',tts:'What is '+a+' times '+b+' plus '+c+'?',render:true,display:numRow([{t:'num',v:a},{t:'op',v:'×'},{t:'num',v:b},{t:'op',v:'+'},{t:'num',v:c},{t:'eq'},{t:'blank'}]),a:String(ans),ch:mkC(ans,[a*b,ans-c,ans+c])};}
    var a2=rnd(3,12),b2=rnd(3,12),c2=rnd(2,8),op=pick(['+','-']);
    var mid=a2*b2,ans2=op==='+'?mid+c2:mid-c2;
    return{type:'multistep',key:'ms2:'+a2+'x'+b2+op+c2,i:'🧮',tts:'What is '+a2+' times '+b2+' '+op+' '+c2+'?',render:true,display:numRow([{t:'num',v:a2},{t:'op',v:'×'},{t:'num',v:b2},{t:'op',v:op},{t:'num',v:c2},{t:'eq'},{t:'blank'}]),a:String(ans2),ch:mkC(ans2,[mid,ans2+a2,ans2-c2])};
  },
  money:function(d){
    var price=d<=2?rnd(1,5):d<=5?rnd(2,12):rnd(5,25),qty=rnd(2,d<=2?4:7);
    var budget=price*qty+rnd(1,d<=5?10:25),left=budget-price*qty;
    return{type:'money',key:'mn:'+budget+':'+price+':'+qty,i:'💰',tts:'You have '+budget+' coins. You buy '+qty+' items at '+price+' each. How many coins left?',render:true,display:'<div style="font-size:11px;font-family:var(--px);color:#374151;line-height:2.2;text-align:center">You have <span style="color:#15803d;font-size:16px">'+budget+' coins</span><br>Buy <span style="color:#1d4ed8">'+qty+'</span> items at <span style="color:#b45309">'+price+'</span> each<br>Coins left?</div>',a:String(left),ch:mkC(left,[price*qty,left+price,budget])};
  },
  rotshape:function(d){
    // Shape rotation: show a shape with a marker, ask what it looks like after rotation
    var SHAPES=['L-shape','T-shape','arrow','zigzag','plus','cross'];
    var COLS=['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa','#fb923c'];
    var rotations=d<=3?[{label:'a quarter turn (90°)',deg:90}]:d<=7?[{label:'a half turn (180°)',deg:180},{label:'a quarter turn (90°)',deg:90}]:[{label:'a quarter turn (90°)',deg:90},{label:'a half turn (180°)',deg:180},{label:'three quarter turn (270°)',deg:270}];
    var rot=pick(rotations);
    var shapeIdx=rnd(0,SHAPES.length-1);
    var sc=COLS[shapeIdx];
    // Build SVG grid with the shape on a 3x3 or 4x4 grid
    var gs=d<=5?3:4;
    var gs2=gs*gs;
    // Define shape patterns on the grid
    var patterns3=[
      {cells:[[0,0],[1,0],[1,1],[1,2]],name:'L'},
      {cells:[[0,0],[0,1],[0,2],[1,1]],name:'T'},
      {cells:[[0,1],[1,0],[1,1],[2,1]],name:'arrow'},
      {cells:[[0,0],[0,1],[1,1],[1,2]],name:'zigzag'},
      {cells:[[0,1],[1,0],[1,1],[1,2]],name:'plus'},
      {cells:[[0,0],[0,1],[1,0],[1,1]],name:'square'}
    ];
    var patterns=gs===3?patterns3:patterns3.concat([
      {cells:[[0,0],[0,1],[0,2],[1,0],[1,2]],name:'U'},
      {cells:[[0,0],[0,1],[0,2],[1,2],[2,2]],name:'big-L'}
    ]);
    var pat=pick(patterns);
    // Rotate the pattern
    var rotated=pat.cells.map(function(c){
      var r=c[0],col=c[1];
      if(rot.deg===90)return[col,gs-1-r];
      if(rot.deg===180)return[gs-1-r,gs-1-col];
      return[gs-1-col,r]; // 270
    });
    var cellSz=20,pad=4;
    function drawGrid(cells,fillCol){
      var w2=gs*cellSz+pad*2,h2=gs*cellSz+pad*2;
      var svg='<svg width="'+w2+'" height="'+h2+'" viewBox="0 0 '+w2+' '+h2+'">';
      for(var ri=0;ri<gs;ri++)for(var ci=0;ci<gs;ci++){
        var filled=false;
        for(var fi=0;fi<cells.length;fi++){if(cells[fi][0]===ri&&cells[fi][1]===ci){filled=true;break;}}
        svg+='<rect x="'+(pad+ci*cellSz)+'" y="'+(pad+ri*cellSz)+'" width="'+(cellSz-1)+'" height="'+(cellSz-1)+'" fill="'+(filled?fillCol:'#e2e8f0')+'" stroke="#94a3b8" stroke-width="1" rx="2"/>';
      }
      return svg+'</svg>';
    }
    // Generate wrong rotations (pick different degrees)
    var wrongDegs=[90,180,270].filter(function(x){return x!==rot.deg;});
    var wrongRotated1=pat.cells.map(function(c){var r=c[0],col=c[1];var wd=wrongDegs[0];if(wd===90)return[col,gs-1-r];if(wd===180)return[gs-1-r,gs-1-col];return[gs-1-col,r];});
    var wrongRotated2=pat.cells.map(function(c){var r=c[0],col=c[1];var wd=wrongDegs[1];if(wd===90)return[col,gs-1-r];if(wd===180)return[gs-1-r,gs-1-col];return[gs-1-col,r];});
    // Wrong answer: unrotated original
    var wrongOriginal=pat.cells;
    // Build choices as grids labeled A/B/C/D
    var options=[
      {svg:drawGrid(rotated,sc),correct:true},
      {svg:drawGrid(wrongRotated1,'#f87171'),correct:false},
      {svg:drawGrid(wrongRotated2,'#60a5fa'),correct:false},
      {svg:drawGrid(wrongOriginal,'#fbbf24'),correct:false}
    ];
    options=shuffle(options);
    var labels=['A','B','C','D'];
    var correctLabel=labels[options.findIndex(function(o){return o.correct;})];
    var dispHtml='<div style="font-size:10px;font-family:var(--px);color:#374151;margin-bottom:8px;text-align:center">This shape is turned <b>'+rot.label+'</b> clockwise.<br>What does it look like after?</div>';
    dispHtml+='<div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:10px"><div style="font-size:11px;color:#64748b;font-family:var(--px)">Before:</div>'+drawGrid(pat.cells,sc)+'<div style="font-size:20px">➡️</div><div style="font-size:11px;color:#64748b;font-family:var(--px)">After?</div></div>';
    var gfxCh=options.map(function(o,i){return{html:o.svg,label:labels[i]};});
    return{type:'rotshape',key:'rs:'+pat.name+':'+rot.deg,i:'🔄',tts:'The shape is turned '+rot.label+' clockwise. Which shows the result?',render:true,display:dispHtml,a:correctLabel,ch:['A','B','C','D'],gfxCh:gfxCh};
  },
  shadow:function(d){
    // Shadow matching: show a shape, find its shadow/silhouette
    var COLS=['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa'];
    var sc=pick(COLS);
    // Build compound shapes from basic blocks
    var shapes=[
      {name:'house',cells:[[0,1],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]]},
      {name:'boat',cells:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,1]]},
      {name:'tree',cells:[[0,1],[1,0],[1,1],[1,2],[2,1],[3,1]]},
      {name:'arrow',cells:[[0,1],[1,0],[1,1],[1,2],[2,1],[3,1]]},
      {name:'stairs',cells:[[0,2],[1,1],[1,2],[2,0],[2,1],[2,2]]},
      {name:'L-block',cells:[[0,0],[1,0],[1,1],[2,0],[2,1]]},
      {name:'T-block',cells:[[0,0],[0,1],[0,2],[1,1],[2,1]]},
      {name:'cross',cells:[[0,1],[1,0],[1,1],[1,2],[2,1]]},
      {name:'U-block',cells:[[0,0],[0,2],[1,0],[1,1],[1,2],[2,0],[2,2]]}
    ];
    var gs=3;
    var sh=pick(shapes);
    var cellSz=18,pad=4;
    function drawShapeGrid(cells,fill,stroke){
      var w2=gs*cellSz+pad*2,h2=gs*cellSz+pad*2;
      var svg='<svg width="'+w2+'" height="'+h2+'" viewBox="0 0 '+w2+' '+h2+'">';
      for(var ri=0;ri<gs;ri++)for(var ci=0;ci<gs;ci++){
        var filled=false;
        for(var fi=0;fi<cells.length;fi++){if(cells[fi][0]===ri&&cells[fi][1]===ci){filled=true;break;}}
        if(filled)svg+='<rect x="'+(pad+ci*cellSz)+'" y="'+(pad+ri*cellSz)+'" width="'+(cellSz-1)+'" height="'+(cellSz-1)+'" fill="'+fill+'" stroke="'+(stroke||'#333')+'" stroke-width="1.5" rx="2"/>';
        else svg+='<rect x="'+(pad+ci*cellSz)+'" y="'+(pad+ri*cellSz)+'" width="'+(cellSz-1)+'" height="'+(cellSz-1)+'" fill="#f1f5f9" stroke="#ddd" stroke-width="0.5" rx="2"/>';
      }
      return svg+'</svg>';
    }
    // Shadow = same shape but all dark grey
    function drawShadow(cells){
      return drawShapeGrid(cells,'#333','#222');
    }
    // Wrong shadows: modified versions
    function shiftShape(cells,dx,dy){
      return cells.map(function(c){return[c[0]+dy,c[1]+dx];}).filter(function(c){return c[0]>=0&&c[0]<gs&&c[1]>=0&&c[1]<gs;});
    }
    var wrongs=[];
    // Shifted version
    var shifted=shiftShape(sh.cells,1,0);
    if(shifted.length<sh.cells.length)shifted=shiftShape(sh.cells,-1,0);
    if(shifted.length===sh.cells.length)wrongs.push(shifted);
    // Mirror version
    var mirrored=sh.cells.map(function(c){return[c[0],gs-1-c[1]];});
    if(JSON.stringify(mirrored.sort())!==JSON.stringify(sh.cells.slice().sort()))wrongs.push(mirrored);
    // Missing cell
    if(sh.cells.length>3){
      var removed=sh.cells.slice();removed.splice(rnd(0,removed.length-1),1);
      wrongs.push(removed);
    }
    // Extra cell
    var extraCells=[];
    for(var eci=0;eci<gs;eci++)for(var ecj=0;ecj<gs;ecj++){
      var found=false;for(var efi=0;efi<sh.cells.length;efi++){if(sh.cells[efi][0]===eci&&sh.cells[efi][1]===ecj){found=true;break;}}
      if(!found)extraCells.push([eci,ecj]);
    }
    if(extraCells.length>0){var ex=extraCells[rnd(0,extraCells.length-1)];wrongs.push(sh.cells.concat([ex]));}

    while(wrongs.length<3)wrongs.push(shiftShape(sh.cells,0,1));
    wrongs=wrongs.slice(0,3);

    var options=[
      {svg:drawShadow(sh.cells),correct:true},
      {svg:drawShadow(wrongs[0]),correct:false},
      {svg:drawShadow(wrongs[1]),correct:false},
      {svg:drawShadow(wrongs[2]),correct:false}
    ];
    options=shuffle(options);
    var labels=['A','B','C','D'];
    var correctLabel=labels[options.findIndex(function(o){return o.correct;})];
    var dispHtml='<div style="font-size:10px;font-family:var(--px);color:#374151;margin-bottom:8px;text-align:center">Which shadow does this shape make?</div>';
    dispHtml+='<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:12px"><div style="text-align:center"><div style="font-size:10px;color:#64748b;font-family:var(--px)">Shape</div>'+drawShapeGrid(sh.cells,sc,'#fff')+'</div><div style="font-size:20px">→</div><div style="text-align:center"><div style="font-size:10px;color:#64748b;font-family:var(--px)">Shadow?</div></div></div>';
    var gfxCh=options.map(function(o,i){return{html:o.svg,label:labels[i]};});
    return{type:'shadow',key:'sh:'+sh.name,i:'🌑',tts:'Which shadow does this shape make?',render:true,display:dispHtml,a:correctLabel,ch:['A','B','C','D'],gfxCh:gfxCh};
  },
  shapeseq:function(d){
    // Shape sequence: find the next shape in a visual pattern
    var shapeList=['●','■','▲','◆','★','♥'];
    var COLS=['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa','#fb923c'];
    var sizes=['small','big'];
    var numAttrs=d<=3?2:3;
    // Build pattern rules
    var rules=[];
    // Rule type 1: alternating shapes
    if(numAttrs>=2){
      var s1=shapeList[rnd(0,2)],s2=shapeList[rnd(3,5)];
      var c1=COLS[rnd(0,5)],c2=COLS[rnd(0,5)];
      rules.push({
        seq:[{s:s1,c:c1,sz:1},{s:s2,c:c2,sz:1},{s:s1,c:c1,sz:1},{s:s2,c:c2,sz:1}],
        ans:{s:s1,c:c1,sz:1},
        wrongs:[{s:s2,c:c1,sz:1},{s:s1,c:c2,sz:1},{s:s2,c:c2,sz:1}]
      });
    }
    // Rule type 2: cycling through 3 shapes
    {
      var s3=shapeList[rnd(0,1)],s4=shapeList[rnd(2,3)],s5=shapeList[rnd(4,5)];
      var c3=COLS[rnd(0,2)],c4=COLS[rnd(3,4)],c5=COLS[5];
      rules.push({
        seq:[{s:s3,c:c3,sz:1},{s:s4,c:c4,sz:1},{s:s5,c:c5,sz:1},{s:s3,c:c3,sz:1},{s:s4,c:c4,sz:1}],
        ans:{s:s5,c:c5,sz:1},
        wrongs:[{s:s3,c:c3,sz:1},{s:s4,c:c4,sz:1},{s:s5,c:c3,sz:1}]
      });
    }
    // Rule type 3: size changes
    if(numAttrs>=2){
      var ss=shapeList[rnd(0,5)],sc2=COLS[rnd(0,5)];
      rules.push({
        seq:[{s:ss,c:sc2,sz:0.7},{s:ss,c:sc2,sz:1},{s:ss,c:sc2,sz:1.3},{s:ss,c:sc2,sz:0.7},{s:ss,c:sc2,sz:1}],
        ans:{s:ss,c:sc2,sz:1.3},
        wrongs:[{s:ss,c:sc2,sz:0.7},{s:ss,c:sc2,sz:1},{s:ss,c:sc2,sz:1.6}]
      });
    }
    // Rule type 4: color cycling with same shape
    {
      var ss2=shapeList[rnd(0,5)];
      var ca=COLS[rnd(0,5)],cb=COLS[rnd(0,5)],cc=COLS[rnd(0,5)];
      rules.push({
        seq:[{s:ss2,c:ca,sz:1},{s:ss2,c:cb,sz:1},{s:ss2,c:cc,sz:1},{s:ss2,c:ca,sz:1},{s:ss2,c:cb,sz:1}],
        ans:{s:ss2,c:cc,sz:1},
        wrongs:[{s:ss2,c:ca,sz:1},{s:ss2,c:cb,sz:1},{s:ss2,c:'#333',sz:1}]
      });
    }
    // Rule type 5: shape + color change together
    if(d>=4){
      var sa=shapeList[0],sb=shapeList[2],sc3=COLS[0],sd=COLS[2];
      rules.push({
        seq:[{s:sa,c:sc3,sz:1},{s:sb,c:sd,sz:1},{s:sa,c:sc3,sz:1},{s:sb,c:sd,sz:1}],
        ans:{s:sa,c:sc3,sz:1},
        wrongs:[{s:sb,c:sc3,sz:1},{s:sa,c:sd,sz:1},{s:sb,c:sd,sz:1}]
      });
    }
    var rule=pick(rules);
    function shapeHTML(item){
      var fs=Math.round(28*item.sz);
      return '<span style="font-size:'+fs+'px;color:'+item.c+';text-shadow:1px 1px 0 rgba(0,0,0,.2)">'+item.s+'</span>';
    }
    var dispHtml='<div style="font-size:10px;font-family:var(--px);color:#374151;margin-bottom:10px;text-align:center">What comes next in the pattern?</div>';
    dispHtml+='<div style="display:flex;gap:8px;justify-content:center;align-items:center;margin-bottom:12px;flex-wrap:wrap">';
    rule.seq.forEach(function(item){dispHtml+='<div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:10px;width:44px;height:44px;display:flex;align-items:center;justify-content:center">'+shapeHTML(item)+'</div>';});
    dispHtml+='<div style="background:#fef3c7;border:3px dashed #f59e0b;border-radius:10px;width:44px;height:44px;display:flex;align-items:center;justify-content:center"><span style="color:#f59e0b;font-size:20px">?</span></div>';
    dispHtml+='</div>';
    var choices=shuffle([rule.ans].concat(rule.wrongs));
    var labels2=['A','B','C','D'];
    var correctLabel2=labels2[choices.indexOf(rule.ans)];
    var gfxCh=choices.map(function(c,i){return{html:'<div style="height:44px;display:flex;align-items:center;justify-content:center">'+shapeHTML(c)+'</div>',label:labels2[i]};});
    return{type:'shapeseq',key:'sq:'+rule.ans.s+':'+rule.ans.c,i:'🔶',tts:'What comes next in the pattern?',render:true,display:dispHtml,a:correctLabel2,ch:['A','B','C','D'],gfxCh:gfxCh};
  },
  oddone:function(d){
    // Odd one out: 4 items, one doesn't belong
    var shapeList=['●','■','▲','◆','★','♥','⬟','⬡'];
    var COLS=['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa','#fb923c'];
    var attrs=d<=3?1:2;
    var ruleType=rnd(0,attrs===1?2:5);
    var group,odd,reason;
    if(ruleType===0){
      // Different shape
      var si=rnd(0,shapeList.length-2),sc2=COLS[rnd(0,5)];
      group={s:shapeList[si],c:sc2};
      odd={s:shapeList[(si+rnd(1,3))%shapeList.length],c:sc2};
      reason='Different shape';
    }else if(ruleType===1){
      // Different color
      var ss=shapeList[rnd(0,5)],ci2=rnd(0,4);
      group={s:ss,c:COLS[ci2]};
      odd={s:ss,c:COLS[(ci2+rnd(1,4))%6]};
      reason='Different color';
    }else if(ruleType===2){
      // Different size
      var ss2=shapeList[rnd(0,5)],sc3=COLS[rnd(0,5)];
      group={s:ss2,c:sc3,sz:1};
      odd={s:ss2,c:sc3,sz:1.5};
      reason='Different size';
    }else if(ruleType===3){
      // Filled vs outlined
      var ss3=shapeList[rnd(0,4)],sc4=COLS[rnd(0,5)];
      group={s:ss3,c:sc4,outline:false};
      odd={s:ss3,c:sc4,outline:true};
      reason='Outlined vs filled';
    }else{
      // Different shape + color combo
      var si2=rnd(0,3),ci3=rnd(0,3);
      group={s:shapeList[si2],c:COLS[ci3]};
      odd={s:shapeList[si2+2],c:COLS[ci3+2]};
      reason='Different shape and color';
    }
    function itemHTML(item,idx){
      var fs=item.sz?Math.round(32*item.sz):32;
      var style2='font-size:'+fs+'px;color:'+item.c+';text-shadow:1px 1px 0 rgba(0,0,0,.15)';
      if(item.outline)style2='font-size:'+fs+'px;color:transparent;-webkit-text-stroke:2px '+item.c;
      return '<div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;width:60px;height:60px;display:flex;align-items:center;justify-content:center;cursor:pointer" id="odd-'+idx+'"><span style="'+style2+'">'+item.s+'</span></div>';
    }
    var items=[group,group,group,odd];
    // Shuffle items
    var indices=[0,1,2,3];
    for(var ii=indices.length-1;ii>0;ii--){var jj=Math.floor(Math.random()*(ii+1));var tmp=indices[ii];indices[ii]=indices[jj];indices[jj]=tmp;}
    var shuffled=indices.map(function(i2){return items[i2];});
    var correctIdx=-1;
    for(var ki=0;ki<shuffled.length;ki++){if(shuffled[ki]===odd){correctIdx=ki;break;}}
    var labels3=['A','B','C','D'];
    var dispHtml='<div style="font-size:10px;font-family:var(--px);color:#374151;margin-bottom:10px;text-align:center">Which one is different from the others?</div>';
    var gfxCh=shuffled.map(function(it,i3){
      var fs=it.sz?Math.round(32*it.sz):32;
      var st='font-size:'+fs+'px;color:'+it.c+';text-shadow:1px 1px 0 rgba(0,0,0,.15)';
      if(it.outline)st='font-size:'+fs+'px;color:transparent;-webkit-text-stroke:2px '+it.c;
      return{html:'<div style="height:50px;display:flex;align-items:center;justify-content:center"><span style="'+st+'">'+it.s+'</span></div>',label:labels3[i3]};
    });
    return{type:'oddone',key:'oo:'+reason,i:'🕵️',tts:'Which one is different from the others?',render:true,display:dispHtml,a:labels3[correctIdx],ch:['A','B','C','D'],gfxCh:gfxCh};
  },
  mirror:function(d){
    // Mirror image: show a pattern on a grid, find its mirror
    var COLS=['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa','#fb923c'];
    var sc2=COLS[rnd(0,5)];
    var gs=d<=4?3:4;
    // Create an asymmetric pattern
    var allCells=[];
    for(var ari=0;ari<gs;ari++)for(var aci=0;aci<Math.ceil(gs/2);aci++)allCells.push([ari,aci]);
    // Pick 3-5 cells for the pattern
    var numCells=rnd(3,Math.min(5,allCells.length));
    var shuffled2=allCells.slice();
    for(var si3=shuffled2.length-1;si3>0;si3--){var ji=Math.floor(Math.random()*(si3+1));var t2=shuffled2[si3];shuffled2[si3]=shuffled2[ji];shuffled2[ji]=t2;}
    var cells=shuffled2.slice(0,numCells);
    // Make sure at least one cell is NOT on the center axis (asymmetric)
    var hasAsym=false;
    for(var hi=0;hi<cells.length;hi++){if(cells[hi][1]!==Math.floor(gs/2)){hasAsym=true;break;}}
    if(!hasAsym&&cells.length>0){cells[0][1]=0;}
    // Horizontal mirror: flip left-right
    var mirrorCells=cells.map(function(c){return[c[0],gs-1-c[1]];});
    var cellSz=18,pad=4;
    function drawGrid2(cells2,fill){
      var w2=gs*cellSz+pad*2,h2=gs*cellSz+pad*2;
      var svg='<svg width="'+w2+'" height="'+h2+'" viewBox="0 0 '+w2+' '+h2+'">';
      for(var ri=0;ri<gs;ri++)for(var ci=0;ci<gs;ci++){
        var filled=false;
        for(var fi=0;fi<cells2.length;fi++){if(cells2[fi][0]===ri&&cells2[fi][1]===ci){filled=true;break;}}
        svg+='<rect x="'+(pad+ci*cellSz)+'" y="'+(pad+ri*cellSz)+'" width="'+(cellSz-1)+'" height="'+(cellSz-1)+'" fill="'+(filled?fill:'#e2e8f0')+'" stroke="#94a3b8" stroke-width="1" rx="2"/>';
      }
      return svg+'</svg>';
    }
    // Generate wrong answers
    // Wrong 1: vertical flip instead
    var vFlip=cells.map(function(c){return[gs-1-c[0],c[1]];});
    // Wrong 2: 180 rotation
    var rot180=cells.map(function(c){return[gs-1-c[0],gs-1-c[1]];});
    // Wrong 3: shift
    var shifted2=cells.map(function(c){return[c[0],Math.min(gs-1,c[1]+1)];});
    var options=[
      {svg:drawGrid2(mirrorCells,sc2),correct:true},
      {svg:drawGrid2(vFlip,'#f87171'),correct:false},
      {svg:drawGrid2(rot180,'#60a5fa'),correct:false},
      {svg:drawGrid2(shifted2,'#fbbf24'),correct:false}
    ];
    options=shuffle(options);
    var labels=['A','B','C','D'];
    var correctLabel=labels[options.findIndex(function(o){return o.correct;})];
    var flipType=d<=4?'left ↔ right':'top ↔ bottom';
    var dispHtml='<div style="font-size:10px;font-family:var(--px);color:#374151;margin-bottom:8px;text-align:center">What is the <b>mirror image</b> ('+flipType+')?</div>';
    dispHtml+='<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:12px"><div style="text-align:center"><div style="font-size:10px;color:#64748b;font-family:var(--px)">Original</div>'+drawGrid2(cells,sc2)+'</div><div style="font-size:20px">🪞</div><div style="text-align:center"><div style="font-size:10px;color:#64748b;font-family:var(--px)">Mirror?</div></div></div>';
    var gfxCh=options.map(function(o,i){return{html:o.svg,label:labels[i]};});
    return{type:'mirror',key:'mr:'+gs+':'+JSON.stringify(cells),i:'🪞',tts:'What is the mirror image of this pattern?',render:true,display:dispHtml,a:correctLabel,ch:['A','B','C','D'],gfxCh:gfxCh};
  },
  fraction:function(d){
    var sub=d<=3?'identify':d<=6?'addsub':'muldiv';
    if(sub==='identify'){
      var num=rnd(1,d<=2?4:8),den=rnd(num+1,d<=2?6:12);
      var ans=num+'/'+den;
      return{type:'fraction',key:'fi:'+num+'/'+den,i:'🍕',tts:'What fraction is shaded? '+num+' out of '+den+' pieces.',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">What fraction is shaded?</div><div style="font-size:28px;font-family:var(--px);color:#4338ca">'+num+' / '+den+'</div></div>',
        a:ans,ch:shuffle([ans,(num+1)+'/'+den,(num)+'/'+(den+1),(num>1?num-1:num+2)+'/'+den])};
    }
    if(sub==='addsub'){
      var den=rnd(2,d<=5?6:12),a1=rnd(1,den-2),a2=rnd(1,den-a1-1);
      var isAdd=Math.random()<0.5;
      var ans=isAdd?(a1+a2)+'/'+den:a1+'/'+den;
      var n2=isAdd?a2:a1+a2;
      var op=isAdd?'+':'−';
      return{type:'fraction',key:'fa:'+a1+'/'+den+op+n2+'/'+den,i:'🍕',tts:'What is '+a1+'/'+den+' '+op+' '+n2+'/'+den+'?',render:true,
        display:'<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="num-display" style="font-size:18px;color:#4338ca">'+a1+'/'+den+'</div><div class="op-sign">'+op+'</div><div class="num-display" style="font-size:18px;color:#4338ca">'+n2+'/'+den+'</div><div class="op-sign">=</div><div class="blank-box">?</div></div>',
        a:ans,ch:shuffle([ans,(a1+(isAdd?a2:-a2)+1)+'/'+den,(a1+(isAdd?a2:-a2))+'/'+(den+1),(a1+(isAdd?a2:-a2)+2)+'/'+den])};
    }
    // muldiv
    var den=rnd(2,6),n1=rnd(1,den),n2=rnd(1,4);
    var ansNum=n1*n2,ans=ansNum+'/'+den;
    return{type:'fraction',key:'fm:'+n1+'/'+den+'x'+n2,i:'🍕',tts:'What is '+n1+'/'+den+' times '+n2+'?',render:true,
      display:'<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="num-display" style="font-size:18px;color:#4338ca">'+n1+'/'+den+'</div><div class="op-sign">×</div><div class="num-display">'+n2+'</div><div class="op-sign">=</div><div class="blank-box">?</div></div>',
      a:ans,ch:shuffle([ans,(ansNum+1)+'/'+den,(ansNum-1||1)+'/'+den,ansNum+'/'+(den+1)])};
  },
  decimal:function(d){
    var sub=d<=4?'read':d<=6?'addsub':'muldiv';
    if(sub==='read'){
      var whole=rnd(0,d<=4?9:99),frac=rnd(1,99);
      var num=whole+frac/100;
      var ans=num.toFixed(2).replace(/\.?0+$/,'');
      return{type:'decimal',key:'dr:'+num,i:'🔢',tts:'What is the decimal for '+whole+' and '+frac+' hundredths?',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">'+whole+' and '+frac+' hundredths = ?</div></div>',
        a:ans,ch:shuffle([ans,(num+0.1).toFixed(2).replace(/\.?0+$/,''),(num-0.1<0?num+0.2:num-0.1).toFixed(2).replace(/\.?0+$/,''),(num+0.01).toFixed(2).replace(/\.?0+$/,'')])};
    }
    if(sub==='addsub'){
      var a=+(rnd(1,99)/10).toFixed(1),b=+(rnd(1,99)/10).toFixed(1);
      var isAdd=Math.random()<0.5;
      if(!isAdd&&a<b){var tmp=a;a=b;b=tmp;}
      var ans=isAdd?+(a+b).toFixed(1):+(a-b).toFixed(1);
      var op=isAdd?'+':'−';
      return{type:'decimal',key:'da:'+a+op+b,i:'🔢',tts:'What is '+a+' '+op+' '+b+'?',render:true,
        display:'<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="num-display">'+a+'</div><div class="op-sign">'+op+'</div><div class="num-display">'+b+'</div><div class="op-sign">=</div><div class="blank-box">?</div></div>',
        a:String(ans),ch:mkC(ans*10,[ans*10+1,ans*10-1,ans*10+10]).map(function(v){return String(v/10);})};
    }
    var a=+(rnd(1,50)/10).toFixed(1),b=rnd(2,d<=8?4:9);
    var ans=+(a*b).toFixed(1);
    return{type:'decimal',key:'dm:'+a+'x'+b,i:'🔢',tts:'What is '+a+' times '+b+'?',render:true,
      display:'<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="num-display">'+a+'</div><div class="op-sign">×</div><div class="num-display">'+b+'</div><div class="op-sign">=</div><div class="blank-box">?</div></div>',
      a:String(ans),ch:shuffle([String(ans),String(+(ans+0.1).toFixed(1)),String(+(ans-0.1).toFixed(1)||0.1),String(+(ans+0.2).toFixed(1))])};
  },
  percent:function(d){
    var sub=d<=5?'find':d<=7?'ofamount':'change';
    if(sub==='find'){
      var den=rnd(2,10),num=rnd(1,den-1),pct=Math.round(num/den*100);
      var ans=pct+'%';
      return{type:'percent',key:'pf:'+num+'/'+den,i:'📈',tts:'What percent is '+num+' out of '+den+'?',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">'+num+' out of '+den+' = ?%</div></div>',
        a:ans,ch:shuffle([ans,(pct+10)+'%',(pct-10>0?pct-10:pct+20)+'%',Math.round(100/den)+'%'])};
    }
    if(sub==='ofamount'){
      var pct=pick([10,20,25,50,75]),total=rnd(2,d<=6?10:20)*10;
      var ans=Math.round(pct/100*total);
      return{type:'percent',key:'po:'+pct+'%of'+total,i:'📈',tts:'What is '+pct+' percent of '+total+'?',render:true,
        display:'<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="num-display">'+pct+'%</div><div class="op-sign">of</div><div class="num-display">'+total+'</div><div class="op-sign">=</div><div class="blank-box">?</div></div>',
        a:String(ans),ch:mkC(ans,[ans+10,ans-10||10,ans+total/10])};
    }
    var orig=rnd(2,10)*10,pct=pick([10,20,25,50]);
    var isInc=Math.random()<0.5;
    var ans=isInc?Math.round(orig*(1+pct/100)):Math.round(orig*(1-pct/100));
    return{type:'percent',key:'pc:'+orig+':'+pct+':'+(isInc?'inc':'dec'),i:'📈',tts:'A price of '+orig+' is '+(isInc?'increased':'decreased')+' by '+pct+'%. What is the new price?',render:true,
      display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">'+orig+' → '+(isInc?'+':'−')+pct+'% = ?</div></div>',
      a:String(ans),ch:mkC(ans,[ans+10,ans-10,ans+orig/10])};
  },
  ratio:function(d){
    var sub=d<=5?'simple':d<=7?'equivalent':'word';
    if(sub==='simple'){
      var a=rnd(1,d<=4?5:10),b=rnd(1,d<=4?5:10);
      var total=a+b;
      return{type:'ratio',key:'rs:'+a+':'+b,i:'⚖️',tts:'There are '+a+' red and '+b+' blue marbles. What is the ratio of red to blue?',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">'+a+' red 🔴 and '+b+' blue 🔵 marbles.<br>Red to blue ratio?</div></div>',
        a:a+':'+b,ch:shuffle([a+':'+b,b+':'+a,a+':'+total,total+':'+a])};
    }
    if(sub==='equivalent'){
      var a=rnd(1,5),b=rnd(1,5),m=rnd(2,d<=6?3:5);
      var ans=a*m+':'+b*m;
      return{type:'ratio',key:'re:'+a+':'+b+'x'+m,i:'⚖️',tts:'Which ratio is equivalent to '+a+':'+b+'?',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">Which is equivalent to <b>'+a+':'+b+'</b>?</div></div>',
        a:ans,ch:shuffle([ans,(a+1)*m+':'+b*m,a*m+':'+(b+1)*m,(a*m+1)+':'+b*m])};
    }
    var a=rnd(1,5),b=rnd(1,5),total=(a+b)*rnd(2,4);
    var ans=Math.round(total*a/(a+b));
    return{type:'ratio',key:'rw:'+a+':'+b+':'+total,i:'⚖️',tts:'Split '+total+' in ratio '+a+':'+b+'. How many in the first group?',render:true,
      display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">Share '+total+' in ratio '+a+':'+b+'<br>First group = ?</div></div>',
      a:String(ans),ch:mkC(ans,[ans+a,ans-b,ans+1])};
  },
  algebra:function(d){
    var sub=d<=5?'missing':d<=8?'onestepp':'twostep';
    if(sub==='missing'){
      var a=rnd(1,d<=4?10:20),b=rnd(1,d<=4?10:20),ans=a+b;
      var v=rnd(0,2);
      if(v===0)return{type:'algebra',key:'am:'+a+'+?='+ans,i:'🔤',tts:a+' plus what equals '+ans+'?',render:true,
        display:'<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="num-display">'+a+'</div><div class="op-sign">+</div><div class="blank-box" style="border-color:#7c3aed">x</div><div class="op-sign">=</div><div class="num-display" style="background:#f0fdf4;border-color:#86efac">'+ans+'</div></div>',
        a:String(b),ch:mkC(b,[b+1,b+2,ans])};
      if(v===1)return{type:'algebra',key:'am:?+'+b+'='+ans,i:'🔤',tts:'What plus '+b+' equals '+ans+'?',render:true,
        display:'<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="blank-box" style="border-color:#7c3aed">x</div><div class="op-sign">+</div><div class="num-display">'+b+'</div><div class="op-sign">=</div><div class="num-display" style="background:#f0fdf4;border-color:#86efac">'+ans+'</div></div>',
        a:String(a),ch:mkC(a,[a+1,a-1,a+2])};
      var c=rnd(2,d<=4?5:9),ans2=a*c;
      return{type:'algebra',key:'am:'+c+'×?='+ans2,i:'🔤',tts:c+' times what equals '+ans2+'?',render:true,
        display:'<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="num-display">'+c+'</div><div class="op-sign">×</div><div class="blank-box" style="border-color:#7c3aed">x</div><div class="op-sign">=</div><div class="num-display" style="background:#f0fdf4;border-color:#86efac">'+ans2+'</div></div>',
        a:String(a),ch:mkC(a,[a+1,a-1,c])};
    }
    if(sub==='onestepp'){
      var a=rnd(2,d<=6?9:15),b=rnd(1,d<=6?10:20),ans=a+b;
      var ops=[
        {display:'x + '+b+' = '+ans,ans:a,tts:'x plus '+b+' equals '+ans+'. What is x?'},
        {display:'x − '+(a<=b?b:a-b===0?1:a-b)+' = '+(a>b?b:a),ans:a>b?a-b===0?a:a-b:b+(a<b?a:0),tts:''}
      ];
      var op=rnd(0,1);
      if(op===0){
        return{type:'algebra',key:'a1:x+'+b+'='+ans,i:'🔤',tts:'x + '+b+' = '+ans+'. Find x.',render:true,
          display:'<div style="text-align:center"><div style="font-size:16px;font-family:var(--px);color:#374151">x + '+b+' = '+ans+'</div><div style="font-size:11px;color:#7c3aed;margin-top:6px;font-family:var(--px)">x = ?</div></div>',
          a:String(a),ch:mkC(a,[a+1,a-1,b])};
      }
      var c=b+rnd(1,10);
      return{type:'algebra',key:'a1:x-'+b+'='+c,i:'🔤',tts:'x minus '+b+' equals '+c+'. Find x.',render:true,
        display:'<div style="text-align:center"><div style="font-size:16px;font-family:var(--px);color:#374151">x − '+b+' = '+c+'</div><div style="font-size:11px;color:#7c3aed;margin-top:6px;font-family:var(--px)">x = ?</div></div>',
        a:String(b+c),ch:mkC(b+c,[b+c+1,b+c-1,c])};
    }
    // twostep
    var a=rnd(2,6),b=rnd(2,5),c=rnd(1,10),ans=a*b+c;
    return{type:'algebra',key:'a2:'+a+'x+'+c+'='+ans,i:'🔤',tts:a+' times x plus '+c+' equals '+ans+'. Find x.',render:true,
      display:'<div style="text-align:center"><div style="font-size:16px;font-family:var(--px);color:#374151">'+a+'x + '+c+' = '+ans+'</div><div style="font-size:11px;color:#7c3aed;margin-top:6px;font-family:var(--px)">x = ?</div></div>',
      a:String(b),ch:mkC(b,[b+1,b-1,a])};
  },
  negative:function(d){
    var sub=d<=6?'compare':d<=8?'addsub':'muldiv';
    if(sub==='compare'){
      var a=rnd(-10,-1),b=rnd(1,10);
      var ans=a<b?'<':'>';
      return{type:'negative',key:'nc:'+a+':'+b,i:'🌡️',tts:'Is '+a+' greater than or less than '+b+'?',render:true,
        display:'<div style="display:flex;gap:8px;align-items:center;justify-content:center"><div class="num-display" style="font-size:18px;color:#3b82f6">'+a+'</div><div class="blank-box" style="min-width:40px">?</div><div class="num-display" style="font-size:18px;color:#ef4444">'+b+'</div></div>',
        a:ans,ch:['<','>','=']};
    }
    if(sub==='addsub'){
      var a=rnd(-10,-1),b=rnd(-10,10);
      var isAdd=Math.random()<0.5;
      var ans=isAdd?a+b:a-b;
      var op=isAdd?'+':'−';
      return{type:'negative',key:'na:'+a+op+b,i:'🌡️',tts:'What is '+a+' '+(isAdd?'plus':'minus')+' '+b+'?',render:true,
        display:'<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="num-display" style="font-size:18px;color:#3b82f6">'+a+'</div><div class="op-sign">'+op+'</div><div class="num-display" style="font-size:18px;color:#3b82f6">'+b+'</div><div class="op-sign">=</div><div class="blank-box">?</div></div>',
        a:String(ans),ch:mkC(ans,[ans+1,ans-1,ans+2])};
    }
    var a=rnd(-5,-1),b=rnd(2,5);
    var ans=a*b;
    return{type:'negative',key:'nm:'+a+'x'+b,i:'🌡️',tts:'What is '+a+' times '+b+'?',render:true,
      display:'<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="num-display" style="font-size:18px;color:#3b82f6">'+a+'</div><div class="op-sign">×</div><div class="num-display">'+b+'</div><div class="op-sign">=</div><div class="blank-box">?</div></div>',
      a:String(ans),ch:mkC(ans,[ans+1,ans-1,ans+b])};
  },
  probability:function(d){
    var sub=d<=5?'certain':d<=7?'simple':'combined';
    if(sub==='certain'){
      var items=[
        {q:'Rolling a 7 on a standard die',a:'Impossible',w:['Certain','Likely','Unlikely']},
        {q:'The sun will rise tomorrow',a:'Certain',w:['Impossible','Unlikely','Maybe']},
        {q:'Picking a red card from a deck of red cards',a:'Certain',w:['Impossible','Unlikely','Maybe']},
        {q:'Rolling an even number on a die',a:'Likely',w:['Certain','Impossible','Unlikely']},
        {q:'Flipping heads 10 times in a row',a:'Unlikely',w:['Certain','Likely','Impossible']}
      ];
      var item=pick(items);
      return{type:'probability',key:'pc:'+item.q.slice(0,20),i:'🎯',tts:item.q+' — how likely?',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;line-height:2">'+item.q+'<br><b>How likely?</b></div></div>',
        a:item.a,ch:shuffle([item.a].concat(item.w))};
    }
    if(sub==='simple'){
      var total=rnd(4,12),target=rnd(1,total-1);
      var ans=target+'/'+total;
      return{type:'probability',key:'ps:'+target+'/'+total,i:'🎯',tts:'A bag has '+target+' red and '+(total-target)+' blue balls. What is the probability of picking red?',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">'+target+' 🔴 + '+(total-target)+' 🔵 = '+total+' total<br>P(red) = ?</div></div>',
        a:ans,ch:shuffle([ans,(target+1)+'/'+total,target+'/'+(total+1),(total-target)+'/'+total])};
    }
    var coinFlips=rnd(2,3),heads=rnd(1,coinFlips);
    var ansH=Math.pow(2,coinFlips);
    var ans=heads===coinFlips?'1/'+ansH:heads+'/'+ansH;
    return{type:'probability',key:'pb:'+coinFlips+':'+heads,i:'🎯',tts:'Flip '+coinFlips+' coins. P(all heads) = ?',render:true,
      display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">Flip '+coinFlips+' coins<br>P(all heads) = ?</div></div>',
      a:ans,ch:shuffle([ans,'1/'+(ansH+2),heads+'/'+(ansH+1),'1/'+(ansH*2)])};
  },
  statistics:function(d){
    var sub=d<=5?'mean':d<=7?'median':'range';
    var count=d<=4?4:d<=7?5:6;
    var nums=[];for(var i=0;i<count;i++)nums.push(rnd(1,d<=4?10:20));
    nums.sort(function(a,b){return a-b;});
    if(sub==='mean'){
      var sum=nums.reduce(function(a,b){return a+b;},0);
      var ans=sum/nums.length;
      var ansStr=ans===Math.floor(ans)?String(ans):ans.toFixed(1);
      return{type:'statistics',key:'st:mean:'+JSON.stringify(nums),i:'📊',tts:'Find the mean of '+nums.join(', ')+'.',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">Find the <b>mean (average)</b>:</div><div style="display:flex;gap:6px;justify-content:center">'+nums.map(function(n){return '<div class="num-display">'+n+'</div>';}).join('')+'</div></div>',
        a:ansStr,ch:shuffle([ansStr,String(Math.round(ans+1)),String(Math.round(ans-1)||1),String(nums[Math.floor(nums.length/2)])])};
    }
    if(sub==='median'){
      var mid=Math.floor(nums.length/2);
      var ans=nums.length%2===0?(nums[mid-1]+nums[mid])/2:nums[mid];
      var ansStr=ans===Math.floor(ans)?String(ans):ans.toFixed(1);
      return{type:'statistics',key:'st:med:'+JSON.stringify(nums),i:'📊',tts:'Find the median of '+nums.join(', ')+'.',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">Find the <b>median</b>:</div><div style="display:flex;gap:6px;justify-content:center">'+nums.map(function(n){return '<div class="num-display">'+n+'</div>';}).join('')+'</div></div>',
        a:ansStr,ch:shuffle([ansStr,String(nums[0]),String(nums[nums.length-1]),String(Math.round(ans+1))])};
    }
    var ans2=nums[nums.length-1]-nums[0];
    return{type:'statistics',key:'st:rng:'+JSON.stringify(nums),i:'📊',tts:'Find the range of '+nums.join(', ')+'.',render:true,
      display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">Find the <b>range</b> (max − min):</div><div style="display:flex;gap:6px;justify-content:center">'+nums.map(function(n){return '<div class="num-display">'+n+'</div>';}).join('')+'</div></div>',
      a:String(ans2),ch:mkC(ans2,[ans2+1,ans2-1,ans2+2])};
  },
  angle:function(d){
    var sub=d<=4?'identify':d<=7?'measure':'calculate';
    if(sub==='identify'){
      var items=[
        {q:'An angle of 35° is',a:'Acute',w:['Right','Obtuse','Straight']},
        {q:'An angle of 90° is',a:'Right',w:['Acute','Obtuse','Straight']},
        {q:'An angle of 120° is',a:'Obtuse',w:['Acute','Right','Straight']},
        {q:'An angle of 180° is',a:'Straight',w:['Acute','Right','Obtuse']},
        {q:'An angle of 45° is',a:'Acute',w:['Right','Obtuse','Straight']},
        {q:'An angle of 150° is',a:'Obtuse',w:['Acute','Right','Straight']}
      ];
      var item=pick(items);
      return{type:'angle',key:'ai:'+item.q.slice(0,20),i:'📐',tts:item.q+' what type?',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151">'+item.q+'</div></div>',
        a:item.a,ch:shuffle([item.a].concat(item.w))};
    }
    if(sub==='measure'){
      var a=rnd(1,8)*10+pick([5,0]);
      var ans=a+'°';
      return{type:'angle',key:'am:'+a,i:'📐',tts:'Two angles on a straight line. One is '+(180-a)+'°. What is the other?',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">Straight line = 180°<br>One angle = '+(180-a)+'°<br>Other angle = ?</div></div>',
        a:ans,ch:shuffle([ans,(180-a)+'°',(a+10)+'°',(a-10||10)+'°'])};
    }
    var a=rnd(30,70),b=rnd(30,70);
    var ans=a+b;
    return{type:'angle',key:'ac:'+a+'+'+b,i:'📐',tts:'Two angles are '+a+'° and '+b+'°. What is their sum?',render:true,
      display:'<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="num-display">'+a+'°</div><div class="op-sign">+</div><div class="num-display">'+b+'°</div><div class="op-sign">=</div><div class="blank-box">?</div></div>',
      a:String(ans)+'°',ch:shuffle([ans+'°',(ans-10)+'°',(ans+10)+'°',(180-ans)+'°'])};
  },
  area_perimeter:function(d){
    var sub=d<=3?'rectangle':d<=6?'triangle':'compound';
    if(sub==='rectangle'){
      var w=rnd(2,d<=3?6:12),h=rnd(2,d<=3?6:12);
      var isArea=Math.random()<0.5;
      var ans=isArea?w*h:2*(w+h);
      var qText=isArea?'Area = '+w+' × '+h+' = ?':'Perimeter = 2×('+w+'+'+h+') = ?';
      return{type:'area_perimeter',key:'ar:'+w+'x'+h+':'+(isArea?'a':'p'),i:'📐',tts:'A rectangle is '+w+' by '+h+'. Find the '+(isArea?'area':'perimeter')+'.',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">Rectangle: '+w+' × '+h+'<br><b>'+(isArea?'Area':'Perimeter')+'</b> = ?</div><div style="display:inline-block;border:3px solid #4338ca;padding:'+(h*4)+'px '+(w*4)+'px;background:#dbeafe;margin:0 auto"></div></div>',
        a:String(ans),ch:mkC(ans,[ans+2,ans-2||2,w+h])};
    }
    if(sub==='triangle'){
      var b2=rnd(2,d<=5?8:12),h2=rnd(2,d<=5?8:12);
      var isArea=Math.random()<0.6;
      var ans=isArea?Math.round(b2*h2/2):rnd(8,20);
      if(!isArea){var s1=rnd(2,6),s2=rnd(2,6);ans=b2+s1+s2;}
      return{type:'area_perimeter',key:'at:'+b2+'x'+h2+':'+(isArea?'a':'p'),i:'📐',tts:'A triangle has base '+b2+' and height '+h2+'. Find the '+(isArea?'area (half base times height)':'perimeter')+'.',render:true,
        display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">Triangle: base = '+b2+', height = '+h2+'<br><b>'+(isArea?'Area (½ × base × height)':'Perimeter')+'</b> = ?</div></div>',
        a:String(ans),ch:mkC(ans,[ans+1,ans-1||1,ans+2])};
    }
    var w1=rnd(4,8),h1=rnd(3,6),w2=rnd(2,w1-1),h2=rnd(2,h1-1);
    var area=w1*h1-w2*h2;
    return{type:'area_perimeter',key:'acp:'+w1+'x'+h1+'-'+w2+'x'+h2,i:'📐',tts:'An L-shape: big rectangle '+w1+'×'+h1+' with a '+w2+'×'+h2+' cutout. Find the area.',render:true,
      display:'<div style="text-align:center"><div style="font-size:11px;font-family:var(--px);color:#374151;margin-bottom:8px">L-shape: '+w1+'×'+h1+' minus '+w2+'×'+h2+' hole<br><b>Area</b> = ?</div></div>',
      a:String(area),ch:mkC(area,[area+2,area-2||2,w1*h1])};
  }
};

function qTTS(q){return q.tts||'What is the answer?';}
function addStat(type,ok){
  if(!S.stats[type])S.stats[type]={correct:0,total:0};
  S.stats[type].total++;
  if(ok)S.stats[type].correct++;
  else S.weights[type]=(S.weights[type]||1)+2;
}
function genQ(d){
  // 20% chance to pick a custom question if available
  if(S.customQuestions&&S.customQuestions.length>0&&Math.random()<0.2){
    var cq=pick(S.customQuestions);
    return{type:cq.type||'logic',key:'cq:'+cq.q.slice(0,20)+Math.random(),i:cq.icon||'📝',tts:cq.q,render:true,display:'<div style="font-size:11px;font-family:var(--px);color:#374151;white-space:pre-line;line-height:2;text-align:center">'+cq.q+'</div>',a:cq.a,ch:shuffle([cq.a,cq.w1,cq.w2,cq.w3])};
  }
  // Grade-based difficulty scaling
  var grade=S.grade||1;
  // Scale difficulty by grade: higher grades get harder d values
  var gradeDiffScale={1:0.6,2:0.75,3:1,4:1.2,5:1.4,6:1.6};
  var scaledD=Math.max(1,Math.round(d*(gradeDiffScale[grade]||1)));
  // Filter all types by topic enabled, type weight, and generator existence
  var pool=ALL_TYPES.filter(function(t){return S.topicEnabled[t]!==false&&GENS[t]&&S.typeWeights[t]!==0;});
  if(!pool.length)pool=['add','sub'];
  var filtered=pool.filter(function(t){return S.lastTypes.indexOf(t)===-1;});
  var weighted=filtered.length>0?filtered:pool;
  var wts=weighted.map(function(t){var tw=S.typeWeights[t];return tw!==undefined?tw:(S.weights[t]||1);});
  var tot=wts.reduce(function(a,b){return a+b;},0);
  var rv=Math.random()*tot,type=weighted[weighted.length-1];
  for(var i=0;i<weighted.length;i++){rv-=wts[i];if(rv<=0){type=weighted[i];break;}}
  S.lastTypes=[type].concat(S.lastTypes.slice(0,3));
  var caps=[3,5,8,12];
  var diffCap=caps[clamp(S.topicDiffLevel[type]||1,0,3)];
  return GENS[type](Math.min(scaledD,diffCap));
}
function buildQs(d,n){
  // Use session-level + level-level dedup
  var usedKeys=new Set(S.sessionUsedKeys);
  var qs=[],att=0;
  S.lastTypes=[];
  // Auto-refetch when cache runs low
  if(S.onlineMode&&_onlineCache.length<20&&navigator.onLine){
    fetchOnlineQuestions(S.grade,100).then(function(newQs){
      _onlineCache=_onlineCache.concat(newQs);
      var fs=$('fetch-status');if(fs)fs.textContent='Cached: '+_onlineCache.length+' questions ready';
    });
  }
  while(qs.length<n&&att<n*80){
    att++;
    var q;
    if(S.onlineMode&&_onlineCache.length>0){
      q=_onlineCache.shift();
    }else{
      q=genQ(d);
    }
    if(!usedKeys.has(q.key)){
      usedKeys.add(q.key);
      S.sessionUsedKeys.add(q.key);
      // Keep session cache manageable
      if(S.sessionUsedKeys.size>500)S.sessionUsedKeys=new Set(Array.from(S.sessionUsedKeys).slice(-300));
      qs.push(q);
    }
  }
  while(qs.length<n){var fq=genQ(d);if(!usedKeys.has(fq.key)){usedKeys.add(fq.key);qs.push(fq);}else{var _att=0;while(_att<20&&usedKeys.has(fq.key)){fq=genQ(d);_att++;}qs.push(fq);}}
  return qs;
}
function genBossQ(){
  var q,att=0;
  do{q=genQ(diff(S.region,8));att++;}while(S.bossUsedKeys.has(q.key)&&att<30);
  S.bossUsedKeys.add(q.key);
  return q;
}
