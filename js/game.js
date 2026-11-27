// Las Muñequitas — juego arcade de avance lateral (HTML5 Canvas, JavaScript puro)
const C=document.getElementById('g'),x=C.getContext('2d');const W=960,H=540,G=470,K={};
const MAPS=[{n:'BOSQUE',sky:['#0e140d','#37402a','#8a6a3a'],tree:'#0b0f0a',far:'#1a2418',fog:'#9a9a70',gr:'#1c1710',top:'#5f6a30',deb:'#3a2f1c',pc:['#cfcab8','#ff9a4a'],sun:['#ffb35a','#c8642e88']},
{n:'INVIERNO',sky:['#1b2634','#546b82','#b9c8d6'],tree:'#10161d',far:'#2c3a4a',fog:'#dbe6f0',gr:'#aab6c2',top:'#f2f7fb',deb:'#8d9aa8',pc:['#fff','#dfeaf5'],sun:['#fff6d8','#cfe0f088']},
{n:'INFIERNO',sky:['#120202','#4a0d06','#b8360d'],tree:'#080202',far:'#2a0a06',fog:'#ff5a1a',gr:'#1a0c0a',top:'#ff4d1a',deb:'#4a1a10',pc:['#ff7a2a','#ffd23f'],sun:['#ff6a1a','#c8200c88']}];
const WP={p:{n:'PISTOLA',cd:.3,am:30,w:14,c:'#cfcfcf'},e:{n:'ESCOPETA',cd:.8,am:14,w:28,c:'#c08040'},m:{n:'METRALLETA',cd:.09,am:90,w:24,c:'#ff6a4d'},r:{n:'RIFLE',cd:.45,am:20,w:30,c:'#9ad0ff',d:2},l:{n:'LANZALLAMAS',cd:.04,am:140,w:22,c:'#ff9a2a',d:1},g:{n:'LANZAGRANADAS',cd:.9,am:10,w:20,c:'#8aff8a',d:6},b:{n:'BALLESTA',cd:.6,am:16,w:28,c:'#c9a066',d:3},z:{n:'PISTOLA LÁSER',cd:.12,am:60,w:16,c:'#6af0ff',d:1},c:{n:'CAÑÓN',cd:1.1,am:10,w:30,c:'#ffd0a0',d:1}};
const MINI=['MUTANTE','YETI HELADO','DEMONIO MENOR'],FN={gloria:'GLORIA',niss:'NISS',devil:'EL DIABLITO'};
const pal={a:'#b8f24a',b:'#6fa81f',w:'#f4f1ea',k:'#11141c'};
function spr(rows){const c=document.createElement('canvas');c.width=rows[0].length;c.height=rows.length;const q=c.getContext('2d');rows.forEach((r,j)=>[...r].forEach((h,i)=>{if(h!='.'){q.fillStyle=pal[h];q.fillRect(i,j,1,1)}}));return c}
const hd=['..aaaaaa..','.aaaaaaaa.','.akkaakka.','.aaaaaaaa.'],tr=['..bbbbbb..','.abbbbbba.','.abbbbbba.','..bbbbbb..'],tj=['a.bbbbbb.a','a.bbbbbb.a','..bbbbbb..','..bbbbbb..'];
const S_={idle:spr([...hd,...tr,'..bb..bb..','..bb..bb..','..kk..kk..','..........']),run1:spr([...hd,...tr,'..bb..bb..','.bb....bb.','.kk....kk.','..........']),run2:spr([...hd,...tr,'...bbbb...','...bbbb...','..kkkkkk..','..........']),jump:spr([...hd,...tj,'...b..b...','...k..k...','..........','..........'])};
let st='menu',P,blocks,enemies,items,pb,eb,pa,B,pts,lives,lvl,map,lt,sc,best=0,inv,tO,tE,tI,cd,flash,banner,fr=0,shake=0,mute=false,ac=null,bi=0,ft=0,cp=1,first;
const bg=[...Array(80)].map(()=>({x:Math.random()*W,y:Math.random()*G,s:1+Math.floor(Math.random()*3)}));
function snd(f,d,type='square',v=.1,f2){if(mute||!ac)return;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,ac.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,ac.currentTime+d);g.gain.setValueAtTime(v,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+d)}
const m1=[110,131,165,131,98,123,147,123],m2=[110,110,165,110,104,104,156,104];
setInterval(()=>{if(st=='play'){snd((B?m2:m1)[bi++%8]*(map==2?1:2),.2,B?'sawtooth':'triangle',.045)}},250);
function setMap(){map=lvl<=5?0:lvl<=10?1:2}
function reset(l){lvl=l;setMap();P={x:180,y:G-48,vy:0,on:0,wp:null,am:0};blocks=[];enemies=[];items=[];pb=[];eb=[];pa=[];B=null;pts=0;lives=3;lt=0;sc=0;inv=0;tO=2;tE=3;tI=1.2;cd=0;flash=0;first=1;banner=['NIVEL '+l+' · '+MAPS[map].n,2.4]}
function start(l){if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(ac&&ac.state=='suspended')ac.resume();
 try{if(!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}
 const keep=st=='over'?pts:0;reset(l);pts=keep;st='play';snd(520,.2,'square',.1,880)}
function boom(px,py,n,c){for(let i=0;i<n;i++){const a=Math.random()*6.3,s=1+Math.random()*5;pa.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.4+Math.random()*.5,c:c||['#ffd23f','#ff4d3d','#f4f1ea'][i%3]})}}
function aim(px,py){return Math.atan2(P.y+24-py,P.x+20-px)}
function es(px,py,a,sp,k,g){eb.push({x:px,y:py,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:g||0,k:k||'n',r:0})}
function shoot(){const w=WP[P.wp],e=P.wp=='e';cd=w.cd;P.am--;flash=.06;const gx=P.x+30+w.w,gy=P.y+26;
 for(let i=0;i<(e?5:P.wp=='c'?8:1);i++){const t=P.wp,sh=e||t=='c',a=sh?(i-(t=='c'?3.5:2))*(t=='c'?.12:.1):(Math.random()-.5)*(t=='m'?.07:t=='l'?.25:0),s=sh?13:t=='r'?24:t=='b'?20:t=='z'?22:t=='l'?9:t=='g'?11:17;pb.push({x:gx,y:gy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(t=='g'?4:0),l:sh?.35:t=='l'?.3:1.2,d:w.d||1,k:t})}
 snd(P.wp=='e'?140:P.wp=='m'?500:380,.09,'sawtooth',.07,90);if(P.am<=0){P.wp=null;banner=['¡SIN MUNICIÓN!',1.2]}}
