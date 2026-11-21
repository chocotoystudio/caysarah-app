# Cay Sarah · Bitácora

App instalable (PWA) de a bordo del catamarán Cay Sarah (Aquila 44): viajes, mantenimiento por horas, finanzas, ficha del barco, certificados, trabajos, facturas y bitácora. Funciona sin señal y sincroniza al volver la conexión.

## Stack
- Vite + JavaScript, vite-plugin-pwa (offline e instalable)
- Supabase: Postgres con RLS por barco y rol, acceso por correo (código de 6 dígitos o enlace), Storage para recibos y certificados, Realtime
- Copia local en IndexedDB + cola de cambios (`src/store.js`)

## Roles
| Rol | Puede |
|---|---|
| Dueño | Todo, incluidas finanzas e invitar personas |
| Capitán | Operación, gastos, trabajos, facturas, borrar |
| Tripulación | Registrar viajes, horas, bitácora, gastos propios y temas. No ve finanzas ni borra |

## Puesta en marcha
1. Crear un proyecto Supabase y ejecutar `supabase/migrations/0001_init.sql` en el SQL Editor.
2. En Authentication > Email, habilitar OTP. En la plantilla "Magic Link" incluir `{{ .Token }}` para que llegue el código.
3. En Authentication > URL Configuration, poner la URL de producción (p. ej. `https://app.caysarah.com`).
4. Copiar `.env.example` a `.env.local` con la URL y la clave publicable.
5. `npm install && npm run dev`

## Publicar (Vercel)
Importar el repositorio, framework Vite, y definir `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Dominio: `app.caysarah.com` con un CNAME en GoDaddy hacia el destino que indique Vercel.
