# Auditoría de interfaz · ronda2

- Fecha: 2026-10-31 18:48 · Compilación: `4e5b6a9 (+cambios sin confirmar)` · Navegador: Chrome/155.0.8059.12
- Servida desde: out/ (local) (sitio estático de producción, texto comprimido con gzip como en Cloudflare Pages)
- Rutas: /, /programacion/, /vuelos/, /evolucion/, /servicios/, /pagos/, /informes/, /documentos/ · Ventanas: desktop 1440×900, mobile 390×844 · Corridas de Lighthouse por ruta: 3
- **Límites de la medición.** Es un laboratorio, no usuarios: Chromium sin GPU real (render por software con SwiftShader), CPU de la máquina de desarrollo y red local. Sirve para comparar una corrida con otra en esta misma máquina, no como cifra absoluta. El INP real exige usuarios; aquí se mide una *sonda de interacción* (clics reales en pestañas y desplegables). Lighthouse y axe no certifican conformidad WCAG.

## Resultado: **40 valores fuera de umbral** · 5 regresiones frente a «final»

| Ruta | Ventana | Qué | Valor | Umbral |
| --- | --- | --- | --- | --- |
| `/` | desktop | Lighthouse rendimiento | 63 | ≥ 80 |
| `/` | desktop | TBT (ms) | 2066 | ≤ 300 |
| `/` | desktop | interacción más lenta (ms) | 216 | ≤ 200 |
| `/` | desktop | cuadro p95 al desplazar (ms) | 83.3 | ≤ 50 |
| `/programacion/` | desktop | Lighthouse rendimiento | 72 | ≥ 80 |
| `/programacion/` | desktop | TBT (ms) | 592 | ≤ 300 |
| `/programacion/` | desktop | cuadro p95 al desplazar (ms) | 83.3 | ≤ 50 |
| `/vuelos/` | desktop | Lighthouse rendimiento | 78 | ≥ 80 |
| `/vuelos/` | desktop | TBT (ms) | 470 | ≤ 300 |
| `/vuelos/` | desktop | axe: reglas incumplidas | 1 | ≤ 0 |
| `/vuelos/` | desktop | interacción más lenta (ms) | 216 | ≤ 200 |
| `/evolucion/` | desktop | Lighthouse rendimiento | 75 | ≥ 80 |
| `/evolucion/` | desktop | TBT (ms) | 417 | ≤ 300 |
| `/evolucion/` | desktop | axe: reglas incumplidas | 1 | ≤ 0 |
| `/servicios/` | desktop | TBT (ms) | 389 | ≤ 300 |
| `/servicios/` | desktop | interacción más lenta (ms) | 232 | ≤ 200 |
| `/pagos/` | desktop | TBT (ms) | 367 | ≤ 300 |
| `/pagos/` | desktop | interacción más lenta (ms) | 272 | ≤ 200 |
| `/informes/` | desktop | TBT (ms) | 339 | ≤ 300 |
| `/documentos/` | desktop | TBT (ms) | 379 | ≤ 300 |
| `/` | mobile | Lighthouse rendimiento | 44 | ≥ 50 |
| `/` | mobile | LCP (ms) | 8110 | ≤ 4000 |
| `/` | mobile | TBT (ms) | 2296 | ≤ 1200 |
| `/programacion/` | mobile | Lighthouse rendimiento | 49 | ≥ 50 |
| `/programacion/` | mobile | LCP (ms) | 7952 | ≤ 4000 |
| `/programacion/` | mobile | TBT (ms) | 1545 | ≤ 1200 |
| `/vuelos/` | mobile | LCP (ms) | 6153 | ≤ 4000 |
| `/vuelos/` | mobile | TBT (ms) | 1640 | ≤ 1200 |
| `/vuelos/` | mobile | axe: reglas incumplidas | 1 | ≤ 0 |
| `/evolucion/` | mobile | LCP (ms) | 5863 | ≤ 4000 |
| `/evolucion/` | mobile | TBT (ms) | 1405 | ≤ 1200 |
| `/evolucion/` | mobile | axe: reglas incumplidas | 1 | ≤ 0 |
| `/servicios/` | mobile | LCP (ms) | 6228 | ≤ 4000 |
| `/servicios/` | mobile | TBT (ms) | 1356 | ≤ 1200 |
| `/pagos/` | mobile | LCP (ms) | 6302 | ≤ 4000 |
| `/pagos/` | mobile | TBT (ms) | 1487 | ≤ 1200 |
| `/informes/` | mobile | LCP (ms) | 5928 | ≤ 4000 |
| `/informes/` | mobile | TBT (ms) | 1294 | ≤ 1200 |
| `/documentos/` | mobile | LCP (ms) | 6303 | ≤ 4000 |
| `/documentos/` | mobile | TBT (ms) | 1387 | ≤ 1200 |

