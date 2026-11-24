// Bitácora Cay Sarah · interfaz. Portada del prototipo; los datos pasan por store.js (local + Supabase).
import { supabase } from "./supabase.js";
import { newId } from "./store.js";

let USER = {}, EQUIPO = { miembros: [], codigos: [] };
const ROLES = { dueno: "Dueño", capitan: "Capitán", tripulacion: "Tripulación" };
const HOOKS = { salir() {}, cambiar() {} };
const put = (t, o) => db.put(t, o);
const patch = (t, id, p) => db.patch(t, id, p);
const remove = (t, id) => db.remove(t, id);
const updBarco = (p) => db.updBarco(p);

/* ================= utilidades ================= */
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>iso(new Date());
const nowHM=()=>{const d=new Date();return pad(d.getHours())+":"+pad(d.getMinutes())};
const MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const MESL=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const fdate=s=>{if(!s)return"—";const[y,m,d]=s.split("-");return(+d)+" "+MES[+m-1]+" "+y};
const fdateS=s=>{if(!s)return"—";const[,m,d]=s.split("-");return(+d)+" "+MES[+m-1]};
const money=n=>(n<0?"−":"")+"$"+Math.abs(Number(n||0)).toLocaleString("es-VE",{maximumFractionDigits:0});
const money2=n=>"$"+Number(n||0).toLocaleString("es-VE",{minimumFractionDigits:2,maximumFractionDigits:2});
const nf=(n,d=0)=>Number(n||0).toLocaleString("es-VE",{maximumFractionDigits:d});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const addM=(ym,n)=>{let[y,m]=ym.split("-").map(Number);m+=n;while(m<1){m+=12;y--}while(m>12){m-=12;y++}return y+"-"+pad(m)};
const monday=d=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x};
const daysTo=s=>{const n=new Date();n.setHours(0,0,0,0);return Math.round((new Date(s+"T00:00:00")-n)/864e5)};
const numOrNull=v=>v===""||v==null?null:+v;
const sum=a=>a.reduce((t,g)=>t+(+g.monto||0),0);
function toast(t){const e=$("#toast");e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,2600)}

