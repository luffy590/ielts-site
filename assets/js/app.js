


;
;

;
;


;
var KEY='ysmp_v1';
var S={};
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
function load(){ try{ var x=localStorage.getItem(KEY); if(x) S=JSON.parse(x); }catch(e){}
  if(!S.user) S.user=null; if(!('guest' in S)) S.guest=false; if(!S.done) S.done={};
  
  ["paid","freeUsed"].forEach(function(k){ delete S[k]; });
  if(!S.fav) S.fav={};  }
load();

var DEVID_KEY='ysmp_devid';
function getDevId(){
  try{ var d=localStorage.getItem(DEVID_KEY); if(d) return d; }catch(e){}
  var id; try{ id=crypto.randomUUID(); }catch(e){ id='d_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
  try{ localStorage.setItem(DEVID_KEY,id); }catch(e){} return id;
}




var askConsentOnce=function(){};
function scheduleAsk(ms){ setTimeout(function(){ askConsentOnce(); }, ms); }

var openPrivacyDoc=function(){};
var renderPrivacyRow=function(){};




var STACK=['home'];
var HAS_HIST=(typeof history!=='undefined' && history && typeof history.pushState==='function');
function _navState(){ return {p:STACK[STACK.length-1], s:STACK.slice()}; }
function navPush(id){
  
  if(STACK[STACK.length-1]===id){ _show(id); return; }
  STACK.push(id);
  if(HAS_HIST){ try{ history.pushState(_navState(),''); }catch(e){ HAS_HIST=false; } }
  _show(id);
}
function go(id){
  
  navPush(id);
}
function _show(id){
  reportPV(id);   
  
  var sec=document.getElementById('sc-'+id);
  if(!sec){ toast('该页面不存在 · 请从首页进入'); return; }
  
  if(CURPAGE==='study'||CURPAGE==='words'||CURPAGE==='conf'||CURPAGE==='confgrp') studyFlush();
  document.querySelectorAll('.sc').forEach(function(s){s.classList.remove('on')});
  sec.classList.add('on');
  
  
  if(id==='study'){ renderStudy(); markStudied(SCENEKEY, DECKI[SCENEKEY]||0); track('study_view',{mod:SCENEKEY}); studyEnter(SCENEKEY); scheduleAsk(8000); }
  if(id==='quiz') startQuiz();
  if(id==='words'){ renderWords(); markStudied(WORDMOD, DECKI[WORDMOD]||0); track('study_view',{mod:WORDMOD}); studyEnter(WORDMOD); scheduleAsk(8000); }   
  
  
  if(id==='conf'){ renderList(); markStudied(listKey(), DECKI[listKey()]||0); track('study_view',{mod:listKey()}); studyEnter(listKey()); scheduleAsk(8000); }
  if(id==='confgrp') renderListGroup();
  if(id==='fav') renderFav();
  if(id==='scenes') renderRail();   
  if(id==='home'){ renderHomeOv(); renderMwideStat(); renderVocabStat(); reportUV('home'); if(!window.__cmTracked){ window.__cmTracked=1; track('community_view',{where:'home'}); } }
  if(id==='mine'){ renderMine(); askConsentOnce(); renderPrivacyRow(); }   
  if(id==='fav-scene') renderFavCat('scene', document.getElementById('favSceneHead'), document.getElementById('favSceneBody'));
  if(id==='fav-word')  renderFavCat('word',  document.getElementById('favWordHead'),  document.getElementById('favWordBody'));
  updateNav(id);
  window.scrollTo(0,0);
  CURPAGE=id;                                           
}
function updateNav(id){
  
  var back = ['home','mine','login'].indexOf(id)<0;
  document.getElementById('backBtn').style.visibility=back?'visible':'hidden';
  var T={home:'雅思提分宝',mine:'我的',scenes:'听力场景课',study:(sceneMod()?sceneMod().name:'听力场景课 · 27天场景词'),quiz:'听说自测',result:'自测结果',login:'登录',fav:'我的收藏',
    'fav-scene':'收藏 · 场景课','fav-word':'收藏 · 专项词汇',
    words:((modOf(WORDMOD)||{}).name||'词汇专项'),     
    
    conf:(listMod()||{}).name||'形近词辨析', confgrp:(listMod()||{}).name||'形近词辨析'};
  document.getElementById('navTitle').textContent=T[id]||'';
  document.getElementById('tabbar').style.display=(id==='home'||id==='mine')?'flex':'none';
  
  var tabs=document.querySelectorAll('.tbi');
  tabs[0].classList.toggle('on',id==='home'); tabs[1].classList.toggle('on',id==='mine');
}
function back(){
  
  if(STACK.length>1){
    if(HAS_HIST){ try{ history.back(); return; }catch(e){ HAS_HIST=false; } }
    STACK.pop(); _show(STACK[STACK.length-1]);
    return;
  }
  STACK=['home']; _show('home');
}

window.addEventListener('popstate',function(e){
  var st=e.state;
  if(st && st.p && st.s && document.getElementById('sc-'+st.p)){
    STACK=st.s.slice(); _show(st.p); return;
  }
  
  var h=(location.hash||'').replace(/^#\/?/,'');
  if(h && h!=='home' && document.getElementById('sc-'+h)){ STACK=['home',h]; _show(h); return; }
  STACK=['home']; _show('home');
});
function toast(m){ var e=document.getElementById('toast'); e.textContent=m; e.classList.add('show');
  clearTimeout(e._t); e._t=setTimeout(function(){e.classList.remove('show')},2000); }

function copyLink(){
  var url=location.href.replace(/#.*$/,'');
  function ok(){ toast('链接已复制'); }
  function fail(){ toast('复制失败，请手动复制地址'); }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(ok).catch(function(){ legacyCopy(url,ok,fail); });
  } else { legacyCopy(url,ok,fail); }
}
function legacyCopy(text,ok,fail){
  try{
    var ta=document.createElement('textarea');
    ta.value=text; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.top='0'; ta.style.left='0'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    var done=document.execCommand('copy');
    document.body.removeChild(ta);
    if(done) ok(); else fail();
  }catch(e){ fail(); }
}




function setRing(sel,pct){ var fg=(typeof sel==='string')?document.querySelector(sel):sel; if(!fg) return;
  var r=parseFloat(fg.getAttribute('r'))||26, C=2*Math.PI*r;
  fg.style.strokeDasharray=C;
  fg.style.strokeDashoffset=C*(1-Math.max(0,Math.min(100,pct))/100); }

function confetti(){ if(document.querySelector('.confetti')) return;
  var box=document.createElement('div'); box.className='confetti';
  var em=['🎉','✨','🎊','⭐','💚','🟢','🔥','📗'];
  for(var i=0;i<28;i++){ var sp=document.createElement('i'); sp.textContent=em[i%em.length];
    sp.style.left='50%'; sp.style.top='42%';
    sp.style.setProperty('--dx',(Math.random()*220-110)+'px');
    sp.style.setProperty('--dy',(Math.random()*-200-30)+'px');
    sp.style.setProperty('--r',(Math.random()*540-270)+'deg');
    sp.style.animationDelay=(Math.random()*.12)+'s';
    box.appendChild(sp); }
  document.body.appendChild(box); setTimeout(function(){ if(box.parentNode) box.remove(); },1450); }

function milestone(gid,complete){ if(!complete) return;
  if(!S._miled) S._miled={}; if(S._miled[gid]) return;
  S._miled[gid]=1; save(); confetti(); }

function cardCount(m){                       
  if(!m) return 0;
  if(m.kind==='scene') return sceneCards(m).length;      
  if(m.list) return m.groups.length;                     
  var n=0; m.groups.forEach(function(g){ n+=Math.ceil(g.rows.length/WPER); }); return n;
}

function modTitle(m){
  if(!m) return '';
  if(m.kind==='scene') return '听力场景课';   
  return m.name;                              
}

function markStudied(key,idx){
  var m=modOf(key); if(!m) return;
  var n=cardCount(m); if(!n) return;
  var i=Math.max(0,Math.min(parseInt(idx,10)||0,n-1));
  if(S.last && S.last.mod===key && S.last.deck===i) return;
  S.last={mod:key,deck:i}; save();
}

function firstOpenCard(m){
  if(!m) return -1;
  if(m.kind==='scene'){
    var sc=sceneCards(m);
    for(var j=0;j<sc.length;j++){
      var c=sc[j], n=0;
      c.rows.forEach(function(r,k){ if((S.done||{})[c.keys[k]]) n++; });
      if(n<c.rows.length) return j;
    }
    return -1;
  }
  if(m.list){                         
    for(var j=0;j<m.groups.length;j++){ var st=m.groups[j],d=0;
      st.rows.forEach(function(r,k){ if((S.done||{})[st._keys[k]]) d++; });
      if(d<st.rows.length) return j; }
    return -1;
  }
  var i=0;
  for(var k=0;k<m.groups.length;k++){ var g=m.groups[k];
    for(var s=0;s<g.rows.length;s+=WPER){
      var part=g.rows.slice(s,s+WPER), keys=g._keys.slice(s,s+WPER), ok=0;
      part.forEach(function(r,j){ if((S.done||{})[keys[j]]) ok++; });
      if(ok<part.length) return i;
      i++; } }
  return -1;
}

function nextLearning(){
  var m=(S.last && S.last.mod) ? modOf(S.last.mod) : null;
  if(m && cardCount(m)){
    var i=Math.max(0,Math.min(parseInt(S.last.deck,10)||0,cardCount(m)-1));
    return {to:m.to, scene:(m.kind==='scene'?m.key:null), mod:(m.kind==='word'?m.key:null),
            deck:i, label:modTitle(m)};
  }
  
  for(var k=0;k<MODS.length;k++){
    var mm=MODS[k], i2=firstOpenCard(mm);
    if(i2<0) continue;
    return {to:mm.to, scene:(mm.kind==='scene'?mm.key:null), mod:(mm.kind==='word'?mm.key:null),
            deck:i2, label:modTitle(mm)};
  }
  return null;
}



function renderHomeOv(){
  var wrap=document.getElementById('homeOvWrap'); if(!wrap) return;
  var done=modDone(), fav=Object.keys(S.fav||{}).length;
  var nl=nextLearning();
  wrap.innerHTML='<div class="ovcard">'
    +'<div class="ovh"><b>学习概览</b></div>'
    +'<div class="ov-stats">'
      +'<div><b>'+done+'</b><span>已听词</span></div>'
      +'<div><b>'+fav+'</b><span>收藏单词</span></div>'
    +'</div>'
    +'<button class="cta" id="homeCta">'+(nl?'▶&nbsp; 继续学习 · '+nl.label:'✓ 全部学完 · 去自测巩固')+'</button>'
    +'</div>';
  var cta=document.getElementById('homeCta');
  if(cta) cta.addEventListener('click',function(){
    var t=nextLearning();
    if(!t){ toast('全部学完啦 · 去自测巩固一下'); go('quiz'); return; }
    
    if(t.mod){ WORDMOD=t.mod; DECKI[t.mod]=t.deck||0; }
    if(t.scene){ SCENEKEY=t.scene; DECKI[t.scene]=t.deck||0; }
    track('continue_click',{to:t.to,mod:t.mod||t.scene||null});   
    go(t.to);
  });
}

function modDone(){ var n=0; MODS.forEach(function(m){ m.groups.forEach(function(g){
  g.rows.forEach(function(r,i){ if((S.done||{}).hasOwnProperty(g._keys[i])) n++; }); }); }); return n; }
function renderRail(){
  var rail=document.getElementById('scRail'); if(!rail) return;
  var m=sceneMod();
  
  if(m && m.kind==='scene' && m.groups.length){
    var h='';
    m.groups.forEach(function(g,gi){
      var done=0, total=g.rows.length;
      g.rows.forEach(function(r,j){ if((S.done||{}).hasOwnProperty(g._keys[j])) done++; });
      var pct=total?Math.round(done/total*100):0;
      var sub=((g.en||'')+' · '+total+' 词').replace(/^ · /,'');
      h+='<div class="stop"><div class="disc d'+((gi+1)%9||9)+'">'+(gi+1)+'</div>'
        +'<div class="card" data-group="'+gi+'"><div class="info"><b>'+g.name+'</b><small>'+sub+'</small></div>'
        +'<div class="sprog"><div class="sbar"><i style="width:'+pct+'%"></i></div>'
        +'<span>已听 '+done+'/'+total+' 词</span></div></div></div>';
    });
    rail.innerHTML=h;
    return;
  }
  rail.innerHTML='<div class="stop"><div class="disc d1">·</div><div class="card"><div class="info"><b>内容制作中</b><small>该模块暂未导入分组词表</small></div></div></div>';
}


function onScene(id){
  var s=SCENES.filter(function(x){return x.id===id})[0];
  var m=modOf(id);
  
  if(m && m.kind==='scene'){ SCENEKEY=id; if(DECKI[id]==null) DECKI[id]=0; track('scene_open',{scene:id,status:'live'}); go('study'); return; }
  if(id==='more'){ toast('更多场景制作中 · 上线后这里直接开课'); return; }
  track('scene_open',{scene:id,status:'wip'});   
  toast('「'+(s?s.name:id)+'」制作中 · 先体验已上线的场景课');
}



var WORDMOD='conf';    
var SCENEKEY='travel'; 


var ICONS={
  headphones:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="6" rx="1.6"/><rect x="17" y="13" width="4" height="6" rx="1.6"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-2-1.4-5-1.6-7-.6V18c2-1 5-.8 7 .6 2-1.4 5-1.6 7-.6V5.4c-2-1-5-.8-7 .6z"/><path d="M12 6v12.6"/></svg>',
  pen:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/><path d="M14 6l3 3"/></svg>',
  
  conf:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="6" width="7" height="12" rx="2"/><rect x="13.5" y="6" width="7" height="12" rx="2"/><path d="M10.5 12h3"/></svg>',
  
  swapr:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.6" y="7.2" width="9" height="9.6" rx="2.2"/><path d="M14.8 12h4.6M16.8 9.4l2.6 2.6-2.6 2.6"/></svg>',
  swapw:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17.8 7.2 14.9 16 6.2 18 8.2 9.3 16.9z"/></svg>'
};

var WORD_MODULES=[
  
  {key:'conf', name:'形近词辨析', en:'CONFUSABLES', unit:'组', ic:'conf', list:true, to:'conf'},
  
  
  {key:'synr', name:'阅读同义替换', en:'SYNONYMS · READING', unit:'组', ic:'swapr', list:true, to:'conf'},
  {key:'synw', name:'写作同义替换', en:'SYNONYMS · WRITING', unit:'组', ic:'swapw', list:true, to:'conf'}
];

var MODS=[];

SCENES.forEach(function(s){
  var gs=(typeof MODULE_GROUPS!=='undefined') && MODULE_GROUPS[s.id];
  if(!gs || !gs.length) return;
  MODS.push({key:s.id,kind:'scene',no:s.no,name:s.name,short:s.name.split(' · ')[0],
             en:s.en||'',unit:'组',ic:ICONS.headphones,c:'#3370ff',to:'study',groups:gs});
});

WORD_MODULES.forEach(function(w){
  var gs=((typeof MODULE_GROUPS!=='undefined') && MODULE_GROUPS[w.key]) || [];
  MODS.push({key:w.key,kind:'word',name:w.name,en:w.en,unit:w.unit,list:!!w.list,
             ic:ICONS[w.ic]||ICONS.book,c:'#3370ff',to:w.to||'words',groups:gs});
});

['synr','synw'].forEach(function(key){
  var cats=synCats(key);
  if(!cats.length) return;
  var m=MODS.filter(function(x){ return x.key===key; })[0];
  if(!m) return;
  var rank=function(name){ var i=cats.indexOf(synInfo(name,key).cat); return i<0?cats.length:i; };
  m.groups=m.groups.map(function(g,i){ return {g:g,i:i}; }).sort(function(a,b){
    return (rank(a.g.name)-rank(b.g.name)) || (a.i-b.i);
  }).map(function(x){ return x.g; });
});

function buildKeys(){
  MODS.forEach(function(m){
    var total={}, seen={};
    m.groups.forEach(function(g){ g.rows.forEach(function(r){
      var w=norm(r[0]); total[w]=(total[w]||0)+1; }); });
    m.groups.forEach(function(g){
      g._keys=[];
      g.rows.forEach(function(r){
        var w=norm(r[0]); seen[w]=(seen[w]||0)+1;
        g._keys.push(m.key+'/'+w+(total[w]>1? '/'+seen[w] : ''));
      });
    });
  });
}

function migrateKeys(){
  var all={};
  MODS.forEach(function(m){ m.groups.forEach(function(g){
    g.rows.forEach(function(r,i){ (all[norm(r[0])]=all[norm(r[0])]||[]).push(g._keys[i]); }); }); });
  var changed=false;
  ['done','fav'].forEach(function(field){
    var obj=S[field]; if(!obj) return;
    Object.keys(obj).forEach(function(k){
      if(k.indexOf('/')>=0) return;                 
      (all[k]||[]).forEach(function(nk){ if(!obj[nk]) obj[nk]=obj[k]; });
      delete obj[k]; changed=true;
    });
  });
  if(changed) save();
}
buildKeys();
migrateKeys();
function modOf(k){ return MODS.filter(function(m){return m.key===k})[0]; }
function sceneMod(){ return modOf(SCENEKEY); }
function sceneGroups(){ var m=sceneMod(); return m?m.groups:[]; }

function sceneSubgroups(g){
  var out=[], last=null;
  g.rows.forEach(function(r,i){
    var name=r[6]||g.name;
    if(!last || last.name!==name){
      last={name:name,rows:[],keys:[]};
      out.push(last);
    }
    last.rows.push(r);
    last.keys.push(g._keys[i]);
  });
  return out;
}
function sceneCards(m){
  if(!m) return [];
  var out=[];
  m.groups.forEach(function(g,gi){
    sceneSubgroups(g).forEach(function(s,si){
      out.push({idx:out.length,name:s.name,rows:s.rows,keys:s.keys,gi:gi,si:si,
                dayName:g.name,dayEn:g.en||''});
    });
  });
  return out;
}

function rerenderMod(key){
  var m=modOf(key); if(!m) return;
  if(m.kind==='scene'){ SCENEKEY=key; renderStudy(); }
  else if(m.to==='conf'){ WORDMOD=key; if(CURPAGE==='confgrp') renderListGroup(); else renderList(); }   
  else { WORDMOD=key; renderWords(); }
}


var audio=null, audioSeq=0, ttsSeq=0;
function stopAudio(){
  audioSeq++; ttsSeq++;                
  if(audio){ audio.pause(); audio.currentTime=0; }
  if(playingEl){ playingEl.classList.remove('playing'); playingEl=null; }
  
  try{ if('speechSynthesis' in window) speechSynthesis.cancel(); }catch(e){}
}
function norm(t){ return String(t).replace(/\s*\/\s*/g,', ').replace(/[▪◇]/g,''); }

function playText(key,el,onDone,text,ctx){
  if(!audio) audio=new Audio();
  stopAudio();
  var seq=++audioSeq, settled=false;
  function fallback(){
    if(settled||seq!==audioSeq) return;
    settled=true;
    if(playingEl){ playingEl.classList.remove('playing'); playingEl=null; }
    if(text) tts(text,el,onDone,key,ctx); else if(onDone) onDone();
  }
  audio.onended=function(){
    if(seq!==audioSeq) return;
    settled=true; audio.currentTime=0;
    if(playingEl){ playingEl.classList.remove('playing'); playingEl=null; }
    if(onDone) onDone();
  };
  audio.onerror=fallback;
  if(!AUDIO[key]){ fallback(); return; }
  audio.src=AUDIO[key]; playingEl=el; if(el) el.classList.add('playing');
  var p=audio.play();
  
  function playedReal(){ track('word_play',{mod:(ctx&&ctx.mod)||null,word:key,audio:'real'}); }
  if(p&&p.then) p.then(playedReal)['catch'](fallback); else playedReal();
}

var PLAYCTX=null;

function say(text,key,el,onDone){
  var ctx={mod:(PLAYCTX&&PLAYCTX.mod)||null};
  playText(key,el,onDone,text,ctx);
}
function tts(text,el,onDone,key,ctx){
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){
    
    if(onDone) onDone();
    toast('当前环境不支持朗读 · 可看中文释义');
    return;
  }
  stopAudio();
  var seq=++ttsSeq;
  var u=new SpeechSynthesisUtterance(text);
  u.lang='en-GB'; u.rate=0.92;
  playingEl=el; if(el) el.classList.add('playing');
  u.onend=function(){ if(seq!==ttsSeq) return; if(playingEl){playingEl.classList.remove('playing');} playingEl=null; if(onDone) onDone(); };
  
  u.onerror=function(){ if(seq!==ttsSeq) return; if(playingEl){playingEl.classList.remove('playing');} playingEl=null;
    toast('朗读失败 · 可看中文释义'); };
  track('word_play',{mod:(ctx&&ctx.mod)||null,word:key||text,audio:'tts'});   
  speechSynthesis.speak(u);
}
var playingEl=null;

function toggleFav(key,modKey){
  if(!S.fav) S.fav={};
  if(S.fav[key]){ delete S.fav[key]; toast('已取消收藏'); }
  else { S.fav[key]=1; toast('已收藏 · 可在「我的 › 我的收藏」查看'); }
  save();
  
  if(modKey) rerenderMod(modKey);
  else if(document.getElementById('sc-words').classList.contains('on')) renderWords();
  else renderStudy();
  renderMine();   
}

function unmarkWord(key,en){
  if(!(S.done||{}).hasOwnProperty(key)) return false;
  delete S.done[key]; save();
  toast('已取消：'+en);
  return true;
}


var DECKI={};

function buildDeck(host, items, opt){
  opt=opt||{};
  var key=opt.key, n=items.length;
  if(!n){ host.innerHTML=''; return; }
  if(opt.reset) DECKI[key]=0;
  var i=Math.min(Math.max(DECKI[key]||0,0),n-1);
  DECKI[key]=i;
  var h=(opt.hideBar?'':'<div class="deckbar">'
    +'<div class="dprog"><i style="width:'+(((i+1)/n)*100).toFixed(1)+'%"></i></div>'
    +'<span class="dpos">第 '+(i+1)+' / '+n+' '+opt.unit+'</span>'
    +'</div>')
    +'<div class="deck"><div class="deckin" style="transform:translateX(-'+(i*100)+'%)">';
  items.forEach(function(it){ h+=it.html; });
  h+='</div></div>';
  host.innerHTML=h;
  host.setAttribute('data-deck',key);
  host.setAttribute('data-i',i);
  host.setAttribute('data-n',n);
  host.setAttribute('data-gis',(opt.gis||[]).join(','));
  if(opt.bind) opt.bind(host);
  return i;
}
function deckGo(key,d){
  var host=document.querySelector('.decken[data-deck="'+key+'"]');
  if(!host) return false;
  var n=parseInt(host.getAttribute('data-n'),10)||1;
  var i=(parseInt(host.getAttribute('data-i'),10)||0)+d;
  i=Math.max(0,Math.min(n-1,i));
  
  if(i===(parseInt(host.getAttribute('data-i'),10)||0)) return false;
  stopAudio();                       
  var dm=modOf(key);
  var gis=(host.getAttribute('data-gis')||'').split(',');
  var target=(dm && dm.kind==='scene' && gis[i]!==undefined) ? parseInt(gis[i],10) : i;
  DECKI[key]=target;
  markStudied(key,target);
  rerenderMod(key);
  window.scrollTo(0,0);              
  return true;
}

function rowHtml(r,key,opt){
  opt=opt||{};
  var ipa=r[2]||'', pos=r[3]||'', coll=r[4]||'', note=r[5]||'';
  var ext=[];
  if(coll) ext.push('<span class="exti">'+coll+'</span>');
  if(note) ext.push('<span class="exti">'+note+'</span>');
  var ok=(S.done||{}).hasOwnProperty(key);
  var fav=(opt.fav!==undefined)? !!opt.fav : (S.fav||{}).hasOwnProperty(key);
  return '<div class="rw'+(ok?' ok':'')+(fav?' fav':'')+((ipa||pos||ext.length)?' dict':'')
    +'" data-k="'+key+'" data-en="'+r[0]+'"'+(opt.mk?' data-mk="'+opt.mk+'"':'')+'>'
    +'<span class="spk"></span>'
    +'<span class="wd"><span class="w">'+r[0]+'</span>'
    +(ipa?'<span class="ipa">'+ipa+'</span>':'')
    +(pos?'<span class="pos">'+pos+'</span>':'')
    +'<span class="cn">'+r[1]+'</span>'
    +(ext.length?'<span class="ext">'+ext.join(' ')+'</span>':'')
    +'</span>'
    +'<span class="ck" title="点 ✓ 可取消「已听」">✓</span>'
    +'<span class="fv'+(fav?' on':'')+'" data-fav="'+key+'" title="'
    +(opt.favTitle||'收藏')+'">'+(fav?'★':'☆')+'</span></div>';
}
function cardRows(rows,keys,opt){
  opt=opt||{};
  
  var h='', lastSub='';
  rows.forEach(function(r,i){
    var sub=r[6]||'';
    if(!opt.skipSub && sub && sub!==lastSub) h+='<div class="subh">'+sub+'</div>';
    lastSub=sub;
    h+=rowHtml(r,keys[i]);
  });
  return h;
}

function bindRows(host){
  if(!host) return;   
  var dk=host.getAttribute('data-deck');
  host.querySelectorAll('.rw').forEach(function(row){
    var key=row.getAttribute('data-k'), en=row.getAttribute('data-en');
    row.addEventListener('click',function(e){
      PLAYCTX={mod:dk};   
      if(e.target.closest('.fv')){ toggleFav(key,dk); return; }
      if(e.target.closest('.ck')){                 
        if(unmarkWord(key,en)){ rerenderMod(dk); renderMine(); }
        else toast('先点词听一遍 · 听完自动记「已听」');
        return;
      }
      markStudied(dk, DECKI[dk]||0);   
      var ok=(S.done||{}).hasOwnProperty(key);
      say(en,norm(en),row,function(){   
        if(ok) return;
        if(!S.done) S.done={};
        S.done[key]=1; save();
        track('word_done',{mod:dk,word:key});   
        scheduleAsk(1200);                       
        rerenderMod(dk);
        renderMine();
        var grpDone=false, grpTotal=0;
        try{
          var dm=modOf(dk), grp=null, gid=dk;
          if(dm && dm.kind==='scene'){
            grp=sceneCards(dm)[DECKI[dk]||0]||null;
            if(grp) gid=dk+':'+grp.gi+':'+grp.si;
          }else if(dm){
            var gis=(host.getAttribute('data-gis')||'').split(',').map(Number);
            var gi=gis[DECKI[dk]||0];
            grp=dm.groups[gi]||null;
            gid=dk+':'+gi;
          }
          if(grp){
            grpTotal=grp.rows.length;
            grpDone=grp.rows.every(function(r,j){return (S.done||{})[grp.keys ? grp.keys[j] : grp._keys[j]];});
            milestone(gid, grpDone);
          }
        }catch(err){}
        var listed=(dk==='conf'||dk==='synr'||dk==='synw');
        toast((listed&&grpDone)?('本组已听 '+grpTotal+'/'+grpTotal+' 词'):('已听：'+en));
      });
    });
  });
}
function cardHead(name,en,cnt,ok,src){
  
  var done=ok>=cnt;
  return '<h3>'
    +(name?'<span class="ht">'+name+'</span>':'')
    +'<span class="cok'+(done?' done':'')+'">'+(done?'✓ 已全部听完':(ok+' / '+cnt+' 已听'))+'</span>'
    +(en?'<span class="en">'+en+'</span>':'')+'</h3>';
}

function syncStudyDeckHeight(){
  var host=document.getElementById('studyBody');
  if(!host) return;
  var deck=host.querySelector('.deck');
  if(!deck) return;
  var i=parseInt(host.getAttribute('data-i'),10)||0;
  var card=deck.querySelectorAll('.card2')[i];
  if(card) deck.style.height=Math.ceil(card.getBoundingClientRect().height)+'px';
}
function renderStudy(reset){
  var host=document.getElementById('studyBody');
  var m=sceneMod(); if(!m) return;
  var cards=sceneCards(m);
  if(!cards.length){ host.innerHTML=''; return; }
  if(reset) DECKI[m.key]=0;
  var flat=Math.max(0,Math.min(parseInt(DECKI[m.key],10)||0,cards.length-1));
  DECKI[m.key]=flat;
  var cur=cards[flat], st=m.groups[cur.gi];
  var dayCards=cards.filter(function(c){ return c.gi===cur.gi; });
  var local=0;
  for(var j=0;j<dayCards.length;j++){ if(dayCards[j].idx===flat){ local=j; break; } }
  var allDone=0, tot=0;
  st.rows.forEach(function(r,i){
    tot++;
    if((S.done||{}).hasOwnProperty(st._keys[i])) allDone++;
  });

  
  var ttl=document.getElementById('studyName');
  if(ttl) ttl.textContent=st.name;

  
  var items=[];
  dayCards.forEach(function(c,ci){
    var ok=0;
    c.rows.forEach(function(r,i){ if((S.done||{}).hasOwnProperty(c.keys[i])) ok++; });
    items.push({html:'<div class="card2">'+cardHead('','',c.rows.length,ok,'real')
      +cardRows(c.rows,c.keys,{skipSub:true})+'</div>'});
  });
  host.innerHTML='<div class="deck"><div class="deckin" style="transform:translateX(-'+(local*100)+'%)">'
    +items.map(function(it){ return it.html; }).join('')+'</div></div>';
  host.setAttribute('data-deck',m.key);
  host.setAttribute('data-i',local);
  host.setAttribute('data-n',dayCards.length);
  host.setAttribute('data-gis',dayCards.map(function(c){ return c.idx; }).join(','));
  syncStudyDeckHeight();
  bindRows(host);
  var pg=document.getElementById('studyPager');
  if(pg) pg.innerHTML=pagerHtml(local,dayCards.length,'组',m.key);
  var ch='';
  dayCards.forEach(function(c){
    ch+='<span class="wchip'+(c.idx===flat?' on':'')+'" data-chip="'+c.idx+'">'+c.name+'<i>'+c.rows.length+'</i></span>';
  });
  var chipBox=document.getElementById('studyChips');
  chipBox.innerHTML=ch;
  
  var activeChip=chipBox.querySelector('.wchip.on');
  if(activeChip){
    var cr=chipBox.getBoundingClientRect(), ar=activeChip.getBoundingClientRect(), pad=8;
    if(ar.left<cr.left+pad) chipBox.scrollLeft-=cr.left+pad-ar.left;
    else if(ar.right>cr.right-pad) chipBox.scrollLeft+=ar.right-cr.right+pad;
  }
  var th='';
  dayCards.forEach(function(c){
    var ok=0;
    c.rows.forEach(function(r,i){ if((S.done||{}).hasOwnProperty(c.keys[i])) ok++; });
    th+='<i class="'+(ok>=c.rows.length?'done':'')+'" style="width:'+((ok/c.rows.length)*100).toFixed(0)+'%"></i>';
  });
  document.getElementById('stopTrack').innerHTML=th;
  document.getElementById('studyCnt').textContent='已听 '+allDone+' / '+tot+' 词';
}
window.addEventListener('resize', syncStudyDeckHeight);


var WPER=10;   

function tint(hex,a){
  var h=String(hex).replace('#','');
  if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  var n=parseInt(h,16);
  return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';
}

function emptyWordsHtml(m){
  return '<div class="card2 phcard"><h3><span class="ht">内容制作中</span><span class="cok">版式已就绪</span></h3>'
    +'<div class="phbody"><ul class="phlist">'
    +'<li><b>'+m.name+'</b><span>词表制作中 —— 内容进了对应模块 CSV 后这一屏就会自动变成卡组</span></li>'
    +'</ul></div></div>';
}

function listKey(){
  
  var m=modOf(WORDMOD);
  return (m && m.to==='conf') ? WORDMOD : 'conf';
}
function listMod(){ return modOf(listKey())||modOf('conf'); }
function confInfo(name){                      
  var all=(typeof CONF_INFO!=='undefined')?CONF_INFO:{};
  return all[name]||{};
}

function synInfo(name,key){
  var k=key||listKey();
  var all=(k==='synw')
    ? ((typeof SYNW_INFO!=='undefined')?SYNW_INFO:{})
    : ((typeof SYN_INFO!=='undefined')?SYN_INFO:{});
  return all[name]||{};
}

function synCats(key){
  var k=key||listKey();
  if(k==='synw') return (typeof SYNW_CATS!=='undefined')?SYNW_CATS:[];
  if(k==='synr') return (typeof SYN_CATS!=='undefined')?SYN_CATS:[];
  return [];
}
function listInfo(name){
  var k=listKey();
  return (k==='synr'||k==='synw') ? synInfo(name,k) : confInfo(name);
}

function groupProg(g){
  var total=(g&&g.rows)?g.rows.length:0, done=0;
  if(g&&g.rows) g.rows.forEach(function(r,j){ if((S.done||{})[g._keys[j]]) done++; });
  return {done:done,total:total,complete:total>0&&done===total};
}

function confWordHtml(w,hl){
  var s=String(w), v=(hl||{})[w];
  if(!v) return '<span class="cw">'+s+'</span>';
  
  var parts=Array.isArray(v)&&Array.isArray(v[0])?v:[v], ranges=[];
  parts.forEach(function(part){
    var seg=Array.isArray(part)?String(part[0]==null?'':part[0]):String(part||'');
    var i=Array.isArray(part)&&part[1]!=null?parseInt(part[1],10):s.indexOf(seg);
    if(seg&&i>=0&&i+seg.length<=s.length&&s.slice(i,i+seg.length)===seg) ranges.push([i,i+seg.length]);
  });
  if(!ranges.length) return '<span class="cw">'+s+'</span>';
  ranges.sort(function(a,b){ return a[0]-b[0]; });
  var out='', last=0;
  ranges.forEach(function(r){
    if(r[0]<last) return;
    out+=s.slice(last,r[0])+'<em>'+s.slice(r[0],r[1])+'</em>'; last=r[1];
  });
  return '<span class="cw">'+out+s.slice(last)+'</span>';
}
function confWordsHtml(g,info){
  return g.rows.map(function(r){ return confWordHtml(r[0],info.hl); }).join('');
}

function listGroups(){ var m=listMod(); return (m&&m.groups)?m.groups:[]; }

function synWordsHtml(g){
  return g.rows.map(function(r,i){
    var arrow=i?'<svg class="swar" viewBox="0 0 24 24"><path d="M7 17 17 7M9.7 7H17v7.3"/></svg>':'';
    return '<span class="swu">'+arrow+'<span class="swc'+(i===0?' head':'')+'">'+r[0]+'</span></span>';
  }).join('');
}
function synTitleHtml(g,info){                
  return '「'+(info.title||g.name)+'」<b class="synwd">'+g.rows[0][0]+'</b>';
}
function cfNoHtml(n,total){                    
  return '<span class="cfno">'+n+' / '+total+'</span>';
}
function listCardHtml(g,i,no,total){
  var key=listKey(), syn=(key==='synr'||key==='synw'), info=listInfo(g.name);
  var gp=groupProg(g);
  var head, title;
  if(syn){
    head='<div class="cfhead swband"><span class="swchips">'+synWordsHtml(g)+'</span>'+cfNoHtml(no,total)+'</div>';
    title=synTitleHtml(g,info);
  }else{
    head='<div class="cfhead"><span class="cfws">'+confWordsHtml(g,info)+'</span>'+cfNoHtml(no,total)+'</div>';
    title=info.title||g.name;
  }
  
  return '<div class="cfcard'+(syn?' syncard':'')+'" data-cf="'+(i+1)+'">'+head
    +'<div class="cfbody"><h4'+(syn?' class="synh4"':'')+'>'+title+'</h4>'
    +(info.note?'<p class="cfdesc">'+info.note+'</p>':'')
    +'<div class="cffoot"><span class="cftag">'+(syn?(synKind()+' · '+(info.cat||'同义替换')):(info.tag||'形近词'))+'</span>'
      +'<span class="cfn cfprog'+(gp.complete?' done':'')+'">'+(gp.complete?'✓ 已听 '+gp.total+'/'+gp.total:gp.done+'/'+gp.total+' 已听')+'</span>'
      +'<span class="cfgo'+(syn?' syn':'')+'">查看 ›</span></div>'
    +'</div></div>';
}

var SYNCAT='';                         

var SYNPAGE=0, SYNPAGE_KEY='', SYN_PAGE_SIZE=20;
function synKind(){                    
  var m=listMod();
  return (m&&m.name)?m.name.replace('同义替换',''):'阅读';
}
function synCatList(){
  var set=synCats();
  if(!set.length) return [];
  var groups=listGroups();
  var cats=set.map(function(c){
    var list=groups.filter(function(g){ return listInfo(g.name).cat===c; });
    return {name:c, groups:list, words:list.reduce(function(n,g){ return n+g.rows.length; },0)};
  }).filter(function(c){ return c.groups.length; });
  
  var rest=groups.filter(function(g){ return set.indexOf(listInfo(g.name).cat)<0; });
  if(rest.length) cats.push({name:'其它', groups:rest, words:rest.reduce(function(n,g){ return n+g.rows.length; },0)});
  return cats;
}
function synActiveCat(cats,groups){
  if(!cats.length) return null;
  var hit=cats.filter(function(c){ return c.name===SYNCAT; })[0];
  if(hit) return hit;
  
  var i=Math.max(0,Math.min(parseInt(DECKI[listKey()],10)||0, groups.length-1));
  var g=groups[i];
  return (g && cats.filter(function(c){ return c.groups.indexOf(g)>=0; })[0]) || cats[0];
}

var CONFCAT='全部', CONFPAGE=0, CONF_PAGE_SIZE=20;
var CONF_CATS=['全部','拼写','词缀','同音','其他'];
function confCat(g){
  var tag=(confInfo(g.name).tag||'').trim();
  if(['换字母','换字母 · 词性','拼写型','一个字母之差','易混拼写'].indexOf(tag)>=0) return '拼写';
  if(['词缀派生','同根异义'].indexOf(tag)>=0) return '词缀';
  if(['同音型','同音近形'].indexOf(tag)>=0) return '同音';
  return '其他';
}
function confMatch(g){
  return CONFCAT==='全部'||confCat(g)===CONFCAT;
}
function confCatChips(groups){
  var counts={}; CONF_CATS.forEach(function(c){ counts[c]=0; });
  groups.forEach(function(g){ counts[confCat(g)]++; }); counts['全部']=groups.length;
  return CONF_CATS.map(function(name){ return {name:name,n:counts[name]||0}; })
    .filter(function(c){ return c.name==='全部'||c.n; });
}
function confPagerHtml(page,pages,total){
  return pagerHtml(page-1,pages,'页','cfpage');
}

function listBodyHtml(groups,keep,total,offset){
  var list=keep||groups;
  total=total||list.length;
  offset=offset||0;
  return list.map(function(g,i){ return listCardHtml(g, groups.indexOf(g), offset+i+1, total); }).join('');
}
function renderList(){
  var m=listMod(), groups=listGroups();
  var tot=0,done=0,doneGroups=0;
  groups.forEach(function(g){ tot+=g.rows.length;
    g.rows.forEach(function(r,i){ if((S.done||{}).hasOwnProperty(g._keys[i])) done++; }); });
  groups.forEach(function(g){ if(groupProg(g).complete) doneGroups++; });
  var intro=document.getElementById('cfIntro');
  intro.style.background=m.c; intro.style.boxShadow='none';
  var introSub=(groups.length
    ? ('共 '+groups.length+' 组 · 整组已听 '+doneGroups+' 组 · 已听 '+done+' / '+tot+' 词')
    : '词表制作中 · 上线后这里是一组一张卡');
  intro.innerHTML='<h2>'+m.name+'</h2>'
    +'<p>'+introSub+'</p>';
  var host=document.getElementById('cfList');
  var chips=document.getElementById('cfChips');
  var listPager=document.getElementById('cfListPager');
  if(!groups.length){
    if(chips){ chips.innerHTML=''; chips.style.display='none'; }
    if(listPager) listPager.innerHTML='';
    host.innerHTML=emptyWordsHtml(m); return;
  }
  
  var cats=synCatList(), act=synActiveCat(cats,groups), shown=groups;
  if(cats.length){
    SYNCAT=act.name;
    shown=act.groups;
    if(chips){ chips.style.display=''; chips.innerHTML=cats.map(function(c){
      return '<span class="wchip'+(c===act?' on':'')+'" data-scat="'+c.name+'">'+c.name+'<i>'+c.groups.length+'</i></span>';
    }).join(''); }
    
    var pageKey=listKey()+'|'+act.name;
    if(SYNPAGE_KEY!==pageKey){ SYNPAGE=0; SYNPAGE_KEY=pageKey; }
    var pages=Math.max(1,Math.ceil(shown.length/SYN_PAGE_SIZE));
    if(SYNPAGE<=0){
      var lastIndex=Math.max(0,Math.min(parseInt(DECKI[listKey()],10)||0,groups.length-1));
      var lastPos=shown.indexOf(groups[lastIndex]);
      SYNPAGE=lastPos>=0?Math.floor(lastPos/SYN_PAGE_SIZE)+1:1;
    }
    SYNPAGE=Math.max(1,Math.min(SYNPAGE,pages));
    var start=(SYNPAGE-1)*SYN_PAGE_SIZE, pageList=shown.slice(start,start+SYN_PAGE_SIZE);
    host.innerHTML=pageList.length?listBodyHtml(groups,pageList,shown.length,start)
      : '<div class="cfempty">这一分类暂时没有词组</div>';
    if(listPager) listPager.innerHTML=pagerHtml(SYNPAGE-1,pages,'页','synpage');
  }else{
    
    if(chips){
      chips.style.display='';
      chips.innerHTML=confCatChips(groups).map(function(c){
        return '<span class="wchip'+(c.name===CONFCAT?' on':'')+'" data-ccat="'+c.name+'">'+c.name+'<i>'+c.n+'</i></span>';
      }).join('');
    }
    var filtered=groups.filter(confMatch);
    var pages=Math.max(1,Math.ceil(filtered.length/CONF_PAGE_SIZE));
    if(CONFPAGE<=0){
      var lastIndex=Math.max(0,Math.min(parseInt(DECKI[listKey()],10)||0,groups.length-1));
      var lastPos=filtered.indexOf(groups[lastIndex]);
      CONFPAGE=lastPos>=0?Math.floor(lastPos/CONF_PAGE_SIZE)+1:1;
    }
    CONFPAGE=Math.max(1,Math.min(CONFPAGE,pages));
    var start=(CONFPAGE-1)*CONF_PAGE_SIZE, pageList=filtered.slice(start,start+CONF_PAGE_SIZE);
    host.innerHTML=pageList.length?listBodyHtml(groups,pageList,filtered.length,start)
      : '<div class="cfempty">这一分类暂时没有词组</div>';
    if(listPager) listPager.innerHTML=confPagerHtml(CONFPAGE,pages,filtered.length);
  }
}

function cfWordBlockHtml(r,key,info,modKey){
  var d=(info.words||{})[r[0]];
  if(typeof d==='string') d={note:d};      
  d=d||{};
  var ok=(S.done||{}).hasOwnProperty(key), fav=(S.fav||{}).hasOwnProperty(key);
  
  var lv=d.lv?'<span class="lv">'+d.lv+'</span>':'';
  var h='<div class="cfblock">'
    +'<div class="rw cfdict dict'+(lv?' lvr':'')+(ok?' ok':'')+(fav?' fav':'')+'" data-k="'+key+'" data-en="'+r[0]+'" data-mk="'+(modKey||listKey())+'">'
      +'<span class="spk"></span>'
      +'<span class="wd">'+lv+confWordHtml(r[0],info.hl)
        +(r[2]?'<span class="ipa">'+r[2]+'</span>':'')
        +(r[3]?'<span class="pos">'+r[3]+'</span>':'')+'<span class="cn">'+r[1]+'</span></span>'
      +'<span class="ck" title="点 ✓ 可取消「已听」">✓</span>'
      +'<span class="fv'+(fav?' on':'')+'" data-fav="'+key+'" title="收藏">'+(fav?'★':'☆')+'</span>'
    +'</div>';
  if(d.coll&&d.coll.length){
    h+='<p class="cfcol"><i>▸</i><span class="cfcx">'+d.coll.map(function(c){
      return '<b>'+c[0]+'</b>'+(c[1]?'<span>'+c[1]+'</span>':''); }).join('<em class="cfsemi">；</em>')+'</span></p>';
  }
  
  if(d.en) h+='<p class="cfeg"><span class="cflab">例句</span>'
    +'<span class="cfegt">'+d.en+'</span></p>';
  if(d.cn) h+='<p class="cfcn2"><span class="cflab gray">译文</span><span class="cfcnt">'+d.cn+'</span></p>';
  if(d.note) h+='<p class="cfnote">'+d.note+'</p>';
  return h+'</div>';
}

function cfMnHtml(list,title){
  if(!list||!list.length) return '';
  return '<div class="cfmn"><div class="cfmnh">'+(title||'记忆口诀')+'</div><ol class="cfmnl">'
    +list.map(function(s,i){ return '<li><span class="cfmnn">'+(i+1)+'</span><span>'+s+'</span></li>'; }).join('')
    +'</ol></div>';
}

function synPartHead(no,title){
  return '<div class="synsec"><span class="synsecn">'+no+'</span>'
    +'<span class="synsect">'+title+'</span></div>';
}
function synPhrasesHtml(list){
  if(!list||!list.length) return '';
  return synPartHead(2,'换短语 · 由词到词组')
    +'<div class="synphrases">'+list.map(function(p){
      return '<div class="synph"><span class="synphi" aria-hidden="true"></span>'
        +'<div class="synphb"><div class="synphh"><b>'+p.p+'</b>'
        +(p.note?'<span class="synpnote">'+p.note+'</span>':'')+'</div>'
        +(p.cn?'<p class="synphc">'+p.cn+'</p>':'')
        +(p.use?'<p class="synphu"><span class="cflab">例句</span><span>'+p.use+'</span></p>':'')
        +'</div></div>';
    }).join('')+'</div>';
}
function synSentencesHtml(info){
  var list=info.patterns||[];
  if(!list.length) return '';
  var base=info.base?'<div class="synbase"><div class="synbasel">原句 · 普通说法</div>'
    +'<p class="synbasee">'+info.base+'</p>'
    +(info.baseCn?'<p class="synbasec">'+info.baseCn+'</p>':'')+'</div>':'';
  return synPartHead(3,'换句子 · 原句改写成高分句')+base
    +'<div class="synrews">'+list.map(function(p){
      return '<div class="synrew"><span class="synphi" aria-hidden="true"></span><div class="synrewb">'
        +'<p class="synrewe">'+p.to+'</p>'
        +(p.note?'<span class="synpnote">'+p.note+'</span>':'')+'</div></div>';
    }).join('')+'</div>';
}

function pagerHtml(i,n,unit,key){
  if(n<=1) return '';
  var u=unit||'组';
  function btn(dir,label){
    var off=(dir<0&&i<=0)||(dir>0&&i>=n-1);
    return '<button type="button" class="cfpgbtn'+(off?' off':'')+'"'
      +(off?' disabled aria-disabled="true"':' data-cfpg="'+dir+'" data-pgkey="'+key+'"')
      +' aria-label="'+label+'">'+label+'</button>';
  }
  return '<div class="cfpager" role="navigation" aria-label="学习单元切换">'
    +btn(-1,'‹ 上一'+u)
    +'<span class="cfpgpos" aria-live="polite">第 '+(i+1)+' / '+n+' '+u+'</span>'
    +btn(1,'下一'+u+' ›')
    +'</div>';
}
function renderListGroup(){
  var groups=listGroups();
  var i=Math.max(0,Math.min(parseInt(DECKI[listKey()],10)||0, groups.length-1));
  DECKI[listKey()]=i;
  var g=groups[i];
  if(!g){ go('conf'); return; }
  var key=listKey(), syn=(key==='synr'||key==='synw'), synw=(key==='synw'), info=listInfo(g.name);
  var gis=groups.map(function(x,k){ return k; }).join(',');   
  var deck='<div class="cfwords" data-deck="'+listKey()+'" data-i="'+i+'" data-n="'+groups.length+'" data-gis="'+gis+'">';
  g.rows.forEach(function(r,j){ deck+=cfWordBlockHtml(r,g._keys[j],info); });
  deck+='</div>';
  var h;
  
  h='<div class="card2 cgcard'+(syn?' syncard':'')+(synw?' synwcard':'')+'">'
    +'<div class="cfhead'+(syn?' swband':'')+'"><div class="cfhrow">'
      +(syn?'<span class="swchips">'+synWordsHtml(g)+'</span>'
           :'<span class="cfws">'+confWordsHtml(g,info)+'</span>')
      +'</div>'
    +'<h4 class="cfht">'+(syn?synTitleHtml(g,info):(info.title||g.name))+'</h4>'
    +(info.note?'<p class="cfdesc">'+info.note+'</p>':'')
    +'</div>'
    +(synw?synPartHead(1,'换单词 · 一个意思换一串词'):'')
    +deck
    +(synw?synPhrasesHtml(info.phrases)+synSentencesHtml(info):'')
    +'</div>'+cfMnHtml(info.mnemonic, syn?'替换指南':null)
    +pagerHtml(i,groups.length,'组',key);
  var body=document.getElementById('cgBody');
  body.innerHTML=h;
  bindRows(body.querySelector('.cfwords'));
}

function listGroupGo(dir){
  var key=listKey(), groups=listGroups();
  if(['conf','synr','synw'].indexOf(key)<0||!groups.length) return;
  var i=Math.max(0,Math.min(parseInt(DECKI[key],10)||0,groups.length-1));
  var ni=i+dir;
  if(ni<0||ni>=groups.length) return;
  stopAudio();
  DECKI[key]=ni;
  markStudied(key,ni);
  renderListGroup();
  window.scrollTo(0,0);
}
function renderWords(reset){
  var m=modOf(WORDMOD), host=document.getElementById('wDeck');
  
  var tot=0, allDone=0;
  m.groups.forEach(function(g){
    tot+=g.rows.length;
    g.rows.forEach(function(r,j){ if((S.done||{}).hasOwnProperty(g._keys[j])) allDone++; });
  });
  var empty=!m.groups.length;
  var intro=document.getElementById('wIntro');
  
  intro.style.background=m.c;
  intro.style.boxShadow='none';
  intro.innerHTML=
    '<h2>'+m.name+'</h2>'
    +'<p>'+(empty?'版式已就绪 · 词表制作中'
                 :'已听 '+allDone+' / '+tot+' 词 · 点词即听即打卡 · 点 ☆ 收藏')+'</p>';
  if(empty){
    
    host.innerHTML=emptyWordsHtml(m);
    ['data-deck','data-i','data-n','data-gis'].forEach(function(a){ host.removeAttribute(a); });
    document.getElementById('wChips').innerHTML='';
    document.getElementById('wTrack').innerHTML='';
    document.getElementById('wPager').innerHTML='';
    document.getElementById('wCnt').textContent=m.name+' · 内容制作中 · 上线后自动变成卡组';
    return;
  }
  var items=[],gis=[];
  m.groups.forEach(function(g,gi){
    for(var s=0;s<g.rows.length;s+=WPER){
      var part=g.rows.slice(s,s+WPER);
      var partKeys=g._keys.slice(s,s+WPER);
      var pOk=0;
      part.forEach(function(r,j){ if((S.done||{}).hasOwnProperty(partKeys[j])) pOk++; });
      var ci=Math.floor(s/WPER)+1, cn=Math.ceil(g.rows.length/WPER);
      
      var meta=((g.en||'')+' · '+(s+1)+'–'+(s+part.length)).replace(/^ · /,'');
      items.push({gi:gi,html:'<div class="card2">'
        +cardHead(g.name+(cn>1?' · 第 '+ci+' 组':''),meta,part.length,pOk,'tts')
        +cardRows(part, partKeys)+'</div>'});
      gis.push(gi);
    }
  });
  
  var cur=buildDeck(host,items,{key:WORDMOD,unit:'张',gis:gis,reset:reset,
    bind:function(h){ bindRows(h); }});
  document.getElementById('wPager').innerHTML=pagerHtml(cur,items.length,'张',WORDMOD);
  
  var ch='';
  m.groups.forEach(function(g,gi){
    ch+='<span class="wchip'+(gis[cur]===gi?' on':'')+'" data-chip="'+gi+'">'+g.name
      +'<i>'+g.rows.length+'</i></span>';
  });
  document.getElementById('wChips').innerHTML=ch;
  var t=document.getElementById('wTrack'); var th='';
  m.groups.forEach(function(g){
    var gAll=g.rows.length, gOk=0;
    g.rows.forEach(function(r,j){ if((S.done||{}).hasOwnProperty(g._keys[j])) gOk++; });
    th+='<i class="'+(gOk>=gAll?'done':'')+'" style="width:'+((gOk/gAll)*100).toFixed(0)+'%"></i>';
  });
  t.innerHTML=th;
  document.getElementById('wCnt').textContent='已听 '+allDone+' / '+tot+' 词 · 本版为精编词表 · 点词即听即打卡';
}


function wordModNames(){
  return MODS.filter(function(m){ return m.kind==='word' && m.groups.length; })
             .map(function(m){ return m.name; }).join(' · ');
}

function bindFavRows(container){
  container.querySelectorAll('.rw').forEach(function(row){
    var key=row.getAttribute('data-k'), en=row.getAttribute('data-en'), mk=row.getAttribute('data-mk');
    function refreshFavViews(){
      renderFav(); renderMine();
      if(document.getElementById('sc-fav-scene').classList.contains('on'))
        renderFavCat('scene', document.getElementById('favSceneHead'), document.getElementById('favSceneBody'));
      if(document.getElementById('sc-fav-word').classList.contains('on'))
        renderFavCat('word', document.getElementById('favWordHead'), document.getElementById('favWordBody'));
    }
    row.addEventListener('click',function(e){
      if(e.target.closest('.ck')){                 
        if(unmarkWord(key,en)) refreshFavViews();
        else toast('先点词听一遍 · 听完自动记「已听」');
        return;
      }
      if(e.target.closest('.fv')){
        if(S.fav) delete S.fav[key];
        save(); refreshFavViews();
        toast('已取消收藏：'+en); return;
      }
      PLAYCTX={mod:mk||null};   
      say(en,norm(en),row);
    });
  });
}

function renderFav(){
  var fav=S.fav||{}, n=Object.keys(fav).length;
  document.getElementById('favHead').innerHTML='<div class="favhd">'
    +'<span class="n">'+n+'</span>'
    +'<div><b>已收藏 '+n+' 个单词</b></div></div>';
  var body=document.getElementById('favBody');
  
  var cats=[
    {key:'scene',title:'场景课',sub:'听力场景课',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="6" rx="1.6"/><rect x="17" y="13" width="4" height="6" rx="1.6"/></svg>',c:'#3370ff',to:'fav-scene'},
    {key:'word', title:'专项词汇',sub:wordModNames(),ic:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h13v14H5z"/><path d="M18 8h3v11h-3"/><path d="M8 9h5M8 12h5"/></svg>',c:'#3370ff',to:'fav-word'}
  ];
  var h='';
  cats.forEach(function(cat){
    var mods=MODS.filter(function(m){ return cat.key==='scene'? m.kind==='scene' : m.kind==='word'; });
    var catN=0;
    mods.forEach(function(m){ m.groups.forEach(function(st){ st.rows.forEach(function(r,i){ if(fav.hasOwnProperty(st._keys[i])) catN++; }); }); });
    h+='<div class="faventry" data-go="'+cat.to+'">'
      +'<span class="mic" style="background:'+cat.c+'">'+cat.ic+'</span>'
      +'<div class="t"><b>'+cat.title+'</b><small>'+cat.sub+'</small></div>'
      +'<span class="fn">'+catN+' 词</span>'
      +'<span class="chev">›</span>'
    +'</div>';
  });
  body.innerHTML=h;
  body.querySelectorAll('.faventry').forEach(function(el){
    el.addEventListener('click',function(){ go(el.getAttribute('data-go')); });
  });
}

var FAVWORD_FILTER='conf';

function renderFavCat(catKey, headEl, bodyEl){
  var fav=S.fav||{};
  var allMods=MODS.filter(function(m){ return catKey==='scene'? m.kind==='scene' : m.kind==='word'; });
  var catN=0;
  allMods.forEach(function(m){ m.groups.forEach(function(st){ st.rows.forEach(function(r,i){ if(fav.hasOwnProperty(st._keys[i])) catN++; }); }); });
  var meta=catKey==='scene'
    ? {title:'场景课',sub:'听力场景课',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="6" rx="1.6"/><rect x="17" y="13" width="4" height="6" rx="1.6"/></svg>',c:'#3370ff'}
    : {title:'专项词汇',sub:wordModNames(),ic:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h13v14H5z"/><path d="M18 8h3v11h-3"/><path d="M8 9h5M8 12h5"/></svg>',c:'#3370ff'};
  headEl.innerHTML='<div class="favsubhd">'
    +'<span class="n">'+catN+'</span>'
    +'<div><b>'+meta.title+' · 已收藏 '+catN+' 个单词</b></div></div>';

  
  var segs=catKey==='word' ? MODS.filter(function(m){ return m.kind==='word' && m.groups.length; }) : [];
  if(catKey==='word' && FAVWORD_FILTER!=='all' && !segs.some(function(m){ return m.key===FAVWORD_FILTER; })){
    FAVWORD_FILTER=segs.length ? segs[0].key : 'all';
  }
  var mods=allMods;
  if(catKey==='word' && FAVWORD_FILTER!=='all') mods=allMods.filter(function(m){ return m.key===FAVWORD_FILTER; });

  
  var h='';
  if(catKey==='word'){
    
    if(segs.length>1){
      h+='<div class="favfilter">';
      segs.forEach(function(m){
        var n=0;
        m.groups.forEach(function(st){ st.rows.forEach(function(r,i){ if(fav.hasOwnProperty(st._keys[i])) n++; }); });
        h+='<button class="ffb'+(FAVWORD_FILTER===m.key?' on':'')+'" data-fk="'+m.key+'">'+m.name+'<i>'+n+'</i></button>';
      });
      h+='</div>';
    }
  }

  
  var cards='';
  mods.forEach(function(m){
    m.groups.forEach(function(st){
      var picked=[];
      st.rows.forEach(function(r,i){ if(fav.hasOwnProperty(st._keys[i])) picked.push({r:r,k:st._keys[i]}); });
      var rows=picked;
      if(!rows.length) return;
      cards+='<div class="fstop open"><h4 class="fstop-h"><span class="mic" style="background:'+m.c+'">'+m.ic+'</span>'
        +m.name+' / '+st.name+'<span class="fn">'+rows.length+' 词</span><span class="chev">›</span></h4>'
        +'<div class="fstop-b">';
      
      var isDetail=m.to==='conf';
      var info=isDetail
        ? ((m.key==='synr'||m.key==='synw') ? synInfo(st.name,m.key) : confInfo(st.name))
        : null;
      rows.forEach(function(it){
        cards+=isDetail
          ? cfWordBlockHtml(it.r,it.k,info,m.key)
          : rowHtml(it.r, it.k, {fav:true,mk:m.key,favTitle:'取消收藏'});
      });
      cards+='</div></div>';
    });
  });

  if(!cards){
    var who = catKey==='word' ? ((modOf(FAVWORD_FILTER)||segs[0]||{}).name||'专项词汇') : meta.title;
    bodyEl.innerHTML=h+'<div class="favcatempty">「'+who+'」里还没有收藏的单词<br/>在对应模块里点单词右侧的 ☆ 即可收藏</div>';
  } else {
    bodyEl.innerHTML=h+cards;
  }
  bindFavRows(bodyEl);
  bindFavFilter(bodyEl);
  
  bodyEl.querySelectorAll('.fstop-h').forEach(function(hd){
    hd.addEventListener('click',function(){ hd.closest('.fstop').classList.toggle('open'); });
  });
}

function bindFavFilter(container){
  container.querySelectorAll('.ffb').forEach(function(btn){
    btn.addEventListener('click',function(){
      FAVWORD_FILTER=btn.getAttribute('data-fk');
      renderFavCat('word', document.getElementById('favWordHead'), document.getElementById('favWordBody'));
    });
  });
}

var quiz=[], qi=0, qright=0, qanswered=false;
function startQuiz(){
  var pool=[]; sceneGroups().forEach(function(st){ st.rows.forEach(function(r){ pool.push(r); }); });
  quiz=[]; var copy=pool.slice();
  for(var i=0;i<5 && copy.length;i++){ quiz.push(copy.splice(Math.floor(Math.random()*copy.length),1)[0]); }
  qi=0; qright=0; qanswered=false;
  document.getElementById('sc-result').classList.remove('on');
  track('quiz_start',{mod:SCENEKEY,total:quiz.length});   
  _quizShow();
}
function _quizShow(){
  var q=quiz[qi];
  document.getElementById('qBig').textContent=q[0];
  document.getElementById('qNo').textContent='Q'+(qi+1)+' / '+quiz.length;
  document.getElementById('qBar').style.width=((qi)/(quiz.length)*100)+'%';
  // 选项：1 正确 + 3 干扰
  var opts=[q[1]]; var pool2=[]; sceneGroups().forEach(function(st){ st.rows.forEach(function(r){ if(r[1]!==q[1]) pool2.push(r[1]); }); });
  while(opts.length<4 && pool2.length){ var x=pool2.splice(Math.floor(Math.random()*pool2.length),1)[0]; if(opts.indexOf(x)<0) opts.push(x); }
  opts.sort(function(){return Math.random()-.5});
  var h=''; opts.forEach(function(c){ h+='<div class="qop" data-c="'+c+'">'+c+'</div>'; });
  document.getElementById('qOpts').innerHTML=h;
  document.getElementById('qNext').style.display='none'; qanswered=false;
  document.getElementById('qNext').className='btnT gray';
  document.getElementById('qNext').textContent='下一题';
}
document.getElementById('qPlay').addEventListener('click',function(){ if(!quiz[qi])return; PLAYCTX={mod:SCENEKEY}; say(quiz[qi][0],norm(quiz[qi][0]),null); });
document.getElementById('qOpts').addEventListener('click',function(e){
  var el=e.target.closest('.qop'); if(!el||qanswered||!quiz[qi]) return; qanswered=true;
  var ok = el.getAttribute('data-c')===quiz[qi][1];
  if(ok) qright++;
  el.className='qop '+(ok?'on-r':'on-w');
  document.querySelectorAll('#qOpts .qop').forEach(function(o){ o.classList.add('dim'); if(o.getAttribute('data-c')===quiz[qi][1]) o.classList.add('on-r'); });
  var nx=document.getElementById('qNext'); nx.style.display='block';
  nx.textContent=(qi+1>=quiz.length)?'查看结果':'下一题';
  if(!ok){ nx.className='btnT'; nx.textContent='正确答案：'+quiz[qi][1]+' · '+(qi+1>=quiz.length?'查看结果':'下一题'); }
});
document.getElementById('qNext').addEventListener('click',function(){
  qi++; if(qi>=quiz.length){ _showResult(); } else { _quizShow(); }
});
function _showResult(){
  
  var qiPos=STACK.lastIndexOf('quiz');
  if(qiPos>=0) STACK.splice(qiPos,1); // 去掉 quiz，返回直通「旅行场景」
  STACK.push('result');
  
  if(HAS_HIST){ try{ history.replaceState(_navState(),''); }catch(e){ HAS_HIST=false; } }
  _show('result');
  var total=quiz.length, ace=(qright===total);
  document.getElementById('rN').textContent=qright;
  var rt=document.getElementById('rTot'); if(rt) rt.textContent='/ '+total;
  setRing('#rRing', total?Math.round(qright/total*100):0);
  document.getElementById('rT1').textContent = ace?'全对！稳了':(qright>=3?'不错，继续刷':'再听两遍更稳');
  document.getElementById('rT2').textContent = '答对 '+qright+' / '+total+' 题 · 回到场景可再点词巩固';
  track('quiz_finish',{mod:SCENEKEY,score:qright,total:total});   
  if(ace){ confetti(); }
}
document.getElementById('rBack').addEventListener('click',function(){ back(); });
var rAgain=document.getElementById('rAgain'); if(rAgain) rAgain.addEventListener('click',function(){ go('quiz'); });


function renderMine(){
  
  document.getElementById('mineName').textContent='游客';
  document.getElementById('mineSub').textContent='进度仅存本机';
  document.getElementById('mineAv').textContent='知';
  document.getElementById('favN').textContent=Object.keys(S.fav||{}).length+' 词';
  
}
function openResetModal(){
  var modal=document.getElementById('resetModal');
  if(!modal) return;
  modal.style.display='flex';
  var card=modal.querySelector('.reset-card');
  if(card) card.focus();
}
function openAboutDoc(){
  var modal=document.getElementById('aboutDoc');
  if(!modal) return;
  modal.style.display='flex';
  var card=modal.querySelector('.about-card');
  if(card) card.focus();
}
(function aboutDocInit(){
  var modal=document.getElementById('aboutDoc');
  var close=document.getElementById('aboutClose');
  if(!modal||!close) return;
  function hide(){ modal.style.display='none'; }
  close.addEventListener('click',hide);
  modal.addEventListener('click',function(e){ if(e.target===modal) hide(); });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape' && modal.style.display==='flex') hide();
  });
})();
(function resetConfirmInit(){
  var modal=document.getElementById('resetModal');
  var cancel=document.getElementById('resetCancel');
  var confirm=document.getElementById('resetConfirm');
  if(!modal||!cancel||!confirm) return;
  function close(){ modal.style.display='none'; }
  cancel.addEventListener('click',close);
  confirm.addEventListener('click',function(){ localStorage.removeItem(KEY); location.reload(); });
  modal.addEventListener('click',function(e){ if(e.target===modal) close(); });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape' && modal.style.display==='flex') close();
  });
})();

var PA={ USE_MOCK:true, API_BASE:'/api', COOLDOWN:60, _cd:null };


function refDomain(){
  var out={};
  try{
    var r=String(document.referrer||'');
    if(r){ var m=r.match(/^https?:\/\/([^\/?#]+)/i); if(m) out.host=m[1].toLowerCase().slice(0,64); }
    var q=String(location.search||'');
    var src=(q.match(/[?&]utm_source=([^&#]*)/i)||[])[1];
    var med=(q.match(/[?&]utm_medium=([^&#]*)/i)||[])[1];
    if(src) out.src=decodeURIComponent(src).slice(0,32);
    if(med) out.med=decodeURIComponent(med).slice(0,32);
  }catch(e){}
  return out;
}
function envBucket(){
  var ua=''; try{ ua=String(navigator.userAgent||''); }catch(e){}
  var os=/iPhone|iPad|iPod/i.test(ua)?'ios':(/Android/i.test(ua)?'android':
         (/Mac OS X/i.test(ua)?'mac':(/Windows/i.test(ua)?'win':'other')));
  var via=/MicroMessenger/i.test(ua)?'wechat':((/QQBrowser|\bQQ\//i.test(ua))?'qq':'browser');
  var w=0; try{ w=parseInt(window.innerWidth,10)||0; }catch(e){}
  var scr = !w ? 'unknown' : (w<=360?'<=360':(w<=414?'361-414':(w<=480?'415-480':'desktop')));
  return {os:os, via:via, scr:scr};
}
function pvMeta(){ return {ref:refDomain(), env:envBucket()}; }
function reportPV(page,kind){
  
  var ts=Date.now(), meta=null;
  try{ meta=pvMeta(); }catch(e){}
  if(PA.USE_MOCK){ console.log('[mock][pv] ->',page,kind||'',meta?JSON.stringify(meta):''); return; }
  try{ fetch(PA.API_BASE+'/pv/ping',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({page:page,kind:kind||'page',ref:meta?meta.ref:null,env:meta?meta.env:null,ts:ts})}); }catch(e){}
}

function reportUV(page){
  if(!consentOK()) return;                 
  var devid=getDevId(), ts=Date.now();      
  if(PA.USE_MOCK){ console.log('[mock][uv] ->',page,'dev',devid.slice(0,8)); return; }
  try{ fetch(PA.API_BASE+'/uv/ping',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({devid:devid,page:page,ts:ts})}); }catch(e){}
}

function track(event,extra){
  if(!consentOK()) return;                  
  
  if(typeof extra==='string') extra={v:extra};
  var devid=getDevId(), ts=Date.now();
  
  if(PA.USE_MOCK){ console.log('[mock][uv][event] ->',event, extra?JSON.stringify(extra):''); return; }
  try{ fetch(PA.API_BASE+'/event/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({devid:devid,event:event,extra: extra||null,ts:ts})}); }catch(e){}
}

var T0=Date.now(), CURPAGE='';
var STUDY={mod:null,ms:0,since:0}, _sesSent=false;
function _vis(){ try{ return document.visibilityState!=='hidden'; }catch(e){ return true; } }
function studyEnter(mod){ STUDY.mod=mod||null; STUDY.ms=0; STUDY.since=_vis()?Date.now():0; }
function studyPause(){ if(STUDY.mod && STUDY.since){ STUDY.ms+=Date.now()-STUDY.since; STUDY.since=0; } }
function studyFlush(){                     
  var mod=STUDY.mod; if(!mod) return;
  studyPause();
  var sec=Math.round(STUDY.ms/1000);
  STUDY.mod=null; STUDY.ms=0; STUDY.since=0;
  if(sec>=3) track('study_time',{mod:mod,sec:sec});
}
function flushSession(){                   
  if(_sesSent) return; _sesSent=true;
  var sec=Math.round((Date.now()-T0)/1000);
  if(sec>=1) track('session_end',{sec:sec});
}
function onVisChange(){
  if(!_vis()){ studyFlush(); return; }          
  
  if(CURPAGE==='study'||CURPAGE==='words') studyEnter(CURPAGE==='study'?SCENEKEY:WORDMOD);
}
document.addEventListener('visibilitychange',onVisChange);
window.addEventListener('pagehide',function(){ studyFlush(); flushSession(); });

function consentOK(){
  try{ return localStorage.getItem('ysmp_ck')==='agree'; }catch(e){ return false; }
}

(function consentInit(){
  var modal=document.getElementById('consentModal');
  var docMask=document.getElementById('privacyDoc'), docClose=document.getElementById('docClose');
  var ckOk=document.getElementById('ckOk'), ckNec=document.getElementById('ckNec'), ckDoc=document.getElementById('ckDoc');
  if(!modal) return;
  var SHOWN='ysmp_ck_shown', CK='ysmp_ck';
  function openModal(){ modal.style.display='flex'; }
  function closeModal(){ modal.style.display='none'; }
  function openDoc(){ if(docMask) docMask.style.display='flex'; }
  function closeDoc(){ if(docMask) docMask.style.display='none'; }
  function curPage(){ return (STACK&&STACK.length)?STACK[STACK.length-1]:'home'; }
  
  openPrivacyDoc=openDoc;
  
  renderPrivacyRow=function(){
    var v=document.getElementById('mineCkV'); if(!v) return;
    var on=consentOK();
    v.textContent = on ? '匿名统计已开启' : '匿名统计未开启';
    v.style.color = on ? '#3370ff' : '#9aa0a6';
  };
  renderPrivacyRow();
  
  askConsentOnce=function(){
    var seen=false; try{ seen = localStorage.getItem(SHOWN)==='1'; }catch(e){}
    if(seen) return;
    try{ localStorage.setItem(SHOWN,'1'); }catch(e){}
    reportPV('consent_shown','consent');   
    openModal();
  };
  
  ckNec.addEventListener('click',function(){ try{ localStorage.setItem(CK,'reject'); }catch(e){} closeModal(); renderPrivacyRow(); });
  
  ckOk.addEventListener('click',function(){
    try{ localStorage.setItem(CK,'agree'); }catch(e){}
    closeModal(); renderPrivacyRow(); track('consent_agree'); reportUV(curPage());
    
    T0=Date.now(); if(STUDY.mod){ STUDY.ms=0; STUDY.since=Date.now(); }
  });
  
  if(ckDoc) ckDoc.addEventListener('click', openDoc);
  
  modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });
  
  
  if(docClose) docClose.addEventListener('click', closeDoc);
  if(docMask) docMask.addEventListener('click',function(e){ if(e.target===docMask) closeDoc(); });
})();

(function commInit(){
  var cards={ qq:document.getElementById('commCardQQ'), zsxq:document.getElementById('commCardZ') };
  var hints={ qq:document.getElementById('commHintQQ'), zsxq:document.getElementById('commHintZ') };
  function isWeChat(){ try{ return /MicroMessenger/i.test(navigator.userAgent); }catch(e){ return false; } }
  function hintText(key){
    var wx=isWeChat();
    if(key==='qq') return wx?'👉长按图片识别，加入QQ群':'<svg class="cc-warn" viewBox="0 0 24 24" fill="none" stroke="#3370ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2.6 20h18.8L12 3Z"/><path d="M12 9.5v4.2"/><circle cx="12" cy="17" r=".95" fill="#3370ff" stroke="none"/></svg>非微信环境：截图保存图片，打开QQ，从相册扫码';
    return wx?'👉长按图片识别，前往知识星球':'<svg class="cc-warn" viewBox="0 0 24 24" fill="none" stroke="#3370ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2.6 20h18.8L12 3Z"/><path d="M12 9.5v4.2"/><circle cx="12" cy="17" r=".95" fill="#3370ff" stroke="none"/></svg>非微信环境：截图保存图片，打开微信扫码访问知识星球';
  }
  function openCard(key){
    var other = key==='qq'?'zsxq':'qq';
    if(cards[other]) cards[other].classList.remove('show');
    if(cards[key]){
      if(hints[key]) hints[key].innerHTML = hintText(key);
      cards[key].classList.add('show');
      
      setTimeout(function(){
        try{ cards[key].scrollIntoView({behavior:'smooth', block:'center'}); }catch(e){
          try{ cards[key].scrollIntoView(true); }catch(e2){}
        }
      }, 120);
    }
  }
  function closeCard(key){ if(cards[key]) cards[key].classList.remove('show'); }
  document.querySelectorAll('[data-comm-open]').forEach(function(b){ b.addEventListener('click',function(){ openCard(b.getAttribute('data-comm-open')); }); });
  document.querySelectorAll('[data-comm-close]').forEach(function(b){ b.addEventListener('click',function(){ closeCard(b.getAttribute('data-comm-close')); }); });
})();



document.getElementById('backBtn').addEventListener('click',back);

(function(){ var b=document.getElementById('copyLinkBtn'); if(b) b.addEventListener('click',copyLink); })();
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-to],[data-open],[data-s],[data-scene],[data-series],[data-mod],[data-group],[data-cf],[data-cfpg],[data-chip],[data-ccat],[data-scat]');
  if(!t) return;
  var to=t.getAttribute('data-to');
  if(to){ go(to); return; }
  var op=t.getAttribute('data-open');
  if(op){ onScene(op); return; }
  var sc=t.getAttribute('data-scene');
  if(sc){ onScene(sc); return; }
  var se=t.getAttribute('data-series');
  if(se){
    track('module_click',{area:'scene',module:se});
    go('scenes'); return;
  }
  
  var grp=t.getAttribute('data-group');
  if(grp!==null&&grp!==undefined){
    var gi=parseInt(grp,10);
    if(!isNaN(gi)){
      var cards=sceneCards(sceneMod()), target=0;
      for(var ci=0;ci<cards.length;ci++){ if(cards[ci].gi===gi){ target=cards[ci].idx; break; } }
      stopAudio();
      DECKI[SCENEKEY]=target;
      markStudied(SCENEKEY,target);
      go('study');
    }
    return;
  }
  
  var md=t.getAttribute('data-mod');
  
  
  if(md){
    track('module_click',{area:'vocab',module:md});
    WORDMOD=md; if(DECKI[md]==null) DECKI[md]=0;
    if(md==='conf'){ CONFCAT='全部'; CONFPAGE=0; }
    go((modOf(md)||{}).to||'words'); return;
  }
  
  var cf=t.getAttribute('data-cf');
  if(cf){ var ci=parseInt(cf,10)-1; if(!isNaN(ci)){ DECKI[listKey()]=ci; markStudied(listKey(),ci); } go('confgrp'); return; }
  
  var lpg=t.getAttribute('data-cfpg');
  if(lpg!==null&&lpg!==undefined&&t.getAttribute('data-pgkey')==='cfpage'){
    var lstep=parseInt(lpg,10);
    if(lstep){ CONFPAGE=Math.max(1,CONFPAGE+lstep); renderList(); window.scrollTo(0,0); }
    return;
  }
  
  var spg=t.getAttribute('data-cfpg');
  if(spg!==null&&spg!==undefined&&t.getAttribute('data-pgkey')==='synpage'){
    var sstep=parseInt(spg,10);
    if(sstep){ SYNPAGE=Math.max(1,SYNPAGE+sstep); renderList(); window.scrollTo(0,0); }
    return;
  }
  
  var pg=t.getAttribute('data-cfpg');
  if(pg!==null&&pg!==undefined){
    var pk=t.getAttribute('data-pgkey'), step=parseInt(pg,10);
    if(pk==='conf'||pk==='synr'||pk==='synw') listGroupGo(step);
    else if(pk) deckGo(pk,step);
    return;
  }
  
  var cc=t.getAttribute('data-ccat');
  if(cc!==null&&cc!==undefined){
    if(cc===CONFCAT) return;
    CONFCAT=cc; CONFPAGE=1;
    renderList();
    window.scrollTo(0,0);
    return;
  }
  
  var sc=t.getAttribute('data-scat');
  if(sc){
    var kg=listGroups(), first=kg.filter(function(g){ return listInfo(g.name).cat===sc; })[0];
    if(sc===SYNCAT && !first) return;
    SYNCAT=sc;
    if(first){ var ki=kg.indexOf(first); DECKI[listKey()]=ki; markStudied(listKey(),ki); }
    renderList(); return;
  }
  
  var cp=t.getAttribute('data-chip');
  if(cp!==null && cp!==undefined){
    var sec=t.closest('.sc');
    var deck=sec? sec.querySelector('.decken'):null;
    if(deck){
      var key=deck.getAttribute('data-deck');
      var gis=(deck.getAttribute('data-gis')||'').split(',');
      var idx=gis.indexOf(cp);
      if(idx>=0){
        var dm=modOf(key);
        var target=(dm && dm.kind==='scene') ? parseInt(cp,10) : idx;
        stopAudio(); DECKI[key]=target; markStudied(key,target); rerenderMod(key);
      }
    }
    return;
  }
  var k=t.getAttribute('data-s');
  if(k==='quiz'){ go('quiz'); }
  else if(k==='seriesSoon') toast('该系列制作中 · 先体验「听力场景课」');
  else if(k==='about'){ openAboutDoc(); }
  else if(k==='community'){ track('community_click_mine'); go('home'); setTimeout(function(){ var c=document.getElementById('homeCommSec'); if(c) c.scrollIntoView({behavior:'smooth',block:'start'}); },80); }
  
  else if(k==='statset'){ var m=document.getElementById('consentModal'); if(m) m.style.display='flex'; }
  else if(k==='privdoc'){ openPrivacyDoc(); }
  else if(k==='reset'){ openResetModal(); }
});
document.querySelectorAll('.tbi[data-tab]').forEach(function(el){ el.addEventListener('click',function(){
  var id=this.getAttribute('data-tab')==='home'?'home':'mine';
  
  var same=(STACK[STACK.length-1]===id);
  navPush(id);
  if(same) return;
  track('tab_switch',{tab:id});
  if(id==='mine') renderMine();
}); });

function syncMwide(){}

function renderMwideStat(){
  var el=document.getElementById('mwStat'); if(!el) return;
  
  var sceneMods=MODS.filter(function(m){ return m.kind==='scene'; });
  var stTot=0, stDone=0, wTot=0, wDone=0, set={};
  sceneMods.forEach(function(m){ m.groups.forEach(function(g){
    stTot++;
    if(g.rows.every(function(r,i){ return (S.done||{})[g._keys[i]]; })) stDone++;
    g.rows.forEach(function(r,i){ wTot++; set[g._keys[i]]=1; });
  }); });
  for(var k in (S.done||{})){ if(set[k]) wDone++; }
  el.innerHTML=stDone+'/'+stTot+' 组 · 已听 '+wDone+'/'+wTot+' 词';
  var bar=document.getElementById('mwBar'); if(bar) bar.style.width=(wTot?Math.round(wDone/wTot*100):0)+'%';
}

function renderVocabStat(){
  document.querySelectorAll('.grid3 .m[data-mod]').forEach(function(card){
    var m=modOf(card.getAttribute('data-mod')); if(!m) return;
    var tot=0, done=0;
    m.groups.forEach(function(g){ g.rows.forEach(function(r,i){ tot++; if((S.done||{})[g._keys[i]]) done++; }); });
    var pct= tot? Math.round(done/tot*100):0;
    var bar=card.querySelector('.vbar i'); if(bar) bar.style.width=pct+'%';
    
    var empty=!tot;
    var tx=card.querySelector('.vprog');
    if(tx) tx.textContent=empty?'内容制作中':'已听 '+done+'/'+tot+' 词';
    var meta=card.querySelector('small');   
    
    if(meta) meta.textContent=empty?('0 '+m.unit+' · 词表制作中'):(m.groups.length+' '+m.unit+' · '+tot+' 词');
    var tag=card.querySelector('.tag');
    if(tag){ tag.textContent=empty?'预览版式':'进入学习'; tag.className='tag'+(empty?' gray':''); }
  });
}

renderRail(); renderMine(); renderFav();
renderMwideStat(); renderVocabStat();

track('session_start');
scheduleAsk(60000);

(function(){
  
  STACK=['home'];
  if(HAS_HIST){ try{ history.replaceState(_navState(),''); }catch(e){ HAS_HIST=false; } }
  var h=location.hash.replace(/^#\/?/,'');
  if(h && h!=='home' && document.getElementById('sc-'+h)){
    
    navPush(h);
    return;
  }
  
  _show('home');
})();