### Regresiones frente a «final» (2026-10-31 16:59)

| Ruta | Ventana | Qué | Antes | Ahora |
| --- | --- | --- | --- | --- |
| `/programacion/` | desktop | Lighthouse rendimiento | 77 | 72 |
| `/vuelos/` | desktop | Lighthouse rendimiento | 84 | 78 |
| `/programacion/` | mobile | LCP (ms) | 6808 | 7952 |
| `/informes/` | mobile | Lighthouse rendimiento | 65 | 54 |
| `/informes/` | mobile | LCP (ms) | 3755 | 5928 |

## Resumen · desktop (1440×900)

| Ruta | Rend. | Acces. | B. prácticas | LCP ms | CLS | TBT ms | JS KB (transf.) | JS sin usar KB | Peso total KB | axe | Contraste | Desborde px | Texto <12px | Interacción ms | Cuadro p95 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 63 (52–64) | 97 | 100 | 1.524 | 0.000 | 2.066 | 359 | 76 | 1.585 | 0 | 0 | 0 | 0 | 216 | 83.3 |
| `/programacion/` | 72 (71–72) | 100 | 96 | 1.365 | 0.000 | 592 | 549 | 138 | 1.368 | 0 | 0 | 0 | 0 | 152 | 83.3 |
| `/vuelos/` | 78 (78–82) | 97 | 100 | 804 | 0.000 | 470 | 544 | 197 | 1.395 | 1 | 0 | 0 | 0 | 216 | 16.8 |
| `/evolucion/` | 75 (74–78) | 97 | 100 | 1.645 | 0.000 | 417 | 324 | 92 | 1.163 | 1 | 0 | 0 | 0 | 128 | 33.2 |
| `/servicios/` | 80 (79–82) | 100 | 100 | 1.223 | 0.000 | 389 | 299 | 49 | 968 | 0 | 0 | 0 | 0 | 232 | 33.3 |
| `/pagos/` | 82 (81–82) | 100 | 100 | 1.182 | 0.000 | 367 | 278 | 72 | 958 | 0 | 0 | 0 | 0 | 272 | 33.4 |
| `/informes/` | 84 (83–84) | 100 | 100 | 763 | 0.053 | 339 | 380 | 25 | 1.067 | 0 | 0 | 0 | 0 | 184 | 16.7 |
| `/documentos/` | 81 (81–82) | 100 | 100 | 1.183 | 0.000 | 379 | 277 | 72 | 956 | 0 | 0 | 0 | 0 | 96 | 16.7 |

**Peso visual** (cuánto hay que pintar y componer):

