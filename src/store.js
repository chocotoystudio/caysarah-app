// Datos de la bitácora: copia local en el teléfono (IndexedDB) + cola de cambios que se envía
// a Supabase cuando hay señal. Así el capitán registra en alta mar y todo sincroniza al volver.
import { get, set } from "idb-keyval";
import { supabase } from "./supabase.js";

export const TABLES = ["maquinas", "lecturas", "viajes", "entradas", "gastos", "fijos", "vencimientos", "rev_items", "revisiones", "trabajos", "facturas", "temas", "equipos"];
// nombre de la tabla -> clave en el estado de la app
const KEY = { vencimientos: "venc", rev_items: "items" };
const keyOf = (t) => KEY[t] || t;
// filas únicas por algo distinto del id (dos teléfonos sin señal podrían crear la misma)
const CONFLICT = { maquinas: "barco_id,clave", revisiones: "barco_id,semana" };

const COLS = {"maquinas": ["id", "barco_id", "clave", "nombre", "modelo", "serial", "nota", "orden", "horas", "fecha", "tareas", "borrado", "updated_at", "autor"], "lecturas": ["id", "barco_id", "fecha", "maquina", "horas", "nota", "borrado", "updated_at", "autor"], "viajes": ["id", "barco_id", "destino", "tipo", "cliente", "personas", "ingreso", "zarpe", "hora_zarpe", "llegada", "millas", "hz", "hl", "estado", "notas", "borrado", "updated_at", "autor"], "entradas": ["id", "barco_id", "fecha", "hora", "tipo", "titulo", "detalle", "lugar", "litros", "costo", "viaje_id", "resuelta", "zona", "h_ini", "h_fin", "secado", "foto", "borrado", "updated_at", "autor"], "gastos": ["id", "barco_id", "fecha", "concepto", "tipo", "categoria", "monto", "litros", "proveedor", "pago", "nota", "viaje_id", "entrada_id", "fijo_id", "recibo", "borrado", "updated_at", "autor"], "fijos": ["id", "barco_id", "concepto", "monto", "frecuencia", "dia", "mes_pago", "categoria", "proveedor", "activo", "borrado", "updated_at", "autor"], "vencimientos": ["id", "barco_id", "nombre", "numero", "emision", "vence", "aviso", "nota", "archivo", "borrado", "updated_at", "autor"], "rev_items": ["id", "barco_id", "texto", "ayuda", "orden", "activo", "borrado", "updated_at", "autor"], "revisiones": ["id", "barco_id", "semana", "items", "borrado", "updated_at", "autor"], "trabajos": ["id", "barco_id", "fecha", "titulo", "categoria", "proveedor", "lugar", "horas", "factura", "estado", "monto", "detalle", "borrado", "updated_at", "autor"], "facturas": ["id", "barco_id", "fecha", "proveedor", "nombre", "total", "saldo", "trabajo_id", "archivo", "nota", "borrado", "updated_at", "autor"], "temas": ["id", "barco_id", "fecha", "tipo", "prioridad", "texto", "estado", "respuesta", "resuelto", "borrado", "updated_at", "autor"], "equipos": ["id", "barco_id", "elemento", "fabricante", "modelo", "potencia", "frecuencia", "orden", "borrado", "updated_at", "autor"], "barcos": ["id", "nombre", "modelo", "puerto", "capitan", "motores", "planta", "aceite", "racor", "combustible", "desal", "tender", "marinero", "ficha", "creado_por", "created_at", "updated_at"]};
const snake = (k) => k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
const camel = (k) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const toDb = (o, t) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith("_") && (!t || COLS[t].includes(snake(k)))).map(([k, v]) => [snake(k), v === "" ? null : v]));
const fromDb = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [camel(k), v == null && /^(fecha|zarpe|llegada|vence|emision|resuelto)$/.test(camel(k)) ? "" : v]));

export const newId = () => (crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));

