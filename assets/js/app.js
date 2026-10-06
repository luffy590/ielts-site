


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
function go(id){
  
  STACK.push(id); _show(id);
}
function _show(id){
  reportPV(id);   
  
  var sec=document.getElementById('sc-'+id);
  if(!sec){ toast('该页面不存在 · 请从首页进入'); return; }
  
  if(CURPAGE==='study'||CURPAGE==='words') studyFlush();
  document.querySelectorAll('.sc').forEach(function(s){s.classList.remove('on')});
  sec.classList.add('on');
  
  
  if(id==='study'){ renderStudy(); markStudied(SCENEKEY, DECKI[SCENEKEY]||0); track('study_view',{mod:SCENEKEY}); studyEnter(SCENEKEY); scheduleAsk(8000); }
  if(id==='quiz') startQuiz();
  if(id==='words'){ renderWords(); markStudied(WORDMOD, DECKI[WORDMOD]||0); track('study_view',{mod:WORDMOD}); studyEnter(WORDMOD); scheduleAsk(8000); }   
  if(id==='fav') renderFav();
  if(id==='scenes') renderRail();   
  if(id==='home'){ renderHomeOv(); renderMwideStat(); renderVocabStat(); reportUV('home'); if(!window.__cmTracked){ window.__cmTracked=1; track('community_view','home'); } }
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
  var T={home:'雅思提分宝',mine:'我的',scenes:'听力场景课',study:(sceneMod()?sceneMod().name:'旅行 · 观光与行程'),quiz:'听说自测',result:'自测结果',login:'登录',fav:'我的收藏',
    'fav-scene':'收藏 · 场景课','fav-word':'收藏 · 专项词汇',
    words:(WORDMOD==='write'?'写作高频词':'阅读高频词')};   
  document.getElementById('navTitle').textContent=T[id]||'';
  document.getElementById('tabbar').style.display=(id==='home'||id==='mine')?'flex':'none';
  
  var tabs=document.querySelectorAll('.tbi');
  tabs[0].classList.toggle('on',id==='home'); tabs[1].classList.toggle('on',id==='mine');
}
function back(){
  
  if(STACK.length>1){ STACK.pop(); _show(STACK[STACK.length-1]); }
  else { STACK=['home']; _show('home'); }
}
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
  if(m.kind==='scene') return m.groups.length;
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
  
  var liveN=MODS.filter(function(m){ return m.kind==='scene'; }).length;
  var nl=nextLearning();
  wrap.innerHTML='<div class="ovcard">'
    +'<div class="ovh"><b>学习概览</b></div>'
    +'<div class="ov-stats">'
      +'<div><b>'+done+'</b><span>已听词</span></div>'
      +'<div><b>'+fav+'</b><span>收藏单词</span></div>'
      +'<div><b>'+liveN+'/'+SCENES.length+'</b><span>已上线场景</span></div>'
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
  var rail=document.getElementById('scRail'); var h='';
  SCENES.forEach(function(s){
    var right;
    var m=modOf(s.id);   
    if(m && m.kind==='scene'){
      
      var tot=0, set={};
      m.groups.forEach(function(g){ g.rows.forEach(function(r,i){ tot++; set[g._keys[i]]=1; }); });
      var done=0; for(var k in (S.done||{})){ if(set[k]) done++; }
      var pct= tot? Math.round(done/tot*100):0;
      right='<div class="sprog"><div class="sbar"><i style="width:'+pct+'%"></i></div><span>已听 '+done+'/'+tot+' 词</span></div>';
    } else if(s.id==='more'){
      right='';   
    } else {
      right='<span class="badge wip" style="background:#eaf1ff;color:#3f6fd8">制作中</span>';
    }
    
    var sub=(m && m.kind==='scene')
      ? (m.groups.length+' 站 · '+m.groups.reduce(function(n,g){return n+g.rows.length;},0)+' 词')
      : s.sub;
    h+='<div class="stop"><div class="disc d'+(s.no%9||9)+'">'+s.no+'</div><div class="card" data-sc="'+s.id+'">'+
       '<div class="info"><b>'+s.name+'</b><small>'+sub+'</small></div>'+right+'</div></div>';
  });
  rail.innerHTML=h;
  
  rail.querySelectorAll('[data-sc]').forEach(function(c){ c.addEventListener('click',function(){ onScene(c.getAttribute('data-sc')); }); });
}