/* ================= íconos ================= */
const I=(p,sw=1.8)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICON={
  hoy:I('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  viajes:I('<path d="M12 3v13"/><path d="M5 12a7 7 0 0 0 14 0"/><path d="M9 6h6"/><circle cx="12" cy="4" r="1"/><path d="M3 12h4M17 12h4"/>'),
  mant:I('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'),
  fin:I('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M16 15h2"/>'),
  log:I('<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M9 8h6"/>'),
  zarpe:I('<path d="M3 17c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"/><path d="M6 14l1-6h10l1 6"/><path d="M12 3v5"/>'),
  fuel:I('<path d="M4 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15"/><path d="M3 20h12"/><path d="M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3"/><path d="M7 7h4"/>'),
  gasto:I('<path d="M12 2v20"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
  agua:I('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
  nov:I('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'),
  horas:I('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2"/><path d="M9 2h6"/>'),
  serv:I('<path d="M20 6L9 17l-5-5"/>'),
  barco:I('<path d="M12 3v12"/><path d="M12 4l6 9h-6"/><path d="M3 16h18l-2.5 4h-13z"/>'),
  tema:I('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4v.3M12 16.5h.01"/>'),
  nav:I('<path d="M3 17c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"/><path d="M12 3l5 10H7z"/>'),
  doc:I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
  foto:I('<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>'),
  pieza:I('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
  campana:I('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>'),
};
const TIPO_IC={"Navegación":ICON.nav,"Combustible":ICON.fuel,"Mantenimiento":ICON.mant,"Limpieza":ICON.agua,"Novedad":ICON.nov};

/* ================= estado ================= */
let S={viajes:[],entradas:[],gastos:[],fijos:[],maquinas:[],lecturas:[],venc:[],items:[],rev:{},trabajos:[],facturas:[],temas:[],equipos:[],planes:[],barco:{},ready:false};
let db=null,ROL="dueno",STATUS={online:true,pending:0};
let fEq="";
let view="hoy",curM=today().slice(0,7),curW=iso(monday(new Date())),fTipo="",curY=today().slice(0,4);
const TIPOS=["Navegación","Combustible","Mantenimiento","Limpieza","Novedad"];
const MQ=["babor","estribor","planta"];
const STEP={Mensual:1,Trimestral:3,Semestral:6,Anual:12};
const PAGOS=["Efectivo USD","Zelle","Transferencia","Tarjeta","Bolívares","Otro"];
const SUBS={Operativo:["Combustible","Víveres y bebidas","Hielo y agua","Marina por noche","Tripulación extra","Transporte","Limpieza y amenidades","Otros"],Mantenimiento:["Aceite y filtros","Limpieza de casco","Repuestos","Mano de obra","Electrónica","Otros"],Fijo:["Marina","Tripulación","Seguro","Conectividad","Permisos y trámites","Otros"]};
const CATS=[...new Set(Object.values(SUBS).flat())];
const AREAS=["Mano de obra","Mecánica","Electrónica","Pintura y fibra","Tapicería","Plomería","Accesorios y estética","Tender","Marina","Logística"];
const TEMAT=["Pregunta","Problema","Mejora","Pendiente"],PRIO={alta:"Alta",media:"Media",baja:"Baja"};
const FIN=()=>ROL!=="tripulacion";
const TIPOV=["Charter","Uso del dueño","Préstamo","Traslado","Prueba o mantenimiento"];
const DOCS_ZARPE=["Zarpe","Lista de tripulantes","Lista de pasajeros","Despacho de capitanía","Permiso de navegación","Contrato o acuerdo","Otro"];
/* mantenimiento por tiempo */
const UNI={dias:["día","días"],semanas:["semana","semanas"],meses:["mes","meses"],anios:["año","años"]};
const SISTEMAS=["Seguridad","Climatización","Agua","Casco y propulsión","Eléctrico","Sanitarios","Tender","Cubierta","Otro"];
const EQUIPOS_BASE=["Desalinizadora","Aire acondicionado","Bomba de agua dulce","Bomba de achique","Sanitarios","Calentador de agua","Baterías","Cargador e inversor","Molinete","Tender","Fuera de borda","Casco","Hélices y ejes","Cocina y nevera","Electrónica","Otro"];
/* Plan recomendado: intervalos de referencia habituales en barcos de este tipo; cada barco los ajusta según el fabricante y el uso. */
const PLAN_SUG=[
  ["Extintores: inspección (manómetro y precinto)","Seguridad",1,"meses",7],
  ["Extintores: recarga y servicio","Seguridad",12,"meses",30],
  ["Balsa salvavidas: servicio en estación","Seguridad",12,"meses",45],
  ["EPIRB: autoprueba","Seguridad",1,"meses",7],
  ["Chalecos y bengalas: revisión y fechas","Seguridad",6,"meses",15],
  ["Aires acondicionados: limpieza de filtros de aire","Climatización",1,"meses",7],
  ["Aires acondicionados: filtro de agua salada","Climatización",1,"meses",7],
  ["Aires acondicionados: servicio técnico","Climatización",12,"meses",30],
  ["Desalinizadora: prefiltros","Agua",1,"meses",7],
  ["Desalinizadora: limpieza de membranas","Agua",12,"meses",30],
  ["Tanques de agua dulce: limpieza","Agua",12,"meses",30],
  ["Limpieza de casco (buzo)","Casco y propulsión",1,"meses",7],
  ["Ánodos de casco y ejes","Casco y propulsión",6,"meses",15],
  ["Varada y antifouling","Casco y propulsión",12,"meses",45],
  ["Baterías: prueba de capacidad","Eléctrico",12,"meses",30],
  ["Inodoros: bombas y válvulas","Sanitarios",6,"meses",15],
  ["Molinete: limpieza y engrase","Cubierta",6,"meses",15],
  ["Tender: servicio del fuera de borda","Tender",6,"meses",15]];
const ZONAS=["Casco y cubierta","Interior","Motores con agua dulce","Tender","Lona y cojines"];
const DEF_MAQ=[
  {clave:"babor",nombre:"Motor babor",orden:1,tareas:[{t:"Aceite y filtro",cada:250},{t:"Filtros Racor",cada:250},{t:"Impeller agua salada",cada:500},{t:"Ánodos intercambiador",cada:500}]},
  {clave:"estribor",nombre:"Motor estribor",orden:2,tareas:[{t:"Aceite y filtro",cada:250},{t:"Filtros Racor",cada:250},{t:"Impeller agua salada",cada:500},{t:"Ánodos intercambiador",cada:500}]},
  {clave:"planta",nombre:"Planta eléctrica",orden:3,tareas:[{t:"Aceite y filtro",cada:200},{t:"Filtro de combustible",cada:400},{t:"Impeller",cada:500}]}];



/* ================= cálculos ================= */
function X(){return S}
const gMes=ym=>X().gastos.filter(g=>(g.fecha||"").slice(0,7)===ym);
const iMes=ym=>X().viajes.filter(v=>(v.zarpe||"").slice(0,7)===ym).reduce((t,v)=>t+(+v.ingreso||0),0);
const dueIn=(f,ym)=>{const m=+ym.split("-")[1];const st=STEP[f.frecuencia]||1;return st===1||((m-(+f.mesPago||1))%st+12)%st===0};
function fijosMes(ym){return X().fijos.filter(f=>f.activo!==false&&dueIn(f,ym)).map(f=>({f,pago:gMes(ym).find(g=>g.fijoId===f.id)}))}
function tstate(m,t){if(t.ultimo==null||t.ultimo===""||!m.fecha)return{rem:null,cls:""};const rem=(+t.ultimo)+(+t.cada)-(+m.horas||0);return{rem,cls:rem<=0?"bad":rem<=Math.max(25,t.cada*.15)?"warn":"",pct:Math.max(0,Math.min(100,((+m.horas)-(+t.ultimo))/(+t.cada)*100))}}
const maqs=()=>[...X().maquinas].sort((a,b)=>(+a.orden||9)-(+b.orden||9));
const maq=k=>X().maquinas.find(m=>m.clave===k)||{};
const tripOpen=()=>X().viajes.filter(v=>v.estado!=="Cerrado").sort((a,b)=>(b.zarpe||"").localeCompare(a.zarpe||""));
const tripName=id=>{const v=X().viajes.find(x=>x.id===id);return v?v.destino:""};
const ruta=v=>v.origen?v.origen+" → "+v.destino:v.destino;
function tripStats(v){const hz=v.hz||{},hl=v.hl||{};
  const dh=id=>{const a=hz[id];const b=v.estado==="Cerrado"?hl[id]:maq(id).horas;return a==null||b==null||isNaN(a)||isNaN(b)?null:Math.max(0,b-a)};
  const H={};MQ.forEach(id=>H[id]=dh(id));
  const G=X().gastos.filter(g=>g.viajeId===v.id),E=X().entradas.filter(e=>e.viajeId===v.id);
  const litros=G.reduce((a,g)=>a+(+g.litros||0),0)+E.filter(e=>!X().gastos.some(g=>g.entradaId===e.id&&+g.litros)).reduce((a,e)=>a+(+e.litros||0),0);
  const motor=(H.babor||0)+(H.estribor||0),gasto=sum(G),ingreso=+v.ingreso||0;
  const dias=v.zarpe?Math.max(1,Math.round((new Date((v.llegada||today())+"T00:00:00")-new Date(v.zarpe+"T00:00:00"))/864e5)+1):0;
  return{H,motor,litros,gasto,ingreso,res:ingreso-gasto,lh:motor?litros/motor:null,G,E,dias}}
const tripOpts=()=>[{v:"",l:"Sin viaje"},...[...X().viajes].sort((a,b)=>(b.zarpe||"").localeCompare(a.zarpe||"")).slice(0,25).map(v=>({v:v.id,l:v.destino+" · "+fdateS(v.zarpe)+(v.estado!=="Cerrado"?" (en curso)":"")}))];
const revDoc=w=>X().rev[w]||{items:{}};
function revProg(w){const st=revDoc(w).items||{};const act=X().items.filter(i=>i.activo!==false);const done=act.filter(i=>st[i.id]&&st[i.id].estado).length;return{done,total:act.length,mal:act.filter(i=>st[i.id]&&st[i.id].estado==="mal")}}
const curWeekNow=()=>iso(monday(new Date()));
function drying(){const L=X().entradas.filter(e=>e.tipo==="Limpieza"&&e.fecha===today()&&e.secado&&e.hFin).sort((a,b)=>(b.hFin||"").localeCompare(a.hFin||""));if(!L.length)return null;const e=L[0];
  const t=s=>{const[h,m]=s.split(":").map(Number);const d=new Date();d.setHours(h,m,0,0);return d};const a=t(e.hFin),b=t(e.secado),n=new Date();if(n>=b)return{done:true,e};return{done:false,e,p:Math.max(0,Math.min(100,(n-a)/(b-a)*100)),left:Math.round((b-n)/6e4)}}
function lastWash(){return X().entradas.filter(e=>e.tipo==="Limpieza").sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||""))[0]}
/* mantenimiento por tiempo: próxima fecha y estado */
function addInt(d,n,u){const x=new Date(d+"T00:00:00");n=+n||0;if(u==="dias")x.setDate(x.getDate()+n);else if(u==="semanas")x.setDate(x.getDate()+7*n);else{const day=x.getDate();x.setDate(1);x.setMonth(x.getMonth()+(u==="anios"?12*n:n));x.setDate(Math.min(day,new Date(x.getFullYear(),x.getMonth()+1,0).getDate()))}return iso(x)}
const cadaTxt=p=>{const n=+p.cada||1,u=UNI[p.unidad]||UNI.meses;return "Cada "+(n===1?u[0]:n+" "+u[1])};
function pstate(p){if(!p.ultimo)return{next:null,d:null,cls:"",txt:"Sin registro: anota la última vez"};const next=addInt(p.ultimo,p.cada,p.unidad),d=daysTo(next),av=+p.aviso||15;
  return{next,d,cls:d<0?"bad":d<=av?"warn":"",txt:d<0?"Vencido hace "+(-d)+(d===-1?" día":" días"):d===0?"Toca hoy":"Faltan "+d+(d===1?" día":" días")}}
const planes=()=>[...X().planes].filter(p=>p.activo!==false).sort((a,b)=>{const x=pstate(a),y=pstate(b);return (x.d??1e6)-(y.d??1e6)||(a.nombre||"").localeCompare(b.nombre||"")});
function alerts(){const A=[];
  maqs().forEach(m=>{if(!m.fecha)A.push({o:2,c:"",t:m.nombre+": sin lectura de horas",d:"Registra el horómetro para calcular servicios",e:"Máquinas",go:"mant"});
    (m.tareas||[]).forEach(t=>{const s=tstate(m,t);if(s.cls)A.push({o:s.rem<=0?0:1,c:s.cls,t:m.nombre+": "+t.t,d:s.rem<=0?"Vencido por "+nf(-s.rem)+" h":"Faltan "+nf(s.rem)+" h",e:"Servicio",go:"mant"})})});
  const sinF=[];planes().forEach(p=>{const s=pstate(p);if(s.cls)A.push({o:s.d<0?0:1,c:s.cls,t:p.nombre,d:s.txt+" · "+fdate(s.next),e:"Mantenimiento",go:"mant",k:"p:"+p.id+":"+s.next});else if(!p.ultimo)sinF.push(p)});
  if(sinF.length)A.push({o:3,c:"",t:sinF.length===1?sinF[0].nombre+": sin fecha":sinF.length+" mantenimientos sin fecha",d:"Anota la última vez que se hizo para calcular el próximo aviso",e:"Mantenimiento",go:"mant"});
  X().venc.forEach(v=>{if(!v.vence)return;const d=daysTo(v.vence),av=+v.aviso||60;if(d<=av)A.push({o:d<0?0:1,c:d<0?"bad":"warn",t:v.nombre,d:d<0?"Vencido hace "+(-d)+" días":"Vence en "+d+" días · "+fdate(v.vence),e:"Papeles",go:"barco"})});
  if(FIN())X().facturas.filter(f=>+f.saldo>0).forEach(f=>A.push({o:1,c:"warn",t:"Saldo por pagar: "+f.proveedor,d:money2(f.saldo)+" · "+f.nombre,e:"Factura",go:"barco"}));
  X().temas.filter(q=>q.estado!=="resuelto"&&q.prioridad==="alta").forEach(q=>A.push({o:1,c:"warn",t:q.tipo+" prioritario",d:q.texto,e:"Tema",go:"barco"}));
  const ym=today().slice(0,7),dd=new Date().getDate();
  fijosMes(ym).filter(x=>!x.pago).forEach(({f})=>{const late=f.dia&&+f.dia<dd;A.push({o:late?1:2,c:late?"warn":"",t:"Por pagar: "+f.concepto,d:(f.monto?money(f.monto):"Monto por definir")+(f.dia?" · día "+f.dia:""),e:"Finanzas",go:"fin"})});
  const p=revProg(curWeekNow());p.mal.forEach(i=>A.push({o:1,c:"warn",t:"Revisión: "+i.texto,d:(revDoc(curWeekNow()).items[i.id]||{}).nota||"Marcado con atención",e:"Revisión",go:"mant"}));
  if(p.total&&p.done<p.total)A.push({o:3,c:"",t:"Revisión semanal: "+p.done+" de "+p.total,d:"Completa los puntos pendientes",e:"Revisión",go:"mant"});
  X().entradas.filter(e=>e.tipo==="Novedad"&&!e.resuelta).forEach(e=>A.push({o:1,c:"warn",t:e.titulo,d:"Novedad abierta desde el "+fdate(e.fecha),e:"Novedad",go:"log"}));
  return A.sort((a,b)=>a.o-b.o)}

/* ================= navegación ================= */
const VIEWS=[["hoy","Hoy",ICON.hoy],["viajes","Viajes",ICON.viajes],["mant","Mantenimiento",ICON.mant],["fin","Finanzas",ICON.fin],["barco","Barco",ICON.barco],["log","Bitácora",ICON.log]];
function navHTML(){return VIEWS.filter(v=>v[0]!=="fin"||ROL!=="tripulacion").map(([k,l,ic])=>`<button class="tab" data-view="${k}" ${view===k?'aria-current="page"':""}>${ic}<span>${k==="mant"?'<span class="lg">Mantenimiento</span><span class="sh">Mant.</span>':l}</span></button>`).join("")}
function go(v){if(!VIEWS.some(x=>x[0]===v)&&v!=="ajustes")v="hoy";view=v;try{localStorage.setItem("cs2_view",v)}catch(e){}render();window.scrollTo({top:0})}

/* ================= render ================= */
function render(){
  $("#tabbar").innerHTML=navHTML();
  $("#rail").innerHTML=navHTML()+`<button class="btn pri newbtn" data-act="sheet" ${db?"":"disabled"}>${I('<path d="M12 5v14M5 12h14"/>',2.2)}Registrar</button>`;
  const banner=(!STATUS.online?`<div class="offline">Sin señal. Todo lo que registres se guarda en el teléfono y se envía al volver la conexión${STATUS.pending?" ("+STATUS.pending+" pendientes)":""}.</div>`:"")+(STATUS.error?`<div class="offline">${esc(STATUS.error)}</div>`:"")+(S.ready&&!S.maquinas.length&&!S.viajes.length&&ROL!=="tripulacion"?`<div class="demo"><span><b>Bitácora nueva.</b> Empieza creando los motores y registrando las horas actuales.</span><button class="btn sm" data-act="start">Configurar el barco</button></div>`:"");
  const V={hoy:vHoy,viajes:vViajes,mant:vMant,fin:vFin,barco:vBarco,log:vLog,ajustes:vAjustes}[view]||vHoy;
  $("#main").innerHTML=`<div class="view">${banner}${S.ready?V():`<p class="empty">Cargando la bitácora…</p>`}</div>`;
  montarFondoHero();
  $("#fab").disabled=!db;
}

/* ---------- fondo del hero: video del catamarán ----------
   Un solo <video> que se reubica en cada render. Moverlo dentro de la misma tarea no lo pausa,
   así que no se reinicia cada vez que cambia un dato. Con movimiento reducido o ahorro de datos
   solo se muestra la foto. */
let heroVid=null;
function montarFondoHero(){const h=$("#main .hero");if(!h)return;
  if(!heroVid){const v=document.createElement("video");v.className="hero-bg";v.poster="/hero/catamaran-hero.jpg";
    v.muted=true;v.loop=true;v.playsInline=true;v.preload="metadata";v.setAttribute("muted","");v.setAttribute("playsinline","");v.setAttribute("aria-hidden","true");v.tabIndex=-1;
    const calma=matchMedia("(prefers-reduced-motion: reduce)").matches||(navigator.connection&&navigator.connection.saveData);
    if(!calma){v.autoplay=true;v.src="/hero/catamaran-hero.mp4"}heroVid=v}
  h.classList.add("media");h.prepend(heroVid);if(heroVid.src&&heroVid.paused)heroVid.play().catch(()=>{})}

/* ---------- HOY ---------- */
function vHoy(){const ot=tripOpen()[0],b=X().barco||{};const d=new Date();
  let hero;
  if(ot){const t=tripStats(ot);hero=`<section class="hero"><div class="row"><div class="state"><span class="eyebrow">Navegando · día ${t.dias}</span><h2>${esc(ruta(ot))}</h2>
      <span class="meta">${esc(ot.tipo||"Viaje")}${ot.cliente?" · "+esc(ot.cliente):""}${ot.personas?" · "+esc(ot.personas)+" a bordo":""} · zarpe ${fdateS(ot.zarpe)}${ot.horaZarpe?" "+esc(ot.horaZarpe):""}</span></div>
      <span class="pill sea">En curso</span></div>
    <div class="stats num"><div><span>Motor</span><b>${nf(t.motor)} h</b></div><div><span>Combustible</span><b>${nf(t.litros)} L</b></div><div><span>Gastos</span><b>${money(t.gasto)}</b></div><div><span>Ingreso</span><b>${t.ingreso?money(t.ingreso):"—"}</b></div></div>
    <div class="acts">${db?`<button class="btn sand" data-tclose="${esc(ot.id)}">Registrar llegada</button><button class="btn" data-act="fuel" data-vid="${esc(ot.id)}">Combustible</button><button class="btn" data-act="gasto" data-vid="${esc(ot.id)}">Gasto</button><button class="btn" data-act="entry" data-vid="${esc(ot.id)}">Nota</button>`:""}</div></section>`}
  else{const lv=[...X().viajes].filter(v=>v.estado==="Cerrado").sort((a,b)=>(b.llegada||"").localeCompare(a.llegada||""))[0];const dr=drying();
    hero=`<section class="hero"><div class="row"><div class="state"><span class="eyebrow">En puerto · ${esc(b.puerto||"Puerto La Cruz")}</span><h2>Listo para zarpar</h2>
      <span class="meta">${DIAS[d.getDay()]} ${fdate(today())}${lv?" · último viaje: "+esc(lv.destino)+", "+fdateS(lv.llegada):""}</span></div>
      <span class="pill ok">Amarrado</span></div>
    ${dr&&!dr.done?`<div class="drying"><span>Secando: ${esc(dr.e.zona||"lavado")} · listo a las ${esc(dr.e.secado)}</span><i style="--p:${dr.p}%"></i><b class="num">${dr.left} min</b></div>`:""}
    <div class="acts">${db?`<button class="btn sand" data-act="zarpe">${ICON.zarpe}Nuevo zarpe</button><button class="btn" data-act="hours">Registrar horas</button>`:""}</div></section>`}
  const A=alerts();const ym=today().slice(0,7);const ing=iMes(ym),gas=sum(gMes(ym));
  const q=[["fuel",ICON.fuel,"Combustible","Litros y costo"],["gasto",ICON.gasto,"Gasto","Recibo o pago"],["wash",ICON.agua,"Lavado","Con hora de secado"],["nov",ICON.nov,"Novedad","Algo que revisar"]];
  return `<div class="vh"><div><span class="eyebrow">Capitán ${esc(b.capitan||"—")}</span><h1>${esc(b.nombre||"Hoy a bordo")}</h1></div></div>
  ${hero}
  ${db?`<div class="quick">${q.map(([k,ic,l,s])=>`<button class="qa" data-act="${k}">${ic}<span>${l}<small>${s}</small></span></button>`).join("")}</div>`:""}
  <div class="grid2">
    <section class="card"><div class="ch"><div><h2>Atención</h2><p class="sub">Lo más urgente primero</p></div><span class="pill ${A.filter(a=>a.c).length?"warn":"ok"}">${A.filter(a=>a.c).length||"Todo al día"}${A.filter(a=>a.c).length?" por atender":""}</span></div>
      <div>${A.length?A.slice(0,7).map(a=>`<button class="al ${a.c}" data-go="${a.go}"><i class="sev"></i><span>${esc(a.t)}<small>${esc(a.d)}</small></span><em>${esc(a.e)}</em></button>`).join(""):`<p class="empty">Nada pendiente. Buen viento.</p>`}</div></section>
    <div style="display:grid;gap:16px;align-content:start">
      <section class="card"><div class="ch"><h2>${MESL[+ym.slice(5)-1][0].toUpperCase()+MESL[+ym.slice(5)-1].slice(1)}</h2><button class="link" data-go="fin">Ver finanzas</button></div>
        <div class="money3 num"><div><span>Ingresos</span><b>${money(ing)}</b></div><div><span>Gastos</span><b>${money(gas)}</b></div><div><span>Resultado</span><b class="${ing-gas>=0?"pos":"neg"}">${money(ing-gas)}</b></div></div></section>
      <section class="card"><div class="ch"><h2>Máquinas</h2><button class="link" data-go="mant">Servicios</button></div>
        ${maqs().map(m=>{const nx=(m.tareas||[]).map(t=>({t,s:tstate(m,t)})).filter(x=>x.s.rem!=null).sort((a,b)=>a.s.rem-b.s.rem)[0];
          return `<div class="vc"><div>${esc(m.nombre)}<small>${nx?esc(nx.t.t)+": "+(nx.s.rem<=0?"vencido":"faltan "+nf(nx.s.rem)+" h"):"Sin servicios calculados"}</small></div><b class="num">${m.fecha?nf(m.horas):"—"}<span>horas</span></b></div>`}).join("")||`<p class="empty">Sin máquinas.</p>`}</section>
    </div>
  </div>`}

/* ---------- VIAJES ---------- */
function vViajes(){
  const yrs=[...new Set([today().slice(0,4),...X().viajes.map(v=>(v.zarpe||"").slice(0,4)).filter(Boolean)])].sort().reverse();
  const V=X().viajes.filter(v=>(v.zarpe||"").slice(0,4)===curY).sort((a,b)=>(b.zarpe||"").localeCompare(a.zarpe||""));
  const T=V.map(v=>({v,t:tripStats(v)}));const tm=T.reduce((a,x)=>a+x.t.motor,0),tl=T.reduce((a,x)=>a+x.t.litros,0),tg=T.reduce((a,x)=>a+x.t.gasto,0),ti=T.reduce((a,x)=>a+x.t.ingreso,0),mn=V.reduce((a,v)=>a+(+v.millas||0),0);
  return `<div class="vh"><div><span class="eyebrow">Zarpes y llegadas</span><h1>Viajes</h1><p>Cada salida con sus horas, combustible, gastos e ingreso.</p></div>
    <div class="tacts"><select id="vYear" class="btn sm" aria-label="Año">${yrs.map(y=>`<option ${y===curY?"selected":""}>${y}</option>`).join("")}</select>${db?`<button class="btn pri sm" data-act="zarpe">Nuevo zarpe</button>`:""}</div></div>
  <div class="kpis num"><div class="kpi"><span>Viajes</span><b>${V.length}</b><small>${nf(mn)} millas</small></div><div class="kpi"><span>Horas de motor</span><b>${nf(tm)} h</b><small>Babor + estribor</small></div>
    <div class="kpi"><span>Combustible</span><b>${nf(tl)} L</b><small>${tm?nf(tl/tm,1)+" L por hora de motor":"Sin consumo calculado"}</small></div><div class="kpi"><span>Resultado</span><b class="${ti-tg>=0?"pos":"neg"}">${money(ti-tg)}</b><small>${money(ti)} ingresos · ${money(tg)} gastos</small></div></div>
  <div class="trips">${T.length?T.map(({v,t})=>{const open=v.estado!=="Cerrado";const hz=v.hz||{},hl=v.hl||{};
    const hrow=id=>{const n={babor:"Babor",estribor:"Estribor",planta:"Planta"}[id];return hz[id]!=null?`${n} ${nf(hz[id])} → ${open?"…":nf(hl[id])} h`:""};
    const D=v.documentos||[];
    return `<article class="card trip ${open?"open":""}"><div class="th"><div><h3>${esc(ruta(v))} ${open?'<span class="pill sea">En curso</span>':""}<span class="pill">${esc(v.tipo||"Viaje")}</span></h3>
      <div class="when">${fdate(v.zarpe)}${v.horaZarpe?" "+esc(v.horaZarpe):""}${v.llegada?" → "+fdate(v.llegada):""} · ${t.dias} ${t.dias===1?"día":"días"}${v.numeroZarpe?" · zarpe N.º "+esc(v.numeroZarpe):""}${v.personas?" · "+esc(v.personas)+" personas":""}${v.cliente?" · "+esc(v.cliente):""}</div>
      <div class="docs">${D.map((d,i)=>`<span class="doc"><button class="link" data-file="${esc(d.archivo)}">${ICON.doc}${esc(d.nombre)}</button>${db&&ROL!=="tripulacion"?`<button class="link danger x" data-tdocdel="${esc(v.id)}|${i}" aria-label="Quitar ${esc(d.nombre)}">×</button>`:""}</span>`).join("")}${db?`<button class="link" data-tdoc="${esc(v.id)}">+ Documento</button>`:""}${!D.length&&!db?`<span class="sub">Sin documentos</span>`:""}</div></div>
      ${db&&open?`<button class="btn sand sm" data-tclose="${esc(v.id)}">Registrar llegada</button>`:""}</div>
      <div class="tstats num"><div><span>Motor${open?" (hoy)":""}</span><b>${nf(t.motor)} h</b></div><div><span>Millas</span><b>${v.millas?nf(v.millas):"—"}</b></div><div><span>Combustible</span><b>${nf(t.litros)} L</b></div><div><span>Gastos</span><b>${money(t.gasto)}</b></div><div><span>Resultado</span><b class="${t.res>=0?"pos":"neg"}">${t.ingreso||t.gasto?money(t.res):"—"}</b></div></div>
      <details><summary>Detalle: ${t.G.length} gastos · ${t.E.length} notas · horómetros</summary>
        <p class="sub" style="margin:8px 0">${[hrow("babor"),hrow("estribor"),hrow("planta")].filter(Boolean).map(esc).join(" · ")||"Sin horas registradas"}${t.lh?" · "+nf(t.lh,1)+" L/h":""}${v.notas?"<br>"+esc(v.notas):""}</p>
        ${t.G.length?`<div class="scroll"><table class="t"><thead><tr><th>Fecha</th><th>Gasto</th><th class="n">Monto</th></tr></thead><tbody>${t.G.map(g=>`<tr><td>${fdateS(g.fecha)}</td><td>${esc(g.concepto)}<small>${esc([g.categoria,+g.litros?nf(g.litros)+" L":""].filter(Boolean).join(" · "))}</small></td><td class="n">${money2(g.monto)}</td></tr>`).join("")}</tbody></table></div>`:""}
      </details>
      ${db?`<div class="tacts"><button class="btn sm" data-act="fuel" data-vid="${esc(v.id)}">Combustible</button><button class="btn sm" data-act="gasto" data-vid="${esc(v.id)}">Gasto</button><button class="link" data-tedit="${esc(v.id)}">Editar</button><button class="link danger" data-del="viajes/${esc(v.id)}">Eliminar</button></div>`:""}</article>`}).join(""):`<div class="card"><p class="empty">No hay viajes en ${curY}. Toca «Nuevo zarpe» al salir: se guardan las horas de salida y todo lo que registres queda unido al viaje.</p></div>`}</div>`}

/* ---------- MANTENIMIENTO ---------- */
function vMant(){const w=curW,dd=new Date(w+"T00:00:00"),e=new Date(dd);e.setDate(e.getDate()+6);
  const st=revDoc(w).items||{};const act=[...X().items].filter(i=>i.activo!==false).sort((a,b)=>(+a.orden||0)-(+b.orden||0));const p=revProg(w);
  const W=X().entradas.filter(x=>x.tipo==="Limpieza").sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||"")).slice(0,5);
  const NV=X().entradas.filter(x=>x.tipo==="Novedad"&&!x.resuelta);
  const P=planes();const C=X().entradas.filter(x=>x.pieza||(x.tipo==="Mantenimiento"&&x.foto)).sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||"")||(b.hora||"").localeCompare(a.hora||""));
  const eqs=[...new Set(C.map(x=>x.equipo).filter(Boolean))].sort();if(fEq&&!eqs.includes(fEq))fEq="";const CF=C.filter(x=>!fEq||x.equipo===fEq);
  return `<div class="vh"><div><span class="eyebrow">Motores, revisión y lavado</span><h1>Mantenimiento</h1><p>Servicios calculados por horas de horómetro.</p></div>
    ${db?`<div class="tacts"><button class="btn sm" data-act="addmaq">Añadir máquina</button><button class="btn sm" data-act="hours">Registrar horas</button><button class="btn pri sm" data-act="pieza">Cambio de pieza</button></div>`:""}</div>
  <div class="mqs">${maqs().length?maqs().map(m=>`<article class="card mq"><div class="t"><h3>${esc(m.nombre)}</h3><small class="sub">${esc([m.modelo,m.serial?"S/N "+m.serial:""].filter(Boolean).join(" · "))}</small></div>
    <div class="hrs num">${m.fecha?nf(m.horas):"—"}<span>h</span></div>${m.fecha?`<span class="lec">Lectura del ${fdate(m.fecha)}</span>`:`<span class="lec warn">Sin lectura. Toca «Registrar horas».</span>`}
    ${(m.tareas||[]).map((t,i)=>{const s=tstate(m,t);return `<div class="sv ${s.cls}"><div class="r"><b>${esc(t.t)}</b>${s.rem==null?'<span class="na">Sin dato · cada '+nf(t.cada)+' h</span>':`<span class="rem num">${s.rem<=0?"Vencido "+nf(-s.rem)+" h":"Faltan "+nf(s.rem)+" h"}</span>`}</div>${s.rem==null?"":`<div class="trk"><i style="width:${s.pct}%"></i></div>`}
      </div>`}).join("")}
    ${db?`<div class="ft">${(m.tareas||[]).length?`<button class="btn sm" data-serv="${esc(m.id)}">Registrar servicio</button>`:""}<button class="link" data-medit="${esc(m.id)}">Editar</button></div>`:""}</article>`).join(""):`<div class="card"><p class="empty">Sin máquinas.</p>${db?`<button class="btn sm" data-act="defmaq">Crear motores y planta</button>`:""}</div>`}</div>
  <section class="card"><div class="ch"><div><h2>Mantenimiento por tiempo</h2><p class="sub">Extintores, aires acondicionados, desalinizadora, casco… con aviso antes de que toque</p></div>
    ${db?`<div class="tacts">${puedeAvisar()&&!avisosOn()&&Notification.permission!=="denied"?`<button class="btn sm" data-act="notif">${ICON.campana}Activar avisos</button>`:""}<button class="btn sm" data-act="plansug">Sugeridos</button><button class="btn sm" data-act="plan">Añadir</button></div>`:""}</div>
    ${P.length?`<div class="plans">${P.map(p=>{const st=pstate(p);return `<div class="plan ${st.cls}"><div class="pt"><b>${esc(p.nombre)}</b><small>${esc([p.sistema,cadaTxt(p)].filter(Boolean).join(" · "))}</small></div>
      <div class="pd"><span class="${st.cls?"st "+st.cls:"st"}">${esc(st.txt)}</span><small>${p.ultimo?"Último: "+fdate(p.ultimo)+" · próximo: "+fdate(st.next):"Toca «Hecho» con la fecha de la última vez"}</small></div>
      ${db?`<div class="pa"><button class="btn sm ${st.cls?"sand":""}" data-phecho="${esc(p.id)}">Hecho</button><button class="link" data-pedit="${esc(p.id)}">Editar</button></div>`:""}</div>`}).join("")}</div>`
      :`<p class="empty">Aún no hay mantenimientos por tiempo. Toca «Sugeridos» para cargar el plan recomendado (extintores, aires, balsa, desalinizadora, casco…) y ajusta cada intervalo.</p>`}</section>
  <section class="card"><div class="ch"><div><h2>Cambios de piezas</h2><p class="sub">Qué se cambió, cuándo y con foto</p></div>${db?`<button class="btn sm" data-act="pieza">Registrar cambio</button>`:""}</div>
    ${eqs.length>1?`<div class="filters">${["",...eqs].map(q=>`<button class="chipf" aria-pressed="${q===fEq}" data-feq="${esc(q)}">${esc(q||"Todos")}</button>`).join("")}</div>`:""}
    ${CF.length?`<div class="chg">${CF.slice(0,30).map(x=>`<div class="ci"><div class="cd num">${x.fecha?`<b>${+x.fecha.slice(8)}</b><span>${MES[+x.fecha.slice(5,7)-1]} ${x.fecha.slice(2,4)}</span>`:"<b>—</b>"}</div>
      <div class="cb"><b>${esc(x.pieza||x.titulo)}</b><small>${esc([x.equipo,x.detalle].filter(Boolean).join(" · "))}</small></div>
      <div class="cx">${x.foto?`<button class="link fotol" data-file="${esc(x.foto)}">${ICON.foto}Foto</button>`:""}${+x.costo?`<span class="num">${money2(x.costo)}</span>`:""}${db?`<button class="link" data-eedit="${esc(x.id)}">Editar</button>`:""}</div></div>`).join("")}</div>`
      :`<p class="empty">Registra cada pieza que se cambie (filtros, impeler, correas…) con su foto. Ej.: 22 nov, desalinizadora, filtro de 5 micras.</p>`}</section>
  <div class="grid2">
    <section class="card"><div class="ch"><div><h2>Revisión semanal</h2><p class="sub">Semana del ${dd.getDate()} ${MES[dd.getMonth()]} al ${e.getDate()} ${MES[e.getMonth()]}</p></div>
      <div class="month"><button id="wPrev" aria-label="Semana anterior">‹</button><button id="wNext" aria-label="Semana siguiente">›</button></div></div>
      <div class="prog"><div class="trk"><i style="width:${p.total?p.done/p.total*100:0}%"></i></div><b class="num">${p.done}/${p.total}</b></div>
      ${act.length?act.map(i=>{const s=st[i.id]||{};return `<div class="ri"><div><b>${esc(i.texto)}</b>${i.ayuda?`<small>${esc(i.ayuda)}</small>`:""}</div>
        <div class="seg" role="group" aria-label="${esc(i.texto)}"><button class="ok" aria-pressed="${s.estado==="ok"}" data-rv="${esc(i.id)}|ok" ${db?"":"disabled"}>Bien</button><button class="mal" aria-pressed="${s.estado==="mal"}" data-rv="${esc(i.id)}|mal" ${db?"":"disabled"}>Atención</button></div>
        ${s.estado==="mal"||s.nota?`<input id="rn_${esc(i.id)}" data-rn="${esc(i.id)}" value="${esc(s.nota||"")}" placeholder="¿Qué se encontró?" aria-label="Nota" ${db?"":"disabled"}>`:""}</div>`}).join(""):`<p class="empty">Sin puntos de revisión. Agrégalos en Ajustes.</p>`}</section>
    <div style="display:grid;gap:16px;align-content:start">
      <section class="card"><div class="ch"><h2>Lavado y secado</h2>${db?`<button class="btn sm" data-act="wash">Registrar lavado</button>`:""}</div>
        ${W.length?W.map(x=>`<div class="vc"><div>${esc(x.zona||x.titulo)}<small>${fdate(x.fecha)}${x.hIni?" · "+esc(x.hIni)+"–"+esc(x.hFin||"…"):""}${x.secado?" · seco a las "+esc(x.secado):""}</small></div><b class="num">${daysTo(x.fecha)===0?"Hoy":-daysTo(x.fecha)}<span>${daysTo(x.fecha)===0?"":"días"}</span></b></div>`).join(""):`<p class="empty">Sin lavados registrados.</p>`}</section>
      <section class="card"><div class="ch"><h2>Novedades abiertas</h2>${db?`<button class="btn sm" data-act="nov">Nueva</button>`:""}</div>
        ${NV.length?NV.map(x=>`<div class="vc warn"><div>${esc(x.titulo)}<small>${fdate(x.fecha)}${x.detalle?" · "+esc(x.detalle):""}</small></div>${db?`<button class="btn sm" data-eres="${esc(x.id)}">Resuelta</button>`:""}</div>`).join(""):`<p class="empty">Ninguna novedad abierta.</p>`}</section>
    </div>
  </div>`}

