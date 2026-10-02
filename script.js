'use strict';
const $=s=>document.querySelector(s),rnd=n=>Math.floor(Math.random()*n);
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const ring=(n,x,y,r)=>Array.from({length:n},(_,i)=>[x+r*Math.cos(2*Math.PI*i/n-Math.PI/2),y+r*Math.sin(2*Math.PI*i/n-Math.PI/2)]);
const R6=ring(6,60,45,32),R5=ring(5,60,45,34);
const COL=['#0ea5e9','#22c55e','#f97316','#a855f7','#ec4899','#eab308','#14b8a6','#6366f1'];

/* ===== 1. Topologies ===== */
const TOPO=[
{n:'Bus',h:[],s:[4,5,6,7,8,9],
 p:[[22,20],[48,20],[74,20],[100,20],[22,56],[48,56],[74,56],[100,56],[8,56],[114,56]],
 e:[[0,4],[1,5],[2,6],[3,7],[8,4],[4,5],[5,6],[6,7],[7,9]],
 f:'Toutes les machines partagent un seul câble principal : un signal envoyé est reçu par toutes les machines.',
 a:'Peu de câble, très simple et peu coûteux à installer.',
 l:'Une coupure du câble paralyse le réseau ; les collisions augmentent avec le nombre de machines.',
 x:'Anciens réseaux Ethernet sur câble coaxial (10BASE2), aujourd’hui abandonnés.'},
{n:'Étoile',h:[0],
 p:[[60,45],[60,12],[98,30],[90,74],[30,74],[22,30]],
 e:[[0,1],[0,2],[0,3],[0,4],[0,5]],
 f:'Chaque machine est reliée par son propre câble à un équipement central (switch).',
 a:'Facile à administrer et à dépanner ; une panne de câble n’isole qu’une machine.',
 l:'Le nœud central est un point unique de défaillance ; il faut plus de câbles.',
 x:'Réseau local d’un bureau ou d’une salle informatique avec un switch.'},
{n:'Anneau',h:[],
 p:R6,e:R6.map((_,i)=>[i,(i+1)%6]),
 f:'Les machines forment une boucle : les données passent de nœud en nœud, souvent grâce à un jeton.',
 a:'Accès équitable au réseau et performances prévisibles.',
 l:'Une rupture peut bloquer l’anneau (sauf double anneau) ; ajouter un nœud interrompt le réseau.',
 x:'Token Ring (historique), anneaux fibre FDDI ou SDH des opérateurs.'},
{n:'Maillée',h:[],
 p:R5,e:[[0,1],[0,2],[0,3],[0,4],[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]],
 f:'Les nœuds sont reliés entre eux par plusieurs liaisons (maillage complet ou partiel).',
 a:'Très tolérante aux pannes : plusieurs chemins existent entre deux nœuds.',
 l:'Coûteuse et complexe : un maillage complet demande n(n−1)/2 liaisons.',
 x:'Internet (routeurs interconnectés), réseaux Wi‑Fi mesh.'},
{n:'Arbre',h:[0],
 p:[[60,12],[30,42],[90,42],[14,76],[46,76],[74,76],[106,76]],
 e:[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]],
 f:'Une hiérarchie d’étoiles : des switches d’étage sont reliés à un switch de niveau supérieur.',
 a:'Évolutive et bien organisée par étages ou par services.',
 l:'Si le nœud racine ou un lien montant tombe, toute une branche est isolée.',
 x:'Réseau d’un bâtiment : switch cœur, switches d’étage, postes de travail.'},
{n:'Hybride',h:[0],
 p:[[30,45],[10,18],[10,72],[48,18],[48,72],[90,23],[112,45],[90,67],[68,45]],
 e:[[0,1],[0,2],[0,3],[0,4],[5,6],[6,7],[7,8],[8,5],[0,8]],
 f:'Combine plusieurs topologies, par exemple une étoile reliée à un anneau ou à un maillage.',
 a:'Flexible : on adapte la topologie aux besoins de chaque site.',
 l:'Conception, câblage et maintenance plus complexes et plus coûteux.',
 x:'Réseau d’entreprise : une étoile par site, sites reliés entre eux en maillage.'}
];
const svg=t=>`<svg viewBox="0 0 120 90" role="img" aria-label="Schéma de la topologie ${t.n}">`+
 t.e.map(([a,b])=>`<line class="ln" x1="${t.p[a][0].toFixed(1)}" y1="${t.p[a][1].toFixed(1)}" x2="${t.p[b][0].toFixed(1)}" y2="${t.p[b][1].toFixed(1)}"/>`).join('')+
 t.p.map(([x,y],i)=>t.s&&t.s.includes(i)
  ?`<circle class="n s" cx="${x}" cy="${y}" r="2.5"/>`
  :`<circle class="n${t.h.includes(i)?' h':''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7"/>`).join('')+'</svg>';