function onScene(id){
  var s=SCENES.filter(function(x){return x.id===id})[0];
  var m=modOf(id);
  
  if(m && m.kind==='scene'){ SCENEKEY=id; if(DECKI[id]==null) DECKI[id]=0; track('scene_open',{scene:id,status:'live'}); go('study'); return; }
  if(id==='more'){ toast('更多场景制作中 · 上线后这里直接开课'); return; }
  track('scene_open',{scene:id,status:'wip'});   
  toast('「'+(s?s.name:id)+'」制作中 · 先体验已上线的场景课');
}



var WORDMOD='read';    
var SCENEKEY='travel'; 


var ICONS={
  headphones:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="6" rx="1.6"/><rect x="17" y="13" width="4" height="6" rx="1.6"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-2-1.4-5-1.6-7-.6V18c2-1 5-.8 7 .6 2-1.4 5-1.6 7-.6V5.4c-2-1-5-.8-7 .6z"/><path d="M12 6v12.6"/></svg>',
  pen:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/><path d="M14 6l3 3"/></svg>'
};

var WORD_MODULES=[
  {key:'read', name:'阅读高频词', en:'READING', unit:'类', ic:'book'},
  {key:'write',name:'写作高频词', en:'WRITING', unit:'类', ic:'pen'}
];

var MODS=[];

SCENES.forEach(function(s){
  var gs=(typeof MODULE_GROUPS!=='undefined') && MODULE_GROUPS[s.id];
  if(!gs || !gs.length) return;
  MODS.push({key:s.id,kind:'scene',no:s.no,name:s.name,short:s.name.split(' · ')[0],
             en:s.en||'',unit:'站',ic:ICONS.headphones,c:'#3370ff',to:'study',groups:gs});
});

