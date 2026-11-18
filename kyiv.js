(async function(){
const $=s=>document.querySelector(s),msg=$("#msg");
window.onerror=(m,s,l)=>{msg.style.display="block";msg.textContent="ERR: "+m+" @"+l};
const LOW=(navigator.hardwareConcurrency||4)<=4||(navigator.deviceMemory||4)<=3;
const R=new THREE.WebGLRenderer({antialias:!LOW});R.setPixelRatio(LOW?1.25:Math.min(devicePixelRatio,2));R.setSize(innerWidth,innerHeight);
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;document.body.prepend(R.domElement);
const S=new THREE.Scene();S.background=new THREE.Color(0x050914);S.fog=new THREE.FogExp2(0x050914,.0006);
const C=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,1,12000);
const hemi=new THREE.HemisphereLight(0x7fb4ff,0x1a1040,1),sun=new THREE.DirectionalLight(0xfff0d8,1);S.add(hemi,sun);
const gnd=new THREE.Mesh(new THREE.PlaneGeometry(12000,12000),new THREE.MeshStandardMaterial({color:0x151922,roughness:.9}));gnd.rotation.x=-Math.PI/2;S.add(gnd);
const GT=(()=>{const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d"),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.3,"rgba(255,255,255,.35)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const D=await(await fetch("data/kyiv_center.json?v="+Date.now())).json();
function cellTex(lit){const c=document.createElement("canvas");c.width=128;c.height=256;const x=c.getContext("2d");x.fillStyle=lit?"#000":"#fff";x.fillRect(0,0,128,256);let s=5;const rn=()=>{s=(s*16807)%2147483647;return s/2147483647};
for(let r=0;r<16;r++)for(let q=0;q<8;q++){if(lit){if(rn()<.42){x.fillStyle=["#ffd9a0","#ffb347","#cfe8ff","#fff3d6"][(rn()*4)|0];x.fillRect(q*16+3,r*16+3,10,10)}}else{x.fillStyle="#5b6a86";x.fillRect(q*16+3,r*16+3,10,10)}}
const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return t}
const BMAT=new THREE.MeshStandardMaterial({vertexColors:true,map:cellTex(false),emissive:0xffffff,emissiveMap:cellTex(true),emissiveIntensity:.1,metalness:.1,roughness:.85,flatShading:true});
const PAL=[[205,192,170],[172,178,190],[176,134,112],[218,202,150]];
const P=[],U=[],Cc=[],I=[];let vc=0;
function addB(h,f,seed){const pts=[];for(let i=0;i+1<f.length;i+=2)pts.push([f[i],f[i+1]]);
if(pts.length>3&&pts[0][0]===pts[pts.length-1][0]&&pts[0][1]===pts[pts.length-1][1])pts.pop();if(pts.length<3)return;
let a=0;const n=pts.length;for(let i=0;i<n;i++){const q=pts[(i+1)%n];a+=pts[i][0]*q[1]-q[0]*pts[i][1]}a/=2;if(a>0)pts.reverse();if(LOW&&Math.abs(a)<70)return;
const k=.72+((seed*2654435761)%1000)/2000,pc=PAL[seed%4],rr=Math.min(255,pc[0]*k|0),gg=Math.min(255,pc[1]*k|0),bb=Math.min(255,pc[2]*k|0);let cum=0;
for(let i=0;i<n;i++){const A=pts[i],B=pts[(i+1)%n],len=Math.hypot(B[0]-A[0],B[1]-A[1]);if(len<.01)continue;const u0=cum/27.2,u1=(cum+len)/27.2,v1=h/51.2;cum+=len;
P.push(A[0],0,A[1],B[0],0,B[1],B[0],h,B[1],A[0],h,A[1]);U.push(u0,0,u1,0,u1,v1,u0,v1);for(let q=0;q<4;q++)Cc.push(rr,gg,bb);I.push(vc,vc+1,vc+2,vc,vc+2,vc+3);vc+=4}
let tri;try{tri=THREE.ShapeUtils.triangulateShape(pts.map(p=>new THREE.Vector2(p[0],p[1])),[])}catch(e){return}
const base=vc;for(const p of pts){P.push(p[0],h,p[1]);U.push(.98,.98);Cc.push(rr*.7|0,gg*.7|0,bb*.7|0);vc++}
for(const t of tri){const A=pts[t[0]],B=pts[t[1]],Q=pts[t[2]],cr=(B[1]-A[1])*(Q[0]-A[0])-(B[0]-A[0])*(Q[1]-A[1]);if(cr>0)I.push(base+t[0],base+t[1],base+t[2]);else I.push(base+t[0],base+t[2],base+t[1])}}
const bl=D.b.length;for(let i=0;i<bl;i++){addB(D.b[i][0],D.b[i][1],i);if(i%400===399){msg.textContent="Будуємо Київ… "+Math.round(i/bl*100)+"%";await new Promise(r=>setTimeout(r))}}
const bg=new THREE.BufferGeometry();bg.setAttribute("position",new THREE.Float32BufferAttribute(P,3));bg.setAttribute("uv",new THREE.Float32BufferAttribute(U,2));
bg.setAttribute("color",new THREE.BufferAttribute(new Uint8Array(Cc),3,true));bg.setIndex(new THREE.BufferAttribute(new Uint32Array(I),1));S.add(new THREE.Mesh(bg,BMAT));P.length=U.length=Cc.length=I.length=0;
const RB={a:[],b:[],c:[],br:[]},LM=[];
function ribbon(arr,f,w,y,lamp){for(let i=0;i<f.length/2-1;i++){let x0=f[2*i],z0=f[2*i+1],x1=f[2*i+2],z1=f[2*i+3],dx=x1-x0,dz=z1-z0;const L=Math.hypot(dx,dz);if(L<.01)continue;dx/=L;dz/=L;
if(lamp)for(let s=0;s<L;s+=45)LM.push(x0+dx*s,3.5,z0+dz*s);const e=w*.15;x0-=dx*e;z0-=dz*e;x1+=dx*e;z1+=dz*e;const nx=-dz*w/2,nz=dx*w/2;
arr.push(x0+nx,y,z0+nz,x0-nx,y,z0-nz,x1+nx,y,z1+nz,x1+nx,y,z1+nz,x0-nx,y,z0-nz,x1-nx,y,z1-nz)}}
for(const r of D.r){const w=r[0];if(r[1])ribbon(RB.br,r[2],w,2.5,false);else if(w>=10)ribbon(RB.a,r[2],w,.12,true);else if(w>=5)ribbon(RB.b,r[2],w,.1,w>=6);else ribbon(RB.c,r[2],w,.08,false)}
function flatPoly(f,y,out){const pts=[];for(let i=0;i+1<f.length;i+=2)pts.push(new THREE.Vector2(f[i],f[i+1]));if(pts.length>3&&pts[0].equals(pts[pts.length-1]))pts.pop();if(pts.length<3)return;
let tri;try{tri=THREE.ShapeUtils.triangulateShape(pts,[])}catch(e){return}for(const t of tri)for(const k of t)out.push(pts[k].x,y,pts[k].y)}
const WP=[],PP=[];for(const w of D.w)flatPoly(w,.02,WP);for(const p of D.p)flatPoly(p,.04,PP);
function mesh(arr,color,emi){if(!arr.length)return;const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(arr,3));
S.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({color,emissive:emi||0,flatShading:true,side:THREE.DoubleSide,roughness:.8})))}
mesh(RB.a,0x2c313e);mesh(RB.b,0x242835);mesh(RB.c,0x3b4050);mesh(RB.br,0x474d60);mesh(PP,0x1b4d2e,0x06180c);mesh(WP,0x0d3b66,0x082a4d);
const lampM=new THREE.PointsMaterial({map:GT,color:0xffd9a0,size:14,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
const lg=new THREE.BufferGeometry();lg.setAttribute("position",new THREE.Float32BufferAttribute(LM,3));S.add(new THREE.Points(lg,lampM));
const sp=[];let sd=3;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};for(let q=0;q<(LOW?250:500);q++){const a=rnd()*6.28,e=.15+rnd()*1.3;sp.push(Math.cos(a)*Math.cos(e)*9000,Math.sin(e)*9000,Math.sin(a)*Math.cos(e)*9000)}
const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.Float32BufferAttribute(sp,3));const starM=new THREE.PointsMaterial({color:0xffffff,size:2.2,transparent:true,sizeAttenuation:false,fog:false});S.add(new THREE.Points(sg,starM));
const cN=new THREE.Color(0x050914),cD=new THREE.Color(0x6db0ff),cS=new THREE.Color(0xff7a3d),tmp=new THREE.Color();let forceH=null,tmode="auto";
function applyEnv(){const nw=new Date(),h=forceH!=null?forceH:nw.getHours()+nw.getMinutes()/60,a=(h-6)/12*Math.PI,s=Math.sin(a),d=Math.max(0,Math.min(1,s*2.2+.25)),n=1-d;
tmp.copy(cN).lerp(cD,d).lerp(cS,Math.max(0,1-Math.abs(s)*4)*.45);S.background.copy(tmp);S.fog.color.copy(tmp);hemi.intensity=.3+.8*d;sun.intensity=.1+1.1*d;sun.position.set(Math.cos(a)*900,Math.max(150,s*1100),400);
BMAT.emissiveIntensity=.05+1.5*n;lampM.opacity=n;starM.opacity=n;R.toneMappingExposure=1.05+.3*d}
$("#tm").onclick=()=>{tmode=tmode==="auto"?"d":tmode==="d"?"n":"auto";forceH=tmode==="d"?13:tmode==="n"?23:null;$("#tm").textContent="Час: "+(tmode==="auto"?"авто":tmode==="d"?"день":"ніч");applyEnv()};
const cam={yaw:.4,pit:.55,dist:700,tgt:new THREE.Vector3(),goal:new THREE.Vector3()};const cv=R.domElement,Pm=new Map();let pd=0,pm=null;
const pinch=()=>{const a=[...Pm.values()];return Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])},mid=()=>{const a=[...Pm.values()];return[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2]};
cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);Pm.set(e.pointerId,[e.clientX,e.clientY]);if(Pm.size===2){pd=pinch();pm=mid()}});
cv.addEventListener("pointermove",e=>{if(!Pm.has(e.pointerId))return;const o=Pm.get(e.pointerId);Pm.set(e.pointerId,[e.clientX,e.clientY]);
if(Pm.size===1){cam.yaw-=(e.clientX-o[0])*.006;cam.pit=Math.max(.1,Math.min(1.5,cam.pit+(e.clientY-o[1])*.005))}
else if(Pm.size===2){const d=pinch(),m=mid();if(pd)cam.dist=Math.max(30,Math.min(4000,cam.dist*pd/d));pd=d;
if(pm){const k=cam.dist*.0016,dx=m[0]-pm[0],dy=m[1]-pm[1],sy=Math.sin(cam.yaw),cy=Math.cos(cam.yaw);cam.goal.x=Math.max(-2500,Math.min(2500,cam.goal.x-cy*dx*k-sy*dy*k));cam.goal.z=Math.max(-2500,Math.min(2500,cam.goal.z+sy*dx*k-cy*dy*k))}pm=m}});
const up=e=>{Pm.delete(e.pointerId);pd=0;pm=null};cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
cv.addEventListener("wheel",e=>{cam.dist=Math.max(30,Math.min(4000,cam.dist*(1+e.deltaY*.001)));e.preventDefault()},{passive:false});
addEventListener("resize",()=>{R.setSize(innerWidth,innerHeight);C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix()});
msg.style.display="none";applyEnv();setInterval(applyEnv,20000);
(function loop(){requestAnimationFrame(loop);cam.tgt.lerp(cam.goal,.1);const cp=Math.cos(cam.pit);
C.position.set(cam.tgt.x+Math.sin(cam.yaw)*cp*cam.dist,Math.sin(cam.pit)*cam.dist,cam.tgt.z+Math.cos(cam.yaw)*cp*cam.dist);C.lookAt(cam.tgt);R.render(S,C)})();
})();