function hurt(){if(inv>0)return;lives--;inv=1.4;shake=14;boom(P.x+20,P.y+24,16,'#b8f24a');snd(160,.3,'sawtooth',.14,50);if(lives<=0){st='over';best=Math.max(best,Math.floor(pts));cp=map*5+1;snd(200,.6,'sawtooth',.14,40)}}
function spawnBoss(){const f=lvl%5==0,i=lvl/5-1,mu=[1,1.2,1.45][map],hp=f?[150,210,270][i]:Math.round((16+lvl*3)*mu);
 B={k:f?['gloria','niss','devil'][i]:'mini',x:W+280,y:G,hp,max:hp,t:0,at:2,at2:4,hf:0,st:'in',ws:0};if(B.k=='niss'||B.k=='devil')B.y=G-150;
 banner=[f?'¡JEFE FINAL!':'¡MINI JEFE!',2.6];snd(300,.5,'sawtooth',.12,600);setTimeout(()=>snd(300,.5,'sawtooth',.12,600),550)}
function segs(){const hx=B.x+Math.sin(B.t*.9)*70,hy=G-90+Math.sin(B.t*1.7)*80,r=[];for(let i=0;i<14;i++){const f=i/14;r.push([hx+i*26,i?hy*(1-f)+(G-30)*f+Math.sin(B.t*3-i*.6)*25:hy])}return r}
function bossHit(px,py){const k=B.k;
 if(k=='mini')return Math.abs(px-B.x)<42&&py>G-135&&py<G?1:0;
 if(k=='gloria')return Math.abs(px-(B.x-25))<125&&py>G-135&&py<G?1:0;
 if(k=='devil')return Math.abs(px-B.x)<55&&Math.abs(py-B.y)<75?1:0;
 const s=segs();if(Math.abs(px-s[0][0])<30&&Math.abs(py-s[0][1])<30)return 1;return s.some(a=>Math.abs(px-a[0])<22&&Math.abs(py-a[1])<22)?2:0}
function blast(px,py){boom(px,py,40,'#ffb04a');shake=10;snd(120,.4,'sawtooth',.15,40);for(let j=enemies.length-1;j>=0;j--){const e=enemies[j];if(Math.hypot(e.x+16-px,e.y-20-py)<110){e.hp-=3;if(e.hp<=0){boom(e.x+16,e.y-20,12);pts+=5;enemies.splice(j,1)}}}if(B&&B.st!='in'&&B.k!='niss'&&Math.abs(px-B.x)<120&&Math.abs(py-B.y)<150){B.hp-=3;B.hf=.1;if(B.hp<=0)killBoss()}}
function killBoss(){boom(B.x,B.y-60,100);shake=30;pts+=100*lvl;lives=Math.min(5,lives+1);eb=[];B=null;enemies=[];blocks=[];snd(500,.8,'sawtooth',.15,60);
 if(lvl==15){st='win';best=Math.max(best,Math.floor(pts));return}
 lvl++;lt=0;if(lvl==11){st='fall';ft=0;P.vy=0}else{setMap();banner=[lvl%5==1?'MAPA: '+MAPS[map].n:'NIVEL '+lvl,2.4]}}
