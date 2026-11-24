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


## Acceso por código (sin correo)

Todos entran con el código de su puesto (Dueño, Capitán, Tripulación). El teléfono abre una sesión anónima de Supabase y la canjea por acceso al barco con `canjear_codigo`.

- Requiere activar **Allow anonymous sign-ins** en Authentication › Sign In / Providers.
- El dueño crea, cambia o elimina códigos en Ajustes › Accesos del equipo. Al cambiar un código, los teléfonos que entraron con el anterior pierden el acceso y la app borra los datos guardados en ellos.
- Los datos pertenecen al barco, no a la persona.
- Si se pierde el código de dueño: en el SQL Editor, `select puesto, codigo from codigos;`

## Mantenimiento por tiempo, piezas y zarpes (migración 0003)

Ejecutar `supabase/migrations/0003_zarpe_piezas_planes.sql` **antes** de publicar esta versión: agrega columnas a `viajes` y `entradas` y la tabla `planes`.

- **Zarpe**: tipo de salida *Préstamo*, número de zarpe, desde → hacia y documentos (zarpe, listas, despacho…) guardados en el viaje.
- **Cambios de piezas**: fecha, equipo, pieza, costo y foto. Aparecen en Mantenimiento › Cambios de piezas, filtrables por equipo, y en la Bitácora.
- **Mantenimiento por tiempo** (`planes`): cada N días, semanas, meses o años desde la última vez. «Sugeridos» carga un plan de referencia (extintores, aires, balsa, desalinizadora, casco…) que se ajusta a cada fabricante.
- **Avisos**: lo que se acerca o venció sale en Hoy › Atención y, si se activan los avisos del teléfono (Ajustes), como notificación una vez al día al abrir la app.