/* ---------- FINANZAS ---------- */
function vFin(){const ym=curM;const G=gMes(ym),tot=sum(G),fx=sum(G.filter(g=>g.tipo==="Fijo")),ing=iMes(ym);
  const FM=fijosMes(ym);const act=X().fijos.filter(f=>f.activo!==false);const mon=act.reduce((a,f)=>a+(+f.monto||0)/(STEP[f.frecuencia]||1),0);
  const months=[...Array(6)].map((_,i)=>addM(ym,i-5));const vi=months.map(iMes),vo=months.map(m=>sum(gMes(m)));const mx=Math.max(1,...vi,...vo);
  const L=[...G].sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||""));
  return `<div class="vh"><div><span class="eyebrow">Ingresos, gastos y pagos fijos</span><h1>Finanzas</h1></div>
    <div class="tacts"><div class="month"><button id="mPrev" aria-label="Mes anterior">‹</button><strong class="num">${MESL[+ym.slice(5)-1]} ${ym.slice(0,4)}</strong><button id="mNext" aria-label="Mes siguiente">›</button></div>${db?`<button class="btn pri sm" data-act="gasto">Registrar gasto</button>`:""}</div></div>
  <div class="kpis num"><div class="kpi"><span>Ingresos por viajes</span><b>${money(ing)}</b><small>${X().viajes.filter(v=>(v.zarpe||"").slice(0,7)===ym&&+v.ingreso).length} charters</small></div>
    <div class="kpi"><span>Gastos del mes</span><b>${money(tot)}</b><small>${money(fx)} fijos · ${money(tot-fx)} operación</small></div>
    <div class="kpi"><span>Resultado</span><b class="${ing-tot>=0?"pos":"neg"}">${money(ing-tot)}</b><small>Ingresos menos gastos</small></div>
    <div class="kpi"><span>Costo fijo mensual</span><b>${money(mon)}</b><small>${money(mon*12)} al año</small></div></div>
  <div class="grid2">
    <section class="card"><div class="ch"><div><h2>Pagos fijos del mes</h2><p class="sub">${FM.filter(x=>x.pago).length} de ${FM.length} pagados</p></div>${db?`<button class="btn sm" data-act="fijo">Nuevo fijo</button>`:""}</div>
      <div class="scroll"><table class="t"><tbody>${act.length?act.map(f=>{const due=dueIn(f,ym),p=FM.find(x=>x.f.id===f.id),pg=p&&p.pago;
        return `<tr><td>${esc(f.concepto)}<small>${esc(f.frecuencia||"Mensual")}${f.dia?" · día "+esc(f.dia):""}${f.proveedor?" · "+esc(f.proveedor):""}</small></td><td class="n">${f.monto==null||f.monto===""?"—":money(f.monto)}</td>
        <td class="n">${!due?`<span class="pill">No toca</span>`:pg?`<span class="pill ok">Pagado</span>`:db?`<button class="btn sand sm" data-pay="${esc(f.id)}">Pagar</button>`:`<span class="pill warn">Pendiente</span>`}${db?` <button class="link" data-fedit="${esc(f.id)}">Editar</button>`:""}</td></tr>`}).join(""):`<tr><td class="empty">Sin pagos fijos. Agrega sueldo, marina, internet, seguro…</td></tr>`}</tbody></table></div></section>
    <section class="card"><div class="ch"><div><h2>Últimos 6 meses</h2></div><div class="legend"><span><i style="background:var(--sea)"></i>Ingresos</span><span><i style="background:var(--sand)"></i>Gastos</span></div></div>
      <div class="bars">${months.map((m,i)=>`<div class="b ${m===ym?"cur":""}" title="${MESL[+m.slice(5)-1]}: ${money(vi[i])} ingresos, ${money(vo[i])} gastos"><div class="pair"><i class="in" style="height:${vi[i]/mx*100}%"></i><i class="out" style="height:${vo[i]/mx*100}%"></i></div><span class="lab">${MES[+m.slice(5)-1]}</span></div>`).join("")}</div></section>
  </div>
  <section class="card"><div class="ch"><h2>Movimientos de ${MESL[+ym.slice(5)-1]}</h2></div>
    <div class="scroll"><table class="t"><thead><tr><th>Fecha</th><th>Concepto</th><th>Tipo</th><th class="n">Monto</th><th></th></tr></thead><tbody>
    ${L.length?L.map(g=>`<tr><td style="white-space:nowrap">${fdateS(g.fecha)}</td><td>${esc(g.concepto)}<small>${[g.categoria,+g.litros?nf(g.litros)+" L":"",tripName(g.viajeId),g.pago].filter(Boolean).map(esc).join(" · ")}</small></td><td>${esc(g.tipo)}</td><td class="n">${money2(g.monto)}</td><td class="n">${g.recibo?`<button class="link" data-recibo="${esc(g.recibo)}">Recibo</button> `:""}${db?`<button class="link" data-gedit="${esc(g.id)}">Editar</button> <button class="link danger" data-del="gastos/${esc(g.id)}">Eliminar</button>`:""}</td></tr>`).join(""):`<tr><td colspan="5" class="empty">Sin movimientos este mes.</td></tr>`}
    </tbody><tfoot><tr><td colspan="3">Total</td><td class="n">${money2(tot)}</td><td></td></tr></tfoot></table></div></section>`}