function step(k){
 const d=k/60,dif=(lvl-1)%5+1,mu=[1,1.2,1.45][map],v=(3+dif*.45)*mu*(B?.6:1);
 lt+=d;sc+=v*k;inv=Math.max(0,inv-d);shake=Math.max(0,shake-k);cd-=d;flash-=d;if(banner){banner[1]-=d;if(banner[1]<=0)banner=null}
 const mv=(K.ArrowRight||K.d?1:0)-(K.ArrowLeft||K.a?1:0);P.x=Math.max(10,Math.min(560,P.x+mv*4*k));
 if((K[' ']||K.ArrowUp||K.w)&&P.on){P.vy=-15.5;P.on=0;snd(380,.18,'square',.1,720)}
 if((K.x||K.j||K.f)&&cd<=0&&P.wp)shoot();
 P.vy+=.8*k;P.y+=P.vy*k;P.on=0;
 const pw=28,ph=44;for(const b of blocks){const px=P.x+6,py=P.y+4;
  if(px+pw>b.x&&px<b.x+b.w&&py+ph>b.y&&py<b.y+b.h){if(P.vy>=0&&py+ph-b.y<=Math.max(16,P.vy*1.6)){P.y=b.y-ph-4;P.vy=0;P.on=1}else P.x=b.x-pw-6}}
 if(P.y>=G-48){P.y=G-48;P.vy=0;P.on=1}
 if(P.x<12){hurt();P.x=220;P.y=0;P.vy=0}
 if(!B&&lt>22)spawnBoss();
 tO-=d;if(tO<=0){tO=(2.5-dif*.2)/mu*(B?2:1)+Math.random()*.8;if(!blocks.some(b=>b.x>W-260)&&!items.some(i=>i.x>W-200)){const h=[50,75,100][Math.floor(Math.random()*3)];blocks.push({x:W+10,y:G-h,w:60+Math.floor(Math.random()*60),h})}}
 tE-=d;if(tE<=0&&!B){tE=(1.9-dif*.18)/mu+Math.random()*.6;const fl=Math.random()<.3;enemies.push({f:fl,x:W+40,y:fl?150+Math.random()*200:G,y0:fl?150+Math.random()*200:G,hp:fl?1:2+(map?1:0),t:0,s:1.5+dif*.25})}
 tI-=d;if(tI<=0){if(blocks.some(b=>b.x+b.w>W-40)){tI=.4}else{tI=4.5+Math.random()*2.5;const r=Math.random();items.push({t:first?'p':r<(lives<3?.3:.12)?'h':r<(lives<3?.5:.4)?'a':'pemrlgbzc'[Math.floor(Math.random()*9)],x:W+60});first=0}}
 for(let i=blocks.length-1;i>=0;i--){blocks[i].x-=v*k;if(blocks[i].x+blocks[i].w<-20)blocks.splice(i,1)}
 for(let i=items.length-1;i>=0;i--){const it=items[i];it.x-=v*k;if(it.x<-30){items.splice(i,1);continue}
  if(Math.abs(it.x-P.x-20)<30&&P.y>G-110){if(it.t=='h'){lives=Math.min(5,lives+1);banner=['+1 VIDA',1.2];snd(700,.2,'square',.1,1200)}else if(it.t=='a'){if(P.wp){P.am+=Math.ceil(WP[P.wp].am*.6);banner=['+MUNICIÓN',1.2]}else{P.wp='p';P.am=30;banner=['PISTOLA',1.2]}snd(900,.1,'square',.09,1200)}else{if(P.wp==it.t)P.am+=WP[it.t].am;else{P.wp=it.t;P.am=WP[it.t].am}banner=[WP[it.t].n,1.2];[600,800].forEach((f,j)=>setTimeout(()=>snd(f,.1,'square',.09),j*70))}items.splice(i,1)}}
 for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];e.t+=d;e.x-=(v+e.s)*k;if(e.f)e.y=Math.min(G-125,e.y0+Math.sin(e.t*3)*50);else for(const b of blocks)if(e.x+30>b.x&&e.x<b.x+b.w)e.x=b.x+b.w;if(e.x<-60){enemies.splice(i,1);continue}
  if(Math.abs(e.x+16-P.x-20)<26&&P.y+48>e.y-(e.f?20:56)&&P.y<e.y+(e.f?20:0)){enemies.splice(i,1);boom(e.x,e.y-20,8);hurt()}}
 if(B){B.t+=d;B.hf=Math.max(0,B.hf-d);const k0=B.k,tg={mini:800,gloria:760,niss:700,devil:760}[k0];
  if(B.st=='in'){B.x-=4*k;if(B.x<=tg){B.x=tg;B.st='idle'}}
  else{const sp=1+(dif-1)*.08+(B.hp<B.max/2?.35:0);B.at-=d*sp;B.at2-=d*sp;
   if(k0=='mini'){B.x=tg+Math.sin(B.t*1.2)*40;if(B.at<=0){B.at=1.6;es(B.x-30,G-90,aim(B.x-30,G-90),5+dif*.3)}if(B.at2<=0){B.at2=5;const a=aim(B.x-30,G-90);[-.25,0,.25].forEach(o=>es(B.x-30,G-90,a+o,5.5))}}
   if(k0=='gloria'){if(B.st=='idle'){B.x=tg;if(B.at<=0){B.at=2.2;es(B.x-125,G-100,Math.atan2(-8,-6-dif*.3),Math.hypot(6+dif*.3,8),'mud',.28)}if(B.at2<=0){B.st='wind';B.ws=.7}}
    else if(B.st=='wind'){B.ws-=d;B.x=tg+Math.sin(B.t*60)*3;if(B.ws<=0)B.st='charge'}
    else if(B.st=='charge'){B.x-=13*k;if(B.x<-250){B.st='back';B.x=W+280}}
    else if(B.st=='back'){B.x-=7*k;if(B.x<=tg){B.st='idle';B.at2=5}}}
   if(k0=='niss'){const h=segs()[0];if(B.at<=0){B.at=1.5;es(h[0]-10,h[1],aim(h[0],h[1]),6+dif*.3,'venom')}if(B.at2<=0){B.at2=4.5;const a=aim(h[0],h[1]);[-.3,0,.3].forEach(o=>es(h[0]-10,h[1],a+o,6,'venom'))}}
   if(k0=='devil'){B.x=tg+Math.sin(B.t*.8)*70;B.y=G-190+Math.sin(B.t*1.5)*70;if(B.at<=0){B.at=1.3;es(B.x-30,B.y,aim(B.x-30,B.y),8,'tri')}if(B.at2<=0){B.at2=4.5;for(let i=0;i<7;i++)es(80+Math.random()*520,-20,Math.PI/2,5+Math.random()*2,'fire')}}}
  if(B.st!='in'){if([[P.x+20,P.y+24],[P.x+20,P.y+40]].some(p=>bossHit(p[0],p[1])))hurt()}}
 for(let i=pb.length-1;i>=0;i--){const b=pb[i];if(b.k=='g')b.vy+=.35*k;b.x+=b.vx*k;b.y+=b.vy*k;b.l-=d;let gone=b.l<=0||b.x>W||b.y<0||(b.k=='g'&&b.y>=G);if(!gone&&blocks.some(o=>b.x>o.x&&b.x<o.x+o.w&&b.y>o.y))gone=true;
  if(!gone)for(let j=enemies.length-1;j>=0;j--){const e=enemies[j];if(Math.abs(b.x-e.x-16)<22&&b.y>e.y-(e.f?22:58)&&b.y<e.y+(e.f?22:0)){gone=!'lrb'.includes(b.k);boom(b.x,b.y,4,'#ffd23f');snd(200,.08,'sawtooth',.06,70);if((e.hp-=b.d)<=0){boom(e.x+16,e.y-20,12);pts+=5;if(Math.random()<.2&&!e.f)items.push({t:Math.random()<.5?'h':'a',x:e.x+16});enemies.splice(j,1)}if(!'lrb'.includes(b.k))break}}
  if(!gone&&B&&B.st!='in'){const r=bossHit(b.x,b.y);if(r){gone=true;boom(b.x,b.y,3,'#fff');if(r==1){B.hp-=b.d;B.hf=.07;snd(150,.05,'square',.05);if(B.hp<=0){killBoss();pb.length=0;break}}}}
  if(gone){if(b.k=='g')blast(b.x,b.y);pb.splice(i,1)}}
 for(let i=eb.length-1;i>=0;i--){const b=eb[i];b.vy+=b.g*k;b.x+=b.vx*k;b.y+=b.vy*k;b.r+=.3*k;if(b.y>H||b.y<-40||b.x<-40||b.x>W+40){eb.splice(i,1);continue}
  if(blocks.some(o=>b.x>o.x&&b.x<o.x+o.w&&b.y>o.y)){eb.splice(i,1);continue}
  if(Math.abs(b.x-P.x-20)<16&&Math.abs(b.y-P.y-26)<24){eb.splice(i,1);hurt()}}
 for(let i=pa.length-1;i>=0;i--){const p=pa[i];p.x+=p.vx*k;p.y+=p.vy*k;p.l-=d;if(p.l<=0)pa.splice(i,1)}
}
function tx(s,y,sz,c='#f4f1ea',a='center',px=W/2){x.font='bold '+sz+'px monospace';x.textAlign=a;x.fillStyle=c;x.fillText(s,px,y)}
function tree(px,h,sz){const M=MAPS[map];x.fillStyle=x.strokeStyle=M.tree;x.lineCap='round';
 if(map==0){x.lineWidth=7*sz;x.beginPath();x.moveTo(px,G);x.lineTo(px,G-h);x.stroke();x.lineWidth=3*sz;[[.5,-1],[.7,1],[.88,-1]].forEach(([f,s])=>{x.beginPath();x.moveTo(px,G-h*f);x.lineTo(px+s*28*sz,G-h*f-24*sz);x.stroke()})}
 else if(map==1){for(let j=0;j<4;j++){const y=G-h*(.25+j*.22),w=(52-j*11)*sz;x.fillStyle=M.tree;x.beginPath();x.moveTo(px,y-h*.3);x.lineTo(px-w,y);x.lineTo(px+w,y);x.fill();x.fillStyle='#e8f1f8';x.beginPath();x.moveTo(px,y-h*.3);x.lineTo(px-w*.45,y-h*.13);x.lineTo(px+w*.45,y-h*.13);x.fill()}x.fillStyle=M.tree;x.fillRect(px-4,G-h*.25,8,h*.25)}
 else{x.beginPath();x.moveTo(px-22*sz,G);x.lineTo(px-4,G-h);x.lineTo(px+20*sz,G);x.fill();x.shadowColor='#ff5a1a';x.shadowBlur=10;x.strokeStyle='#ff5a1a';x.lineWidth=2;x.beginPath();x.moveTo(px-4,G-h*.9);x.lineTo(px-2,G-h*.4);x.stroke();x.shadowBlur=0}}