| Ruta | Nodos DOM | Altura px | backdrop-filter | filter | Capas fijas | Canvas (WebGL) | Animaciones CSS activas | will-change | FPS en reposo | FPS al desplazar | Cuadro p50 / p95 / máx al desplazar (ms) | Tareas largas (n / ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `/` | 518 | 8.699 | 1 | 4 | 10 | 1 (1) | 20 | 1 | 18 | 22 | 49.9 / 83.3 / 150 | 3 / 3.194 |
| `/programacion/` | 800 | 2.635 | 3 | 3 | 6 | 1 (1) | 0 | 1 | 60 | 23 | 50.0 / 83.3 / 83 | 4 / 1.220 |
| `/vuelos/` | 502 | 1.641 | 2 | 3 | 6 | 0 (0) | 2 | 1 | 60 | 55 | 16.7 / 16.8 / 33 | 2 / 411 |
| `/evolucion/` | 516 | 1.603 | 2 | 2 | 6 | 0 (0) | 0 | 1 | 59 | 54 | 16.7 / 33.2 / 33 | 1 / 238 |
| `/servicios/` | 457 | 2.727 | 2 | 2 | 6 | 0 (0) | 0 | 0 | 59 | 53 | 16.7 / 33.3 / 67 | 2 / 379 |
| `/pagos/` | 462 | 2.525 | 3 | 3 | 6 | 0 (0) | 0 | 0 | 59 | 51 | 16.7 / 33.4 / 50 | 3 / 339 |
| `/informes/` | 387 | 1.779 | 2 | 2 | 6 | 0 (0) | 2 | 0 | 60 | 58 | 16.7 / 16.7 / 17 | 2 / 388 |
| `/documentos/` | 405 | 1.909 | 2 | 3 | 6 | 0 (0) | 0 | 0 | 59 | 58 | 16.7 / 16.7 / 17 | 1 / 344 |

## Resumen · mobile (390×844)

| Ruta | Rend. | Acces. | B. prácticas | LCP ms | CLS | TBT ms | JS KB (transf.) | JS sin usar KB | Peso total KB | axe | Contraste | Desborde px | Texto <12px | Interacción ms | Cuadro p95 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 44 (44–46) | 97 | 100 | 8.110 | 0.089 | 2.296 | 359 | 76 | 1.585 | 0 | 0 | 0 | 0 | 168 | 16.8 |
| `/programacion/` | 49 (49–51) | 100 | 100 | 7.952 | 0.000 | 1.545 | 536 | 199 | 1.344 | 0 | 0 | 0 | 0 | 224 | 16.8 |
| `/vuelos/` | 51 (51–61) | 97 | 96 | 6.153 | 0.000 | 1.640 | 544 | 197 | 1.331 | 1 | 0 | 0 | 0 | 240 | 16.7 |
| `/evolucion/` | 53 (53–53) | 97 | 96 | 5.863 | 0.002 | 1.405 | 324 | 92 | 1.099 | 1 | 0 | 0 | 0 | 224 | 16.7 |
| `/servicios/` | 52 (52–52) | 100 | 100 | 6.228 | 0.006 | 1.356 | 281 | 73 | 944 | 0 | 0 | 0 | 0 | 168 | 16.8 |
| `/pagos/` | 51 (51–52) | 100 | 100 | 6.302 | 0.000 | 1.487 | 278 | 72 | 958 | 0 | 0 | 0 | 0 | 400 | 16.8 |
| `/informes/` | 54 (53–67) | 100 | 100 | 5.928 | 0.000 | 1.294 | 289 | 48 | 967 | 0 | 0 | 0 | 0 | 176 | 16.7 |
| `/documentos/` | 52 (51–52) | 100 | 100 | 6.303 | 0.000 | 1.387 | 277 | 72 | 956 | 0 | 0 | 0 | 0 | 72 | 16.8 |

**Peso visual** (cuánto hay que pintar y componer):

| Ruta | Nodos DOM | Altura px | backdrop-filter | filter | Capas fijas | Canvas (WebGL) | Animaciones CSS activas | will-change | FPS en reposo | FPS al desplazar | Cuadro p50 / p95 / máx al desplazar (ms) | Tareas largas (n / ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `/` | 518 | 13.892 | 1 | 4 | 10 | 1 (1) | 20 | 1 | 59 | 51 | 16.7 / 16.8 / 250 | 5 / 2.689 |
| `/programacion/` | 783 | 4.048 | 3 | 3 | 6 | 0 (0) | 1 | 1 | 59 | 35 | 16.7 / 16.8 / 717 | 4 / 938 |
| `/vuelos/` | 496 | 2.521 | 2 | 3 | 6 | 0 (0) | 2 | 1 | 59 | 59 | 16.7 / 16.7 / 17 | 2 / 351 |
| `/evolucion/` | 509 | 2.912 | 2 | 2 | 6 | 0 (0) | 0 | 1 | 59 | 59 | 16.7 / 16.7 / 17 | 1 / 260 |
| `/servicios/` | 454 | 4.453 | 2 | 2 | 6 | 0 (0) | 0 | 0 | 59 | 59 | 16.7 / 16.8 / 17 | 1 / 268 |
| `/pagos/` | 462 | 4.686 | 3 | 3 | 6 | 0 (0) | 0 | 0 | 60 | 58 | 16.7 / 16.8 / 50 | 2 / 372 |
| `/informes/` | 377 | 2.589 | 2 | 2 | 6 | 0 (0) | 2 | 0 | 60 | 59 | 16.7 / 16.7 / 17 | 2 / 296 |
| `/documentos/` | 405 | 3.082 | 2 | 3 | 6 | 0 (0) | 0 | 0 | 59 | 59 | 16.7 / 16.8 / 17 | 1 / 285 |

## Detalle por ruta

### `/` · desktop
- Captura: [ronda2/capturas/inicio-desktop.jpg](ronda2/capturas/inicio-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 1.438 ms · trabajo del hilo principal 4.162 ms · ejecución de JS 3.935 ms · 34 peticiones (JS 359 KB, CSS 58 KB, imágenes 1.027 KB, tipografías 77 KB)
- Elemento LCP: `<h1 class="MkS3jW_title">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast
- Oportunidades de Lighthouse: render-blocking-resources (); unused-javascript (40 ms 76 KB); uses-responsive-images ( 56 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 147 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 904 ms en `h1.MkS3jW_title`
- Teclado (Tab): 27 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 0 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 27, h1: 1

### `/programacion/` · desktop
- Captura: [ronda2/capturas/programacion-desktop.jpg](ronda2/capturas/programacion-desktop.jpg)
- Lighthouse: FCP 367 ms · Speed Index 1.087 ms · trabajo del hilo principal 1.864 ms · ejecución de JS 1.269 ms · 71 peticiones (JS 549 KB, CSS 74 KB, imágenes 651 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="CWmW1q_rail">`
- Oportunidades de Lighthouse: uses-rel-preconnect (128 ms); prioritize-lcp-image (); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (120 ms 138 KB); uses-responsive-images ( 55 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 1 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 1536 ms en `aside.CWmW1q_rail`
- Teclado (Tab): 60 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 56 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 7, h1: 1
- Errores de consola: Failed to load resource: the server responded with a status of 404 (Not Found)
- Peticiones fallidas: 404 http://127.0.0.1:3470/models/dji/mavic-3-enterprise.glb

### `/vuelos/` · desktop
- Captura: [ronda2/capturas/vuelos-desktop.jpg](ronda2/capturas/vuelos-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 1.091 ms · trabajo del hilo principal 1.360 ms · ejecución de JS 669 ms · 59 peticiones (JS 544 KB, CSS 71 KB, imágenes 693 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="u_w20G_rail">`
- Lighthouse accesibilidad, auditorías falladas: target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (); render-blocking-resources (); unused-css-rules (40 ms 17 KB); unused-javascript (80 ms 197 KB); modern-image-formats ( 77 KB); uses-optimized-images ( 58 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 1 contrastes indecidibles
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 22px by 34px, should be at least 24px by 24px)
- LCP observado (sin throttling): 732 ms en `aside.u_w20G_rail`
- Teclado (Tab): 50 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 62 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 4, h1: 1

### `/evolucion/` · desktop
- Captura: [ronda2/capturas/evolucion-desktop.jpg](ronda2/capturas/evolucion-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 859 ms · trabajo del hilo principal 958 ms · ejecución de JS 653 ms · 53 peticiones (JS 324 KB, CSS 71 KB, imágenes 679 KB, tipografías 30 KB)
- Elemento LCP: `<img alt="" src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServ…" class="leaflet-tile leafle`
- Lighthouse accesibilidad, auditorías falladas: target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (339 ms); render-blocking-resources (); unused-css-rules (40 ms 17 KB); unused-javascript (120 ms 92 KB); modern-image-formats (40 ms 77 KB); uses-optimized-images (40 ms 58 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 1 contrastes indecidibles
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 22px by 44px, should be at least 24px by 24px)
- LCP observado (sin throttling): 952 ms en `img.leaflet-tile`
- Teclado (Tab): 50 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 0 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 4, h1: 1

### `/servicios/` · desktop
- Captura: [ronda2/capturas/servicios-desktop.jpg](ronda2/capturas/servicios-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 597 ms · trabajo del hilo principal 917 ms · ejecución de JS 507 ms · 33 peticiones (JS 299 KB, CSS 57 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Solicitudes">`
- Oportunidades de Lighthouse: prioritize-lcp-image (201 ms); render-blocking-resources (); unused-javascript (40 ms 49 KB); uses-responsive-images ( 55 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 27 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 1216 ms en `aside.rail-panel`
- Teclado (Tab): 36 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 0 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 8, h1: 1

### `/pagos/` · desktop
- Captura: [ronda2/capturas/pagos-desktop.jpg](ronda2/capturas/pagos-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 668 ms · trabajo del hilo principal 799 ms · ejecución de JS 508 ms · 28 peticiones (JS 278 KB, CSS 71 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-labelledby="invoice-list-heading">`
- Oportunidades de Lighthouse: prioritize-lcp-image (201 ms); render-blocking-resources (); unused-css-rules (40 ms 17 KB); unused-javascript (80 ms 72 KB); uses-responsive-images ( 55 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 49 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 1224 ms en `aside.rail-panel`
- Teclado (Tab): 51 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 0 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 7, h1: 1

### `/informes/` · desktop
- Captura: [ronda2/capturas/informes-desktop.jpg](ronda2/capturas/informes-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 742 ms · trabajo del hilo principal 810 ms · ejecución de JS 510 ms · 48 peticiones (JS 380 KB, CSS 73 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<header class="app-topbar">`
- Oportunidades de Lighthouse: prioritize-lcp-image (83 ms); render-blocking-resources (); unused-css-rules ( 18 KB); unused-javascript (40 ms 25 KB); uses-responsive-images ( 55 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 36 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 5852 ms en `aside.rail-panel`
- Teclado (Tab): 38 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 2 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 6, h1: 1

### `/documentos/` · desktop
- Captura: [ronda2/capturas/documentos-desktop.jpg](ronda2/capturas/documentos-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 695 ms · trabajo del hilo principal 891 ms · ejecución de JS 508 ms · 28 peticiones (JS 277 KB, CSS 71 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Inventario documental">`
- Oportunidades de Lighthouse: prioritize-lcp-image (201 ms); render-blocking-resources (); unused-css-rules (40 ms 17 KB); unused-javascript (80 ms 72 KB); uses-responsive-images ( 55 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 37 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 1068 ms en `aside.rail-panel`
- Teclado (Tab): 38 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 0 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 6, h1: 1

### `/` · mobile
- Captura: [ronda2/capturas/inicio-mobile.jpg](ronda2/capturas/inicio-mobile.jpg)
- Lighthouse: FCP 1.652 ms · Speed Index 2.402 ms · trabajo del hilo principal 8.390 ms · ejecución de JS 7.131 ms · 34 peticiones (JS 359 KB, CSS 58 KB, imágenes 1.027 KB, tipografías 77 KB)
- Elemento LCP: `<h1 class="MkS3jW_title">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast
- Oportunidades de Lighthouse: render-blocking-resources (); unused-javascript (290 ms 76 KB); uses-responsive-images ( 49 KB); legacy-javascript (150 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 147 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 228 ms en `h1.MkS3jW_title`
- Teclado (Tab): 27 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 0 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 27, h1: 1

### `/programacion/` · mobile
- Captura: [ronda2/capturas/programacion-mobile.jpg](ronda2/capturas/programacion-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 2.168 ms · trabajo del hilo principal 3.996 ms · ejecución de JS 2.157 ms · 54 peticiones (JS 536 KB, CSS 73 KB, imágenes 643 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="CWmW1q_rail">`
- Oportunidades de Lighthouse: prioritize-lcp-image (151 ms); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (1050 ms 198 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 1 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 720 ms en `aside.CWmW1q_rail`
- Teclado (Tab): 44 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 0 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 7, h1: 1
- Errores de consola: Failed to load resource: the server responded with a status of 404 (Not Found)
- Peticiones fallidas: 404 http://127.0.0.1:3470/models/dji/mavic-3-enterprise.glb

### `/vuelos/` · mobile
- Captura: [ronda2/capturas/vuelos-mobile.jpg](ronda2/capturas/vuelos-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 2.220 ms · trabajo del hilo principal 3.625 ms · ejecución de JS 2.408 ms · 53 peticiones (JS 544 KB, CSS 71 KB, imágenes 629 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="u_w20G_rail">`
- Lighthouse accesibilidad, auditorías falladas: target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (2417 ms); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (300 ms 197 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 1 contrastes indecidibles
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 11px by 34px, should be at least 24px by 24px)
- LCP observado (sin throttling): 252 ms en `aside.u_w20G_rail`
- Teclado (Tab): 35 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 2 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 4, h1: 1

### `/evolucion/` · mobile
- Captura: [ronda2/capturas/evolucion-mobile.jpg](ronda2/capturas/evolucion-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 2.163 ms · trabajo del hilo principal 2.972 ms · ejecución de JS 1.927 ms · 47 peticiones (JS 324 KB, CSS 71 KB, imágenes 615 KB, tipografías 30 KB)
- Elemento LCP: `<header class="app-topbar">`
- Lighthouse accesibilidad, auditorías falladas: target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (153 ms); render-blocking-resources (); unused-css-rules (150 ms 17 KB); unused-javascript (450 ms 92 KB); uses-responsive-images ( 45 KB); legacy-javascript (150 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 1 contrastes indecidibles
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 11px by 44px, should be at least 24px by 24px)
- LCP observado (sin throttling): 248 ms en `header.app-topbar`
- Teclado (Tab): 35 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 0 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 4, h1: 1

### `/servicios/` · mobile
- Captura: [ronda2/capturas/servicios-mobile.jpg](ronda2/capturas/servicios-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 1.502 ms · trabajo del hilo principal 2.399 ms · ejecución de JS 1.618 ms · 27 peticiones (JS 281 KB, CSS 55 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Solicitudes">`
- Oportunidades de Lighthouse: prioritize-lcp-image (904 ms); render-blocking-resources (); unused-javascript (450 ms 73 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 6 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 576 ms en `aside.rail-panel`
- Teclado (Tab): 23 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 0 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 8, h1: 1

### `/pagos/` · mobile
- Captura: [ronda2/capturas/pagos-mobile.jpg](ronda2/capturas/pagos-mobile.jpg)
- Lighthouse: FCP 1.521 ms · Speed Index 1.523 ms · trabajo del hilo principal 2.431 ms · ejecución de JS 1.742 ms · 28 peticiones (JS 278 KB, CSS 71 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-labelledby="invoice-list-heading">`
- Oportunidades de Lighthouse: prioritize-lcp-image (904 ms); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (300 ms 72 KB); uses-responsive-images ( 45 KB); legacy-javascript (150 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 28 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 796 ms en `aside.rail-panel`
- Teclado (Tab): 32 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 0 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 7, h1: 1

### `/informes/` · mobile
- Captura: [ronda2/capturas/informes-mobile.jpg](ronda2/capturas/informes-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 1.842 ms · trabajo del hilo principal 2.485 ms · ejecución de JS 1.560 ms · 28 peticiones (JS 289 KB, CSS 73 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<header class="app-topbar">`
- Oportunidades de Lighthouse: prioritize-lcp-image (303 ms); render-blocking-resources (); unused-css-rules (130 ms 18 KB); unused-javascript (300 ms 48 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 15 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 6200 ms en `aside.rail-panel`
- Teclado (Tab): 25 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 2 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 6, h1: 1

### `/documentos/` · mobile
- Captura: [ronda2/capturas/documentos-mobile.jpg](ronda2/capturas/documentos-mobile.jpg)
- Lighthouse: FCP 1.520 ms · Speed Index 1.604 ms · trabajo del hilo principal 2.489 ms · ejecución de JS 1.675 ms · 28 peticiones (JS 277 KB, CSS 71 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Inventario documental">`
- Oportunidades de Lighthouse: prioritize-lcp-image (904 ms); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (300 ms 72 KB); uses-responsive-images ( 45 KB); legacy-javascript (150 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 16 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 652 ms en `aside.rail-panel`
- Teclado (Tab): 25 paradas, la primera es a «Saltar al contenido»; sin indicador de foco: 0; tapadas: 0
- Movimiento reducido: 0 animaciones en marcha, 0 infinitas o largas
- Encabezados visibles: 6, h1: 1