$('#topo').innerHTML=TOPO.map((t,i)=>`<article class="c" style="--c:${COL[i]}">${svg(t)}<h3>${t.n}</h3><p><b class="k f">Fonctionnement</b>${t.f}</p><p><b class="k a">Avantages</b>${t.a}</p><p><b class="k l">Limites</b>${t.l}</p><p><b class="k x">Exemple</b>${t.x}</p></article>`).join('');

/* ===== 2. Périphériques ===== */
const CAT={Achemine:'#c2410c',Commute:'#15803d',Transmet:'#0369a1',Filtre:'#7e22ce'};
const DEV=[
['Routeur','R','Achemine','Couche 3','Relie des réseaux différents et choisit le meilleur chemin grâce aux adresses IP et à sa table de routage.'],
['Commutateur (switch)','SW','Commute','Couche 2','Apprend les adresses MAC et envoie chaque trame uniquement vers le port du destinataire.'],
['Concentrateur (hub)','HUB','Transmet','Couche 1','Répète chaque signal reçu sur tous les autres ports : simple, mais peu efficace et peu sûr.'],
['Point d’accès Wi‑Fi','AP','Commute','Couche 2','Relie les appareils sans fil au réseau filaire (pont entre le Wi‑Fi et Ethernet).'],
['Modem','MOD','Transmet','Couche 1','Convertit le signal de l’opérateur (DSL, câble, fibre) en signal utilisable par votre réseau, et inversement.'],
['Pare-feu','FW','Filtre','Couches 3 à 7','Autorise ou bloque le trafic selon des règles de sécurité (adresses, ports, applications).'],
['Répéteur','REP','Transmet','Couche 1','Régénère et amplifie le signal pour allonger la portée d’un câble ou du Wi‑Fi.'],
['Carte réseau (NIC)','NIC','Transmet','Couches 1 et 2','Relie un ordinateur au réseau ; elle possède une adresse MAC unique.']
];
$('#dev').innerHTML=DEV.map(([n,ab,cat,cl,d])=>`<article class="c" style="--c:${CAT[cat]}"><div class="top"><div class="ic" aria-hidden="true">${ab}</div><h3>${n}</h3></div><p><span class="tag">${cat}</span><b>${cl}</b></p><p>${d}</p></article>`).join('');

/* ===== 3. Types de réseau ===== */
const NET=[
['PAN','Réseau personnel','Environ 1 à 10 mètres','Casque Bluetooth ou montre connectée reliés à un téléphone',8],
['LAN','Réseau local','Une salle, une maison ou un bâtiment','Salle informatique reliée par un switch',26],
['WLAN','Réseau local sans fil','Comme un LAN, mais par ondes radio','Wi‑Fi de la maison ou de l’établissement',30],
['CAN','Réseau de campus','Plusieurs bâtiments proches (quelques km)','Campus d’une université ou d’un centre de formation',50],
['MAN','Réseau métropolitain','Une ville ou une agglomération','Réseau fibre d’une municipalité reliant ses sites',72],
['WAN','Réseau étendu','Pays, continents, monde entier','Internet, liaison entre les sièges d’une entreprise',100]
];
$('#net').innerHTML=NET.map(([a,n,e,x,w],i)=>`<article class="c" style="--c:${COL[i]}"><h3>${a} — ${n}</h3><div class="rng" aria-hidden="true"><i style="--w:${w}%"></i></div><p><b class="k f">Étendue</b>${e}</p><p><b class="k x">Exemple</b>${x}</p></article>`).join('');

