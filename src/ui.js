/* ================= TuxLab · interfaz ================= */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='tuxlab-progreso-v1';
let P={done:{},quiz:{},last:null,badges:[]};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==='object')P={...P,...s}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}};
const lessonDone=id=>{const L=LESSONS.find(l=>l.id===id);return (P.done[id]||[]).length>=L.tasks.length};
const lessonNum=L=>LESSONS.indexOf(L)+1;
function totalXP(){let x=0;for(const L of LESSONS){const n=(P.done[L.id]||[]).length;x+=n*10;if(n>=L.tasks.length)x+=50}for(const k in P.quiz)x+=(P.quiz[k]||0)*10;return x}
function rankOf(x){let i=0;RANKS.forEach((r,j)=>{if(x>=r[0])i=j});return{name:RANKS[i][1],cur:RANKS[i][0],next:RANKS[i+1]}}
function badgeOk(id){
  switch(id){
    case 'first':return LESSONS.some(l=>lessonDone(l.id));
    case 'nav':return lessonDone('l2');case 'pipe':return lessonDone('l7');case 'perm':return lessonDone('l10');
    case 'proc':return lessonDone('l12');case 'script':return lessonDone('l14');case 'web':return lessonDone('l18');case 'final':return lessonDone('l19');
    case 'quiz':return Object.entries(P.quiz).some(([k,v])=>QUIZ[k]&&v===QUIZ[k].length);
    case 'quizall':return LEVELS.every(l=>(P.quiz[l.id]||0)>=Math.ceil(QUIZ[l.id].length*.6));
  }
  if(id.startsWith('lv-'))return LESSONS.filter(l=>l.lv===id.slice(3)).every(l=>lessonDone(l.id));
  return false;
}
function checkBadges(){for(const b of BADGES)if(!P.badges.includes(b.id)&&badgeOk(b.id)){P.badges.push(b.id);toast(`${b.icon} Insignia desbloqueada: <b>${b.name}</b>`,'badge')}save()}
function toast(html,cls=''){const box=$('#toasts');while(box.children.length>=3)box.firstChild.remove();const t=document.createElement('div');t.className='toast '+cls;t.innerHTML=html;$('#toasts').appendChild(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),350)},2600)}
function renderXP(){const x=totalXP(),r=rankOf(x);const pct=r.next?Math.round((x-r.cur)/(r.next[0]-r.cur)*100):100;
  $('#xp').innerHTML=`<span class="rank">${r.name}</span><span class="xpbar" title="${r.next?`${r.next[0]-x} XP para ${r.next[1]}`:'¡Rango máximo!'}"><i style="width:${pct}%"></i></span><span class="xpn">${x} XP</span>`}

