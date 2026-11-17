/* ================= TuxLab · contenidos ================= */
const escH=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ex=(cmd,note='')=>`<div class="ex"><code><span class="dl">$</span> ${escH(cmd)}</code><button class="try" data-try="${escH(cmd)}" title="Escribir en la terminal">▶ Probar</button>${note?`<div class="exn">${note}</div>`:''}</div>`;
const tip=(t,kind='tip')=>`<div class="call ${kind}">${t}</div>`;

const REF=[
 {c:'pwd',cat:'Navegación',s:'pwd',d:'muestra la ruta del directorio actual',e:'pwd'},
 {c:'ls',cat:'Navegación',s:'ls [-a] [-l] [-h] [-R] [ruta...]',d:'lista el contenido de un directorio',e:'ls -lah',o:['-a  incluye archivos ocultos (empiezan por .)','-l  formato largo: permisos, dueño, tamaño, fecha','-h  tamaños legibles (K, M, G)','-R  recursivo']},
 {c:'cd',cat:'Navegación',s:'cd [directorio]',d:'cambia de directorio (sin argumento vuelve a ~)',e:'cd /var/log',o:['cd ..  sube un nivel','cd -   vuelve al directorio anterior','cd ~   va a tu carpeta personal']},
 {c:'tree',cat:'Navegación',s:'tree [-L nivel] [ruta]',d:'dibuja el árbol de directorios',e:'tree -L 2'},
 {c:'mkdir',cat:'Archivos',s:'mkdir [-p] directorio...',d:'crea directorios',e:'mkdir -p proyectos/web/css',o:['-p  crea también los directorios padre que falten']},
 {c:'touch',cat:'Archivos',s:'touch archivo...',d:'crea un archivo vacío o actualiza su fecha',e:'touch notas.txt'},
 {c:'cp',cat:'Archivos',s:'cp [-r] origen destino',d:'copia archivos y directorios',e:'cp -r documentos copia_docs',o:['-r  copia directorios de forma recursiva']},
 {c:'mv',cat:'Archivos',s:'mv origen destino',d:'mueve o renombra archivos',e:'mv viejo.txt nuevo.txt'},
 {c:'rm',cat:'Archivos',s:'rm [-r] [-f] archivo...',d:'borra archivos (¡no hay papelera!)',e:'rm -r basura',o:['-r  borra directorios y su contenido','-f  no pregunta ni avisa si no existe']},
 {c:'rmdir',cat:'Archivos',s:'rmdir directorio',d:'borra un directorio vacío',e:'rmdir vacio'},
 {c:'find',cat:'Archivos',s:'find [ruta] [-name patrón] [-type f|d] [-size N]',d:'busca archivos por nombre, tipo, tamaño…',e:'find . -name "*.log"',o:['-name  patrón con comodines (entre comillas)','-iname igual pero sin distinguir mayúsculas','-type  f=archivo d=directorio','-size  +1k mayor que 1 KiB']},
 {c:'file',cat:'Archivos',s:'file archivo',d:'indica qué tipo de contenido tiene un archivo',e:'file scripts/backup.sh'},
 {c:'stat',cat:'Archivos',s:'stat archivo',d:'muestra metadatos detallados de un archivo',e:'stat secreto.txt'},
 {c:'du',cat:'Archivos',s:'du [-s] [-h] [ruta]',d:'calcula cuánto ocupa un directorio',e:'du -sh logs'},
 {c:'cat',cat:'Texto',s:'cat [-n] archivo...',d:'muestra (concatena) el contenido de archivos',e:'cat -n documentos/manual.txt'},
 {c:'less',cat:'Texto',s:'less archivo',d:'visor paginado (en TuxLab se comporta como cat)',e:'less logs/sistema.log'},
 {c:'head',cat:'Texto',s:'head [-n N] archivo',d:'muestra las primeras líneas',e:'head -n 3 logs/sistema.log'},
 {c:'tail',cat:'Texto',s:'tail [-n N] [-f] archivo',d:'muestra las últimas líneas',e:'tail -n 2 logs/sistema.log'},
 {c:'wc',cat:'Texto',s:'wc [-l] [-w] [-c] archivo',d:'cuenta líneas, palabras y bytes',e:'wc -l logs/access.log'},
 {c:'echo',cat:'Texto',s:'echo [-n] [-e] texto',d:'imprime texto',e:'echo "Hola $USER"'},
 {c:'grep',cat:'Texto',s:'grep [-i] [-v] [-c] [-n] [-r] patrón [archivo...]',d:'filtra líneas que coinciden con un patrón',e:'grep -in error logs/sistema.log',o:['-i  ignora mayúsculas/minúsculas','-v  invierte: líneas que NO coinciden','-c  cuenta coincidencias','-n  muestra número de línea','-r  busca recursivamente en directorios']},
 {c:'sort',cat:'Texto',s:'sort [-n] [-r] [-u] [-k N] [-t sep] archivo',d:'ordena líneas',e:'sort -t, -k3 -n datos/ventas.csv',o:['-n  orden numérico','-r  orden inverso','-u  elimina duplicados','-k  ordena por la columna N']},
 {c:'uniq',cat:'Texto',s:'uniq [-c] [-d]',d:'elimina líneas repetidas consecutivas',e:'sort datos/frutas.txt | uniq -c',o:['-c  antepone cuántas veces aparece','-d  muestra solo las repetidas']},
 {c:'cut',cat:'Texto',s:'cut -d SEP -f CAMPOS archivo',d:'extrae columnas',e:'cut -d, -f2 datos/ventas.csv'},
 {c:'tr',cat:'Texto',s:'tr [-d] conjunto1 [conjunto2]',d:'traduce o borra caracteres (lee de la entrada estándar)',e:'echo hola | tr a-z A-Z'},
 {c:'sed',cat:'Texto',s:"sed [-i] [-n] 's/viejo/nuevo/g' archivo",d:'editor de flujo: sustituye, borra o imprime líneas',e:"sed 's/ERROR/FALLO/g' logs/sistema.log",o:['s/a/b/   sustituye la primera a por b','s/a/b/g  sustituye todas','-i       modifica el archivo en su sitio','3d       borra la línea 3','-n 2p    imprime solo la línea 2']},
 {c:'awk',cat:'Texto',s:"awk [-F sep] 'patrón {acción}' archivo",d:'procesa texto por columnas; un mini lenguaje',e:"awk -F, '{print $2, $3}' datos/ventas.csv",o:['$1, $2…  columnas; $0 la línea entera','NR       número de línea; NF número de campos','END {…}  se ejecuta al final']},
 {c:'tee',cat:'Texto',s:'tee [-a] archivo',d:'escribe la entrada en un archivo y también la muestra',e:'ls | tee lista.txt'},
 {c:'diff',cat:'Texto',s:'diff archivo1 archivo2',d:'compara dos archivos línea a línea',e:'diff a.txt b.txt'},
 {c:'chmod',cat:'Permisos',s:'chmod MODO archivo',d:'cambia los permisos',e:'chmod 755 script.sh',o:['u/g/o/a  usuario, grupo, otros, todos','+ - =    añade, quita, fija','r=4 w=2 x=1  →  7=rwx 6=rw- 5=r-x 4=r--']},
 {c:'chown',cat:'Permisos',s:'chown usuario[:grupo] archivo',d:'cambia el propietario (requiere sudo)',e:'sudo chown ana informe.txt'},
 {c:'sudo',cat:'Usuarios',s:'sudo orden',d:'ejecuta una orden como superusuario (root)',e:'sudo apt update'},
 {c:'whoami',cat:'Usuarios',s:'whoami',d:'muestra con qué usuario estás trabajando',e:'whoami'},
 {c:'id',cat:'Usuarios',s:'id [usuario]',d:'muestra UID, GID y grupos',e:'id'},
 {c:'groups',cat:'Usuarios',s:'groups [usuario]',d:'lista los grupos de un usuario',e:'groups'},
 {c:'useradd',cat:'Usuarios',s:'useradd [-m] [-s shell] usuario',d:'crea un usuario (requiere sudo)',e:'sudo useradd -m ana',o:['-m  crea su directorio personal','-s  shell de inicio','-G  grupos adicionales']},
 {c:'usermod',cat:'Usuarios',s:'usermod -aG grupo usuario',d:'modifica un usuario, p. ej. añadirlo a un grupo',e:'sudo usermod -aG sudo ana'},
 {c:'userdel',cat:'Usuarios',s:'userdel [-r] usuario',d:'borra un usuario',e:'sudo userdel -r ana'},
 {c:'passwd',cat:'Usuarios',s:'passwd [usuario]',d:'cambia una contraseña',e:'passwd'},
 {c:'ps',cat:'Procesos',s:'ps [aux]',d:'lista procesos',e:'ps aux'},
 {c:'top',cat:'Procesos',s:'top',d:'monitor de procesos (instantánea en TuxLab)',e:'top'},
 {c:'kill',cat:'Procesos',s:'kill [-9] PID',d:'envía una señal a un proceso (por defecto SIGTERM)',e:'kill -9 4242',o:['-15 SIGTERM: pide terminar con amabilidad','-9  SIGKILL: termina a la fuerza, no se puede ignorar']},
 {c:'pkill',cat:'Procesos',s:'pkill [-9] nombre',d:'envía una señal a procesos por nombre',e:'pkill -9 proceso_colgado'},
 {c:'pgrep',cat:'Procesos',s:'pgrep [-l] nombre',d:'busca el PID de procesos por nombre',e:'pgrep -l python'},
 {c:'uname',cat:'Sistema',s:'uname [-a] [-r]',d:'información del kernel',e:'uname -a'},
 {c:'df',cat:'Sistema',s:'df [-h]',d:'espacio libre en los sistemas de archivos',e:'df -h'},
 {c:'free',cat:'Sistema',s:'free [-h]',d:'uso de memoria RAM y swap',e:'free -h'},
 {c:'uptime',cat:'Sistema',s:'uptime',d:'tiempo encendido y carga media',e:'uptime'},
 {c:'date',cat:'Sistema',s:'date [+formato]',d:'muestra la fecha y la hora',e:'date +%F'},
 {c:'cal',cat:'Sistema',s:'cal',d:'calendario del mes',e:'cal'},
 {c:'systemctl',cat:'Servicios',s:'systemctl status|start|stop|restart|enable servicio',d:'gestiona servicios de systemd',e:'systemctl status ssh',o:['status   estado del servicio','start    lo arranca ahora','stop     lo detiene','enable   lo arranca en cada inicio']},
 {c:'journalctl',cat:'Servicios',s:'journalctl [-u servicio] [-n N]',d:'consulta los registros del sistema',e:'journalctl -n 5'},
 {c:'apt',cat:'Paquetes',s:'apt update|install|remove|search|list paquete',d:'gestor de paquetes de Debian/Ubuntu',e:'sudo apt install htop',o:['update   refresca la lista de paquetes','install  instala','remove   desinstala','search   busca','list --installed  lista los instalados']},
 {c:'ip',cat:'Redes',s:'ip a | ip r',d:'muestra direcciones IP y rutas',e:'ip a'},
 {c:'ping',cat:'Redes',s:'ping [-c N] destino',d:'comprueba si un equipo responde',e:'ping -c 3 servidor'},
 {c:'ss',cat:'Redes',s:'ss -tuln',d:'lista puertos y conexiones',e:'ss -tuln'},
 {c:'curl',cat:'Redes',s:'curl [-I] [-o archivo] URL',d:'hace peticiones HTTP',e:'curl -I localhost'},
 {c:'wget',cat:'Redes',s:'wget URL',d:'descarga un archivo',e:'wget example.com'},
 {c:'env',cat:'Shell',s:'env',d:'muestra las variables de entorno',e:'env'},
 {c:'export',cat:'Shell',s:'export VAR=valor',d:'define una variable de entorno',e:'export EDITOR=nano'},
 {c:'history',cat:'Shell',s:'history',d:'muestra las órdenes que has escrito',e:'history'},
 {c:'man',cat:'Shell',s:'man orden',d:'manual de una orden',e:'man grep'},
 {c:'which',cat:'Shell',s:'which orden',d:'dice dónde está el ejecutable de una orden',e:'which ls'},
 {c:'clear',cat:'Shell',s:'clear',d:'limpia la pantalla (atajo: Ctrl+L)',e:'clear'},
 {c:'bash',cat:'Shell',s:'bash script.sh [args]',d:'ejecuta un script de bash',e:'bash scripts/backup.sh'},
 {c:'xargs',cat:'Shell',s:'orden | xargs orden2',d:'convierte la entrada en argumentos',e:'echo documentos logs | xargs ls'},
];

