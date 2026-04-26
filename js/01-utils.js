var $=function(id){return document.getElementById(id);};
var rnd=function(a,b){return Math.floor(Math.random()*(b-a+1))+a;};
var pick=function(a){return a[Math.floor(Math.random()*a.length)];};
var shuffle=function(a){return[].concat(a).sort(function(){return Math.random()-.5;});};
var clamp=function(v,lo,hi){return Math.max(lo,Math.min(hi,v));};
function el(tag,css,html,attrs){
  css=css||'';html=html||'';attrs=attrs||{};
  var e=document.createElement(tag);
  if(css)e.style.cssText=css;
  if(html)e.innerHTML=html;
  Object.keys(attrs).forEach(function(k){
    var v=attrs[k];
    if(k==='class')e.className=v;
    else if(k.indexOf('on')===0)e.addEventListener(k.slice(2),v);
    else e.setAttribute(k,v);
  });
  return e;
}
