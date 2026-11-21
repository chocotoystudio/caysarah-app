// Arranque: sesión por correo (código de 6 dígitos o enlace), elección de barco y montaje de la app.
import "./styles.css";
import { supabase, configured } from "./supabase.js";
import { createStore } from "./store.js";
import { registerSW } from "virtual:pwa-register";

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
  if (!data.session) return login();
  return elegirBarco(data.session.user);
}

function login(email = "") {
  screen(`<span class="eyebrow">Bitácora de a bordo</span><h1>Entrar</h1>
    <p>Escribe tu correo. Te enviaremos un código para entrar, sin contraseña.</p>
    <form id="fMail" class="gf"><label for="em">Correo</label><input id="em" type="email" required autocomplete="email" inputmode="email" value="${esc(email)}" placeholder="capitan@correo.com">
    <button class="btn pri" type="submit">Enviarme el código</button><p class="err" id="err" hidden></p></form>`);
  $("#fMail").onsubmit = async (e) => {
    e.preventDefault();
    const em = $("#em").value.trim().toLowerCase();
    const b = e.submitter;
    b.disabled = true;
    b.textContent = "Enviando…";
    const { error } = await supabase.auth.signInWithOtp({ email: em, options: { emailRedirectTo: location.origin + location.pathname } });
    if (error) {
      $("#err").hidden = false;
      $("#err").textContent = /rate/i.test(error.message) ? "Espera un minuto antes de pedir otro código." : "No se pudo enviar el correo: " + error.message;
      b.disabled = false;
      b.textContent = "Enviarme el código";
      return;
    }
    codigo(em);
  };
}

function codigo(em) {
  screen(`<span class="eyebrow">Revisa tu correo</span><h1>Escribe el código</h1>
    <p>Lo enviamos a <b>${esc(em)}</b>. También puedes tocar el enlace del correo desde este mismo teléfono.</p>
    <form id="fCode" class="gf"><label for="cd">Código</label><input id="cd" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,8}" maxlength="8" required placeholder="123456">
    <button class="btn pri" type="submit">Entrar</button><p class="err" id="err" hidden></p>
    <button class="link" type="button" id="otro">Usar otro correo</button></form>`);
  $("#otro").onclick = () => login(em);
  $("#fCode").onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.verifyOtp({ email: em, token: $("#cd").value.trim(), type: "email" });
    if (error) {
      $("#err").hidden = false;
      $("#err").textContent = "El código no es válido o ya venció. Pide uno nuevo.";
      return;
    }
    elegirBarco(data.user);
  };
}

async function salir() {
  await supabase.auth.signOut();
  try { localStorage.removeItem(LAST); } catch (e) {}
  location.reload();
}

async function elegirBarco(user, forzar = false) {
  let lista = null;
  if (navigator.onLine) {
    await supabase.rpc("aceptar_invitaciones");
    const { data, error } = await supabase.from("miembros").select("rol, barcos(*)").eq("user_id", user.id);
    if (!error) {
      lista = data.filter((m) => m.barcos).map((m) => ({ ...m.barcos, rol: m.rol }));
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
    screen(`<span class="eyebrow">${esc(user.email)}</span><h1>Aún no tienes un barco</h1>
      <p>Si eres capitán o tripulante, pide al dueño que te invite con este correo y vuelve a entrar.</p>
      <p>Si eres el dueño, crea la bitácora de tu barco:</p>
      <form id="fNew" class="gf"><label for="bn">Nombre del barco</label><input id="bn" required value="Cay Sarah">
      <button class="btn pri" type="submit">Crear bitácora</button><p class="err" id="err" hidden></p></form>
      <button class="link" id="out">Cerrar sesión</button>`);
    $("#out").onclick = salir;
    $("#fNew").onsubmit = async (e) => {
      e.preventDefault();
      const { error } = await supabase.rpc("crear_barco", { p_nombre: $("#bn").value.trim(), p_puerto: "Puerto La Cruz" });
      if (error) {
        $("#err").hidden = false;
        $("#err").textContent = "No se pudo crear: " + error.message;
        return;
      }
      elegirBarco(user, false);
    };
    return;
  }
  screen(`<span class="eyebrow">${esc(user.email)}</span><h1>Elige el barco</h1><div class="blist">${lista
    .map((b) => `<button class="qa" data-b="${esc(b.id)}"><span>${esc(b.nombre)}<small>${ROLES[b.rol] || b.rol}${b.puerto ? " · " + esc(b.puerto) : ""}</small></span></button>`)
    .join("")}</div><button class="link" id="out">Cerrar sesión</button>`);
  $("#out").onclick = salir;
  document.querySelectorAll("[data-b]").forEach((x) => (x.onclick = () => abrir(user, lista.find((b) => b.id === x.dataset.b))));
}

async function abrir(user, barco) {
  try { localStorage.setItem(LAST, barco.id); } catch (e) {}
  document.body.classList.remove("gate");
  $("#gate").hidden = true;
  const ctx = { rol: barco.rol, user: { id: user.id, email: user.email }, salir, cambiar: () => { try { localStorage.removeItem(LAST); } catch (e) {} location.reload(); } };
  const store = createStore(barco, (S, st) => ctx.onChange && ctx.onChange(S, st));
  const { mount } = await import("./app.js");
  await mount(store, ctx);
}

supabase?.auth.onAuthStateChange((ev, session) => {
  if (ev === "SIGNED_IN" && session && !$("#gate").hidden && document.body.classList.contains("gate") && location.hash.includes("access_token")) elegirBarco(session.user);
});