function drawBg(){const M=MAPS[map];const g=x.createLinearGradient(0,0,0,G);M.sky.forEach((c,i)=>g.addColorStop(i/2,c));x.fillStyle=g;x.fillRect(0,0,W,H);
 const sg=x.createRadialGradient(720,230,5,720,230,230);sg.addColorStop(0,M.sun[0]);sg.addColorStop(.3,M.sun[1]);sg.addColorStop(1,'#0000');x.fillStyle=sg;x.fillRect(450,0,510,G);
 bg.forEach(s=>{s.y+=s.s*.35;s.x-=(map==1?1.2:.3)+Math.sin((fr+s.y)/40)*.4;if(s.y>G)s.y=0;if(s.x<0)s.x=W;x.globalAlpha=.3+s.s*.15;x.fillStyle=s.s>2?M.pc[1]:M.pc[0];x.fillRect(s.x,s.y,s.s,s.s)});x.globalAlpha=1;
 x.fillStyle=M.far;x.beginPath();x.moveTo(0,G);for(let i=0;i<=W;i+=20)x.lineTo(i,G-60-Math.abs(Math.sin((i+sc*.12)*.012))*80-Math.abs(Math.sin((i+sc*.12)*.05))*16);x.lineTo(W,G);x.fill();
 [[.35,170,.7],[.7,240,1]].forEach(([f,step,sz])=>{x.globalAlpha=f<.5?.6:1;for(let px=-(sc*f)%step-step;px<W+step;px+=step){const idx=Math.round((px+sc*f)/step);tree(px,(80+((idx*53%70)+70)%70)*(sz+.3),sz)}});x.globalAlpha=1;
 const fg=x.createLinearGradient(0,G-150,0,G);fg.addColorStop(0,M.fog+'00');fg.addColorStop(1,M.fog+'66');x.fillStyle=fg;x.fillRect(0,G-150,W,150);
 x.fillStyle=M.gr;x.fillRect(0,G,W,H-G);if(map==2){x.shadowColor='#ff4d1a';x.shadowBlur=16}x.fillStyle=M.top;x.fillRect(0,G,W,5);x.shadowBlur=0;
 x.fillStyle=M.deb;const o=sc%70;for(let i=-70;i<W;i+=70){x.fillRect(i-o,G+22,34,4);x.fillRect(i-o+30,G+48,18,3)}}
