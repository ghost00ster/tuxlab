const fs=require('fs');
eval(fs.readFileSync(__dirname+'/src/engine.js','utf8')+fs.readFileSync(__dirname+'/src/content.js','utf8')+`
const SOL={
l1:['pwd','whoami','ls','date','clear'],
l2:['cd doc*','ls -a','cat .secreto','cd /','ls','ls /etc','cd ~'],
l3:['mkdir proyectos','touch proyectos/notas.txt','mkdir -p proyectos/web/css/img','touch proyectos/a.txt proyectos/b.txt proyectos/c.txt','tree proyectos'],
l4:['cat documentos/bienvenida.txt','head -n 3 logs/sistema.log','tail -n 2 logs/sistema.log','wc -l logs/access.log','cat -n documentos/manual.txt'],
l5:['cp documentos/bienvenida.txt respaldo.txt','mkdir backups','mv respaldo.txt backups/','mv backups/respaldo.txt backups/bienvenida.bak','cp -r datos datos_copia','rm temporal.txt','rm basura','rm -r basura'],
l6:['echo "Hola Linux"','echo "Hola Linux" > saludo.txt','echo "Aprendo" >> saludo.txt','ls -l > listado.txt','ls noexiste 2> errores.txt'],
l7:['grep ERROR logs/sistema.log','grep -c ERROR logs/sistema.log','grep -i warn logs/sistema.log','grep -v INFO logs/sistema.log','cat logs/sistema.log | grep ERROR | wc -l'],
l8:['sort datos/frutas.txt','sort datos/frutas.txt | uniq','sort datos/frutas.txt | uniq -c | sort -nr','cut -d, -f2 datos/ventas.csv','cat datos/frutas.txt | tr a-z A-Z','sort -t, -k3 -nr datos/ventas.csv'],
l9:['find . -name "*.txt"','find . -type d','find / -name passwd','find / -name passwd 2>/dev/null','find . -name "*.log" > encontrados.txt'],
l10:['ls -l','./scripts/backup.sh','chmod +x scripts/backup.sh','./scripts/backup.sh','chmod 600 secreto.txt','chmod 444 documentos/manual.txt'],
l11:['echo $HOME','env','export CURSO=Linux','echo "Estoy aprendiendo $CURSO"','env | grep CURSO'],
l12:['ps','ps aux','ps aux | grep colgado','kill 4242','ps aux | grep colgado','kill -9 4242'],
l13:['uname -a','cat /etc/os-release','df -h','free -h','du -sh logs','uptime'],
l14:["echo '#!/bin/bash' > hola.sh","echo 'echo \\"Hola, $1\\"' >> hola.sh",'chmod +x hola.sh','./hola.sh Tux',"echo 'date' >> hola.sh",'./hola.sh Tux'],
l15:["sed 's/ERROR/FALLO/' logs/sistema.log","awk '{print $1}' logs/access.log","awk -F, '{print $2}' datos/ventas.csv","awk -F, 'NR>1 {t += $3} END {print t}' datos/ventas.csv","sed -i 's|Linux|GNU/Linux|g' documentos/bienvenida.txt",'cat documentos/bienvenida.txt'],
l16:['id','grep estudiante /etc/passwd','useradd ana','sudo useradd -m ana','sudo usermod -aG sudo ana','groups ana','ls /home','id ana'],
l17:['ip a','ip r','cat /etc/hosts','ping -c 3 servidor','ss -tuln','curl example.com'],
l18:['apt update','sudo apt update','sudo apt install nginx','systemctl status nginx','curl localhost','sudo systemctl start nginx','curl localhost','sudo systemctl enable nginx','cowsay hola','sudo apt install cowsay','cowsay "Soy sysadmin"','ss -tuln','systemctl status nginx'],
l19:['wc -l logs/access.log',"cut -d' ' -f1 logs/access.log","cut -d' ' -f1 logs/access.log | sort | uniq -c | sort -nr","cut -d' ' -f1 logs/access.log | sort | uniq -c | sort -nr | head -n 3",'grep " 404 " logs/access.log | wc -l',"awk '$8 == 404' logs/access.log | wc -l","cut -d' ' -f1 logs/access.log | sort | uniq -c | sort -nr | head -3 > reporte.txt",'cat reporte.txt'],
};
let allok=true;
for(const L of LESSONS){
  const st=newState();const done=new Set();
  for(const cmd of SOL[L.id]){
    const {r,ev}=shellRun(st,cmd);
    if(process.argv[2]===L.id){console.log('$ '+cmd);console.log(strip(r.segs.map(s=>s.t).join('')))}
    L.tasks.forEach((t,i)=>{if(!done.has(i)){try{if(t.ok(mkCheck(ev)))done.add(i)}catch(e){console.log('ERR',L.id,i,e.message)}}});
  }
  const miss=L.tasks.map((t,i)=>i).filter(i=>!done.has(i));
  if(miss.length){allok=false;console.log('FAIL',L.id,'tareas sin completar:',miss.map(i=>i+': '+L.tasks[i].t))}
}
console.log(allok?'TODAS OK':'HAY FALLOS', 'N404=',N404,'lines=',ACC_LINES.length);
`);