/* ---------- BARCO: ficha, papeles, trabajos, facturas y temas ---------- */
let qView="abierto";
function vBarco(){const b=S.barco||{};const fin=FIN();
  const V=[...X().venc].sort((a,c)=>(a.vence||"9").localeCompare(c.vence||"9"));
  const T=[...X().trabajos].sort((a,c)=>(c.fecha||"").localeCompare(a.fecha||""));
  const Fa=[...X().facturas].sort((a,c)=>(c.fecha||"").localeCompare(a.fecha||""));
  const Q=X().temas.filter(q=>(q.estado==="resuelto")===(qView==="resuelto")).sort((a,c)=>({alta:0,media:1,baja:2}[a.prioridad]??1)-({alta:0,media:1,baja:2}[c.prioridad]??1)||(c.fecha||"").localeCompare(a.fecha||""));
  const inv=sum(T),saldo=X().facturas.reduce((a,f)=>a+(+f.saldo||0),0),abiertos=X().temas.filter(q=>q.estado!=="resuelto").length,porV=V.filter(v=>v.vence&&daysTo(v.vence)<=(+v.aviso||60)).length;
  const ficha=FICHA.map(([g,L],gi)=>{const it=L.map(([k,l,col])=>[l,fv(b,k,col)]).filter(x=>x[1]);return it.length?`<div class="fg"><div class="fgh"><h3>${g}</h3>${db&&fin?`<button class="link" data-ficha="${gi}">Editar</button>`:""}</div><dl class="info">${it.map(([l,v])=>`<div><dt>${esc(l)}</dt><dd>${esc(l==="Fecha de registro"?fdate(v):v)}</dd></div>`).join("")}</dl></div>`:""}).join("");
  return `<div class="vh"><div><span class="eyebrow">${esc([b.modelo,(b.ficha||{}).anio,(b.ficha||{}).matricula].filter(Boolean).join(" · ")||"Ficha, papeles y trabajos")}</span><h1>${esc(b.nombre||"Barco")}</h1><p>Ficha técnica, certificados, trabajos realizados y temas pendientes con el dueño.</p></div>
    ${db?`<div class="tacts">${fin?`<button class="btn sm" data-act="trabajo">Registrar trabajo</button>`:""}<button class="btn pri sm" data-act="tema">Nuevo tema</button></div>`:""}</div>
  <div class="kpis num">${fin?`<div class="kpi"><span>Invertido en el barco</span><b>${money(inv)}</b><small>${T.length} trabajos registrados</small></div>
    <div class="kpi"><span>Saldo por pagar</span><b class="${saldo>0?"neg":""}">${money(saldo)}</b><small>${X().facturas.filter(f=>+f.saldo>0).length} facturas con saldo</small></div>`:""}
    <div class="kpi"><span>Temas abiertos</span><b>${abiertos}</b><small>${X().temas.filter(q=>q.estado!=="resuelto"&&q.prioridad==="alta").length} de prioridad alta</small></div>
    <div class="kpi"><span>Papeles por vencer</span><b class="${porV?"neg":""}">${porV}</b><small>${V.length} certificados cargados</small></div></div>
  <div class="grid2">
    <section class="card"><div class="ch"><div><h2>Temas con el dueño</h2><p class="sub">Preguntas, problemas, mejoras y pendientes</p></div>
      <div class="seg" role="group" aria-label="Ver temas"><button aria-pressed="${qView==="abierto"}" data-qv="abierto">Abiertos</button><button aria-pressed="${qView==="resuelto"}" data-qv="resuelto">Resueltos</button></div></div>
      ${Q.length?Q.map(q=>`<div class="vc ${q.estado!=="resuelto"&&q.prioridad==="alta"?"warn":""}"><div><span class="pill ${q.prioridad==="alta"?"warn":""}">${esc(q.tipo)} · ${PRIO[q.prioridad]||"Media"}</span> ${esc(q.texto)}<small>${fdate(q.fecha)}${q.estado==="resuelto"?" · resuelto el "+fdate(q.resuelto)+(q.respuesta?": "+esc(q.respuesta):""):""}</small>
        ${db?`<span style="display:flex;gap:12px;margin-top:4px">${q.estado==="resuelto"?`<button class="link" data-qre="${esc(q.id)}">Reabrir</button>`:`<button class="link" data-qok="${esc(q.id)}">Resolver</button>`}<button class="link" data-qed="${esc(q.id)}">Editar</button><button class="link danger" data-del="temas/${esc(q.id)}">Eliminar</button></span>`:""}</div></div>`).join(""):`<p class="empty">${qView==="resuelto"?"Aún no hay temas resueltos.":"Nada pendiente. Anota aquí preguntas o problemas para decidir con el dueño."}</p>`}</section>
    <section class="card"><div class="ch"><div><h2>Certificados y vencimientos</h2><p class="sub">Según los certificados del INEA</p></div>${db&&fin?`<button class="btn sm" data-act="venc">Añadir</button>`:""}</div>
      ${V.length?V.map(v=>{const d=v.vence?daysTo(v.vence):null,av=+v.aviso||60;const c=d==null?"":d<0?"bad":d<=av?"warn":"";return `<div class="vc ${c}"><div>${esc(v.nombre)}<small>${[v.numero?"N.º "+v.numero:"",v.vence?"Vence "+fdate(v.vence):"Sin fecha",v.nota].filter(Boolean).map(esc).join(" · ")}</small><span style="display:flex;gap:12px">${v.archivo?`<button class="link" data-file="${esc(v.archivo)}">Ver archivo</button>`:""}${db&&fin?`<button class="link" data-vedit="${esc(v.id)}">Editar</button><button class="link danger" data-del="vencimientos/${esc(v.id)}">Eliminar</button>`:""}</span></div>${d==null?"":`<b class="num">${d<0?-d:d}<span>${d<0?"días vencido":"días"}</span></b>`}</div>`}).join(""):`<p class="empty">Carga el certificado de navegabilidad, la licencia de estación de radio, la póliza y los extintores para recibir avisos antes de que venzan.</p>`}</section>
  </div>
  ${fin?`<section class="card"><div class="ch"><div><h2>Trabajos, refits e inversiones</h2><p class="sub">${money(inv)} invertidos en total</p></div>${db?`<button class="btn sm" data-act="trabajo">Registrar trabajo</button>`:""}</div>
    ${T.length?T.map(w=>`<div class="vc"><div><span class="vt">${esc(w.titulo)}</span> <span class="pill ${w.estado==="Completado"?"ok":w.estado==="En curso"?"warn":""}">${esc(w.estado||"Completado")}</span><small>${[fdate(w.fecha),w.categoria,w.proveedor,w.lugar,w.horas?"Motores: "+w.horas+" h":"",w.factura?"Fact. "+w.factura:""].filter(Boolean).map(esc).join(" · ")}</small>${w.detalle?`<small>${esc(w.detalle)}</small>`:""}${db?`<span style="display:flex;gap:12px"><button class="link" data-wedit="${esc(w.id)}">Editar</button><button class="link danger" data-del="trabajos/${esc(w.id)}">Eliminar</button></span>`:""}</div><b class="num">${money(w.monto)}</b></div>`).join(""):`<p class="empty">Registra refits, reparaciones y compras grandes: quedan como historial del barco y suman a la inversión.</p>`}</section>
  <section class="card"><div class="ch"><div><h2>Facturas y documentos</h2><p class="sub">${saldo>0?money2(saldo)+" por pagar":"Todo pagado"}</p></div>${db?`<button class="btn sm" data-act="factura">Añadir factura</button>`:""}</div>
    ${Fa.length?Fa.map(f=>`<div class="vc ${+f.saldo>0?"warn":""}"><div><span class="vt">${esc(f.proveedor)}</span><small>${[fdate(f.fecha),f.nombre,f.total==null?"":"Total "+money2(f.total),f.nota].filter(Boolean).map(esc).join(" · ")}</small><span style="display:flex;gap:12px;flex-wrap:wrap">${f.archivo?`<button class="link" data-file="${esc(f.archivo)}">Abrir archivo</button>`:""}${db?`${+f.saldo>0?`<button class="link" data-fpay="${esc(f.id)}">Saldar</button>`:""}<button class="link" data-fcedit="${esc(f.id)}">Editar</button><button class="link danger" data-del="facturas/${esc(f.id)}">Eliminar</button>`:""}</span></div>${+f.saldo>0?`<b class="num">${money(f.saldo)}<span>por pagar</span></b>`:`<span class="pill ok">Pagada</span>`}</div>`).join(""):`<p class="empty">Sube las facturas de proveedores (PDF o foto) y lleva el saldo pendiente.</p>`}</section>`:""}
  <div class="grid2">
    <section class="card"><div class="ch"><h2>Ficha técnica</h2>${db&&fin?`<button class="btn sm" data-ficha="all">Editar todo</button>`:""}</div>${ficha||`<p class="empty">Carga matrícula, MMSI, eslora y los datos del registro naval tal como aparecen en los certificados.</p>`}</section>
    <section class="card"><div class="ch"><div><h2>Radio y navegación</h2><p class="sub">Certificado de seguridad radiotelefónica</p></div>${db&&fin?`<button class="btn sm" data-act="equipo">Añadir</button>`:""}</div>
      ${X().equipos.length?[...X().equipos].sort((a,c)=>(+a.orden||99)-(+c.orden||99)).map(q=>`<div class="vc"><div><span class="vt">${esc(q.elemento)}</span><small>${[[q.fabricante,q.modelo].filter(Boolean).join(" "),q.potencia,q.frecuencia].filter(Boolean).map(esc).join(" · ")||"Sin datos"}</small>${db&&fin?`<span style="display:flex;gap:12px"><button class="link" data-qeq="${esc(q.id)}">Editar</button><button class="link danger" data-del="equipos/${esc(q.id)}">Eliminar</button></span>`:""}</div></div>`).join(""):`<p class="empty">VHF, AIS, radar, EPIRB, GPS…</p>`}</section>
  </div>`}
function trabajo(id){const w=id?S.trabajos.find(x=>x.id===id):{fecha:today(),estado:"Completado",categoria:"Mecánica"};if(id&&!w)return;
  dialog(id?"Editar trabajo":"Registrar trabajo",[{k:"fecha",l:"Fecha",t:"date",req:1},{k:"monto",l:"Monto (USD)",t:"number",req:1},{k:"titulo",l:"Qué se hizo",full:1,req:1,ph:"Ej. Cambio de impelers en ambos motores"},{k:"categoria",l:"Área",t:"select",o:AREAS},{k:"proveedor",l:"Proveedor"},{k:"lugar",l:"Lugar",ph:"Ej. Lechería, Anzoátegui"},{k:"horas",l:"Horas de motor",ph:"Ej. 1.240 / 1.236"},{k:"factura",l:"N.º de factura"},{k:"estado",l:"Estado",t:"select",o:["Completado","En curso","Programado"]},{k:"detalle",l:"Detalle",t:"textarea",full:1,ph:"Repuestos, observaciones, garantía…"}],w,
  o=>{o.monto=+o.monto||0;safe(()=>id?patch("trabajos",id,o):put("trabajos",o),id?"Trabajo actualizado":"Trabajo registrado")})}
function factura(id){const f=id?S.facturas.find(x=>x.id===id):{fecha:today(),saldo:0};if(id&&!f)return;
  dialog(id?"Editar factura":"Añadir factura o documento",[{k:"fecha",l:"Fecha",t:"date",req:1},{k:"proveedor",l:"Proveedor",req:1},{k:"nombre",l:"Documento",full:1,req:1,ph:"Ej. Factura 1120, servicio del generador"},{k:"total",l:"Total (USD)",t:"number"},{k:"saldo",l:"Saldo pendiente (USD)",t:"number"},{k:"nota",l:"Nota",full:1},{k:"file",l:f.archivo?"Reemplazar archivo":"Archivo (PDF o foto)",t:"file",acc:"application/pdf,image/*",full:1}],f,
  o=>{const u={fecha:o.fecha,proveedor:o.proveedor,nombre:o.nombre,total:numOrNull(o.total),saldo:+o.saldo||0,nota:o.nota};safe(async()=>{if(o.file)u.archivo=await subirArchivo(o.file,"fin");return id?patch("facturas",id,u):put("facturas",u)},"Factura guardada")})}
function tema(id){const q=id?S.temas.find(x=>x.id===id):{tipo:"Pregunta",prioridad:"media"};if(id&&!q)return;
  dialog(id?"Editar tema":"Nuevo tema",[{k:"tipo",l:"Tipo",t:"select",o:TEMAT},{k:"prioridad",l:"Prioridad",t:"select",o:[{v:"alta",l:"Alta"},{v:"media",l:"Media"},{v:"baja",l:"Baja"}]},{k:"texto",l:"Descripción",t:"textarea",full:1,req:1}],q,
  o=>safe(()=>id?patch("temas",id,o):put("temas",{...o,estado:"abierto",fecha:today()}),"Tema guardado"))}
function resolver(id){const q=S.temas.find(x=>x.id===id);if(!q)return;dialog("Resolver tema",[{hint:q.texto},{k:"respuesta",l:"Qué se decidió o cómo se resolvió",t:"textarea",full:1}],q,o=>safe(()=>patch("temas",id,{estado:"resuelto",respuesta:o.respuesta,resuelto:today()}),"Marcado como resuelto"),"Marcar resuelto")}
function equipo(id){const q=id?S.equipos.find(x=>x.id===id):{};if(id&&!q)return;
  dialog(id?"Editar equipo":"Añadir equipo",[{k:"elemento",l:"Equipo",full:1,req:1,ph:"Ej. Radio VHF fija"},{k:"fabricante",l:"Fabricante"},{k:"modelo",l:"Modelo"},{k:"potencia",l:"Potencia"},{k:"frecuencia",l:"Frecuencia"}],q,
  o=>safe(()=>id?patch("equipos",id,o):put("equipos",{...o,orden:S.equipos.length+1}),"Equipo guardado"))}

/* ---------- BITÁCORA ---------- */
function vLog(){const q=(log.q||"").toLowerCase();
  const L=X().entradas.filter(e=>(!fTipo||e.tipo===fTipo)&&(!q||JSON.stringify(e).toLowerCase().includes(q))).sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||"")||(b.hora||"").localeCompare(a.hora||""));
  let last="";const rows=L.map(e=>{const meta=[];if(e.hora)meta.push(e.hora);if(e.litros)meta.push(nf(e.litros)+" L");if(e.lugar)meta.push(e.lugar);if(e.zona)meta.push(e.zona);if(e.secado)meta.push("Seco "+e.secado);if(e.viajeId&&tripName(e.viajeId))meta.push("Viaje: "+tripName(e.viajeId));if(e.tipo==="Novedad")meta.push(e.resuelta?"Resuelta":"Abierta");
    const day=e.fecha!==last?`<div class="day">${fdate(e.fecha)}</div>`:"";last=e.fecha;
    return day+`<article class="en"><div class="ic ${esc(e.tipo)}">${TIPO_IC[e.tipo]||ICON.log}</div><div style="min-width:0"><h3>${esc(e.titulo)}</h3>${e.detalle?`<p>${esc(e.detalle)}</p>`:""}
      ${meta.length?`<div class="meta">${meta.map(x=>`<span class="num">${esc(x)}</span>`).join("")}</div>`:""}
      ${e.foto?`<button class="link fotol" data-file="${esc(e.foto)}">${ICON.foto}Ver foto</button>`:""}
      ${db?`<div class="acts"><button class="link" data-eedit="${esc(e.id)}">Editar</button>${e.tipo==="Novedad"?`<button class="link" data-eres="${esc(e.id)}">${e.resuelta?"Reabrir":"Marcar resuelta"}</button>`:""}<button class="link danger" data-del="entradas/${esc(e.id)}">Eliminar</button></div>`:""}</div>
      <div class="amt num">${+e.costo?money2(e.costo):""}</div></article>`}).join("");
  return `<div class="vh"><div><span class="eyebrow">Todo lo que pasa a bordo</span><h1>Bitácora</h1></div>${db?`<button class="btn pri sm" data-act="entry">Nueva nota</button>`:""}</div>
  <div class="filters">${["",...TIPOS].map(t=>`<button class="chipf" aria-pressed="${t===fTipo}" data-tipo="${t}">${t||"Todo"}</button>`).join("")}</div>
  <input type="search" id="fq" class="search" placeholder="Buscar: impeller, diésel, Tortuga…" aria-label="Buscar en la bitácora" value="${esc(log.q||"")}">
  <section class="card"><div class="tl">${rows||`<p class="empty">${X().entradas.length?"Nada coincide con el filtro.":"Aún no hay notas. Toca «Registrar»."}</p>`}</div></section>`}
