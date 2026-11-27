// Datos del Manual del Propietario del Aquila 44 (Hangzhou Sino Eagle Yacht, edición 1 jul 2018).
// Transcritos de las fotos del manual. Son datos del modelo: no se editan desde la app.

export const MANUAL = {
  titulo: "Aquila 44 · Manual del propietario",
  fuente: "Hangzhou Sino Eagle Yacht Co., Ltd. · edición 1 jul 2018",

  // Ficha del fabricante (ISO 8666). [etiqueta, valor]
  specs: [
    ["Dimensiones", [
      ["Eslora máxima", "13,32 m"], ["Eslora en flotación", "12,09 m"],
      ["Manga máxima", "6,56 m"], ["Manga de cada casco", "2,04 m"], ["Separación entre ejes de cascos", "4,26 m"],
      ["Puntal máximo", "2,76 m"], ["Francobordo proa / medio / popa", "2,07 / 1,94 / 0,43 m"],
      ["Calado máximo (cargado)", "1,10 m"], ["Altura sobre el agua (sin antenas)", "5,9 m"]]],
    ["Pesos y carga", [
      ["Desplazamiento en rosca (LCC)", "15.900 kg"], ["Mínimo de operación (MOC)", "16.230 kg"],
      ["Cargado (LDC)", "18.535 kg"], ["Carga máxima", "2.635 kg"], ["Inmersión", "340 kg/cm"],
      ["Categoría de diseño", "A «Océano» · 8 personas"],
      ["Placa del astillero (A / B / C / D)", "8 / 8 / 14 / 20 personas · 920 / 920 / 1.430 / 1.940 kg"]]],
    ["Motores", [
      ["Motores", "2 × Volvo Penta D4-225 (opción D4-260 / D4-300)"],
      ["Potencia D4-225", "127 kW (170 hp) a 3.500 rpm"], ["Potencia D4-260/300", "164 kW (220 hp) a 3.500 rpm"],
      ["Peso en seco", "301 kg cada uno"], ["Potencia máxima admitida", "2 × 243 kW"],
      ["Velocidad máxima de diseño (cargado)", "23 nudos"]]],
    ["Tanques", [
      ["Combustible", "2 × 550 L (babor y estribor) · 1.100 L"], ["Reserva recomendada", "20 % · unos 220 L"],
      ["Agua dulce", "2 × 390 L (babor y estribor) · 780 L"], ["Calentador de agua", "2 × 60 L"],
      ["Aguas negras", "80 L por baño (3 o 4 según cabinas)"]]],
    ["Electricidad", [
      ["Baterías de motor", "2 × 100 Ah 12 V (plomo-ácido)"], ["Batería de planta", "1 × 100 Ah 12 V (plomo-ácido)"],
      ["Banco de servicio", "4 × 200 Ah 12 V (AGM)"], ["Tablero principal", "Salón, banda de estribor, tras puerta de metacrilato · 110/230 VAC y 12 VDC"],
      ["Cajas de fusibles", "Servicio 12 V (con interruptor), motores 12 V, planta 12 V"]]],
    ["Achique", [
      ["Bombas eléctricas", "Super Sub 1100 (SS1212) en salas de máquinas y cascos de proa, con interruptor de nivel"],
      ["Bombas manuales", "Compac 50 (BP0350), hasta 35 L/min: camarotes de proa y cofre del cockpit; válvula de 3 vías para elegir sala de máquinas"]]],
    ["Seguridad", [
      ["Balsa salvavidas", "En el fly (ver plano del manual)"],
      ["Extintores", "A menos de 5 m del centro de cada litera y a menos de 2 m del puerto de incendio del motor"],
      ["Salas de máquinas", "Extinción fija automática con alarma en el puesto de gobierno"],
      ["Acceso a motores", "Escotilla en el piso del cockpit"]]],
  ],

  // Antes de cada salida (cap. 3, 8 y 9 del manual)
  prezarpe: [
    "Revisar el inventario del equipo de seguridad",
    "Cerrar escotillas y portillos de cubierta",
    "Revisar baterías y sistema de carga",
    "Combustible suficiente, dejando 20 % de reserva",
    "Abrir la válvula de combustible y la toma de mar del motor",
    "Encender los interruptores de baterías",
    "Arrancar con la marcha en neutro",
    "Al anclar: dejar al menos 3 veces la profundidad en cadena y el motor encendido mientras trabaja el molinete",
  ],

  // Incendio en la sala de máquinas (cap. 3)
  incendio: [
    "Parar el motor",
    "Cortar la corriente, cerrar el combustible y la ventilación de la sala",
    "El extintor automático se activa",
    "Esperar un minuto",
    "Abrir la escotilla para reparar, con un extintor a mano por si se reaviva",
  ],

  // Reglas que conviene tener a la vista
  reglas: [
    "No descargar aguas negras a menos de 12 millas de la costa",
    "Nunca llenar agua y combustible al mismo tiempo, ni repostar con el motor encendido",
    "No descargar las baterías más del 70 % de su capacidad",
    "No dejar el barco solo con el sistema eléctrico encendido (salvo achique automático y alarmas)",
    "No dejar el cable de puerto colgando en el agua; conectarlo primero al barco y desconectarlo primero del muelle",
    "Nunca arrancar los motores con el barco en seco",
    "No usar solventes ni hidrolavadora en casco y cubierta; no usar cloro en el acero inoxidable",
    "No cargar de forma permanente la extensión del espejo de popa (por ejemplo, una moto de agua)",
    "Las bombas de achique sacan agua de rociones o filtraciones, no de una vía de agua por daño",
  ],

  // Pasacascos (cap. 4)
  pasacascos: [
    "Toma de mar refrigeración motor · 2\"", "Escape seco del motor (bypass) · 3\"",
    "Toma de mar refrigeración aire acondicionado · 1 ½\"", "Salida agua aire acondicionado · 1\"",
    "Toma de mar desalinizadora · 1\"", "Salida rechazo desalinizadora · ¾\"",
    "Toma de mar refrigeración planta · 1 ½\"", "Escape húmedo de la planta · 1 ½\"", "Escape seco de la planta · 2\"",
    "Aguas grises (cocina y baños) · 1\"", "Aguas negras · 1 ½\" (debe poder cerrarse)",
    "Salida de lavadora · 1 ½\"", "Salidas de achique · 1\"",
  ],
};