function drawBlock(b){const c=[['#7a5a32','#3d2c18'],['#cfe6f5','#7fa6c2'],['#4a2a24','#1a0c0a']][map],g=x.createLinearGradient(0,b.y,0,b.y+b.h);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);
 x.fillStyle='#0005';x.fillRect(b.x+6,G,b.w,6);x.fillStyle=g;x.fillRect(b.x,b.y,b.w,b.h);x.strokeStyle='#0006';x.lineWidth=2;x.strokeRect(b.x,b.y,b.w,b.h);
 if(map==0){x.beginPath();for(let y=b.y+18;y<b.y+b.h;y+=18){x.moveTo(b.x,y);x.lineTo(b.x+b.w,y)}x.stroke()}
 if(map==1){x.fillStyle='#fffc';x.fillRect(b.x,b.y,b.w,7)}if(map==2){x.fillStyle='#ff6a1a';x.shadowColor='#ff4d1a';x.shadowBlur=8;x.fillRect(b.x+6,b.y+b.h/2,b.w-12,3);x.shadowBlur=0}}
function drawEn(e){const c=[['#6b7a4a','#3a3a2a'],['#9ab0c4','#4a5a6a'],['#b02a1a','#3a0a0a']][map];x.save();x.translate(e.x,e.y);x.fillStyle='#0004';x.beginPath();x.ellipse(16,e.f?G-e.y:0,18,5,0,0,7);x.fill();
 if(e.f){const w=Math.sin(e.t*14)*14;x.fillStyle=c[1];x.beginPath();x.moveTo(16,0);x.lineTo(-8,-14-w);x.lineTo(2,6);x.moveTo(16,0);x.lineTo(40,-14-w);x.lineTo(30,6);x.fill();x.fillStyle=c[0];x.beginPath();x.ellipse(16,0,10,12,0,0,7);x.fill();x.fillStyle='#ffd23f';x.fillRect(8,-4,4,4)}
 else{const s=Math.sin(e.t*9)*6;x.fillStyle=c[1];x.fillRect(5+s,-18,9,18);x.fillRect(19-s,-18,9,18);x.fillStyle=c[0];x.fillRect(2,-42,30,26);x.fillRect(-16,-38,20,7);x.fillRect(4,-58,24,18);x.fillStyle='#ffd23f';x.fillRect(7,-52,5,5);x.fillRect(17,-52,5,5);if(map==2){x.fillStyle='#220';x.fillRect(4,-66,4,9);x.fillRect(24,-66,4,9)}}
 x.restore()}
