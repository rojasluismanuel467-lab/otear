# Auditoría de interfaz · final

- Fecha: 2026-10-31 16:59 · Compilación: `dfa8079 (+cambios sin confirmar)` · Navegador: Chrome/155.0.8059.12
- Servida desde: out/ (local) (sitio estático de producción, texto comprimido con gzip como en Cloudflare Pages)
- Rutas: /, /programacion/, /vuelos/, /evolucion/, /servicios/, /pagos/, /informes/, /documentos/ · Ventanas: desktop 1440×900, mobile 390×844 · Corridas de Lighthouse por ruta: 3
- **Límites de la medición.** Es un laboratorio, no usuarios: Chromium sin GPU real (render por software con SwiftShader), CPU de la máquina de desarrollo y red local. Sirve para comparar una corrida con otra en esta misma máquina, no como cifra absoluta. El INP real exige usuarios; aquí se mide una *sonda de interacción* (clics reales en pestañas y desplegables). Lighthouse y axe no certifican conformidad WCAG.

## Resultado: **48 valores fuera de umbral** · 3 regresiones frente a «base»

| Ruta | Ventana | Qué | Valor | Umbral |
| --- | --- | --- | --- | --- |
| `/` | desktop | Lighthouse rendimiento | 63 | ≥ 80 |
| `/` | desktop | TBT (ms) | 1944 | ≤ 300 |
| `/` | desktop | interacción más lenta (ms) | 216 | ≤ 200 |
| `/` | desktop | cuadro p95 al desplazar (ms) | 83.4 | ≤ 50 |
| `/programacion/` | desktop | Lighthouse rendimiento | 77 | ≥ 80 |
| `/programacion/` | desktop | TBT (ms) | 373 | ≤ 300 |
| `/programacion/` | desktop | JS transferido (KB) | 760 | ≤ 700 |
| `/programacion/` | desktop | interacción más lenta (ms) | 208 | ≤ 200 |
| `/programacion/` | desktop | cuadro p95 al desplazar (ms) | 916.6 | ≤ 50 |
| `/vuelos/` | desktop | TBT (ms) | 334 | ≤ 300 |
| `/vuelos/` | desktop | JS transferido (KB) | 757 | ≤ 700 |
| `/vuelos/` | desktop | axe: reglas incumplidas | 1 | ≤ 0 |
| `/vuelos/` | desktop | interacción más lenta (ms) | 208 | ≤ 200 |
| `/evolucion/` | desktop | Lighthouse rendimiento | 72 | ≥ 80 |
| `/evolucion/` | desktop | TBT (ms) | 379 | ≤ 300 |
| `/evolucion/` | desktop | axe: reglas incumplidas | 1 | ≤ 0 |
| `/servicios/` | desktop | Lighthouse rendimiento | 75 | ≥ 80 |
| `/servicios/` | desktop | TBT (ms) | 385 | ≤ 300 |
| `/servicios/` | desktop | interacción más lenta (ms) | 240 | ≤ 200 |
| `/pagos/` | desktop | Lighthouse rendimiento | 73 | ≥ 80 |
| `/pagos/` | desktop | TBT (ms) | 429 | ≤ 300 |
| `/pagos/` | desktop | interacción más lenta (ms) | 280 | ≤ 200 |
| `/informes/` | desktop | TBT (ms) | 301 | ≤ 300 |
| `/documentos/` | desktop | Lighthouse rendimiento | 75 | ≥ 80 |
| `/documentos/` | desktop | TBT (ms) | 383 | ≤ 300 |
| `/` | mobile | Lighthouse rendimiento | 45 | ≥ 50 |
| `/` | mobile | LCP (ms) | 8111 | ≤ 4000 |
| `/` | mobile | TBT (ms) | 2353 | ≤ 1200 |
| `/programacion/` | mobile | LCP (ms) | 6808 | ≤ 4000 |
| `/programacion/` | mobile | TBT (ms) | 1408 | ≤ 1200 |
| `/programacion/` | mobile | JS transferido (KB) | 760 | ≤ 700 |
| `/programacion/` | mobile | interacción más lenta (ms) | 584 | ≤ 400 |
| `/vuelos/` | mobile | LCP (ms) | 6233 | ≤ 4000 |
| `/vuelos/` | mobile | TBT (ms) | 1664 | ≤ 1200 |
| `/vuelos/` | mobile | JS transferido (KB) | 757 | ≤ 700 |
| `/vuelos/` | mobile | axe: reglas incumplidas | 1 | ≤ 0 |
| `/evolucion/` | mobile | LCP (ms) | 5853 | ≤ 4000 |
| `/evolucion/` | mobile | TBT (ms) | 1446 | ≤ 1200 |
| `/evolucion/` | mobile | axe: reglas incumplidas | 1 | ≤ 0 |
| `/servicios/` | mobile | Lighthouse rendimiento | 49 | ≥ 50 |
| `/servicios/` | mobile | LCP (ms) | 9677 | ≤ 4000 |
| `/servicios/` | mobile | TBT (ms) | 1395 | ≤ 1200 |
| `/pagos/` | mobile | Lighthouse rendimiento | 49 | ≥ 50 |
| `/pagos/` | mobile | LCP (ms) | 9602 | ≤ 4000 |
| `/pagos/` | mobile | TBT (ms) | 1483 | ≤ 1200 |
| `/documentos/` | mobile | Lighthouse rendimiento | 49 | ≥ 50 |
| `/documentos/` | mobile | LCP (ms) | 9602 | ≤ 4000 |
| `/documentos/` | mobile | TBT (ms) | 1407 | ≤ 1200 |