/* ===== 4. Glossaire ===== */
const GL=[
['Adresse IP','Numéro qui identifie une machine sur un réseau IP (ex. 192.168.1.10).'],
['Adresse MAC','Identifiant matériel de 48 bits d’une carte réseau (ex. 00:1A:2B:3C:4D:5E).'],
['Bande passante','Capacité maximale d’une liaison, exprimée en bits par seconde.'],
['Débit','Quantité de données réellement transférée par seconde.'],
['DHCP','Service qui attribue automatiquement une adresse IP aux machines.'],
['DNS','Service qui traduit un nom (exemple.com) en adresse IP.'],
['Latence','Temps de trajet d’un paquet, en millisecondes.'],
['Masque de sous-réseau','Indique quelle partie de l’adresse IP désigne le réseau et laquelle désigne la machine.'],
['NAT','Traduit des adresses privées en une adresse publique pour accéder à Internet.'],
['Paquet','Unité de données de la couche réseau (en-tête IP + données).'],
['Passerelle','Routeur par lequel une machine sort de son réseau local.'],
['Port','Numéro qui désigne un service sur une machine (ex. 443 pour HTTPS).'],
['Protocole','Ensemble de règles qui permet à deux machines de communiquer.'],
['TCP/IP','Famille de protocoles d’Internet : IP achemine les paquets, TCP fiabilise l’échange.'],
['Trame','Unité de données de la couche liaison (en-tête et fin Ethernet + paquet).'],
['VLAN','Réseau local virtuel : sépare logiquement des machines reliées au même switch.']
];
$('#gl').innerHTML=GL.map(([t,d])=>`<div class="c gl" style="--c:#14b8a6"><b>${t}</b><p>${d}</p></div>`).join('');
$('#gf').oninput=e=>{const v=e.target.value.toLowerCase();document.querySelectorAll('.gl').forEach(c=>{c.hidden=!c.textContent.toLowerCase().includes(v)})};

