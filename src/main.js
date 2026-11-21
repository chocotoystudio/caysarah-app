// Arranque: cada puesto (dueño, capitán, tripulación) entra con su código, sin correo, elección de barco y montaje de la app.
import "./styles.css";
import { supabase, configured } from "./supabase.js";
import { createStore } from "./store.js";
import { registerSW } from "virtual:pwa-register";
import { clear as idbClear } from "idb-keyval";

registerSW({ immediate: true });

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const LAST = "cs_barco";
const ROLES = { dueno: "Dueño", capitan: "Capitán", tripulacion: "Tripulación" };

function screen(html) {
  document.body.classList.add("gate");
  $("#gate").hidden = false;
  $("#gate .box").innerHTML = html;
}

if (!configured) {
  screen(`<h1>Falta configurar</h1><p>Define <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en el entorno y vuelve a publicar.</p>`);
} else boot();

async function boot() {
  const { data } = await supabase.auth.getSession();
  let aviso = "";
  try { aviso = sessionStorage.getItem("cs_aviso") || ""; sessionStorage.removeItem("cs_aviso"); } catch (e) {}
  if (!data.session) return login(aviso);
  return elegirBarco(data.session.user);
}

function login(aviso = "") {
  screen(`<span class="eyebrow">Bitácora de a bordo</span><h1>Entrar</h1>
    <p>Escribe el código de tu puesto. Te lo da el dueño del barco.</p>
    ${aviso ? `<p class="err">${esc(aviso)}</p>` : ""}
    <form id="fPuesto" class="gf"><label for="pc">Código de acceso</label><input id="pc" required autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" placeholder="XXXX-XXXX" style="text-transform:uppercase;letter-spacing:.12em">
    <label for="pn">Tu nombre</label><input id="pn" required autocomplete="name" placeholder="Ej. Victor Narváez">
    <button class="btn pri" type="submit">Entrar</button><p class="err" id="err" hidden></p></form>`);
  $("#fPuesto").onsubmit = async (e) => {
    e.preventDefault();
    const b = e.submitter, err = $("#err");
    const fallo = (t) => { err.hidden = false; err.textContent = t; b.disabled = false; b.textContent = "Entrar"; };
    if (!navigator.onLine) return fallo("Necesitas señal para entrar la primera vez. Después funciona sin señal.");
    b.disabled = true;
    b.textContent = "Entrando…";
    let { data } = await supabase.auth.getSession();
    if (!data.session) {
      const r = await supabase.auth.signInAnonymously();
      if (r.error) return fallo("No se pudo abrir la sesión: " + r.error.message);
      data = { session: r.data.session };
    }
    const { error } = await supabase.rpc("canjear_codigo", { p_codigo: $("#pc").value, p_nombre: $("#pn").value.trim() });
    if (error) return fallo(/no válido/i.test(error.message) ? "Ese código no existe o ya fue cambiado. Pídele el código vigente al dueño." : "No se pudo entrar: " + error.message);
    elegirBarco(data.session.user);
  };
}

// borra todo lo guardado en el teléfono (datos del barco, cola de cambios y sesión)
async function limpiar() {
  try { await idbClear(); } catch (e) {}
  try { ["cs_barcos", LAST, "cs2_view"].forEach((k) => localStorage.removeItem(k)); } catch (e) {}
}

async function salir() {
  await supabase.auth.signOut();
  await limpiar();
  location.reload();
}

const esAnonimo = (u) => Boolean(u?.is_anonymous);

// acceso retirado: el dueño cambió el código o quitó a la persona. Se borra todo del teléfono.
async function revocado() {
  await supabase.auth.signOut().catch(() => {});
  await limpiar();
  try { sessionStorage.setItem("cs_aviso", "Tu acceso a este barco cambió. Pide el código vigente al dueño."); } catch (e) {}
  location.reload();
}

async function elegirBarco(user, forzar = false) {
  let lista = null;
  if (navigator.onLine) {
    const { data, error } = await supabase.from("miembros").select("rol, nombre, barcos(*)").eq("user_id", user.id);
    if (!error) {
      lista = data.filter((m) => m.barcos).map((m) => ({ ...m.barcos, rol: m.rol, miNombre: m.nombre }));
      try { localStorage.setItem("cs_barcos", JSON.stringify(lista)); } catch (e) {}
    }
  }
  if (!lista) {
    try { lista = JSON.parse(localStorage.getItem("cs_barcos") || "[]"); } catch (e) { lista = []; }
  }
  let last = null;
  try { last = localStorage.getItem(LAST); } catch (e) {}
  const elegido = !forzar && (lista.find((b) => b.id === last) || (lista.length === 1 ? lista[0] : null));
  if (elegido) return abrir(user, elegido);
  if (!lista.length) {
    if (navigator.onLine) return revocado();
    return login("Necesitas señal para comprobar tu acceso.");
  }
  screen(`<span class="eyebrow">${esc(user.email || "")}</span><h1>Elige el barco</h1><div class="blist">${lista
    .map((b) => `<button class="qa" data-b="${esc(b.id)}"><span>${esc(b.nombre)}<small>${ROLES[b.rol] || b.rol}${b.puerto ? " · " + esc(b.puerto) : ""}</small></span></button>`)
    .join("")}</div><button class="link" id="out">Cerrar sesión</button>`);
  $("#out").onclick = salir;
  document.querySelectorAll("[data-b]").forEach((x) => (x.onclick = () => abrir(user, lista.find((b) => b.id === x.dataset.b))));
}

async function abrir(user, barco) {
  try { localStorage.setItem(LAST, barco.id); } catch (e) {}
  document.body.classList.remove("gate");
  $("#gate").hidden = true;
  const ctx = { rol: barco.rol, user: { id: user.id, email: user.email || "", nombre: barco.miNombre || "", anonimo: esAnonimo(user) }, salir, cambiar: () => { try { localStorage.removeItem(LAST); } catch (e) {} location.reload(); } };
  const store = createStore(barco, (S, st) => ctx.onChange && ctx.onChange(S, st));
  const { mount } = await import("./app.js");
  await mount(store, ctx);
  vigilarAcceso(user, barco);
}

// comprueba el acceso al volver a la app, al recuperar señal y cada 5 minutos
function vigilarAcceso(user, barco) {
  const revisar = async () => {
    if (!navigator.onLine || document.hidden) return;
    const { data, error } = await supabase.from("miembros").select("rol").eq("barco_id", barco.id).eq("user_id", user.id);
    if (!error && Array.isArray(data) && data.length === 0) revocado();
  };
  document.addEventListener("visibilitychange", revisar);
  window.addEventListener("online", revisar);
  setInterval(revisar, 5 * 60 * 1000);
}

supabase?.auth.onAuthStateChange((ev, session) => {
  if (ev === "SIGNED_IN" && session && !$("#gate").hidden && document.body.classList.contains("gate") && location.hash.includes("access_token")) elegirBarco(session.user);
});
