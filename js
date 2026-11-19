/**
 * app.js
 * ---------------------------------------------------------------------------
 * Planeador de Comida y Despensa — JavaScript puro (sin frameworks ni librerías)
 * Todo el estado del usuario se guarda en localStorage.
 *
 * Estructura del archivo:
 * 1. Catálogo editable de recetas, precios en MXN y sustitutos económicos
 * 2. Estado de la aplicación y persistencia en localStorage
 * 3. Lógica de generación de menú semanal y cálculo de presupuesto
 * 4. Lógica de lista de compras por tienda y sustitutos
 * 5. Lógica de despensa y sugerencias de recetas por caducidad
 * 6. Renderizado de cada sección en el DOM
 * 7. Eventos e inicialización
 */

/* ==========================================================================
   1. CATÁLOGO DE RECETAS Y PRECIOS DE EJEMPLO (FÁCIL DE EDITAR)
   - Los ingredientes están calculados para 4 porciones (porcionesBase: 4).
   - La aplicación escala cantidades y costos automáticamente según el número
     de personas de la familia.
   - categoriaTienda ayuda a asignar cada ingrediente a las tiendas elegidas:
     "frescos" (Mercado/Tianguis), "proteina", "lacteos", "abarrotes".
   ========================================================================== */

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo"
];

const TIEMPOS_COMIDA = [
  { clave: "desayuno", etiqueta: "Desayuno" },
  { clave: "comida", etiqueta: "Comida" },
  { clave: "cena", etiqueta: "Cena" }
];