const log={q:""};

/* ---------- AJUSTES ---------- */
function vAjustes(){const b=X().barco||{};
  return `<div class="vh"><div><span class="eyebrow">Configuración</span><h1>Ajustes</h1></div><button class="btn sm" data-go="hoy">Volver</button></div>
  <div class="grid2">
    <section class="card"><h2>Listas</h2><div class="setlist" style="margin-top:6px">
      <div class="setrow"><div><b>Ficha técnica y papeles</b><small>Matrícula, certificados, equipos de radio</small></div><button class="btn sm" data-go="barco">Abrir</button></div>
      <div class="setrow"><div><b>Máquinas y servicios</b><small>${maqs().length} equipos</small></div><button class="btn sm" data-go="mant">Abrir</button></div>
      <div class="setrow"><div><b>Puntos de revisión semanal</b><small>${X().items.length} puntos</small></div>${db?`<button class="btn sm" data-act="item">Añadir punto</button>`:""}</div>
      <div class="setrow"><div><b>Avisos en este teléfono</b><small>${!puedeAvisar()?"Este navegador no permite avisos":avisosOn()?"Activados: avisa de mantenimientos, servicios y papeles al abrir la app":Notification.permission==="denied"?"Bloqueados en los ajustes del teléfono":"Desactivados"}</small></div>${puedeAvisar()&&!avisosOn()&&Notification.permission!=="denied"?`<button class="btn sm" data-act="notif">Activar</button>`:""}</div>
      <div class="setrow"><div><b>Pagos fijos</b><small>${X().fijos.length} conceptos</small></div><button class="btn sm" data-go="fin">Abrir</button></div>
      <div class="setrow"><div><b>Sincronización</b><small>${STATUS.online?"Con señal":"Sin señal"} · ${STATUS.pending?STATUS.pending+" cambios por enviar":"todo enviado"}${STATUS.lastSync?" · "+STATUS.lastSync.toLocaleTimeString("es-VE",{hour:"2-digit",minute:"2-digit"}):""}</small></div><button class="btn sm" data-act="sync">Sincronizar</button></div>
      <div class="setrow"><div><b>Exportar a Excel</b><small>Viajes, bitácora, gastos, máquinas y revisiones</small></div><button class="btn sm" data-act="xls" >Descargar</button></div>
    </div></section>
    ${ROL==="dueno"?`<section class="card"><div class="ch"><div><h2>Accesos del equipo</h2><p class="sub">Cada puesto entra con su código, sin correo. Si cambia la persona, cambia el código: quien sale pierde el acceso y los datos quedan en el barco.</p></div><button class="btn sm" data-cnew="1">Nuevo acceso</button></div>
      ${(EQUIPO.codigos||[]).length?[...EQUIPO.codigos].sort((a,b)=>({dueno:0,capitan:1,tripulacion:2}[a.rol]-{dueno:0,capitan:1,tripulacion:2}[b.rol])).map(c=>{const dev=EQUIPO.miembros.filter(m=>m.codigoId===c.id);return `<div class="vc acc"><div><span class="vt">${esc(c.puesto)}${EQUIPO.miembros.some(m=>m.codigoId===c.id&&m.userId===USER.id)?" · tu acceso":""}</span><small>${ROLES[c.rol]||c.rol} · ${dev.length?dev.length+(dev.length===1?" teléfono":" teléfonos"):"nadie ha entrado aún"} · código desde ${new Date(c.rotado_at).toLocaleDateString("es-VE",{day:"numeric",month:"short"})}</small><code class="cod">${esc(c.codigo)}</code>${dev.length?`<div class="devs">${dev.map(m=>`<span class="chip">${esc(m.nombre||"sin nombre")}${m.userId!==USER.id?`<button class="link danger" data-mdel="${esc(m.userId)}" aria-label="Quitar acceso a ${esc(m.nombre||"este teléfono")}">Quitar</button>`:" · tú"}</span>`).join("")}</div>`:""}</div>
        <span class="accb"><button class="link" data-ccopy="${esc(c.codigo)}">Copiar</button><button class="link" data-crot="${esc(c.id)}">Cambiar código</button><button class="link danger" data-cdel="${esc(c.id)}">Eliminar</button></span></div>`}).join(""):`<p class="hint">Crea un acceso para el capitán y otro para la tripulación.</p>`}
      <p class="hint">Guarda el código de dueño en un lugar seguro. Si se pierde, se puede consultar en el panel de Supabase.</p>
    </section>`:""}

    <section class="card"><div class="ch"><h2>Tu cuenta</h2></div><div class="vc"><div>${esc(USER.email||USER.nombre||"")}<small>${USER.anonimo?"Acceso por código · ":""}${ROLES[ROL]||ROL} en ${esc(S.barco.nombre||"el barco")}</small></div><span style="display:flex;gap:12px"><button class="link" data-cambiar="1">Cambiar de barco</button><button class="link danger" data-salir="1">Cerrar sesión</button></span></div></section>
  </div>`}

/* ================= diálogo genérico ================= */
function dialog(title,fields,vals,onOk,okLabel){
  $("#dT").textContent=title;$("#dOk").textContent=okLabel||"Guardar";
  $("#dBody").innerHTML=fields.map(f=>{if(f.hint)return `<p class="hint">${esc(f.hint)}</p>`;if(f.sep)return `<div class="sep">${esc(f.sep)}</div>`;const id="fld_"+f.k;const req=f.req?" required":"";
    const inp=f.t==="select"?`<select id="${id}" name="${f.k}">${f.o.map(o=>typeof o==="object"?`<option value="${esc(o.v)}">${esc(o.l)}</option>`:`<option>${esc(o)}</option>`).join("")}</select>`
      :f.t==="textarea"?`<textarea id="${id}" name="${f.k}"${req}></textarea>`
      :f.t==="file"?`<input id="${id}" name="${f.k}" type="file" accept="${f.acc||"image/*"}"${f.acc?"":' capture="environment"'}>`
      :`<input id="${id}" name="${f.k}" type="${f.t||"text"}"${f.t==="number"?' step="any" min="0" inputmode="decimal"':""}${req}${f.ph?` placeholder="${esc(f.ph)}"`:""}>`;
    return `<label class="${f.full?"full":""}" for="${id}">${esc(f.l)}${inp}</label>`}).join("");
  const F=$("#dForm");fields.forEach(f=>{if(f.k&&f.t!=="file"&&vals&&vals[f.k]!=null&&F.elements[f.k])F.elements[f.k].value=vals[f.k]});
  const d=$("#dlg");d.returnValue="";d.showModal();
  d.onclose=()=>{if(d.returnValue==="ok"){const o={};fields.forEach(f=>{if(f.k)o[f.k]=f.t==="file"?(F.elements[f.k].files[0]||null):F.elements[f.k].value.trim()});onOk(o)}}}
async function safe(fn,ok){try{await fn();if(ok)toast(ok+(STATUS.online?"":" · se enviará al volver la señal"))}catch(e){console.error(e);toast("No se pudo guardar: "+(e.message||"error"))}}
/* las escrituras usan siempre los datos reales (S), nunca el ejemplo */
async function ensureMaq(){if(S.maquinas.length)return;for(const m of DEF_MAQ)await put("maquinas",{clave:m.clave,nombre:m.nombre,modelo:"",orden:m.orden,horas:0,fecha:"",tareas:m.tareas.map(t=>({...t,ultimo:null}))})}
const realMaq=k=>S.maquinas.find(m=>m.clave===k)||{};
const rh=id=>{const m=realMaq(id);return m.fecha?m.horas:""};
async function applyHours(fecha,H,nota){for(const id of Object.keys(H)){const h=H[id];const m=S.maquinas.find(x=>x.clave===id);if(!m||h==null||isNaN(h))continue;if(m.fecha&&+h===+m.horas)continue;
  await put("lecturas",{fecha,maquina:id,horas:+h,nota:nota||""});if(fecha>=(m.fecha||"")&&(!m.fecha||+h>=+m.horas))await patch("maquinas",m.id,{horas:+h,fecha})}}
const realTripOpts=()=>[{v:"",l:"Sin viaje"},...[...S.viajes].sort((a,b)=>(b.zarpe||"").localeCompare(a.zarpe||"")).slice(0,25).map(v=>({v:v.id,l:v.destino+" · "+fdateS(v.zarpe)+(v.estado!=="Cerrado"?" (en curso)":"")}))];
const realOpen=()=>S.viajes.filter(v=>v.estado!=="Cerrado")[0];
const vidOf=vid=>vid&&S.viajes.some(v=>v.id===vid)?vid:(realOpen()||{}).id||"";
const stamp=()=>new Date().toISOString();

/* ================= acciones ================= */
function newTrip(){if(realOpen()){toast("Registra la llegada del viaje en curso antes de un nuevo zarpe.");go("viajes");return}
  dialog("Nuevo zarpe",[{k:"origen",l:"Desde",req:1,ph:"Ej. Puerto La Cruz"},{k:"destino",l:"Hacia",req:1,ph:"Ej. Isla de Plata · Mochima"},{k:"tipo",l:"Tipo de salida",t:"select",o:TIPOV},{k:"numeroZarpe",l:"N.º de zarpe",ph:"Como aparece en el documento"},
    {k:"zarpe",l:"Fecha",t:"date",req:1},{k:"horaZarpe",l:"Hora de zarpe",t:"time"},{k:"personas",l:"Personas a bordo",t:"number"},{k:"cliente",l:"Cliente, invitados o a quién se presta"},{k:"ingreso",l:"Ingreso (USD)",t:"number"},
    {k:"doc",l:"Documento del zarpe (PDF o foto)",t:"file",acc:"application/pdf,image/*",full:1},
    {sep:"Horómetros al zarpar"},{k:"babor",l:"Babor (h)",t:"number",req:1},{k:"estribor",l:"Estribor (h)",t:"number",req:1},{k:"planta",l:"Planta (h)",t:"number"},
    {k:"notas",l:"Notas",t:"textarea",full:1,ph:"Condiciones del mar, motivo, pedidos especiales…"}],
    {origen:(S.barco||{}).puerto||"Puerto La Cruz",zarpe:today(),horaZarpe:nowHM(),tipo:"Charter",babor:rh("babor"),estribor:rh("estribor"),planta:rh("planta")},o=>{
    const hz={babor:numOrNull(o.babor),estribor:numOrNull(o.estribor),planta:numOrNull(o.planta)};
    safe(async()=>{await ensureMaq();const documentos=o.doc?[{nombre:"Zarpe",archivo:await subirArchivo(o.doc,"docs"),fecha:today()}]:[];
      await put("viajes",{origen:o.origen,destino:o.destino,numeroZarpe:o.numeroZarpe,documentos,tipo:o.tipo,cliente:o.cliente,personas:numOrNull(o.personas),ingreso:numOrNull(o.ingreso),zarpe:o.zarpe,horaZarpe:o.horaZarpe,notas:o.notas,hz,hl:{},estado:"En curso",creado:stamp()});
      await applyHours(o.zarpe,hz,"Zarpe: "+o.destino);go("hoy")},"Zarpe registrado. Buen viaje.")},"Registrar zarpe")}
function closeTrip(id){const v=S.viajes.find(x=>x.id===id);if(!v)return
  dialog("Llegada: "+v.destino,[{k:"llegada",l:"Fecha de llegada",t:"date",req:1},{k:"millas",l:"Millas navegadas",t:"number"},{sep:"Horómetros al llegar"},{k:"babor",l:"Babor (h)",t:"number",req:1},{k:"estribor",l:"Estribor (h)",t:"number",req:1},{k:"planta",l:"Planta (h)",t:"number"},
    {k:"ingreso",l:"Ingreso final (USD)",t:"number"},{k:"cierre",l:"Novedades del viaje",t:"textarea",full:1},{hint:"Las horas de llegada actualizan las máquinas y calculan el consumo del viaje."}],
    {llegada:today(),babor:rh("babor"),estribor:rh("estribor"),planta:rh("planta"),ingreso:v.ingreso},o=>{
    const hl={babor:numOrNull(o.babor),estribor:numOrNull(o.estribor),planta:numOrNull(o.planta)};
    for(const k of MQ){if(hl[k]!=null&&v.hz&&v.hz[k]!=null&&hl[k]<v.hz[k]){toast("Las horas de llegada de "+k+" son menores que al zarpar.");return}}
    safe(async()=>{await patch("viajes",id,{llegada:o.llegada,millas:numOrNull(o.millas),hl,ingreso:numOrNull(o.ingreso),estado:"Cerrado",notas:[v.notas,o.cierre].filter(Boolean).join(" · ")});await applyHours(o.llegada,hl,"Llegada: "+v.destino)},"Llegada registrada")},"Registrar llegada")}
function editTrip(id){const v=S.viajes.find(x=>x.id===id);if(!v)return;const cl=v.estado==="Cerrado";const hz=v.hz||{},hl=v.hl||{};
  dialog("Editar viaje",[{k:"origen",l:"Desde"},{k:"destino",l:"Hacia",req:1},{k:"tipo",l:"Tipo",t:"select",o:TIPOV},{k:"numeroZarpe",l:"N.º de zarpe"},{k:"personas",l:"Personas",t:"number"},{k:"zarpe",l:"Zarpe",t:"date"},{k:"cliente",l:"Cliente"},{k:"ingreso",l:"Ingreso (USD)",t:"number"},
    ...(cl?[{k:"llegada",l:"Llegada",t:"date"},{k:"millas",l:"Millas",t:"number"}]:[]),{sep:"Horómetros"},{k:"zb",l:"Babor al zarpar",t:"number"},{k:"ze",l:"Estribor al zarpar",t:"number"},
    ...(cl?[{k:"lb",l:"Babor al llegar",t:"number"},{k:"le",l:"Estribor al llegar",t:"number"}]:[]),{k:"notas",l:"Notas",t:"textarea",full:1}],
    {...v,zb:hz.babor,ze:hz.estribor,lb:hl.babor,le:hl.estribor},o=>{const u={origen:o.origen,destino:o.destino,numeroZarpe:o.numeroZarpe,tipo:o.tipo,personas:numOrNull(o.personas),zarpe:o.zarpe,cliente:o.cliente,ingreso:numOrNull(o.ingreso),notas:o.notas,hz:{...hz,babor:numOrNull(o.zb),estribor:numOrNull(o.ze)}};
    if(cl){u.llegada=o.llegada;u.millas=numOrNull(o.millas);u.hl={...hl,babor:numOrNull(o.lb),estribor:numOrNull(o.le)}}
    safe(()=>patch("viajes",id,u),"Viaje actualizado")})}