// Mantenimiento por tiempo indicado en el manual.
// [nombre, sistema, cada, unidad, avisar con días, nota]
export const PLAN_MANUAL = [
  ["Combustible: cambiar el prefiltro (primera etapa)", "Combustible", 12, "meses", 30, "Manual: al menos una vez al año. El filtro fino del motor va según el manual de Volvo Penta."],
  ["Combustible: purgar agua del decantador", "Combustible", 3, "meses", 7, "Manual: varias veces al año. Aflojar (sin quitar) el tornillo de la base hasta que salga combustible limpio."],
  ["Combustible: revisión de mangueras y válvulas", "Combustible", 12, "meses", 30, "Manual: cada año, con un profesional."],
  ["Tanques de combustible: limpieza de lodos", "Combustible", 5, "anios", 60, "Manual: cada cinco años."],
  ["Instalación eléctrica: inspección por técnico", "Eléctrico", 2, "anios", 30, "Manual: al menos cada dos años."],
  ["Baterías de motor y planta: electrolito y bornes", "Eléctrico", 1, "meses", 7, "Manual: revisar electrolito (agua destilada) y proteger bornes con vaselina."],
  ["Tomas de mar y válvulas: estanqueidad y funcionamiento", "Casco y propulsión", 3, "meses", 7, "Manual: revisar con regularidad; cepillar el filtro de la toma del motor cada vez que el barco esté amarrado."],
  ["Dirección: apriete y engrase", "Propulsión y gobierno", 6, "meses", 15, "Manual: revisar el apriete y lubricar todos los elementos con regularidad."],
  ["Cables de acelerador y embrague: engrase", "Propulsión y gobierno", 6, "meses", 15, "Manual: lubricar separadores y horquillas."],
  ["Extinción fija de salas de máquinas: revisión", "Seguridad", 12, "meses", 30, "Manual: recargar o reemplazar al vencer o tras descargarse."],
  ["Acero inoxidable: limpieza y pulido", "Cubierta", 3, "meses", 7, "Manual: de una a cuatro veces al año, con agua dulce y jabón suave."],
  ["Poleas, winches y rieles: engrase", "Cubierta", 6, "meses", 15, "Manual: grasa repelente al agua con regularidad."],
];