### Regresiones frente a «base» (2026-10-31 16:08)

| Ruta | Ventana | Qué | Antes | Ahora |
| --- | --- | --- | --- | --- |
| `/` | mobile | LCP (ms) | 5488 | 8111 |
| `/vuelos/` | mobile | Lighthouse rendimiento | 60 | 51 |
| `/vuelos/` | mobile | LCP (ms) | 3979 | 6233 |

## Resumen · desktop (1440×900)

| Ruta | Rend. | Acces. | B. prácticas | LCP ms | CLS | TBT ms | JS KB (transf.) | JS sin usar KB | Peso total KB | axe | Contraste | Desborde px | Texto <12px | Interacción ms | Cuadro p95 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 63 | 96 | 100 | 1.522 | 0.000 | 1.944 | 502 | 143 | 1.750 | 0 | 0 | 0 | 0 | 216 | 83.4 |
| `/programacion/` | 77 | 100 | 100 | 1.711 | 0.000 | 373 | 760 | 198 | 1.610 | 0 | 0 | 0 | 0 | 208 | 916.6 |
| `/vuelos/` | 84 | 97 | 100 | 864 | 0.000 | 334 | 757 | 197 | 1.645 | 1 | 0 | 0 | 0 | 208 | 16.8 |
| `/evolucion/` | 72 | 97 | 100 | 2.164 | 0.000 | 379 | 663 | 164 | 1.538 | 1 | 0 | 0 | 0 | 112 | 33.3 |
| `/servicios/` | 75 | 100 | 100 | 1.862 | 0.000 | 385 | 617 | 145 | 1.333 | 0 | 0 | 0 | 0 | 240 | 33.3 |
| `/pagos/` | 73 | 100 | 100 | 1.862 | 0.000 | 429 | 617 | 144 | 1.333 | 0 | 0 | 0 | 0 | 280 | 33.3 |
| `/informes/` | 86 | 100 | 100 | 762 | 0.055 | 301 | 617 | 97 | 1.329 | 0 | 0 | 0 | 0 | 192 | 16.7 |
| `/documentos/` | 75 | 100 | 100 | 1.864 | 0.000 | 383 | 617 | 144 | 1.333 | 0 | 0 | 0 | 0 | 104 | 16.8 |

**Peso visual** (cuánto hay que pintar y componer):

