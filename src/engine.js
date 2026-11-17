/* ================= TuxLab · motor de shell simulado ================= */
const HOME='/home/estudiante', USER='estudiante', HOST='tuxlab';
function D(c={},o='estudiante',m=0o755){return{t:'d',c,o,m,mt:Date.now()}}
function F(d='',o='estudiante',m=0o644){return{t:'f',d,o,m,mt:Date.now()}}

const SYSLOG=[
'2026-11-16 08:00:01 INFO  Sistema iniciado',
'2026-11-16 08:00:03 INFO  Servicio ssh activo',
'2026-11-16 08:01:15 WARN  Uso de disco al 81%',
'2026-11-16 08:05:42 ERROR No se pudo montar /dev/sdb1',
'2026-11-16 08:10:00 INFO  Tarea cron ejecutada: backup',
'2026-11-16 08:12:31 ERROR Fallo de autenticación para el usuario admin',
'2026-11-16 08:15:09 INFO  Conexión entrante desde 192.168.1.20',
'2026-11-16 08:20:44 warn  Temperatura de CPU elevada',
'2026-11-16 08:25:00 INFO  Actualización de paquetes disponible',
'2026-11-16 08:30:12 ERROR Servicio nginx no responde',
'2026-11-16 08:31:00 INFO  Reintentando servicio nginx',
'2026-11-16 08:35:27 WARN  Memoria swap al 60%'].join('\n')+'\n';

function mkAccess(){
  const ips=[['192.168.1.10',9],['203.0.113.7',6],['10.0.0.5',5],['172.16.0.3',4],['192.168.1.20',3],['198.51.100.2',2]];
  const arr=[]; ips.forEach(([ip,n])=>{for(let i=0;i<n;i++)arr.push(ip)});
  let seed=7; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
  const paths=['/index.html','/about.html','/login','/api/users','/img/logo.png','/contacto','/blog'];
  return arr.map((ip,i)=>{
    const p=(i%7===3)?'/no-existe':paths[Math.floor(rnd()*paths.length)];
    const st=p==='/no-existe'?404:(p==='/login'&&rnd()<.5?500:200);
    const mm=String(Math.floor(i*2/60)).padStart(2,'0'), ss=String((i*2)%60).padStart(2,'0');
    return `${ip} - - [16/Nov/2026:10:${mm}:${ss}] "GET ${p} HTTP/1.1" ${st} ${200+Math.floor(rnd()*4800)}`;
  }).join('\n')+'\n';
}
const ACCESS=mkAccess();
const ACC_LINES=ACCESS.trim().split('\n');
const N404=ACC_LINES.filter(l=>l.split(' ')[7]==='404').length;
const TOPIP='192.168.1.10';

const PASSWD=`root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
sshd:x:110:65534::/run/sshd:/usr/sbin/nologin
estudiante:x:1000:1000:Estudiante TuxLab,,,:/home/estudiante:/bin/bash
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
`;
const NGINX_HTML=`<!DOCTYPE html>
<html>
<head><title>Welcome to nginx!</title></head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and working.</p>
</body>
</html>
`;

function baseFS(){
  return D({
    bin:D({},'root'), boot:D({'vmlinuz':F('','root')},'root'),
    dev:D({null:F('','root',0o666)},'root'),
    etc:D({
      passwd:F(PASSWD,'root'),
      shadow:F('root:*:19700:0:99999:7:::\nestudiante:$y$j9T$...:19700:0:99999:7:::\n','root',0o640),
      hostname:F('tuxlab\n','root'),
      hosts:F('127.0.0.1\tlocalhost\n127.0.1.1\ttuxlab\n192.168.1.20\tservidor\n192.168.1.1\trouter\n','root'),
      'os-release':F('PRETTY_NAME="Ubuntu 24.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\nVERSION="24.04.1 LTS (Noble Numbat)"\nID=ubuntu\nID_LIKE=debian\nHOME_URL="https://www.ubuntu.com/"\n','root'),
      'resolv.conf':F('nameserver 127.0.0.53\n','root'),
      ssh:D({'sshd_config':F('Port 22\nPermitRootLogin no\nPasswordAuthentication yes\n','root')},'root'),
    },'root'),
    home:D({estudiante:D({
      '.bashrc':F('# ~/.bashrc: configuración de bash\nalias ll=\'ls -l\'\nalias la=\'ls -A\'\nexport PS1=\'\\u@\\h:\\w\\$ \'\n'),
      '.profile':F('# ~/.profile\nif [ -f ~/.bashrc ]; then . ~/.bashrc; fi\n'),
      documentos:D({
        'bienvenida.txt':F('¡Bienvenido a TuxLab!\nAquí aprenderás Linux paso a paso.\nLinux es un sistema operativo libre.\nLinux funciona en servidores, móviles y supercomputadoras.\nCada comando que escribes es una pequeña victoria.\n'),
        'manual.txt':F('MANUAL DE TUXLAB\n================\n1. Lee la teoría.\n2. Escribe los comandos en la terminal.\n3. Completa las misiones.\n'),
        '.secreto':F('¡Encontraste el archivo oculto! 🐧 Los archivos que empiezan por punto no se ven con un ls normal.\n'),
      }),
      logs:D({'sistema.log':F(SYSLOG),'access.log':F(ACCESS)}),
      datos:D({
        'frutas.txt':F('manzana\npera\nbanana\nmanzana\nkiwi\npera\nmanzana\nuva\nbanana\nmango\nmanzana\nkiwi\n'),
        'ventas.csv':F('fecha,producto,cantidad,precio\n2026-11-01,teclado,3,25\n2026-11-02,raton,5,12\n2026-11-03,monitor,2,180\n2026-11-04,teclado,1,25\n2026-11-05,cable,10,4\n2026-11-06,raton,2,12\n'),
      }),
      scripts:D({'backup.sh':F('#!/bin/bash\n# Script de respaldo de ejemplo\necho "Iniciando respaldo..."\necho "Copiando documentos..."\necho "Respaldo completado ✔"\n')}),
      basura:D({'viejo1.tmp':F('x\n'),'viejo2.tmp':F('y\n'),cache:D({'c.tmp':F('z\n')})}),
      'temporal.txt':F('archivo temporal\n'),
      'secreto.txt':F('La contraseña del wifi es: pingüino123\n'),
    })},'root'),
    root:D({'.bashrc':F('','root')},'root',0o700),
    tmp:D({},'root',0o777),
    usr:D({bin:D({},'root'),sbin:D({},'root'),share:D({},'root')},'root'),
    var:D({log:D({syslog:F(SYSLOG,'root',0o640)},'root'),www:D({},'root')},'root'),
  },'root');
}

function newState(){
  return {fs:baseFS(), cwd:HOME, vars:{},
    env:{HOME,USER,LOGNAME:USER,SHELL:'/bin/bash',PATH:'/usr/local/bin:/usr/bin:/bin:/usr/sbin',LANG:'es_ES.UTF-8',PWD:HOME,OLDPWD:HOME,HOSTNAME:HOST,TERM:'xterm-256color'},
    hist:[], status:0, args:['bash'], shellPid:1201, nextPid:5000,
    procs:[
      {pid:1,u:'root',cmd:'/sbin/init splash',cpu:0.0,mem:0.3,vsz:168000,rss:12800,stat:'Ss'},
      {pid:412,u:'root',cmd:'sshd: /usr/sbin/sshd -D',cpu:0.0,mem:0.2,vsz:15400,rss:9100,stat:'Ss'},
      {pid:733,u:'root',cmd:'/usr/sbin/cron -f',cpu:0.0,mem:0.1,vsz:9500,rss:2700,stat:'Ss'},
      {pid:1201,u:USER,cmd:'-bash',cpu:0.0,mem:0.1,vsz:11200,rss:5400,stat:'Ss',tty:1},
      {pid:3110,u:USER,cmd:'python3 servidor.py',cpu:1.2,mem:2.1,vsz:45200,rss:22100,stat:'S',tty:1},
      {pid:4242,u:USER,cmd:'./proceso_colgado --loop',cpu:98.7,mem:12.4,vsz:512000,rss:498000,stat:'R',tty:1,stubborn:true},
    ],
    pkgs:new Set(['bash','coreutils','grep','sed','gawk','openssh-server','curl','nano']),
    aptUpdated:false,
    svcs:{ssh:{desc:'OpenBSD Secure Shell server',active:true,enabled:true,pid:412,since:Date.now()-3*864e5},
          cron:{desc:'Regular background program processing daemon',active:true,enabled:true,pid:733,since:Date.now()-3*864e5}},
    groups:{root:['root'],adm:[USER],sudo:[USER],'www-data':[],users:[],estudiante:[USER]},
  };
}

/* ---------- utilidades ---------- */
let S;
class E extends Error{constructor(m,code=1){super(m);this.code=code}}
const fail=(m,code)=>{throw new E(m,code)};
const MON=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DOW=['dom','lun','mar','mié','jue','vie','sáb'];
const p2=n=>String(n).padStart(2,'0');
function dateStr(t){const d=new Date(t);return `${MON[d.getMonth()]} ${String(d.getDate()).padStart(2)} ${p2(d.getHours())}:${p2(d.getMinutes())}`}
const bytes=s=>new TextEncoder().encode(s).length;
function hsize(n){if(n<1024)return String(n);const u=['K','M','G'];let i=-1;do{n/=1024;i++}while(n>=1024&&i<2);return(n<10?n.toFixed(1).replace('.',','):Math.round(n))+u[i]}
function modeStr(n){let s=n.t==='d'?'d':'-';for(let sh=6;sh>=0;sh-=3){const b=(n.m>>sh)&7;s+=(b&4?'r':'-')+(b&2?'w':'-')+(b&1?'x':'-')}return s}
const nsize=n=>n.t==='d'?4096:bytes(n.d);
function col(name,n,ctx){if(!ctx.tty)return name;if(n.t==='d')return '\u0001b'+name+'\u0002';if(n.m&0o111)return '\u0001g'+name+'\u0002';return name}
const lines=t=>{const l=(t||'').split('\n');if(l[l.length-1]==='')l.pop();return l};
const out=a=>a.length?a.join('\n')+'\n':'';
const strip=s=>String(s).replace(/\u0001[a-z]|\u0002/g,'');
const escRe=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const clone=n=>JSON.parse(JSON.stringify(n));

function norm(p){
  if(p===undefined||p==='')p='.';
  if(p==='~')p=HOME;else if(p.startsWith('~/'))p=HOME+p.slice(1);
  if(p[0]!=='/')p=S.cwd+'/'+p;
  const o=[];for(const s of p.split('/')){if(!s||s==='.')continue;if(s==='..')o.pop();else o.push(s)}
  return '/'+o.join('/');
}
function node(p){const n=norm(p);let cur=S.fs;if(n==='/')return cur;for(const s of n.slice(1).split('/')){if(!cur||cur.t!=='d')return null;cur=cur.c[s]}return cur||null}
function split(p){const n=norm(p);const i=n.lastIndexOf('/');return{pp:n.slice(0,i)||'/',name:n.slice(i+1),full:n}}
const canW=(nd,ctx)=>ctx.root||nd.o===USER&&(nd.m&0o200)||(nd.m&2);
const canR=(nd,ctx)=>ctx.root||(nd.o===USER?(nd.m&0o400):(nd.m&4));
const disp=p=>p===HOME?'~':p.startsWith(HOME+'/')?'~'+p.slice(HOME.length):p;
function each(list,ctx,fn){for(const x of list){try{fn(x)}catch(e){if(e instanceof E){ctx.err(e.message)}else throw e}}}

function writeFile(p,content,append,ctx,cmd){
  if(norm(p)==='/dev/null')return;
  const {pp,name}=split(p);const dir=node(pp);
  if(!dir||dir.t!=='d')fail(`${cmd}: ${p}: No existe el archivo o el directorio`);
  const f=dir.c[name];
  if(f&&f.t==='d')fail(`${cmd}: ${p}: Es un directorio`);
  if(f){if(!canW(f,ctx))fail(`${cmd}: ${p}: Permiso denegado`);f.d=append?f.d+content:content;f.mt=Date.now()}
  else{if(!canW(dir,ctx))fail(`${cmd}: ${p}: Permiso denegado`);dir.c[name]=F(content,ctx.root?'root':USER)}
}
function readFile(p,ctx,cmd){
  const n=node(p);
  if(!n)fail(`${cmd}: ${p}: No existe el archivo o el directorio`);
  if(n.t==='d')fail(`${cmd}: ${p}: Es un directorio`);
  if(!canR(n,ctx))fail(`${cmd}: ${p}: Permiso denegado`);
  return n.d;
}
function inputOf(files,ctx,cmd){if(!files.length)return ctx.stdin;let s='';for(const f of files){if(f==='-'){s+=ctx.stdin;continue}try{s+=readFile(f,ctx,cmd)}catch(e){if(e instanceof E)ctx.err(e.message);else throw e}}return s}
function opts(args,valued=''){
  const f=new Set(),v={},rest=[];
  for(let i=0;i<args.length;i++){const a=args[i];
    if(a==='--'){rest.push(...args.slice(i+1));break}
    if(a.startsWith('--')&&a.length>2){const [k,val]=a.slice(2).split('=');f.add(k);if(val!==undefined)v[k]=val;continue}
    if(a[0]==='-'&&a.length>1&&!/^-\d+$/.test(a)){for(let j=1;j<a.length;j++){const ch=a[j];if(valued.includes(ch)){v[ch]=a.slice(j+1)||args[++i];f.add(ch);break}f.add(ch)}continue}
    rest.push(a);
  }
  return{f,v,rest};
}
function globRe(g,ci){return new RegExp('^'+g.split('').map(ch=>ch==='*'?'.*':ch==='?'?'.':escRe(ch)).join('')+'$',ci?'i':'')}
function glob(p){
  const i=p.lastIndexOf('/');const dp=i>=0?p.slice(0,i+1):'';const base=p.slice(i+1);
  if(/[*?]/.test(dp)||!/[*?]/.test(base))return[p];
  const n=node(dp||'.');if(!n||n.t!=='d')return[p];
  const re=globRe(base);const m=Object.keys(n.c).filter(x=>(x[0]!=='.'||base[0]==='.')&&re.test(x)).sort();
  return m.length?m.map(x=>dp+x):[p];
}
function walk(path,n,acc=[]){acc.push([path,n]);if(n.t==='d')for(const k of Object.keys(n.c).sort())walk((path==='/'?'':path)+'/'+k,n.c[k],acc);return acc}
function getVar(name){
  if(/^\d+$/.test(name))return S.args[+name]??'';
  if(name==='#')return String(Math.max(0,S.args.length-1));
  if(name==='@'||name==='*')return S.args.slice(1).join(' ');
  if(name==='?')return String(S.status);
  if(name==='$')return String(S.shellPid);
  if(name==='RANDOM')return String(Math.floor(Math.random()*32768));
  if(name==='PWD')return S.cwd;
  return S.vars[name]??S.env[name]??'';
}