export function createStore(barco, onChange) {
  const B = barco.id;
  const S = { viajes: [], entradas: [], gastos: [], fijos: [], maquinas: [], lecturas: [], venc: [], items: [], rev: {}, trabajos: [], facturas: [], temas: [], equipos: [], barco: { ...barco }, ready: false };
  const rows = {}; // tabla -> Map(id -> fila completa, incluidas las borradas)
  let outbox = [];
  let since = {};
  let flushing = false;
  let status = { online: navigator.onLine, pending: 0, lastSync: null, error: null };
  const k = (s) => `cs:${B}:${s}`;

  function rebuild(t) {
    const live = [...rows[t].values()].filter((r) => !r.borrado);
    if (t === "revisiones") {
      const R = {};
      live.forEach((r) => (R[r.semana] = r));
      S.rev = R;
    } else S[keyOf(t)] = live;
  }
  const emit = () => {
    status.pending = outbox.length;
    onChange(S, status);
  };
  const saveLocal = async (t) => {
    try {
      await set(k(t), [...rows[t].values()]);
    } catch (e) {
      console.warn(e);
    }
  };
  const saveOutbox = async () => {
    try {
      await set(k("outbox"), outbox);
    } catch (e) {
      console.warn(e);
    }
  };

  function merge(t, list) {
    const pend = new Set(outbox.filter((o) => o.table === t).map((o) => o.row?.id));
    for (const raw of list) {
      const r = fromDb(raw);
      if (pend.has(r.id)) continue; // mi cambio local manda hasta que suba
      if (t === "maquinas" || t === "revisiones") {
        // si existe una fila local con la misma clave y otro id, la reemplaza la del servidor
        const f = t === "maquinas" ? "clave" : "semana";
        for (const [id, x] of rows[t]) if (x[f] === r[f] && id !== r.id) rows[t].delete(id);
      }
      rows[t].set(r.id, r);
    }
    rebuild(t);
  }

  async function load() {
    for (const t of TABLES) {
      rows[t] = new Map();
      try {
        const L = (await get(k(t))) || [];
        L.forEach((r) => rows[t].set(r.id, r));
      } catch (e) {}
      rebuild(t);
    }
    try {
      outbox = (await get(k("outbox"))) || [];
      since = (await get(k("since"))) || {};
      const b = await get(k("barco"));
      if (b) S.barco = { ...S.barco, ...b };
    } catch (e) {}
    S.ready = true;
    emit();
  }

  async function pull() {
    for (const t of TABLES) {
      let q = supabase.from(t).select("*").eq("barco_id", B).order("updated_at", { ascending: true }).limit(1000);
      if (since[t]) q = q.gt("updated_at", since[t]);
      const { data, error } = await q;
      if (error) throw error;
      if (data.length) {
        merge(t, data);
        since[t] = data[data.length - 1].updated_at;
        await saveLocal(t);
      }
    }
    const { data: b } = await supabase.from("barcos").select("*").eq("id", B).maybeSingle();
    if (b) {
      S.barco = fromDb(b);
      await set(k("barco"), S.barco);
    }
    await set(k("since"), since);
  }

  async function flush() {
    if (flushing || !navigator.onLine) return;
    flushing = true;
    try {
      while (outbox.length) {
        const o = outbox[0];
        let error = null;
        if (o.op === "upsert") {
          ({ error } = await supabase.from(o.table).upsert(toDb(o.row, o.table), CONFLICT[o.table] ? { onConflict: CONFLICT[o.table] } : undefined));
        } else if (o.op === "barco") {
          ({ error } = await supabase.from("barcos").update(toDb(o.patch, "barcos")).eq("id", B));
        } else if (o.op === "upload") {
          ({ error } = await supabase.storage.from("recibos").upload(o.path, o.blob, { contentType: o.type || "image/jpeg" }));
          if (error && /exists|duplicate/i.test(error.message || "")) error = null; // ya subido en un intento anterior
        }
        if (error) {
          const net = /fetch|network|Failed to fetch|timeout/i.test(error.message || "") || error.status === 0;
          if (net) throw error;
          // rechazo permanente (permisos, datos inválidos): se descarta para no bloquear la cola
          console.error("Cambio rechazado", o, error);
          status.error = error.code === "42501" ? "Tu rol no permite ese cambio." : "Un cambio no se pudo guardar: " + (error.message || "error");
        }
        outbox.shift();
        await saveOutbox();
        emit();
      }
      status.lastSync = new Date();
    } catch (e) {
      console.warn("Sin conexión, se reintenta luego", e);
    } finally {
      flushing = false;
      emit();
    }
  }

  async function sync() {
    if (!navigator.onLine) return emit();
    try {
      await flush();
      await pull();
      status.lastSync = new Date();
      status.online = true;
    } catch (e) {
      console.warn(e);
    }
    emit();
  }

  let channel = null;
  function live() {
    channel = supabase.channel("barco-" + B);
    for (const t of TABLES)
      channel.on("postgres_changes", { event: "*", schema: "public", table: t, filter: `barco_id=eq.${B}` }, (p) => {
        if (p.new && p.new.id) {
          merge(t, [p.new]);
          saveLocal(t);
          emit();
        }
      });
    channel.subscribe();
  }

  function queue(t, row) {
    rows[t].set(row.id, row);
    rebuild(t);
    outbox.push({ op: "upsert", table: t, row });
    saveLocal(t);
    saveOutbox();
    emit();
    flush();
  }

  const api = {
    S,
    status: () => status,
    async put(t, obj) {
      const row = { ...obj, id: obj.id || newId(), barcoId: B, borrado: false };
      if (t === "maquinas") {
        const ex = [...rows[t].values()].find((m) => m.clave === row.clave && !m.borrado);
        if (ex) row.id = ex.id;
      }
      if (t === "revisiones") {
        const ex = [...rows[t].values()].find((m) => m.semana === row.semana);
        if (ex) row.id = ex.id;
      }
      queue(t, row);
      return row.id;
    },
    async patch(t, id, p) {
      const cur = rows[t].get(id);
      if (!cur) return;
      queue(t, { ...cur, ...p });
    },
    async remove(t, id) {
      const cur = rows[t].get(id);
      if (!cur) return;
      queue(t, { ...cur, borrado: true });
    },
    async updBarco(p) {
      S.barco = { ...S.barco, ...p };
      await set(k("barco"), S.barco);
      outbox.push({ op: "barco", patch: Object.fromEntries(Object.entries(p).filter(([x]) => !["id", "createdAt", "updatedAt", "creadoPor", "rol"].includes(x))) });
      saveOutbox();
      emit();
      flush();
    },
    async upload(path, blob, type) {
      outbox.push({ op: "upload", path, blob, type });
      await saveOutbox();
      emit();
      flush();
    },
    async signedUrl(path) {
      const { data, error } = await supabase.storage.from("recibos").createSignedUrl(path, 600);
      if (error) throw error;
      return data.signedUrl;
    },
    sync,
    async start() {
      await load();
      window.addEventListener("online", () => {
        status.online = true;
        sync();
      });
      window.addEventListener("offline", () => {
        status.online = false;
        emit();
      });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") sync();
      });
      setInterval(sync, 120000);
      live();
      await sync();
    },
    stop() {
      if (channel) supabase.removeChannel(channel);
    },
  };
  return api;
}