| Ruta | Nodos DOM | Altura px | backdrop-filter | filter | Capas fijas | Canvas (WebGL) | Animaciones CSS activas | will-change | FPS en reposo | FPS al desplazar | Cuadro p50 / p95 / máx al desplazar (ms) | Tareas largas (n / ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `/` | 525 | 8.699 | 1 | 4 | 9 | 1 (1) | 20 | 1 | 19 | 20 | 50.0 / 83.4 / 233 | 4 / 4.429 |
| `/programacion/` | 820 | 2.635 | 3 | 3 | 6 | 0 (0) | 1 | 1 | 59 | 6 | 33.3 / 916.6 / 917 | 3 / 939 |
| `/vuelos/` | 525 | 1.641 | 2 | 3 | 6 | 0 (0) | 2 | 1 | 60 | 57 | 16.7 / 16.8 / 33 | 3 / 443 |
| `/evolucion/` | 544 | 1.603 | 2 | 2 | 6 | 0 (0) | 0 | 1 | 59 | 54 | 16.7 / 33.3 / 33 | 1 / 202 |
| `/servicios/` | 482 | 2.727 | 2 | 2 | 6 | 0 (0) | 0 | 0 | 60 | 53 | 16.7 / 33.3 / 67 | 2 / 374 |
| `/pagos/` | 490 | 2.525 | 3 | 3 | 6 | 0 (0) | 0 | 0 | 59 | 53 | 16.7 / 33.3 / 33 | 2 / 230 |
| `/informes/` | 404 | 1.779 | 2 | 2 | 6 | 0 (0) | 2 | 0 | 60 | 58 | 16.7 / 16.7 / 17 | 2 / 385 |
| `/documentos/` | 433 | 1.909 | 2 | 3 | 6 | 0 (0) | 0 | 0 | 59 | 58 | 16.7 / 16.8 / 17 | 1 / 318 |

## Resumen · mobile (390×844)

| Ruta | Rend. | Acces. | B. prácticas | LCP ms | CLS | TBT ms | JS KB (transf.) | JS sin usar KB | Peso total KB | axe | Contraste | Desborde px | Texto <12px | Interacción ms | Cuadro p95 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 45 | 96 | 100 | 8.111 | 0.089 | 2.353 | 502 | 143 | 1.750 | 0 | 0 | 0 | 0 | 160 | 16.8 |
| `/programacion/` | 51 | 100 | 100 | 6.808 | 0.000 | 1.408 | 760 | 198 | 1.601 | 0 | 0 | 0 | 0 | 584 | 16.8 |
| `/vuelos/` | 51 | 97 | 96 | 6.233 | 0.011 | 1.664 | 757 | 197 | 1.580 | 1 | 0 | 0 | 0 | 328 | 16.7 |
| `/evolucion/` | 53 | 97 | 96 | 5.853 | 0.002 | 1.446 | 663 | 164 | 1.474 | 1 | 0 | 0 | 0 | 64 | 16.8 |
| `/servicios/` | 49 | 100 | 100 | 9.677 | 0.006 | 1.395 | 617 | 145 | 1.333 | 0 | 0 | 0 | 0 | 152 | 16.7 |
| `/pagos/` | 49 | 100 | 100 | 9.602 | 0.000 | 1.483 | 617 | 144 | 1.333 | 0 | 0 | 0 | 0 | 72 | 16.8 |
| `/informes/` | 65 | 100 | 100 | 3.755 | 0.059 | 1.116 | 617 | 97 | 1.329 | 0 | 0 | 0 | 0 | 184 | 16.7 |
| `/documentos/` | 49 | 100 | 100 | 9.602 | 0.001 | 1.407 | 617 | 144 | 1.333 | 0 | 0 | 0 | 0 | 56 | 16.8 |

**Peso visual** (cuánto hay que pintar y componer):

| Ruta | Nodos DOM | Altura px | backdrop-filter | filter | Capas fijas | Canvas (WebGL) | Animaciones CSS activas | will-change | FPS en reposo | FPS al desplazar | Cuadro p50 / p95 / máx al desplazar (ms) | Tareas largas (n / ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `/` | 525 | 13.892 | 1 | 4 | 9 | 1 (1) | 20 | 1 | 59 | 50 | 16.7 / 16.8 / 267 | 5 / 2.471 |
| `/programacion/` | 806 | 4.048 | 3 | 3 | 6 | 0 (0) | 1 | 1 | 59 | 46 | 16.7 / 16.8 / 583 | 4 / 934 |
| `/vuelos/` | 519 | 2.521 | 2 | 3 | 6 | 0 (0) | 2 | 1 | 60 | 59 | 16.7 / 16.7 / 17 | 2 / 363 |
| `/evolucion/` | 537 | 2.912 | 2 | 2 | 6 | 0 (0) | 0 | 1 | 59 | 59 | 16.7 / 16.8 / 17 | 1 / 265 |
| `/servicios/` | 482 | 4.453 | 2 | 2 | 6 | 0 (0) | 0 | 0 | 60 | 59 | 16.7 / 16.7 / 17 | 1 / 270 |
| `/pagos/` | 490 | 4.686 | 3 | 3 | 6 | 0 (0) | 0 | 0 | 60 | 58 | 16.7 / 16.8 / 50 | 1 / 293 |
| `/informes/` | 404 | 2.589 | 2 | 2 | 6 | 0 (0) | 2 | 0 | 60 | 59 | 16.7 / 16.7 / 17 | 1 / 250 |
| `/documentos/` | 433 | 3.082 | 2 | 3 | 6 | 0 (0) | 0 | 0 | 59 | 59 | 16.7 / 16.8 / 17 | 1 / 280 |

## Detalle por ruta

### `/` · desktop
- Captura: [final/capturas/inicio-desktop.jpg](final/capturas/inicio-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 1.358 ms · trabajo del hilo principal 4.067 ms · ejecución de JS 3.343 ms · 46 peticiones (JS 502 KB, CSS 78 KB, imágenes 1.027 KB, tipografías 77 KB)
- Elemento LCP: `<h1 class="MkS3jW_title">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast
- Oportunidades de Lighthouse: render-blocking-resources (); unused-javascript (40 ms 143 KB); uses-responsive-images ( 56 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 147 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 636 ms en `h1.MkS3jW_title`
- Encabezados visibles: 27, h1: 1

### `/programacion/` · desktop
- Captura: [final/capturas/programacion-desktop.jpg](final/capturas/programacion-desktop.jpg)
- Lighthouse: FCP 367 ms · Speed Index 991 ms · trabajo del hilo principal 1.348 ms · ejecución de JS 666 ms · 121 peticiones (JS 760 KB, CSS 80 KB, imágenes 651 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="CWmW1q_rail">`
- Oportunidades de Lighthouse: uses-rel-preconnect (124 ms); prioritize-lcp-image (); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (160 ms 198 KB); uses-responsive-images ( 55 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 1 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 2000 ms en `aside.CWmW1q_rail`
- Encabezados visibles: 7, h1: 1
- Errores de consola: Failed to load resource: the server responded with a status of 404 (Not Found)
- Peticiones fallidas: 404 http://127.0.0.1:3470/models/dji/mavic-3-enterprise.glb

### `/vuelos/` · desktop
- Captura: [final/capturas/vuelos-desktop.jpg](final/capturas/vuelos-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 1.058 ms · trabajo del hilo principal 1.245 ms · ejecución de JS 659 ms · 112 peticiones (JS 757 KB, CSS 80 KB, imágenes 693 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="u_w20G_rail">`
- Lighthouse accesibilidad, auditorías falladas: target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (40 ms 197 KB); modern-image-formats ( 77 KB); uses-optimized-images ( 58 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 1 contrastes indecidibles
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 22px by 34px, should be at least 24px by 24px)
- LCP observado (sin throttling): 656 ms en `aside.u_w20G_rail`
- Encabezados visibles: 4, h1: 1

### `/evolucion/` · desktop
- Captura: [final/capturas/evolucion-desktop.jpg](final/capturas/evolucion-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 918 ms · trabajo del hilo principal 1.036 ms · ejecución de JS 657 ms · 111 peticiones (JS 663 KB, CSS 80 KB, imágenes 679 KB, tipografías 30 KB)
- Elemento LCP: `<img alt="" src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServ…" class="leaflet-tile leafle`
- Lighthouse accesibilidad, auditorías falladas: target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (271 ms); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (80 ms 164 KB); modern-image-formats ( 77 KB); uses-optimized-images ( 58 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 1 contrastes indecidibles
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 22px by 44px, should be at least 24px by 24px)
- LCP observado (sin throttling): 896 ms en `img.leaflet-tile`
- Encabezados visibles: 4, h1: 1

### `/servicios/` · desktop
- Captura: [final/capturas/servicios-desktop.jpg](final/capturas/servicios-desktop.jpg)
- Lighthouse: FCP 361 ms · Speed Index 585 ms · trabajo del hilo principal 1.002 ms · ejecución de JS 558 ms · 85 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Solicitudes">`
- Oportunidades de Lighthouse: prioritize-lcp-image (201 ms); render-blocking-resources (); unused-javascript (160 ms 145 KB); uses-responsive-images ( 55 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 28 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 1232 ms en `aside.rail-panel`
- Encabezados visibles: 8, h1: 1

### `/pagos/` · desktop
- Captura: [final/capturas/pagos-desktop.jpg](final/capturas/pagos-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 704 ms · trabajo del hilo principal 956 ms · ejecución de JS 591 ms · 86 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-labelledby="invoice-list-heading">`
- Oportunidades de Lighthouse: prioritize-lcp-image (201 ms); render-blocking-resources (); unused-css-rules (40 ms 17 KB); unused-javascript (120 ms 144 KB); uses-responsive-images ( 55 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 50 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 1176 ms en `aside.rail-panel`
- Encabezados visibles: 7, h1: 1

### `/informes/` · desktop
- Captura: [final/capturas/informes-desktop.jpg](final/capturas/informes-desktop.jpg)
- Lighthouse: FCP 366 ms · Speed Index 716 ms · trabajo del hilo principal 888 ms · ejecución de JS 536 ms · 85 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<header class="app-topbar">`
- Oportunidades de Lighthouse: prioritize-lcp-image (); render-blocking-resources (); unused-css-rules (40 ms 18 KB); unused-javascript (40 ms 97 KB); uses-responsive-images ( 55 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 37 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 5828 ms en `aside.rail-panel`
- Encabezados visibles: 6, h1: 1

### `/documentos/` · desktop
- Captura: [final/capturas/documentos-desktop.jpg](final/capturas/documentos-desktop.jpg)
- Lighthouse: FCP 363 ms · Speed Index 724 ms · trabajo del hilo principal 1.071 ms · ejecución de JS 641 ms · 86 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Inventario documental">`
- Oportunidades de Lighthouse: prioritize-lcp-image (201 ms); render-blocking-resources (); unused-css-rules (40 ms 17 KB); unused-javascript (120 ms 144 KB); uses-responsive-images ( 55 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 38 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 1220 ms en `aside.rail-panel`
- Encabezados visibles: 6, h1: 1

### `/` · mobile
- Captura: [final/capturas/inicio-mobile.jpg](final/capturas/inicio-mobile.jpg)
- Lighthouse: FCP 1.651 ms · Speed Index 2.401 ms · trabajo del hilo principal 8.801 ms · ejecución de JS 7.325 ms · 46 peticiones (JS 502 KB, CSS 78 KB, imágenes 1.027 KB, tipografías 77 KB)
- Elemento LCP: `<h1 class="MkS3jW_title">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast
- Oportunidades de Lighthouse: render-blocking-resources (); unused-javascript (140 ms 143 KB); uses-responsive-images ( 49 KB); legacy-javascript (150 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 147 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 500 ms en `h1.MkS3jW_title`
- Encabezados visibles: 27, h1: 1

### `/programacion/` · mobile
- Captura: [final/capturas/programacion-mobile.jpg](final/capturas/programacion-mobile.jpg)
- Lighthouse: FCP 1.503 ms · Speed Index 2.177 ms · trabajo del hilo principal 3.988 ms · ejecución de JS 2.273 ms · 107 peticiones (JS 760 KB, CSS 80 KB, imágenes 643 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="CWmW1q_rail">`
- Oportunidades de Lighthouse: prioritize-lcp-image (150 ms); render-blocking-resources (); unused-css-rules (150 ms 17 KB); unused-javascript (1050 ms 198 KB); uses-responsive-images ( 45 KB); legacy-javascript (150 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 1 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 728 ms en `aside.CWmW1q_rail`
- Encabezados visibles: 7, h1: 1
- Errores de consola: Failed to load resource: the server responded with a status of 404 (Not Found)
- Peticiones fallidas: 404 http://127.0.0.1:3470/models/dji/mavic-3-enterprise.glb

### `/vuelos/` · mobile
- Captura: [final/capturas/vuelos-mobile.jpg](final/capturas/vuelos-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 2.076 ms · trabajo del hilo principal 4.283 ms · ejecución de JS 2.588 ms · 106 peticiones (JS 757 KB, CSS 80 KB, imágenes 629 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="u_w20G_rail">`
- Lighthouse accesibilidad, auditorías falladas: target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (451 ms); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (150 ms 197 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 1 contrastes indecidibles
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 11px by 34px, should be at least 24px by 24px)
- LCP observado (sin throttling): 268 ms en `aside.u_w20G_rail`
- Encabezados visibles: 4, h1: 1

### `/evolucion/` · mobile
- Captura: [final/capturas/evolucion-mobile.jpg](final/capturas/evolucion-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 2.284 ms · trabajo del hilo principal 3.403 ms · ejecución de JS 2.259 ms · 105 peticiones (JS 663 KB, CSS 80 KB, imágenes 615 KB, tipografías 30 KB)
- Elemento LCP: `<header class="app-topbar">`
- Lighthouse accesibilidad, auditorías falladas: target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (600 ms); render-blocking-resources (); unused-css-rules (150 ms 17 KB); unused-javascript (300 ms 164 KB); uses-responsive-images ( 45 KB); legacy-javascript (150 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 1 contrastes indecidibles
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 11px by 44px, should be at least 24px by 24px)
- LCP observado (sin throttling): 264 ms en `header.app-topbar`
- Encabezados visibles: 4, h1: 1

### `/servicios/` · mobile
- Captura: [final/capturas/servicios-mobile.jpg](final/capturas/servicios-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 1.502 ms · trabajo del hilo principal 2.959 ms · ejecución de JS 2.009 ms · 85 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Solicitudes">`
- Oportunidades de Lighthouse: prioritize-lcp-image (1051 ms); render-blocking-resources (); unused-javascript (750 ms 145 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 6 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 600 ms en `aside.rail-panel`
- Encabezados visibles: 8, h1: 1

### `/pagos/` · mobile
- Captura: [final/capturas/pagos-mobile.jpg](final/capturas/pagos-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 1.502 ms · trabajo del hilo principal 2.961 ms · ejecución de JS 1.933 ms · 86 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-labelledby="invoice-list-heading">`
- Oportunidades de Lighthouse: prioritize-lcp-image (1051 ms); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (600 ms 144 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 28 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 752 ms en `aside.rail-panel`
- Encabezados visibles: 7, h1: 1

### `/informes/` · mobile
- Captura: [final/capturas/informes-mobile.jpg](final/capturas/informes-mobile.jpg)
- Lighthouse: FCP 1.519 ms · Speed Index 2.098 ms · trabajo del hilo principal 2.665 ms · ejecución de JS 1.671 ms · 85 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<header class="app-topbar">`
- Oportunidades de Lighthouse: prioritize-lcp-image (); render-blocking-resources (); unused-css-rules (150 ms 18 KB); unused-javascript (150 ms 97 KB); uses-responsive-images ( 45 KB); legacy-javascript (150 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 15 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 6252 ms en `aside.rail-panel`
- Encabezados visibles: 6, h1: 1

### `/documentos/` · mobile
- Captura: [final/capturas/documentos-mobile.jpg](final/capturas/documentos-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 1.540 ms · trabajo del hilo principal 2.943 ms · ejecución de JS 1.860 ms · 86 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Inventario documental">`
- Oportunidades de Lighthouse: prioritize-lcp-image (1051 ms); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (600 ms 144 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 16 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 664 ms en `aside.rail-panel`
- Encabezados visibles: 6, h1: 1