/* ===== 5. Quiz : [question, bonne réponse, [3 mauvaises], explication] ===== */
const QZ={
topo:['Topologies',[
 ['Quelle topologie relie toutes les machines à un équipement central ?','Étoile',['Bus','Anneau','Maillée'],'En étoile, chaque machine a son propre câble vers un switch (ou hub) central.'],
 ['Quelle topologie utilise un seul câble principal partagé par toutes les machines ?','Bus',['Étoile','Anneau','Arbre'],'Dans un bus, un seul câble commun transporte les signaux de toutes les machines.'],
 ['Quelle est la principale faiblesse d’une topologie en étoile ?','Le nœud central est un point unique de défaillance',['Elle exige un câble unique très long','Les données circulent toujours dans un seul sens','Elle ne permet pas d’ajouter de machines'],'Si le switch central tombe en panne, tout le réseau est coupé ; une panne de câble n’isole qu’une machine.'],
 ['Comment circulent les données dans une topologie en anneau ?','De nœud en nœud, dans un sens, jusqu’à la destination',['Vers tous les nœuds à la fois','Uniquement via un serveur central','Par des chemins choisis au hasard'],'Chaque nœud reçoit la trame et la transmet au voisin suivant jusqu’à son destinataire.'],
 ['Quelle topologie offre le plus de redondance ?','Maillée',['Bus','Étoile','Anneau'],'Plusieurs chemins existent entre les nœuds : si une liaison tombe, le trafic passe ailleurs.'],
 ['Combien de liaisons faut-il pour un maillage complet de 5 nœuds ?','10 liaisons',['5 liaisons','15 liaisons','20 liaisons'],'n(n−1)/2 = 5×4/2 = 10 liaisons.'],
 ['Une topologie en arbre est…','Une hiérarchie d’étoiles reliées entre elles',['Un anneau doublé','Un bus sans terminaison','Un maillage complet'],'Des switches d’étage sont reliés à un switch de niveau supérieur, comme les branches d’un arbre.'],
 ['Une topologie hybride est…','Une combinaison de plusieurs topologies',['Une topologie sans câble','Un autre nom du bus','Une topologie réservée au Wi‑Fi'],'On associe par exemple des étoiles et un maillage selon les besoins de chaque site.']
]],
dev:['Périphériques',[
 ['Quel appareil relie des réseaux différents et choisit le meilleur chemin grâce aux adresses IP ?','Routeur',['Concentrateur (hub)','Répéteur','Carte réseau'],'Le routeur travaille à la couche 3 et consulte sa table de routage.'],
 ['Quel appareil utilise les adresses MAC pour envoyer une trame uniquement vers le bon port ?','Commutateur (switch)',['Concentrateur (hub)','Répéteur','Modem'],'Le switch apprend les adresses MAC et commute les trames vers le seul port concerné.'],
 ['Que fait un concentrateur (hub) d’un signal reçu ?','Il le répète sur tous les autres ports',['Il l’envoie au seul destinataire','Il le filtre selon des règles de sécurité','Il le convertit en signal analogique'],'Le hub ne connaît ni MAC ni IP : tout le monde reçoit tout, d’où collisions et manque de confidentialité.'],
 ['Quel est le rôle principal d’un modem ?','Convertir le signal de l’opérateur en signal utilisable par votre réseau, et inversement',['Attribuer des adresses MAC','Filtrer les connexions entrantes','Relier des switches entre eux'],'Le modem module et démodule le signal de la ligne (DSL, câble, fibre).'],
 ['Quel appareil filtre le trafic selon des règles de sécurité ?','Pare-feu',['Concentrateur (hub)','Répéteur','Point d’accès Wi‑Fi'],'Le pare-feu autorise ou bloque les flux selon des règles (adresses, ports, applications).'],
 ['À quoi sert un répéteur ?','Régénérer le signal pour allonger la portée',['Choisir la route la plus courte','Attribuer des adresses IP','Traduire les noms de domaine'],'Il amplifie et régénère le signal, sans analyser les données.'],
 ['Que permet un point d’accès Wi‑Fi ?','Connecter des appareils sans fil à un réseau filaire',['Convertir le signal du fournisseur d’accès','Router entre deux réseaux IP','Remplacer le pare-feu'],'Il fait le pont entre les ondes radio du Wi‑Fi et le réseau Ethernet.'],
 ['Quel composant, installé dans la machine, la relie au réseau ?','Carte réseau (NIC)',['Routeur','Concentrateur (hub)','Pare-feu'],'La carte réseau fournit l’interface physique et possède une adresse MAC.']
]],
net:['Types de réseau',[
 ['Quel réseau relie des appareils personnels sur quelques mètres ?','PAN',['LAN','MAN','WAN'],'Le PAN (Personal Area Network) couvre l’espace d’une personne : Bluetooth, USB, etc.'],
 ['Que signifie LAN ?','Réseau local (Local Area Network)',['Réseau étendu','Réseau métropolitain','Réseau personnel'],'Un LAN relie des machines proches : une salle, une maison ou un bâtiment.'],
 ['Quel réseau couvre une ville ou une agglomération ?','MAN',['PAN','LAN','CAN'],'Le MAN (Metropolitan Area Network) s’étend à l’échelle d’une ville.'],
 ['Internet est l’exemple le plus connu de…','WAN',['PAN','LAN','CAN'],'Un WAN relie des réseaux très éloignés, jusqu’à l’échelle mondiale.'],
 ['Quel type désigne un réseau local sans fil ?','WLAN',['WAN','MAN','CAN'],'Le WLAN est un LAN dont les liaisons passent par les ondes radio (Wi‑Fi).'],
 ['Quel réseau relie plusieurs bâtiments d’un même campus ?','CAN',['PAN','WLAN','WAN'],'Le CAN (Campus Area Network) relie les bâtiments d’une université ou d’un site.'],
 ['Quelle est la portée typique d’un PAN ?','Quelques mètres',['Quelques kilomètres','Un pays entier','Plusieurs continents'],'Le Bluetooth, par exemple, porte environ 1 à 10 mètres.'],
 ['Quelle est l’étendue typique d’un LAN ?','Une maison, un bureau ou un bâtiment',['Quelques centimètres','Une ville entière','Plusieurs pays'],'Le LAN reste limité à un site proche, avec de bons débits et un seul propriétaire.']
]]
};
const INTRO='<p>Choisissez un quiz ci-dessus pour commencer.</p>';
let Q=null;
function qstart(k){
 Q={k,l:shuf(QZ[k][1]).map(([q,a,w,e])=>({q,a,e,o:shuf([a,...w])})),i:0,s:0,lock:0};
 document.querySelectorAll('.qt').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
 qshow();
}
function qshow(){
 const x=Q.l[Q.i],n=Q.l.length;Q.lock=0;
 $('#qbox').innerHTML=`<div class="hud"><span>Question ${Q.i+1}/${n}</span><span>Score : ${Q.s}</span></div><div class="prg"><i style="width:${Q.i/n*100}%"></i></div><h3>${x.q}</h3><div class="opts">${x.o.map((o,k)=>`<button type="button" class="opt" data-k="${k}">${o}</button>`).join('')}</div><div id="fb" class="fb" hidden></div><button type="button" class="b" id="qn" hidden>${Q.i==n-1?'Voir le résultat':'Question suivante'}</button>`;
}
function pick(k){
 Q.lock=1;
 const x=Q.l[Q.i],g=x.o.indexOf(x.a),ok=k===g;
 if(ok)Q.s++;
 document.querySelectorAll('.opt').forEach((b,i)=>{b.disabled=true;if(i===g)b.classList.add('ok');else if(i===k)b.classList.add('ko')});
 const f=$('#fb');f.hidden=false;f.className='fb '+(ok?'good':'bad');
 f.innerHTML=`<b>${ok?'✔ Bonne réponse !':'✘ Mauvaise réponse.'}</b>${ok?'':` La bonne réponse est : <b>${x.a}</b>.`}<p>${x.e}</p>`;
 document.querySelector('.prg i').style.width=((Q.i+1)/Q.l.length*100)+'%';
 const b=$('#qn');b.hidden=false;b.focus();
 sfx(ok);
}
function qnext(){Q.i++;Q.i<Q.l.length?qshow():qend()}
function qend(){
 const n=Q.l.length,p=Math.round(Q.s/n*100);
 const m=p==100?'Parfait ! Vous maîtrisez cette partie.':p>=75?'Très bien, il reste quelques détails à revoir.':p>=50?'Pas mal, relisez la section puis réessayez.':'À revoir : relisez attentivement la section avant de recommencer.';
 $('#qbox').innerHTML=`<div class="res"><div class="pct">${p}%</div><h3>${Q.s}/${n} — ${QZ[Q.k][0]}</h3><p>${m}</p><button type="button" class="b" id="qr">Recommencer</button> <button type="button" class="b alt" id="qc">Changer de quiz</button></div>`;
 sfx(p>=50);
}
document.addEventListener('click',e=>{
 const t=e.target.closest('.qt');if(t)return qstart(t.dataset.k);
 const o=e.target.closest('.opt');if(o&&Q&&!Q.lock)return pick(+o.dataset.k);
 if(e.target.closest('#qn'))return qnext();
 if(e.target.closest('#qr'))return qstart(Q.k);
 if(e.target.closest('#qc')){Q=null;$('#qbox').innerHTML=INTRO;document.querySelectorAll('.qt').forEach(b=>b.classList.remove('on'))}
});