function addDoc(vid){const v=S.viajes.find(x=>x.id===vid);if(!v)return;
  dialog("Documento del viaje",[{hint:ruta(v)+(v.numeroZarpe?" · zarpe N.º "+v.numeroZarpe:"")},{k:"nombre",l:"Documento",t:"select",o:DOCS_ZARPE},{k:"otro",l:"Nombre (si es otro)"},{k:"file",l:"Archivo (PDF o foto)",t:"file",acc:"application/pdf,image/*",full:1}],{nombre:(v.documentos||[]).some(d=>d.nombre==="Zarpe")?"Lista de pasajeros":"Zarpe"},
    o=>{if(!o.file){toast("Elige el archivo del documento.");return}safe(async()=>{const archivo=await subirArchivo(o.file,"docs");await patch("viajes",vid,{documentos:[...(v.documentos||[]),{nombre:o.nombre==="Otro"&&o.otro?o.otro:o.nombre,archivo,fecha:today()}]})},"Documento guardado")},"Subir documento")}
function quitarDoc(vid,i){const v=S.viajes.find(x=>x.id===vid);if(!v)return;const D=[...(v.documentos||[])];D.splice(+i,1);safe(()=>patch("viajes",vid,{documentos:D}),"Documento quitado")}
function newFuel(vid){const v=vidOf(vid);
  dialog("Carga de combustible",[{k:"fecha",l:"Fecha",t:"date",req:1},{k:"hora",l:"Hora",t:"time"},{k:"litros",l:"Litros",t:"number",req:1},{k:"costo",l:"Costo (USD)",t:"number"},{k:"lugar",l:"Dónde",ph:"Ej. Bahía Redonda"},{k:"pago",l:"Forma de pago",t:"select",o:PAGOS},{k:"viajeId",l:"Viaje",t:"select",o:realTripOpts(),full:1}],
    {fecha:today(),hora:nowHM(),viajeId:v,pago:"Efectivo USD"},o=>safe(async()=>{const ref={id:newId()};const L=numOrNull(o.litros),C=numOrNull(o.costo);
      await put("entradas",{id:ref.id,fecha:o.fecha,hora:o.hora,tipo:"Combustible",titulo:"Carga de "+nf(L)+" L de diésel",lugar:o.lugar,litros:L,costo:C,viajeId:o.viajeId,creado:stamp()});
      if(C>0)await put("gastos",{fecha:o.fecha,concepto:"Diésel"+(o.lugar?" en "+o.lugar:""),tipo:"Operativo",categoria:"Combustible",monto:C,litros:L,pago:o.pago,entradaId:ref.id,viajeId:o.viajeId,creado:stamp()})},"Combustible registrado"),"Guardar carga")}
const GF=()=>[{k:"fecha",l:"Fecha",t:"date",req:1},{k:"monto",l:"Monto (USD)",t:"number",req:1},{k:"concepto",l:"Concepto",full:1,req:1,ph:"Ej. Hielo y agua para el charter"},
  {k:"tipo",l:"Tipo",t:"select",o:["Operativo","Mantenimiento","Fijo"]},{k:"categoria",l:"Categoría",t:"select",o:CATS},{k:"proveedor",l:"Proveedor"},{k:"pago",l:"Forma de pago",t:"select",o:PAGOS},{k:"litros",l:"Litros (si es combustible)",t:"number"},{k:"viajeId",l:"Viaje",t:"select",o:realTripOpts()},{k:"foto",l:"Foto del recibo",t:"file",full:1}];
function newGasto(vid){const v=vidOf(vid);dialog(v?"Gasto del viaje":"Registrar gasto",GF(),{fecha:curM===today().slice(0,7)||view!=="fin"?today():curM+"-01",tipo:"Operativo",categoria:"Víveres y bebidas",pago:"Efectivo USD",viajeId:v},
  o=>{o.monto=+o.monto||0;o.litros=numOrNull(o.litros);safe(async()=>{const f=o.foto;delete o.foto;if(f)o.recibo=await subirRecibo(f);await put("gastos",o)},"Gasto registrado")},"Guardar gasto")}
function editGasto(id){const g=S.gastos.find(x=>x.id===id);if(!g)return;dialog("Editar gasto",GF(),g,o=>{o.monto=+o.monto||0;o.litros=numOrNull(o.litros);safe(async()=>{const f=o.foto;delete o.foto;if(f)o.recibo=await subirRecibo(f);await patch("gastos",id,o)},"Gasto actualizado")})}
function newWash(){dialog("Lavado",[{k:"zona",l:"Qué se lavó",t:"select",o:ZONAS,full:1},{k:"fecha",l:"Fecha",t:"date",req:1},{k:"hIni",l:"Empezó",t:"time"},{k:"hFin",l:"Terminó",t:"time"},{k:"secado",l:"Seco a las",t:"time"},{k:"costo",l:"Costo (USD)",t:"number"},{k:"detalle",l:"Notas",t:"textarea",full:1,ph:"Productos usados, quién lavó, zonas pendientes…"},
  {hint:"Con la hora de secado, la pantalla Hoy muestra cuánto falta para poder usar el barco."}],
  {fecha:today(),hIni:nowHM(),zona:"Casco y cubierta"},o=>safe(async()=>{const ref={id:newId()};const C=numOrNull(o.costo);
    await put("entradas",{id:ref.id,fecha:o.fecha,hora:o.hFin||o.hIni,tipo:"Limpieza",titulo:"Lavado: "+o.zona.toLowerCase(),zona:o.zona,hIni:o.hIni,hFin:o.hFin,secado:o.secado,detalle:o.detalle,costo:C,creado:stamp()});
    if(C>0)await put("gastos",{fecha:o.fecha,concepto:"Lavado: "+o.zona.toLowerCase(),tipo:"Mantenimiento",categoria:"Limpieza",monto:C,entradaId:ref.id,creado:stamp()})},"Lavado registrado"),"Guardar lavado")}
function newNov(){dialog("Novedad",[{k:"titulo",l:"Qué pasa",full:1,req:1,ph:"Ej. Goteo en la bomba de agua dulce"},{k:"fecha",l:"Fecha",t:"date",req:1},{k:"lugar",l:"Dónde"},{k:"detalle",l:"Detalle",t:"textarea",full:1}],{fecha:today()},
  o=>safe(()=>put("entradas",{...o,hora:nowHM(),tipo:"Novedad",resuelta:false,viajeId:(realOpen()||{}).id||"",creado:stamp()}),"Novedad registrada"),"Guardar novedad")}
function entryFields(e){return[{k:"fecha",l:"Fecha",t:"date",req:1},{k:"hora",l:"Hora",t:"time"},{k:"tipo",l:"Tipo",t:"select",o:TIPOS},{k:"lugar",l:"Lugar"},{k:"titulo",l:"Qué pasó",full:1,req:1},{k:"detalle",l:"Detalle",t:"textarea",full:1},{k:"litros",l:"Litros",t:"number"},{k:"costo",l:"Costo (USD)",t:"number"},{k:"viajeId",l:"Viaje",t:"select",o:realTripOpts(),full:1},{k:"foto",l:e&&e.foto?"Reemplazar foto":"Foto",t:"file",full:1}]}
function newEntry(vid){dialog("Nueva nota",entryFields(),{fecha:today(),hora:nowHM(),tipo:"Navegación",viajeId:vidOf(vid)},o=>safe(async()=>{const ref={id:newId()};const f=o.foto;delete o.foto;const e={...o,id:ref.id,litros:numOrNull(o.litros),costo:numOrNull(o.costo),creado:stamp()};if(f)e.foto=await subirArchivo(f,"docs");await put("entradas",e);
  if(+e.costo>0)await put("gastos",{fecha:o.fecha,concepto:o.titulo,tipo:o.tipo==="Mantenimiento"?"Mantenimiento":"Operativo",categoria:o.tipo,monto:+e.costo,litros:e.litros,entradaId:ref.id,viajeId:o.viajeId,creado:stamp()})},"Nota guardada"),"Guardar nota")}
function editEntry(id){const e=S.entradas.find(x=>x.id===id);if(!e)return;dialog("Editar nota",entryFields(e),e,o=>{const f=o.foto;delete o.foto;const u={...o,litros:numOrNull(o.litros),costo:numOrNull(o.costo)};
  safe(async()=>{if(f)u.foto=await subirArchivo(f,"docs");await patch("entradas",id,u);const g=S.gastos.find(x=>x.entradaId===id);
    if(g){if(+u.costo>0)await patch("gastos",g.id,{monto:+u.costo,fecha:u.fecha,viajeId:u.viajeId,litros:u.litros});else await remove("gastos",g.id)}
    else if(+u.costo>0)await put("gastos",{fecha:u.fecha,concepto:u.titulo,tipo:u.tipo==="Mantenimiento"?"Mantenimiento":"Operativo",categoria:u.tipo,monto:+u.costo,litros:u.litros,entradaId:id,viajeId:u.viajeId,creado:stamp()})},"Nota actualizada")})}
/* cambio de pieza: fecha, equipo, pieza y foto; queda en la bitácora y en el historial de Mantenimiento */
function equiposOpts(){return[...new Set([...maqs().map(m=>m.nombre),...EQUIPOS_BASE.filter(x=>x!=="Otro"),...X().entradas.map(e=>e.equipo).filter(Boolean),"Otro"])]}
function newCambio(pre){pre=pre||{};
  dialog("Cambio de pieza",[{k:"fecha",l:"Fecha del cambio",t:"date",req:1},{k:"equipo",l:"Equipo",t:"select",o:equiposOpts()},{k:"otro",l:"Equipo (si es otro)"},{k:"pieza",l:"Qué pieza se cambió",req:1,ph:"Ej. Filtro de 5 micras"},
    {k:"costo",l:"Costo (USD)",t:"number"},{k:"proveedor",l:"Proveedor o marca",ph:"Ej. Spectra, original"},{k:"detalle",l:"Notas",t:"textarea",full:1,ph:"Estado de la pieza vieja, quién la cambió, próxima revisión…"},
    {k:"foto",l:"Foto de la pieza",t:"file",full:1},{hint:"La foto y la fecha quedan en el historial de cambios del equipo."}],{fecha:today(),equipo:pre.equipo||"Desalinizadora"},
    o=>{const equipo=o.equipo==="Otro"?(o.otro||"Otro"):o.equipo;safe(async()=>{const ref={id:newId()};const C=numOrNull(o.costo);const foto=o.foto?await subirArchivo(o.foto,"docs"):null;
      await put("entradas",{id:ref.id,fecha:o.fecha,hora:nowHM(),tipo:"Mantenimiento",titulo:"Cambio: "+o.pieza+" · "+equipo,equipo,pieza:o.pieza,detalle:[o.proveedor,o.detalle].filter(Boolean).join(" · "),costo:C,foto,viajeId:(realOpen()||{}).id||"",creado:stamp()});
      if(C>0)await put("gastos",{fecha:o.fecha,concepto:"Repuesto: "+o.pieza+" ("+equipo+")",tipo:"Mantenimiento",categoria:"Repuestos",proveedor:o.proveedor,monto:C,entradaId:ref.id,creado:stamp()})},"Cambio registrado")},"Guardar cambio")}
/* mantenimiento por tiempo */
function plan(id){const p=id?S.planes.find(x=>x.id===id):{cada:6,unidad:"meses",aviso:15,sistema:"Seguridad"};if(id&&!p)return;
  dialog(id?"Editar mantenimiento":"Mantenimiento por tiempo",[{k:"nombre",l:"Qué hay que hacer",full:1,req:1,ph:"Ej. Aires acondicionados: limpieza de filtros"},{k:"sistema",l:"Sistema",t:"select",o:SISTEMAS},
    {k:"cada",l:"Cada",t:"number",req:1},{k:"unidad",l:"Unidad",t:"select",o:Object.entries(UNI).map(([v,l])=>({v,l:l[1]}))},{k:"ultimo",l:"Última vez que se hizo",t:"date"},{k:"aviso",l:"Avisar con (días de anticipación)",t:"number"},
    {k:"nota",l:"Notas",t:"textarea",full:1,ph:"Proveedor, repuesto, cómo se hace…"},...(id?[{k:"activo",l:"Estado",t:"select",o:["Activo","Pausado"]}]:[]),{hint:"La app calcula la próxima fecha y avisa en «Atención» y en el teléfono cuando se acerca."}],
    {...p,activo:p.activo===false?"Pausado":"Activo"},o=>{const u={nombre:o.nombre,sistema:o.sistema,cada:Math.max(1,Math.round(+o.cada||1)),unidad:o.unidad,ultimo:o.ultimo||null,aviso:numOrNull(o.aviso)??15,nota:o.nota};if(id)u.activo=o.activo!=="Pausado";
    safe(()=>id?patch("planes",id,u):put("planes",{...u,activo:true,orden:S.planes.length+1}),"Mantenimiento guardado")})}
function planHecho(id){const p=S.planes.find(x=>x.id===id);if(!p)return;
  dialog("Hecho: "+p.nombre,[{k:"fecha",l:"Fecha en que se hizo",t:"date",req:1},{k:"costo",l:"Costo (USD)",t:"number"},{k:"pieza",l:"Pieza cambiada (si aplica)",ph:"Ej. Filtro de aire"},{k:"detalle",l:"Notas",t:"textarea",full:1},{k:"foto",l:"Foto",t:"file",full:1},{hint:cadaTxt(p)+": el próximo aviso se calcula desde esta fecha."}],{fecha:today()},
    o=>safe(async()=>{const ref={id:newId()};const C=numOrNull(o.costo);const foto=o.foto?await subirArchivo(o.foto,"docs"):null;
      if(!p.ultimo||o.fecha>=p.ultimo)await patch("planes",id,{ultimo:o.fecha});
      await put("entradas",{id:ref.id,fecha:o.fecha,hora:nowHM(),tipo:"Mantenimiento",titulo:p.nombre,equipo:p.sistema||"",pieza:o.pieza||null,planId:id,detalle:o.detalle,costo:C,foto,creado:stamp()});
      if(C>0)await put("gastos",{fecha:o.fecha,concepto:p.nombre,tipo:"Mantenimiento",categoria:o.pieza?"Repuestos":"Mano de obra",monto:C,entradaId:ref.id,creado:stamp()})},"Registrado. Próximo: "+fdate(addInt(o.fecha||today(),p.cada,p.unidad))),"Guardar")}
function planSug(){const ya=new Set(S.planes.map(p=>(p.nombre||"").toLowerCase()));const F=PLAN_SUG.filter(x=>!ya.has(x[0].toLowerCase()));
  if(!F.length){toast("Ya tienes todos los sugeridos. Usa «Añadir» para otros.");return}
  dialog("Plan recomendado",[{hint:"Intervalos de referencia habituales; ajústalos a lo que indique cada fabricante. Después anota en cada uno la fecha de la última vez."},
    {k:"cual",l:"Qué agregar",t:"select",full:1,o:[{v:"todos",l:"Todos los que faltan ("+F.length+")"},...F.map((x,i)=>({v:String(i),l:x[0]+" · cada "+(x[2]===1?UNI[x[3]][0]:x[2]+" "+UNI[x[3]][1])}))]}],{cual:"todos"},
    o=>{const L=o.cual==="todos"?F:[F[+o.cual]];safe(async()=>{let n=S.planes.length;for(const[nombre,sistema,cada,unidad,aviso]of L)await put("planes",{nombre,sistema,cada,unidad,aviso,ultimo:null,activo:true,orden:++n})},L.length===1?"Agregado":"Agregados "+L.length+" mantenimientos")},"Agregar")}