WORD_MODULES.forEach(function(w){
  var gs=(typeof MODULE_GROUPS!=='undefined') && MODULE_GROUPS[w.key];
  if(!gs || !gs.length) return;
  MODS.push({key:w.key,kind:'word',name:w.name,en:w.en,unit:w.unit,
             ic:ICONS[w.ic]||ICONS.book,c:'#3370ff',to:'words',groups:gs});
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

function rerenderMod(key){
  var m=modOf(key); if(!m) return;
  if(m.kind==='scene'){ SCENEKEY=key; renderStudy(); } else { WORDMOD=key; renderWords(); }
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

function toggleFav(key){
  if(!S.fav) S.fav={};
  if(S.fav[key]){ delete S.fav[key]; toast('已取消收藏'); }
  else { S.fav[key]=1; toast('已收藏 · 可在「我的 › 我的收藏」查看'); }
  save();
  if(document.getElementById('sc-words').classList.contains('on')) renderWords();
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
  var h='<div class="deckbar">'
    +'<span class="dnav'+(i<=0?' off':'')+'" data-dk="-1" title="上一组">‹</span>'
    +'<div class="dprog"><i style="width:'+(((i+1)/n)*100).toFixed(1)+'%"></i></div>'
    +'<span class="dpos">第 '+(i+1)+' / '+n+' '+opt.unit+'</span>'
    +'<span class="dnav'+(i>=n-1?' off':'')+'" data-dk="1" title="下一组">›</span>'
    +'</div>'
    +'<div class="deck"><div class="deckin" style="transform:translateX(-'+(i*100)+'%)">';
  items.forEach(function(it){ h+=it.html; });
  h+='</div></div>';
  host.innerHTML=h;
  host.setAttribute('data-deck',key);
  host.setAttribute('data-i',i);
  host.setAttribute('data-n',n);
  host.setAttribute('data-gis',(opt.gis||[]).join(','));
  if(opt.bind) opt.bind(host);
  deckGesture(host.querySelector('.deck'), key);
  return i;
}
function deckGo(key,d){
  var host=document.querySelector('.decken[data-deck="'+key+'"]');
  if(!host) return;
  var n=parseInt(host.getAttribute('data-n'),10)||1;
  var i=(parseInt(host.getAttribute('data-i'),10)||0)+d;
  i=Math.max(0,Math.min(n-1,i));
  if(i===(parseInt(host.getAttribute('data-i'),10)||0)) return;
  stopAudio();                       
  DECKI[key]=i;
  markStudied(key,i);
  rerenderMod(key);
}
function deckGesture(deckEl,key){
  if(!deckEl) return;
  var inner=deckEl.querySelector('.deckin'); if(!inner) return;
  var x0=0,y0=0,dx=0,moved=false,drag=false;
  var i=DECKI[key]||0;
  var W=function(){ return deckEl.clientWidth||1; };
  deckEl.addEventListener('pointerdown',function(e){
    if(e.target.closest('.fv')) return;          
    drag=true; moved=false; dx=0; x0=e.clientX; y0=e.clientY;
    inner.classList.add('drag');
  });
  deckEl.addEventListener('pointermove',function(e){
    if(!drag) return;
    var mx=e.clientX-x0, my=e.clientY-y0;
    
    if(Math.abs(my)>Math.abs(mx) && Math.abs(my)>10){ drag=false; inner.classList.remove('drag'); inner.style.transform='translateX(-'+(i*100)+'%)'; return; }
    dx=mx; if(Math.abs(dx)>8) moved=true;
    inner.style.transform='translateX(calc(-'+(i*100)+'% + '+dx+'px))';
  });
  function up(){
    if(!drag) return;
    drag=false; inner.classList.remove('drag');
    if(moved && Math.abs(dx)>45){ deckGo(key, dx<0?1:-1); }
    else { inner.style.transform='translateX(-'+(i*100)+'%)'; }
    dx=0;
    
  }
  deckEl.addEventListener('pointerup',up);
  deckEl.addEventListener('pointercancel',up);
  
  deckEl.addEventListener('click',function(e){
    if(!moved) return;
    moved=false; e.stopPropagation(); e.preventDefault();
  },true);
}
function cardRows(rows,keys){
  var h='';
  rows.forEach(function(r,i){
    var key=keys[i];
    var ok=(S.done||{}).hasOwnProperty(key);
    var fv=(S.fav||{}).hasOwnProperty(key);
    h+='<div class="rw'+(ok?' ok':'')+(fv?' fav':'')+'" data-k="'+key+'" data-en="'+r[0]+'">'
      +'<span class="spk"></span><span class="w">'+r[0]+'</span><span class="cn">'+r[1]+'</span>'
      +'<span class="ck" title="点 ✓ 可取消「已听」">✓</span>'
      +'<span class="fv'+(fv?' on':'')+'" data-fav="'+key+'" title="收藏">'+(fv?'★':'☆')+'</span></div>';
  });
  return h;
}

function bindRows(host){
  var dk=host.getAttribute('data-deck');
  host.querySelectorAll('.rw').forEach(function(row){
    var key=row.getAttribute('data-k'), en=row.getAttribute('data-en');
    row.addEventListener('click',function(e){
      PLAYCTX={mod:dk};   
      if(e.target.closest('.fv')){ toggleFav(key); return; }
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
        try{
          var gis=(host.getAttribute('data-gis')||'').split(',').map(Number);
          var gi=gis[DECKI[dk]||0];
          var dm=modOf(dk); var grp = dm ? dm.groups[gi] : null;
          if(grp) milestone(dk+':'+gi, grp.rows.every(function(r,j){return (S.done||{})[grp._keys[j]];}));
        }catch(err){}
        toast('已听：'+en);
      });
    });
  });
}
function cardHead(name,en,cnt,ok,src){
  
  var done=ok>=cnt;
  return '<h3>'
    +'<span class="ht">'+name+'</span>'
    +'<span class="cok'+(done?' done':'')+'">'+(done?'✓ 已全部听完':(ok+' / '+cnt+' 已听'))+'</span>'
    +'<span class="en">'+(en==null?'':en)+'</span></h3>';
}
function renderStudy(reset){
  var host=document.getElementById('studyBody');
  var m=sceneMod(); if(!m) return;
  var groups=m.groups;
  
  var kick=document.getElementById('studyKicker');
  if(kick) kick.textContent='SCENE '+('0'+(m.no||1)).slice(-2)+(m.en?' · '+m.en:'');
  var ttl=document.getElementById('studyName');
  if(ttl) ttl.textContent=m.name;
  var items=[],gis=[],allDone=0,tot=0;
  groups.forEach(function(st,i){
    var stOk=0;
    st.rows.forEach(function(r,j){ if((S.done||{}).hasOwnProperty(st._keys[j])) stOk++; });
    allDone+=stOk; tot+=st.rows.length;
    items.push({gi:i,html:'<div class="card2">'+cardHead(st.name,'STOP '+(i+1)+' · '+st.en,st.rows.length,stOk,'real')
      +cardRows(st.rows, st._keys)+'</div>'});
    gis.push(i);
  });
  var cur=buildDeck(host,items,{key:m.key,unit:m.unit,gis:gis,reset:reset,
    bind:function(h){ bindRows(h); }});
  
  var ch='';
  groups.forEach(function(st,gi){
    ch+='<span class="wchip'+(gis[cur]===gi?' on':'')+'" data-chip="'+gi+'">'+st.name+'<i>'+st.rows.length+'</i></span>';
  });
  document.getElementById('studyChips').innerHTML=ch;
  var t=document.getElementById('stopTrack'); var th='';
  groups.forEach(function(st){
    var stAll=st.rows.length, stOk=0;
    st.rows.forEach(function(r,j){ if((S.done||{}).hasOwnProperty(st._keys[j])) stOk++; });
    th+='<i class="'+(stOk>=stAll?'done':'')+'" style="width:'+((stOk/stAll)*100).toFixed(0)+'%"></i>';
  });
  t.innerHTML=th;
  document.getElementById('studyCnt').textContent='已听 '+allDone+' / '+tot+' 词 · 点词即听即打卡 · 点 ☆ 收藏';
}


var WPER=10;   

function tint(hex,a){
  var h=String(hex).replace('#','');
  if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  var n=parseInt(h,16);
  return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';
}
function renderWords(reset){
  var m=modOf(WORDMOD), host=document.getElementById('wDeck');
  
  var tot=0, allDone=0;
  m.groups.forEach(function(g){
    tot+=g.rows.length;
    g.rows.forEach(function(r,j){ if((S.done||{}).hasOwnProperty(g._keys[j])) allDone++; });
  });
  var intro=document.getElementById('wIntro');
  
  intro.style.background=m.c;
  intro.style.boxShadow='none';
  intro.innerHTML=
    '<div class="k" style="color:rgba(255,255,255,.72)">WORD SET · '+m.en+'</div>'
    +'<h2>'+m.name+'</h2>'
    +'<p>已听 '+allDone+' / '+tot+' 词 · 点词即听即打卡 · 点 ☆ 收藏</p>';
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
    {key:'word', title:'专项词汇',sub:'阅读高频词 · 写作高频词',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h13v14H5z"/><path d="M18 8h3v11h-3"/><path d="M8 9h5M8 12h5"/></svg>',c:'#3370ff',to:'fav-word'}
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

var FAVWORD_FILTER='read';

function renderFavCat(catKey, headEl, bodyEl){
  var fav=S.fav||{};
  var allMods=MODS.filter(function(m){ return catKey==='scene'? m.kind==='scene' : m.kind==='word'; });
  var catN=0;
  allMods.forEach(function(m){ m.groups.forEach(function(st){ st.rows.forEach(function(r,i){ if(fav.hasOwnProperty(st._keys[i])) catN++; }); }); });
  var meta=catKey==='scene'
    ? {title:'场景课',sub:'听力场景课',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="6" rx="1.6"/><rect x="17" y="13" width="4" height="6" rx="1.6"/></svg>',c:'#3370ff'}
    : {title:'专项词汇',sub:'阅读高频词 · 写作高频词',ic:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h13v14H5z"/><path d="M18 8h3v11h-3"/><path d="M8 9h5M8 12h5"/></svg>',c:'#3370ff'};
  headEl.innerHTML='<div class="favsubhd">'
    +'<span class="n">'+catN+'</span>'
    +'<div><b>'+meta.title+' · 已收藏 '+catN+' 个单词</b></div></div>';

  
  var mods=allMods;
  if(catKey==='word' && FAVWORD_FILTER!=='all') mods=allMods.filter(function(m){ return m.key===FAVWORD_FILTER; });

  
  var h='';
  if(catKey==='word'){
    var readN=0, writeN=0;
    MODS.forEach(function(m){
      if(m.key!=='read' && m.key!=='write') return;
      m.groups.forEach(function(st){ st.rows.forEach(function(r,i){ if(fav.hasOwnProperty(st._keys[i])) { if(m.key==='read') readN++; else writeN++; } }); });
    });
    h+='<div class="favfilter">'
      +'<button class="ffb'+(FAVWORD_FILTER==='read'?' on':'')+'" data-fk="read">阅读高频词<i>'+readN+'</i></button>'
      +'<button class="ffb'+(FAVWORD_FILTER==='write'?' on':'')+'" data-fk="write">写作高频词<i>'+writeN+'</i></button>'
    +'</div>';
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
      rows.forEach(function(it){
        var r=it.r, key=it.k;
        var ok=(S.done||{}).hasOwnProperty(key);
        cards+='<div class="rw'+(ok?' ok':'')+' fav" data-k="'+key+'" data-en="'+r[0]+'" data-mk="'+m.key+'">'
          +'<span class="spk"></span><span class="w">'+r[0]+'</span><span class="cn">'+r[1]+'</span>'
          +'<span class="ck" title="点 ✓ 可取消「已听」">✓</span>'
          +'<span class="fv on" data-fav="'+key+'" title="取消收藏">★</span></div>';
      });
      cards+='</div></div>';
    });
  });

  if(!cards){
    var who = catKey==='word' ? (FAVWORD_FILTER==='read'?'阅读高频词':'写作高频词') : meta.title;
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
  document.getElementById('mineSub').textContent='进度仅存本机 · 可导出备份到其它设备';
  document.getElementById('mineAv').textContent='知';
  document.getElementById('loginBtn').textContent='导出 / 导入数据';
  
  document.getElementById('loginBtn').className='btn sm';
  document.getElementById('favN').textContent=Object.keys(S.fav||{}).length+' 词';
  
}
document.getElementById('loginBtn').addEventListener('click',function(){
  
  exportImportData();
});

function exportImportData(){
  var w=document.getElementById('impWrap'); if(w) w.style.display = w.style.display==='flex'?'none':'flex';
}
document.getElementById('expBtn').addEventListener('click',function(){
  try{
    var data={ app:'ysmp', ver:'1.1', ts:Date.now(), state:JSON.parse(JSON.stringify(S)) };
    var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='雅思听力_我的数据_'+new Date().toISOString().slice(0,10)+'.json'; a.click(); URL.revokeObjectURL(a.href);
    toast('已导出 · 数据仅存于你本机'); track('data_export');
  }catch(e){ toast('导出失败'); }
});
document.getElementById('impFile').addEventListener('change',function(e){
  var f=e.target.files&&e.target.files[0]; if(!f) return;
  var rd=new FileReader();
  rd.onload=function(){
    try{ var d=JSON.parse(rd.result); if(!d||!d.state) throw 0;
      S=d.state; save(); renderMine(); renderHomeOv(); renderMwideStat(); renderVocabStat();
      toast('导入成功 · 进度已恢复'); track('data_import');
    }catch(err){ toast('文件格式不正确'); }
    e.target.value='';
  };
  rd.readAsText(f);
});

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
  var t=e.target.closest('[data-to],[data-open],[data-s],[data-scene],[data-series],[data-mod],[data-dk],[data-chip]');
  if(!t) return;
  var to=t.getAttribute('data-to');
  if(to){ go(to); return; }
  var op=t.getAttribute('data-open');
  if(op){ onScene(op); return; }
  var sc=t.getAttribute('data-scene');
  if(sc){ onScene(sc); return; }
  var se=t.getAttribute('data-series');
  if(se){ go('scenes'); return; }
  
  var md=t.getAttribute('data-mod');
  
  if(md){ WORDMOD=md; if(DECKI[md]==null) DECKI[md]=0; go('words'); return; }
  
  var dk=t.getAttribute('data-dk');
  if(dk){
    var host=t.closest('.decken');
    if(host) deckGo(host.getAttribute('data-deck'), parseInt(dk,10));
    return;
  }
  
  var cp=t.getAttribute('data-chip');
  if(cp!==null && cp!==undefined){
    var sec=t.closest('.sc');
    var deck=sec? sec.querySelector('.decken'):null;
    if(deck){
      var key=deck.getAttribute('data-deck');
      var gis=(deck.getAttribute('data-gis')||'').split(',');
      var idx=gis.indexOf(cp);
      if(idx>=0){ stopAudio(); DECKI[key]=idx; markStudied(key,idx); rerenderMod(key); }
    }
    return;
  }
  var k=t.getAttribute('data-s');
  if(k==='quiz'){ go('quiz'); }
  else if(k==='seriesSoon') toast('该系列制作中 · 先体验「听力场景课」');
  else if(k==='about') toast('词汇素材为教学自拟 · 真题题号仅作溯源标注');
  else if(k==='community'){ track('community_click_mine'); go('home'); setTimeout(function(){ var c=document.getElementById('homeCommSec'); if(c) c.scrollIntoView({behavior:'smooth',block:'start'}); },80); }
  
  else if(k==='statset'){ var m=document.getElementById('consentModal'); if(m) m.style.display='flex'; }
  else if(k==='privdoc'){ openPrivacyDoc(); }
  else if(k==='reset'){ localStorage.removeItem(KEY); location.reload(); }
});
document.querySelectorAll('.tbi[data-tab]').forEach(function(el){ el.addEventListener('click',function(){
  var id=this.getAttribute('data-tab')==='home'?'home':'mine';
  
  if(STACK[STACK.length-1]===id){ _show(id); return; }
  STACK.push(id); _show(id);
  track('tab_switch',id);
  if(id==='mine') renderMine();
}); });

function syncMwide(){}

function renderMwideStat(){
  var el=document.getElementById('mwStat'); if(!el) return;
  
  var sceneMods=MODS.filter(function(m){ return m.kind==='scene'; });
  var sceneTot=sceneMods.length;   
  var sceneDone=sceneMods.filter(function(m){
    return m.groups.every(function(g){ return g.rows.every(function(r,i){ return (S.done||{})[g._keys[i]]; }); });
  }).length;
  var stTot=0, stDone=0, wTot=0, wDone=0, set={};
  sceneMods.forEach(function(m){ m.groups.forEach(function(g){
    stTot++;
    if(g.rows.every(function(r,i){ return (S.done||{})[g._keys[i]]; })) stDone++;
    g.rows.forEach(function(r,i){ wTot++; set[g._keys[i]]=1; });
  }); });
  for(var k in (S.done||{})){ if(set[k]) wDone++; }
  el.innerHTML='已完成 '+sceneDone+'/'+sceneTot+' 场景 · '+stDone+'/'+stTot+' 站 · 已听 '+wDone+'/'+wTot+' 词';
  var bar=document.getElementById('mwBar'); if(bar) bar.style.width=(wTot?Math.round(wDone/wTot*100):0)+'%';
}

function renderVocabStat(){
  document.querySelectorAll('.grid3 .m[data-mod]').forEach(function(card){
    var m=modOf(card.getAttribute('data-mod')); if(!m) return;
    var tot=0, done=0;
    m.groups.forEach(function(g){ g.rows.forEach(function(r,i){ tot++; if((S.done||{})[g._keys[i]]) done++; }); });
    var pct= tot? Math.round(done/tot*100):0;
    var bar=card.querySelector('.vbar i'); if(bar) bar.style.width=pct+'%';
    var tx=card.querySelector('.vprog'); if(tx) tx.textContent='已听 '+done+'/'+tot+' 词';
    var meta=card.querySelector('small');   
    if(meta) meta.textContent=m.groups.length+' 类 · '+tot+' 词';
  });
}

renderRail(); renderMine(); renderFav();
renderMwideStat(); renderVocabStat();

track('session_start');
scheduleAsk(60000);

(function(){
  var h=location.hash.replace(/^#\/?/,'');
  if(h && document.getElementById('sc-'+h)){
    
    STACK=['home'];
    if(h!=='home') STACK.push(h);
    _show(h); return;
  }
  
  _show('home');
})();