const RECETAS_BASE = [
  // ================= DESAYUNOS =================
  {
    id: "huevos-mexicana",
    nombre: "Huevos a la mexicana con frijoles",
    tiempo: "desayuno",
    porcionesBase: 4,
    minutos: 15,
    etiquetas: ["mexicana", "rapido", "economico"],
    alergenos: ["huevo", "picante"],
    pasos: [
      "Pica jitomate, cebolla y chile serrano al gusto.",
      "Sofríe la verdura con un chorrito de aceite por 3 minutos.",
      "Agrega los huevos batidos y revuelve hasta cocer. Sirve con frijoles y tortillas."
    ],
    ingredientes: [
      { nombre: "Huevo", cantidad: 8, unidad: "pzas", precioMXN: 34, categoriaTienda: "abarrotes", diasCaducidad: 14 },
      { nombre: "Jitomate", cantidad: 0.4, unidad: "kg", precioMXN: 14, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Cebolla blanca", cantidad: 0.25, unidad: "kg", precioMXN: 8, categoriaTienda: "frescos", diasCaducidad: 10 },
      { nombre: "Frijol cocido o refrito", cantidad: 0.4, unidad: "kg", precioMXN: 18, categoriaTienda: "abarrotes", diasCaducidad: 5 },
      { nombre: "Tortillas de maíz", cantidad: 0.5, unidad: "kg", precioMXN: 12, categoriaTienda: "frescos", diasCaducidad: 3 }
    ]
  },
  {
    id: "avena-platano",
    nombre: "Avena caliente con plátano y canela",
    tiempo: "desayuno",
    porcionesBase: 4,
    minutos: 12,
    etiquetas: ["economico", "rapido", "vegetariano"],
    alergenos: ["lacteos"],
    pasos: [
      "Calienta agua o leche con una rajita de canela.",
      "Agrega la avena y cocina a fuego bajo 6 minutos moviendo constantemente.",
      "Sirve con plátano en rodajas."
    ],
    ingredientes: [
      { nombre: "Avena en hojuelas", cantidad: 0.25, unidad: "kg", precioMXN: 14, categoriaTienda: "abarrotes", diasCaducidad: 60 },
      { nombre: "Leche", cantidad: 1, unidad: "L", precioMXN: 28, categoriaTienda: "lacteos", diasCaducidad: 5 },
      { nombre: "Plátano tabasco", cantidad: 0.6, unidad: "kg", precioMXN: 16, categoriaTienda: "frescos", diasCaducidad: 3 }
    ]
  },
  {
    id: "chilaquiles-verdes",
    nombre: "Chilaquiles verdes con pollo y queso",
    tiempo: "desayuno",
    porcionesBase: 4,
    minutos: 25,
    etiquetas: ["mexicana", "pollo"],
    alergenos: ["lacteos", "picante"],
    pasos: [
      "Hierve tomate verde, cebolla y cilantro; licúa con sal.",
      "Hierve la salsa 5 minutos y baña los totopos.",
      "Corona con pollo deshebrado y queso panela rallado."
    ],
    ingredientes: [
      { nombre: "Totopos de maíz", cantidad: 0.4, unidad: "kg", precioMXN: 24, categoriaTienda: "abarrotes", diasCaducidad: 20 },
      { nombre: "Tomate verde", cantidad: 0.5, unidad: "kg", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Pechuga de pollo", cantidad: 0.4, unidad: "kg", precioMXN: 56, categoriaTienda: "proteina", diasCaducidad: 2 },
      { nombre: "Queso panela", cantidad: 0.2, unidad: "kg", precioMXN: 34, categoriaTienda: "lacteos", diasCaducidad: 5 },
      { nombre: "Cilantro", cantidad: 1, unidad: "manojo", precioMXN: 8, categoriaTienda: "frescos", diasCaducidad: 2 }
    ]
  },
  {
    id: "molletes-frijol",
    nombre: "Molletes con frijoles y pico de gallo",
    tiempo: "desayuno",
    porcionesBase: 4,
    minutos: 15,
    etiquetas: ["mexicana", "rapido", "economico", "vegetariano"],
    alergenos: ["gluten", "lacteos"],
    pasos: [
      "Parte los bolillos a la mitad y úntalos con frijoles refritos.",
      "Agrega queso y dora en comal tapado o sartén.",
      "Sirve con jitomate y cebolla picados encima."
    ],
    ingredientes: [
      { nombre: "Bolillo", cantidad: 4, unidad: "pzas", precioMXN: 16, categoriaTienda: "frescos", diasCaducidad: 2 },
      { nombre: "Frijol cocido o refrito", cantidad: 0.4, unidad: "kg", precioMXN: 18, categoriaTienda: "abarrotes", diasCaducidad: 5 },
      { nombre: "Queso Oaxaca", cantidad: 0.2, unidad: "kg", precioMXN: 32, categoriaTienda: "lacteos", diasCaducidad: 6 },
      { nombre: "Jitomate", cantidad: 0.3, unidad: "kg", precioMXN: 11, categoriaTienda: "frescos", diasCaducidad: 4 }
    ]
  },
  {
    id: "enfrijoladas-sencillas",
    nombre: "Enfrijoladas con aguacate y cebolla",
    tiempo: "desayuno",
    porcionesBase: 4,
    minutos: 20,
    etiquetas: ["mexicana", "economico", "vegetariano"],
    alergenos: [],
    pasos: [
      "Licúa frijoles con un poco de caldo y calienta la salsa.",
      "Pasa las tortillas calientes por la salsa y dóblalas.",
      "Sirve con rebanadas de aguacate y cebolla."
    ],
    ingredientes: [
      { nombre: "Tortillas de maíz", cantidad: 0.5, unidad: "kg", precioMXN: 12, categoriaTienda: "frescos", diasCaducidad: 3 },
      { nombre: "Frijol cocido o refrito", cantidad: 0.5, unidad: "kg", precioMXN: 22, categoriaTienda: "abarrotes", diasCaducidad: 5 },
      { nombre: "Aguacate", cantidad: 0.4, unidad: "kg", precioMXN: 32, categoriaTienda: "frescos", diasCaducidad: 2 },
      { nombre: "Cebolla blanca", cantidad: 0.2, unidad: "kg", precioMXN: 6, categoriaTienda: "frescos", diasCaducidad: 10 }
    ]
  },
  {
    id: "huevos-espinaca",
    nombre: "Huevos revueltos con espinaca y papa",
    tiempo: "desayuno",
    porcionesBase: 4,
    minutos: 20,
    etiquetas: ["verduras", "economico", "rapido"],
    alergenos: ["huevo"],
    pasos: [
      "Corta la papa en cubos pequeños y sofríe hasta que esté suave.",
      "Agrega las espinacas lavadas y espera a que reduzcan.",
      "Incorpora el huevo y cocina por 4 minutos."
    ],
    ingredientes: [
      { nombre: "Huevo", cantidad: 8, unidad: "pzas", precioMXN: 34, categoriaTienda: "abarrotes", diasCaducidad: 14 },
      { nombre: "Espinaca fresca", cantidad: 1, unidad: "manojo", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 2 },
      { nombre: "Papa blanca", cantidad: 0.4, unidad: "kg", precioMXN: 16, categoriaTienda: "frescos", diasCaducidad: 10 },
      { nombre: "Tortillas de maíz", cantidad: 0.4, unidad: "kg", precioMXN: 10, categoriaTienda: "frescos", diasCaducidad: 3 }
    ]
  },
  {
    id: "licuado-avena-manzana",
    nombre: "Tostadas de aguacate con fruta de temporada",
    tiempo: "desayuno",
    porcionesBase: 4,
    minutos: 10,
    etiquetas: ["rapido", "vegetariano", "verduras"],
    alergenos: [],
    pasos: [
      "Machaca el aguacate con unas gotas de limón y sal.",
      "Unta sobre tostadas horneadas de maíz y acompaña con manzana picada."
    ],
    ingredientes: [
      { nombre: "Tostadas de maíz", cantidad: 1, unidad: "paq", precioMXN: 24, categoriaTienda: "abarrotes", diasCaducidad: 30 },
      { nombre: "Aguacate", cantidad: 0.4, unidad: "kg", precioMXN: 32, categoriaTienda: "frescos", diasCaducidad: 2 },
      { nombre: "Manzana", cantidad: 0.6, unidad: "kg", precioMXN: 26, categoriaTienda: "frescos", diasCaducidad: 6 },
      { nombre: "Limón", cantidad: 0.25, unidad: "kg", precioMXN: 10, categoriaTienda: "frescos", diasCaducidad: 7 }
    ]
  },

  // ================= COMIDAS =================
  {
    id: "pollo-salsa-verde",
    nombre: "Pollo en salsa verde con calabacitas y arroz",
    tiempo: "comida",
    porcionesBase: 4,
    minutos: 40,
    etiquetas: ["mexicana", "pollo", "verduras"],
    alergenos: ["picante"],
    pasos: [
      "Cuece el pollo con cebolla y sal.",
      "Licúa tomate verde con cilantro y guisa con las calabacitas en cubos.",
      "Agrega el pollo y sirve acompañado de arroz blanco."
    ],
    ingredientes: [
      { nombre: "Pechuga de pollo", cantidad: 0.7, unidad: "kg", precioMXN: 98, categoriaTienda: "proteina", diasCaducidad: 2 },
      { nombre: "Tomate verde", cantidad: 0.5, unidad: "kg", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Calabacita", cantidad: 0.5, unidad: "kg", precioMXN: 16, categoriaTienda: "frescos", diasCaducidad: 3 },
      { nombre: "Arroz blanco", cantidad: 0.3, unidad: "kg", precioMXN: 12, categoriaTienda: "abarrotes", diasCaducidad: 90 },
      { nombre: "Cilantro", cantidad: 1, unidad: "manojo", precioMXN: 8, categoriaTienda: "frescos", diasCaducidad: 2 }
    ]
  },
  {
    id: "lentejas-verduras",
    nombre: "Lentejas guisadas con zanahoria y plátano macho",
    tiempo: "comida",
    porcionesBase: 4,
    minutos: 35,
    etiquetas: ["mexicana", "economico", "vegetariano", "verduras"],
    alergenos: [],
    pasos: [
      "Cuece las lentejas en agua con cebolla durante 25 minutos.",
      "Sofríe jitomate y zanahoria en cubos; incorpóralos a las lentejas.",
      "Acompaña con rebanadas de plátano macho dorado."
    ],
    ingredientes: [
      { nombre: "Lentejas", cantidad: 0.35, unidad: "kg", precioMXN: 20, categoriaTienda: "abarrotes", diasCaducidad: 90 },
      { nombre: "Jitomate", cantidad: 0.4, unidad: "kg", precioMXN: 14, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Zanahoria", cantidad: 0.4, unidad: "kg", precioMXN: 12, categoriaTienda: "frescos", diasCaducidad: 7 },
      { nombre: "Plátano macho", cantidad: 0.5, unidad: "kg", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Cebolla blanca", cantidad: 0.2, unidad: "kg", precioMXN: 6, categoriaTienda: "frescos", diasCaducidad: 10 }
    ]
  },
  {
    id: "picadillo-res",
    nombre: "Picadillo de res con papa y zanahoria",
    tiempo: "comida",
    porcionesBase: 4,
    minutos: 35,
    etiquetas: ["mexicana", "verduras"],
    alergenos: ["res"],
    pasos: [
      "Dora la carne molida con cebolla picada.",
      "Agrega papa y zanahoria en cubitos y el caldillo de jitomate licuado.",
      "Cocina tapado 20 minutos hasta que las verduras estén suaves."
    ],
    ingredientes: [
      { nombre: "Carne molida de res", cantidad: 0.6, unidad: "kg", precioMXN: 118, categoriaTienda: "proteina", diasCaducidad: 2 },
      { nombre: "Papa blanca", cantidad: 0.5, unidad: "kg", precioMXN: 20, categoriaTienda: "frescos", diasCaducidad: 10 },
      { nombre: "Zanahoria", cantidad: 0.4, unidad: "kg", precioMXN: 12, categoriaTienda: "frescos", diasCaducidad: 7 },
      { nombre: "Jitomate", cantidad: 0.5, unidad: "kg", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Arroz blanco", cantidad: 0.25, unidad: "kg", precioMXN: 10, categoriaTienda: "abarrotes", diasCaducidad: 90 }
    ]
  },
  {
    id: "tinga-pollo",
    nombre: "Tinga de pollo en tostadas con lechuga",
    tiempo: "comida",
    porcionesBase: 4,
    minutos: 35,
    etiquetas: ["mexicana", "pollo", "economico"],
    alergenos: [],
    pasos: [
      "Deshebra el pollo cocido.",
      "Sofríe cebolla fileteada y agrega jitomate licuado con orégano.",
      "Mezcla el pollo 10 minutos y sirve sobre tostadas con lechuga."
    ],
    ingredientes: [
      { nombre: "Muslo de pollo", cantidad: 0.75, unidad: "kg", precioMXN: 68, categoriaTienda: "proteina", diasCaducidad: 2 },
      { nombre: "Cebolla blanca", cantidad: 0.5, unidad: "kg", precioMXN: 15, categoriaTienda: "frescos", diasCaducidad: 10 },
      { nombre: "Jitomate", cantidad: 0.5, unidad: "kg", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Tostadas de maíz", cantidad: 1, unidad: "paq", precioMXN: 24, categoriaTienda: "abarrotes", diasCaducidad: 30 },
      { nombre: "Lechuga romana", cantidad: 1, unidad: "pza", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 3 }
    ]
  },
  {
    id: "espagueti-verduras-pollo",
    nombre: "Espagueti rojo con calabacita y pollo",
    tiempo: "comida",
    porcionesBase: 4,
    minutos: 30,
    etiquetas: ["pasta", "pollo", "rapido"],
    alergenos: ["gluten"],
    pasos: [
      "Cuece la pasta en agua con sal.",
      "Saltea tiras de pollo con calabacita y agrega salsa de jitomate casera.",
      "Integra la pasta cocida y sirve caliente."
    ],
    ingredientes: [
      { nombre: "Pasta espagueti", cantidad: 0.4, unidad: "kg", precioMXN: 22, categoriaTienda: "abarrotes", diasCaducidad: 120 },
      { nombre: "Muslo de pollo", cantidad: 0.5, unidad: "kg", precioMXN: 46, categoriaTienda: "proteina", diasCaducidad: 2 },
      { nombre: "Jitomate", cantidad: 0.5, unidad: "kg", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Calabacita", cantidad: 0.4, unidad: "kg", precioMXN: 14, categoriaTienda: "frescos", diasCaducidad: 3 }
    ]
  },
  {
    id: "tortitas-atun-papa",
    nombre: "Tortitas de atún con papa y ensalada fresca",
    tiempo: "comida",
    porcionesBase: 4,
    minutos: 30,
    etiquetas: ["economico", "rapido", "verduras"],
    alergenos: ["mariscos", "huevo"],
    pasos: [
      "Cuece y machaca las papas; mezcla con atún escurrido y huevo.",
      "Forma tortitas y dóralas en sartén con poco aceite.",
      "Sirve con ensalada de lechuga, pepino y limón."
    ],
    ingredientes: [
      { nombre: "Atún en lata", cantidad: 3, unidad: "latas", precioMXN: 66, categoriaTienda: "abarrotes", diasCaducidad: 180 },
      { nombre: "Papa blanca", cantidad: 0.6, unidad: "kg", precioMXN: 24, categoriaTienda: "frescos", diasCaducidad: 10 },
      { nombre: "Huevo", cantidad: 2, unidad: "pzas", precioMXN: 9, categoriaTienda: "abarrotes", diasCaducidad: 14 },
      { nombre: "Lechuga romana", cantidad: 1, unidad: "pza", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 3 },
      { nombre: "Pepino", cantidad: 0.4, unidad: "kg", precioMXN: 12, categoriaTienda: "frescos", diasCaducidad: 4 }
    ]
  },
  {
    id: "calabacitas-elote",
    nombre: "Calabacitas a la mexicana con elote y arroz",
    tiempo: "comida",
    porcionesBase: 4,
    minutos: 25,
    etiquetas: ["mexicana", "verduras", "economico", "vegetariano"],
    alergenos: [],
    pasos: [
      "Sofríe cebolla y jitomate picado.",
      "Agrega calabacitas en cubos y granos de elote; cocina tapado 12 minutos.",
      "Sirve con arroz blanco y tortillas."
    ],
    ingredientes: [
      { nombre: "Calabacita", cantidad: 0.7, unidad: "kg", precioMXN: 22, categoriaTienda: "frescos", diasCaducidad: 3 },
      { nombre: "Elote desgranado", cantidad: 0.4, unidad: "kg", precioMXN: 20, categoriaTienda: "abarrotes", diasCaducidad: 30 },
      { nombre: "Jitomate", cantidad: 0.4, unidad: "kg", precioMXN: 14, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Arroz blanco", cantidad: 0.3, unidad: "kg", precioMXN: 12, categoriaTienda: "abarrotes", diasCaducidad: 90 },
      { nombre: "Tortillas de maíz", cantidad: 0.5, unidad: "kg", precioMXN: 12, categoriaTienda: "frescos", diasCaducidad: 3 }
    ]
  },
  {
    id: "bistec-cerdo-nopales",
    nombre: "Bistec de cerdo en salsa roja con nopales",
    tiempo: "comida",
    porcionesBase: 4,
    minutos: 40,
    etiquetas: ["mexicana", "verduras"],
    alergenos: ["cerdo"],
    pasos: [
      "Cuece los nopales picados con sal y escúrrelos.",
      "Dora los bistecs en tiras y baña con salsa de jitomate.",
      "Integra los nopales y sirve con frijoles."
    ],
    ingredientes: [
      { nombre: "Bistec de cerdo", cantidad: 0.65, unidad: "kg", precioMXN: 88, categoriaTienda: "proteina", diasCaducidad: 2 },
      { nombre: "Nopales frescos", cantidad: 0.5, unidad: "kg", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 3 },
      { nombre: "Jitomate", cantidad: 0.5, unidad: "kg", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Frijol cocido o refrito", cantidad: 0.4, unidad: "kg", precioMXN: 18, categoriaTienda: "abarrotes", diasCaducidad: 5 }
    ]
  },

  // ================= CENAS =================
  {
    id: "quesadillas-espinaca",
    nombre: "Quesadillas de espinaca con salsa fresca",
    tiempo: "cena",
    porcionesBase: 4,
    minutos: 15,
    etiquetas: ["mexicana", "rapido", "verduras", "vegetariano"],
    alergenos: ["lacteos"],
    pasos: [
      "Saltea las espinacas con un poco de cebolla.",
      "Rellena tortillas de maíz con queso y espinacas; calienta en comal."
    ],
    ingredientes: [
      { nombre: "Tortillas de maíz", cantidad: 0.5, unidad: "kg", precioMXN: 12, categoriaTienda: "frescos", diasCaducidad: 3 },
      { nombre: "Queso Oaxaca", cantidad: 0.25, unidad: "kg", precioMXN: 40, categoriaTienda: "lacteos", diasCaducidad: 6 },
      { nombre: "Espinaca fresca", cantidad: 1, unidad: "manojo", precioMXN: 18, categoriaTienda: "frescos", diasCaducidad: 2 }
    ]
  },
  {
    id: "sopa-fideo-verduras",
    nombre: "Sopa de fideo caldosa con zanahoria y calabacita",
    tiempo: "cena",
    porcionesBase: 4,
    minutos: 20,
    etiquetas: ["mexicana", "pasta", "economico", "verduras", "vegetariano"],
    alergenos: ["gluten"],
    pasos: [
      "Dora ligeramente el fideo con una cucharada de aceite.",
      "Agrega jitomate licuado con cebolla, agua y las verduras picadas.",
      "Hierve 12 minutos hasta que el fideo esté suave."
    ],
    ingredientes: [
      { nombre: "Sopa de fideo", cantidad: 0.2, unidad: "kg", precioMXN: 11, categoriaTienda: "abarrotes", diasCaducidad: 120 },
      { nombre: "Jitomate", cantidad: 0.35, unidad: "kg", precioMXN: 13, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Zanahoria", cantidad: 0.3, unidad: "kg", precioMXN: 9, categoriaTienda: "frescos", diasCaducidad: 7 },
      { nombre: "Calabacita", cantidad: 0.3, unidad: "kg", precioMXN: 10, categoriaTienda: "frescos", diasCaducidad: 3 }
    ]
  },
  {
    id: "tacos-papa-dorados",
    nombre: "Tacos de papa en comal con lechuga",
    tiempo: "cena",
    porcionesBase: 4,
    minutos: 25,
    etiquetas: ["mexicana", "economico", "vegetariano"],
    alergenos: [],
    pasos: [
      "Cuece y machaca la papa con sal y pimienta.",
      "Rellena tortillas, dóralas en comal con poco aceite y sirve con lechuga y jitomate."
    ],
    ingredientes: [
      { nombre: "Papa blanca", cantidad: 0.6, unidad: "kg", precioMXN: 24, categoriaTienda: "frescos", diasCaducidad: 10 },
      { nombre: "Tortillas de maíz", cantidad: 0.5, unidad: "kg", precioMXN: 12, categoriaTienda: "frescos", diasCaducidad: 3 },
      { nombre: "Lechuga romana", cantidad: 0.5, unidad: "pza", precioMXN: 9, categoriaTienda: "frescos", diasCaducidad: 3 },
      { nombre: "Jitomate", cantidad: 0.25, unidad: "kg", precioMXN: 9, categoriaTienda: "frescos", diasCaducidad: 4 }
    ]
  },
  {
    id: "ensalada-atun-verduras",
    nombre: "Ensalada fresca de atún con pepino y galletas",
    tiempo: "cena",
    porcionesBase: 4,
    minutos: 12,
    etiquetas: ["rapido", "verduras"],
    alergenos: ["mariscos"],
    pasos: [
      "Escurre el atún y mezcla con pepino, jitomate, cebolla y limón.",
      "Sirve sobre tostadas de maíz."
    ],
    ingredientes: [
      { nombre: "Atún en lata", cantidad: 2, unidad: "latas", precioMXN: 44, categoriaTienda: "abarrotes", diasCaducidad: 180 },
      { nombre: "Pepino", cantidad: 0.4, unidad: "kg", precioMXN: 12, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Jitomate", cantidad: 0.3, unidad: "kg", precioMXN: 11, categoriaTienda: "frescos", diasCaducidad: 4 },
      { nombre: "Tostadas de maíz", cantidad: 0.5, unidad: "paq", precioMXN: 12, categoriaTienda: "abarrotes", diasCaducidad: 30 }
    ]
  },
  {
    id: "caldo-verduras-garbanzo",
    nombre: "Caldo reconfortante de verduras con garbanzo",
    tiempo: "cena",
    porcionesBase: 4,
    minutos: 25,
    etiquetas: ["verduras", "economico", "vegetariano"],
    alergenos: [],
    pasos: [
      "Hierve zanahoria, calabacita y papa en cubos con epazote o cilantro.",
      "Agrega garbanzos cocidos y cocina 10 minutos más."
    ],
    ingredientes: [
      { nombre: "Garbanzo cocido", cantidad: 0.4, unidad: "kg", precioMXN: 22, categoriaTienda: "abarrotes", diasCaducidad: 30 },
      { nombre: "Zanahoria", cantidad: 0.35, unidad: "kg", precioMXN: 11, categoriaTienda: "frescos", diasCaducidad: 7 },
      { nombre: "Calabacita", cantidad: 0.4, unidad: "kg", precioMXN: 13, categoriaTienda: "frescos", diasCaducidad: 3 },
      { nombre: "Papa blanca", cantidad: 0.35, unidad: "kg", precioMXN: 14, categoriaTienda: "frescos", diasCaducidad: 10 }
    ]
  },
  {
    id: "sincronizadas-pollo",
    nombre: "Sincronizadas ligeras de pollo con jitomate",
    tiempo: "cena",
    porcionesBase: 4,
    minutos: 15,
    etiquetas: ["rapido", "pollo"],
    alergenos: ["lacteos", "gluten"],
    pasos: [
      "Rellena tortillas de harina con pollo deshebrado y queso.",
      "Calienta en comal hasta fundir y acompaña con rebanadas de jitomate."
    ],
    ingredientes: [
      { nombre: "Tortillas de harina", cantidad: 1, unidad: "paq", precioMXN: 26, categoriaTienda: "abarrotes", diasCaducidad: 14 },
      { nombre: "Muslo de pollo", cantidad: 0.35, unidad: "kg", precioMXN: 32, categoriaTienda: "proteina", diasCaducidad: 2 },
      { nombre: "Queso Oaxaca", cantidad: 0.2, unidad: "kg", precioMXN: 32, categoriaTienda: "lacteos", diasCaducidad: 6 },
      { nombre: "Jitomate", cantidad: 0.25, unidad: "kg", precioMXN: 9, categoriaTienda: "frescos", diasCaducidad: 4 }
    ]
  },
  {
    id: "tostadas-frijol-nopales",
    nombre: "Tostadas de frijol con ensalada de nopales",
    tiempo: "cena",
    porcionesBase: 4,
    minutos: 15,
    etiquetas: ["mexicana", "economico", "verduras", "vegetariano"],
    alergenos: [],
    pasos: [
      "Unta frijoles refritos sobre tostadas de maíz.",
      "Mezcla nopales cocidos con jitomate, cebolla y cilantro; sirve encima."
    ],
    ingredientes: [
      { nombre: "Tostadas de maíz", cantidad: 1, unidad: "paq", precioMXN: 24, categoriaTienda: "abarrotes", diasCaducidad: 30 },
      { nombre: "Frijol cocido o refrito", cantidad: 0.4, unidad: "kg", precioMXN: 18, categoriaTienda: "abarrotes", diasCaducidad: 5 },
      { nombre: "Nopales frescos", cantidad: 0.4, unidad: "kg", precioMXN: 15, categoriaTienda: "frescos", diasCaducidad: 3 },
      { nombre: "Jitomate", cantidad: 0.25, unidad: "kg", precioMXN: 9, categoriaTienda: "frescos", diasCaducidad: 4 }
    ]
  }
];

/* Recetario ampliado para dar más variedad al menú semanal. */
const RECETAS_ADICIONALES = [
  { id: 'hotcakes-avena', nombre: 'Hotcakes de avena y plátano', tiempo: 'desayuno', porcionesBase: 4, minutos: 18, etiquetas: ['economico', 'rapido', 'vegetariano'], alergenos: ['gluten'], pasos: ['Mezcla avena molida, huevo y plátano machacado.', 'Cocina porciones pequeñas en sartén caliente.'], ingredientes: [{ nombre: 'Avena en hojuelas', cantidad: 0.25, unidad: 'kg', precioMXN: 14, categoriaTienda: 'abarrotes', diasCaducidad: 60 }, { nombre: 'Huevo', cantidad: 4, unidad: 'pzas', precioMXN: 17, categoriaTienda: 'abarrotes', diasCaducidad: 14 }, { nombre: 'Plátano tabasco', cantidad: 0.4, unidad: 'kg', precioMXN: 11, categoriaTienda: 'frescos', diasCaducidad: 3 }] },
  { id: 'yogur-fruta-granola', nombre: 'Yogur con fruta y granola', tiempo: 'desayuno', porcionesBase: 4, minutos: 8, etiquetas: ['rapido', 'vegetariano'], alergenos: ['lacteos'], pasos: ['Sirve el yogur en tazones.', 'Agrega fruta picada y granola.'], ingredientes: [{ nombre: 'Yogur natural', cantidad: 0.6, unidad: 'kg', precioMXN: 34, categoriaTienda: 'lacteos', diasCaducidad: 7 }, { nombre: 'Manzana', cantidad: 0.4, unidad: 'kg', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 7 }, { nombre: 'Granola', cantidad: 0.2, unidad: 'kg', precioMXN: 24, categoriaTienda: 'abarrotes', diasCaducidad: 60 }] },
  { id: 'burrito-huevo-frijol', nombre: 'Burritos de huevo con frijoles', tiempo: 'desayuno', porcionesBase: 4, minutos: 20, etiquetas: ['mexicana', 'economico'], alergenos: ['huevo', 'gluten'], pasos: ['Prepara huevo revuelto y calienta los frijoles.', 'Rellena tortillas de harina y dóralas en comal.'], ingredientes: [{ nombre: 'Huevo', cantidad: 6, unidad: 'pzas', precioMXN: 26, categoriaTienda: 'abarrotes', diasCaducidad: 14 }, { nombre: 'Frijol cocido o refrito', cantidad: 0.35, unidad: 'kg', precioMXN: 16, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Tortillas de harina', cantidad: 1, unidad: 'paq', precioMXN: 26, categoriaTienda: 'abarrotes', diasCaducidad: 14 }] },
  { id: 'tostada-aguacate-queso', nombre: 'Tostadas de aguacate y queso', tiempo: 'desayuno', porcionesBase: 4, minutos: 12, etiquetas: ['rapido', 'vegetariano'], alergenos: ['gluten', 'lacteos'], pasos: ['Tuesta el pan.', 'Agrega aguacate machacado y queso fresco.'], ingredientes: [{ nombre: 'Pan integral', cantidad: 1, unidad: 'paq', precioMXN: 38, categoriaTienda: 'abarrotes', diasCaducidad: 7 }, { nombre: 'Aguacate', cantidad: 0.35, unidad: 'kg', precioMXN: 24, categoriaTienda: 'frescos', diasCaducidad: 4 }, { nombre: 'Queso fresco', cantidad: 0.15, unidad: 'kg', precioMXN: 22, categoriaTienda: 'lacteos', diasCaducidad: 6 }] },
  { id: 'quesadillas-champinones', nombre: 'Quesadillas de champiñones', tiempo: 'desayuno', porcionesBase: 4, minutos: 15, etiquetas: ['mexicana', 'rapido', 'vegetariano'], alergenos: ['lacteos'], pasos: ['Saltea los champiñones con cebolla.', 'Rellena tortillas con queso y champiñones; dora.'], ingredientes: [{ nombre: 'Champiñones', cantidad: 0.3, unidad: 'kg', precioMXN: 27, categoriaTienda: 'frescos', diasCaducidad: 4 }, { nombre: 'Tortillas de maíz', cantidad: 0.5, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Queso Oaxaca', cantidad: 0.2, unidad: 'kg', precioMXN: 32, categoriaTienda: 'lacteos', diasCaducidad: 6 }] },
  { id: 'avena-manzana-nuez', nombre: 'Avena con manzana y canela', tiempo: 'desayuno', porcionesBase: 4, minutos: 12, etiquetas: ['economico', 'vegetariano'], alergenos: ['nueces'], pasos: ['Cocina la avena con agua o leche y canela.', 'Añade manzana en cubos al servir.'], ingredientes: [{ nombre: 'Avena en hojuelas', cantidad: 0.25, unidad: 'kg', precioMXN: 14, categoriaTienda: 'abarrotes', diasCaducidad: 60 }, { nombre: 'Manzana', cantidad: 0.4, unidad: 'kg', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 7 }, { nombre: 'Leche', cantidad: 0.5, unidad: 'L', precioMXN: 14, categoriaTienda: 'lacteos', diasCaducidad: 5 }] },
  { id: 'omelette-verduras', nombre: 'Omelette de verduras', tiempo: 'desayuno', porcionesBase: 4, minutos: 18, etiquetas: ['saludable', 'rapido'], alergenos: ['huevo'], pasos: ['Bate los huevos y vierte en sartén.', 'Añade espinaca y jitomate; dobla y cocina.'], ingredientes: [{ nombre: 'Huevo', cantidad: 8, unidad: 'pzas', precioMXN: 34, categoriaTienda: 'abarrotes', diasCaducidad: 14 }, { nombre: 'Espinaca', cantidad: 0.2, unidad: 'kg', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Jitomate', cantidad: 0.3, unidad: 'kg', precioMXN: 11, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'molletes-pico-gallo', nombre: 'Molletes con pico de gallo', tiempo: 'desayuno', porcionesBase: 4, minutos: 16, etiquetas: ['mexicana', 'economico'], alergenos: ['gluten', 'lacteos'], pasos: ['Parte y tuesta los bolillos.', 'Cubre con frijoles y queso; acompaña con pico de gallo.'], ingredientes: [{ nombre: 'Bolillo', cantidad: 4, unidad: 'pzas', precioMXN: 16, categoriaTienda: 'frescos', diasCaducidad: 2 }, { nombre: 'Frijol cocido o refrito', cantidad: 0.35, unidad: 'kg', precioMXN: 16, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Queso manchego', cantidad: 0.18, unidad: 'kg', precioMXN: 30, categoriaTienda: 'lacteos', diasCaducidad: 6 }] },
  { id: 'pollo-arroz-verduras', nombre: 'Pollo con arroz y verduras', tiempo: 'comida', porcionesBase: 4, minutos: 35, etiquetas: ['economico', 'saludable', 'pollo'], alergenos: [], pasos: ['Dora el pollo con ajo y cebolla.', 'Añade arroz, verduras y agua; cocina tapado hasta suavizar.'], ingredientes: [{ nombre: 'Muslo de pollo', cantidad: 0.7, unidad: 'kg', precioMXN: 64, categoriaTienda: 'proteina', diasCaducidad: 2 }, { nombre: 'Arroz', cantidad: 0.3, unidad: 'kg', precioMXN: 10, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Verduras mixtas', cantidad: 0.4, unidad: 'kg', precioMXN: 24, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'enchiladas-frijol', nombre: 'Enchiladas de frijol', tiempo: 'comida', porcionesBase: 4, minutos: 30, etiquetas: ['mexicana', 'economico', 'vegetariano'], alergenos: ['picante'], pasos: ['Rellena tortillas con frijoles.', 'Baña con salsa roja y sirve con queso fresco.'], ingredientes: [{ nombre: 'Tortillas de maíz', cantidad: 0.75, unidad: 'kg', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Frijol cocido o refrito', cantidad: 0.5, unidad: 'kg', precioMXN: 23, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Jitomate', cantidad: 0.5, unidad: 'kg', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'pasta-atun-jitomate', nombre: 'Pasta con atún y jitomate', tiempo: 'comida', porcionesBase: 4, minutos: 25, etiquetas: ['rapido', 'economico'], alergenos: ['gluten', 'pescado'], pasos: ['Cuece la pasta al dente.', 'Mezcla con jitomate salteado y atún.'], ingredientes: [{ nombre: 'Pasta', cantidad: 0.4, unidad: 'kg', precioMXN: 18, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Atún en agua', cantidad: 2, unidad: 'latas', precioMXN: 38, categoriaTienda: 'abarrotes', diasCaducidad: 365 }, { nombre: 'Jitomate', cantidad: 0.4, unidad: 'kg', precioMXN: 14, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'picadillo-lenteja', nombre: 'Picadillo de lentejas', tiempo: 'comida', porcionesBase: 4, minutos: 35, etiquetas: ['economico', 'saludable', 'vegetariano'], alergenos: [], pasos: ['Cuece las lentejas hasta que estén suaves.', 'Agrega papa, zanahoria y jitomate; cocina hasta integrar.'], ingredientes: [{ nombre: 'Lenteja', cantidad: 0.35, unidad: 'kg', precioMXN: 18, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Papa', cantidad: 0.5, unidad: 'kg', precioMXN: 13, categoriaTienda: 'frescos', diasCaducidad: 15 }, { nombre: 'Zanahoria', cantidad: 0.3, unidad: 'kg', precioMXN: 9, categoriaTienda: 'frescos', diasCaducidad: 12 }] },
  { id: 'tacos-pescado-col', nombre: 'Tacos de pescado con col', tiempo: 'comida', porcionesBase: 4, minutos: 25, etiquetas: ['rapido', 'saludable'], alergenos: ['pescado'], pasos: ['Cocina el pescado con limón y especias.', 'Sirve en tortillas con col rallada.'], ingredientes: [{ nombre: 'Filete de pescado', cantidad: 0.55, unidad: 'kg', precioMXN: 78, categoriaTienda: 'proteina', diasCaducidad: 2 }, { nombre: 'Tortillas de maíz', cantidad: 0.5, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Col', cantidad: 0.3, unidad: 'kg', precioMXN: 9, categoriaTienda: 'frescos', diasCaducidad: 10 }] },
  { id: 'fajitas-pollo-pimientos', nombre: 'Fajitas de pollo y pimientos', tiempo: 'comida', porcionesBase: 4, minutos: 30, etiquetas: ['pollo', 'saludable'], alergenos: [], pasos: ['Corta pollo y verduras en tiras.', 'Saltea a fuego alto y acompaña con arroz o tortillas.'], ingredientes: [{ nombre: 'Pechuga de pollo', cantidad: 0.6, unidad: 'kg', precioMXN: 84, categoriaTienda: 'proteina', diasCaducidad: 2 }, { nombre: 'Pimiento morrón', cantidad: 0.3, unidad: 'kg', precioMXN: 27, categoriaTienda: 'frescos', diasCaducidad: 5 }, { nombre: 'Cebolla blanca', cantidad: 0.2, unidad: 'kg', precioMXN: 7, categoriaTienda: 'frescos', diasCaducidad: 10 }] },
  { id: 'calabacitas-queso-elote', nombre: 'Calabacitas con elote y queso', tiempo: 'comida', porcionesBase: 4, minutos: 25, etiquetas: ['economico', 'vegetariano'], alergenos: ['lacteos'], pasos: ['Saltea calabacitas y granos de elote.', 'Agrega queso fresco y cocina tapado.'], ingredientes: [{ nombre: 'Calabacita', cantidad: 0.6, unidad: 'kg', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 5 }, { nombre: 'Elote', cantidad: 2, unidad: 'pzas', precioMXN: 16, categoriaTienda: 'frescos', diasCaducidad: 4 }, { nombre: 'Queso fresco', cantidad: 0.2, unidad: 'kg', precioMXN: 29, categoriaTienda: 'lacteos', diasCaducidad: 6 }] },
  { id: 'arroz-pollo-chipotle', nombre: 'Arroz con pollo al chipotle', tiempo: 'comida', porcionesBase: 4, minutos: 32, etiquetas: ['mexicana', 'pollo'], alergenos: ['picante'], pasos: ['Dora el arroz y agrega jitomate licuado.', 'Incorpora pollo cocido y chipotle; deja terminar la cocción.'], ingredientes: [{ nombre: 'Arroz', cantidad: 0.35, unidad: 'kg', precioMXN: 12, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Muslo de pollo', cantidad: 0.6, unidad: 'kg', precioMXN: 55, categoriaTienda: 'proteina', diasCaducidad: 2 }, { nombre: 'Jitomate', cantidad: 0.35, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'sopa-tortilla', nombre: 'Sopa de tortilla sencilla', tiempo: 'cena', porcionesBase: 4, minutos: 28, etiquetas: ['mexicana', 'economico'], alergenos: ['picante'], pasos: ['Dora las tiras de tortilla.', 'Agrega caldo de jitomate y sirve con aguacate y queso.'], ingredientes: [{ nombre: 'Tortillas de maíz', cantidad: 0.5, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Jitomate', cantidad: 0.5, unidad: 'kg', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 4 }, { nombre: 'Queso fresco', cantidad: 0.12, unidad: 'kg', precioMXN: 18, categoriaTienda: 'lacteos', diasCaducidad: 6 }] },
  { id: 'ensalada-garbanzos', nombre: 'Ensalada de garbanzos y pepino', tiempo: 'cena', porcionesBase: 4, minutos: 15, etiquetas: ['saludable', 'vegetariano', 'rapido'], alergenos: [], pasos: ['Enjuaga y escurre los garbanzos.', 'Mezcla con pepino, jitomate, limón y cilantro.'], ingredientes: [{ nombre: 'Garbanzo cocido', cantidad: 0.5, unidad: 'kg', precioMXN: 25, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Pepino', cantidad: 0.3, unidad: 'kg', precioMXN: 10, categoriaTienda: 'frescos', diasCaducidad: 5 }, { nombre: 'Jitomate', cantidad: 0.3, unidad: 'kg', precioMXN: 11, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'tostadas-tinga-zanahoria', nombre: 'Tostadas de tinga de zanahoria', tiempo: 'cena', porcionesBase: 4, minutos: 25, etiquetas: ['economico', 'mexicana', 'vegetariano'], alergenos: ['picante'], pasos: ['Ralla y cocina la zanahoria con cebolla y salsa de jitomate.', 'Sirve sobre tostadas con lechuga.'], ingredientes: [{ nombre: 'Zanahoria', cantidad: 0.5, unidad: 'kg', precioMXN: 15, categoriaTienda: 'frescos', diasCaducidad: 12 }, { nombre: 'Tostadas de maíz', cantidad: 1, unidad: 'paq', precioMXN: 24, categoriaTienda: 'abarrotes', diasCaducidad: 30 }, { nombre: 'Lechuga', cantidad: 1, unidad: 'pza', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 5 }] },
  { id: 'quesadillas-frijol-nopal', nombre: 'Quesadillas de frijol y nopal', tiempo: 'cena', porcionesBase: 4, minutos: 20, etiquetas: ['economico', 'vegetariano', 'mexicana'], alergenos: ['lacteos'], pasos: ['Rellena las tortillas con frijoles, nopal cocido y queso.', 'Dora en comal y sirve caliente.'], ingredientes: [{ nombre: 'Tortillas de maíz', cantidad: 0.5, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Frijol cocido o refrito', cantidad: 0.3, unidad: 'kg', precioMXN: 14, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Nopales frescos', cantidad: 0.3, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 3 }] },
  { id: 'sopa-lentejas-zanahoria', nombre: 'Sopa de lentejas con verduras', tiempo: 'cena', porcionesBase: 4, minutos: 35, etiquetas: ['economico', 'saludable', 'vegetariano'], alergenos: [], pasos: ['Enjuaga las lentejas y ponlas a cocer.', 'Añade zanahoria y jitomate; sazona y cocina hasta suavizar.'], ingredientes: [{ nombre: 'Lenteja', cantidad: 0.35, unidad: 'kg', precioMXN: 18, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Zanahoria', cantidad: 0.3, unidad: 'kg', precioMXN: 9, categoriaTienda: 'frescos', diasCaducidad: 12 }, { nombre: 'Jitomate', cantidad: 0.3, unidad: 'kg', precioMXN: 11, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'ensalada-pollo-manzana', nombre: 'Ensalada de pollo y manzana', tiempo: 'cena', porcionesBase: 4, minutos: 22, etiquetas: ['saludable', 'pollo'], alergenos: [], pasos: ['Cocina y deshebra el pollo.', 'Mezcla con manzana, lechuga y aderezo ligero.'], ingredientes: [{ nombre: 'Pechuga de pollo', cantidad: 0.45, unidad: 'kg', precioMXN: 63, categoriaTienda: 'proteina', diasCaducidad: 2 }, { nombre: 'Manzana', cantidad: 0.35, unidad: 'kg', precioMXN: 16, categoriaTienda: 'frescos', diasCaducidad: 7 }, { nombre: 'Lechuga', cantidad: 1, unidad: 'pza', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 5 }] },
  { id: 'tacos-papa-poblano', nombre: 'Tacos de papa con poblano', tiempo: 'cena', porcionesBase: 4, minutos: 25, etiquetas: ['economico', 'mexicana', 'vegetariano'], alergenos: ['picante'], pasos: ['Cuece y machaca las papas.', 'Rellena tortillas con papa y rajas de poblano; dora.'], ingredientes: [{ nombre: 'Papa', cantidad: 0.6, unidad: 'kg', precioMXN: 16, categoriaTienda: 'frescos', diasCaducidad: 15 }, { nombre: 'Tortillas de maíz', cantidad: 0.5, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Chile poblano', cantidad: 2, unidad: 'pzas', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 6 }] },
  { id: 'sándwich-ensalada-huevo', nombre: 'Sándwich de huevo y verduras', tiempo: 'cena', porcionesBase: 4, minutos: 15, etiquetas: ['rapido', 'economico'], alergenos: ['huevo', 'gluten'], pasos: ['Cuece los huevos y pícalos.', 'Mezcla con verduras y sirve entre rebanadas de pan.'], ingredientes: [{ nombre: 'Huevo', cantidad: 6, unidad: 'pzas', precioMXN: 26, categoriaTienda: 'abarrotes', diasCaducidad: 14 }, { nombre: 'Pan integral', cantidad: 1, unidad: 'paq', precioMXN: 38, categoriaTienda: 'abarrotes', diasCaducidad: 7 }, { nombre: 'Jitomate', cantidad: 0.25, unidad: 'kg', precioMXN: 9, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
];
RECETAS_BASE.push(...RECETAS_ADICIONALES);

/* Recetas adicionales para ampliar el menú con opciones variadas y veganas. */
const RECETAS_MAS = [
  { id: 'pudín-chía-mango', nombre: 'Pudín de chía con mango', tiempo: 'desayuno', porcionesBase: 4, minutos: 10, etiquetas: ['saludable', 'vegano', 'rapido'], alergenos: [], pasos: ['Mezcla chía con bebida de soya y deja reposar.', 'Sirve con mango en cubos.'], ingredientes: [{ nombre: 'Semillas de chía', cantidad: 0.12, unidad: 'kg', precioMXN: 30, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Bebida de soya', cantidad: 0.5, unidad: 'L', precioMXN: 24, categoriaTienda: 'abarrotes', diasCaducidad: 7 }, { nombre: 'Mango', cantidad: 0.35, unidad: 'kg', precioMXN: 20, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'tacos-papa-frijol-manana', nombre: 'Tacos mañaneros de papa y frijol', tiempo: 'desayuno', porcionesBase: 4, minutos: 22, etiquetas: ['economico', 'vegano', 'mexicana'], alergenos: [], pasos: ['Cuece y machaca las papas.', 'Rellena tortillas con papa y frijoles; dora en comal.'], ingredientes: [{ nombre: 'Papa blanca', cantidad: 0.5, unidad: 'kg', precioMXN: 13, categoriaTienda: 'frescos', diasCaducidad: 15 }, { nombre: 'Frijol cocido o refrito', cantidad: 0.3, unidad: 'kg', precioMXN: 14, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Tortillas de maíz', cantidad: 0.5, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 3 }] },
  { id: 'tofu-revuelto', nombre: 'Tofu revuelto con verduras', tiempo: 'desayuno', porcionesBase: 4, minutos: 18, etiquetas: ['saludable', 'vegano', 'rapido'], alergenos: ['soya'], pasos: ['Desmorona el tofu y sazona con cúrcuma.', 'Saltea con jitomate y espinaca.'], ingredientes: [{ nombre: 'Tofu', cantidad: 0.35, unidad: 'kg', precioMXN: 38, categoriaTienda: 'frescos', diasCaducidad: 5 }, { nombre: 'Jitomate', cantidad: 0.25, unidad: 'kg', precioMXN: 9, categoriaTienda: 'frescos', diasCaducidad: 4 }, { nombre: 'Espinaca fresca', cantidad: 0.15, unidad: 'kg', precioMXN: 14, categoriaTienda: 'frescos', diasCaducidad: 3 }] },
  { id: 'licuado-verde-avena', nombre: 'Licuado verde de avena y plátano', tiempo: 'desayuno', porcionesBase: 4, minutos: 8, etiquetas: ['saludable', 'vegano', 'rapido'], alergenos: ['gluten'], pasos: ['Licúa avena, plátano, espinaca y agua fría.', 'Sirve de inmediato.'], ingredientes: [{ nombre: 'Avena en hojuelas', cantidad: 0.18, unidad: 'kg', precioMXN: 10, categoriaTienda: 'abarrotes', diasCaducidad: 60 }, { nombre: 'Plátano tabasco', cantidad: 0.4, unidad: 'kg', precioMXN: 11, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Espinaca fresca', cantidad: 0.1, unidad: 'kg', precioMXN: 9, categoriaTienda: 'frescos', diasCaducidad: 3 }] },
  { id: 'avena-papaya-limon', nombre: 'Avena con papaya y limón', tiempo: 'desayuno', porcionesBase: 4, minutos: 12, etiquetas: ['economico', 'vegano'], alergenos: [], pasos: ['Cocina avena con agua y canela.', 'Sirve con papaya y un poco de limón.'], ingredientes: [{ nombre: 'Avena en hojuelas', cantidad: 0.22, unidad: 'kg', precioMXN: 12, categoriaTienda: 'abarrotes', diasCaducidad: 60 }, { nombre: 'Papaya', cantidad: 0.45, unidad: 'kg', precioMXN: 17, categoriaTienda: 'frescos', diasCaducidad: 4 }, { nombre: 'Limón', cantidad: 0.15, unidad: 'kg', precioMXN: 6, categoriaTienda: 'frescos', diasCaducidad: 10 }] },
  { id: 'tostadas-frijol-aguacate', nombre: 'Tostadas de frijol y aguacate', tiempo: 'desayuno', porcionesBase: 4, minutos: 12, etiquetas: ['mexicana', 'vegano', 'economico'], alergenos: [], pasos: ['Unta frijoles sobre tostadas.', 'Agrega aguacate, jitomate y cilantro.'], ingredientes: [{ nombre: 'Tostadas de maíz', cantidad: 1, unidad: 'paq', precioMXN: 24, categoriaTienda: 'abarrotes', diasCaducidad: 30 }, { nombre: 'Frijol cocido o refrito', cantidad: 0.3, unidad: 'kg', precioMXN: 14, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Aguacate', cantidad: 0.25, unidad: 'kg', precioMXN: 17, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'quinoa-manzana-canela', nombre: 'Quinoa dulce con manzana', tiempo: 'desayuno', porcionesBase: 4, minutos: 22, etiquetas: ['saludable', 'vegano'], alergenos: [], pasos: ['Enjuaga y cuece la quinoa con agua y canela.', 'Agrega manzana picada al servir.'], ingredientes: [{ nombre: 'Quinoa', cantidad: 0.2, unidad: 'kg', precioMXN: 32, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Manzana', cantidad: 0.35, unidad: 'kg', precioMXN: 16, categoriaTienda: 'frescos', diasCaducidad: 7 }, { nombre: 'Canela', cantidad: 0.01, unidad: 'kg', precioMXN: 5, categoriaTienda: 'abarrotes', diasCaducidad: 365 }] },
  { id: 'tacos-champinon-elote-des', nombre: 'Tacos de champiñón y elote', tiempo: 'desayuno', porcionesBase: 4, minutos: 16, etiquetas: ['rapido', 'vegano', 'mexicana'], alergenos: [], pasos: ['Saltea champiñones con elote y cebolla.', 'Sirve en tortillas de maíz.'], ingredientes: [{ nombre: 'Champiñones', cantidad: 0.25, unidad: 'kg', precioMXN: 23, categoriaTienda: 'frescos', diasCaducidad: 4 }, { nombre: 'Elote desgranado', cantidad: 0.2, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 4 }, { nombre: 'Tortillas de maíz', cantidad: 0.4, unidad: 'kg', precioMXN: 10, categoriaTienda: 'frescos', diasCaducidad: 3 }] },
  { id: 'curry-garbanzos-arroz', nombre: 'Curry de garbanzos con arroz', tiempo: 'comida', porcionesBase: 4, minutos: 35, etiquetas: ['vegano', 'saludable'], alergenos: [], pasos: ['Sofríe cebolla con curry y jitomate.', 'Agrega garbanzo y cocina; sirve con arroz.'], ingredientes: [{ nombre: 'Garbanzo cocido', cantidad: 0.45, unidad: 'kg', precioMXN: 23, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Arroz blanco', cantidad: 0.3, unidad: 'kg', precioMXN: 10, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Jitomate', cantidad: 0.35, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'pimientos-quinoa-frijol', nombre: 'Pimientos rellenos de quinoa y frijol', tiempo: 'comida', porcionesBase: 4, minutos: 35, etiquetas: ['vegano', 'saludable'], alergenos: [], pasos: ['Mezcla quinoa cocida con frijoles y jitomate.', 'Rellena pimientos y hornea hasta suavizar.'], ingredientes: [{ nombre: 'Quinoa', cantidad: 0.22, unidad: 'kg', precioMXN: 35, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Frijol cocido o refrito', cantidad: 0.3, unidad: 'kg', precioMXN: 14, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Pimiento morrón', cantidad: 3, unidad: 'pzas', precioMXN: 30, categoriaTienda: 'frescos', diasCaducidad: 5 }] },
  { id: 'tofu-arroz-brocoli', nombre: 'Bowl de tofu, arroz y brócoli', tiempo: 'comida', porcionesBase: 4, minutos: 30, etiquetas: ['vegano', 'saludable'], alergenos: ['soya'], pasos: ['Dora el tofu en cubos.', 'Sirve sobre arroz con brócoli salteado.'], ingredientes: [{ nombre: 'Tofu', cantidad: 0.4, unidad: 'kg', precioMXN: 44, categoriaTienda: 'frescos', diasCaducidad: 5 }, { nombre: 'Arroz blanco', cantidad: 0.3, unidad: 'kg', precioMXN: 10, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Brócoli', cantidad: 0.35, unidad: 'kg', precioMXN: 24, categoriaTienda: 'frescos', diasCaducidad: 5 }] },
  { id: 'tinga-setas', nombre: 'Tinga de setas en tostadas', tiempo: 'comida', porcionesBase: 4, minutos: 28, etiquetas: ['vegano', 'mexicana'], alergenos: [], pasos: ['Deshebra las setas y cocina con cebolla y jitomate.', 'Sirve sobre tostadas con lechuga.'], ingredientes: [{ nombre: 'Setas', cantidad: 0.4, unidad: 'kg', precioMXN: 33, categoriaTienda: 'frescos', diasCaducidad: 4 }, { nombre: 'Jitomate', cantidad: 0.4, unidad: 'kg', precioMXN: 14, categoriaTienda: 'frescos', diasCaducidad: 4 }, { nombre: 'Tostadas de maíz', cantidad: 1, unidad: 'paq', precioMXN: 24, categoriaTienda: 'abarrotes', diasCaducidad: 30 }] },
  { id: 'sopa-frijol-nopal', nombre: 'Sopa de frijol con nopal', tiempo: 'comida', porcionesBase: 4, minutos: 30, etiquetas: ['vegano', 'economico', 'mexicana'], alergenos: [], pasos: ['Licúa una parte de los frijoles con jitomate.', 'Agrega nopales y cocina hasta que estén suaves.'], ingredientes: [{ nombre: 'Frijol cocido o refrito', cantidad: 0.45, unidad: 'kg', precioMXN: 20, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Nopales frescos', cantidad: 0.3, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Jitomate', cantidad: 0.3, unidad: 'kg', precioMXN: 11, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'pasta-espinaca-jitomate', nombre: 'Pasta con espinaca y jitomate', tiempo: 'comida', porcionesBase: 4, minutos: 24, etiquetas: ['vegano', 'rapido'], alergenos: ['gluten'], pasos: ['Cuece la pasta.', 'Saltea jitomate y espinaca; mezcla y sirve.'], ingredientes: [{ nombre: 'Pasta espagueti', cantidad: 0.35, unidad: 'kg', precioMXN: 16, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Espinaca fresca', cantidad: 0.2, unidad: 'kg', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Jitomate', cantidad: 0.3, unidad: 'kg', precioMXN: 11, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'tacos-lenteja', nombre: 'Tacos de lentejas y verduras', tiempo: 'comida', porcionesBase: 4, minutos: 27, etiquetas: ['vegano', 'economico', 'mexicana'], alergenos: [], pasos: ['Cuece las lentejas con cebolla y comino.', 'Sirve en tortillas con col rallada.'], ingredientes: [{ nombre: 'Lentejas', cantidad: 0.35, unidad: 'kg', precioMXN: 18, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Tortillas de maíz', cantidad: 0.5, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Col', cantidad: 0.25, unidad: 'kg', precioMXN: 8, categoriaTienda: 'frescos', diasCaducidad: 10 }] },
  { id: 'estofado-garbanzos-verduras', nombre: 'Estofado de garbanzo y verduras', tiempo: 'comida', porcionesBase: 4, minutos: 32, etiquetas: ['vegano', 'saludable'], alergenos: [], pasos: ['Coloca garbanzos, papa, zanahoria y jitomate en una olla.', 'Cubre con agua y cocina hasta suavizar.'], ingredientes: [{ nombre: 'Garbanzo cocido', cantidad: 0.4, unidad: 'kg', precioMXN: 20, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Papa blanca', cantidad: 0.35, unidad: 'kg', precioMXN: 9, categoriaTienda: 'frescos', diasCaducidad: 15 }, { nombre: 'Zanahoria', cantidad: 0.25, unidad: 'kg', precioMXN: 8, categoriaTienda: 'frescos', diasCaducidad: 12 }] },
  { id: 'tacos-coliflor-poblano', nombre: 'Tacos de coliflor al poblano', tiempo: 'cena', porcionesBase: 4, minutos: 24, etiquetas: ['vegano', 'mexicana'], alergenos: [], pasos: ['Dora la coliflor en trozos con rajas de poblano.', 'Sirve en tortillas con salsa de jitomate.'], ingredientes: [{ nombre: 'Coliflor', cantidad: 0.45, unidad: 'kg', precioMXN: 25, categoriaTienda: 'frescos', diasCaducidad: 5 }, { nombre: 'Chile poblano', cantidad: 2, unidad: 'pzas', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 6 }, { nombre: 'Tortillas de maíz', cantidad: 0.4, unidad: 'kg', precioMXN: 10, categoriaTienda: 'frescos', diasCaducidad: 3 }] },
  { id: 'sopa-papa-puerro', nombre: 'Sopa de papa y poro', tiempo: 'cena', porcionesBase: 4, minutos: 30, etiquetas: ['vegano', 'economico'], alergenos: [], pasos: ['Saltea poro con papa en cubos.', 'Agrega agua y cocina; machaca ligeramente para espesar.'], ingredientes: [{ nombre: 'Papa blanca', cantidad: 0.45, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 15 }, { nombre: 'Poro', cantidad: 0.2, unidad: 'kg', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 6 }, { nombre: 'Cebolla blanca', cantidad: 0.15, unidad: 'kg', precioMXN: 5, categoriaTienda: 'frescos', diasCaducidad: 10 }] },
  { id: 'tostadas-verdura-asada', nombre: 'Tostadas de verduras asadas', tiempo: 'cena', porcionesBase: 4, minutos: 25, etiquetas: ['vegano', 'saludable'], alergenos: [], pasos: ['Asa calabacita, pimiento y cebolla.', 'Sirve sobre tostadas con aguacate.'], ingredientes: [{ nombre: 'Calabacita', cantidad: 0.35, unidad: 'kg', precioMXN: 11, categoriaTienda: 'frescos', diasCaducidad: 5 }, { nombre: 'Pimiento morrón', cantidad: 2, unidad: 'pzas', precioMXN: 20, categoriaTienda: 'frescos', diasCaducidad: 5 }, { nombre: 'Tostadas de maíz', cantidad: 1, unidad: 'paq', precioMXN: 24, categoriaTienda: 'abarrotes', diasCaducidad: 30 }] },
  { id: 'bowl-frijol-arroz-maiz', nombre: 'Bowl de frijol, arroz y maíz', tiempo: 'cena', porcionesBase: 4, minutos: 20, etiquetas: ['vegano', 'economico'], alergenos: [], pasos: ['Calienta frijoles, arroz y elote por separado.', 'Sirve en tazones con jitomate y limón.'], ingredientes: [{ nombre: 'Frijol cocido o refrito', cantidad: 0.35, unidad: 'kg', precioMXN: 16, categoriaTienda: 'abarrotes', diasCaducidad: 5 }, { nombre: 'Arroz blanco', cantidad: 0.25, unidad: 'kg', precioMXN: 9, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Elote desgranado', cantidad: 0.2, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'fajitas-setas-pimiento', nombre: 'Fajitas de setas y pimiento', tiempo: 'cena', porcionesBase: 4, minutos: 20, etiquetas: ['vegano', 'rapido'], alergenos: [], pasos: ['Corta setas y pimientos en tiras.', 'Saltea con cebolla y sirve con tortillas.'], ingredientes: [{ nombre: 'Setas', cantidad: 0.3, unidad: 'kg', precioMXN: 25, categoriaTienda: 'frescos', diasCaducidad: 4 }, { nombre: 'Pimiento morrón', cantidad: 2, unidad: 'pzas', precioMXN: 20, categoriaTienda: 'frescos', diasCaducidad: 5 }, { nombre: 'Tortillas de maíz', cantidad: 0.4, unidad: 'kg', precioMXN: 10, categoriaTienda: 'frescos', diasCaducidad: 3 }] },
  { id: 'calabaza-lentejas', nombre: 'Calabaza con lentejas especiadas', tiempo: 'cena', porcionesBase: 4, minutos: 30, etiquetas: ['vegano', 'saludable'], alergenos: [], pasos: ['Cuece las lentejas con trozos de calabaza.', 'Sazona con comino y sirve caliente.'], ingredientes: [{ nombre: 'Lentejas', cantidad: 0.3, unidad: 'kg', precioMXN: 15, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Calabaza', cantidad: 0.4, unidad: 'kg', precioMXN: 16, categoriaTienda: 'frescos', diasCaducidad: 7 }, { nombre: 'Jitomate', cantidad: 0.25, unidad: 'kg', precioMXN: 9, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'ramen-verduras', nombre: 'Sopa de fideos con verduras', tiempo: 'cena', porcionesBase: 4, minutos: 22, etiquetas: ['vegano', 'rapido'], alergenos: ['gluten'], pasos: ['Cuece los fideos en agua con jengibre y ajo.', 'Agrega zanahoria y champiñones; sirve caliente.'], ingredientes: [{ nombre: 'Fideos', cantidad: 0.25, unidad: 'kg', precioMXN: 16, categoriaTienda: 'abarrotes', diasCaducidad: 180 }, { nombre: 'Zanahoria', cantidad: 0.2, unidad: 'kg', precioMXN: 6, categoriaTienda: 'frescos', diasCaducidad: 12 }, { nombre: 'Champiñones', cantidad: 0.2, unidad: 'kg', precioMXN: 18, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
  { id: 'enchiladas-papa-salsa', nombre: 'Enchiladas de papa con salsa roja', tiempo: 'cena', porcionesBase: 4, minutos: 28, etiquetas: ['vegano', 'economico', 'mexicana'], alergenos: [], pasos: ['Rellena tortillas con papa machacada.', 'Cubre con salsa roja de jitomate y sirve con cebolla.'], ingredientes: [{ nombre: 'Papa blanca', cantidad: 0.45, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 15 }, { nombre: 'Tortillas de maíz', cantidad: 0.5, unidad: 'kg', precioMXN: 12, categoriaTienda: 'frescos', diasCaducidad: 3 }, { nombre: 'Jitomate', cantidad: 0.4, unidad: 'kg', precioMXN: 14, categoriaTienda: 'frescos', diasCaducidad: 4 }] },
];
RECETAS_BASE.push(...RECETAS_MAS);

/**
 * Mapa de sustitutos más baratos para ingredientes costosos.
 * El usuario puede aplicar estos cambios con un clic desde el menú o la lista.
 */
const SUSTITUTOS_ECONOMICOS = [
  {
    original: "Pechuga de pollo",
    sustituto: "Muslo de pollo",
    factorPrecio: 0.65,
    motivo: "El muslo es más jugoso y cuesta ~35% menos por kilo."
  },
  {
    original: "Carne molida de res",
    sustituto: "Carne molida mixta (cerdo/res) o lentejas",
    factorPrecio: 0.68,
    motivo: "Reduce el costo por porción hasta en 30%."
  },
  {
    original: "Queso panela",
    sustituto: "Requesón o queso fresco local",
    factorPrecio: 0.72,
    motivo: "El requesón en mercado es más económico y rinde muy bien."
  },
  {
    original: "Queso Oaxaca",
    sustituto: "Queso fresco rallado",
    factorPrecio: 0.75,
    motivo: "Ahorra alrededor de 25% sin sacrificar sabor."
  },
  {
    original: "Atún en lata",
    sustituto: "Sardina o garbanzo machacado",
    factorPrecio: 0.65,
    motivo: "Alternativa rica en proteína a menor precio."
  },
  {
    original: "Aguacate",
    sustituto: "Salsa verde cocida de calabacita",
    factorPrecio: 0.45,
    motivo: "Textura cremosa tipo guacamole por menos de la mitad del precio."
  }
];

/* ==========================================================================
   2. ESTADO GLOBAL Y PERSISTENCIA EN localStorage
   ========================================================================== */

const CLAVE_STORAGE = "planeador_comida_despensa_v1";

const ESTADO_INICIAL = {
  perfil: {
    presupuesto: 1500,
    personas: 4,
    gustos: ["mexicana", "pollo", "verduras", "economico"],
    restricciones: [],
    restriccionesTexto: "",
    tiendas: ["Walmart", "Mercado", "Tianguis"]
  },
  menuSemanal: [],
  comprados: {}, // { claveIngrediente: true }
  sustitucionesAplicadas: {}, // { nombreOriginal: { sustituto, factorPrecio } }
  despensa: [
    { id: "desp-1", nombre: "Jitomate", cantidad: "500 g", diasCaducidad: 2 },
    { id: "desp-2", nombre: "Espinaca fresca", cantidad: "1 manojo", diasCaducidad: 2 },
    { id: "desp-3", nombre: "Frijol cocido o refrito", cantidad: "500 g", diasCaducidad: 5 },
    { id: "desp-4", nombre: "Arroz blanco", cantidad: "1 kg", diasCaducidad: 60 }
  ],
};

let estado = cargarEstado();
let vistaActual = "familia";

/**
 * Carga el estado guardado en localStorage o usa una copia limpia del inicial.
 */
function cargarEstado() {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if (!guardado) {
      return structuredClone(ESTADO_INICIAL);
    }
    const parsed = JSON.parse(guardado);
    return {
      ...structuredClone(ESTADO_INICIAL),
      ...parsed,
      perfil: {
        ...ESTADO_INICIAL.perfil,
        ...(parsed.perfil || {})
      }
    };
  } catch (error) {
    console.warn("No se pudo leer localStorage, usando estado inicial:", error);
    return structuredClone(ESTADO_INICIAL);
  }
}

/**
 * Guarda todo el estado actual en localStorage.
 */
function guardarEstado() {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
  } catch (error) {
    console.warn("No se pudo guardar en localStorage:", error);
  }
}

/* ==========================================================================
   3. FUNCIONES AUXILIARES DE FORMATO Y CÁLCULO
   ========================================================================== */

function formatearMXN(cantidad) {
  const redondeado = Math.round(Number(cantidad) || 0);
  return `$${redondeado.toLocaleString("es-MX")} MXN`;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function emojiParaIngrediente(nombre) {
  const texto = normalizarTexto(nombre);
  if (/pollo|pavo|res|cerdo|carne|bistec|atun|pescado|sardina|camaron/.test(texto)) return /atun|pescado|sardina|camaron/.test(texto) ? "🐟" : "🍗";
  if (/huevo/.test(texto)) return "🥚";
  if (/leche|queso|yogur|crema|mantequilla/.test(texto)) return "🧀";
  if (/jitomate|tomate/.test(texto)) return "🍅";
  if (/cebolla/.test(texto)) return "🧅";
  if (/frijol|lenteja|garbanzo/.test(texto)) return "🫘";
  if (/aguacate/.test(texto)) return "🥑";
  if (/platano|banana/.test(texto)) return "🍌";
  if (/manzana/.test(texto)) return "🍎";
  if (/arroz/.test(texto)) return "🍚";
  if (/pasta|espagueti|fideo/.test(texto)) return "🍝";
  if (/tortilla|tostada|totopo|bolillo|pan/.test(texto)) return "🌮";
  if (/papa/.test(texto)) return "🥔";
  if (/zanahoria/.test(texto)) return "🥕";
  if (/lechuga|espinaca|col|nopal|calabacita|verdura/.test(texto)) return "🥬";
  if (/limon/.test(texto)) return "🍋";
  if (/champi|seta/.test(texto)) return "🍄";
  if (/elote|maiz/.test(texto)) return "🌽";
  if (/pepino/.test(texto)) return "🥒";
  if (/manojo|cilantro|epazote|perejil|hierba/.test(texto)) return "🌿";
  if (/mango/.test(texto)) return "🥭";
  if (/papaya/.test(texto)) return "🍈";
  if (/fresa/.test(texto)) return "🍓";
  if (/naranja/.test(texto)) return "🍊";
  if (/ch[ií]a|quinoa|avena|harina/.test(texto)) return "🌾";
  if (/tofu|soya|soja/.test(texto)) return "🧊";
  if (/brocoli/.test(texto)) return "🥦";
  if (/coliflor/.test(texto)) return "🥦";
  if (/calabaza/.test(texto)) return "🎃";
  if (/camote/.test(texto)) return "🍠";
  if (/ajo/.test(texto)) return "🧄";
  if (/agua/.test(texto)) return "💧";
  if (/poro|puerro/.test(texto)) return "🧅";
  if (/aceite|sal|azucar|canela|comino|curry|pimienta|chipotle|jengibre/.test(texto)) return "🧂";
  if (/soya|salsa|chile|poblano/.test(texto)) return "🌶️";
  return "❓";
}

function obtenerRecetaPorId(id) {
  return RECETAS_BASE.find((r) => r.id === id) || null;
}

/**
 * Calcula el precio efectivo de un ingrediente aplicando escala de personas
 * y cualquier sustitución económica que el usuario haya activado.
 */
function obtenerIngredienteEfectivo(ingrediente, personas, porcionesBase = 4) {
  const factorPersonas = personas / porcionesBase;
  const sustitucion = estado.sustitucionesAplicadas[ingrediente.nombre];

  const nombreFinal = sustitucion ? sustitucion.sustituto : ingrediente.nombre;
  const factorPrecio = sustitucion ? sustitucion.factorPrecio : 1;

  return {
    ...ingrediente,
    nombreOriginal: ingrediente.nombre,
    nombre: nombreFinal,
    esSustituido: Boolean(sustitucion),
    cantidadEscalada: Number((ingrediente.cantidad * factorPersonas).toFixed(2)),
    precioEscalado: ingrediente.precioMXN * factorPersonas * factorPrecio
  };
}

/**
 * Calcula el costo total de una receta para el número de personas actual.
 */
function calcularCostoReceta(receta, personas = estado.perfil.personas) {
  return receta.ingredientes.reduce((suma, ing) => {
    const efectivo = obtenerIngredienteEfectivo(ing, personas, receta.porcionesBase);
    return suma + efectivo.precioEscalado;
  }, 0);
}

/** Preferencias de dieta seleccionadas en el panel de alimentación. */
function obtenerDietasSeleccionadas() {
  try {
    const guardadas = JSON.parse(localStorage.getItem("planeadorPreferenciasAlimentacion") || "{}");
    return Array.isArray(guardadas.dietas) ? guardadas.dietas : [];
  } catch {
    return [];
  }
}

/** Detecta ingredientes animales tanto en la lista de compra como en los pasos. */
function recetaEsVegana(receta) {
  const texto = normalizarTexto([
    receta.nombre,
    ...(receta.ingredientes || []).map((ingrediente) => ingrediente.nombre),
    ...(receta.pasos || [])
  ].join(" "));
  const productosAnimales = /\b(huevos?|leche|quesos?|yogur|yogurt|crema|mantequilla|requeson|pollo|pavo|res|cerdo|puerco|carne|tocino|jamon|salchicha|chorizo|pescado|atun|sardina|mariscos?|camaron|pulpo|calamar|filete|miel|gelatina|manteca|suero|caseina|mayonesa)\b|caldo de (pollo|carne|res|pescado)/;
  const categoriaLactea = (receta.ingredientes || []).some((ingrediente) => ingrediente.categoriaTienda === "lacteos");
  return !categoriaLactea && !productosAnimales.test(texto);
}

/**
 * Verifica si una receta cumple con alergias, restricciones y dieta elegida.
 */
function recetaEsCompatible(receta, perfil = estado.perfil) {
  // 1. Revisamos alergias seleccionadas en checkboxes
  const tieneAlergeno = receta.alergenos.some((alergeno) =>
    perfil.restricciones.includes(alergeno)
  );
  if (tieneAlergeno) return false;

  const dietas = obtenerDietasSeleccionadas();
  const textoIngredientes = normalizarTexto((receta.ingredientes || []).map((i) => i.nombre).join(" "));
  const textoReceta = normalizarTexto(`${receta.nombre} ${(receta.pasos || []).join(" ")} ${textoIngredientes}`);
  const contieneCarneOPescado = /\b(pollo|pavo|res|cerdo|puerco|carne|tocino|jamon|salchicha|chorizo|pescado|atun|sardina|mariscos?|camaron|pulpo|calamar|filete)\b/;

  if (dietas.includes("vegana") && !recetaEsVegana(receta)) return false;
  if (dietas.includes("vegetariana") && contieneCarneOPescado.test(textoReceta)) return false;
  if (dietas.includes("sin-lactosa") && (receta.alergenos.includes("lacteos") || (receta.ingredientes || []).some((i) => i.categoriaTienda === "lacteos"))) return false;
  if (dietas.includes("sin-gluten") && receta.alergenos.includes("gluten")) return false;

  // 2. Revisamos texto libre de ingredientes evitados
  const palabrasEvitar = (perfil.restriccionesTexto || "")
    .split(",")
    .map((p) => normalizarTexto(p))
    .filter(Boolean);

  if (palabrasEvitar.length > 0) {
    const nombresIngredientes = receta.ingredientes
      .map((i) => normalizarTexto(i.nombre))
      .join(" ");
    const nombreReceta = normalizarTexto(receta.nombre);

    const contieneProhibido = palabrasEvitar.some(
      (palabra) =>
        nombresIngredientes.includes(palabra) || nombreReceta.includes(palabra)
    );
    if (contieneProhibido) return false;
  }

  return true;
}

/**
 * Puntúa una receta según los gustos del usuario.
 */
function puntuarReceta(receta, perfil) {
  let puntos = 1;
  const gustosNorm = perfil.gustos.map(normalizarTexto);

  receta.etiquetas.forEach((etiqueta) => {
    if (gustosNorm.some((g) => g.includes(etiqueta) || etiqueta.includes(g))) {
      puntos += 3;
    }
  });

  // Ligero factor aleatorio para variar cuando el usuario regenera el menú
  return puntos + Math.random() * 2;
}

/**
 * Genera un menú semanal completo (7 días x 3 tiempos).
 * Si modoEconomico = true, prioriza las recetas más baratas.
 */
function generarMenuSemanal(modoEconomico = false) {
  const perfil = estado.perfil;
  const menuBase = [];
  const objetivo = (() => {
    try { return JSON.parse(localStorage.getItem("planeadorPreferenciasAlimentacion") || "{}").objetivo || ""; }
    catch { return ""; }
  })();
  const tiempos = ["desayuno", "comida", "cena"];

  const candidatasPorTiempo = Object.fromEntries(tiempos.map((tiempo) => {
    let candidatas = RECETAS_BASE.filter((r) => r.tiempo === tiempo && recetaEsCompatible(r, perfil));
    // Solo relaja restricciones antiguas si no hay filtros de dieta seleccionados.
    if (!candidatas.length && obtenerDietasSeleccionadas().length === 0) {
      candidatas = RECETAS_BASE.filter((r) => r.tiempo === tiempo);
    }
    return [tiempo, candidatas.map((receta) => ({ receta, costo: calcularCostoReceta(receta) }))];
  }));

  const tiempoSinOpciones = Object.entries(candidatasPorTiempo).find(([, opciones]) => opciones.length === 0);
  if (tiempoSinOpciones) {
    mostrarNotificacion(`No hay recetas compatibles para ${tiempoSinOpciones[0]}. Cambia algún filtro de dieta para generar el menú.`);
    return;
  }

  // Representamos cada desayuno, comida y cena como una decisión presupuestaria independiente.
  const espacios = DIAS_SEMANA.flatMap((dia) => tiempos.map((tiempo) => ({ dia, tiempo })));
  const costoMinimoRestante = Array(espacios.length + 1).fill(0);
  for (let i = espacios.length - 1; i >= 0; i--) {
    const opciones = candidatasPorTiempo[espacios[i].tiempo];
    costoMinimoRestante[i] = costoMinimoRestante[i + 1] + Math.min(...opciones.map((o) => o.costo));
  }

  const presupuesto = Math.max(0, Number(perfil.presupuesto) || 0);
  const combinacionPosible = costoMinimoRestante[0] <= presupuesto;
  let restante = presupuesto;
  const seleccion = [];

  espacios.forEach((espacio, indice) => {
    const opciones = candidatasPorTiempo[espacio.tiempo];
    const maximoActual = combinacionPosible
      ? Math.max(0, restante - costoMinimoRestante[indice + 1])
      : Infinity;
    let disponibles = opciones.filter((o) => o.costo <= maximoActual + 0.001);
    if (!disponibles.length) disponibles = opciones;

    // Ahorro ordena por costo. En los otros modos, conserva los gustos cuando
    // varias recetas caben en el presupuesto, con una preferencia moderada por menor costo.
    const ahorroActivo = modoEconomico || objetivo === "ahorro";
    const conPuntaje = disponibles.map((op) => ({
      ...op,
      utilidad: puntuarReceta(op.receta, perfil) * 10 - op.costo / Math.max(1, presupuesto) * 5
    }));
    conPuntaje.sort((a, b) => ahorroActivo
      ? a.costo - b.costo
      : b.utilidad - a.utilidad || a.costo - b.costo);

    const elegido = conPuntaje[0];
    seleccion.push({ dia: espacio.dia, tiempo: espacio.tiempo, id: elegido.receta.id, costo: elegido.costo });
    restante -= elegido.costo;
  });

  const nuevoMenu = DIAS_SEMANA.map((dia) => {
    const comidasDia = seleccion.filter((item) => item.dia === dia);
    return {
      dia,
      desayuno: comidasDia.find((item) => item.tiempo === "desayuno").id,
      comida: comidasDia.find((item) => item.tiempo === "comida").id,
      cena: comidasDia.find((item) => item.tiempo === "cena").id
    };
  });

  estado.menuSemanal = nuevoMenu;
  guardarEstado();
}

/* ==========================================================================
   4. LISTA DE COMPRAS AGRUPADA POR TIENDA
   ========================================================================== */

/**
 * Asigna la tienda más adecuada según la categoría del ingrediente y las
 * tiendas que el usuario tiene marcadas.
 */
function asignarTienda(categoriaTienda, tiendasUsuario) {
  const tiendas = tiendasUsuario.length ? tiendasUsuario : ["Supermercado"];

  const buscarPrimera = (preferidas) =>
    preferidas.find((t) => tiendas.includes(t));

  if (categoriaTienda === "frescos") {
    return (
      buscarPrimera(["Tianguis", "Mercado", "Soriana", "Walmart", "Chedraui", "Bodega Aurrera"]) ||
      tiendas[0]
    );
  }

  if (categoriaTienda === "proteina") {
    return (
      buscarPrimera(["Mercado", "Soriana", "Walmart", "Chedraui", "Bodega Aurrera", "Tianguis"]) ||
      tiendas[0]
    );
  }

  // Abarrotes y lácteos suelen comprarse en supermercado
  return (
    buscarPrimera(["Walmart", "Bodega Aurrera", "Soriana", "Chedraui", "Mercado", "Tianguis"]) ||
    tiendas[tiendas.length - 1]
  );
}

/**
 * Consolida todos los ingredientes del menú semanal en una lista agrupada por tienda.
 */
function construirListaCompras() {
  const mapaIngredientes = new Map();
  const personas = estado.perfil.personas;
  const tiendas = estado.perfil.tiendas;

  estado.menuSemanal.forEach((diaObj) => {
    TIEMPOS_COMIDA.forEach(({ clave }) => {
      const receta = obtenerRecetaPorId(diaObj[clave]);
      if (!receta) return;

      receta.ingredientes.forEach((ing) => {
        const efectivo = obtenerIngredienteEfectivo(ing, personas, receta.porcionesBase);
        const claveUnica = `${normalizarTexto(efectivo.nombre)}__${efectivo.unidad}`;

        if (!mapaIngredientes.has(claveUnica)) {
          mapaIngredientes.set(claveUnica, {
            clave: claveUnica,
            nombre: efectivo.nombre,
            nombreOriginal: efectivo.nombreOriginal,
            esSustituido: efectivo.esSustituido,
            cantidad: 0,
            unidad: efectivo.unidad,
            precioEstimado: 0,
            tienda: asignarTienda(efectivo.categoriaTienda, tiendas),
            diasCaducidad: efectivo.diasCaducidad
          });
        }

        const acumulado = mapaIngredientes.get(claveUnica);
        acumulado.cantidad = Number((acumulado.cantidad + efectivo.cantidadEscalada).toFixed(2));
        acumulado.precioEstimado += efectivo.precioEscalado;
      });
    });
  });

  // Agrupamos por tienda
  const porTienda = {};
  let totalGeneral = 0;
  let totalFaltante = 0;

  mapaIngredientes.forEach((item) => {
    if (!porTienda[item.tienda]) {
      porTienda[item.tienda] = {
        tienda: item.tienda,
        subtotal: 0,
        items: []
      };
    }

    const yaComprado = Boolean(estado.comprados[item.clave]);
    porTienda[item.tienda].items.push({ ...item, comprado: yaComprado });
    porTienda[item.tienda].subtotal += item.precioEstimado;
    totalGeneral += item.precioEstimado;
    if (!yaComprado) {
      totalFaltante += item.precioEstimado;
    }
  });

  return {
    grupos: Object.values(porTienda),
    totalGeneral,
    totalFaltante,
    totalArticulos: mapaIngredientes.size
  };
}

/**
 * Encuentra sustitutos económicos aplicables al menú actual.
 */
function obtenerSustitutosDisponibles() {
  const { grupos } = construirListaCompras();
  const todosItems = grupos.flatMap((g) => g.items);
  const sugerencias = [];

  SUSTITUTOS_ECONOMICOS.forEach((sub) => {
    if (estado.sustitucionesAplicadas[sub.original]) return;

    const encontrado = todosItems.find(
      (item) => normalizarTexto(item.nombreOriginal) === normalizarTexto(sub.original)
    );

    if (encontrado) {
      const ahorro = encontrado.precioEstimado * (1 - sub.factorPrecio);
      if (ahorro >= 8) {
        sugerencias.push({
          ...sub,
          ahorroEstimado: Math.round(ahorro)
        });
      }
    }
  });

  return sugerencias;
}

/* ==========================================================================
   5. DESPENSA Y SUGERENCIAS DE RECETAS POR CADUCIDAD
   ========================================================================== */

/**
 * Agrega un ingrediente a la despensa si no existe ya (o actualiza su cantidad).
 */
function agregarADespensa(nombre, cantidad, diasCaducidad) {
  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) return;

  const existente = estado.despensa.find(
    (item) => normalizarTexto(item.nombre) === normalizarTexto(nombreLimpio)
  );

  if (existente) {
    existente.cantidad = cantidad;
    existente.diasCaducidad = Math.min(Number(existente.diasCaducidad), Number(diasCaducidad));
  } else {
    estado.despensa.push({
      id: `desp-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      nombre: nombreLimpio,
      cantidad: cantidad || "1 porción",
      diasCaducidad: Number(diasCaducidad) || 4
    });
  }

  guardarEstado();
}

/**
 * Sugiere recetas basadas en los ingredientes de la despensa, dando máxima
 * prioridad a las que usan ingredientes que se echan a perder primero.
 */
function obtenerRecetasSegunDespensa() {
  if (estado.despensa.length === 0) return [];

  const recetasCompatibles = RECETAS_BASE.filter((r) =>
    recetaEsCompatible(r, estado.perfil)
  );

  const resultados = recetasCompatibles
    .map((receta) => {
      const coincidencias = [];
      const faltantes = [];
      let puntajeUrgencia = 0;

      receta.ingredientes.forEach((ing) => {
        const ingNorm = normalizarTexto(ing.nombre);
        const enDespensa = estado.despensa.find((d) => {
          const despNorm = normalizarTexto(d.nombre);
          return despNorm.includes(ingNorm) || ingNorm.includes(despNorm);
        });

        if (enDespensa) {
          coincidencias.push({
            nombre: ing.nombre,
            diasCaducidad: Number(enDespensa.diasCaducidad)
          });
          // Entre menos días le queden, más puntos de prioridad recibe
          if (enDespensa.diasCaducidad <= 2) {
            puntajeUrgencia += 12;
          } else if (enDespensa.diasCaducidad <= 5) {
            puntajeUrgencia += 5;
          } else {
            puntajeUrgencia += 1;
          }
        } else {
          faltantes.push(ing.nombre);
        }
      });

      return {
        receta,
        coincidencias,
        faltantes,
        puntajeTotal: puntajeUrgencia + coincidencias.length * 2
      };
    })
    .filter((r) => r.coincidencias.length > 0)
    .sort((a, b) => b.puntajeTotal - a.puntajeTotal);

  return resultados.slice(0, 6);
}

/* ==========================================================================
   6. RENDERIZADO DEL DOM
   ========================================================================== */

function mostrarNotificacion(mensaje) {
  const el = document.getElementById("notificacion");
  el.textContent = mensaje;
  el.classList.add("visible");
  clearTimeout(mostrarNotificacion._timer);
  mostrarNotificacion._timer = setTimeout(() => {
    el.classList.remove("visible");
  }, 2800);
}

function cambiarVista(nombreVista) {
  vistaActual = nombreVista;

  document.querySelectorAll(".seccion-vista").forEach((sec) => {
    sec.classList.toggle("activa", sec.id === `seccion-${nombreVista}`);
  });

  document.querySelectorAll(".pestana").forEach((btn) => {
    const activa = btn.dataset.vista === nombreVista;
    btn.classList.toggle("activa", activa);
    btn.setAttribute("aria-selected", String(activa));
  });

  document.querySelectorAll(".navegacion__enlace").forEach((enlace) => {
    enlace.classList.toggle("activo", enlace.dataset.vista === nombreVista);
  });

  const destino = document.getElementById(`seccion-${nombreVista}`);
  const slider = document.getElementById("slider-vistas");
  if (destino && slider) {
    const paginas = [...slider.querySelectorAll(":scope > .seccion-vista")];
    const indice = paginas.indexOf(destino);
    if (indice >= 0) slider.scrollTo({ left: slider.clientWidth * indice, behavior: "smooth" });
    window.subirPaginaSuave?.();
  }
}

/**
 * Actualiza el panel superior de presupuesto semanal y alertas.
 */
function renderResumenPresupuesto() {
  const { totalGeneral } = construirListaCompras();
  const presupuesto = Number(estado.perfil.presupuesto) || 0;
  const diferencia = presupuesto - totalGeneral;
  const porcentaje = presupuesto > 0 ? Math.min(100, Math.round((totalGeneral / presupuesto) * 100)) : 0;

  document.getElementById("resumen-presupuesto").textContent = formatearMXN(presupuesto);
  document.getElementById("resumen-costo").textContent = formatearMXN(totalGeneral);
  document.getElementById("resumen-personas").textContent =
    `${estado.perfil.personas} ${estado.perfil.personas === 1 ? "persona" : "personas"}`;

  const elDif = document.getElementById("resumen-diferencia");
  elDif.textContent = diferencia >= 0
    ? `Te sobran ${formatearMXN(diferencia)}`
    : `Te pasas por ${formatearMXN(Math.abs(diferencia))}`;
  elDif.className = "metrica__valor numero " +
    (diferencia >= 0 ? "metrica__valor--exito" : "metrica__valor--peligro");

  const barra = document.getElementById("barra-presupuesto");
  barra.style.width = `${porcentaje}%`;
  barra.className = "barra-progreso__relleno";
  document.getElementById("barra-presupuesto-aria").setAttribute("aria-valuenow", String(porcentaje));

  if (diferencia < 0) {
    barra.classList.add("barra-progreso__relleno--peligro");
  } else if (porcentaje >= 85) {
    barra.classList.add("barra-progreso__relleno--aviso");
  }
}

function actualizarSelectorPersonas(valor) {
  const selector = document.getElementById("selector-personas");
  const input = document.getElementById("input-personas");
  if (!selector || !input) return;
  const cantidad = Math.min(10, Math.max(1, Number(valor) || 1));
  input.value = cantidad;

  if (!selector.dataset.creado) {
    selector.innerHTML = Array.from({ length: 10 }, (_, indice) => {
      const numero = indice + 1;
      return `<button type="button" class="burbuja-personas" role="radio" aria-checked="false" data-personas="${numero}">${numero}</button>`;
    }).join("");
    selector.dataset.creado = "true";
  }

  selector.querySelectorAll("[data-personas]").forEach((boton) => {
    const activa = Number(boton.dataset.personas) === cantidad;
    boton.classList.toggle("activa", activa);
    boton.setAttribute("aria-checked", String(activa));
  });
  const figuras = document.getElementById("ilustracion-personas");
  const texto = document.getElementById("texto-personas-ilustrado");
  if (figuras) figuras.innerHTML = Array.from({ length: Math.min(cantidad, 5) }, (_, i) => `<span class="persona-figura persona-figura--${i + 1}">🧍</span>`).join("");
  if (texto) texto.textContent = `${cantidad} ${cantidad === 1 ? "persona" : "personas"}`;
}

/**
 * Rellena el formulario de perfil familiar con los valores guardados.
 */
function renderFormularioPerfil() {
  const { perfil } = estado;
  perfil.personas = Math.min(10, Math.max(1, Number(perfil.personas) || 1));
  document.getElementById("input-presupuesto").value = perfil.presupuesto;
  document.getElementById("input-personas").value = perfil.personas;
  actualizarSelectorPersonas(perfil.personas);
  document.getElementById("input-gustos").value = perfil.gustos.join(", ");
  document.getElementById("input-restricciones-extra").value = perfil.restriccionesTexto || "";

  // Botones rápidos de gustos
  const gustosNorm = perfil.gustos.map(normalizarTexto);
  document.querySelectorAll("#gustos-rapidos .boton-opcion").forEach((btn) => {
    const activo = gustosNorm.includes(normalizarTexto(btn.dataset.gusto));
    btn.classList.toggle("seleccionado", activo);
  });

  // Checkboxes de restricciones
  document.querySelectorAll("#checks-restricciones input[type='checkbox']").forEach((chk) => {
    chk.checked = perfil.restricciones.includes(chk.value);
  });

  // Checkboxes de tiendas (incluyendo personalizadas)
  const contenedorTiendas = document.getElementById("checks-tiendas");
  const tiendasBase = Array.from(
    contenedorTiendas.querySelectorAll("input[type='checkbox']")
  ).map((i) => i.value);

  perfil.tiendas.forEach((tienda) => {
    if (!tiendasBase.includes(tienda)) {
      const label = document.createElement("label");
      label.className = "check-caja";
      label.innerHTML = `<input type="checkbox" value="${tienda}" checked /> ${tienda}`;
      contenedorTiendas.appendChild(label);
    }
  });

  contenedorTiendas.querySelectorAll("input[type='checkbox']").forEach((chk) => {
    chk.checked = perfil.tiendas.includes(chk.value);
  });
}

/**
 * Renderiza el bloque de sustitutos más baratos (usado en Menú y Lista de compras).
 */
function renderPanelSustitutos(idContenedor) {
  const contenedor = document.getElementById(idContenedor);
  const sustitutos = obtenerSustitutosDisponibles();

  if (sustitutos.length === 0) {
    contenedor.classList.add("oculto");
    contenedor.innerHTML = "";
    return;
  }

  contenedor.classList.remove("oculto");
  contenedor.innerHTML = `
    <h3 class="panel-sustitutos__titulo">Sustitutos más baratos disponibles para tu menú</h3>
    <div class="lista-sustitutos">
      ${sustitutos
        .map(
          (sub) => `
          <div class="item-sustituto">
            <div>
              <div class="item-sustituto__texto">
                Cambia <strong>${sub.original}</strong> por <strong>${sub.sustituto}</strong>
              </div>
              <div class="item-sustituto__ahorro">
                Ahorro estimado: ~${formatearMXN(sub.ahorroEstimado)} · ${sub.motivo}
              </div>
            </div>
            <button type="button" class="boton boton--secundario boton--chico" data-aplicar-sustituto="${sub.original}">
              Aplicar cambio
            </button>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

/**
 * Renderiza la cuadrícula del menú semanal (7 días).
 */
function renderMenuSemanal() {
  const contenedor = document.getElementById("grid-menu-semanal");
  const subtitulo = document.getElementById("subtitulo-menu");
  subtitulo.textContent = `Desayuno, comida y cena de lunes a domingo · Porciones escaladas para ${estado.perfil.personas} ${estado.perfil.personas === 1 ? "persona" : "personas"}.`;

  renderPanelSustitutos("contenedor-sustitutos-menu");

  if (!estado.menuSemanal.length) {
    contenedor.innerHTML = `<p class="estado-vacio">Todavía no has generado un menú. Presiona "Generar menú" arriba.</p>`;
    return;
  }

  contenedor.innerHTML = estado.menuSemanal
    .map((diaObj, idxDia) => {
      let totalDia = 0;

      const bloquesHTML = TIEMPOS_COMIDA.map(({ clave, etiqueta }) => {
        const receta = obtenerRecetaPorId(diaObj[clave]);
        if (!receta) return "";

        const costo = calcularCostoReceta(receta);
        totalDia += costo;
        return `
          <div class="comida-bloque">
            <div class="comida-bloque__meta">
              <span>${etiqueta} · ${receta.minutos} min</span>
              <span class="numero">${formatearMXN(costo)}</span>
            </div>
            <div class="comida-bloque__fila">
              <button type="button" class="comida-bloque__titulo" data-ver-receta="${receta.id}">
                ${receta.nombre}
              </button>
              <div class="comida-bloque__acciones">
                <button
                  type="button"
                  class="boton-icono"
                  title="Cambiar este platillo"
                  data-cambiar-comida="${idxDia}:${clave}"
                >Cambiar</button>
              </div>
            </div>
          </div>
        `;
      }).join("");

      return `
        <article class="tarjeta-dia">
          <div class="tarjeta-dia__cabecera">
            <h3 class="tarjeta-dia__nombre">${diaObj.dia}</h3>
            <span class="tarjeta-dia__total numero">${formatearMXN(totalDia)}</span>
          </div>
          ${bloquesHTML}
        </article>
      `;
    })
    .join("");
}

/**
 * Renderiza la lista de compras dividida por tienda.
 */
function renderListaCompras() {
  const { grupos, totalGeneral, totalFaltante, totalArticulos } = construirListaCompras();
  const barra = document.getElementById("resumen-compras-barra");
  const grid = document.getElementById("grid-lista-compras");

  renderPanelSustitutos("contenedor-sustitutos-lista");

  const compradosCount = grupos
    .flatMap((g) => g.items)
    .filter((i) => i.comprado).length;

  barra.innerHTML = `
    <span>Artículos en lista: <strong class="numero">${totalArticulos}</strong> · Marcados en casa o comprados: <strong class="numero">${compradosCount}</strong></span>
    <span>Falta por gastar: <strong class="numero">${formatearMXN(totalFaltante)}</strong> de <strong class="numero">${formatearMXN(totalGeneral)}</strong></span>
  `;

  if (grupos.length === 0) {
    grid.innerHTML = `<p class="estado-vacio">Genera primero tu menú semanal para armar tu lista de compras por tienda.</p>`;
    return;
  }

  grid.innerHTML = grupos
    .map((grupo) => {
      const itemsHTML = grupo.items
        .map(
          (item) => `
          <li class="item-compra ${item.comprado ? "item-compra--comprado" : ""}">
            <label class="item-compra__label">
              <input
                type="checkbox"
                data-check-compra="${item.clave}"
                data-nombre="${item.nombre}"
                data-cantidad="${item.cantidad} ${item.unidad}"
                data-caducidad="${item.diasCaducidad}"
                ${item.comprado ? "checked" : ""}
              />
              <span>
                <span class="item-compra__nombre"><span class="emoji-ingrediente" aria-hidden="true">${emojiParaIngrediente(item.nombre)}</span> ${item.nombre}${item.esSustituido ? " (sustituto)" : ""}</span>
                <span class="item-compra__cantidad numero">${item.cantidad} ${item.unidad}</span>
              </span>
            </label>
            <span class="item-compra__precio numero">
              ${item.comprado ? "En despensa" : formatearMXN(item.precioEstimado)}
            </span>
          </li>
        `
        )
        .join("");

      return `
        <article class="tarjeta-tienda">
          <div class="tarjeta-tienda__cabecera">
            <h3 class="tarjeta-tienda__nombre">${grupo.tienda}</h3>
            <span class="tarjeta-tienda__subtotal numero">${formatearMXN(grupo.subtotal)}</span>
          </div>
          <ul class="lista-ingredientes">${itemsHTML}</ul>
        </article>
      `;
    })
    .join("");
}

/**
 * Renderiza la despensa ordenada por caducidad y las recetas recomendadas.
 */
function renderDespensaYRecetas() {
  const listaEl = document.getElementById("lista-despensa");
  const recetasEl = document.getElementById("lista-recetas-despensa");

  // Ordenamos por lo que se echa a perder primero
  const despensaOrdenada = [...estado.despensa].sort(
    (a, b) => Number(a.diasCaducidad) - Number(b.diasCaducidad)
  );

  if (despensaOrdenada.length === 0) {
    listaEl.innerHTML = `<p class="estado-vacio">Tu despensa está vacía. Marca artículos en la lista de compras o agrégalos arriba.</p>`;
  } else {
    listaEl.innerHTML = despensaOrdenada
      .map((item) => {
        const dias = Number(item.diasCaducidad);
        let etiquetaCaducidad = `Alacena (~${dias} días)`;
        let claseCaducidad = "caducidad-normal";

        if (dias <= 2) {
          etiquetaCaducidad = `Urgente: usar en 1-2 días`;
          claseCaducidad = "caducidad-urgente";
        } else if (dias <= 5) {
          etiquetaCaducidad = `Usar pronto (~${dias} días)`;
          claseCaducidad = "caducidad-pronto";
        }

        return `
          <div class="item-despensa">
            <div class="item-despensa__info">
              <span class="item-despensa__nombre"><span class="emoji-ingrediente" aria-hidden="true">${emojiParaIngrediente(item.nombre)}</span> ${item.nombre}</span>
              <span class="item-despensa__meta">
                ${item.cantidad} · <span class="${claseCaducidad}">${etiquetaCaducidad}</span>
              </span>
            </div>
            <button type="button" class="boton-icono" data-eliminar-despensa="${item.id}" aria-label="Quitar ${item.nombre}">
              Quitar
            </button>
          </div>
        `;
      })
      .join("");
  }

  // Recetas sugeridas con lo disponible
  const sugeridas = obtenerRecetasSegunDespensa();
  if (sugeridas.length === 0) {
    recetasEl.innerHTML = `<p class="estado-vacio">Agrega ingredientes en tu despensa para ver recetas que los aprovechen antes de que se echen a perder.</p>`;
  } else {
    recetasEl.innerHTML = sugeridas
      .map(({ receta, coincidencias, faltantes }) => {
        const urgentes = coincidencias.filter((c) => c.diasCaducidad <= 2);
        const costo = calcularCostoReceta(receta);

        return `
          <article class="tarjeta-receta-sugerida">
            <div class="tarjeta-receta-sugerida__top">
              <button type="button" class="comida-bloque__titulo tarjeta-receta-sugerida__nombre" data-ver-receta="${receta.id}">
                ${receta.nombre}
              </button>
              <span class="tarjeta-receta-sugerida__meta numero">${formatearMXN(costo)}</span>
            </div>
            ${
              urgentes.length
                ? `<div class="aviso-aprovecha">Aprovecha antes de que se eche a perder: ${urgentes.map((u) => u.nombre).join(", ")}</div>`
                : ""
            }
            <div class="tarjeta-receta-sugerida__detalle">
              <strong>Ya tienes (${coincidencias.length}):</strong> ${coincidencias.map((c) => c.nombre).join(", ")}
            </div>
            <div class="tarjeta-receta-sugerida__meta">
              ${faltantes.length ? `Te faltaría: ${faltantes.join(", ")}` : "¡Tienes todos los ingredientes en casa!"}
            </div>
          </article>
        `;
      })
      .join("");
  }
}

/**
 * Abre el modal con el detalle completo de una receta (ingredientes escalados y pasos).
 */
function abrirModalReceta(recetaId) {
  const receta = obtenerRecetaPorId(recetaId);
  if (!receta) return;

  const personas = estado.perfil.personas;
  const costo = calcularCostoReceta(receta, personas);

  document.getElementById("modal-titulo").textContent = receta.nombre;
  document.getElementById("modal-cuerpo").innerHTML = `
    <p class="tarjeta-favorito__meta">
      Porciones: <strong class="numero">${personas}</strong> · Tiempo: ${receta.minutos} min · Costo estimado: <strong class="numero">${formatearMXN(costo)}</strong>
    </p>
    <div>
      <h4>Ingredientes escalados</h4>
      <ul class="modal__lista">
        ${receta.ingredientes
          .map((ing) => {
            const ef = obtenerIngredienteEfectivo(ing, personas, receta.porcionesBase);
            return `<li><span class="emoji-ingrediente" aria-hidden="true">${emojiParaIngrediente(ef.nombre)}</span> ${ef.nombre}: <strong class="numero">${ef.cantidadEscalada} ${ef.unidad}</strong> (${formatearMXN(ef.precioEscalado)})</li>`;
          })
          .join("")}
      </ul>
    </div>
    <div>
      <h4>Preparación rápida</h4>
      <ol class="modal__lista">
        ${receta.pasos.map((paso) => `<li>${paso}</li>`).join("")}
      </ol>
    </div>
  `;

  document.getElementById("modal-receta").showModal();
}

/**
 * Refresca toda la interfaz después de cualquier cambio de estado.
 */
function renderTodo() {
  renderResumenPresupuesto();
  renderMenuSemanal();
  renderListaCompras();
  renderDespensaYRecetas();
}

/* ==========================================================================
   7. MANEJO DE EVENTOS E INICIALIZACIÓN
   ========================================================================== */

function leerFormularioPerfil() {
  const presupuesto = Math.max(200, Number(document.getElementById("input-presupuesto").value) || 1500);
  const personas = Math.min(10, Math.max(1, Number(document.getElementById("input-personas").value) || 4));
  const gustos = document
    .getElementById("input-gustos")
    .value.split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const restricciones = Array.from(
    document.querySelectorAll("#checks-restricciones input[type='checkbox']:checked")
  ).map((chk) => chk.value);

  const restriccionesTexto = document.getElementById("input-restricciones-extra").value.trim();

  const tiendas = Array.from(
    document.querySelectorAll("#checks-tiendas input[type='checkbox']:checked")
  ).map((chk) => chk.value);

  estado.perfil = {
    presupuesto,
    personas,
    gustos,
    restricciones,
    restriccionesTexto,
    tiendas: tiendas.length ? tiendas : ["Walmart", "Mercado"]
  };
  guardarEstado();
}

function cambiarPlatilloDeDia(indiceDia, claveTiempo) {
  const diaObj = estado.menuSemanal[indiceDia];
  if (!diaObj) return;

  const actualId = diaObj[claveTiempo];
  const opciones = RECETAS_BASE.filter(
    (r) => r.tiempo === claveTiempo && recetaEsCompatible(r, estado.perfil)
  );
  if (opciones.length <= 1) {
    mostrarNotificacion("No hay más platillos alternativos con las restricciones actuales.");
    return;
  }

  const indiceActual = opciones.findIndex((r) => r.id === actualId);
  const siguiente = opciones[(indiceActual + 1) % opciones.length];
  diaObj[claveTiempo] = siguiente.id;
  guardarEstado();
  renderTodo();
  mostrarNotificacion(`Cambiado a: ${siguiente.nombre}`);
}

function aplicarSustituto(nombreOriginal) {
  const sub = SUSTITUTOS_ECONOMICOS.find((s) => s.original === nombreOriginal);
  if (!sub) return;

  estado.sustitucionesAplicadas[sub.original] = {
    sustituto: sub.sustituto,
    factorPrecio: sub.factorPrecio
  };
  guardarEstado();
  renderTodo();
  mostrarNotificacion(`Sustituto aplicado: ${sub.sustituto}`);
}

function copiarListaAlPortapapeles() {
  const { grupos, totalFaltante } = construirListaCompras();
  const lineas = ["Lista de compras semanal — Planeador de Comida y Despensa", ""];

  grupos.forEach((grupo) => {
    lineas.push(`${grupo.tienda} (${formatearMXN(grupo.subtotal)}):`);
    grupo.items.forEach((item) => {
      const marca = item.comprado ? "[x]" : "[ ]";
      lineas.push(`  ${marca} ${item.nombre} — ${item.cantidad} ${item.unidad} (${formatearMXN(item.precioEstimado)})`);
    });
    lineas.push("");
  });
  lineas.push(`Falta por gastar aprox.: ${formatearMXN(totalFaltante)}`);

  navigator.clipboard
    .writeText(lineas.join("\n"))
    .then(() => mostrarNotificacion("Lista copiada al portapapeles."))
    .catch(() => mostrarNotificacion("No se pudo copiar automáticamente."));
}

async function consultarAsistenteIA() {
  const contenedor = document.getElementById("resultado-asistente");
  const boton = document.getElementById("btn-consultar-asistente");

  boton.disabled = true;
  boton.textContent = "Consultando...";
  contenedor.innerHTML = `<p class="estado-vacio">Preparando sugerencias personalizadas para tu familia...</p>`;

  try {
    const respuesta = await AsistenteIA.obtenerSugerencias({
      presupuesto: estado.perfil.presupuesto,
      personas: estado.perfil.personas,
      gustos: estado.perfil.gustos,
      dietas: obtenerDietasSeleccionadas(),
      restricciones: [
        ...estado.perfil.restricciones,
        ...(estado.perfil.restriccionesTexto ? [estado.perfil.restriccionesTexto] : [])
      ],
      tiendas: estado.perfil.tiendas,
      despensa: estado.despensa
    });

    contenedor.innerHTML = `
      <p><strong>${respuesta.resumen}</strong></p>
      <div class="asistente-grid">
        <div class="asistente-columna">
          <h4>Ideas de menú</h4>
          <ul class="asistente-lista">
            ${respuesta.sugerenciasMenu.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
        <div class="asistente-columna">
          <h4>Recetas con tu despensa</h4>
          <ul class="asistente-lista">
            ${respuesta.recetasAprovechamiento.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
        <div class="asistente-columna">
          <h4>Consejos de ahorro</h4>
          <ul class="asistente-lista">
            ${respuesta.consejosAhorro.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  } catch (error) {
    contenedor.innerHTML = `<p class="alerta-presupuesto alerta-presupuesto--peligro">${error.message}</p>`;
  } finally {
    boton.disabled = false;
    boton.textContent = "Pedir sugerencias al asistente";
  }
}

function registrarEventos() {
  // Navegación superior y pestañas
  document.querySelectorAll("[data-vista]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      cambiarVista(el.dataset.vista);
    });
  });

  // Botón principal del encabezado
  document.getElementById("btn-generar-header").addEventListener("click", () => {
    leerFormularioPerfil();
    generarMenuSemanal(false);
    renderTodo();
    cambiarVista("menu");
    mostrarNotificacion("Menú semanal generado.");
  });

  // Selector visual de 1 a 10 personas.
  document.getElementById("selector-personas").addEventListener("click", (e) => {
    const boton = e.target.closest("[data-personas]");
    if (!boton) return;
    actualizarSelectorPersonas(boton.dataset.personas);
  });

  // Formulario de perfil familiar
  document.getElementById("form-perfil").addEventListener("submit", (e) => {
    e.preventDefault();
    leerFormularioPerfil();
    generarMenuSemanal(false);
    renderTodo();
    cambiarVista("menu");
    mostrarNotificacion("Datos guardados y menú actualizado.");
  });

  // Botones rápidos de gustos
  document.getElementById("gustos-rapidos").addEventListener("click", (e) => {
    const btn = e.target.closest(".boton-opcion");
    if (!btn) return;
    const gusto = btn.dataset.gusto;
    const input = document.getElementById("input-gustos");
    const actuales = input.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const existe = actuales.some((g) => normalizarTexto(g) === normalizarTexto(gusto));
    const nuevos = existe
      ? actuales.filter((g) => normalizarTexto(g) !== normalizarTexto(gusto))
      : [...actuales, gusto];

    input.value = nuevos.join(", ");
    btn.classList.toggle("seleccionado", !existe);
  });

  // Agregar tienda personalizada
  document.getElementById("btn-agregar-tienda").addEventListener("click", () => {
    const input = document.getElementById("input-tienda-nueva");
    const nombre = input.value.trim();
    if (!nombre) return;

    const contenedor = document.getElementById("checks-tiendas");
    const label = document.createElement("label");
    label.className = "check-caja";
    label.innerHTML = `<input type="checkbox" value="${nombre}" checked /> ${nombre}`;
    contenedor.appendChild(label);
    input.value = "";
    leerFormularioPerfil();
    renderListaCompras();
    mostrarNotificacion(`Tienda "${nombre}" agregada.`);
  });

  // Restaurar ejemplo inicial
  document.getElementById("btn-restaurar-ejemplo").addEventListener("click", () => {
    estado = structuredClone(ESTADO_INICIAL);
    generarMenuSemanal(false);
    renderFormularioPerfil();
    renderTodo();
    mostrarNotificacion("Ejemplo inicial restaurado.");
  });

  // Botones de la sección Menú
  document.getElementById("btn-regenerar-menu").addEventListener("click", () => {
    generarMenuSemanal(false);
    renderTodo();
    mostrarNotificacion("Se generó una nueva combinación de menú.");
  });

  document.getElementById("btn-optimizar-presupuesto").addEventListener("click", () => {
    generarMenuSemanal(true);
    renderTodo();
    mostrarNotificacion("Menú ajustado con las opciones más económicas.");
  });

  // Botones de la sección Lista de compras
  document.getElementById("btn-copiar-lista").addEventListener("click", copiarListaAlPortapapeles);
  document.getElementById("btn-imprimir-lista").addEventListener("click", () => window.print());
  document.getElementById("btn-desmarcar-lista").addEventListener("click", () => {
    estado.comprados = {};
    guardarEstado();
    renderListaCompras();
    mostrarNotificacion("Lista desmarcada.");
  });

  // Formulario de despensa
  document.getElementById("form-despensa").addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("despensa-nombre").value;
    const cantidad = document.getElementById("despensa-cantidad").value;
    const dias = document.getElementById("despensa-caducidad").value;

    agregarADespensa(nombre, cantidad, dias);
    document.getElementById("despensa-nombre").value = "";
    renderDespensaYRecetas();
    mostrarNotificacion(`"${nombre.trim()}" agregado a tu despensa.`);
  });

  // Asistente IA
  document.getElementById("btn-consultar-asistente").addEventListener("click", consultarAsistenteIA);

  // Delegación global de clics para botones dinámicos
  document.body.addEventListener("click", (e) => {
    const btnVer = e.target.closest("[data-ver-receta]");
    if (btnVer) {
      abrirModalReceta(btnVer.dataset.verReceta);
      return;
    }

    const btnCambiar = e.target.closest("[data-cambiar-comida]");
    if (btnCambiar) {
      const [idx, tiempo] = btnCambiar.dataset.cambiarComida.split(":");
      cambiarPlatilloDeDia(Number(idx), tiempo);
      return;
    }

    const btnSust = e.target.closest("[data-aplicar-sustituto]");
    if (btnSust) {
      aplicarSustituto(btnSust.dataset.aplicarSustituto);
      return;
    }

    const btnEliminarDesp = e.target.closest("[data-eliminar-despensa]");
    if (btnEliminarDesp) {
      estado.despensa = estado.despensa.filter((d) => d.id !== btnEliminarDesp.dataset.eliminarDespensa);
      guardarEstado();
      renderDespensaYRecetas();
      mostrarNotificacion("Ingrediente eliminado de la despensa.");
    }
  });

  // Delegación de cambios en checkboxes de lista de compras
  document.getElementById("grid-lista-compras").addEventListener("change", (e) => {
    const chk = e.target.closest("[data-check-compra]");
    if (!chk) return;

    const clave = chk.dataset.checkCompra;
    estado.comprados[clave] = chk.checked;

    if (chk.checked) {
      window.reproducirSonidoUI?.("check");
      const caja = chk.getBoundingClientRect();
      const paloma = document.createElement("span");
      paloma.className = "animacion-paloma";
      paloma.setAttribute("aria-hidden", "true");
      paloma.textContent = "✓";
      paloma.style.left = `${caja.right - 8}px`;
      paloma.style.top = `${caja.top - 8}px`;
      document.body.appendChild(paloma);
      paloma.addEventListener("animationend", () => paloma.remove(), { once: true });

      agregarADespensa(chk.dataset.nombre, chk.dataset.cantidad, chk.dataset.caducidad);
      mostrarNotificacion(`"${chk.dataset.nombre}" se agregó a tu despensa.`);
    }

    guardarEstado();
    renderListaCompras();
    renderDespensaYRecetas();
  });

  // Modal de receta
  const modal = document.getElementById("modal-receta");
  document.getElementById("btn-cerrar-modal").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });

  // Reiniciar todo
  document.getElementById("btn-borrar-todo").addEventListener("click", () => {
    localStorage.removeItem(CLAVE_STORAGE);
    estado = structuredClone(ESTADO_INICIAL);
    generarMenuSemanal(false);
    renderFormularioPerfil();
    renderTodo();
    cambiarVista("familia");
    mostrarNotificacion("Todos los datos locales se reiniciaron.");
  });
}

/**
 * Arranque inicial de la aplicación.
 */
function iniciarAplicacion() {
  if (!estado.menuSemanal || estado.menuSemanal.length === 0) {
    generarMenuSemanal(false);
  }
  renderFormularioPerfil();
  renderTodo();
  registrarEventos();
}

document.addEventListener("DOMContentLoaded", iniciarAplicacion);

/** Preferencias de objetivo y dieta, guardadas aparte del estado de la aplicación. */
(() => {
  const KEY = "planeadorPreferenciasAlimentacion";
  const objetivos = [...document.querySelectorAll("[data-objetivo]")];
  const filtros = [
    ...document.querySelectorAll('input[name="filtro-dieta"]')
  ];
  const estadoObjetivo = document.getElementById("estado-objetivo");
  const estadoDieta = document.getElementById("estado-dieta");

  function leer() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {
        objetivo: "",
        dietas: []
      };
    } catch {
      return { objetivo: "", dietas: [] };
    }
  }

  function guardar(preferencias) {
    try {
      localStorage.setItem(KEY, JSON.stringify(preferencias));
    } catch {
      // La interfaz sigue funcionando si el navegador bloquea el almacenamiento.
    }
  }

  const preferencias = leer();

  objetivos.forEach((boton) => {
    const seleccionado = boton.dataset.objetivo === preferencias.objetivo;
    boton.setAttribute("aria-pressed", String(seleccionado));

    boton.addEventListener("click", () => {
      objetivos.forEach((opcion) => {
        opcion.setAttribute("aria-pressed", String(opcion === boton));
      });

      preferencias.objetivo = boton.dataset.objetivo;
      guardar(preferencias);
      estadoObjetivo.textContent =
        `Objetivo guardado: ${boton.querySelector("strong").textContent}.`;
    });
  });

  const objetivoActual = objetivos.find(
    (boton) => boton.dataset.objetivo === preferencias.objetivo
  );

  if (objetivoActual) {
    estadoObjetivo.textContent =
      `Objetivo guardado: ${objetivoActual.querySelector("strong").textContent}.`;
  }

  filtros.forEach((filtro) => {
    filtro.checked = preferencias.dietas.includes(filtro.value);

    filtro.addEventListener("change", () => {
      preferencias.dietas = filtros
        .filter((item) => item.checked)
        .map((item) => item.value);

      guardar(preferencias);

      estadoDieta.textContent = preferencias.dietas.length
        ? `Filtros guardados: ${
            filtros
              .filter((item) => item.checked)
              .map((item) => item.parentElement.textContent.trim())
              .join(", ")
          }. Las cifras son orientativas y no sustituyen una recomendación nutricional personalizada.`
        : "Las cifras son orientativas y no sustituyen una recomendación nutricional personalizada.";
    });
  });

  if (preferencias.dietas.length) {
    estadoDieta.textContent = `Filtros guardados: ${
      filtros
        .filter((item) => item.checked)
        .map((item) => item.parentElement.textContent.trim())
        .join(", ")
    }. Las cifras son orientativas y no sustituyen una recomendación nutricional personalizada.`;
  }
})();