/* ---------- tokenizador ---------- */
function tokenize(line){
  const toks=[];let cur='',has=false,q=false,i=0;
  const push=()=>{if(has){toks.push({v:cur,q});cur='';has=false;q=false}};
  const varAt=j=>line.slice(j).match(/^\$(\{(\w+)\}|([A-Za-z_]\w*)|([0-9#@*?$]))/);
  while(i<line.length){const ch=line[i];
    if(ch==="'"){const j=line.indexOf("'",i+1);if(j<0)throw new E('error de sintaxis: comilla simple sin cerrar');cur+=line.slice(i+1,j);has=true;q=true;i=j+1;continue}
    if(ch==='"'){let j=i+1,s='';
      while(j<line.length&&line[j]!=='"'){
        if(line[j]==='\\'&&j+1<line.length&&'"\\$`'.includes(line[j+1])){s+=line[j+1];j+=2;continue}
        if(line[j]==='$'){const m=varAt(j);if(m){s+=getVar(m[2]||m[3]||m[4]);j+=m[0].length;continue}}
        s+=line[j];j++}
      if(j>=line.length)throw new E('error de sintaxis: comilla doble sin cerrar');
      cur+=s;has=true;q=true;i=j+1;continue}
    if(ch==='\\'&&i+1<line.length){cur+=line[i+1];has=true;q=true;i+=2;continue}
    if(ch===' '||ch==='\t'){push();i++;continue}
    if(ch==='|'&&line[i+1]==='|'){push();toks.push({op:'||'});i+=2;continue}
    if(ch==='|'){push();toks.push({op:'|'});i++;continue}
    if(ch==='&'&&line[i+1]==='&'){push();toks.push({op:'&&'});i+=2;continue}
    if(ch==='&'&&line[i+1]==='>'){push();toks.push({op:'&>'});i+=2;continue}
    if(ch==='&'){push();toks.push({op:'&'});i++;continue}
    if(ch===';'){push();toks.push({op:';'});i++;continue}
    if(ch==='>'&&cur==='2'&&!q&&has){cur='';has=false;if(line[i+1]==='>'){toks.push({op:'2>>'});i+=2}else if(line.slice(i+1,i+3)==='&1'){toks.push({op:'2>&1'});i+=3}else{toks.push({op:'2>'});i++}continue}
    if(ch==='>'&&line[i+1]==='>'){push();toks.push({op:'>>'});i+=2;continue}
    if(ch==='>'){push();toks.push({op:'>'});i++;continue}
    if(ch==='<'){push();toks.push({op:'<'});i++;continue}
    if(ch==='#'&&!has){break}
    if(ch==='$'&&line[i+1]==='('){throw new E('TuxLab no admite la sustitución de órdenes $( ) — usa tuberías | en su lugar')}
    if(ch==='$'){const m=varAt(i);if(m){cur+=getVar(m[2]||m[3]||m[4]);has=true;i+=m[0].length;continue}}
    if(ch==='~'&&!has&&(line[i+1]===undefined||line[i+1]==='/'||line[i+1]===' ')){cur+=HOME;has=true;i++;continue}
    cur+=ch;has=true;i++;
  }
  push();return toks;
}

/* ---------- ejecución ---------- */
function execLine(line,opt={}){
  const res={segs:[],status:0,clear:false};
  let toks;
  try{toks=tokenize(line)}catch(e){res.segs.push({t:'bash: '+e.message+'\n',k:'e'});res.status=2;S.status=2;return res}
  const chain=[];let cur=[],op=null;
  for(const t of toks){if(t.op===';'||t.op==='&&'||t.op==='||'||t.op==='&'){chain.push({toks:cur,op,bg:t.op==='&'});op=t.op;cur=[]}else cur.push(t)}
  chain.push({toks:cur,op});
  let ran=false;
  for(const c of chain){
    if(!c.toks.length)continue;
    if(c.op==='&&'&&res.status!==0)continue;
    if(c.op==='||'&&res.status===0)continue;
    if(c.bg){res.segs.push({t:`[1] ${S.nextPid}\n`,k:'n'})}
    runPipeline(c.toks,res,opt);ran=true;
  }
  if(!ran&&toks.some(t=>t.op&&t.op!==';'))res.segs.push({t:'bash: error de sintaxis cerca del elemento inesperado\n',k:'e'});
  return res;
}
function runPipeline(toks,res,opt){
  const stages=[[]];for(const t of toks){if(t.op==='|')stages.push([]);else stages[stages.length-1].push(t)}
  let stdin='',status=0;
  for(let si=0;si<stages.length;si++){
    const st=stages[si];const args=[];let outF=null,app=false,inF=null,errF=null,errApp=false,err2out=false;
    const ctx={root:!!opt.root,stdin,tty:false,errs:[],notes:[],status:0,depth:opt.depth||0,err(m){this.errs.push(m);this.status=1}};
    let syntax=false;
    for(let i=0;i<st.length;i++){const t=st[i];
      if(t.op){
        if(t.op==='2>&1'){err2out=true;continue}
        const nx=st[i+1];if(!nx||nx.op){syntax=true;break}i++;
        if(t.op==='>'||t.op==='>>'){outF=nx.v;app=t.op==='>>'}
        else if(t.op==='&>'){outF=nx.v;errF=nx.v}
        else if(t.op==='<')inF=nx.v;
        else if(t.op==='2>'||t.op==='2>>'){errF=nx.v;errApp=t.op==='2>>'}
      }else if(!t.q&&/[*?]/.test(t.v))args.push(...glob(t.v));else args.push(t.v);
    }
    if(syntax){res.segs.push({t:'bash: error de sintaxis cerca del elemento inesperado «newline»\n',k:'e'});status=2;break}
    ctx.tty=si===stages.length-1&&outF===null;
    let o='';
    try{
      if(inF!==null)ctx.stdin=readFile(inF,ctx,'bash');
      o=runCmd(args,ctx)??'';
    }catch(e){
      if(e instanceof E){ctx.errs.push(e.message);ctx.status=e.code||1}
      else{ctx.errs.push('bash: error interno: '+e.message);ctx.status=1;if(typeof console!=='undefined')console.error(e)}
    }
    if(ctx.clear)res.clear=true;
    for(const n of ctx.notes)res.segs.push({t:n+'\n',k:'n'});
    const errText=ctx.errs.map(x=>x+'\n').join('');
    if(err2out){o+=errText}
    else if(errF!==null&&errF!==outF){if(errText)try{writeFile(errF,errText,errApp,ctx,'bash')}catch(e){res.segs.push({t:e.message+'\n',k:'e'})}}
    else if(errF!==null&&errF===outF){o+=errText}
    else if(errText)res.segs.push({t:errText,k:'e'});
    if(outF!==null){try{writeFile(outF,strip(o),app,ctx,'bash')}catch(e){if(e instanceof E){res.segs.push({t:'bash: '+e.message.replace(/^bash: /,'')+'\n',k:'e'});ctx.status=1}else throw e}o=''}
    if(si===stages.length-1){if(o)res.segs.push({t:o})}else stdin=strip(o);
    status=ctx.status;
  }
  res.status=status;S.status=status;
}
function levenshtein(a,b){const m=[];for(let i=0;i<=a.length;i++){m[i]=[i];for(let j=1;j<=b.length;j++)m[i][j]=i?Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1)):j}return m[a.length][b.length]}
function runCmd(args,ctx){
  if(!args.length)return'';
  while(args.length&&/^[A-Za-z_]\w*=/.test(args[0])){
    const k=args[0].slice(0,args[0].indexOf('=')),v=args[0].slice(args[0].indexOf('=')+1);
    if(args.length===1){if(k in S.env)S.env[k]=v;else S.vars[k]=v;return''}
    args=args.slice(1);
  }
  const [c,...rest]=args;
  if(c.includes('/'))return execFile(c,rest,ctx);
  if(PKG_OF[c]&&!S.pkgs.has(PKG_OF[c]))fail(`No se ha encontrado la orden «${c}», pero se puede instalar con:\n\nsudo apt install ${PKG_OF[c]}`,127);
  const fn=CMDS[c];
  if(!fn){
    const best=Object.keys(CMDS).map(k=>[k,levenshtein(c,k)]).sort((a,b)=>a[1]-b[1])[0];
    fail(`${c}: orden no encontrada`+(best&&best[1]<=2&&c.length>1?`\n¿Quisiste decir «${best[0]}»?`:''),127);
  }
  if(rest[0]==='--help'&&typeof REF!=='undefined'){const r=REF.find(x=>x.c===c);if(r)return `Uso: ${r.s}\n${r.d}\n${r.o?r.o.map(x=>'  '+x).join('\n')+'\n':''}Ejemplo: ${r.e}\n`}
  return fn(rest,ctx);
}
function execFile(path,args,ctx){
  const n=node(path);
  if(!n)fail(`bash: ${path}: No existe el archivo o el directorio`,127);
  if(n.t==='d')fail(`bash: ${path}: Es un directorio`,126);
  const xbit=ctx.root?(n.m&0o111):(n.o===USER?(n.m&0o100):(n.m&1));
  if(!xbit)fail(`bash: ${path}: Permiso denegado`,126);
  return runScript(path,args,ctx);
}
function runScript(path,args,ctx){
  const n=node(path);
  if(!n)fail(`bash: ${path}: No existe el archivo o el directorio`,127);
  if(n.t==='d')fail(`bash: ${path}: Es un directorio`,126);
  if(!canR(n,ctx))fail(`bash: ${path}: Permiso denegado`,126);
  if(ctx.depth>4)fail('bash: demasiados niveles de scripts anidados');
  const saved=S.args;S.args=[path,...args];let o='',st=0;
  try{
    for(const raw of n.d.split('\n')){
      const l=raw.trim();if(!l||l.startsWith('#'))continue;
      const m=l.match(/^exit(?:\s+(\d+))?$/);if(m){st=+(m[1]||0);break}
      const r=execLine(l,{root:ctx.root,depth:ctx.depth+1});
      for(const s of r.segs){if(s.k==='e')ctx.errs.push(s.t.replace(/\n$/,''));else if(s.k==='n')ctx.notes.push(s.t.replace(/\n$/,''));else o+=strip(s.t)}
      st=r.status;
    }
  }finally{S.args=saved}
  ctx.status=st;return o;
}

/* ---------- awk mínimo ---------- */
const anum=v=>typeof v==='number'?v:(parseFloat(v)||0);
const looksNum=v=>typeof v==='number'||/^\s*[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?\s*$/i.test(v);
const atruthy=v=>typeof v==='number'?v!==0:(looksNum(v)?+v!==0:v!=='');
const afmt=v=>typeof v==='number'?(Number.isInteger(v)?String(v):String(+v.toPrecision(6))):String(v);
function sprintf(fmt,vals){let i=0;return String(fmt).replace(/%(-?)(\d*)(?:\.(\d+))?([sdif%])/g,(m,l,w,pr,t)=>{if(t==='%')return'%';const v=vals[i++];let s;if(t==='d'||t==='i')s=String(Math.trunc(anum(v)));else if(t==='f')s=anum(v).toFixed(pr===undefined?6:+pr);else s=afmt(v??'');if(w)s=l?s.padEnd(+w):s.padStart(+w);return s})}
function awkTok(s){
  const t=[];let i=0;const valPrev=()=>{const p=t[t.length-1];return p&&(p.k==='num'||p.k==='str'||p.k==='id'||p.v===')'||p.v===']')};
  while(i<s.length){const c=s[i];
    if(c==='\n'){t.push({k:'op',v:';'});i++;continue}
    if(/\s/.test(c)){i++;continue}
    if(c==='"'){let j=i+1,v='';while(j<s.length&&s[j]!=='"'){if(s[j]==='\\'){const n=s[j+1];v+=n==='n'?'\n':n==='t'?'\t':n;j+=2}else v+=s[j++]}t.push({k:'str',v});i=j+1;continue}
    if(c==='/'&&!valPrev()){let j=i+1,v='';while(j<s.length&&s[j]!=='/'){if(s[j]==='\\'){v+=s[j]+s[j+1];j+=2}else v+=s[j++]}t.push({k:'re',v});i=j+1;continue}
    const two=s.slice(i,i+2);
    if(['==','!=','>=','<=','&&','||','++','--','+=','-=','*=','/=','!~'].includes(two)){t.push({k:'op',v:two});i+=2;continue}
    const mn=s.slice(i).match(/^(\d+\.?\d*|\.\d+)/);if(mn){t.push({k:'num',v:mn[0]});i+=mn[0].length;continue}
    const mi=s.slice(i).match(/^[A-Za-z_]\w*/);if(mi){t.push({k:'id',v:mi[0]});i+=mi[0].length;continue}
    if('$+-*/%><=!(),;{}~[]?:'.includes(c)){t.push({k:'op',v:c});i++;continue}
    throw new E(`awk: carácter inesperado «${c}»`);
  }
  return t;
}
function awkCompile(tokens){
  let p=0;const peek=()=>tokens[p],nx=()=>tokens[p++],isOp=v=>peek()&&peek().k==='op'&&peek().v===v,eat=v=>{if(isOp(v)){p++;return true}return false};
  const expect=v=>{if(!eat(v))throw new E(`awk: error de sintaxis cerca de «${peek()?peek().v:'fin del programa'}»`)};
  const FUN={length:s=>String(s??'').length,toupper:s=>String(s).toUpperCase(),tolower:s=>String(s).toLowerCase(),substr:(s,a,n)=>String(s).substr(anum(a)-1,n===undefined?undefined:anum(n)),int:x=>Math.trunc(anum(x)),index:(s,t)=>String(s).indexOf(t)+1,sprintf:(f,...v)=>sprintf(f,v)};
  const ASG=['=','+=','-=','*=','/='];
  const applyOp=(op,cur,v)=>op==='='?v:op==='+='?anum(cur)+anum(v):op==='-='?anum(cur)-anum(v):op==='*='?anum(cur)*anum(v):anum(cur)/anum(v);
  function primary(){
    const t=nx();if(!t)throw new E('awk: expresión incompleta');
    if(t.k==='num'){const n=+t.v;return()=>n}
    if(t.k==='str'){return()=>t.v}
    if(t.k==='re'){const re=new RegExp(t.v);return env=>re.test(env.$0)?1:0}
    if(t.k==='op'&&t.v==='$'){const e=primary();return env=>env.field(anum(e(env)))}
    if(t.k==='op'&&t.v==='('){const e=expr();expect(')');return e}
    if(t.k==='op'&&t.v==='-'){const e=primary();return env=>-anum(e(env))}
    if(t.k==='op'&&t.v==='!'){const e=primary();return env=>atruthy(e(env))?0:1}
    if(t.k==='id'){const name=t.v;
      if(isOp('(')&&FUN[name]){p++;const a=[];if(!isOp(')')){do{a.push(expr())}while(eat(','))}expect(')');return env=>FUN[name](...a.map(x=>x(env)))}
      if(name==='length')return env=>env.$0.length;
      if(isOp('[')){p++;const k=expr();expect(']');
        if(isOp('++')||isOp('--')){const op=nx().v;return env=>{const A=env.arr(name),key=k(env),old=anum(A[key]);A[key]=old+(op==='++'?1:-1);return old}}
        return env=>env.arr(name)[k(env)]??''}
      if(isOp('++')||isOp('--')){const op=nx().v;return env=>{const old=anum(env.get(name));env.set(name,old+(op==='++'?1:-1));return old}}
      return env=>env.get(name);
    }
    throw new E(`awk: error de sintaxis cerca de «${t.v}»`);
  }
  function mul(){let l=primary();while(peek()&&peek().k==='op'&&['*','/','%'].includes(peek().v)){const op=nx().v,r=primary(),a=l;l=env=>{const x=anum(a(env)),y=anum(r(env));return op==='*'?x*y:op==='/'?x/y:x%y}}return l}
  function add(){let l=mul();while(peek()&&peek().k==='op'&&['+','-'].includes(peek().v)){const op=nx().v,r=mul(),a=l;l=env=>op==='+'?anum(a(env))+anum(r(env)):anum(a(env))-anum(r(env))}return l}
  const startsPrim=()=>{const t=peek();if(!t)return false;if(t.k==='id')return!['in','else'].includes(t.v);if(t.k!=='op')return true;return t.v==='$'||t.v==='('||t.v==='!'};
  function concat(){let l=add();while(startsPrim()){const r=add(),a=l;l=env=>afmt(a(env))+afmt(r(env))}return l}
  function cmp(){const l=concat();const t=peek();
    if(t&&t.k==='op'&&['==','!=','>','<','>=','<=','~','!~'].includes(t.v)){p++;const r=concat();const op=t.v;
      return env=>{const a=l(env),b=r(env);
        if(op==='~'||op==='!~'){const m=new RegExp(String(b)).test(String(a));return(op==='~'?m:!m)?1:0}
        const num=looksNum(a)&&looksNum(b);const x=num?anum(a):String(a),y=num?anum(b):String(b);
        return({'==':x==y,'!=':x!=y,'>':x>y,'<':x<y,'>=':x>=y,'<=':x<=y}[op])?1:0}}
    return l}
  function and(){let l=cmp();while(eat('&&')){const r=cmp(),a=l;l=env=>atruthy(a(env))&&atruthy(r(env))?1:0}return l}
  function or(){let l=and();while(eat('||')){const r=and(),a=l;l=env=>atruthy(a(env))||atruthy(r(env))?1:0}return l}
  function expr(){
    const t=peek(),t2=tokens[p+1];
    if(t&&t.k==='id'&&t2&&t2.k==='op'&&ASG.includes(t2.v)){p+=2;const e=expr(),op=t2.v;return env=>{const nv=applyOp(op,env.get(t.v),e(env));env.set(t.v,nv);return nv}}
    if(t&&t.k==='id'&&t2&&t2.v==='['){const save=p;p+=2;const k=expr();
      if(eat(']')&&peek()&&peek().k==='op'&&ASG.includes(peek().v)){const op=nx().v,e=expr();return env=>{const A=env.arr(t.v),key=k(env);A[key]=applyOp(op,A[key],e(env));return A[key]}}
      p=save}
    return or();
  }
  function stmt(){
    while(eat(';')){}const t=peek();if(!t||isOp('}'))return null;
    if(t.k==='id'&&(t.v==='print'||t.v==='printf')){p++;const a=[];
      if(peek()&&!isOp(';')&&!isOp('}')){do{a.push(expr())}while(eat(','))}
      if(t.v==='print')return env=>env.emit(a.length?a.map(x=>afmt(x(env))).join(env.OFS):env.$0);
      return env=>{const v=a.map(x=>x(env));env.raw(sprintf(v[0],v.slice(1)))}}
    if(t.k==='id'&&t.v==='if'){p++;expect('(');const c=expr();expect(')');const s1=block();while(eat(';')){}let s2=null;if(peek()&&peek().k==='id'&&peek().v==='else'){p++;s2=block()}return env=>{if(atruthy(c(env)))s1&&s1(env);else if(s2)s2(env)}}
    if(t.k==='id'&&t.v==='for'){p++;expect('(');const kv=nx().v;const it=nx();if(!it||it.v!=='in')throw new E('awk: TuxLab solo admite «for (clave in arreglo)»');const an=nx().v;expect(')');const b=block();return env=>{for(const key of Object.keys(env.arr(an))){env.set(kv,key);b&&b(env)}}}
    const e=expr();return env=>{e(env)};
  }
  function block(){if(eat('{')){const ss=[];while(peek()&&!isOp('}')){const s=stmt();if(s)ss.push(s);while(eat(';')){}}expect('}');return env=>ss.forEach(s=>s(env))}return stmt()}
  const rules=[];
  while(p<tokens.length){while(eat(';')){}if(p>=tokens.length)break;
    let type='main',cond=null;const t=peek();
    if(t.k==='id'&&(t.v==='BEGIN'||t.v==='END')){type=t.v;p++}else if(!isOp('{'))cond=expr();
    const body=isOp('{')?block():(env=>env.emit(env.$0));
    rules.push({type,cond,body});
  }
  return rules;
}
function runAwk(prog,text,FS,vars){
  if(FS!==null)FS=FS.replace(/\\t/g,'\t');
  const rules=awkCompile(awkTok(prog));const V={...vars},A={};let o='';
  const env={OFS:' ',$0:'',F:[],NR:0,
    get(n){if(n==='NR')return this.NR;if(n==='NF')return this.F.length;if(n==='FS')return FS??' ';return V[n]??''},
    set(n,v){if(n==='OFS')this.OFS=v;else V[n]=v},arr(n){return A[n]??=({})},
    field(i){return i===0?this.$0:(this.F[i-1]??'')},emit(s){o+=s+'\n'},raw(s){o+=s}};
  const splitF=l=>FS===null||FS===' '?l.trim().split(/\s+/).filter(Boolean):FS.length===1?l.split(FS):l.split(new RegExp(FS));
  rules.filter(r=>r.type==='BEGIN').forEach(r=>r.body(env));
  const mains=rules.filter(r=>r.type==='main');
  if(mains.length||rules.some(r=>r.type==='END'))for(const l of lines(text)){env.NR++;env.$0=l;env.F=splitF(l);for(const r of mains)if(!r.cond||atruthy(r.cond(env)))r.body(env)}
  rules.filter(r=>r.type==='END').forEach(r=>r.body(env));
  return o;
}

/* ---------- sed mínimo ---------- */
function parseSed(s){
  s=s.trim();let i=0,addr=null;
  if(/^\d+/.test(s)){const m=s.match(/^\d+/)[0];addr={n:+m};i=m.length}
  else if(s[0]==='$'){addr={last:true};i=1}
  else if(s[0]==='/'){let j=1,r='';while(j<s.length&&s[j]!=='/'){if(s[j]==='\\'&&s[j+1]==='/'){r+='/';j+=2}else r+=s[j++]}addr={re:new RegExp(r)};i=j+1}
  const c=s[i];
  if(c==='d'||c==='p')return{addr,c};
  if(c==='s'){const d=s[i+1];if(!d)throw new E('sed: -e expresión #1: orden «s» sin terminar');let j=i+2;const parts=[''];
    while(j<s.length&&parts.length<=3){const ch=s[j];if(ch==='\\'&&s[j+1]===d){parts[parts.length-1]+=d;j+=2;continue}if(ch==='\\'){parts[parts.length-1]+=ch+(s[j+1]??'');j+=2;continue}if(ch===d){parts.push('');j++;if(parts.length===3)break;continue}parts[parts.length-1]+=ch;j++}
    if(parts.length<3)throw new E('sed: -e expresión #1: orden «s» sin terminar');
    const flags=s.slice(j);let re;try{re=new RegExp(parts[0].replace(/\\\(/g,'(').replace(/\\\)/g,')'),(flags.includes('g')?'g':'')+(/[iI]/.test(flags)?'i':''))}catch{throw new E('sed: expresión regular inválida')}
    let rep=parts[1].replace(/\$/g,'$$$$').replace(/\\(\d)/g,'$$$1').replace(/(^|[^\\])&/g,'$1$$&').replace(/\\&/g,'&').replace(/\\n/g,'\n');
    return{addr,c:'s',re,rep,pf:flags.includes('p')};
  }
  throw new E(`sed: -e expresión #1, carácter ${i+1}: orden desconocida: «${c??''}»`);
}
function runSed(cmds,text,quiet){
  const L=lines(text);const o=[];
  L.forEach((l,idx)=>{let del=false;const extra=[];
    for(const c of cmds){
      const hit=!c.addr||(c.addr.n!==undefined&&c.addr.n===idx+1)||(c.addr.last&&idx===L.length-1)||(c.addr.re&&c.addr.re.test(l));
      if(!hit)continue;
      if(c.c==='d'){del=true;break}
      if(c.c==='p')extra.push(l);
      if(c.c==='s'){c.re.lastIndex=0;const nl=l.replace(c.re,c.rep);if(nl!==l&&c.pf)extra.push(nl);l=nl}
    }
    if(!del){o.push(...extra);if(!quiet)o.push(l)}
  });
  return out(o);
}

/* ---------- paquetes y servicios ---------- */
const REPO={nginx:'1.24.0-2ubuntu7',htop:'3.3.0-4build1',tree:'2.1.1-2',git:'1:2.43.0-1ubuntu7',vim:'2:9.1.0016-1ubuntu7',python3:'3.12.3-0ubuntu2',neofetch:'7.1.0-4',cowsay:'3.03+dfsg2-8',sl:'5.02-1',apache2:'2.4.58-1ubuntu8','mariadb-server':'1:10.11.8-0ubuntu0.24.04.1',curl:'8.5.0-2ubuntu10',nano:'7.2-2build1',bash:'5.2.21-2ubuntu4',coreutils:'9.4-3ubuntu6',grep:'3.11-4build1',sed:'4.9-2build1',gawk:'1:5.2.1-2build3','openssh-server':'1:9.6p1-3ubuntu13',fortune:'1:1.99.1-7.3'};
const PKG_DESC={nginx:'servidor web pequeño, potente y escalable',htop:'visor de procesos interactivo',tree:'muestra directorios en forma de árbol',git:'sistema de control de versiones distribuido',vim:'editor vi mejorado',python3:'lenguaje de programación interactivo',neofetch:'muestra información del sistema con un logo',cowsay:'una vaca configurable que habla',sl:'locomotora de vapor que corre por tu terminal',apache2:'servidor HTTP Apache','mariadb-server':'servidor de base de datos MariaDB',fortune:'frases aleatorias'};
const PKG_OF={cowsay:'cowsay',neofetch:'neofetch',htop:'htop',sl:'sl',git:'git',vim:'vim',vi:'vim',python3:'python3',python:'python3',nginx:'nginx',fortune:'fortune'};
const SVC_OF={nginx:['nginx','A high performance web server and a reverse proxy server'],apache2:['apache2','The Apache HTTP Server'],'mariadb-server':['mariadb','MariaDB 10.11.8 database server']};

function svcStatus(name,s){
  const on=s.active;const d=new Date(s.since||Date.now());
  const ago=Math.max(1,Math.round((Date.now()-(s.since||Date.now()))/1000));
  const agoS=ago<60?`${ago}s`:ago<3600?`${Math.round(ago/60)}min`:ago<86400?`${Math.round(ago/3600)}h`:`${Math.round(ago/86400)} days`;
  const L=[(on?'\u0001g●\u0002':'○')+` ${name}.service - ${s.desc}`,
    `     Loaded: loaded (/usr/lib/systemd/system/${name}.service; ${s.enabled?'enabled':'disabled'}; preset: enabled)`,
    `     Active: ${on?`\u0001gactive (running)\u0002 since ${DOW[d.getDay()]} ${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())} CST; ${agoS} ago`:'inactive (dead)'}`];
  if(on)L.push(`   Main PID: ${s.pid} (${name})`,`      Tasks: ${name==='nginx'?3:1} (limit: 4558)`,`     Memory: ${name==='nginx'?'2.9M':'1.8M'}`,`     CGroup: /system.slice/${name}.service`,
    name==='nginx'?`             ├─${s.pid} "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"\n             └─${s.pid+1} "nginx: worker process"`:`             └─${s.pid} ${S.procs.find(p=>p.pid===s.pid)?.cmd||name}`);
  return L.join('\n')+'\n';
}

/* ---------- órdenes ---------- */
const COW=(msg)=>{const m=msg||'Muuu';const b='_'.repeat(m.length+2),d='-'.repeat(m.length+2);return ` ${b}\n< ${m} >\n ${d}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||\n`};
const TUX=['        #####','       #######','       ##O#O##','       #VVVVV#','     ##  VVV  ##','    #          ##','   #            ##','   #            ###','  QQ#           ##Q','QQQQQQ#       #QQQQQQ','QQQQQQQ#     #QQQQQQQ','  QQQQQ#######QQQQQ'];

const CMDS={
  pwd:()=>S.cwd+'\n',
  whoami:(a,ctx)=>(ctx.root?'root':USER)+'\n',
  hostname:()=>HOST+'\n',
  ls(a,ctx){
    const {f,rest}=opts(a);const all=f.has('a'),A=f.has('A'),L=f.has('l'),H=f.has('h'),R=f.has('R'),one=f.has('1');
    const fmtL=(nm,n)=>`${modeStr(n)} ${n.t==='d'?2:1} ${n.o.padEnd(10)} ${n.o.padEnd(10)} ${(H?hsize(nsize(n)):String(nsize(n))).padStart(6)} ${dateStr(n.mt)} ${col(nm,n,ctx)}`;
    const join=items=>L?items.map(([nm,n])=>fmtL(nm,n)):(ctx.tty&&!one?[items.map(([nm,n])=>col(nm,n,ctx)).join('  ')]:items.map(([nm])=>nm));
    const targets=rest.length?rest:['.'];const files=[],dirs=[];
    for(const t of targets){const n=node(t);if(!n){ctx.err(`ls: no se puede acceder a '${t}': No existe el archivo o el directorio`);ctx.status=2;continue}(n.t==='d'?dirs:files).push([t,n])}
    const res=[];if(files.length)res.push(...join(files));
    const hdr=targets.length>1||R;
    const listDir=(t,n)=>{
      if(res.length)res.push('');if(hdr)res.push(t+':');
      if(!canR(n,ctx)){ctx.err(`ls: no se puede abrir el directorio '${t}': Permiso denegado`);return}
      let names=Object.keys(n.c).sort((x,y)=>x.replace(/^\./,'').localeCompare(y.replace(/^\./,''),'es'));
      if(!all&&!A)names=names.filter(x=>x[0]!=='.');
      let items=names.map(x=>[x,n.c[x]]);if(all)items=[['.',n],['..',n],...items];
      if(L)res.push('total '+items.length*4);if(items.length)res.push(...join(items));
      if(R)for(const [x,c] of items)if(c.t==='d'&&x!=='.'&&x!=='..')listDir((t==='/'?'':t.replace(/\/$/,''))+'/'+x,c);
    };
    for(const [t,n] of dirs)listDir(t,n);
    return out(res);
  },
  ll:(a,ctx)=>CMDS.ls(['-l',...a],ctx),
  la:(a,ctx)=>CMDS.ls(['-A',...a],ctx),
  cd(a,ctx){
    let t=a[0];if(t===undefined||t==='~')t=HOME;if(t==='-')t=S.env.OLDPWD;
    const n=node(t);
    if(!n)fail(`bash: cd: ${a[0]}: No existe el archivo o el directorio`);
    if(n.t!=='d')fail(`bash: cd: ${a[0]}: No es un directorio`);
    if(!canR(n,ctx))fail(`bash: cd: ${a[0]}: Permiso denegado`);
    S.env.OLDPWD=S.cwd;S.cwd=norm(t);S.env.PWD=S.cwd;return a[0]==='-'?S.cwd+'\n':'';
  },
  tree(a,ctx){
    const {f,v,rest}=opts(a,'L');const t=rest[0]||'.';const n=node(t);
    if(!n||n.t!=='d')fail(`${t}  [error al abrir el directorio]`);
    const res=[col(t,n,ctx)];let nd=0,nf=0;const max=v.L?+v.L:99;
    const rec=(n,pre,depth)=>{const names=Object.keys(n.c).filter(x=>f.has('a')||x[0]!=='.').sort((x,y)=>x.localeCompare(y,'es'));
      names.forEach((x,i)=>{const c=n.c[x],last=i===names.length-1;res.push(pre+(last?'└── ':'├── ')+col(x,c,ctx));
        if(c.t==='d'){nd++;if(canR(c,ctx)&&depth<max)rec(c,pre+(last?'    ':'│   '),depth+1)}else nf++})};
    if(canR(n,ctx))rec(n,'',1);
    res.push('',`${nd} directorios, ${nf} archivos`);return out(res);
  },
  mkdir(a,ctx){
    const {f,rest}=opts(a);if(!rest.length)fail('mkdir: falta un operando');
    each(rest,ctx,p=>{
      if(f.has('p')){let cur=S.fs;for(const s of norm(p).slice(1).split('/').filter(Boolean)){
        if(!cur.c[s]){if(!canW(cur,ctx))fail(`mkdir: no se puede crear el directorio «${p}»: Permiso denegado`);cur.c[s]=D({},ctx.root?'root':USER)}
        else if(cur.c[s].t!=='d')fail(`mkdir: no se puede crear el directorio «${p}»: El archivo ya existe`);
        cur=cur.c[s]}return}
      const {pp,name}=split(p);const d=node(pp);
      if(!d||d.t!=='d')fail(`mkdir: no se puede crear el directorio «${p}»: No existe el archivo o el directorio`);
      if(d.c[name])fail(`mkdir: no se puede crear el directorio «${p}»: El archivo ya existe`);
      if(!canW(d,ctx))fail(`mkdir: no se puede crear el directorio «${p}»: Permiso denegado`);
      d.c[name]=D({},ctx.root?'root':USER);
    });
  },
  rmdir(a,ctx){
    const {rest}=opts(a);if(!rest.length)fail('rmdir: falta un operando');
    each(rest,ctx,p=>{const n=node(p);if(!n)fail(`rmdir: fallo al borrar '${p}': No existe el archivo o el directorio`);
      if(n.t!=='d')fail(`rmdir: fallo al borrar '${p}': No es un directorio`);
      if(Object.keys(n.c).length)fail(`rmdir: fallo al borrar '${p}': El directorio no está vacío`);
      const {pp,name}=split(p);const d=node(pp);if(!canW(d,ctx))fail(`rmdir: fallo al borrar '${p}': Permiso denegado`);delete d.c[name]});
  },
  touch(a,ctx){
    const {rest}=opts(a);if(!rest.length)fail('touch: falta un operando de archivo');
    each(rest,ctx,p=>{const n=node(p);if(n){n.mt=Date.now();return}
      try{writeFile(p,'',false,ctx,'touch')}catch(e){fail(`touch: no se puede efectuar 'touch' sobre '${p}': ${e.message.split(': ').pop()}`)}});
  },
  cat(a,ctx){const {f,rest}=opts(a);let s=inputOf(rest,ctx,'cat');if(f.has('n'))s=out(lines(s).map((l,i)=>String(i+1).padStart(6)+'\t'+l));return s},
  less:(a,ctx)=>CMDS.cat(a,ctx), more:(a,ctx)=>CMDS.cat(a,ctx),
  echo(a){let n=false,e=false;while(a[0]&&/^-[neE]+$/.test(a[0])){if(a[0].includes('n'))n=true;if(a[0].includes('e'))e=true;a=a.slice(1)}let s=a.join(' ');if(e)s=s.replace(/\\n/g,'\n').replace(/\\t/g,'\t');return s+(n?'':'\n')},
  printf(a){if(!a.length)fail('printf: uso: printf formato [argumentos]');return sprintf(a[0].replace(/\\n/g,'\n').replace(/\\t/g,'\t'),a.slice(1))},
  head:(a,ctx)=>headTail(a,ctx,false), tail:(a,ctx)=>headTail(a,ctx,true),
  wc(a,ctx){
    const {f,rest}=opts(a);const sel=new Set([...f].filter(x=>'lwcm'.includes(x)));if(!sel.size)['l','w','c'].forEach(x=>sel.add(x));
    const vals=s=>{const v=[];if(sel.has('l'))v.push((s.match(/\n/g)||[]).length);if(sel.has('w'))v.push(s.split(/\s+/).filter(Boolean).length);if(sel.has('c')||sel.has('m'))v.push(sel.has('m')?[...s].length:bytes(s));return v};
    const fmt=(v,name)=>(v.length===1?String(v[0]):v.map(x=>String(x).padStart(4)).join(' '))+(name?' '+name:'');
    if(!rest.length)return fmt(vals(ctx.stdin),'')+'\n';
    const res=[];const tot=[];
    each(rest,ctx,p=>{const v=vals(readFile(p,ctx,'wc'));v.forEach((x,i)=>tot[i]=(tot[i]||0)+x);res.push(fmt(v,p))});
    if(rest.length>1)res.push(fmt(tot,'total'));return out(res);
  },
  cp(a,ctx){
    const {f,rest}=opts(a);if(rest.length<2)fail(rest.length?`cp: falta el archivo de destino después de '${rest[0]}'`:'cp: falta un operando');
    const dst=rest.pop();const dn=node(dst);
    if(rest.length>1&&(!dn||dn.t!=='d'))fail(`cp: el destino '${dst}' no es un directorio`);
    each(rest,ctx,src=>{
      const sn=node(src);if(!sn)fail(`cp: no se puede efectuar 'stat' sobre '${src}': No existe el archivo o el directorio`);
      if(sn.t==='d'&&!f.has('r')&&!f.has('R')&&!f.has('a'))fail(`cp: -r no especificado; se omite el directorio '${src}'`);
      if(!canR(sn,ctx))fail(`cp: no se puede abrir '${src}' para lectura: Permiso denegado`);
      let parent,name;const d=node(dst);
      if(d&&d.t==='d'){parent=d;name=split(src).name}else{const s=split(dst);parent=node(s.pp);name=s.name;if(!parent||parent.t!=='d')fail(`cp: no se puede crear el fichero regular '${dst}': No existe el archivo o el directorio`)}
      if(!canW(parent,ctx))fail(`cp: no se puede crear el fichero regular '${dst}': Permiso denegado`);
      if(sn.t==='d'&&(norm(dst)+'/').startsWith(norm(src)+'/'))fail(`cp: no se puede copiar un directorio, '${src}', en sí mismo`);
      if(parent.c[name]&&parent.c[name].t==='d'&&sn.t!=='d')fail(`cp: no se puede sobrescribir el directorio '${name}' con un no-directorio`);
      const c=clone(sn);const own=x=>{x.o=ctx.root?'root':USER;x.mt=Date.now();if(x.t==='d')Object.values(x.c).forEach(own)};own(c);parent.c[name]=c;
    });
  },
  mv(a,ctx){
    const {rest}=opts(a);if(rest.length<2)fail(rest.length?`mv: falta el archivo de destino después de '${rest[0]}'`:'mv: falta un operando');
    const dst=rest.pop();const dn=node(dst);
    if(rest.length>1&&(!dn||dn.t!=='d'))fail(`mv: el destino '${dst}' no es un directorio`);
    each(rest,ctx,src=>{
      const sn=node(src);if(!sn)fail(`mv: no se puede efectuar 'stat' sobre '${src}': No existe el archivo o el directorio`);
      const s=split(src);const sp=node(s.pp);if(!canW(sp,ctx))fail(`mv: no se puede mover '${src}': Permiso denegado`);
      let parent,name;const d=node(dst);
      if(d&&d.t==='d'){parent=d;name=s.name}else{const t=split(dst);parent=node(t.pp);name=t.name;if(!parent||parent.t!=='d')fail(`mv: no se puede mover '${src}' a '${dst}': No existe el archivo o el directorio`)}
      if(!canW(parent,ctx))fail(`mv: no se puede mover '${src}' a '${dst}': Permiso denegado`);
      const target=(norm(dst)+'/');if(sn.t==='d'&&target.startsWith(s.full+'/')&&norm(dst)!==s.full)fail(`mv: no se puede mover '${src}' a un subdirectorio de sí mismo, '${dst}/${s.name}'`);
      if(parent===sp&&name===s.name)return;
      delete sp.c[s.name];parent.c[name]=sn;
    });
  },
  rm(a,ctx){
    const {f,rest}=opts(a);if(!rest.length)fail('rm: falta un operando');
    each(rest,ctx,p=>{
      if(p==='.'||p==='..'||/\/\.\.?$/.test(p))fail(`rm: no se permite borrar el directorio «.» o «..»: se omite '${p}'`);
      const full=norm(p);
      if(full==='/')fail('rm: es peligroso operar recursivamente sobre «/» — en TuxLab el sistema está protegido 😉');
      if(full===HOME||full==='/home')fail('rm: TuxLab protege tu directorio personal; borra cosas concretas dentro de él');
      const n=node(p);
      if(!n){if(f.has('f'))return;fail(`rm: no se puede borrar '${p}': No existe el archivo o el directorio`)}
      if(n.t==='d'&&!f.has('r')&&!f.has('R'))fail(`rm: no se puede borrar '${p}': Es un directorio`);
      const {pp,name}=split(p);const d=node(pp);if(!canW(d,ctx))fail(`rm: no se puede borrar '${p}': Permiso denegado`);
      delete d.c[name];
      if(S.cwd===full||S.cwd.startsWith(full+'/')){S.cwd=pp;S.env.PWD=pp}
    });
  },
  grep(a,ctx){
    const {f,v,rest}=opts(a,'e');let pat=v.e??rest.shift();
    if(pat===undefined)fail('Uso: grep [OPCIÓN]... PATRONES [ARCHIVO]...',2);
    const fl=f.has('i')?'i':'';let re;
    try{re=new RegExp(f.has('F')?escRe(pat):pat,fl)}catch{re=new RegExp(escRe(pat),fl)}
    if(f.has('w'))re=new RegExp('\\b(?:'+re.source+')\\b',fl);
    const srcs=[];const rec=f.has('r')||f.has('R');
    if(!rest.length&&!rec)srcs.push([null,ctx.stdin]);
    for(const p of (rest.length?rest:(rec?['.']:[]))){const n=node(p);
      if(n&&n.t==='d'){if(rec){for(const [pp,nn] of walk(p==='.'?'.':p.replace(/\/$/,''),n))if(nn.t==='f'&&canR(nn,ctx))srcs.push([pp.replace(/^\.\//,''),nn.d])}else ctx.err(`grep: ${p}: Es un directorio`);continue}
      try{srcs.push([p,readFile(p,ctx,'grep')])}catch(e){if(e instanceof E)ctx.err(e.message);else throw e}}
    const multi=srcs.length>1||rec;const res=[];let total=0;
    const hl=l=>ctx.tty?l.replace(new RegExp(re.source,re.flags+'g'),m=>m?'\u0001r'+m+'\u0002':m):l;
    for(const [name,txt] of srcs){let c=0;
      lines(txt).forEach((l,i)=>{if(re.test(l)!==f.has('v')){c++;if(!f.has('c')&&!f.has('l'))res.push((multi?(ctx.tty?'\u0001m'+name+'\u0002:':name+':'):'')+(f.has('n')?(ctx.tty?'\u0001g'+(i+1)+'\u0002:':(i+1)+':'):'')+(f.has('v')?l:hl(l)))}});
      if(f.has('c'))res.push((multi?name+':':'')+c);if(f.has('l')&&c)res.push(name);total+=c}
    if(!total&&!ctx.errs.length)ctx.status=1;else if(ctx.errs.length)ctx.status=2;
    return out(res);
  },
  sort(a,ctx){
    const {f,v,rest}=opts(a,'kto');const L=lines(inputOf(rest,ctx,'sort'));
    const numeric=f.has('n')||/n/.test(v.k||'');const kf=v.k?parseInt(v.k):0;
    const key=l=>{if(!kf)return l;const parts=v.t!==undefined?l.split(v.t):l.trim().split(/\s+/);return parts.slice(kf-1).join(v.t??' ')};
    const cmp=(x,y)=>{const a1=key(x),b1=key(y);if(numeric){const d=(parseFloat(a1)||0)-(parseFloat(b1)||0);if(d)return d}
      const r=f.has('f')?a1.toLowerCase().localeCompare(b1.toLowerCase(),'es'):a1.localeCompare(b1,'es');return r||(x<y?-1:x>y?1:0)};
    let r=[...L].sort(cmp);if(f.has('r'))r.reverse();if(f.has('u'))r=r.filter((x,i)=>i===0||cmp(x,r[i-1])!==0);
    if(v.o){writeFile(v.o,out(r),false,ctx,'sort');return''}
    return out(r);
  },
  uniq(a,ctx){
    const {f,rest}=opts(a);const L=lines(inputOf(rest.slice(0,1),ctx,'uniq'));const g=[];
    for(const l of L){const k=f.has('i')?l.toLowerCase():l;if(g.length&&g[g.length-1].k===k)g[g.length-1].n++;else g.push({k,l,n:1})}
    let r=g;if(f.has('d'))r=r.filter(x=>x.n>1);if(f.has('u'))r=r.filter(x=>x.n===1);
    return out(r.map(x=>f.has('c')?String(x.n).padStart(7)+' '+x.l:x.l));
  },
  cut(a,ctx){
    const {v,rest}=opts(a,'dfcb');
    const parseList=s=>{const set=[];for(const p of String(s).split(',')){const m=p.match(/^(\d*)-(\d*)$/);if(m)set.push([m[1]?+m[1]:1,m[2]?+m[2]:1e6]);else if(/^\d+$/.test(p))set.push([+p,+p]);else fail(`cut: valor de campo inválido «${p}»`)}return i=>set.some(([lo,hi])=>i>=lo&&i<=hi)};
    const L=lines(inputOf(rest,ctx,'cut'));
    if(v.c||v.b){const inn=parseList(v.c||v.b);return out(L.map(l=>[...l].filter((_,i)=>inn(i+1)).join('')))}
    if(!v.f)fail('cut: debe especificar una lista de bytes, caracteres o campos\nPruebe \'cut --help\' para más información.');
    const d=v.d??'\t';if([...d].length!==1)fail('cut: el delimitador debe ser un solo carácter');
    const inn=parseList(v.f);
    return out(L.map(l=>l.includes(d)?l.split(d).filter((_,i)=>inn(i+1)).join(d):l));
  },
  tr(a,ctx){
    let del=false,sq=false;const r=[];for(const x of a){if(x==='-d')del=true;else if(x==='-s')sq=true;else if(x==='-ds'||x==='-sd'){del=true;sq=true}else r.push(x)}
    if(!r.length)fail('tr: falta un operando');
    if(r.length>(del&&!sq?1:2))fail(`tr: operando extra «${r[r.length-1]}»\nConsejo: tr solo lee de la entrada estándar. Usa: cat archivo | tr ...`);
    const ex=s=>{s=s.replace(/\[:lower:\]/g,'a-z').replace(/\[:upper:\]/g,'A-Z').replace(/\[:digit:\]/g,'0-9').replace(/\[:space:\]/g,' \t\n').replace(/\\n/g,'\n').replace(/\\t/g,'\t');
      const o=[];const ch=[...s];for(let i=0;i<ch.length;i++){if(ch[i+1]==='-'&&ch[i+2]!==undefined){for(let c=ch[i].codePointAt(0);c<=ch[i+2].codePointAt(0);c++)o.push(String.fromCodePoint(c));i+=2}else o.push(ch[i])}return o};
    let txt=ctx.stdin;const s1=ex(r[0]);
    if(del){const st=new Set(s1);txt=[...txt].filter(c=>!st.has(c)).join('')}
    else if(r[1]!==undefined){const s2=ex(r[1]);const m=new Map();s1.forEach((c,i)=>m.set(c,s2[Math.min(i,s2.length-1)]));txt=[...txt].map(c=>m.has(c)?m.get(c):c).join('')}
    if(sq){const st=new Set(del?ex(r[1]||''):(r[1]!==undefined?ex(r[1]):s1));const arr=[...txt];txt=arr.filter((c,i)=>!(i>0&&c===arr[i-1]&&st.has(c))).join('')}
    return txt;
  },
  find(a,ctx){
    let i=0;const paths=[];while(i<a.length&&!a[i].startsWith('-'))paths.push(a[i++]);if(!paths.length)paths.push('.');
    const tests=[];let maxd=1e9,mind=0;
    while(i<a.length){const k=a[i++];
      if(k==='-name'||k==='-iname'){const g=a[i++];if(g===undefined)fail(`find: falta un argumento para «${k}»`);const re=globRe(g,k==='-iname');tests.push((nm)=>re.test(nm))}
      else if(k==='-type'){const t=a[i++];if(!['f','d'].includes(t))fail(`find: argumento desconocido para -type: ${t}`);tests.push((nm,n)=>n.t===t)}
      else if(k==='-maxdepth')maxd=+a[i++];else if(k==='-mindepth')mind=+a[i++];
      else if(k==='-empty')tests.push((nm,n)=>n.t==='d'?!Object.keys(n.c).length:!n.d);
      else if(k==='-size'){const s=a[i++]||'';const m=s.match(/^([+-]?)(\d+)([ckMG]?)$/);if(!m)fail(`find: tamaño inválido «${s}»`);const mul={c:1,k:1024,M:1048576,G:1073741824,'':512}[m[3]];const lim=+m[2]*mul;tests.push((nm,n)=>{if(n.t!=='f')return false;const b=bytes(n.d);return m[1]==='+'?b>lim:m[1]==='-'?b<lim:Math.ceil(b/mul)===+m[2]})}
      else if(k==='-user'){const u=a[i++];tests.push((nm,n)=>n.o===u)}
      else if(k==='-perm'){const pm=parseInt(a[i++],8);tests.push((nm,n)=>n.m===pm)}
      else if(k==='-print'){}
      else fail(`find: predicado desconocido «${k}»`);
    }
    const res=[];
    for(const p of paths){const n=node(p);if(!n){ctx.err(`find: '${p}': No existe el archivo o el directorio`);continue}
      const rec=(dp,n,nm,depth)=>{
        if(depth>=mind&&tests.every(t=>t(nm,n)))res.push(dp);
        if(n.t==='d'&&depth<maxd){if(!canR(n,ctx)){ctx.err(`find: '${dp}': Permiso denegado`);return}
          for(const k of Object.keys(n.c).sort())rec((dp==='/'?'':dp.replace(/\/$/,''))+'/'+k,n.c[k],k,depth+1)}};
      rec(p,n,split(p).name||'/',0)}
    return out(res);
  },
  chmod(a,ctx){
    const args=[...a];let R=false;if(args[0]==='-R'){R=true;args.shift()}
    const mode=args.shift();if(!mode)fail('chmod: falta un operando');if(!args.length)fail(`chmod: falta un operando después de «${mode}»`);
    each(args,ctx,p=>{const n=node(p);if(!n)fail(`chmod: no se puede acceder a '${p}': No existe el archivo o el directorio`);
      if(!ctx.root&&n.o!==USER)fail(`chmod: cambiando los permisos de '${p}': Operación no permitida`);
      const ap=x=>{x.m=calcMode(x.m,mode);if(R&&x.t==='d')Object.values(x.c).forEach(ap)};ap(n)});
  },
  chown(a,ctx){
    const args=a.filter(x=>x!=='-R');const [spec,...files]=args;if(!spec||!files.length)fail('chown: falta un operando');
    if(!ctx.root)fail(`chown: cambiando el propietario de '${files[0]}': Operación no permitida\nConsejo: cambiar propietarios requiere sudo`);
    const u=spec.split(':')[0];if(!node('/etc/passwd').d.split('\n').some(l=>l.split(':')[0]===u))fail(`chown: usuario inválido: «${spec}»`);
    each(files,ctx,p=>{const n=node(p);if(!n)fail(`chown: no se puede acceder a '${p}': No existe el archivo o el directorio`);const ap=x=>{x.o=u;if(a.includes('-R')&&x.t==='d')Object.values(x.c).forEach(ap)};ap(n)});
  },
  stat(a,ctx){const res=[];each(a,ctx,p=>{const n=node(p);if(!n)fail(`stat: no se puede efectuar 'stat' sobre '${p}': No existe el archivo o el directorio`);
    res.push(`  Fichero: ${p}`,`   Tamaño: ${nsize(n)}\tTipo: ${n.t==='d'?'directorio':'fichero regular'}`,`   Acceso: (0${(n.m).toString(8)}/${modeStr(n)})  Uid: ( ${n.o})   Gid: ( ${n.o})`,`Modificación: ${new Date(n.mt).toLocaleString('es')}`)});return out(res)},
  file(a,ctx){const res=[];each(a,ctx,p=>{const n=node(p);if(!n)fail(`${p}: cannot open \`${p}' (No such file or directory)`);res.push(`${p}: `+(n.t==='d'?'directory':n.d.startsWith('#!')?'Bourne-Again shell script, Unicode text, UTF-8 text executable':!n.d?'empty':/[^\x00-\x7f]/.test(n.d)?'Unicode text, UTF-8 text':/,/.test(n.d.split('\n')[0])&&p.endsWith('.csv')?'CSV ASCII text':'ASCII text'))});return out(res)},
  basename:a=>(a[0]||'').replace(/\/+$/,'').split('/').pop().replace(new RegExp(escRe(a[1]||'')+'$'),'')+'\n',
  dirname:a=>{const s=(a[0]||'.').replace(/\/+$/,'');const i=s.lastIndexOf('/');return(i<0?'.':i===0?'/':s.slice(0,i))+'\n'},
  env:()=>out(Object.entries(S.env).map(([k,v])=>`${k}=${v}`)),
  printenv:a=>a.length?out(a.map(k=>S.env[k]).filter(x=>x!==undefined)):CMDS.env(),
  export(a){
    if(!a.length||a[0]==='-p')return out(Object.entries(S.env).map(([k,v])=>`declare -x ${k}="${v}"`));
    for(const x of a){const i=x.indexOf('=');if(i<0){if(x in S.vars){S.env[x]=S.vars[x];delete S.vars[x]}else S.env[x]=S.env[x]??''}else{if(!/^[A-Za-z_]\w*$/.test(x.slice(0,i)))fail(`bash: export: «${x}»: no es un identificador válido`);S.env[x.slice(0,i)]=x.slice(i+1);delete S.vars[x.slice(0,i)]}}
  },
  unset(a){for(const k of a){delete S.env[k];delete S.vars[k]}},
  alias:()=>"alias la='ls -A'\nalias ll='ls -l'\n",
  type(a){return out(a.map(c=>c==='ll'||c==='la'?`${c} es un alias de «${c==='ll'?'ls -l':'ls -A'}»`:['cd','echo','export','pwd','history','type','alias','unset','exit','source'].includes(c)?`${c} es una orden interna del shell`:CMDS[c]?`${c} es /usr/bin/${c}`:`bash: type: ${c}: no se encontró`))},
  which(a,ctx){const r=[];for(const c of a){if(CMDS[c]&&!PKG_OF[c]||PKG_OF[c]&&S.pkgs.has(PKG_OF[c]))r.push((c==='nginx'?'/usr/sbin/':'/usr/bin/')+c);else ctx.status=1}return out(r)},
  date(a){const d=new Date();if(a[0]&&a[0].startsWith('+')){const M={Y:d.getFullYear(),m:p2(d.getMonth()+1),d:p2(d.getDate()),H:p2(d.getHours()),M:p2(d.getMinutes()),S:p2(d.getSeconds()),A:['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][d.getDay()],B:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][d.getMonth()],F:`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`,T:`${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`,s:Math.floor(d/1000)};return a.join(' ').slice(1).replace(/%([A-Za-z%])/g,(m,c)=>c==='%'?'%':M[c]??m)+'\n'}
    return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())} CST\n`},
  cal(){const d=new Date(),y=d.getFullYear(),m=d.getMonth();const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();const title=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][m]+' '+y;
    const L=[' '.repeat(Math.floor((20-title.length)/2))+title,'do lu ma mi ju vi sá'];let row=' '.repeat(first*3);for(let i=1;i<=days;i++){row+=(i===d.getDate()?'\u0001r'+String(i).padStart(2)+'\u0002':String(i).padStart(2))+' ';if((first+i)%7===0){L.push(row.trimEnd());row=''}}if(row)L.push(row.trimEnd());return out(L)},
  uname(a){const {f}=opts(a);if(f.has('a'))return 'Linux tuxlab 6.8.0-48-generic #48-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux\n';const r=[];if(f.has('s')||!f.size)r.push('Linux');if(f.has('n'))r.push('tuxlab');if(f.has('r'))r.push('6.8.0-48-generic');if(f.has('m'))r.push('x86_64');if(f.has('o'))r.push('GNU/Linux');return r.join(' ')+'\n'},
  lsb_release:()=>'Distributor ID:\tUbuntu\nDescription:\tUbuntu 24.04.1 LTS\nRelease:\t24.04\nCodename:\tnoble\n',
  uptime:()=>{const d=new Date();return ` ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())} up 3 days,  4:12,  1 user,  load average: 0,98, 0,85, 0,77\n`},
  history(a){if(a[0]==='-c'){S.hist.length=0;return''}return out(S.hist.map((h,i)=>String(i+1).padStart(5)+'  '+h))},
  clear(a,ctx){ctx.clear=true;return''},
  exit:()=>'logout\n(En TuxLab no hay salida: ¡sigue practicando! 🐧)\n', logout:()=>CMDS.exit(),
  sleep(a){if(!a[0])fail('sleep: falta un operando');return''},
  true:()=>'', false:(a,ctx)=>{ctx.status=1;return''},
  seq(a){const n=a.map(Number);if(!a.length||n.some(isNaN))fail('seq: falta un operando');let [s,st,e]=n.length===1?[1,1,n[0]]:n.length===2?[n[0],1,n[1]]:n;const r=[];for(let x=s;st>0?x<=e:x>=e;x+=st){r.push(x);if(r.length>1000)break}return out(r)},
  yes:a=>out(Array(20).fill(a.join(' ')||'y'))+'(… yes seguiría para siempre; TuxLab lo corta en 20 líneas)\n',
  nano:(a)=>{fail(`TuxLab no incluye editores interactivos.\nPara escribir en ${a[0]||'un archivo'} usa la redirección:\n  echo "texto" > ${a[0]||'archivo'}     (sobrescribe)\n  echo "más texto" >> ${a[0]||'archivo'} (añade al final)`)},
  vim:a=>CMDS.nano(a), vi:a=>CMDS.nano(a),
  man(a){const c=a[0];if(!c)fail('¿Qué página de manual desea?\nPor ejemplo, pruebe «man ls».');const r=REF.find(x=>x.c===c);if(!r)fail(`No hay ninguna entrada de manual para ${c}`,16);
    return out([`${c.toUpperCase()}(1)`.padEnd(24)+'Manual de TuxLab','','NOMBRE',`       ${c} - ${r.d}`,'','SINOPSIS',`       ${r.s}`,...(r.o?['','OPCIONES',...r.o.map(o=>'       '+o)]:[]),'','EJEMPLO',`       ${r.e}`,'','(En Linux real, man abre un visor paginado: muévete con las flechas y sal con q.)'])},
  help(){const cats={};for(const r of REF)(cats[r.cat]??=[]).push(r.c);return out(['TuxLab bash — órdenes disponibles:','',...Object.entries(cats).map(([k,v])=>`  \u0001g${k.padEnd(12)}\u0002 ${v.join(' ')}`),'','Usa «man orden» o «orden --help» para más detalles. ↑/↓ recorre el historial y Tab autocompleta.'])},
  bash(a,ctx){if(!a.length||a[0]==='-i')return 'Ya estás dentro de bash 🙂\n';if(a[0]==='--version')return 'GNU bash, versión 5.2.21(1)-release (x86_64-pc-linux-gnu)\n';return runScript(a[0],a.slice(1),ctx)},
  sh:(a,ctx)=>CMDS.bash(a,ctx), source:(a,ctx)=>{if(!a[0])fail('bash: source: se necesita un argumento de nombre de fichero');return runScript(a[0],a.slice(1),ctx)},
  /* procesos */
  ps(a){
    const full=a.some(x=>/^(aux|-aux|ax|-e|-ef|-A|-eF)$/.test(x));
    if(!full)return out(['    PID TTY          TIME CMD',...S.procs.filter(p=>p.u===USER&&p.tty).map(p=>`${String(p.pid).padStart(7)} pts/0    00:${p2(Math.floor(p.cpu/2))}:${p2(Math.round(p.cpu)%60)} ${p.cmd.split(' ')[0].replace(/^.*\//,'').replace(/^-/,'')}`),`${String(S.nextPid).padStart(7)} pts/0    00:00:00 ps`]);
    return out(['USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',...S.procs.map(p=>`${p.u.padEnd(10)} ${String(p.pid).padStart(5)} ${p.cpu.toFixed(1).padStart(4)} ${p.mem.toFixed(1).padStart(4)} ${String(p.vsz).padStart(6)} ${String(p.rss).padStart(5)} ${(p.tty?'pts/0':'?').padEnd(8)} ${p.stat.padEnd(4)} 08:00   ${Math.floor(p.cpu/10)}:${p2(Math.round(p.cpu)%60)} ${p.cmd}`),`${USER.padEnd(10)} ${String(S.nextPid).padStart(5)}  0.0  0.0  10200  3600 pts/0    R+   21:10   0:00 ps ${a.join(' ')}`]);
  },
  top(a,ctx){const P=[...S.procs].sort((x,y)=>y.cpu-x.cpu);const cpu=P.reduce((s,p)=>s+p.cpu,0);
    return out([`top - ${CMDS.uptime().trim().replace(/^\S+ /,'')}`,`Tareas: ${P.length} total,   ${P.filter(p=>p.stat[0]==='R').length} ejecutar, ${P.filter(p=>p.stat[0]!=='R').length} hibernar`,`%Cpu(s): ${Math.min(99.9,cpu/2).toFixed(1)} us,  1,2 sy,  0,0 ni, ${Math.max(0,100-cpu/2-1.2).toFixed(1)} id`,'MiB Mem :   3895,2 total,    412,4 libre,   1953,1 usado,   1529,7 búf/caché','',
      '    PID USUARIO   PR  NI    VIRT    RES  S  %CPU  %MEM COMMAND',...P.map(p=>`${String(p.pid).padStart(7)} ${p.u.padEnd(9)} 20   0 ${String(p.vsz).padStart(7)} ${String(p.rss).padStart(6)}  ${p.stat[0]} ${p.cpu.toFixed(1).padStart(5)} ${p.mem.toFixed(1).padStart(5)} ${p.cmd.split(' ')[0].replace(/^.*\//,'')}`),'','(Instantánea: en Linux real top se actualiza en vivo y sales con q.)'])},
  htop:(a,ctx)=>CMDS.top(a,ctx),
  kill(a,ctx){
    let sig=15;const pids=[];const sigNum=s=>({KILL:9,SIGKILL:9,TERM:15,SIGTERM:15,HUP:1,SIGHUP:1,INT:2,SIGINT:2,STOP:19,CONT:18}[String(s).toUpperCase()]??(parseInt(s)||15));
    for(let i=0;i<a.length;i++){const x=a[i];if(x==='-l')return ' 1) SIGHUP   2) SIGINT   3) SIGQUIT  9) SIGKILL  15) SIGTERM  18) SIGCONT  19) SIGSTOP\n';if(x==='-s'){sig=sigNum(a[++i]);continue}if(/^-/.test(x)){sig=sigNum(x.slice(1));continue}pids.push(x)}
    if(!pids.length)fail('kill: uso: kill [-s señal | -señal] pid ...',2);
    each(pids,ctx,x=>{if(!/^\d+$/.test(x))fail(`bash: kill: ${x}: los argumentos deben ser IDs de proceso o de trabajo`);
      const pid=+x;const i=S.procs.findIndex(p=>p.pid===pid);if(i<0)fail(`bash: kill: (${pid}) - No existe el proceso`);
      const p=S.procs[i];if(p.u!==USER&&!ctx.root)fail(`bash: kill: (${pid}) - Operación no permitida`);
      if(p.pid===1)fail(`bash: kill: (1) - matar a init apagaría el sistema; TuxLab no te deja 😉`);
      if(p.cmd==='-bash')fail('bash: kill: no vas a matar tu propia shell en TuxLab 😅');
      if(p.stubborn&&sig!==9){p.ignored=(p.ignored||0)+1;return}
      if(sig===19){p.stat='T';return}if(sig===18){p.stat='S';return}
      S.procs.splice(i,1);for(const s of Object.values(S.svcs))if(s.pid===pid)s.active=false;
    });
  },
  pkill(a,ctx){const nine=a.includes('-9');const name=a.filter(x=>!x.startsWith('-'))[0];if(!name)fail('pkill: no se ha especificado criterio de coincidencia');
    const m=S.procs.filter(p=>p.cmd.includes(name)&&p.pid!==1&&p.cmd!=='-bash');if(!m.length){ctx.status=1;return''}
    for(const p of m){if(p.u!==USER&&!ctx.root){ctx.err(`pkill: matando pid ${p.pid} falló: Operación no permitida`);continue}if(p.stubborn&&!nine)continue;S.procs.splice(S.procs.indexOf(p),1)}},
  killall:(a,ctx)=>CMDS.pkill(a,ctx),
  pgrep(a,ctx){const name=a.filter(x=>!x.startsWith('-'))[0];const m=S.procs.filter(p=>p.cmd.includes(name||'§'));if(!m.length)ctx.status=1;return out(m.map(p=>a.includes('-l')||a.includes('-a')?`${p.pid} ${p.cmd}`:String(p.pid)))},
  jobs:()=>'',
  free(a){const h=a.includes('-h');return h?'               total        usado        libre  compartido   búf/caché   disponible\nMem:           3,8Gi        1,9Gi        412Mi        21Mi        1,5Gi        1,6Gi\nSwap:          2,0Gi        1,2Gi        812Mi\n'
    :'               total        usado        libre  compartido   búf/caché   disponible\nMem:         3988664      2000020       422300        21504      1566344      1681220\nSwap:        2097148      1265900       831248\n'},
  df(a){return a.some(x=>/h/.test(x))?'S.ficheros     Tamaño Usados  Disp Uso% Montado en\ntmpfs            392M   1,2M  391M   1% /run\n/dev/sda1         40G    31G  7,1G  81% /\ntmpfs            2,0G      0  2,0G   0% /dev/shm\n/dev/sda2        100G    12G   83G  13% /home\n'
    :'S.ficheros     bloques de 1K   Usados Disponibles Uso% Montado en\ntmpfs                 401340     1228      400112   1% /run\n/dev/sda1           41152736 32505108     7417872  81% /\ntmpfs                2006696        0     2006696   0% /dev/shm\n/dev/sda2          102687672 12582912    86848008  13% /home\n'},
  du(a,ctx){
    const {f,rest}=opts(a);const targets=rest.length?rest:['.'];const res=[];
    const sz=n=>n.t==='f'?Math.max(4096,Math.ceil(bytes(n.d)/4096)*4096):4096+Object.values(n.c).reduce((s,c)=>s+sz(c),0);
    const show=b=>f.has('h')?hsize(b):String(Math.ceil(b/1024));
    for(const t of targets){const n=node(t);if(!n){ctx.err(`du: no se puede acceder a '${t}': No existe el archivo o el directorio`);continue}
      if(f.has('s')||n.t==='f'){res.push(show(sz(n))+'\t'+t);continue}
      const rec=(n,path)=>{for(const [k,c] of Object.entries(n.c))if(c.t==='d')rec(c,path.replace(/\/$/,'')+'/'+k);res.push(show(sz(n))+'\t'+path)};rec(n,t)}
    return out(res);
  },
  /* usuarios */
  sudo(a,ctx){
    if(!a.length)fail('uso: sudo orden');
    if(['-i','-s','su','bash','-su'].includes(a[0]))fail('sudo: TuxLab no abre una shell de root. Escribe sudo delante de cada orden que lo necesite (¡es la buena práctica!)');
    if(!S.sudoNoted){S.sudoNoted=true;ctx.notes.push('[sudo] contraseña para estudiante: •••••••• (simulada)')}
    ctx.root=true;return runCmd(a,ctx);
  },
  su:()=>fail('su: en TuxLab no puedes cambiar de usuario; usa sudo para las tareas de administración'),
  id(a,ctx){const u=a[0]||(ctx.root?'root':USER);const line=node('/etc/passwd').d.split('\n').find(l=>l.split(':')[0]===u);if(!line)fail(`id: «${u}»: no existe ese usuario`);
    const [,, uid,gid]=line.split(':');const gids={root:0,adm:4,sudo:27,'www-data':33,users:100};const gs=Object.entries(S.groups).filter(([g,m])=>m.includes(u)||g===u);
    const gn=g=>gids[g]??(g===u?gid:1000);return `uid=${uid}(${u}) gid=${gid}(${u}) grupos=${[...new Set([[u,gid],...gs.map(([g])=>[g,gn(g)])].map(x=>x.join('|')))].map(x=>{const [g,i]=x.split('|');return `${i}(${g})`}).join(',')}\n`},
  groups(a,ctx){const u=a[0]||USER;if(!node('/etc/passwd').d.split('\n').some(l=>l.split(':')[0]===u))fail(`groups: «${u}»: no existe ese usuario`);const gs=[u,...Object.entries(S.groups).filter(([g,m])=>m.includes(u)&&g!==u).map(([g])=>g)];return (a[0]?`${u} : `:'')+gs.join(' ')+'\n'},
  useradd(a,ctx){
    if(!ctx.root)fail('useradd: Permiso denegado.\nuseradd: no se puede bloquear /etc/passwd; inténtelo de nuevo más tarde.\nConsejo: crear usuarios requiere privilegios → sudo useradd ...');
    const {f,v,rest}=opts(a,'sgdGc');const name=rest[0];if(!name)fail('Uso: useradd [opciones] USUARIO');
    if(!/^[a-z_][a-z0-9_-]*$/.test(name))fail(`useradd: nombre de usuario '${name}' inválido`);
    const pw=node('/etc/passwd');if(pw.d.split('\n').some(l=>l.split(':')[0]===name))fail(`useradd: el usuario «${name}» ya existe`,9);
    const uid=1000+pw.d.split('\n').filter(l=>{const u=+l.split(':')[2];return u>=1000&&u<60000}).length;
    pw.d+=`${name}:x:${uid}:${uid}:${v.c||''}:/home/${name}:${v.s||'/bin/sh'}\n`;S.groups[name]=[name];
    if(v.G)for(const g of v.G.split(','))(S.groups[g]??=[]).push(name);
    if(f.has('m'))node('/home').c[name]=D({'.bashrc':F('# .bashrc\n',name),'.profile':F('',name)},name,0o750);
  },
  adduser(a,ctx){if(!ctx.root)fail('fatal: Solo root puede añadir usuarios o grupos al sistema.');const name=a.filter(x=>!x.startsWith('-'))[0];CMDS.useradd(['-m','-s','/bin/bash',name],ctx);return `info: Añadiendo el usuario «${name}» ...\ninfo: Creando el directorio personal «/home/${name}» ...\ninfo: Copiando los ficheros desde «/etc/skel» ...\npasswd: contraseña actualizada correctamente (simulada)\ninfo: Añadiendo el usuario «${name}» al grupo «users» ...\n`},
  userdel(a,ctx){if(!ctx.root)fail('userdel: Permiso denegado.');const {f,rest}=opts(a);const name=rest[0];const pw=node('/etc/passwd');if(!pw.d.split('\n').some(l=>l.split(':')[0]===name))fail(`userdel: el usuario «${name}» no existe`,6);
    if(['root',USER].includes(name))fail(`userdel: TuxLab no te deja borrar a ${name} 😉`);pw.d=pw.d.split('\n').filter(l=>l.split(':')[0]!==name).join('\n');delete S.groups[name];for(const m of Object.values(S.groups)){const i=m.indexOf(name);if(i>=0)m.splice(i,1)}if(f.has('r'))delete node('/home').c[name]},
  usermod(a,ctx){if(!ctx.root)fail('usermod: Permiso denegado.\nusermod: no se puede bloquear /etc/passwd; inténtelo de nuevo más tarde.');
    const {f,v,rest}=opts(a,'Gg');const u=rest[0];if(!u||!v.G)fail('Uso: usermod -aG GRUPO USUARIO');if(!node('/etc/passwd').d.split('\n').some(l=>l.split(':')[0]===u))fail(`usermod: el usuario «${u}» no existe`,6);
    if(!f.has('a'))for(const m of Object.values(S.groups)){const i=m.indexOf(u);if(i>=0&&S.groups[u]!==m)m.splice(i,1)}
    for(const g of v.G.split(',')){if(!S.groups[g])fail(`usermod: el grupo «${g}» no existe`,6);if(!S.groups[g].includes(u))S.groups[g].push(u)}
    if(!f.has('a'))ctx.notes.push('⚠ Sin -a, usermod -G REEMPLAZA los grupos del usuario. Casi siempre querrás -aG.');},
  groupadd(a,ctx){if(!ctx.root)fail('groupadd: Permiso denegado.');const g=a[0];if(!g)fail('Uso: groupadd GRUPO');if(S.groups[g])fail(`groupadd: el grupo «${g}» ya existe`,9);S.groups[g]=[]},
  passwd(a,ctx){if(a[0]&&a[0]!==USER&&!ctx.root)fail('passwd: Solo root puede especificar un nombre de usuario.');return 'Nueva contraseña: ••••••••\nVuelva a escribir la nueva contraseña: ••••••••\npasswd: contraseña actualizada correctamente (simulada)\n'},
  w:()=>' 21:10:00 up 3 days,  4:12,  1 user,  load average: 0,98, 0,85, 0,77\nUSUARIO  TTY      DE               LOGIN@   IDLE   JCPU   PCPU QUÉ\nestudian pts/0    192.168.1.5      08:00    0.00s  0.04s  0.00s w\n',
  who:()=>'estudiante pts/0        2026-11-16 08:00 (192.168.1.5)\n',
  /* redes */
  ip(a){const s=a[0]||'';
    if(['a','addr','address'].includes(s)||(s==='-c'&&a[1]&&a[1][0]==='a'))return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n    inet6 ::1/128 scope host noprefixroute\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000\n    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff\n    inet \u0001g192.168.1.50\u0002/24 brd 192.168.1.255 scope global dynamic eth0\n    inet6 fe80::5054:ff:fe12:3456/64 scope link\n';
    if(['r','route'].includes(s))return 'default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.50 metric 100\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.50 metric 100\n';
    if(['l','link'].includes(s))return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n';
    fail('Uso: ip [ OPCIONES ] OBJETO { ORDEN | help }\n  OBJETO := { address (a) | route (r) | link (l) }')},
  ifconfig:()=>'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.50  netmask 255.255.255.0  broadcast 192.168.1.255\n        ether 52:54:00:12:34:56  txqueuelen 1000  (Ethernet)\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n',
  ping(a,ctx){
    const {v,rest}=opts(a,'cWi');const host=rest[0];if(!host)fail('ping: falta el destino\nUso: ping [-c N] destino',2);
    const hosts=Object.fromEntries(node('/etc/hosts').d.trim().split('\n').map(l=>l.split(/\s+/)).map(([ip,n])=>[n,ip]));
    let ip=hosts[host]||(/^\d+\.\d+\.\d+\.\d+$/.test(host)?host:null);
    if(!ip&&host.includes('.')){let h=0;for(const c of host)h=(h*31+c.charCodeAt(0))>>>0;ip=`142.250.${h%200}.${(h>>8)%250+1}`}
    if(!ip)fail(`ping: ${host}: Nombre o servicio desconocido`,2);
    const n=Math.min(10,v.c?parseInt(v.c):4);const base=ip.startsWith('127.')?0.04:ip.startsWith('192.168')?0.6:14;const ts=[];
    const L=[`PING ${host} (${ip}) 56(84) bytes of data.`];for(let i=1;i<=n;i++){const t=+(base*(0.85+Math.random()*0.3)).toFixed(base<1?3:1);ts.push(t);L.push(`64 bytes from ${host==ip?ip:`${host} (${ip})`}: icmp_seq=${i} ttl=${ip.startsWith('142')?117:64} time=${t} ms`)}
    const mn=Math.min(...ts),mx=Math.max(...ts),av=ts.reduce((s,x)=>s+x,0)/n;
    L.push('',`--- ${host} ping statistics ---`,`${n} packets transmitted, ${n} received, 0% packet loss, time ${(n-1)*1001}ms`,`rtt min/avg/max/mdev = ${mn.toFixed(3)}/${av.toFixed(3)}/${mx.toFixed(3)}/${((mx-mn)/2).toFixed(3)} ms`);
    if(!v.c)ctx.notes.push('(Sin -c, en Linux real ping no para nunca: lo detienes con Ctrl+C. TuxLab lo corta en 4.)');
    return out(L);
  },
  ss(a){const L=['Netid State  Recv-Q Send-Q   Local Address:Port    Peer Address:Port Process','udp   UNCONN 0      0        127.0.0.53%lo:53           0.0.0.0:*','tcp   LISTEN 0      4096     127.0.0.53%lo:53           0.0.0.0:*','tcp   LISTEN 0      128            0.0.0.0:22           0.0.0.0:*'];
    for(const [n,port] of [['nginx',80],['apache2',80],['mariadb',3306]])if(S.svcs[n]?.active)L.push(`tcp   LISTEN 0      511            0.0.0.0:${port}`.padEnd(51)+'0.0.0.0:*');
    L.push('tcp   LISTEN 0      128               [::]:22              [::]:*');return out(L)},
  netstat:(a)=>CMDS.ss(a),
  curl(a,ctx){
    const {f,v,rest}=opts(a,'oXHd');let url=rest[0];if(!url)fail("curl: try 'curl --help' for more information",2);
    const host=url.replace(/^https?:\/\//,'').split(/[/:]/)[0];
    let body,head;
    if(['localhost','127.0.0.1','tuxlab','192.168.1.50'].includes(host)){
      const web=['nginx','apache2'].find(n=>S.svcs[n]?.active);
      if(!web)fail(`curl: (7) Failed to connect to ${host} port 80 after 0 ms: Conexión rehusada\nPista: no hay ningún servidor web escuchando en el puerto 80.`,7);
      body=node('/var/www/html/index.html')?.d||NGINX_HTML;head=`HTTP/1.1 200 OK\nServer: ${web==='nginx'?'nginx/1.24.0 (Ubuntu)':'Apache/2.4.58 (Ubuntu)'}\nContent-Type: text/html\nContent-Length: ${bytes(body)}\n`;
    }else if(host==='servidor'){body='{"estado":"ok","servicio":"api-interna","version":"2.1"}\n';head='HTTP/1.1 200 OK\nContent-Type: application/json\n'}
    else if(['example.com','www.example.com'].includes(host)){body='<!doctype html>\n<html>\n<head><title>Example Domain</title></head>\n<body>\n<h1>Example Domain</h1>\n<p>This domain is for use in documentation examples.</p>\n</body>\n</html>\n';head='HTTP/2 200\ncontent-type: text/html\n'}
    else if(['ifconfig.me','api.ipify.org','icanhazip.com'].includes(host)){body='203.0.113.50\n';head='HTTP/1.1 200 OK\n'}
    else if(host==='wttr.in'){body='El tiempo: Soleado ☀️  +27°C (simulado por TuxLab)\n';head='HTTP/1.1 200 OK\n'}
    else fail(`curl: (6) Could not resolve host: ${host}\n(TuxLab no tiene Internet real: prueba con localhost, servidor o example.com)`,6);
    if(f.has('I'))return head+'\n';
    if(v.o){writeFile(v.o,body,false,ctx,'curl');return f.has('s')?'':`  % Total    % Received % Xferd  Average Speed   Time\n100  ${bytes(body)}  100  ${bytes(body)}    0     0   ${bytes(body)*9}      0 --:--:--\n`}
    return body;
  },
  wget(a,ctx){const url=a.filter(x=>!x.startsWith('-'))[0];if(!url)fail('wget: falta la URL');const r=CMDS.curl([url],ctx);const name=url.split('/').pop()&&url.split('/').length>3?url.split('/').pop():'index.html';writeFile(name,r,false,ctx,'wget');return `--${new Date().toISOString().slice(0,19).replace('T',' ')}--  ${url}\nConectando con ${url.replace(/^https?:\/\//,'').split('/')[0]}... conectado.\nPetición HTTP enviada, esperando respuesta... 200 OK\nGrabando a: «${name}»\n\n«${name}» guardado [${bytes(r)}]\n`},
  dig:(a)=>{const h=a.filter(x=>!x.startsWith('+')&&!x.startsWith('-'))[0]||'.';return `;; ANSWER SECTION:\n${h}.\t\t300\tIN\tA\t93.184.215.14\n\n;; Query time: 12 msec\n;; SERVER: 127.0.0.53#53(127.0.0.53) (UDP)\n`},
  nslookup:(a)=>`Server:\t\t127.0.0.53\nAddress:\t127.0.0.53#53\n\nNon-authoritative answer:\nName:\t${a[0]||'example.com'}\nAddress: 93.184.215.14\n`,
  ssh:(a)=>fail(`ssh: connect to host ${(a.filter(x=>!x.startsWith('-')).pop()||'').split('@').pop()||'?'} port 22: TuxLab no permite conexiones salientes (simulado)`,255),
  /* paquetes */
  apt(a,ctx){
    const sub=a[0];const pk=a.slice(1).filter(x=>!x.startsWith('-'));
    if(!sub)return 'apt 2.7.14 (amd64)\nUso: apt [opciones] orden\n\nÓrdenes más usadas:\n  list    - lista paquetes\n  search  - busca en las descripciones\n  show    - muestra detalles de un paquete\n  install - instala paquetes\n  remove  - elimina paquetes\n  update  - actualiza la lista de paquetes disponibles\n  upgrade - actualiza el sistema\n';
    if(['update','upgrade','install','remove','purge','autoremove','full-upgrade'].includes(sub)&&!ctx.root)fail('E: No se pudo abrir el archivo de bloqueo /var/lib/dpkg/lock-frontend - open (13: Permiso denegado)\nE: No se pudo obtener el bloqueo de la interfaz de dpkg (/var/lib/dpkg/lock-frontend). ¿Es usted superusuario?',100);
    const pre=['Leyendo lista de paquetes... Hecho','Creando árbol de dependencias... Hecho','Leyendo la información de estado... Hecho'];
    switch(sub){
      case 'update':S.aptUpdated=true;return out(['Obj:1 http://archive.ubuntu.com/ubuntu noble InRelease','Des:2 http://archive.ubuntu.com/ubuntu noble-updates InRelease [126 kB]','Des:3 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]','Descargados 252 kB en 1s (198 kB/s)',...pre,'Se pueden actualizar 3 paquetes. Ejecute «apt list --upgradable» para verlos.']);
      case 'upgrade':case 'full-upgrade':return out([...pre,'Calculando la actualización... Hecho','Se actualizarán los siguientes paquetes:','  curl libcurl4t64 openssl','3 actualizados, 0 nuevos se instalarán, 0 para eliminar y 0 no actualizados.','Configurando openssl (3.0.13-0ubuntu3.4) ...','Configurando curl (8.5.0-2ubuntu10.5) ...']);
      case 'install':{
        if(!pk.length)fail('E: Ningún paquete especificado');const L=[...pre];const nw=[];
        for(const p of pk){if(!REPO[p]){ctx.err(`E: No se ha podido localizar el paquete ${p}`);ctx.status=100;continue}if(S.pkgs.has(p)){L.push(`${p} ya está en su versión más reciente (${REPO[p]}).`);continue}nw.push(p)}
        if(ctx.status)return out(pre);
        if(nw.length){L.push('Se instalarán los siguientes paquetes NUEVOS:','  '+nw.join(' '),`0 actualizados, ${nw.length} nuevos se instalarán, 0 para eliminar y 3 no actualizados.`,'¿Desea continuar? [S/n] S');
          nw.forEach((p,i)=>L.push(`Des:${i+1} http://archive.ubuntu.com/ubuntu noble/main amd64 ${p} amd64 ${REPO[p]} [${80+p.length*37} kB]`));
          for(const p of nw){L.push(`Desempaquetando ${p} (${REPO[p]}) ...`,`Configurando ${p} (${REPO[p]}) ...`);S.pkgs.add(p);
            if(SVC_OF[p]){const [sv,desc]=SVC_OF[p];S.svcs[sv]={desc,active:false,enabled:false};if(p!=='mariadb-server'){const w=node('/var/www');w.c.html??=D({},'root');w.c.html.c['index.html']=F(p==='nginx'?NGINX_HTML:'<h1>It works!</h1>\n','root')}
              L.push(`(TuxLab: el servicio ${sv} queda instalado pero detenido. Arráncalo con: sudo systemctl start ${sv})`)}}
          L.push('Procesando disparadores para man-db (2.12.0-4build2) ...')}
        if(!S.aptUpdated)ctx.notes.push('Consejo: antes de instalar conviene ejecutar «sudo apt update» para refrescar la lista de paquetes.');
        return out(L)}
      case 'remove':case 'purge':{const L=[...pre];for(const p of pk){if(!S.pkgs.has(p)){L.push(`El paquete «${p}» no está instalado, no se eliminará`);continue}if(['bash','coreutils'].includes(p)){ctx.err(`E: TuxLab no te deja eliminar ${p}: el sistema dejaría de funcionar 😅`);continue}S.pkgs.delete(p);if(SVC_OF[p])delete S.svcs[SVC_OF[p][0]];L.push(`Desinstalando ${p} (${REPO[p]}) ...`)}return out(L)}
      case 'autoremove':return out([...pre,'0 actualizados, 0 nuevos se instalarán, 0 para eliminar y 3 no actualizados.']);
      case 'search':{const q=pk[0]||'';const L=['Ordenando... Hecho','Buscar en todo el texto... Hecho'];for(const p of Object.keys(REPO).sort())if(p.includes(q)||(PKG_DESC[p]||'').includes(q))L.push(`\u0001g${p}\u0002/noble ${REPO[p]} amd64${S.pkgs.has(p)?' [instalado]':''}`,`  ${PKG_DESC[p]||'paquete del sistema'}`,'');return out(L)}
      case 'list':{if(a.includes('--upgradable'))return 'Listando... Hecho\ncurl/noble-updates 8.5.0-2ubuntu10.5 amd64 [actualizable desde: 8.5.0-2ubuntu10]\nlibcurl4t64/noble-updates 8.5.0-2ubuntu10.5 amd64 [actualizable desde: 8.5.0-2ubuntu10]\nopenssl/noble-updates 3.0.13-0ubuntu3.4 amd64 [actualizable desde: 3.0.13-0ubuntu3]\n';
        const ps=Object.keys(REPO).filter(p=>!a.includes('--installed')||S.pkgs.has(p)).sort();return out(['Listando... Hecho',...ps.map(p=>`${p}/noble,now ${REPO[p]} amd64${S.pkgs.has(p)?' [instalado]':''}`)])}
      case 'show':{const p=pk[0];if(!REPO[p])fail(`N: No se ha podido localizar el paquete ${p}\nE: No se encontró ningún paquete`,100);return `Package: ${p}\nVersion: ${REPO[p]}\nPriority: optional\nSection: utils\nMaintainer: Ubuntu Developers\nDescription: ${PKG_DESC[p]||'paquete del sistema'}\n`}
      default:fail(`E: Operación ${sub} no válida`,100);
    }
  },
  'apt-get':(a,ctx)=>CMDS.apt(a,ctx),
  dpkg(a){if(a[0]==='-l'){return out(['Deseado=desconocido(U)/Instalar(i)/eliminaR(r)/Purgar(p)/retener(h)','||/ Nombre            Versión                Arq.   Descripción','+++-=================-======================-======-==========================',...[...S.pkgs].sort().map(p=>`ii  ${p.padEnd(17)} ${REPO[p].padEnd(22)} amd64  ${PKG_DESC[p]||'paquete del sistema'}`)])}fail('dpkg: TuxLab solo admite «dpkg -l»')},
  systemctl(a,ctx){
    const sub=a.find(x=>!x.startsWith('-'));const unit=(a.filter(x=>!x.startsWith('-'))[1]||'').replace(/\.service$/,'');
    if(!sub||sub==='list-units'||sub==='list-unit-files'){return out(['  UNIT                     LOAD   ACTIVE   SUB     DESCRIPTION',...Object.entries(S.svcs).map(([n,s])=>`  ${(n+'.service').padEnd(24)} loaded ${(s.active?'active':'inactive').padEnd(8)} ${(s.active?'running':'dead').padEnd(7)} ${s.desc}`),'',`${Object.keys(S.svcs).length} unidades cargadas.`])}
    if(!unit)fail(`Too few arguments.`);
    const s=S.svcs[unit];
    if(['start','stop','restart','enable','disable','reload'].includes(sub)&&!ctx.root)fail(`Failed to ${sub} ${unit}.service: Interactive authentication required.\nSee system logs and 'systemctl status ${unit}.service' for details.\nConsejo: gestionar servicios requiere privilegios → sudo systemctl ${sub} ${unit}`);
    if(!s)fail(sub==='status'?`Unit ${unit}.service could not be found.`:`Failed to ${sub} ${unit}.service: Unit ${unit}.service not found.`,sub==='status'?4:5);
    const startP=()=>{s.active=true;s.since=Date.now();s.pid=S.nextPid;S.nextPid+=3;const cmd=unit==='nginx'?'nginx: master process /usr/sbin/nginx -g daemon on;':unit==='apache2'?'/usr/sbin/apache2 -k start':`/usr/sbin/${unit}d`;S.procs.push({pid:s.pid,u:'root',cmd,cpu:0.0,mem:0.3,vsz:55000,rss:6000,stat:'Ss'});if(unit==='nginx')S.procs.push({pid:s.pid+1,u:'www-data',cmd:'nginx: worker process',cpu:0,mem:0.2,vsz:55500,rss:5200,stat:'S'})};
    const stopP=()=>{s.active=false;S.procs=S.procs.filter(p=>p.pid!==s.pid&&p.pid!==s.pid+1)};
    switch(sub){
      case 'start':if(!s.active)startP();return'';
      case 'stop':if(s.active)stopP();return'';
      case 'restart':case 'reload':if(s.active)stopP();startP();return'';
      case 'enable':if(s.enabled)return'';s.enabled=true;return `Synchronizing state of ${unit}.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.\nCreated symlink /etc/systemd/system/multi-user.target.wants/${unit}.service → /usr/lib/systemd/system/${unit}.service.\n`;
      case 'disable':s.enabled=false;return `Removed "/etc/systemd/system/multi-user.target.wants/${unit}.service".\n`;
      case 'is-active':ctx.status=s.active?0:3;return(s.active?'active':'inactive')+'\n';
      case 'is-enabled':ctx.status=s.enabled?0:1;return(s.enabled?'enabled':'disabled')+'\n';
      case 'status':if(!s.active)ctx.status=3;return svcStatus(unit,s);
      default:fail(`Unknown command verb '${sub}'.`);
    }
  },
  service(a,ctx){if(a[0]==='--status-all')return out(Object.entries(S.svcs).map(([n,s])=>` [ ${s.active?'+':'-'} ]  ${n}`));if(a.length<2)fail('Uso: service SERVICIO ORDEN');return CMDS.systemctl([a[1],a[0]],ctx)},
  journalctl(a,ctx){const {v}=opts(a,'un');let L=lines(SYSLOG).map(l=>{const [d,t,lv,...m]=l.split(/\s+/);return `nov 16 ${t} tuxlab ${lv==='ERROR'?'kernel':'systemd[1]'}: ${m.join(' ')}`});if(v.u)L=L.filter(l=>l.toLowerCase().includes(v.u.replace('.service','')));if(v.n)L=L.slice(-(+v.n));if(!L.length)return '-- No entries --\n';return out(L)},
  /* texto */
  sed(a,ctx){
    let inplace=false,quiet=false;const files=[];const scripts=[];
    for(let i=0;i<a.length;i++){const x=a[i];if(x==='-i'||x.startsWith('-i.'))inplace=true;else if(x==='-n')quiet=true;else if(x==='-e')scripts.push(a[++i]);else if(x==='-E'||x==='-r'||x==='-ni'||x==='-in'){if(x.includes('n'))quiet=true;if(x.includes('i')&&x!=='-r')inplace=true}else files.push(x)}
    if(!scripts.length)scripts.push(files.shift());
    if(scripts[0]===undefined)fail('Uso: sed [OPCIÓN]... {script} [archivo]...');
    const cmds=scripts.flatMap(s=>s.split(';').map(x=>x.trim()).filter(Boolean)).map(parseSed);
    if(inplace){if(!files.length)fail('sed: no se han especificado archivos de entrada');each(files,ctx,p=>{const t=readFile(p,ctx,'sed');writeFile(p,runSed(cmds,t,quiet),false,ctx,'sed')});return''}
    return runSed(cmds,inputOf(files,ctx,'sed'),quiet);
  },
  awk(a,ctx){
    let fs=null;const rest=[];const vars={};
    for(let i=0;i<a.length;i++){const x=a[i];if(x==='-F')fs=a[++i];else if(x.startsWith('-F'))fs=x.slice(2);else if(x==='-v'){const [k,...v]=a[++i].split('=');vars[k]=v.join('=')}else rest.push(x)}
    const prog=rest.shift();if(!prog)fail("uso: awk [-F sep] 'programa' [archivo ...]",2);
    return runAwk(prog,inputOf(rest,ctx,'awk'),fs,vars);
  },
  gawk:(a,ctx)=>CMDS.awk(a,ctx),
  rev:(a,ctx)=>out(lines(inputOf(a,ctx,'rev')).map(l=>[...l].reverse().join(''))),
  nl:(a,ctx)=>out(lines(inputOf(a,ctx,'nl')).map((l,i)=>String(i+1).padStart(6)+'\t'+l)),
  tee(a,ctx){const {f,rest}=opts(a);each(rest,ctx,p=>writeFile(p,ctx.stdin,f.has('a'),ctx,'tee'));return ctx.stdin},
  diff(a,ctx){if(a.length<2)fail('diff: falta un operando');const x=lines(readFile(a[0],ctx,'diff')),y=lines(readFile(a[1],ctx,'diff'));const r=[];const n=Math.max(x.length,y.length);for(let i=0;i<n;i++){if(x[i]!==y[i]){if(x[i]!==undefined&&y[i]!==undefined)r.push(`${i+1}c${i+1}`,`< ${x[i]}`,'---',`> ${y[i]}`);else if(x[i]===undefined)r.push(`${i}a${i+1}`,`> ${y[i]}`);else r.push(`${i+1}d${i}`,`< ${x[i]}`)}}if(r.length)ctx.status=1;return out(r)},
  xargs(a,ctx){const items=ctx.stdin.split(/\s+/).filter(Boolean);const cmd=a.length?a:['echo'];return runCmd([...cmd,...items],ctx)},
  /* diversión (requieren paquetes) */
  cowsay:(a,ctx)=>COW(a.join(' ')||ctx.stdin.trim().replace(/\s*\n\s*/g,' ')),
  fortune:()=>['La paciencia es la madre de todos los sysadmins.','Un buen backup vale más que mil disculpas.','RTFM: lee el manual, que para eso está.','No hay lugar como 127.0.0.1','El que no prueba en staging, prueba en producción.'][Math.floor(Math.random()*5)]+'\n',
  neofetch:()=>{const I=[`\u0001gestudiante\u0002@\u0001gtuxlab\u0002`,'-----------------','\u0001bOS\u0002: Ubuntu 24.04.1 LTS x86_64','\u0001bHost\u0002: TuxLab Virtual Machine','\u0001bKernel\u0002: 6.8.0-48-generic','\u0001bUptime\u0002: 3 days, 4 hours','\u0001bPackages\u0002: '+(1342+S.pkgs.size)+' (dpkg)','\u0001bShell\u0002: bash 5.2.21','\u0001bTerminal\u0002: TuxLab','\u0001bCPU\u0002: Virtual CPU (2) @ 2.40GHz','\u0001bMemory\u0002: 1953MiB / 3895MiB'];return out(TUX.map((l,i)=>l.padEnd(24)+(I[i]||'')))},
  sl:()=>'      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|__\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/\n(¡Choo choo! sl existe para castigar a quien escribe mal «ls» 🚂)\n',
  git:a=>a[0]==='--version'?'git version 2.43.0\n':'fatal: no es un repositorio git (ni ninguno de los directorios superiores): .git\n',
  python3:a=>a[0]==='--version'||a[0]==='-V'?'Python 3.12.3\n':'Python 3.12.3 (main, Nov  6 2026) [GCC 13.2.0] on linux\n(TuxLab no incluye un intérprete interactivo de Python)\n',
  python:(a,ctx)=>CMDS.python3(a,ctx),
  nginx:a=>a[0]==='-v'||a[0]==='-V'?'nginx version: nginx/1.24.0 (Ubuntu)\n':fail('nginx: usa «sudo systemctl start nginx» para arrancar el servicio'),
};
function headTail(a,ctx,tail){
  let n=10,plus=false;const files=[];const name=tail?'tail':'head';
  for(let i=0;i<a.length;i++){const x=a[i];
    if(x==='-n'||x==='--lines'){const v=a[++i]||'';if(v.startsWith('+'))plus=true;n=parseInt(v.replace('+',''));}
    else if(/^-n[+-]?\d+$/.test(x)){const v=x.slice(2);if(v.startsWith('+'))plus=true;n=parseInt(v.replace('+',''))}
    else if(/^-\d+$/.test(x))n=parseInt(x.slice(1));
    else if(x==='-f'){ctx.notes.push(`(${name} -f seguiría el archivo en vivo; TuxLab muestra solo las últimas líneas)`)}
    else files.push(x)}
  if(isNaN(n))fail(`${name}: número de líneas inválido`);
  const cut=t=>{const L=lines(t);return out(tail?(plus?L.slice(n-1):L.slice(Math.max(0,L.length-n))):L.slice(0,n))};
  if(!files.length)return cut(ctx.stdin);
  const res=[];files.forEach((p,i)=>{try{const t=readFile(p,ctx,name);if(files.length>1)res.push((i?'\n':'')+`==> ${p} <==\n`);res.push(cut(t))}catch(e){if(e instanceof E)ctx.err(e.message);else throw e}});
  return res.join('');
}
function calcMode(m,s){
  if(/^[0-7]{3,4}$/.test(s))return parseInt(s,8)&0o777;
  for(const part of s.split(',')){const mm=part.match(/^([ugoa]*)([-+=])([rwxX]*)$/);if(!mm)fail(`chmod: modo inválido: «${s}»`);
    let who=mm[1]||'a';if(who.includes('a'))who='ugo';let bits=0;for(const ch of mm[3])bits|=ch==='r'?4:ch==='w'?2:1;
    let mask=0,clear=0;for(const w of who){const sh=w==='u'?6:w==='g'?3:0;mask|=bits<<sh;clear|=7<<sh}
    if(mm[2]==='+')m|=mask;else if(mm[2]==='-')m&=~mask;else m=(m&~clear)|mask}
  return m&0o777;
}

/* contexto que reciben las comprobaciones de las misiones */
function mkCheck(ev){
  S=ev.state;
  const o=ev.out||'';
  return {cmd:ev.cmd,out:o,err:ev.err||'',status:ev.status,cwd:ev.state.cwd,st:ev.state,
    outLines:lines(o).length,
    ran:re=>re.test(ev.cmd),
    has:p=>!!node(p),isDir:p=>node(p)?.t==='d',isFile:p=>node(p)?.t==='f',
    read:p=>{const n=node(p);return n&&n.t==='f'?n.d:''},mode:p=>node(p)?.m};
}
/* ejecuta una línea en un estado y devuelve todo lo necesario para la UI */
function shellRun(state,line){
  S=state;
  const cmd=line.trim();
  if(cmd)state.hist.push(cmd);
  const r=execLine(cmd);
  const outT=strip(r.segs.filter(s=>!s.k).map(s=>s.t).join(''));
  const errT=strip(r.segs.filter(s=>s.k==='e').map(s=>s.t).join(''));
  state.nextPid+=1;
  return {r,ev:{cmd,out:outT,err:errT,status:r.status,state}};
}
