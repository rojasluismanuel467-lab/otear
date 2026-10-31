# Informe de la ronda 2 (31 de octubre de 2026)

Sigue a [`informe-final.md`](informe-final.md). Datos: [`ronda2.md`](ronda2.md) frente a [`final.md`](final.md) y [`base.md`](base.md); misma máquina y script, `--lh-runs 3` (ahora el informe muestra el rango entre corridas de Lighthouse). Laboratorio sin GPU real: sirve para comparar.

## Lo que pidió, punto por punto

| Pendiente | Qué se hizo | Resultado medido |
| --- | --- | --- |
| **Programación al desplazar (tirón 917 ms)** | El hangar 3D arranca a una pantalla de distancia del borde (antes, al entrar) y compila los shaders en paralelo (`compileAsync`). | Cuadro p95 al desplazar **917 → 83 ms**; TBT 1.356 → 592 ms frente a la base (373 ms en la corrida anterior, que aún no cargaba el hangar durante el recorrido). Rendimiento 61 → 72. |
| **Móvil con Lighthouse «ruido»** | El script ahora guarda y muestra el **rango** entre corridas. Vuelos móvil: 51 (rango 51–61), Informes móvil 54 (53–67): la dispersión es de hasta 14 puntos, así que esas bajadas son varianza y no regresión. Las diferencias reales en móvil se ven en TBT y en KB, que sí son estables. | Ver tabla de abajo. |
| **JavaScript compartido (617–772 KB)** | La causa no era el marco sino el **prefetch automático**: cada enlace visible del menú y de la landing precargaba el JS de las demás pantallas (3D y mapas incluidos). `/pagos/` cargaba 58 archivos y 1.942 KB sin comprimir; ahora 13 archivos y 879 KB. Los enlaces se precargan al pasar el puntero o enfocar (`router.prefetch`), no por estar a la vista. | JS transferido **617 → 277–380 KB** en las pantallas de trabajo (−40 % a −55 %), landing 503 → 359, Programación 772 → 549, Vuelos 757 → 544, Evolución 663 → 324. Peso total de la página −25 % en promedio. LCP en Servicios, Pagos y Documentos **1,86 → 1,2 s** (escritorio) y **9,7 → 6,2 s** (móvil). |
| **Teclado y movimiento reducido sin revisar** | Se **automatizaron** en el script (`keyboardCheck`, `reducedMotionCheck`) y se corrigieron los fallos que encontró. | Las 16 pruebas: **0 paradas sin anillo de foco, 0 tapadas, 0 trampas, 0 `tabindex` positivos, 0 animaciones largas o infinitas** con movimiento reducido. |
| **Densidad de las pantallas de trabajo** | Sin personas no se rediseñan. Se quitó lo que era ruido demostrable: el título repetido de la barra superior (partido en dos líneas, ya está en el `h1` y en el menú) y el buscador que partía su texto. | Visto en captura (Servicios, Equipos). El resto queda para la prueba con personas. |

## Fallos que encontró la nueva auditoría (y están corregidos)

- **Foco de los campos de texto y selectores casi invisible:** un halo del 8 % más un borde que apenas cambiaba (afectaba a todos los `.field-input` y `.field-select` de la app). Ahora hay un anillo sólido de 2 px (WCAG 2.4.7 y 1.4.11).
- **La landing no tenía «Saltar al contenido» ni `<main>`:** se añadieron.
- **Su captura de Equipos:** el aviso «No se pudo cargar el modelo…» no decía por qué. Ahora dice que el modelo de ejemplo no está en esta versión (licencia por resolver), y qué hacer (marcar desde la lista o cargar su escaneo `.glb`), centrado y con icono. El modelo no se puede mostrar en la versión publicada mientras la licencia siga sin resolverse.
- Detalle del script: el recorrido con Tab inflaba la sonda de interacción y la salida se podía quedar colgada; ambas cosas corregidas.

## Tabla antes → después (escritorio / móvil)

| Ruta | Rendimiento (rango) | JS KB | LCP ms |
| --- | --- | --- | --- |
| `/` | 50 → 63 (52–64) / 47 → 44 | 503 → 359 | 3.206 → 1.524 / 5.488 → 8.110* |
| `/programacion/` | 61 → 72 / 45 → 49 | 772 → 549 | 1.778 → 1.365 / 7.128 → 7.952* |
| `/vuelos/` | 82 → 78 / 60 → 51 (51–61)* | 757 → 544 | 864 → 804 |
| `/evolucion/` | 72 → 75 / 52 → 53 | 663 → 324 | 2.396 → 1.645 |
| `/servicios/` | 76 → 80 / 49 → 52 | 617 → 299 | 1.863 → 1.223 / 9.677 → 6.228 |
| `/pagos/` | 74 → 82 / 49 → 51 | 617 → 278 | 1.862 → 1.182 / 9.676 → 6.302 |
| `/informes/` | 84 → 84 / 54 → 54 | 617 → 380 | 762 → 763 |
| `/documentos/` | 75 → 81 / 49 → 52 | 617 → 277 | 1.863 → 1.183 / 9.676 → 6.303 |

\* Móvil: el LCP simulado de la landing y de Programación **empeora** frente a la base (landing 5,5 → 8,1 s; Programación 7,1 → 8,0 s) y el de Vuelos también (4,0 → 6,2 s) sin que Vuelos haya cambiado de forma relevante en ese aspecto: es la variabilidad de la simulación móvil; no atribuible a un cambio concreto con estas corridas. No lo doy por resuelto: hay que verlo en un teléfono real.

## Lo que sigue pendiente

- **Landing, peso:** la carta de navegación del fondo añade ~300 KB (SVG comprimido ~150 KB, relieve 160 KB). Se podría cargar solo en pantallas anchas; no se hizo.
- **Marcador del mapa «Seguimiento de resiembra»** (WCAG 2.5.8): sigue (otros marcadores de ejemplo lo tapan).
- **JS del marco y de HeroUI:** lo que queda (~280 KB comprimido por pantalla) sí es del marco, de HeroUI y del código propio; bajarlo más exige cambiar de librería.
- **Densidad de las pantallas de trabajo y el 3D en teléfonos reales:** requieren personas y dispositivos, no más medición.
