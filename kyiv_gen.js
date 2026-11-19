/* AION Київ — власна генерація міста без сервера карт.
   Центр (Майдан = 0,0) розставлений за реальними координатами орієнтирів; решта — процедурно.
   Підключається ПЕРЕД kyiv.js і підміняє завантаження data/kyiv_center.json. */
(function(){
const KX=70820,KZ=111200,O0=[50.4501,30.5234],ll=(a,b)=>[(b-O0[1])*KX,-(a-O0[0])*KZ];
let sd=7;const rn=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
const LOWD=(navigator.hardwareConcurrency||4)<=4;
function chaikin(p,n){while(n--){const q=[p[0]];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75])}q.push(p[p.length-1]);p=q}return p}
// Дніпро (приблизна вісь, з півночі на південь-схід)
const RIV=chaikin([[50.53,30.555],[50.51,30.548],[50.49,30.543],[50.47,30.545],[50.455,30.546],[50.44,30.557],[50.425,30.572],[50.41,30.583],[50.39,30.595],[50.375,30.61]].map(p=>ll(p[0],p[1])),2);
const RW=520;
const segD=(px,pz,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=dx*dx+dz*dz;let t=L?((px-a[0])*dx+(pz-a[1])*dz)/L:0;t=t<0?0:t>1?1:t;return Math.hypot(px-a[0]-t*dx,pz-a[1]-t*dz)};
const dPoly=(px,pz,pl)=>{let m=1e9;for(let i=0;i<pl.length-1;i++){const d=segD(px,pz,pl[i],pl[i+1]);if(d<m)m=d}return m};
function norm(pl,i){const a=pl[Math.max(0,i-1)],b=pl[Math.min(pl.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;return[-dz/L,dx/L]}
function band(pl,w){const L=[],R=[];pl.forEach((p,i)=>{const n=norm(pl,i);L.push(p[0]+n[0]*w/2,p[1]+n[1]*w/2);R.push(p[0]-n[0]*w/2,p[1]-n[1]*w/2)});const o=L.slice();for(let i=R.length-2;i>=0;i-=2)o.push(R[i],R[i+1]);return o}
const off=(pl,d)=>pl.map((p,i)=>{const n=norm(pl,i);return[p[0]+n[0]*d,p[1]+n[1]*d]});
const flat=pl=>pl.reduce((a,p)=>a.concat(p),[]);
function ell(cx,cz,rx,rz,rot){const o=[],c=Math.cos(rot),s=Math.sin(rot);for(let i=0;i<24;i++){const a=i/24*6.2832,x=Math.cos(a)*rx,z=Math.sin(a)*rz;o.push(cx+x*c-z*s,cz+x*s+z*c)}return o}
const inE=(px,pz,e,m)=>{const dx=px-e[0],dz=pz-e[1],c=Math.cos(e[4]),s=Math.sin(e[4]),u=(dx*c+dz*s)/(e[2]+m),v=(-dx*s+dz*c)/(e[3]+m);return u*u+v*v<1};
const isl=ll(50.433,30.567);
const PK=[[600,-450,300,160,.3],[850,330,380,200,.5],[2300,1700,520,340,.4],[isl[0],isl[1],1100,230,1.0]];
const LMK=[[-637,-311],[42,-511],[-722,145],[2415,1724],[0,0]]; // Софія, Михайлівський, Золоті ворота, Лавра, Майдан
const ROADS=[
[24,[[-330,450],[0,0],[280,-390]]],                                  // Хрещатик
[14,[[-722,145],[-500,-60],[-380,-300],[-250,-450],[42,-511]]],      // Володимирська
[18,[[0,0],[300,150],[751,256],[1100,300]]],                          // Грушевського
[34,[[-330,450],[-1500,650],[-3200,900]]],                           // Проспект Перемоги
[20,[[-330,450],[-200,1100],[0,2000],[400,3000]]],                   // на південь
[30,[[280,-390],[100,-1500],[-300,-3500]]]                           // на північ
];
const embW=off(RIV,RW/2+25),embE=off(RIV,-(RW/2+25));
ROADS.push([14,embW],[14,embE]);
const BR=[];[10,13,16,21,27,32].forEach(i=>{const p=RIV[i],n=norm(RIV,i),k=RW/2+70,a=[p[0]+n[0]*k,p[1]+n[1]*k],b=[p[0]-n[0]*k,p[1]-n[1]*k];
BR.push([20,1,[a[0],a[1],b[0],b[1]]]);
ROADS.push([18,[a,[a[0]+n[0]*2500,a[1]+n[1]*2500]]],[26,[b,[b[0]-n[0]*3500,b[1]-n[1]*3500]]])});
function build(){
const b=[],r=[],w=[band(RIV,RW)],p=[];
for(const e of PK)p.push(ell(e[0],e[1],e[2],e[3],e[4]));
for(const q of ROADS)r.push([q[0],0,flat(q[1])]);for(const q of BR)r.push(q);
const rect=(cx,cz,W,Dd,rot,h)=>{const c=Math.cos(rot),s=Math.sin(rot),f=[];for(const [x,z] of [[-W/2,-Dd/2],[W/2,-Dd/2],[W/2,Dd/2],[-W/2,Dd/2]])f.push(cx+x*c-z*s,cz+x*s+z*c);b.push([h,f])};
const St=84;
for(let gx=-4200;gx<5400;gx+=St)for(let gz=-3800;gz<4400;gz+=St){
const px=gx+rn()*10,pz=gz+rn()*10,rr=Math.hypot(px,pz);
const pr=rr<1800?.95:rr<3500?.72:.42;if(rn()>pr*(LOWD?.8:1))continue;
if(dPoly(px,pz,RIV)<RW/2+30)continue;
let bad=0;for(const e of PK)if(inE(px,pz,e,20)){bad=1;break}if(bad)continue;
for(const l of LMK)if(Math.hypot(px-l[0],pz-l[1])<(l[0]===0&&l[1]===0?90:130)){bad=1;break}if(bad)continue;
for(const q of ROADS)if(dPoly(px,pz,q[1])<q[0]/2+12){bad=1;break}if(bad)continue;
let ni=0,nd=1e9;for(let i=0;i<RIV.length;i++){const d=Math.hypot(px-RIV[i][0],pz-RIV[i][1]);if(d<nd){nd=d;ni=i}}
const n=norm(RIV,ni),west=((px-RIV[ni][0])*n[0]+(pz-RIV[ni][1])*n[1])>0;
if(west){const h=rr<1600?16+rn()*24+(rn()<.12?22:0):rr<3500?10+rn()*20:6+rn()*8;rect(px,pz,38+rn()*22,30+rn()*22,.45+(rn()<.2?rn()*.4:0),h)}
else if(rr>1400){if(rr<4200&&rn()<.6)rect(px,pz,15+rn()*4,60+rn()*24,-.2,30+rn()*32);else rect(px,pz,30+rn()*16,26+rn()*14,-.2,6+rn()*10)}
}
return{b,r,w,p}}
const _f=window.fetch;
window.fetch=function(u,o){if(String(u).indexOf("kyiv_center.json")>=0)return Promise.resolve({json:()=>Promise.resolve(build())});return _f.apply(this,arguments)};
window.__buildKyiv=build;
// ---- орієнтири + плита творця (додаються в сцену при першому S.add) ----
function extras(){
const G=new THREE.Group(),T=THREE,gold=new T.MeshStandardMaterial({color:0xffc94d,emissive:0x6a4a00,metalness:.6,roughness:.3});
const box=(W,H,Dd,col,x,y,z,par)=>{const m=new T.Mesh(new T.BoxGeometry(W,H,Dd),new T.MeshStandardMaterial({color:col,roughness:.8}));m.position.set(x,y,z);(par||G).add(m);return m};
const dome=(x,y,z,rad,par)=>{const d=new T.Mesh(new T.SphereGeometry(rad,12,8,0,6.2832,0,1.5708),gold);d.position.set(x,y,z);(par||G).add(d);const c=new T.Mesh(new T.CylinderGeometry(rad*.6,rad*.7,rad,10),new T.MeshStandardMaterial({color:0xf2efe6}));c.position.set(x,y-rad/2,z);(par||G).add(c)};
function church(x,z,W,Dd,H,col,rot,tw){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;G.add(g);box(W,H,Dd,col,0,H/2,0,g);dome(0,H+9,0,8,g);
for(const [a,c] of [[1,1],[1,-1],[-1,1],[-1,-1]])dome(a*W*.36,H+3,c*Dd*.34,4,g);if(tw)box(9,tw,9,0xf2efe6,W*.7,tw/2,0,g),dome(W*.7,tw+4,0,4.5,g)}
church(-637,-311,56,40,22,0xf2efe6,.3,70);      // Софійський собор
church(42,-511,34,22,24,0x8fb8e6,.2,0);          // Михайлівський
box(14,14,10,0xd9c9a0,-722,7,145);dome(-722,18,145,5);  // Золоті ворота
church(2415,1724,62,38,24,0xf2efe6,.5,0);box(12,92,12,0xf2efe6,2340,46,1690);dome(2340,96,1690,6); // Лавра + дзвіниця
const pl=new T.Mesh(new T.PlaneGeometry(150,100),new T.MeshStandardMaterial({color:0x3a3f4d,roughness:.9}));pl.rotation.x=-1.5708;pl.position.set(0,.07,0);G.add(pl);
const col=new T.Mesh(new T.CylinderGeometry(2.5,3,38,12),new T.MeshStandardMaterial({color:0xd9d4c4}));col.position.set(25,19,-20);G.add(col);dome(25,40,-20,3.5);
// плита творця
const P=new T.Group();P.position.set(-60,0,60);P.rotation.y=.4;G.add(P);
const st=0x4a4f5c;box(24,1.2,7,st,0,.6,0,P);box(20,30,3,st,0,16.2,0,P);box(16.4,21.7,.6,0xffc94d,0,20.2,1.8,P);
const tex=new T.TextureLoader().load("creator_portrait.jpg");tex.encoding=T.sRGBEncoding;
const ph=new T.Mesh(new T.PlaneGeometry(15.4,20.7),new T.MeshBasicMaterial({map:tex}));ph.position.set(0,20.2,2.15);P.add(ph);
const cv=document.createElement("canvas");cv.width=640;cv.height=160;const x=cv.getContext("2d");x.fillStyle="#12151d";x.fillRect(0,0,640,160);x.fillStyle="#ffc94d";x.font="bold 70px system-ui,sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText("Я съел деда",320,84);
const tt=new T.CanvasTexture(cv);tt.encoding=T.sRGBEncoding;const ins=new T.Mesh(new T.PlaneGeometry(16.4,4.1),new T.MeshBasicMaterial({map:tt}));ins.position.set(0,6.2,1.55);P.add(ins);
const lt=new T.PointLight(0xffd9a0,1.4,90);lt.position.set(0,14,14);P.add(lt);
return G}
const oa=THREE.Scene.prototype.add;
THREE.Scene.prototype.add=function(){if(!this.__x){this.__x=1;try{oa.call(this,extras())}catch(e){console.error(e)}}return oa.apply(this,arguments)};
})();
  