function hours(){const M=S.maquinas.length?[...S.maquinas].sort((a,b)=>(+a.orden||9)-(+b.orden||9)):DEF_MAQ;const v={fecha:today()};M.forEach(m=>v[m.clave]=m.fecha?m.horas:"");
  dialog("Registrar horas",[{k:"fecha",l:"Fecha",t:"date",full:1,req:1},...M.map(m=>({k:m.clave,l:m.nombre+" (h)",t:"number"})),{k:"nota",l:"Nota",full:1}],v,o=>{const H={};M.forEach(m=>H[m.clave]=numOrNull(o[m.clave]));safe(async()=>{await ensureMaq();await applyHours(o.fecha,H,o.nota||"Lectura de horómetro")},"Horas registradas")})}
function markService(mid){const m=S.maquinas.find(x=>x.id===mid);if(!m||!(m.tareas||[]).length)return;
  const ord=(m.tareas||[]).map((t,i)=>({t,i,s:tstate(m,t)})).sort((a,b)=>(a.s.rem??1e9)-(b.s.rem??1e9));
  dialog("Servicio: "+m.nombre,[{k:"ti",l:"Qué se hizo",t:"select",full:1,o:ord.map(x=>({v:String(x.i),l:x.t.t}))},{k:"horas",l:"Hecho a las (h)",t:"number",req:1},{k:"fecha",l:"Fecha",t:"date",req:1},{k:"costo",l:"Costo (USD)",t:"number"},{k:"detalle",l:"Repuestos y notas",t:"textarea",full:1},{k:"foto",l:"Foto de la pieza o del trabajo",t:"file",full:1}],{horas:m.fecha?m.horas:"",fecha:today(),ti:String(ord[0].i)},
    o=>{const i=+o.ti,t=m.tareas[i];safe(async()=>{const T=[...m.tareas];T[i]={...t,ultimo:+o.horas};await patch("maquinas",mid,{tareas:T});const ref={id:newId()};const C=numOrNull(o.costo);
      const foto=o.foto?await subirArchivo(o.foto,"docs"):null;
      await put("entradas",{id:ref.id,fecha:o.fecha,hora:nowHM(),tipo:"Mantenimiento",titulo:m.nombre+": "+t.t,equipo:m.nombre,pieza:t.t,detalle:[o.detalle,"A las "+nf(o.horas)+" h"].filter(Boolean).join(" · "),costo:C,foto,creado:stamp()});
      if(C>0)await put("gastos",{fecha:o.fecha,concepto:m.nombre+": "+t.t,tipo:"Mantenimiento",categoria:"Repuestos",monto:C,entradaId:ref.id,creado:stamp()})},"Servicio registrado")},"Registrar servicio")}
function maqForm(m){const T=[...(m.tareas||[])];while(T.length<Math.max(4,(m.tareas||[]).length+1))T.push({});
  const F=[{k:"nombre",l:"Nombre",req:1},{k:"modelo",l:"Marca y modelo",ph:"Ej. Volvo Penta D2-75"},{k:"serial",l:"Serial"},{k:"nota",l:"Nota"},{sep:"Servicios por horas"}];const V={nombre:m.nombre,modelo:m.modelo,serial:m.serial,nota:m.nota};
  T.forEach((t,i)=>{F.push({k:"t"+i,l:"Servicio",full:1,ph:"Ej. Aceite y filtro"},{k:"c"+i,l:"Cada (h)",t:"number"},{k:"u"+i,l:"Último a las (h)",t:"number"});V["t"+i]=t.t;V["c"+i]=t.cada;V["u"+i]=t.ultimo});return{F,V,n:T.length}}
const readT=(o,n)=>{const T=[];for(let i=0;i<n;i++){const t=(o["t"+i]||"").trim(),c=numOrNull(o["c"+i]);if(t&&c)T.push({t,cada:c,ultimo:numOrNull(o["u"+i])})}return T};
function editMaq(id){const m=S.maquinas.find(x=>x.id===id);if(!m)return;const{F,V,n}=maqForm(m);dialog("Editar "+m.nombre,F,V,o=>safe(()=>patch("maquinas",id,{nombre:o.nombre,modelo:o.modelo,serial:o.serial,nota:o.nota,tareas:readT(o,n)}),"Máquina actualizada"))}
function addMaq(){const{F,V,n}=maqForm({});F.splice(2,0,{k:"horas",l:"Horas actuales",t:"number"});dialog("Añadir máquina",F,V,o=>{const clave=o.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,30)+"-"+Date.now().toString(36);const h=numOrNull(o.horas);
  safe(async()=>{await ensureMaq();await put("maquinas",{clave,nombre:o.nombre,modelo:o.modelo,serial:o.serial,nota:o.nota,orden:S.maquinas.length+1,horas:h??0,fecha:h==null?"":today(),tareas:readT(o,n)})},"Máquina añadida")})}
function venc(id){const v=id?S.venc.find(x=>x.id===id):{aviso:60};if(id&&!v)return;
  dialog(id?"Editar certificado":"Nuevo certificado o vencimiento",[{k:"nombre",l:"Certificado, permiso o equipo",full:1,req:1,ph:"Ej. Certificado de navegabilidad, póliza, extintores"},{k:"numero",l:"Número"},{k:"emision",l:"Emitido",t:"date"},{k:"vence",l:"Vence",t:"date",req:1},{k:"aviso",l:"Avisar con (días)",t:"number"},{k:"nota",l:"Notas y requisitos",t:"textarea",full:1},{k:"file",l:v.archivo?"Reemplazar archivo (PDF o foto)":"Archivo (PDF o foto)",t:"file",acc:"application/pdf,image/*",full:1}],v,
  o=>{const u={nombre:o.nombre,numero:o.numero,emision:o.emision,vence:o.vence,aviso:numOrNull(o.aviso)??60,nota:o.nota};safe(async()=>{if(o.file)u.archivo=await subirArchivo(o.file,"docs");return id?patch("vencimientos",id,u):put("vencimientos",u)},"Certificado guardado")})}
function fijo(id){const f=id?S.fijos.find(x=>x.id===id):{frecuencia:"Mensual",mesPago:"1",activo:true,categoria:"Otros"};if(id&&!f)return;
  dialog(id?"Editar pago fijo":"Nuevo pago fijo",[{k:"concepto",l:"Concepto",full:1,req:1,ph:"Ej. Sueldo del marinero"},{k:"monto",l:"Monto (USD)",t:"number"},{k:"frecuencia",l:"Frecuencia",t:"select",o:["Mensual","Trimestral","Semestral","Anual"]},{k:"dia",l:"Día de pago",t:"number"},{k:"mesPago",l:"Mes de pago (si no es mensual)",t:"select",o:["1","2","3","4","5","6","7","8","9","10","11","12"]},
    {k:"categoria",l:"Categoría",t:"select",o:["Tripulación","Marina","Conectividad","Seguro","Permisos y trámites","Limpieza","Otros"]},{k:"proveedor",l:"Proveedor o persona"},{k:"activo",l:"Estado",t:"select",o:["Activo","Inactivo"]}],
    {...f,activo:f.activo===false?"Inactivo":"Activo"},o=>{const u={...o,monto:numOrNull(o.monto),activo:o.activo!=="Inactivo"};safe(()=>id?patch("fijos",id,u):put("fijos",u),"Pago fijo guardado")})}
function pay(id){const f=S.fijos.find(x=>x.id===id);if(!f)return;const dd=String(Math.min(+f.dia||1,28)).padStart(2,"0");
  dialog("Pagar: "+f.concepto,[{k:"fecha",l:"Fecha de pago",t:"date",req:1},{k:"monto",l:"Monto (USD)",t:"number",req:1},{k:"pago",l:"Forma de pago",t:"select",o:PAGOS},{k:"nota",l:"Nota"}],
    {fecha:curM===today().slice(0,7)?today():curM+"-"+dd,monto:f.monto??"",pago:"Zelle"},o=>safe(()=>put("gastos",{fecha:o.fecha,concepto:f.concepto,tipo:"Fijo",categoria:f.categoria||"",proveedor:f.proveedor||"",monto:+o.monto||0,pago:o.pago,nota:o.nota,fijoId:f.id,creado:stamp()}),"Pago registrado"),"Registrar pago")}
const FICHA=[["Identificación",[["nombre","Nombre",1],["modelo","Modelo",1],["anio","Año"],["color","Color"],["matricula","Matrícula"],["distintivo","Distintivo de llamada"],["mmsi","MMSI"],["hin","Serial del casco (HIN)"],["tipo","Tipo de buque"],["servicio","Servicio"],["capacidad","Capacidad de personas"],["zona","Zona de operación"],["puerto","Puerto base",1]]],
  ["Propietario",[["propietario","Propietario"],["rif","RIF"],["direccion","Dirección"]]],
  ["Dimensiones y arqueo",[["eslora","Eslora total"],["manga","Manga"],["puntal","Puntal"],["arqueoBruto","Arqueo bruto (AB)"],["arqueoNeto","Arqueo neto"]]],
  ["Propulsión",[["motores","Motores",1],["cilindros","Cilindros"],["potencia","Potencia"],["velocidad","Velocidad"]]],
  ["Capacidades y consumibles",[["combustible","Combustible",1],["autonomia","Autonomía"],["agua","Agua dulce"],["desal","Desalinizadora",1],["planta","Planta generadora",1],["aceite","Aceite",1],["racor","Filtros Racor",1],["tender","Tender",1]]],
  ["Tripulación",[["capitan","Capitán",1],["marinero","Marinero",1]]],
  ["Registro naval",[["regNumero","Número de registro"],["regFolio","Folio"],["regTomo","Tomo"],["regProtocolo","Protocolo"],["regFecha","Fecha de registro"]]],
  ["Propósito",[["mision","Misión"],["vision","Visión"]]]];
const fv=(b,k,col)=>col?b[k]:(b.ficha||{})[k];
function barco(grp){const b=S.barco||{};const G=grp!=null?[FICHA[grp]]:FICHA;const F=[],V={};
  G.forEach(([g,L])=>{F.push({sep:g});L.forEach(([k,l,col])=>{F.push({k,l,t:k==="regFecha"?"date":(k==="mision"||k==="vision"||k==="direccion")?"textarea":"text",full:k==="mision"||k==="vision"||k==="direccion",req:k==="nombre"});V[k]=fv(b,k,col)})});
  dialog(grp!=null?FICHA[grp][0]:"Ficha técnica",F,V,o=>{const p={},fi={...(b.ficha||{})};G.forEach(([,L])=>L.forEach(([k,,col])=>{if(col)p[k]=o[k];else fi[k]=o[k]}));p.ficha=fi;safe(()=>updBarco(p),"Ficha guardada")})}
function addItem(){dialog("Punto de revisión",[{k:"texto",l:"Qué revisar",full:1,req:1},{k:"ayuda",l:"Cómo o dónde",full:1}],null,o=>{const mx=Math.max(0,...S.items.map(i=>+i.orden||0));safe(()=>put("rev_items",{texto:o.texto,ayuda:o.ayuda,orden:mx+1,activo:true}),"Punto añadido")})}
async function startReal(){safe(async()=>{await ensureMaq();
  if(!S.items.length){const L=[["Nivel de aceite de motores y planta","Con varilla, en frío"],["Refrigerante y correas","Nivel, tensión y grietas"],["Filtros Racor sin agua","Revisar la copa y purgar"],["Sentinas secas y bombas de achique","Probar cada bomba y su automático"],["Baterías y cargador","Voltaje y bornes"],["Tomas de mar y prensaestopas","Sin goteo"],["Agua dulce y desalinizadora","Nivel y prefiltros"],["Seguridad: chalecos, extintores, bengalas","Cantidad y fechas"],["Amarras, defensas y ancla","Desgaste y molinete"],["Lavado con agua dulce","Después de cada salida"]];
    for(let i=0;i<L.length;i++)await put("rev_items",{texto:L[i][0],ayuda:L[i][1],orden:i+1,activo:true})}
  hours()},"Listo. Registra las horas actuales.")}
function setRev(w,iid,p){const cur=JSON.parse(JSON.stringify(S.rev[w]||{items:{}}));cur.items=cur.items||{};cur.items[iid]={...(cur.items[iid]||{}),...p};safe(()=>put("revisiones",{...cur,semana:w}))}
let armed=null;
function armDelete(btn){const[c,id]=btn.dataset.del.split("/");if(ROL==="tripulacion"){toast("Solo el capitán o el dueño pueden eliminar.");return}
  if(armed===btn){armed=null;safe(async()=>{await remove(c,id);if(c==="entradas"){const g=S.gastos.find(x=>x.entradaId===id);if(g)await remove("gastos",g.id)}
    if(c==="viajes"){for(const g of S.gastos.filter(x=>x.viajeId===id))await patch("gastos",g.id,{viajeId:""});for(const e of S.entradas.filter(x=>x.viajeId===id))await patch("entradas",e.id,{viajeId:""})}},"Eliminado");return}
  if(armed)armed.textContent="Eliminar";armed=btn;btn.textContent="¿Eliminar? Toca otra vez";setTimeout(()=>{if(armed===btn){btn.textContent="Eliminar";armed=null}},4000)}
function sheet(){const A=[["zarpe",ICON.zarpe,realOpen()?"Llegada":"Zarpe",realOpen()?"Cerrar el viaje en curso":"Salida con horómetros"],["fuel",ICON.fuel,"Combustible","Litros y costo"],["gasto",ICON.gasto,"Gasto","Recibo o pago"],["wash",ICON.agua,"Lavado","Con hora de secado"],["hours",ICON.horas,"Horas","Lectura de horómetro"],["pieza",ICON.pieza,"Cambio de pieza","Con fecha y foto"],["nov",ICON.nov,"Novedad","Algo que revisar"],["entry",ICON.log,"Nota","Navegación u otro"],["tema",ICON.tema,"Tema","Pregunta o problema"]];
  $("#sheetBody").innerHTML=A.map(([k,ic,l,s])=>`<button class="qa" value="cancel" data-act="${k}">${ic}<span>${l}<small>${s}</small></span></button>`).join("");$("#sheet").showModal()}
