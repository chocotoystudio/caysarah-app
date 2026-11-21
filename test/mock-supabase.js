// Supabase falso en memoria, solo para pruebas visuales locales (no se publica).
const DB = { barcos: [{ id: "b0000000-0000-4000-8000-000000000001", nombre: "Cay Sarah", modelo: "Aquila 44", puerto: "Puerto La Cruz", capitan: "Victor Narváez", ficha: { anio: "2019", color: "Blanco", matricula: "AGSP-XXXX" } }] };
const user = { id: "u1", email: "", is_anonymous: true };
DB.codigos = [
  { id: "c1", barco_id: DB.barcos[0].id, puesto: "Dueño", rol: "dueno", codigo: "V9WA-MAF7", rotado_at: "2026-11-21T10:00:00Z" },
  { id: "c2", barco_id: DB.barcos[0].id, puesto: "Capitán", rol: "capitan", codigo: "594H-ADCQ", rotado_at: "2026-11-21T10:00:00Z" },
  { id: "c3", barco_id: DB.barcos[0].id, puesto: "Tripulación", rol: "tripulacion", codigo: "PFCX-QS7Y", rotado_at: "2026-11-21T10:00:00Z" },
];
const q = (t) => {
  const st = { t, f: [], op: "select" };
  const api = {
    select() { return api; }, eq(k, v) { st.f.push((r) => r[k] === v); return api; }, gt(k, v) { st.f.push((r) => r[k] > v); return api; },
    order() { return api; }, limit() { return api; },
    maybeSingle() { st.single = true; return api; },
    upsert(row) { const L = (DB[t] ||= []); const r = { ...row, updated_at: new Date().toISOString() }; const i = L.findIndex((x) => x.id === r.id); i >= 0 ? (L[i] = { ...L[i], ...r }) : L.push(r); return Promise.resolve({ error: null }); },
    update(p) { st.op = "update"; st.p = p; return api; },
    then(res, rej) {
      if (t === "miembros") return Promise.resolve({ data: [{ rol: window.__ROL || "dueno", nombre: "Luis", user_id: "u1", codigo_id: "c1", barcos: DB.barcos[0] }, { rol: "capitan", nombre: "Victor", user_id: "u2", codigo_id: "c2", barcos: DB.barcos[0] }, { rol: "tripulacion", nombre: "José", user_id: "u3", codigo_id: "c3", barcos: DB.barcos[0] }].filter((r) => st.f.every((f) => f({ ...r, barco_id: DB.barcos[0].id }))), error: null }).then(res, rej);
      let L = (DB[t] || []).filter((r) => st.f.every((f) => f(r)));
      if (st.op === "update") { L.forEach((r) => Object.assign(r, st.p)); return Promise.resolve({ error: null }).then(res, rej); }
      return Promise.resolve({ data: st.single ? L[0] || null : L, error: null }).then(res, rej);
    },
  };
  return api;
};
export const configured = true;
export const supabase = {
  auth: { getSession: async () => ({ data: { session: window.__NOSESSION ? null : { user } } }), onAuthStateChange() {}, signOut: async () => {} },
  from: q, rpc: async () => ({ data: 0, error: null }),
  channel() { const c = { on() { return c; }, subscribe() { return c; } }; return c; }, removeChannel() {},
  storage: { from: () => ({ upload: async () => ({ error: null }), createSignedUrl: async () => ({ data: { signedUrl: "about:blank" } }) }) },
};