function eye(ex,ey,r){x.fillStyle='#fff';x.beginPath();x.arc(ex,ey,r,0,7);x.fill();x.fillStyle='#200';x.beginPath();x.arc(ex-r*.3,ey,r*.5,0,7);x.fill()}
function drawBoss(){const f=B.hf>0,k=B.k;x.save();x.translate(B.x,B.y);
 if(k=='mini'){const c=f?'#fff':[['#5a6a3a','#2a3a1a'],['#c8dcec','#5a7a96'],['#b8281a','#4a0a06']][map][0],s=Math.sin(B.t*6)*8;x.fillStyle='#0005';x.beginPath();x.ellipse(0,0,50,8,0,0,7);x.fill();x.fillStyle=c;x.fillRect(-30+s,-45,24,45);x.fillRect(6-s,-45,24,45);x.fillRect(-38,-110,76,70);x.fillRect(-70,-100,36,16);x.fillRect(-30,-150,60,44);x.fillStyle='#ffd23f';x.fillRect(-22,-136,10,10);x.fillRect(4,-136,10,10);x.fillStyle='#200';x.fillRect(-18,-118,34,6);if(map==2){x.fillStyle='#fff';x.fillRect(-30,-170,8,22);x.fillRect(22,-170,8,22)}}
 if(k=='gloria'){const c=f?'#fff':'#8e7f8c',w=B.st=='wind'?-8:0,m=Math.max(0,Math.sin(B.t*3))*18+(B.st=='charge'?0:10);x.fillStyle='#0005';x.beginPath();x.ellipse(0,0,110,10,0,0,7);x.fill();x.fillStyle=c;x.beginPath();x.ellipse(0,-75,100,62,0,0,7);x.fill();x.fillStyle=f?'#fff':'#a89aa6';x.beginPath();x.ellipse(0,-45,80,30,0,0,7);x.fill();x.fillStyle=c;[-60,-25,25,60].forEach(l=>x.fillRect(l-12,-35,26,35));
  x.beginPath();x.ellipse(-90,-90,62,44,0,0,7);x.fill();x.fillStyle='#b24a5a';x.fillRect(-148,-84,70,m);x.fillStyle='#fff';for(let i=0;i<6;i++){x.fillRect(-144+i*11,-84,6,8);x.fillRect(-144+i*11,-84+m-8,6,8)}x.fillStyle=c;x.fillRect(-150,-92+m,72,18);x.beginPath();x.ellipse(-62,-128,10,14,0,0,7);x.fill();eye(-96,-126,9);x.fillStyle='#2a1a22';x.fillRect(-140,-110,6,6)}
 if(k=='devil'){const c=f?'#fff':'#c8200c',w=Math.sin(B.t*8)*20;x.fillStyle='#3a0606';x.beginPath();x.moveTo(20,-20);x.lineTo(110,-90-w);x.lineTo(60,0);x.moveTo(-20,-20);x.lineTo(-110,-90-w);x.lineTo(-60,0);x.fill();x.fillStyle=c;x.beginPath();x.ellipse(0,0,34,48,0,0,7);x.fill();x.beginPath();x.arc(0,-58,28,0,7);x.fill();x.fillStyle='#3a0606';x.beginPath();x.moveTo(-22,-76);x.lineTo(-34,-108);x.lineTo(-8,-82);x.moveTo(22,-76);x.lineTo(34,-108);x.lineTo(8,-82);x.fill();x.fillStyle='#ffd23f';x.fillRect(-16,-66,10,8);x.fillRect(6,-66,10,8);x.fillStyle='#fff';x.fillRect(-14,-46,28,4);
  x.strokeStyle='#d0d0d0';x.lineWidth=4;x.beginPath();x.moveTo(-60,50);x.lineTo(-60,-70);x.moveTo(-76,-70);x.lineTo(-76,-92);x.moveTo(-44,-70);x.lineTo(-44,-92);x.moveTo(-76,-70);x.lineTo(-44,-70);x.moveTo(-60,-70);x.lineTo(-60,-100);x.stroke();x.strokeStyle=c;x.lineWidth=9;x.beginPath();x.moveTo(-26,-10);x.lineTo(-58,-10);x.stroke();x.beginPath();x.moveTo(26,10);x.quadraticCurveTo(70,50,60,-5);x.stroke()}
 x.restore();
 if(k=='niss'){const s=segs();for(let i=13;i>=0;i--){const r=24-i*.9;x.fillStyle=f?'#fff':i%2?'#2e7d32':'#43a047';x.beginPath();x.arc(s[i][0],s[i][1],r,0,7);x.fill();x.fillStyle='#ffd23f55';x.beginPath();x.arc(s[i][0],s[i][1]+r*.4,r*.4,0,7);x.fill()}
  const h=s[0];x.fillStyle=f?'#fff':'#43a047';x.beginPath();x.ellipse(h[0]-12,h[1],34,22,0,0,7);x.fill();eye(h[0]-14,h[1]-10,7);x.strokeStyle='#e01010';x.lineWidth=3;const l=Math.sin(B.t*14)*5;x.beginPath();x.moveTo(h[0]-44,h[1]+4);x.lineTo(h[0]-62,h[1]+4);x.lineTo(h[0]-70,h[1]+4+l);x.moveTo(h[0]-62,h[1]+4);x.lineTo(h[0]-70,h[1]+4-l);x.stroke();x.fillStyle='#fff';x.fillRect(h[0]-36,h[1]+10,4,10)}}