async function excel(){const XLSX=await import("xlsx").catch(()=>null);if(!XLSX){toast("Necesitas conexión para exportar.");return}const R=S;
  const wb=XLSX.utils.book_new();const add=(name,rows)=>XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows.length?rows:[{"Sin datos":""}]),name);
  add("Viajes",R.viajes.map(v=>{const t=tripStats(v);return{Zarpe:v.zarpe,Llegada:v.llegada||"","N.º de zarpe":v.numeroZarpe||"",Desde:v.origen||"",Destino:v.destino,Tipo:v.tipo||"",Documentos:(v.documentos||[]).map(d=>d.nombre).join(", "),Cliente:v.cliente||"",Personas:v.personas??"",Millas:v.millas??"","Horas motor":t.motor,"Combustible (L)":t.litros,"Gastos (USD)":t.gasto,"Ingreso (USD)":t.ingreso,"Resultado (USD)":t.res}}));
  add("Bitácora",R.entradas.map(e=>({Fecha:e.fecha,Hora:e.hora||"",Tipo:e.tipo,"Qué pasó":e.titulo,Detalle:e.detalle||"",Lugar:e.lugar||"",Litros:e.litros??"","Costo (USD)":e.costo??"",Secado:e.secado||"",Viaje:tripName(e.viajeId)})));
  add("Gastos",R.gastos.map(g=>({Fecha:g.fecha,Concepto:g.concepto,Tipo:g.tipo,"Categoría":g.categoria||"",Proveedor:g.proveedor||"",Pago:g.pago||"",Litros:g.litros??"",Viaje:tripName(g.viajeId),"Monto (USD)":+g.monto||0})));
  const MR=[];R.maquinas.forEach(m=>(m.tareas||[]).forEach(t=>{const s=tstate(m,t);MR.push({"Máquina":m.nombre,Modelo:m.modelo||"",Horas:m.horas,Lectura:m.fecha,Servicio:t.t,"Cada (h)":t.cada,"Último (h)":t.ultimo??"","Faltan (h)":s.rem==null?"":Math.round(s.rem)})}));add("Máquinas",MR);
  add("Mantenimiento por tiempo",R.planes.map(p=>{const s=pstate(p);return{Mantenimiento:p.nombre,Sistema:p.sistema||"",Frecuencia:cadaTxt(p),"Última vez":p.ultimo||"","Próxima":s.next||"",Estado:s.txt,Activo:p.activo===false?"No":"Sí"}}));
  add("Cambios de piezas",R.entradas.filter(e=>e.pieza).sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||"")).map(e=>({Fecha:e.fecha,Equipo:e.equipo||"",Pieza:e.pieza,Notas:e.detalle||"","Costo (USD)":e.costo??"",Foto:e.foto?"Sí":""})));
  add("Certificados",R.venc.map(v=>({Documento:v.nombre,"Número":v.numero||"",Emitido:v.emision||"",Vence:v.vence,"Días":v.vence?daysTo(v.vence):"",Notas:v.nota||""})));
  if(FIN()){add("Trabajos",R.trabajos.map(w=>({Fecha:w.fecha,"Qué se hizo":w.titulo,"Área":w.categoria||"",Proveedor:w.proveedor||"",Lugar:w.lugar||"","Horas motor":w.horas||"",Factura:w.factura||"",Estado:w.estado||"","Monto (USD)":+w.monto||0,Detalle:w.detalle||""})));
    add("Facturas",R.facturas.map(f=>({Fecha:f.fecha,Proveedor:f.proveedor,Documento:f.nombre,"Total (USD)":f.total??"","Saldo (USD)":+f.saldo||0})))}
  add("Temas",R.temas.map(q=>({Fecha:q.fecha,Tipo:q.tipo,Prioridad:PRIO[q.prioridad]||"",Tema:q.texto,Estado:q.estado,"Resolución":q.respuesta||""})));
  add("Radio y navegación",R.equipos.map(q=>({Equipo:q.elemento,Fabricante:q.fabricante||"",Modelo:q.modelo||"",Potencia:q.potencia||"",Frecuencia:q.frecuencia||""})));
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([XLSX.write(wb,{bookType:"xlsx",type:"array"})]));a.download="Bitacora_Cay_Sarah_"+today()+".xlsx";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}

/* ================= eventos ================= */
const ACT={sync:()=>db.sync().then(()=>toast(STATUS.online?"Sincronizado":"Sin señal")),zarpe:()=>realOpen()?closeTrip(realOpen().id):newTrip(),fuel:newFuel,gasto:newGasto,wash:newWash,nov:newNov,entry:newEntry,hours,venc:()=>venc(null),trabajo:()=>trabajo(null),factura:()=>factura(null),tema:()=>tema(null),equipo:()=>equipo(null),fijo:()=>fijo(null),pieza:()=>newCambio(),plan:()=>plan(null),plansug:planSug,notif:pedirAvisos,barco,item:addItem,addmaq:addMaq,defmaq:()=>safe(ensureMaq,"Máquinas creadas"),sheet,start:startReal,xls:excel};
document.addEventListener("click",e=>{const g=e.target.closest("[data-go]");if(g){go(g.dataset.go);return}
  const vw=e.target.closest("[data-view]");if(vw){go(vw.dataset.view);return}
  const c=e.target.closest("[data-tipo]");if(c){fTipo=c.dataset.tipo;render();return}
  const t=e.target.closest("button");if(!t)return;
  if(t.id==="mPrev"){curM=addM(curM,-1);render();return}if(t.id==="mNext"){curM=addM(curM,1);render();return}
  if(t.id==="wPrev"||t.id==="wNext"){const d=new Date(curW+"T00:00:00");d.setDate(d.getDate()+(t.id==="wPrev"?-7:7));curW=iso(d);render();return}
  if(t.id==="bSet"){go("ajustes");return}if(t.id==="fab"){sheet();return}
  if(t.dataset.feq!=null){fEq=t.dataset.feq;render();return}
  if(!db)return;
  if(t.dataset.act){if(t.closest("#sheet"))$("#sheet").close();const f=ACT[t.dataset.act];if(f)f(t.dataset.vid);return}
  if(t.dataset.del)armDelete(t);
  if(t.dataset.eedit)editEntry(t.dataset.eedit);
  if(t.dataset.eres){const en=S.entradas.find(x=>x.id===t.dataset.eres);if(!en)return;safe(()=>patch("entradas",en.id,{resuelta:!en.resuelta}),en.resuelta?"Novedad reabierta":"Novedad resuelta")}
  if(t.dataset.gedit)editGasto(t.dataset.gedit);
  if(t.dataset.qv){qView=t.dataset.qv;render();return}
  if(t.dataset.recibo||t.dataset.file){t.dataset.recibo=t.dataset.recibo||t.dataset.file;}
  if(t.dataset.recibo){const w=window.open("","_blank");db.signedUrl(t.dataset.recibo).then(u=>{if(w)w.location=u;else location.href=u}).catch(()=>{if(w)w.close();toast("El recibo se verá cuando haya señal.")})}
  if(t.dataset.cnew)nuevoAcceso();
  if(t.dataset.ccopy){const c=t.dataset.ccopy;(navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>toast("Código copiado: "+c),()=>toast("Código: "+c))}
  if(t.dataset.crot)rotarAcceso(t.dataset.crot);
  if(t.dataset.cdel)eliminarAcceso(t.dataset.cdel);
  if(t.dataset.mdel)quitarMiembro(t.dataset.mdel);
  if(t.dataset.salir)HOOKS.salir();
  if(t.dataset.cambiar)HOOKS.cambiar();
  if(t.dataset.tclose)closeTrip(t.dataset.tclose);
  if(t.dataset.tedit)editTrip(t.dataset.tedit);
  if(t.dataset.pay){pay(t.dataset.pay)}
  if(t.dataset.fedit)fijo(t.dataset.fedit);
  if(t.dataset.medit)editMaq(t.dataset.medit);
  if(t.dataset.vedit)venc(t.dataset.vedit);
  if(t.dataset.ficha)barco(t.dataset.ficha==="all"?null:+t.dataset.ficha);
  if(t.dataset.wedit)trabajo(t.dataset.wedit);
  if(t.dataset.fcedit)factura(t.dataset.fcedit);
  if(t.dataset.fpay)safe(()=>patch("facturas",t.dataset.fpay,{saldo:0}),"Factura saldada");
  if(t.dataset.qok)resolver(t.dataset.qok);
  if(t.dataset.qre)safe(()=>patch("temas",t.dataset.qre,{estado:"abierto"}),"Tema reabierto");
  if(t.dataset.qed)tema(t.dataset.qed);
  if(t.dataset.qeq)equipo(t.dataset.qeq);
  if(t.dataset.serv){const m=t.dataset.serv;markService(m)}
  if(t.dataset.phecho)planHecho(t.dataset.phecho);
  if(t.dataset.pedit)plan(t.dataset.pedit);
  if(t.dataset.tdoc)addDoc(t.dataset.tdoc);
  if(t.dataset.tdocdel){const[v,i]=t.dataset.tdocdel.split("|");quitarDoc(v,i)}
  if(t.dataset.rv){const[i,v]=t.dataset.rv.split("|");const cur=(revDoc(curW).items||{})[i]||{};setRev(curW,i,{estado:cur.estado===v?"":v})}});
document.addEventListener("change",e=>{const t=e.target;if(t.id==="vYear"){curY=t.value;render()}if(t.dataset&&t.dataset.rn&&db)setRev(curW,t.dataset.rn,{nota:t.value.trim()})});
document.addEventListener("input",e=>{if(e.target.id==="fq"){log.q=e.target.value;const pos=e.target.selectionStart;render();const f=$("#fq");f.focus();try{f.setSelectionRange(pos,pos)}catch(_){}}});



/* ================= avisos en el teléfono =================
   Una vez al día por cada mantenimiento, servicio o papel que se acerca o venció.
   Se calculan en el teléfono al abrir la app o al sincronizar. */
const puedeAvisar=()=>"Notification" in window;
const avisosOn=()=>puedeAvisar()&&Notification.permission==="granted";
async function pedirAvisos(){if(!puedeAvisar()){toast("Este navegador no permite avisos. En iPhone, primero agrega la app a la pantalla de inicio.");return}
  const r=await Notification.requestPermission();if(r==="granted"){toast("Avisos activados en este teléfono");avisar()}else toast("Avisos desactivados. Se pueden activar en los ajustes del teléfono.");render()}
let avisando=false;
async function avisar(){if(avisando||!avisosOn()||!S.ready)return;avisando=true;
  try{const hoy=today();let st={};try{st=JSON.parse(localStorage.getItem("cs_avisos")||"{}")}catch(e){}if(st.dia!==hoy)st={dia:hoy,k:[]};
    const A=alerts().filter(a=>a.c&&["Mantenimiento","Servicio","Papeles"].includes(a.e));const N=A.filter(a=>!st.k.includes(a.k||a.t));if(!N.length)return;
    const reg=navigator.serviceWorker?await navigator.serviceWorker.getRegistration().catch(()=>null):null;
    const show=(t,body,tag)=>reg?reg.showNotification(t,{body,tag,icon:"/icon-192.png",badge:"/icon-192.png",data:{url:"/"}}):new Notification(t,{body,tag,icon:"/icon-192.png"});
    if(N.length>2)await show("Cay Sarah: "+N.length+" mantenimientos por atender",N.slice(0,4).map(a=>a.t).join(" · ")+(N.length>4?"…":""),"cs-resumen");
    else for(const a of N)await show(a.t,a.d,a.k||a.t);
    st.k.push(...N.map(a=>a.k||a.t));localStorage.setItem("cs_avisos",JSON.stringify(st))}catch(e){console.warn(e)}finally{avisando=false}}

/* ================= recibos y equipo ================= */
async function comprimir(file){try{const img=await createImageBitmap(file);const k=Math.min(1,1600/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext("2d").drawImage(img,0,0,c.width,c.height);return await new Promise(r=>c.toBlob(b=>r(b||file),"image/jpeg",.8))}catch(e){return file}}
async function subirArchivo(file,dir){const img=/^image\//.test(file.type);const blob=img?await comprimir(file):file;const ext=img?"jpg":(file.name.split(".").pop()||"pdf").toLowerCase().replace(/[^a-z0-9]/g,"");const path=S.barco.id+"/"+dir+"/"+newId()+"."+ext;await db.upload(path,blob,img?"image/jpeg":file.type||"application/pdf");return path}
const subirRecibo=file=>subirArchivo(file,"fin");
async function cargarEquipo(){if(ROL!=="dueno"||!navigator.onLine)return;
  const[{data:m},{data:c}]=await Promise.all([supabase.from("miembros").select("*").eq("barco_id",S.barco.id),supabase.from("codigos").select("*").eq("barco_id",S.barco.id).order("created_at")]);
  EQUIPO={miembros:(m||[]).map(x=>({userId:x.user_id,rol:x.rol,nombre:x.nombre,codigoId:x.codigo_id})),codigos:c||[]};render()}
function nuevoAcceso(){if(!navigator.onLine){toast("Necesitas señal para crear accesos.");return}
  dialog("Nuevo acceso",[{k:"puesto",l:"Puesto",full:1,req:1,ph:"Ej. Capitán, Marinero, Tripulación"},{k:"rol",l:"Permisos",t:"select",full:1,o:[{v:"capitan",l:"Capitán: registra todo y ve finanzas"},{v:"tripulacion",l:"Tripulación: registra, sin finanzas"},{v:"dueno",l:"Dueño: acceso total, incluidos los códigos"}]},
  {hint:"Se genera un código de 8 caracteres. Compártelo solo con quien ocupa ese puesto."}],{rol:"capitan"},async o=>{const{data,error}=await supabase.rpc("crear_codigo",{p_barco:S.barco.id,p_puesto:o.puesto,p_rol:o.rol});
  if(error){toast("No se pudo crear: "+error.message);return}toast("Acceso creado. Código: "+(data?.codigo||""));cargarEquipo()},"Crear acceso")}
function rotarAcceso(id){const c=EQUIPO.codigos.find(x=>x.id===id);if(!c)return;if(!navigator.onLine){toast("Necesitas señal para cambiar el código.");return}
  dialog("Cambiar código de "+c.puesto,[{hint:"Se genera un código nuevo y los demás teléfonos que entraron con el actual pierden el acceso al instante"+(c.rol==="dueno"?" (este teléfono sigue dentro)":"")+". Todo lo registrado se queda en el barco."}],{},async()=>{const{data,error}=await supabase.rpc("rotar_codigo",{p_id:id});
  if(error){toast("No se pudo cambiar: "+error.message);return}toast("Nuevo código: "+data);cargarEquipo()},"Cambiar código")}
function eliminarAcceso(id){const c=EQUIPO.codigos.find(x=>x.id===id);if(!c)return;if(!navigator.onLine){toast("Necesitas señal para eliminar accesos.");return}
  dialog("Eliminar acceso "+c.puesto,[{hint:"El código deja de funcionar y quien entró con él pierde el acceso. Lo registrado se queda en el barco."}],{},async()=>{const{error}=await supabase.rpc("eliminar_codigo",{p_id:id});
  toast(error?(/al menos/.test(error.message)?"Debe quedar al menos un acceso de dueño.":"No se pudo eliminar."):"Acceso eliminado");cargarEquipo()},"Eliminar")}
async function quitarMiembro(uid){const{error}=await supabase.from("miembros").delete().eq("barco_id",S.barco.id).eq("user_id",uid);toast(error?"No se pudo quitar.":"Acceso retirado");cargarEquipo()}

function pintarEstado(){const d=$("#sDot"),t=$("#sTxt");if(!d)return;
  if(!STATUS.online){d.className="dot off";t.textContent=STATUS.pending?"Sin señal · "+STATUS.pending+" por enviar":"Sin señal"}
  else if(STATUS.pending){d.className="dot off";t.textContent="Enviando "+STATUS.pending+"…"}
  else{d.className="dot live";t.textContent=STATUS.lastSync?"Sincronizado "+STATUS.lastSync.toLocaleTimeString("es-VE",{hour:"2-digit",minute:"2-digit"}):"Conectado"}}

export async function mount(store, ctx) {
  db = store;
  S = store.S;
  ROL = ctx.rol;
  USER = ctx.user || {};
  HOOKS.salir = ctx.salir;
  HOOKS.cambiar = ctx.cambiar;
  try { const v = localStorage.getItem("cs2_view"); if (v) view = v; } catch (e) {}
  if (view === "fin" && ROL === "tripulacion") view = "hoy";
  let raf = 0;
  ctx.onChange = (_, st) => {
    STATUS = st;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      pintarEstado();
      const a = document.activeElement;
      if (a && (a.id === "fq" || a.dataset?.rn)) return; // no interrumpir mientras escribe
      render();
      setTimeout(avisar,1500);
    });
  };
  render();
  setInterval(() => { if (view === "hoy" && drying()) render(); avisar(); }, 60000);
  setTimeout(avisar, 3000);
  await store.start();
  avisar();
  cargarEquipo();
}