/* ===== 6. Audio (Web Audio API, aucun fichier externe) ===== */
let AC,MG,mOn=false,mT,ci=0;
const CH=[[220,261.63,329.63,392],[174.61,220,261.63,349.23],[261.63,329.63,392,523.25],[196,246.94,293.66,392]];
function ctx(){
 if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=$('#vol').value/100;MG.connect(AC.destination)}
 if(AC.state==='suspended')AC.resume();
 return AC;
}
function tone(f,t,d,ty,g){
 const c=ctx(),o=c.createOscillator(),e=c.createGain();
 o.type=ty;o.frequency.value=f;
 e.gain.setValueAtTime(.0001,t);e.gain.linearRampToValueAtTime(g,t+.03);e.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.connect(e);e.connect(MG);o.start(t);o.stop(t+d+.05);
}
function bar(){const t=ctx().currentTime+.05,n=CH[ci++%4];n.forEach((f,i)=>tone(f,t+i*.5,1.6,'sine',.06));tone(n[0]/2,t,2,'triangle',.08)}
function sfx(ok){const t=ctx().currentTime+.02;(ok?[660,880]:[300,220]).forEach((f,i)=>tone(f,t+i*.14,.35,ok?'sine':'triangle',.22))}
$('#mus').onclick=()=>{
 mOn=!mOn;const b=$('#mus');
 b.setAttribute('aria-pressed',mOn);
 b.textContent=mOn?'🔊 Musique : activée':'🔇 Musique : coupée';
 clearInterval(mT);
 if(mOn){bar();mT=setInterval(bar,2000)}
};
$('#vol').oninput=e=>{if(MG)MG.gain.value=e.target.value/100};