function bossName(){const n=B.k=='mini'?MINI[map]:FN[B.k];let px=B.x,py=B.y-180;if(B.k=='gloria'){px=B.x-60;py=B.y-165}if(B.k=='niss'){const h=segs()[0];px=h[0]-12;py=h[1]-55}if(B.k=='devil')py=B.y-125;px=Math.max(80,Math.min(W-80,px));x.save();x.font='bold 28px monospace';x.textAlign='center';x.lineJoin='round';x.lineWidth=6;x.strokeStyle='#000';x.strokeText(n,px,py);x.fillStyle='#fff';x.fillText(n,px,py);x.restore()}
function drawProj(b){x.save();x.translate(b.x,b.y);if(b.k=='mud'){x.fillStyle='#5a4326';x.shadowColor='#2a1a0a'}else if(b.k=='venom'){x.fillStyle='#8aff3a';x.shadowColor='#8aff3a'}else if(b.k=='fire'){x.fillStyle='#ff7a2a';x.shadowColor='#ff4d1a'}else if(b.k=='tri'){x.rotate(b.r);x.strokeStyle='#ddd';x.shadowColor='#ff4d1a';x.lineWidth=3;x.beginPath();x.moveTo(-14,0);x.lineTo(14,0);x.moveTo(8,-7);x.lineTo(14,-7);x.lineTo(14,7);x.lineTo(8,7);x.stroke()}else{x.fillStyle='#ffb04a';x.shadowColor='#ff4d3d'}
 x.shadowBlur=12;if(b.k!='tri'){x.beginPath();x.arc(0,0,b.k=='mud'?10:7,0,7);x.fill()}x.restore()}