/* ---------- terminal ---------- */
class Term{
  constructor(el,opt={}){
    this.el=el;this.onRun=opt.onRun;this.banner=opt.banner||'';this.hi=null;this.draft='';
    el.classList.add('term');
    el.innerHTML='<div class="tout"></div><div class="tline"><span class="ps1"></span><input class="tin" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" enterkeyhint="go" aria-label="Escribe una orden"></div>';
    this.o=el.querySelector('.tout');this.in=el.querySelector('.tin');this.ps=el.querySelector('.ps1');
    this.in.addEventListener('keydown',e=>this.key(e));
    el.addEventListener('mouseup',()=>{if(!String(getSelection()))this.in.focus({preventScroll:true})});
    this.reset();
  }
  ps1(){return `<span class="u">${USER}@${HOST}</span>:<span class="p">${escH(disp(this.state.cwd))}</span>$ `}
  reset(){this.state=newState();this.o.innerHTML='';if(this.banner)this.print(this.banner,'n welcome');this.ps.innerHTML=this.ps1();this.hi=null}
  print(html,cls=''){const d=document.createElement('div');d.className='res '+cls;d.innerHTML=html;this.o.appendChild(d)}
  render(t){return escH(t.replace(/\n$/,'')).replace(/\u0001([a-z])([\s\S]*?)\u0002/g,'<span class="c-$1">$2</span>')}
  echoLine(extra=''){const d=document.createElement('div');d.className='cl';d.innerHTML=this.ps1()+escH(this.in.value)+extra;this.o.appendChild(d)}
  run(line){
    const d=document.createElement('div');d.className='cl';d.innerHTML=this.ps1()+escH(line);this.o.appendChild(d);
    const {r,ev}=shellRun(this.state,line);
    if(r.clear)this.o.innerHTML='';
    for(const s of r.segs){const h=this.render(s.t);if(h)this.print(h,s.k||'')}
    while(this.o.childNodes.length>800)this.o.firstChild.remove();
    this.ps.innerHTML=this.ps1();this.scroll();
    if(this.onRun)this.onRun(ev);
  }
  scroll(){this.el.scrollTop=this.el.scrollHeight}
  caretEnd(){requestAnimationFrame(()=>{const n=this.in.value.length;this.in.setSelectionRange(n,n)})}
  type(cmd){this.in.value=cmd;this.in.focus({preventScroll:true});this.caretEnd();this.scroll()}
  key(e){
    const h=this.state.hist;
    if(e.key==='Enter'){e.preventDefault();const v=this.in.value;this.in.value='';this.hi=null;this.run(v);return}
    if(e.key==='ArrowUp'){e.preventDefault();if(!h.length)return;if(this.hi===null){this.hi=h.length;this.draft=this.in.value}this.hi=Math.max(0,this.hi-1);this.in.value=h[this.hi];this.caretEnd();return}
    if(e.key==='ArrowDown'){e.preventDefault();if(this.hi===null)return;this.hi++;if(this.hi>=h.length){this.hi=null;this.in.value=this.draft}else this.in.value=h[this.hi];this.caretEnd();return}
    if(e.key==='Tab'){e.preventDefault();this.complete();return}
    if(e.ctrlKey&&!e.shiftKey&&(e.key==='l'||e.key==='L')){e.preventDefault();this.o.innerHTML='';return}
    if(e.ctrlKey&&(e.key==='c'||e.key==='C')&&!String(getSelection())){e.preventDefault();this.echoLine('<span class="muted">^C</span>');this.in.value='';this.hi=null;this.scroll();return}
    if(e.ctrlKey&&(e.key==='u'||e.key==='U')){e.preventDefault();this.in.value=''}
  }
  complete(){
    S=this.state;const v=this.in.value,pos=this.in.selectionStart,before=v.slice(0,pos),after=v.slice(pos);
    const word=before.match(/(\S*)$/)[1],head=before.slice(0,before.length-word.length);
    let c=[];
    if(/^\s*(sudo\s+)?$/.test(head)&&!word.includes('/'))c=Object.keys(CMDS).filter(k=>k.startsWith(word)&&(!PKG_OF[k]||S.pkgs.has(PKG_OF[k]))).sort().map(k=>k+' ');
    else{const q=word.match(/^['"]/)?word[0]:'';const w=word.slice(q.length);const i=w.lastIndexOf('/');const dp=w.slice(0,i+1),bp=w.slice(i+1);const n=node(dp||'.');
      if(n&&n.t==='d'&&canR(n,{root:false}))c=Object.keys(n.c).filter(x=>x.startsWith(bp)&&(bp.startsWith('.')||x[0]!=='.')).sort().map(x=>q+dp+x+(n.c[x].t==='d'?'/':(q||' ')))}
    if(!c.length)return;
    const pre=c.reduce((a,b)=>{let i=0;while(i<a.length&&a[i]===b[i])i++;return a.slice(0,i)});
    if(c.length===1||pre.length>word.length){const ins=c.length===1?c[0]:pre;this.in.value=head+ins+after;const p=(head+ins).length;this.in.setSelectionRange(p,p)}
    else{this.echoLine();this.print(escH(c.map(x=>x.trim().replace(/^['"]/,'').split('/').filter(Boolean).pop()+(x.trim().endsWith('/')?'/':'')).join('   ')));this.scroll()}
  }
}

/* ---------- aprender ---------- */
let cur=null;
const termL=new Term($('#termL'),{onRun:onLessonRun});
const termB=new Term($('#termB'),{banner:'<b>Terminal libre.</b> Un Linux completo para experimentar sin misiones. Escribe <b>help</b> para ver las órdenes o <b>man orden</b> para su manual.'});
const firstPending=()=>LESSONS.find(l=>!lessonDone(l.id))||LESSONS[0];

function renderSide(){
  $('#side').innerHTML=LEVELS.map(lv=>{const ls=LESSONS.filter(l=>l.lv===lv.id);const dn=ls.filter(l=>lessonDone(l.id)).length;
    return `<h4 style="--c:${lv.color}">${lv.name}<span>${dn}/${ls.length}</span></h4>`+ls.map(L=>{const n=(P.done[L.id]||[]).length,full=n>=L.tasks.length;
      return `<a href="#leccion-${lessonNum(L)}" class="${L===cur?'on':''}" style="--c:${lv.color}"><span class="st ${full?'full':n?'part':''}">${full?'✓':lessonNum(L)}</span>${L.title}</a>`}).join('')}).join('');
}
function openLesson(L){
  if(cur!==L){cur=L;P.last=L.id;save();termL.banner=`<b>Lección ${lessonNum(L)} · ${L.title}.</b> Escribe aquí las órdenes. El sistema empieza limpio en cada lección; <b>↺ Reiniciar</b> lo deja como al principio.`;termL.reset();renderLesson()}
  renderSide();$('#side').classList.remove('open');
  if(matchMedia('(pointer:fine)').matches)setTimeout(()=>termL.in.focus({preventScroll:true}),50);
}
function renderLesson(){
  const L=cur,i=LESSONS.indexOf(L),lv=LEVELS.find(x=>x.id===L.lv),done=P.done[L.id]||[];const prev=LESSONS[i-1],next=LESSONS[i+1];
  const all=done.length>=L.tasks.length;
  $('#lesson').innerHTML=`
    <div class="lhead"><button class="side-toggle" id="stog">☰ Lecciones</button><span class="chip" style="--c:${lv.color}">${lv.name}</span><span class="muted">Lección ${i+1} de ${LESSONS.length} · ~${L.mins} min</span></div>
    <h1>${L.title}</h1>
    <div class="theory">${L.theory}</div>
    <section class="mission" style="--c:${lv.color}">
      <div class="mhead"><h2>Misión</h2><span class="mprog"><b id="mcount">${done.length}</b> / ${L.tasks.length}</span></div>
      <div class="pbar"><i id="mbar" style="width:${done.length/L.tasks.length*100}%"></i></div>
      <ol class="tasks">${L.tasks.map((t,k)=>`<li class="task ${done.includes(k)?'done':''}" data-i="${k}"><span class="chk"></span><div><div class="tt">${t.t}</div><button class="hint-b">¿Pista?</button><div class="hint">${t.h}</div></div></li>`).join('')}</ol>
      <div class="complete ${all?'on':''}" id="mdone">🎉 ¡Lección completada! <span>+${L.tasks.length*10+50} XP</span>${next?`<a class="btn primary sm" href="#leccion-${i+2}">Siguiente: ${next.title} →</a>`:`<a class="btn primary sm" href="#tests">Ir a los tests →</a>`}</div>
    </section>
    <div class="lnav">${prev?`<a href="#leccion-${i}">← ${prev.title}</a>`:'<span></span>'}${next?`<a href="#leccion-${i+2}">${next.title} →</a>`:'<a href="#tests">Tests →</a>'}</div>`;
  $('#lesson').scrollTop=0;
}
function onLessonRun(ev){
  if(!cur)return;const L=cur;const c=mkCheck(ev);const done=P.done[L.id]||(P.done[L.id]=[]);const fresh=[];
  L.tasks.forEach((t,i)=>{if(done.includes(i))return;let ok=false;try{ok=!!t.ok(c)}catch(e){}if(ok){done.push(i);fresh.push(i)}});
  if(!fresh.length)return;
  save();
  for(const i of fresh){const li=$(`.task[data-i="${i}"]`);if(li){li.classList.add('done','pop');li.classList.remove('sh')}}
  $('#mcount').textContent=done.length;$('#mbar').style.width=done.length/L.tasks.length*100+'%';
  toast(`✓ Objetivo cumplido <b style="color:var(--green)">+${fresh.length*10} XP</b>`);
  if(done.length>=L.tasks.length){$('#mdone').classList.add('on');toast(`🎉 <b>${L.title}</b> completada · +50 XP`);setTimeout(()=>$('#mdone').scrollIntoView({behavior:'smooth',block:'nearest'}),200)}
  checkBadges();renderSide();renderXP();
}
$('#resetL').onclick=()=>{termL.reset();termL.in.focus()};
$('#resetB').onclick=()=>{termB.reset();termB.in.focus()};

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-try]');
  if(t){const cmd=t.dataset.try;if(t.closest('#v-aprender')){termL.type(cmd);if(innerWidth<=860)termL.el.closest('.termwrap').scrollIntoView({behavior:'smooth',block:'end'})}else{location.hash='laboratorio';setTimeout(()=>termB.type(cmd),30)}return}
  const h=e.target.closest('.hint-b');if(h){h.closest('.task').classList.toggle('sh');return}
  if(e.target.closest('#stog')){$('#side').classList.toggle('open');return}
  if(!e.target.closest('#side')&&$('#side').classList.contains('open'))$('#side').classList.remove('open');
});

/* ---------- inicio ---------- */
function renderHome(){
  const doneN=LESSONS.filter(l=>lessonDone(l.id)).length;const x=totalXP();
  $('#stats').innerHTML=`<div class="stat"><b>${doneN}/${LESSONS.length}</b><span>lecciones</span></div><div class="stat"><b>${x}</b><span>XP · ${rankOf(x).name}</span></div><div class="stat"><b>${P.badges.length}/${BADGES.length}</b><span>insignias</span></div>`;
  const started=Object.values(P.done).some(a=>a.length);const nx=firstPending();
  $('#cta').textContent=started?(doneN===LESSONS.length?'Repasar lecciones →':`Continuar: ${nx.title} →`):'Empezar desde cero →';
  $('#cta').href=`#leccion-${lessonNum(started?nx:LESSONS[0])}`;
  $('#levels').innerHTML=LEVELS.map(lv=>{const ls=LESSONS.filter(l=>l.lv===lv.id);const t=ls.reduce((s,l)=>s+l.tasks.length,0),d=ls.reduce((s,l)=>s+(P.done[l.id]||[]).length,0);
    const go=ls.find(l=>!lessonDone(l.id))||ls[0];
    return `<div class="lvc" style="--c:${lv.color}"><span class="tag">${lv.tag}</span><h3>${lv.name}</h3><p>${lv.desc}</p>
      <ul>${ls.map(l=>`<li class="${lessonDone(l.id)?'ok':''}"><a href="#leccion-${lessonNum(l)}">${l.title}</a></li>`).join('')}</ul>
      <div class="pl"><span>${Math.round(d/t*100)}%</span><span>${d}/${t} objetivos</span></div><div class="pbar"><i style="width:${d/t*100}%"></i></div>
      <a class="btn sm" href="#leccion-${lessonNum(go)}">${d===0?'Empezar':d===t?'Repasar':'Continuar'} →</a></div>`}).join('');
  $('#badges').innerHTML=BADGES.map(b=>`<div class="bdg ${P.badges.includes(b.id)?'on':''}" title="${b.d}"><div class="i">${b.icon}</div><b>${b.name}</b><span>${b.d}</span></div>`).join('');
}
/* demo animada */
(function demo(){
  const el=$('#demo');const P1='<span class="u">estudiante@tuxlab</span>:<span class="p">~</span>$ ';
  const steps=[
    ['ls',`<span class="c-b">datos</span>  <span class="c-b">documentos</span>  <span class="c-b">logs</span>  <span class="c-b">scripts</span>  secreto.txt`],
    ["grep -c ERROR logs/sistema.log",'3'],
    ["cut -d' ' -f1 logs/access.log | sort | uniq -c | sort -nr | head -3",'      9 192.168.1.10\n      6 203.0.113.7\n      5 10.0.0.5'],
    ['sudo systemctl start nginx && curl -s localhost | grep h1','<h1>Welcome to nginx!</h1>'.replace(/</g,'&lt;')],
  ];
  let done='',si=0,ci=0;
  const tick=()=>{
    if(!document.body.contains(el))return;
    if(si>=steps.length){setTimeout(()=>{done='';si=0;ci=0;tick()},3800);return}
    const [cmd,res]=steps[si];
    if(ci<=cmd.length){el.innerHTML=done+P1+escH(cmd.slice(0,ci))+'<span class="caret"></span>';ci++;setTimeout(tick,ci===1?500:28+Math.random()*45)}
    else{done+=P1+escH(cmd)+'\n'+res+'\n';el.innerHTML=done+P1+'<span class="caret"></span>';si++;ci=0;setTimeout(tick,900)}
  };tick();
})();

/* ---------- laboratorio ---------- */
const IDEAS=[
  ['help','Todas las órdenes disponibles'],
  ['tree -L 2','Un vistazo al sistema de archivos'],
  ['sudo apt install neofetch && neofetch','Instala un programa y presume de sistema'],
  ['sudo apt install cowsay fortune','Dos clásicos divertidos…'],
  ['fortune | cowsay','…y combínalos con una tubería'],
  ['sudo apt install sl && sl','Lo que pasa si escribes mal «ls»'],
  ['top','¿Quién se come la CPU?'],
  ['grep -r ERROR . 2>/dev/null','Busca en todos los archivos a la vez'],
  ["awk -F: '$3 >= 1000 {print $1}' /etc/passwd",'Usuarios «humanos» del sistema'],
  ["find / -size +1k -type f 2>/dev/null",'Archivos de más de 1 KiB'],
  ['ls -l /etc | sort -k5 -n | tail -3','Los archivos más grandes de /etc'],
  ['sudo apt install apache2 && sudo systemctl start apache2 && curl -I localhost','Prueba con otro servidor web'],
  ['history | tail -5','Lo último que escribiste'],
  ['cal','El calendario del mes'],
  ['rm -rf /','Atrévete 😈 (TuxLab está protegido)'],
];
$('#ideas').innerHTML=IDEAS.map(([c,d])=>`<button class="idea" data-lab="${escH(c)}"><code>$ ${escH(c)}</code><span>${d}</span></button>`).join('');
$('#ideas').addEventListener('click',e=>{const b=e.target.closest('[data-lab]');if(b)termB.type(b.dataset.lab)});

/* ---------- tests ---------- */
let Q={lv:'b',i:0,ans:[],order:[],opts:[]};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function startQuiz(lv){Q={lv,i:0,ans:[],order:shuffle(QUIZ[lv].map((_,i)=>i)),opts:QUIZ[lv].map(q=>shuffle(q.o.map((_,i)=>i)))};renderQuiz()}
function renderQuiz(){
  $('#qtabs').innerHTML=LEVELS.map(l=>{const b=P.quiz[l.id];return `<button data-qlv="${l.id}" class="${Q.lv===l.id?'on':''}" style="--c:${l.color}">${l.name}<small>${b===undefined?'sin hacer':`mejor: ${b}/${QUIZ[l.id].length}`}</small></button>`}).join('');
  const qs=QUIZ[Q.lv],n=qs.length;
  const dots=`<div class="qdots">${qs.map((_,k)=>`<i class="${k<Q.ans.length?(Q.ans[k]?'ok':'ko'):k===Q.i?'cur':''}"></i>`).join('')}</div>`;
  if(Q.i>=n){const sc=Q.ans.filter(Boolean).length;const prev=P.quiz[Q.lv];const best=Math.max(prev??0,sc);const gain=(best-(prev??0))*10;P.quiz[Q.lv]=best;save();
    const lv=LEVELS.find(l=>l.id===Q.lv);
    $('#qcard').innerHTML=`<div class="qmeta"><span>${lv.name} · resultado</span>${dots}</div><div class="qend"><div class="big">${sc}/${n}</div>
      <p>${sc===n?'¡Perfecto! Dominas este nivel. 🐧':sc>=n*.6?'¡Aprobado! Repasa las que fallaste y vuelve a intentarlo.':'Aún no. Repasa las lecciones del nivel y vuelve: aprenderás mucho más fallando aquí que en un servidor de verdad.'}</p>
      ${gain>0?`<p style="color:var(--green);font-family:var(--mono)">+${gain} XP · nuevo récord</p>`:''}
      <div class="row"><button class="btn primary" data-qretry>Repetir test</button><a class="btn" href="#leccion-${lessonNum(LESSONS.find(l=>l.lv===Q.lv))}">Repasar ${lv.name}</a></div></div>`;
    checkBadges();renderXP();renderTabsOnly();return}
  const qi=Q.order[Q.i],q=qs[qi];
  $('#qcard').innerHTML=`<div class="qmeta"><span>Pregunta ${Q.i+1} de ${n}</span>${dots}</div><div class="qq">${q.q}</div>
    <div class="qo">${Q.opts[qi].map((oi,k)=>`<button data-qo="${oi}"><span class="k">${'ABCD'[k]}</span><span class="${/^[a-z0-9]/.test(q.o[oi])&&/[-|]/.test(q.o[oi])?'cmd':''}">${q.o[oi]}</span></button>`).join('')}</div>
    <div class="qx" id="qx"></div><div class="qfoot" id="qfoot"></div>`;
}
function renderTabsOnly(){$$('#qtabs button').forEach(b=>{const id=b.dataset.qlv,v=P.quiz[id];b.querySelector('small').textContent=v===undefined?'sin hacer':`mejor: ${v}/${QUIZ[id].length}`})}
$('#v-tests').addEventListener('click',e=>{
  const tab=e.target.closest('[data-qlv]');if(tab){startQuiz(tab.dataset.qlv);return}
  if(e.target.closest('[data-qretry]')){startQuiz(Q.lv);return}
  if(e.target.closest('[data-qnext]')){Q.i++;renderQuiz();return}
  const o=e.target.closest('[data-qo]');if(!o||o.disabled)return;
  const qi=Q.order[Q.i],q=QUIZ[Q.lv][qi],pick=+o.dataset.qo,ok=pick===q.a;Q.ans.push(ok);
  $$('#qcard [data-qo]').forEach(b=>{b.disabled=true;if(+b.dataset.qo===q.a)b.classList.add('ok');else if(b===o)b.classList.add('ko')});
  const x=$('#qx');x.innerHTML=`<b class="${ok?'':'bad'}">${ok?'¡Correcto!':'No exactamente.'}</b> ${q.x}`;x.classList.add('on');
  $('#qfoot').innerHTML=`<button class="btn primary" data-qnext>${Q.i+1<QUIZ[Q.lv].length?'Siguiente →':'Ver resultado'}</button>`;
  $$('#qcard .qdots i')[Q.i].className=ok?'ok':'ko';
});

/* ---------- referencia ---------- */
let rcat='Todas';
function renderRef(){
  const cats=['Todas',...new Set(REF.map(r=>r.cat))];
  $('#rcats').innerHTML=cats.map(c=>`<button data-rc="${c}" class="${c===rcat?'on':''}">${c}</button>`).join('');
  const q=$('#rq').value.trim().toLowerCase();
  const list=REF.filter(r=>(rcat==='Todas'||r.cat===rcat)&&(!q||(r.c+' '+r.d+' '+r.cat+' '+(r.o||[]).join(' ')).toLowerCase().includes(q)));
  $('#rgrid').innerHTML=list.length?list.map(r=>`<div class="rc"><div class="rch"><code>${r.c}</code><span>${r.cat}</span></div><p>${escH(r.d.charAt(0).toUpperCase()+r.d.slice(1))}.</p><div class="syn">${escH(r.s)}</div>${r.o?`<ul>${r.o.map(o=>`<li>${escH(o)}</li>`).join('')}</ul>`:''}<div class="rce"><code>$ ${escH(r.e)}</code><button class="try" data-try="${escH(r.e)}">▶ Probar</button></div></div>`).join(''):'<div class="empty">No hay órdenes que coincidan.</div>';
}
$('#rq').addEventListener('input',renderRef);
$('#rcats').addEventListener('click',e=>{const b=e.target.closest('[data-rc]');if(b){rcat=b.dataset.rc;renderRef()}});

/* ---------- navegación ---------- */
const VIEWS=['inicio','aprender','laboratorio','tests','referencia'];
function route(){
  let h=location.hash.slice(1)||'inicio';let L=null;const m=h.match(/^leccion-(\d+)$/);
  if(m){L=LESSONS[+m[1]-1]||null;h='aprender'}
  if(!VIEWS.includes(h))h='inicio';
  $$('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+h));
  $$('nav.tabs a').forEach(a=>a.classList.toggle('on',a.dataset.v===h));
  if(h==='inicio')renderHome();
  if(h==='aprender'){const target=L||cur||LESSONS.find(l=>l.id===P.last)||firstPending();openLesson(target)}
  if(h==='laboratorio'&&matchMedia('(pointer:fine)').matches)setTimeout(()=>termB.in.focus({preventScroll:true}),50);
  if(h==='tests'){if(!Q.order.length)startQuiz(Q.lv);else renderQuiz()}
  if(h==='referencia')renderRef();
  if(h!=='aprender'&&h!=='laboratorio')window.scrollTo(0,0);
}
addEventListener('hashchange',route);
renderXP();route();