const LEVELS=[
 {id:'b',name:'Principiante',color:'var(--lv-b)',tag:'Nivel 1',desc:'La terminal, moverte por carpetas, crear, leer y borrar archivos.'},
 {id:'i',name:'Intermedio',color:'var(--lv-i)',tag:'Nivel 2',desc:'Tuberías, filtros de texto, búsquedas, permisos y variables.'},
 {id:'a',name:'Avanzado',color:'var(--lv-a)',tag:'Nivel 3',desc:'Procesos, información del sistema, scripts, sed y awk.'},
 {id:'e',name:'Experto',color:'var(--lv-e)',tag:'Nivel 4',desc:'Usuarios, redes, paquetes, servicios y un reto real de análisis.'},
];

const LESSONS=[
/* ---------------- PRINCIPIANTE ---------------- */
{id:'l1',lv:'b',title:'Tu primera terminal',mins:5,theory:`
<p>La <b>terminal</b> es una ventana donde hablas con el sistema escribiendo órdenes. Quien las interpreta es la <b>shell</b>; en casi todas las distribuciones es <code>bash</code>. Puede parecer antigua, pero es la forma más rápida y potente de administrar Linux: los servidores de Internet se gestionan casi siempre así.</p>
<h3>Lee el prompt</h3>
<div class="prompt-anat"><span class="pa u">estudiante</span><span class="pa">@</span><span class="pa h">tuxlab</span><span class="pa">:</span><span class="pa p">~</span><span class="pa d">$</span></div>
<ul class="legend"><li><b class="u">estudiante</b> tu usuario</li><li><b class="h">tuxlab</b> el nombre de la máquina</li><li><b class="p">~</b> dónde estás (<code>~</code> es tu carpeta personal)</li><li><b class="d">$</b> eres un usuario normal (<code>#</code> sería root, el administrador)</li></ul>
<h3>Anatomía de una orden</h3>
<p><code>orden [opciones] [argumentos]</code>. Por ejemplo, en <code>ls -l documentos</code> la orden es <code>ls</code>, la opción <code>-l</code> cambia su comportamiento y <code>documentos</code> es el argumento sobre el que actúa.</p>
${ex('pwd','<b>p</b>rint <b>w</b>orking <b>d</b>irectory: ¿dónde estoy?')}
${ex('whoami','¿quién soy?')}
${ex('ls','¿qué hay aquí? Los directorios salen en azul.')}
${ex('date')}
${tip('<b>Atajos que usarás siempre:</b> <kbd>↑</kbd>/<kbd>↓</kbd> recorren lo que ya escribiste, <kbd>Tab</kbd> autocompleta nombres y <kbd>Ctrl</kbd>+<kbd>L</kbd> limpia la pantalla.')}`,
tasks:[
 {t:'Averigua en qué directorio estás con <code>pwd</code>',h:'Escribe <code>pwd</code> y pulsa Enter.',ok:c=>c.ran(/^pwd\s*$/)},
 {t:'Descubre con qué usuario trabajas',h:'La orden es <code>whoami</code> («who am I?»).',ok:c=>c.ran(/^whoami\b/)},
 {t:'Lista el contenido de tu carpeta personal',h:'Usa <code>ls</code>.',ok:c=>c.ran(/^ls\b/)&&c.status===0},
 {t:'Consulta la fecha y hora del sistema',h:'Escribe <code>date</code>.',ok:c=>c.ran(/^date\b/)},
 {t:'Limpia la pantalla',h:'<code>clear</code> o el atajo <kbd>Ctrl</kbd>+<kbd>L</kbd>.',ok:c=>c.ran(/^clear\b/)},
]},
{id:'l2',lv:'b',title:'Navegar por el sistema de archivos',mins:8,theory:`
<p>En Linux todo cuelga de un único árbol cuya raíz es <code>/</code>. No hay «C:» ni «D:»: los discos se <i>montan</i> como carpetas dentro de ese árbol.</p>
<table class="tbl"><tr><th>Directorio</th><th>Qué contiene</th></tr>
<tr><td><code>/home</code></td><td>las carpetas personales de los usuarios</td></tr>
<tr><td><code>/etc</code></td><td>archivos de configuración del sistema</td></tr>
<tr><td><code>/var/log</code></td><td>registros (logs)</td></tr>
<tr><td><code>/usr/bin</code></td><td>los programas</td></tr>
<tr><td><code>/tmp</code></td><td>archivos temporales</td></tr>
<tr><td><code>/root</code></td><td>la carpeta personal del administrador</td></tr></table>
<h3>Rutas absolutas y relativas</h3>
<p>Una ruta <b>absoluta</b> empieza por <code>/</code> y funciona desde cualquier sitio: <code>/home/estudiante/documentos</code>. Una <b>relativa</b> parte de donde estás: <code>documentos</code>. Dos atajos especiales: <code>.</code> es «aquí» y <code>..</code> es «el directorio de arriba».</p>
${ex('cd documentos','entra en documentos')}
${ex('ls -a','-a muestra también los archivos ocultos, los que empiezan por punto')}
${ex('cd ..','sube un nivel')}
${ex('cd /','salta a la raíz')}
${ex('cd','sin argumentos (o con ~) vuelves a casa')}
${tip('<code>cd -</code> te devuelve al directorio en el que estabas justo antes. Muy útil para ir y volver.')}`,
tasks:[
 {t:'Entra en el directorio <code>documentos</code>',h:'<code>cd documentos</code> (prueba a escribir <code>cd doc</code> y pulsar <kbd>Tab</kbd>).',ok:c=>c.cwd===HOME+'/documentos'},
 {t:'Encuentra el archivo oculto que hay en <code>documentos</code>',h:'Estando dentro, usa <code>ls -a</code>.',ok:c=>c.ran(/^ls\b.*-\w*a/)&&/\.secreto/.test(c.out)},
 {t:'Lee su contenido con <code>cat</code>',h:'<code>cat .secreto</code>',ok:c=>/Encontraste/.test(c.out)},
 {t:'Viaja a la raíz del sistema y lista lo que hay',h:'<code>cd /</code> y luego <code>ls</code>.',ok:c=>c.cwd==='/'&&c.ran(/^ls\b/)},
 {t:'Mira qué hay en <code>/etc</code> sin moverte de donde estás',h:'Pasa la ruta como argumento: <code>ls /etc</code>.',ok:c=>c.ran(/^ls\s+.*\/etc\/?(\s|$)/)&&c.status===0},
 {t:'Vuelve a tu carpeta personal',h:'<code>cd</code> o <code>cd ~</code>.',ok:c=>c.ran(/^cd(\s+~\/?)?\s*$/)&&c.cwd===HOME},
]},
{id:'l3',lv:'b',title:'Crear archivos y directorios',mins:6,theory:`
<p>Crear estructura es de lo primero que harás en cualquier proyecto.</p>
${ex('mkdir proyectos','crea un directorio')}
${ex('touch proyectos/notas.txt','crea un archivo vacío (o actualiza su fecha si ya existe)')}
${ex('mkdir -p proyectos/web/css/img','-p crea toda la cadena de una vez, sin quejarse si ya existe')}
${ex('tree proyectos','dibuja la estructura como un árbol')}
${tip('Linux distingue mayúsculas: <code>Notas.txt</code> y <code>notas.txt</code> son archivos distintos. Evita los espacios en los nombres; si los usas, pon el nombre entre comillas: <code>touch "mi archivo.txt"</code>.','warn')}`,
tasks:[
 {t:'Crea el directorio <code>proyectos</code> en tu carpeta personal',h:'<code>mkdir proyectos</code>',ok:c=>c.isDir('~/proyectos')},
 {t:'Crea el archivo vacío <code>proyectos/notas.txt</code>',h:'<code>touch proyectos/notas.txt</code>',ok:c=>c.isFile('~/proyectos/notas.txt')},
 {t:'Crea de una vez <code>proyectos/web/css/img</code>',h:'Sin <code>-p</code> fallará porque <code>web</code> no existe todavía.',ok:c=>c.isDir('~/proyectos/web/css/img')},
 {t:'Crea tres archivos de un golpe: <code>a.txt b.txt c.txt</code> dentro de <code>proyectos</code>',h:'<code>touch</code> acepta varios argumentos: <code>touch proyectos/a.txt proyectos/b.txt proyectos/c.txt</code>',ok:c=>['a','b','c'].every(x=>c.isFile(`~/proyectos/${x}.txt`))},
 {t:'Visualiza la estructura con <code>tree</code>',h:'<code>tree proyectos</code>',ok:c=>c.ran(/^tree\b/)&&c.status===0},
]},
{id:'l4',lv:'b',title:'Leer archivos',mins:6,theory:`
<p>Gran parte del trabajo en Linux es leer: configuraciones, registros, datos. Elige la herramienta según lo que necesites ver.</p>
<table class="tbl"><tr><th>Orden</th><th>Para qué</th></tr>
<tr><td><code>cat</code></td><td>muestra el archivo entero</td></tr>
<tr><td><code>head</code></td><td>las primeras líneas (10 por defecto)</td></tr>
<tr><td><code>tail</code></td><td>las últimas líneas; <code>tail -f</code> sigue un log en vivo</td></tr>
<tr><td><code>less</code></td><td>navega por archivos largos (sal con <kbd>q</kbd>)</td></tr>
<tr><td><code>wc</code></td><td>cuenta líneas, palabras y bytes</td></tr></table>
${ex('cat documentos/bienvenida.txt')}
${ex('head -n 3 logs/sistema.log','las 3 primeras líneas')}
${ex('tail -n 2 logs/sistema.log','las 2 últimas')}
${ex('wc -l logs/sistema.log','¿cuántas líneas tiene?')}
${ex('cat -n documentos/manual.txt','-n numera las líneas')}`,
tasks:[
 {t:'Lee <code>documentos/bienvenida.txt</code>',h:'<code>cat documentos/bienvenida.txt</code>',ok:c=>c.ran(/^cat\b.*bienvenida\.txt/)&&c.status===0},
 {t:'Muestra solo las 3 primeras líneas de <code>logs/sistema.log</code>',h:'<code>head -n 3 logs/sistema.log</code>',ok:c=>c.ran(/^head\b.*sistema\.log/)&&c.outLines===3},
 {t:'Muestra las 2 últimas líneas del mismo log',h:'<code>tail -n 2 logs/sistema.log</code>',ok:c=>c.ran(/^tail\b.*sistema\.log/)&&c.outLines===2},
 {t:'Cuenta cuántas líneas tiene <code>logs/access.log</code>',h:'<code>wc -l logs/access.log</code>',ok:c=>c.ran(/^wc\b.*-\w*l.*access\.log|^wc\b.*access\.log.*-l/)&&c.out.includes(String(ACC_LINES.length))},
 {t:'Muestra <code>documentos/manual.txt</code> con números de línea',h:'<code>cat -n documentos/manual.txt</code>',ok:c=>c.ran(/^cat\s+-n\b.*manual/)||c.ran(/^nl\b.*manual/)},
]},
{id:'l5',lv:'b',title:'Copiar, mover y borrar',mins:8,theory:`
<p>Tres órdenes cubren casi toda la gestión de archivos:</p>
${ex('cp documentos/bienvenida.txt respaldo.txt','cp ORIGEN DESTINO: copia')}
${ex('mv respaldo.txt documentos/','mv a un directorio: mueve')}
${ex('mv documentos/respaldo.txt documentos/copia.txt','mv con otro nombre: renombra')}
${ex('rm temporal.txt','borra un archivo')}
${ex('rm -r basura','-r borra un directorio con todo lo que contiene')}
${tip('<b>En la terminal no hay papelera.</b> Lo que borras con <code>rm</code> desaparece. Antes de un <code>rm -r</code>, haz un <code>ls</code> de lo que vas a borrar. Y nunca, nunca, ejecutes <code>rm -rf /</code>.','danger')}
<p>Para copiar directorios enteros, <code>cp</code> también necesita <code>-r</code>: <code>cp -r documentos copia_docs</code>.</p>`,
tasks:[
 {t:'Copia <code>documentos/bienvenida.txt</code> a <code>respaldo.txt</code> en tu carpeta personal',h:'<code>cp documentos/bienvenida.txt respaldo.txt</code>',ok:c=>c.isFile('~/respaldo.txt')},
 {t:'Crea el directorio <code>backups</code> y mueve <code>respaldo.txt</code> dentro',h:'<code>mkdir backups</code> y después <code>mv respaldo.txt backups/</code>',ok:c=>c.isFile('~/backups/respaldo.txt')&&!c.has('~/respaldo.txt')},
 {t:'Renombra <code>backups/respaldo.txt</code> a <code>backups/bienvenida.bak</code>',h:'Renombrar es mover con otro nombre: <code>mv backups/respaldo.txt backups/bienvenida.bak</code>',ok:c=>c.isFile('~/backups/bienvenida.bak')&&!c.has('~/backups/respaldo.txt')},
 {t:'Copia el directorio <code>datos</code> entero a <code>datos_copia</code>',h:'Los directorios necesitan <code>-r</code>: <code>cp -r datos datos_copia</code>',ok:c=>c.isFile('~/datos_copia/frutas.txt')},
 {t:'Borra <code>temporal.txt</code>',h:'<code>rm temporal.txt</code>',ok:c=>!c.has('~/temporal.txt')},
 {t:'Borra el directorio <code>basura</code> con todo su contenido',h:'Prueba primero <code>rm basura</code> para ver el error y luego <code>rm -r basura</code>.',ok:c=>!c.has('~/basura')},
]},
{id:'l6',lv:'b',title:'echo y redirecciones',mins:8,theory:`
<p>Cada orden tiene tres canales: la <b>entrada estándar</b> (stdin), la <b>salida estándar</b> (stdout) y la <b>salida de errores</b> (stderr). Por defecto la salida va a la pantalla, pero puedes <i>redirigirla</i> a un archivo.</p>
<table class="tbl"><tr><th>Símbolo</th><th>Efecto</th></tr>
<tr><td><code>&gt;</code></td><td>envía la salida a un archivo <b>sobrescribiéndolo</b></td></tr>
<tr><td><code>&gt;&gt;</code></td><td>la <b>añade</b> al final del archivo</td></tr>
<tr><td><code>2&gt;</code></td><td>redirige solo los errores</td></tr>
<tr><td><code>&lt;</code></td><td>usa un archivo como entrada</td></tr></table>
${ex('echo "Hola Linux"','echo imprime texto')}
${ex('echo "Hola Linux" > saludo.txt','crea (o machaca) saludo.txt')}
${ex('echo "Segunda línea" >> saludo.txt','añade al final')}
${ex('cat saludo.txt')}
${ex('ls noexiste 2> errores.txt','el error va al archivo, no a la pantalla')}
${tip('<code>/dev/null</code> es un «agujero negro»: lo que mandes allí desaparece. <code>orden 2&gt;/dev/null</code> oculta los errores.')}`,
tasks:[
 {t:'Imprime en pantalla el texto <code>Hola Linux</code>',h:'<code>echo "Hola Linux"</code>',ok:c=>c.ran(/^echo\b/)&&/hola linux/i.test(c.out)},
 {t:'Guarda <code>Hola Linux</code> en el archivo <code>saludo.txt</code>',h:'<code>echo "Hola Linux" &gt; saludo.txt</code>',ok:c=>/hola linux/i.test(c.read('~/saludo.txt'))},
 {t:'Añade una segunda línea a <code>saludo.txt</code> sin borrar la primera',h:'Con <code>&gt;&gt;</code>: <code>echo "Aprendo redirecciones" &gt;&gt; saludo.txt</code>',ok:c=>/hola linux/i.test(c.read('~/saludo.txt'))&&lines(c.read('~/saludo.txt')).length>=2},
 {t:'Guarda el listado detallado de tu carpeta en <code>listado.txt</code>',h:'<code>ls -l &gt; listado.txt</code>',ok:c=>/^total|^[d-][rwx-]{9}/m.test(c.read('~/listado.txt'))},
 {t:'Provoca un error y guárdalo en <code>errores.txt</code> con <code>2&gt;</code>',h:'<code>ls noexiste 2&gt; errores.txt</code>',ok:c=>/No existe/.test(c.read('~/errores.txt'))},
]},
/* ---------------- INTERMEDIO ---------------- */
{id:'l7',lv:'i',title:'grep y tuberías',mins:10,theory:`
<p>La idea más poderosa de Unix: <b>programas pequeños que hacen una cosa bien y se combinan</b>. La tubería <code>|</code> conecta la salida de una orden con la entrada de la siguiente.</p>
<div class="pipe"><span>cat log</span><i>→</i><span>grep ERROR</span><i>→</i><span>wc -l</span></div>
<p><code>grep</code> filtra las líneas que contienen un patrón:</p>
${ex('grep ERROR logs/sistema.log')}
${ex('grep -i warn logs/sistema.log','-i: sin distinguir mayúsculas')}
${ex('grep -c ERROR logs/sistema.log','-c: solo cuenta')}
${ex('grep -v INFO logs/sistema.log','-v: las que NO coinciden')}
${ex('grep -n nginx logs/sistema.log','-n: con número de línea')}
${ex('cat logs/sistema.log | grep ERROR | wc -l','encadenando tres órdenes')}
${tip('El patrón de <code>grep</code> es una <b>expresión regular</b>: <code>^</code> es inicio de línea, <code>$</code> el final, <code>.</code> cualquier carácter. Prueba <code>grep "^2026.*nginx" logs/sistema.log</code>.')}`,
tasks:[
 {t:'Muestra las líneas con <code>ERROR</code> de <code>logs/sistema.log</code>',h:'<code>grep ERROR logs/sistema.log</code>',ok:c=>c.ran(/^grep\b.*ERROR.*sistema\.log/)&&c.outLines===3},
 {t:'Cuenta cuántas líneas de error hay usando una opción de grep',h:'<code>grep -c ERROR logs/sistema.log</code>',ok:c=>c.ran(/^grep\b.*-\w*c/)&&c.out.trim()==='3'},
 {t:'Busca los avisos <code>WARN</code> sin importar mayúsculas (hay uno escrito en minúsculas)',h:'<code>grep -i warn logs/sistema.log</code>',ok:c=>c.ran(/^grep\b.*-\w*i/)&&/warn  Temperatura/.test(c.out)},
 {t:'Muestra todo lo que NO sea <code>INFO</code>',h:'<code>grep -v INFO logs/sistema.log</code>',ok:c=>c.ran(/^grep\b.*-\w*v/)&&!/INFO/.test(c.out)&&c.outLines>0},
 {t:'Construye una tubería de 3 órdenes que cuente los errores',h:'<code>cat logs/sistema.log | grep ERROR | wc -l</code>',ok:c=>(c.cmd.match(/\|/g)||[]).length>=2&&c.out.trim()==='3'},
]},
{id:'l8',lv:'i',title:'Ordenar y transformar texto',mins:10,theory:`
<p>Con estas herramientas puedes analizar datos sin abrir una hoja de cálculo.</p>
${ex('sort datos/frutas.txt','ordena alfabéticamente')}
${ex('sort datos/frutas.txt | uniq','uniq quita repetidos… pero solo si están juntos: por eso va después de sort')}
${ex('sort datos/frutas.txt | uniq -c | sort -nr','ranking: cuántas veces aparece cada una, de más a menos')}
${ex('cut -d, -f2 datos/ventas.csv','-d separador, -f columna')}
${ex('echo "hola mundo" | tr a-z A-Z','tr cambia caracteres')}
${tip('<code>sort -n</code> ordena como números (si no, «10» va antes que «9»), <code>-r</code> invierte y <code>-t, -k3</code> ordena por la tercera columna separada por comas.')}`,
tasks:[
 {t:'Ordena alfabéticamente <code>datos/frutas.txt</code>',h:'<code>sort datos/frutas.txt</code>',ok:c=>c.ran(/^sort\b.*frutas/)&&c.out.startsWith('banana')},
 {t:'Obtén la lista de frutas sin repetir',h:'<code>sort datos/frutas.txt | uniq</code> (o <code>sort -u</code>)',ok:c=>c.ran(/sort/)&&c.outLines===6&&!/^\s*\d/.test(c.out)},
 {t:'Haz el ranking de frutas: cuántas hay de cada una, de más a menos',h:'<code>sort datos/frutas.txt | uniq -c | sort -nr</code>',ok:c=>c.ran(/uniq\s+-c/)&&/^\s*4 manzana/.test(c.out)},
 {t:'Extrae solo la columna <code>producto</code> de <code>datos/ventas.csv</code>',h:'Es la 2.ª columna, separada por comas: <code>cut -d, -f2 datos/ventas.csv</code>',ok:c=>/producto/.test(c.out)&&/teclado/.test(c.out)&&!c.out.includes(',')},
 {t:'Pasa a mayúsculas el contenido de <code>datos/frutas.txt</code>',h:'<code>tr</code> solo lee de la entrada: <code>cat datos/frutas.txt | tr a-z A-Z</code>',ok:c=>c.ran(/\btr\b/)&&/MANZANA/.test(c.out)},
 {t:'Ordena <code>ventas.csv</code> por cantidad (3.ª columna) de mayor a menor',h:'<code>sort -t, -k3 -nr datos/ventas.csv</code>',ok:c=>c.ran(/^sort\b/)&&/^2026-11-05,cable,10/.test(c.out)},
]},
{id:'l9',lv:'i',title:'Buscar archivos con find',mins:8,theory:`
<p><code>find</code> recorre directorios buscando lo que cumpla tus condiciones. Su forma es <code>find DÓNDE CONDICIONES</code>.</p>
${ex('find . -name "*.txt"','todos los .txt desde aquí (pon el patrón entre comillas)')}
${ex('find . -type d','solo directorios (f = archivos)')}
${ex('find . -name "*.log" -size +1k','combina condiciones')}
${ex('find / -name passwd','buscando en todo el sistema…')}
${ex('find / -name passwd 2>/dev/null','…y ocultando los «Permiso denegado»')}
${tip('Si buscas en <code>/</code> como usuario normal verás errores de directorios que no puedes leer (como <code>/root</code>). Es normal: redirige stderr a <code>/dev/null</code>.')}`,
tasks:[
 {t:'Busca todos los archivos <code>.txt</code> bajo tu carpeta personal',h:'<code>find . -name "*.txt"</code>',ok:c=>c.ran(/^find\b.*-i?name/)&&/bienvenida\.txt/.test(c.out)},
 {t:'Lista solo los directorios',h:'<code>find . -type d</code>',ok:c=>c.ran(/-type\s+d/)&&/\.\/logs/.test(c.out)},
 {t:'Busca el archivo <code>passwd</code> en todo el sistema',h:'<code>find / -name passwd</code>. Verás algún error de permisos.',ok:c=>/\/etc\/passwd/.test(c.out)&&c.ran(/^find\s+\//)},
 {t:'Repite la búsqueda ocultando los errores',h:'Añade <code>2&gt;/dev/null</code> al final.',ok:c=>/\/etc\/passwd/.test(c.out)&&c.ran(/2>\s*\/dev\/null/)},
 {t:'Guarda la lista de todos los <code>.log</code> en <code>encontrados.txt</code>',h:'<code>find . -name "*.log" &gt; encontrados.txt</code>',ok:c=>/sistema\.log/.test(c.read('~/encontrados.txt'))},
]},
{id:'l10',lv:'i',title:'Permisos',mins:12,theory:`
<p>Cada archivo tiene un <b>dueño</b>, un <b>grupo</b> y permisos para tres tipos de usuario. Míralos con <code>ls -l</code>:</p>
<div class="perm"><span class="t">-</span><span class="u">rwx</span><span class="g">r-x</span><span class="o">r--</span></div>
<ul class="legend"><li><b>1.º</b> tipo: <code>-</code> archivo, <code>d</code> directorio</li><li><b class="u">rwx</b> usuario (dueño)</li><li><b class="g">r-x</b> grupo</li><li><b class="o">r--</b> otros</li></ul>
<p><code>r</code> leer, <code>w</code> escribir, <code>x</code> ejecutar (en directorios, <code>x</code> permite entrar).</p>
<h3>Notación numérica</h3>
<p>Cada permiso vale un número: <b>r=4, w=2, x=1</b>. Se suman por grupo: <code>7</code>=rwx, <code>6</code>=rw-, <code>5</code>=r-x, <code>4</code>=r--, <code>0</code>=---. Así <code>chmod 754</code> da <code>rwxr-xr--</code>.</p>
${ex('ls -l')}
${ex('chmod +x scripts/backup.sh','notación simbólica: añade ejecución')}
${ex('chmod 600 secreto.txt','solo el dueño lee y escribe')}
${ex('chmod u=rw,g=r,o= notas.txt','u/g/o + - =')}
${tip('Un archivo con contraseñas nunca debería ser legible por «otros». <code>600</code> es el permiso típico para claves privadas.','warn')}`,
tasks:[
 {t:'Muestra los permisos de los archivos de tu carpeta',h:'<code>ls -l</code>',ok:c=>c.ran(/^ls\s+-[a-zA-Z]*l/)},
 {t:'Intenta ejecutar <code>./scripts/backup.sh</code> (fallará: aún no tiene permiso)',h:'Escribe <code>./scripts/backup.sh</code> y observa «Permiso denegado».',ok:c=>c.ran(/backup\.sh/)&&c.status===126},
 {t:'Dale permiso de ejecución',h:'<code>chmod +x scripts/backup.sh</code>',ok:c=>(c.mode('~/scripts/backup.sh')&0o100)>0},
 {t:'Ahora ejecútalo con éxito',h:'<code>./scripts/backup.sh</code>',ok:c=>c.ran(/backup\.sh/)&&c.status===0&&/Respaldo completado/.test(c.out)},
 {t:'Protege <code>secreto.txt</code>: lectura y escritura solo para ti (rw-------)',h:'<code>chmod 600 secreto.txt</code>',ok:c=>c.mode('~/secreto.txt')===0o600},
 {t:'Deja <code>documentos/manual.txt</code> en solo lectura para todos (r--r--r--)',h:'r=4 para los tres: <code>chmod 444 documentos/manual.txt</code>',ok:c=>c.mode('~/documentos/manual.txt')===0o444},
]},
{id:'l11',lv:'i',title:'Variables de entorno',mins:7,theory:`
<p>La shell guarda información en <b>variables</b>. Se leen anteponiendo <code>$</code>. Las <b>de entorno</b> (en mayúsculas por convención) las heredan los programas que lanzas.</p>
<table class="tbl"><tr><th>Variable</th><th>Contiene</th></tr>
<tr><td><code>$HOME</code></td><td>tu carpeta personal</td></tr><tr><td><code>$USER</code></td><td>tu usuario</td></tr>
<tr><td><code>$PATH</code></td><td>dónde busca la shell los programas</td></tr><tr><td><code>$SHELL</code></td><td>tu shell</td></tr></table>
${ex('echo $HOME')}
${ex('echo "Soy $USER y uso $SHELL"','entre comillas dobles las variables se expanden…')}
${ex("echo 'Soy $USER'",'…entre simples, no')}
${ex('export CURSO=Linux','crea una variable de entorno')}
${ex('env | grep CURSO')}
${tip('Sin espacios alrededor del <code>=</code>: <code>CURSO=Linux</code> funciona; <code>CURSO = Linux</code> intentaría ejecutar una orden llamada CURSO. Para que dure entre sesiones, se añade el <code>export</code> a <code>~/.bashrc</code>.','warn')}`,
tasks:[
 {t:'Muestra el valor de <code>$HOME</code>',h:'<code>echo $HOME</code>',ok:c=>c.ran(/^echo\b.*\$\{?HOME/)},
 {t:'Lista todas las variables de entorno',h:'<code>env</code> o <code>printenv</code>',ok:c=>c.ran(/^(env|printenv)\s*$/)},
 {t:'Crea la variable de entorno <code>CURSO</code> con el valor <code>Linux</code>',h:'<code>export CURSO=Linux</code>',ok:c=>c.st.env.CURSO==='Linux'},
 {t:'Úsala en una frase: <code>echo "Estoy aprendiendo $CURSO"</code>',h:'Usa comillas dobles para que se expanda.',ok:c=>c.ran(/^echo\b.*\$\{?CURSO/)&&/Linux/.test(c.out)},
 {t:'Comprueba que está en el entorno filtrando con una tubería',h:'<code>env | grep CURSO</code>',ok:c=>c.ran(/^(env|printenv)\s*\|\s*grep/)&&/CURSO=/.test(c.out)},
]},
/* ---------------- AVANZADO ---------------- */
{id:'l12',lv:'a',title:'Procesos y señales',mins:10,theory:`
<p>Cada programa en ejecución es un <b>proceso</b> con un número único, el <b>PID</b>. Algo va mal en este sistema: un proceso se ha quedado colgado consumiendo casi toda la CPU. Vamos a encontrarlo y terminarlo.</p>
${ex('ps','tus procesos en esta terminal')}
${ex('ps aux','todos los procesos de todos los usuarios')}
${ex('top','los que más consumen, arriba')}
${ex('ps aux | grep python','busca un proceso concreto')}
<h3>Señales</h3>
<p><code>kill PID</code> no «mata»: envía una <b>señal</b>. Por defecto es <code>SIGTERM</code> (15), una petición educada para que el programa termine; un proceso bloqueado puede ignorarla. <code>kill -9 PID</code> envía <code>SIGKILL</code>, que el kernel aplica sin preguntar.</p>
${tip('Usa <code>kill -9</code> como último recurso: el proceso no puede guardar datos ni limpiar al salir.','warn')}`,
tasks:[
 {t:'Lista los procesos de tu terminal',h:'<code>ps</code>',ok:c=>c.ran(/^ps\s*$/)},
 {t:'Lista todos los procesos del sistema',h:'<code>ps aux</code>',ok:c=>c.ran(/^ps\s+(aux|-aux|ax|-e|-ef|-A)/)},
 {t:'Encuentra el proceso colgado filtrando con grep',h:'<code>ps aux | grep colgado</code>',ok:c=>c.ran(/^ps\b.*\|\s*grep/)&&/colgado/.test(c.out)},
 {t:'Pídele que termine con <code>kill</code> y su PID (4242)',h:'<code>kill 4242</code> — luego comprueba con <code>ps aux</code> si sigue vivo…',ok:c=>c.ran(/^kill\s+(-15\s+|-TERM\s+)?4242/)},
 {t:'Sigue ahí: fuérzalo con SIGKILL',h:'<code>kill -9 4242</code>',ok:c=>!c.st.procs.some(p=>p.pid===4242)},
]},
{id:'l13',lv:'a',title:'Información del sistema',mins:7,theory:`
<p>Lo primero que hace un administrador al entrar en una máquina desconocida es averiguar qué es y cómo está.</p>
${ex('uname -a','kernel y arquitectura')}
${ex('cat /etc/os-release','distribución y versión')}
${ex('uptime','cuánto lleva encendida y su carga')}
${ex('df -h','espacio en disco (-h: legible)')}
${ex('free -h','memoria RAM y swap')}
${ex('du -sh logs','cuánto ocupa un directorio')}
${tip('La <b>carga media</b> de <code>uptime</code> son tres números: último minuto, últimos 5 y últimos 15. Compáralos con el número de núcleos: por debajo, el sistema va holgado.')}`,
tasks:[
 {t:'Muestra la información completa del kernel',h:'<code>uname -a</code>',ok:c=>c.ran(/^uname\s+-\w*a/)},
 {t:'Averigua qué distribución es',h:'<code>cat /etc/os-release</code>',ok:c=>c.ran(/os-release/)&&/Ubuntu/.test(c.out)},
 {t:'Comprueba el espacio en disco en formato legible',h:'<code>df -h</code>',ok:c=>c.ran(/^df\s+-\w*h/)},
 {t:'Consulta la memoria disponible',h:'<code>free -h</code>',ok:c=>c.ran(/^free\b/)},
 {t:'Calcula cuánto ocupa el directorio <code>logs</code> en total',h:'<code>du -sh logs</code>',ok:c=>c.ran(/^du\s+-\w*s/)&&/logs/.test(c.out)},
 {t:'¿Cuánto tiempo lleva encendido el sistema?',h:'<code>uptime</code>',ok:c=>c.ran(/^uptime\b/)},
]},
{id:'l14',lv:'a',title:'Tu primer script',mins:12,theory:`
<p>Un <b>script</b> es un archivo de texto con órdenes que se ejecutan una tras otra. Es la base de la automatización.</p>
<pre class="code">#!/bin/bash
# Esto es un comentario
echo "Hola, $1"
whoami</pre>
<ul class="legend"><li><code>#!/bin/bash</code> es el <b>shebang</b>: indica qué intérprete usar</li><li><code>$1</code>, <code>$2</code>… son los argumentos que recibe; <code>$#</code> cuántos son</li></ul>
<p>Como TuxLab no tiene un editor interactivo, lo escribiremos línea a línea con redirecciones. Usa <b>comillas simples</b> para que <code>$1</code> se guarde tal cual y no se expanda ahora:</p>
${ex("echo '#!/bin/bash' > hola.sh")}
${ex(`echo 'echo "Hola, $1"' >> hola.sh`)}
${ex('cat hola.sh')}
${ex('chmod +x hola.sh')}
${ex('./hola.sh Tux','el ./ indica «el archivo de este directorio»')}
${tip('En un Linux real usarías un editor como <code>nano hola.sh</code>. Y podrías usar bucles (<code>for</code>) y condiciones (<code>if</code>): el siguiente paso cuando domines esto.')}`,
tasks:[
 {t:'Crea <code>hola.sh</code> con el shebang en la primera línea',h:`<code>echo '#!/bin/bash' &gt; hola.sh</code>`,ok:c=>c.read('~/hola.sh').startsWith('#!')},
 {t:'Añade una línea que salude usando el primer argumento <code>$1</code>',h:`<code>echo 'echo "Hola, $1"' &gt;&gt; hola.sh</code>`,ok:c=>/\$1/.test(c.read('~/hola.sh'))},
 {t:'Hazlo ejecutable',h:'<code>chmod +x hola.sh</code>',ok:c=>(c.mode('~/hola.sh')&0o100)>0},
 {t:'Ejecútalo pasándole un nombre como argumento',h:'<code>./hola.sh Tux</code>',ok:c=>c.ran(/^(\.\/|bash\s+|sh\s+)(\.\/)?hola\.sh\s+\S+/)&&c.status===0&&c.out.trim().length>0},
 {t:'Añade otra orden al script (por ejemplo <code>date</code>) y vuelve a ejecutarlo',h:`<code>echo 'date' &gt;&gt; hola.sh</code> y después <code>./hola.sh Tux</code>`,ok:c=>lines(c.read('~/hola.sh')).filter(l=>l.trim()&&!l.startsWith('#')).length>=2&&c.ran(/hola\.sh/)&&c.status===0&&c.outLines>=2},
]},
{id:'l15',lv:'a',title:'sed y awk',mins:14,theory:`
<p>Dos clásicos para transformar texto a gran escala.</p>
<h3>sed: buscar y reemplazar</h3>
${ex(`sed 's/ERROR/FALLO/' logs/sistema.log`,'s/buscar/reemplazar/ — el archivo original no cambia')}
${ex(`sed 's/Linux/GNU-Linux/g' documentos/bienvenida.txt`,'g: todas las apariciones de cada línea')}
${ex(`sed -n '3p' documentos/manual.txt`,'-n con p: imprime solo la línea 3')}
${ex(`sed '/INFO/d' logs/sistema.log`,'/patrón/d: borra las líneas que coinciden')}
${ex(`sed -i 's|Linux|GNU/Linux|g' documentos/bienvenida.txt`,'-i modifica el archivo; puedes usar | como separador si el texto contiene /')}
<h3>awk: columnas y cálculos</h3>
<p>awk divide cada línea en campos: <code>$1</code>, <code>$2</code>… (<code>$0</code> es la línea entera, <code>NR</code> el número de línea).</p>
${ex(`awk '{print $1}' logs/access.log`,'primera columna (separada por espacios)')}
${ex(`awk -F, '{print $2, $3}' datos/ventas.csv`,'-F, usa la coma como separador')}
${ex(`awk -F, 'NR>1 {total += $3} END {print total}' datos/ventas.csv`,'salta la cabecera, suma la columna 3 e imprime al final')}
${ex(`awk '$8 == 404' logs/access.log`,'solo las líneas cuyo campo 8 sea 404')}`,
tasks:[
 {t:'Muestra <code>sistema.log</code> cambiando <code>ERROR</code> por <code>FALLO</code>',h:`<code>sed 's/ERROR/FALLO/' logs/sistema.log</code>`,ok:c=>c.ran(/^sed\b/)&&/FALLO/.test(c.out)&&!/ERROR/.test(c.out)},
 {t:'Imprime solo las direcciones IP (1.ª columna) de <code>logs/access.log</code>',h:`<code>awk '{print $1}' logs/access.log</code>`,ok:c=>c.ran(/^awk\b/)&&/^\d+\.\d+\.\d+\.\d+$/m.test(c.out)&&!/GET/.test(c.out)},
 {t:'Muestra la columna <code>producto</code> de <code>ventas.csv</code> usando awk',h:`<code>awk -F, '{print $2}' datos/ventas.csv</code>`,ok:c=>c.ran(/^awk\b.*-F/)&&/teclado/.test(c.out)&&!c.out.includes(',')},
 {t:'Calcula con awk el total de unidades vendidas (suma de la columna 3)',h:`<code>awk -F, 'NR&gt;1 {t += $3} END {print t}' datos/ventas.csv</code>`,ok:c=>c.ran(/^awk\b/)&&c.out.trim()==='23'},
 {t:'Modifica el archivo: cambia todas las palabras <code>Linux</code> por <code>GNU/Linux</code> en <code>documentos/bienvenida.txt</code>',h:`<code>sed -i 's|Linux|GNU/Linux|g' documentos/bienvenida.txt</code>`,ok:c=>(c.read('~/documentos/bienvenida.txt').match(/GNU\/Linux/g)||[]).length>=3},
]},
/* ---------------- EXPERTO ---------------- */
{id:'l16',lv:'e',title:'Usuarios, grupos y sudo',mins:10,theory:`
<p>Linux es multiusuario desde su origen. Los usuarios están en <code>/etc/passwd</code> (una línea por usuario, campos separados por <code>:</code>) y los permisos especiales se reparten mediante <b>grupos</b>.</p>
<pre class="code">estudiante:x:1000:1000:Estudiante TuxLab:/home/estudiante:/bin/bash
  usuario  │  UID  GID     descripción         carpeta          shell</pre>
<p><b>root</b> (UID 0) puede hacerlo todo. Para no trabajar como root, los usuarios del grupo <code>sudo</code> anteponen <code>sudo</code> a las órdenes que lo necesitan.</p>
${ex('id','tu UID, GID y grupos')}
${ex('grep estudiante /etc/passwd')}
${ex('sudo useradd -m ana','-m crea su carpeta en /home')}
${ex('sudo usermod -aG sudo ana','-a añade al grupo sin quitar los demás')}
${ex('groups ana')}
${tip('Olvidar la <code>-a</code> en <code>usermod -G</code> sustituye todos los grupos del usuario: un error clásico que deja a gente sin acceso.','danger')}`,
tasks:[
 {t:'Consulta tu identidad: UID, GID y grupos',h:'<code>id</code>',ok:c=>c.ran(/^id\s*$/)},
 {t:'Busca tu línea en <code>/etc/passwd</code>',h:'<code>grep estudiante /etc/passwd</code>',ok:c=>c.ran(/^grep\b.*passwd|cat\s+\/etc\/passwd\s*\|\s*grep/)&&/estudiante:x:1000/.test(c.out)},
 {t:'Intenta crear el usuario <code>ana</code> sin sudo (verás que no puedes)',h:'<code>useradd ana</code>',ok:c=>c.ran(/^useradd\b/)&&c.status!==0},
 {t:'Ahora créalo con sudo y con carpeta personal',h:'<code>sudo useradd -m ana</code>',ok:c=>/^ana:/m.test(c.read('/etc/passwd'))&&c.isDir('/home/ana')},
 {t:'Añade a <code>ana</code> al grupo <code>sudo</code>',h:'<code>sudo usermod -aG sudo ana</code>',ok:c=>c.st.groups.sudo.includes('ana')},
 {t:'Comprueba los grupos de <code>ana</code>',h:'<code>groups ana</code>',ok:c=>c.ran(/^groups\s+ana|^id\s+ana/)&&/sudo/.test(c.out)},
]},
{id:'l17',lv:'e',title:'Redes',mins:10,theory:`
<p>Diagnosticar la red es tarea diaria de cualquier administrador. Sigue siempre el mismo orden: ¿tengo IP? → ¿llego al otro equipo? → ¿el servicio escucha?</p>
${ex('ip a','interfaces y direcciones IP (ifconfig es la versión antigua)')}
${ex('ip r','tabla de rutas: «default via» es tu puerta de enlace')}
${ex('cat /etc/hosts','nombres resueltos localmente')}
${ex('ping -c 3 servidor','¿responde? -c limita el número de paquetes')}
${ex('ss -tuln','puertos en escucha: t=TCP u=UDP l=escuchando n=numérico')}
${ex('curl example.com','petición HTTP; -I muestra solo las cabeceras')}
${tip('Puertos que conviene reconocer: <b>22</b> SSH, <b>80</b> HTTP, <b>443</b> HTTPS, <b>53</b> DNS, <b>3306</b> MySQL/MariaDB.')}`,
tasks:[
 {t:'Averigua la dirección IP de la máquina',h:'<code>ip a</code>',ok:c=>c.ran(/^ip\s+(-c\s+)?(a|addr|address)\b|^ifconfig/)},
 {t:'Mira la tabla de rutas',h:'<code>ip r</code>',ok:c=>c.ran(/^ip\s+(r|route)\b/)},
 {t:'Consulta qué nombres están definidos en <code>/etc/hosts</code>',h:'<code>cat /etc/hosts</code>',ok:c=>c.ran(/\/etc\/hosts/)&&/servidor/.test(c.out)},
 {t:'Comprueba si <code>servidor</code> responde enviando 3 paquetes',h:'<code>ping -c 3 servidor</code>',ok:c=>c.ran(/^ping\b.*-c\s*3/)&&c.status===0},
 {t:'Lista los puertos en escucha',h:'<code>ss -tuln</code>',ok:c=>c.ran(/^(ss|netstat)\b/)},
 {t:'Haz una petición HTTP a <code>example.com</code>',h:'<code>curl example.com</code>',ok:c=>c.ran(/^curl\b/)&&c.status===0},
]},
{id:'l18',lv:'e',title:'Paquetes y servicios: monta un servidor web',mins:12,theory:`
<p>En Debian y Ubuntu el software se instala con <code>apt</code> desde repositorios oficiales, y los servicios (programas que corren en segundo plano) se gestionan con <code>systemctl</code>.</p>
${ex('sudo apt update','refresca la lista de paquetes disponibles (no instala nada)')}
${ex('sudo apt install nginx','instala el servidor web nginx')}
${ex('systemctl status nginx','¿está en marcha?')}
${ex('sudo systemctl start nginx','arráncalo')}
${ex('curl localhost','¡pide la página a tu propio servidor!')}
${ex('sudo systemctl enable nginx','que arranque solo al encender la máquina')}
${tip('<code>start</code> arranca ahora; <code>enable</code> lo deja configurado para cada arranque. Son independientes: casi siempre querrás ambas. Atajo: <code>systemctl enable --now</code>.')}`,
tasks:[
 {t:'Actualiza la lista de paquetes',h:'Requiere privilegios: <code>sudo apt update</code>',ok:c=>c.st.aptUpdated},
 {t:'Instala el servidor web <code>nginx</code>',h:'<code>sudo apt install nginx</code>',ok:c=>c.st.pkgs.has('nginx')},
 {t:'Consulta su estado',h:'<code>systemctl status nginx</code>',ok:c=>c.ran(/systemctl\s+status\s+nginx/)&&c.st.pkgs.has('nginx')},
 {t:'Arranca el servicio',h:'<code>sudo systemctl start nginx</code>',ok:c=>c.st.svcs.nginx?.active},
 {t:'Comprueba que sirve la web pidiéndola a <code>localhost</code>',h:'<code>curl localhost</code>',ok:c=>/Welcome to nginx/.test(c.out)},
 {t:'Haz que nginx arranque automáticamente con el sistema',h:'<code>sudo systemctl enable nginx</code>',ok:c=>c.st.svcs.nginx?.enabled},
 {t:'Bonus: instala <code>cowsay</code> y haz que la vaca diga algo',h:'<code>sudo apt install cowsay</code> y luego <code>cowsay "¡Soy sysadmin!"</code>',ok:c=>c.ran(/^cowsay\b/)&&c.status===0},
]},
{id:'l19',lv:'e',title:'Reto final: analiza un ataque',mins:15,theory:`
<p>Son las 10:01 y el servidor web va lento. Tu jefa sospecha que alguien lo está saturando a peticiones. Tienes el registro de accesos en <code>logs/access.log</code>. Cada línea tiene este formato:</p>
<pre class="code">192.168.1.10 - - [16/Nov/2026:10:00:02] "GET /login HTTP/1.1" 200 1534
 $1 (IP)                $4 (fecha)        $5   $6 (ruta)        $8   $9
                                                             (estado) (bytes)</pre>
<p>No hay orden mágica: tienes que <b>combinar</b> lo que has aprendido. Herramientas útiles: <code>wc</code>, <code>cut</code>, <code>awk</code>, <code>sort</code>, <code>uniq -c</code>, <code>head</code>, <code>grep</code> y la redirección <code>&gt;</code>.</p>
${tip('Construye las tuberías paso a paso: ejecuta la primera orden, mira la salida, añade <code>| siguiente</code> y repite. Así trabajan los profesionales.')}`,
tasks:[
 {t:'¿Cuántas peticiones hay en total en el log?',h:'Cuenta líneas con <code>wc -l</code>.',ok:c=>c.ran(/wc\b/)&&c.out.includes(String(ACC_LINES.length))},
 {t:'Extrae solo la columna de IPs',h:`<code>cut -d' ' -f1 logs/access.log</code> o <code>awk '{print $1}' logs/access.log</code>`,ok:c=>c.ran(/^(cut|awk)\b/)&&/^\d+\.\d+\.\d+\.\d+$/m.test(c.out)&&c.outLines===ACC_LINES.length},
 {t:'Haz un ranking de IPs por número de peticiones, de más a menos',h:'Añade a lo anterior <code>| sort | uniq -c | sort -nr</code>',ok:c=>c.ran(/uniq\s+-c/)&&new RegExp('^\\s*9 '+escRe(TOPIP)).test(c.out)},
 {t:'Quédate solo con el top 3',h:'Añade <code>| head -n 3</code> al final.',ok:c=>c.ran(/head\b/)&&c.outLines===3&&c.out.includes(TOPIP)&&/uniq\s+-c/.test(c.cmd)},
 {t:'¿Cuántas peticiones devolvieron un error 404?',h:`<code>grep " 404 " logs/access.log | wc -l</code> o con awk: <code>awk '$8 == 404' logs/access.log | wc -l</code>`,ok:c=>c.ran(/404/)&&c.out.trim()===String(N404)},
 {t:'Guarda el top 3 de IPs en <code>reporte.txt</code> para enviárselo a tu jefa',h:'Repite la tubería del top 3 y añade <code>&gt; reporte.txt</code>.',ok:c=>c.read('~/reporte.txt').includes(TOPIP)&&lines(c.read('~/reporte.txt')).length<=5},
]},
];

const QUIZ={
 b:[
  {q:'¿Qué orden muestra el directorio en el que estás?',o:['pwd','cd','ls','dir'],a:0,x:'pwd = print working directory. cd cambia de directorio y ls lista su contenido.'},
  {q:'¿Qué hace <code>cd ..</code>?',o:['Vuelve a tu carpeta personal','Sube al directorio padre','Va a la raíz /','Borra el directorio actual'],a:1,x:'«..» siempre representa el directorio que contiene al actual.'},
  {q:'¿Cómo ves también los archivos ocultos?',o:['ls -h','ls --hidden','ls -a','ls -o'],a:2,x:'-a (all) incluye los archivos que empiezan por punto. -h sirve para tamaños legibles.'},
  {q:'¿Qué diferencia hay entre <code>&gt;</code> y <code>&gt;&gt;</code>?',o:['Ninguna','&gt; sobrescribe el archivo, &gt;&gt; añade al final','&gt; añade al final, &gt;&gt; sobrescribe','&gt;&gt; redirige los errores'],a:1,x:'Con &gt; pierdes el contenido anterior; &gt;&gt; lo conserva y añade al final.'},
  {q:'Quieres crear <code>a/b/c</code> y no existe ninguno. ¿Qué orden usas?',o:['mkdir a/b/c','mkdir -r a/b/c','mkdir -p a/b/c','touch a/b/c'],a:2,x:'-p (parents) crea todos los directorios intermedios que falten.'},
  {q:'¿Qué representa <code>~</code>?',o:['La raíz del sistema','El directorio anterior','Tu carpeta personal','La papelera'],a:2,x:'~ se expande a $HOME, en este caso /home/estudiante.'},
 ],
 i:[
  {q:'¿Qué hace la tubería <code>|</code>?',o:['Ejecuta dos órdenes a la vez','Pasa la salida de una orden como entrada de la siguiente','Guarda la salida en un archivo','Solo ejecuta la segunda si la primera falla'],a:1,x:'Es la base de la filosofía Unix: combinar herramientas pequeñas.'},
  {q:'¿Cómo cuentas las líneas que contienen «error», sin importar mayúsculas?',o:['grep -c error log','grep -ic error log','grep -v error log','grep -n error log'],a:1,x:'-i ignora mayúsculas y -c cuenta. Se pueden combinar como -ic.'},
  {q:'¿Qué permisos da <code>chmod 754</code>?',o:['rwxr-xr--','rwxrw-r--','rw-r-xr--','rwxr--r-x'],a:0,x:'7=4+2+1 (rwx), 5=4+1 (r-x), 4 (r--).'},
  {q:'¿Por qué se usa <code>sort</code> antes de <code>uniq</code>?',o:['Por costumbre','uniq solo elimina repetidos consecutivos','sort elimina repetidos','uniq necesita números'],a:1,x:'uniq compara cada línea con la anterior; sin ordenar, los repetidos separados no se detectan.'},
  {q:'¿Qué lista <code>find . -type d</code>?',o:['Archivos borrados','Directorios','Discos','Archivos de más de 1 MB'],a:1,x:'-type d filtra directorios; -type f, archivos regulares.'},
  {q:'¿Qué hace <code>export</code>?',o:['Exporta un archivo a otro formato','Convierte una variable en variable de entorno, heredada por los procesos hijos','Borra una variable','Guarda la variable para siempre'],a:1,x:'Para que persista entre sesiones hay que añadirla a ~/.bashrc.'},
 ],
 a:[
  {q:'¿Qué señal envía <code>kill -9</code>?',o:['SIGTERM','SIGHUP','SIGKILL','SIGSTOP'],a:2,x:'SIGKILL no puede ser ignorada ni capturada por el proceso.'},
  {q:"¿Qué hace <code>sed 's/a/b/g' archivo</code>?",o:['Borra las líneas con «a»','Muestra el archivo cambiando todas las «a» por «b»','Cambia solo la primera «a» del archivo','Modifica el archivo en disco'],a:1,x:'Sin -i, sed solo muestra el resultado. La g aplica el cambio a todas las apariciones de cada línea.'},
  {q:"¿Qué imprime <code>awk -F: '{print $1}' /etc/passwd</code>?",o:['Los UID','Los nombres de usuario','Las shells','La primera línea'],a:1,x:'Con «:» como separador, el primer campo de /etc/passwd es el nombre de usuario.'},
  {q:'¿Cómo se llama la línea <code>#!/bin/bash</code> al inicio de un script?',o:['Comentario','Shebang','Hashtag','Prompt'],a:1,x:'Le dice al sistema qué intérprete debe ejecutar el script.'},
  {q:'Dentro de un script, ¿qué contiene <code>$1</code>?',o:['El nombre del script','El primer argumento','El código de salida','El PID'],a:1,x:'$0 es el nombre del script, $1 el primer argumento, $# el número de argumentos y $? el código de salida de la última orden.'},
  {q:'¿Qué diferencia hay entre <code>df</code> y <code>du</code>?',o:['Son iguales','df muestra el espacio de los sistemas de archivos; du cuánto ocupa un directorio','du muestra la memoria RAM','df borra archivos'],a:1,x:'df = disk free (visión global); du = disk usage (lo que ocupa algo concreto).'},
 ],
 e:[
  {q:'¿Qué hace <code>systemctl enable nginx</code>?',o:['Arranca nginx ahora','Lo configura para arrancar con el sistema','Lo instala','Muestra su estado'],a:1,x:'enable no lo arranca en este momento: para eso está start (o enable --now).'},
  {q:'¿Qué hace <code>sudo apt update</code>?',o:['Actualiza todos los programas','Actualiza la lista de paquetes disponibles','Actualiza el kernel','Instala actualizaciones de seguridad'],a:1,x:'update refresca el índice; upgrade es lo que instala las nuevas versiones.'},
  {q:'¿Qué muestra <code>ss -tuln</code>?',o:['Usuarios conectados','Puertos TCP y UDP en escucha','La tabla de rutas','El tráfico en tiempo real'],a:1,x:'t=TCP, u=UDP, l=listening, n=numérico (sin resolver nombres).'},
  {q:'¿Por qué es importante la <code>-a</code> en <code>usermod -aG sudo ana</code>?',o:['Activa la cuenta','Sin ella, -G reemplaza todos los grupos del usuario','Crea el grupo si no existe','Es obligatoria para root'],a:1,x:'-a (append) añade al grupo conservando los demás.'},
  {q:'¿Para qué sirve <code>2&gt;/dev/null</code>?',o:['Duplica la salida','Descarta los mensajes de error','Envía la salida a dos archivos','Ejecuta la orden dos veces'],a:1,x:'2 es el descriptor de stderr y /dev/null descarta todo lo que recibe.'},
  {q:'¿Qué tubería da las IPs que más peticiones hacen en un log de accesos?',o:["cut -d' ' -f1 log | uniq -c | sort","cut -d' ' -f1 log | sort | uniq -c | sort -nr | head","sort log | head","grep IP log | wc -l"],a:1,x:'Extraer → ordenar → contar repetidos → ordenar numéricamente al revés → quedarse con los primeros.'},
 ],
};

const BADGES=[
 {id:'first',icon:'🐣',name:'Primeros pasos',d:'Completa tu primera lección'},
 {id:'nav',icon:'🧭',name:'Navegante',d:'Domina la navegación'},
 {id:'pipe',icon:'🔗',name:'Fontanero',d:'Conecta órdenes con tuberías'},
 {id:'perm',icon:'🔐',name:'Guardián',d:'Controla los permisos'},
 {id:'proc',icon:'🎯',name:'Cazaprocesos',d:'Acaba con un proceso colgado'},
 {id:'script',icon:'📜',name:'Scripter',d:'Escribe tu primer script'},
 {id:'web',icon:'🌐',name:'Sysadmin',d:'Pon en marcha un servidor web'},
 {id:'final',icon:'🏆',name:'Analista',d:'Supera el reto final'},
 {id:'lv-b',icon:'🟢',name:'Nivel 1',d:'Completa todo Principiante'},
 {id:'lv-i',icon:'🔵',name:'Nivel 2',d:'Completa todo Intermedio'},
 {id:'lv-a',icon:'🟠',name:'Nivel 3',d:'Completa todo Avanzado'},
 {id:'lv-e',icon:'🟣',name:'Nivel 4',d:'Completa todo Experto'},
 {id:'quiz',icon:'🧠',name:'Mente brillante',d:'Saca un 100% en un test'},
 {id:'quizall',icon:'🎓',name:'Graduado',d:'Aprueba los 4 tests'},
];
const RANKS=[[0,'Novato'],[150,'Aprendiz'],[450,'Usuario'],[900,'Power user'],[1400,'Sysadmin'],[1900,'Gurú del kernel']];