function drawPlayer(y,tilt){const im=!P.on?S_.jump:Math.floor(fr/6)%2?S_.run1:S_.run2;x.fillStyle='#0006';x.beginPath();x.ellipse(P.x+20,G+2,18,5,0,0,7);x.fill();x.save();x.translate(P.x+20,y+24);x.rotate(tilt||0);x.drawImage(im,-20,-24,40,48);x.restore()}
function draw(){
 x.save();if(shake>0)x.translate((Math.random()-.5)*8,(Math.random()-.5)*8);drawBg();
 if(P){blocks.forEach(drawBlock);items.forEach(it=>{const bob=Math.sin(fr/12)*3,col={p:'#ddd',e:'#c08040',m:'#ff6a4d',h:'#ff4d6a',r:'#9ad0ff',l:'#ff9a2a',g:'#8aff8a',b:'#c9a066',z:'#6af0ff',c:'#ffd0a0',a:'#ffd23f'}[it.t];x.shadowColor=col;x.shadowBlur=16;x.fillStyle=col;x.fillRect(it.x-14,G-30+bob,28,22);x.shadowBlur=0;x.fillStyle='#000';x.font='bold 16px monospace';x.textAlign='center';x.fillText(it.t=='h'?'+':it.t.toUpperCase(),it.x,G-13+bob)});
  enemies.forEach(drawEn);if(B){drawBoss();bossName()}
  if(st!='fall'){if(!(inv>0&&Math.floor(inv*10)%2)){drawPlayer(P.y);if(P.wp){const w=WP[P.wp];x.fillStyle=w.c;x.fillRect(P.x+28,P.y+24,w.w,P.wp=='m'?8:5);x.fillStyle='#333';x.fillRect(P.x+28,P.y+28,8,10);if(flash>0){x.fillStyle='#ffe38a';x.shadowColor='#ffd23f';x.shadowBlur=18;x.fillRect(P.x+28+w.w,P.y+19,16,14);x.shadowBlur=0}}}}
  x.shadowColor='#ffd23f';x.shadowBlur=8;x.fillStyle='#fff3b0';pb.forEach(b=>{if(b.k=='l'){x.fillStyle=Math.random()<.5?'#ff7a2a':'#ffd23f';x.fillRect(b.x-6,b.y-6,12,12)}else if(b.k=='g'){x.fillStyle='#8aff8a';x.fillRect(b.x-5,b.y-5,10,10)}else{x.fillStyle=b.k=='z'?'#6af0ff':b.k=='b'?'#c9a066':'#fff3b0';x.fillRect(b.x-4,b.y-1.5,'rb'.includes(b.k)?18:10,3)}});x.shadowBlur=0;eb.forEach(drawProj);
  pa.forEach(p=>{x.globalAlpha=Math.min(1,p.l*2);x.fillStyle=p.c;x.fillRect(p.x,p.y,4,4)});x.globalAlpha=1}
 if(st=='fall'){x.fillStyle='#000';x.beginPath();x.ellipse(P.x+20,G+4,Math.min(90,ft*60),Math.min(14,ft*10),0,0,7);x.fill();if(P.y<H+60)drawPlayer(P.y,ft*3);x.fillStyle='rgba(200,20,0,'+Math.min(.85,ft/4.5)+')';x.fillRect(-20,-20,W+40,H+40);tx('¡CAYENDO AL INFIERNO!',H/2,44,'#fff')}
 x.restore();
 const vg=x.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#000a');x.fillStyle=vg;x.fillRect(0,0,W,H);
 if(st=='play'||st=='pause'||st=='over'){x.fillStyle='#0009';x.fillRect(0,0,W,50);tx('PUNTOS '+Math.floor(pts),30,20,'#b8f24a','left',14);tx('NIVEL '+lvl+' · '+MAPS[map].n,30,20,'#f4f1ea','center',W/2-80);
  tx(P.wp?WP[P.wp].n+' '+P.am:'SIN ARMA: busca una en el suelo',30,18,P.wp?'#4dd6ff':'#ffd23f','left',W/2+120);for(let i=0;i<lives;i++)tx('♥',32,26,'#ff4d3d','right',W-12-i*26);
  if(!B){x.fillStyle='#fff3';x.fillRect(0,46,W,4);x.fillStyle='#b8f24a';x.fillRect(0,46,W*Math.min(1,lt/22),4)}
  else{x.fillStyle='#0009';x.fillRect(W/2-190,58,380,18);x.fillStyle='#ff4d3d';x.fillRect(W/2-188,60,376*Math.max(0,B.hp)/B.max,14);tx(B.k=='mini'?MINI[map]:FN[B.k],72,14,'#fff','right',W/2-196)}
  if(banner){x.globalAlpha=Math.min(1,banner[1]*2);tx(banner[0],H/2-60,48,'#ffd23f');x.globalAlpha=1}if(mute)tx('SIN SONIDO',H-12,14,'#8a8f9c','left',10)}
 if(st=='menu'){x.fillStyle='#000a';x.fillRect(0,0,W,H);x.save();x.shadowColor='#b8f24a';x.shadowBlur=30;tx('LAS MUÑEQUITAS',160+Math.sin(fr/20)*6,78,'#b8f24a');x.restore();tx('Camina hacia la derecha, sobrevive y vence a los jefes',215,20);
  x.drawImage(S_.idle,W/2-40,245,80,96);tx('Mover ← →  ·  Saltar Espacio  ·  Disparar X  ·  Pausa P',385,18,'#a9aebb');tx('Recoge las armas del suelo. Sube a los obstáculos.',415,18,'#a9aebb');
  tx('Toca o pulsa ENTER para jugar (pantalla completa)',470,24,'#ffd23f');tx('Mejor: '+best+' · ESRB E · PEGI 3',515,14,'#8a8f9c')}
 if(st=='pause'){x.fillStyle='#000c';x.fillRect(0,0,W,H);tx('PAUSA',260,64,'#b8f24a');tx('Pulsa P para continuar',310,22)}
 if(st=='over'){x.fillStyle='#000d';x.fillRect(0,0,W,H);tx('GAME OVER',210,68,'#ff4d3d');tx('Puntos: '+Math.floor(pts)+'   Nivel: '+lvl,280,28);tx('Mejor: '+best,320,22,'#a9aebb');tx('Toca o pulsa ENTER para reintentar desde el nivel '+cp,400,22,'#ffd23f')}
 if(st=='win'){x.fillStyle='#000d';x.fillRect(0,0,W,H);tx('¡GANASTE!',210,72,'#b8f24a');tx('Las Muñequitas escaparon del infierno',280,26);tx('Puntos: '+Math.floor(pts),325,24,'#ffd23f');tx('Pulsa ENTER para jugar de nuevo',400,22)}
}
let last=performance.now();
function loop(n){const k=Math.min(3,(n-last)/16.67);last=n;fr++;
 if(st=='play')step(k);
 if(st=='fall'){const d=k/60;ft+=d;shake=6;if(ft>1.2){P.vy+=.5*k;P.y+=P.vy*k}if(ft%.2<d)boom(P.x+20,G,3,'#ff7a2a');pa.forEach(p=>{p.x+=p.vx*k;p.y+=p.vy*k-1;p.l-=d});pa=pa.filter(p=>p.l>0);sc+=2*k;
  if(ft>4.5){setMap();P={x:180,y:G-48,vy:0,on:0,wp:P.wp,am:P.am};blocks=[];enemies=[];items=[];eb=[];pb=[];pa=[];lt=0;tO=2;tE=3;tI=3;inv=1.5;banner=['MAPA: INFIERNO',2.6];st='play'}}
 draw();requestAnimationFrame(loop)}
reset(1);requestAnimationFrame(loop);
addEventListener('keydown',e=>{const k=e.key.length==1?e.key.toLowerCase():e.key;
 if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();K[k]=true;
 if(e.key=='Enter'){if(st=='menu')start(1);else if(st=='over')start(cp);else if(st=='win')start(1)}
 else if((k=='p'||e.key=='Escape')&&(st=='play'||st=='pause'))st=st=='play'?'pause':'play';else if(k=='m')mute=!mute});
addEventListener('keyup',e=>{K[e.key.length==1?e.key.toLowerCase():e.key]=false});
C.addEventListener('pointerdown',()=>{if(st=='menu')start(1);else if(st=='over')start(cp);else if(st=='win')start(1);C.focus()});
[['bl','ArrowLeft'],['br','ArrowRight'],['bj','ArrowUp'],['bf','x']].forEach(([id,key])=>{const b=document.getElementById(id);
 b.addEventListener('pointerdown',e=>{e.preventDefault();K[key]=true;if(st=='menu')start(1);else if(st=='over')start(cp)});
 ['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>K[key]=false))});
addEventListener('blur',()=>{if(st=='play')st='pause'});
