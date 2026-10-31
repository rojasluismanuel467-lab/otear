# Auditoría de interfaz · base

- Fecha: 2026-10-31 16:08 · Compilación: `58c4228 (+cambios sin confirmar)` · Navegador: Chrome/155.0.8059.12
- Servida desde: /tmp/claude-1000/keep/out-base/ (local) (sitio estático de producción, texto comprimido con gzip como en Cloudflare Pages)
- Rutas: /, /programacion/, /vuelos/, /evolucion/, /servicios/, /pagos/, /informes/, /documentos/ · Ventanas: desktop 1440×900, mobile 390×844 · Corridas de Lighthouse por ruta: 3
- **Límites de la medición.** Es un laboratorio, no usuarios: Chromium sin GPU real (render por software con SwiftShader), CPU de la máquina de desarrollo y red local. Sirve para comparar una corrida con otra en esta misma máquina, no como cifra absoluta. El INP real exige usuarios; aquí se mide una *sonda de interacción* (clics reales en pestañas y desplegables). Lighthouse y axe no certifican conformidad WCAG.

## Resultado: **65 valores fuera de umbral**

| Ruta | Ventana | Qué | Valor | Umbral |
| --- | --- | --- | --- | --- |
| `/` | desktop | Lighthouse rendimiento | 50 | ≥ 80 |
| `/` | desktop | LCP (ms) | 3206 | ≤ 2500 |
| `/` | desktop | TBT (ms) | 3012 | ≤ 300 |
| `/` | desktop | cuadro p95 al desplazar (ms) | 116.6 | ≤ 50 |
| `/programacion/` | desktop | Lighthouse rendimiento | 61 | ≥ 80 |
| `/programacion/` | desktop | TBT (ms) | 1356 | ≤ 300 |
| `/programacion/` | desktop | JS transferido (KB) | 772 | ≤ 700 |
| `/programacion/` | desktop | axe: reglas incumplidas | 1 | ≤ 0 |
| `/programacion/` | desktop | cuadro p95 al desplazar (ms) | 100.0 | ≤ 50 |
| `/vuelos/` | desktop | TBT (ms) | 390 | ≤ 300 |
| `/vuelos/` | desktop | JS transferido (KB) | 757 | ≤ 700 |
| `/vuelos/` | desktop | axe: reglas incumplidas | 2 | ≤ 0 |
| `/vuelos/` | desktop | interacción más lenta (ms) | 208 | ≤ 200 |
| `/evolucion/` | desktop | Lighthouse rendimiento | 72 | ≥ 80 |
| `/evolucion/` | desktop | TBT (ms) | 386 | ≤ 300 |
| `/evolucion/` | desktop | axe: reglas incumplidas | 2 | ≤ 0 |
| `/evolucion/` | desktop | textos < 12 px | 1 | ≤ 0 |
| `/servicios/` | desktop | Lighthouse rendimiento | 76 | ≥ 80 |
| `/servicios/` | desktop | TBT (ms) | 380 | ≤ 300 |
| `/servicios/` | desktop | axe: reglas incumplidas | 2 | ≤ 0 |
| `/servicios/` | desktop | axe: elementos con contraste < 4,5:1 | 1 | ≤ 0 |
| `/servicios/` | desktop | textos < 12 px | 9 | ≤ 0 |
| `/servicios/` | desktop | interacción más lenta (ms) | 248 | ≤ 200 |
| `/pagos/` | desktop | Lighthouse rendimiento | 74 | ≥ 80 |
| `/pagos/` | desktop | Lighthouse accesibilidad | 93 | ≥ 95 |
| `/pagos/` | desktop | TBT (ms) | 402 | ≤ 300 |
| `/pagos/` | desktop | axe: reglas incumplidas | 3 | ≤ 0 |
| `/pagos/` | desktop | axe: elementos con contraste < 4,5:1 | 5 | ≤ 0 |
| `/pagos/` | desktop | interacción más lenta (ms) | 304 | ≤ 200 |
| `/informes/` | desktop | TBT (ms) | 339 | ≤ 300 |
| `/informes/` | desktop | axe: reglas incumplidas | 1 | ≤ 0 |
| `/documentos/` | desktop | Lighthouse rendimiento | 75 | ≥ 80 |
| `/documentos/` | desktop | TBT (ms) | 394 | ≤ 300 |
| `/documentos/` | desktop | axe: reglas incumplidas | 1 | ≤ 0 |
| `/` | mobile | Lighthouse rendimiento | 47 | ≥ 50 |
| `/` | mobile | LCP (ms) | 5488 | ≤ 4000 |
| `/` | mobile | TBT (ms) | 5867 | ≤ 1200 |
| `/programacion/` | mobile | Lighthouse rendimiento | 45 | ≥ 50 |
| `/programacion/` | mobile | LCP (ms) | 7128 | ≤ 4000 |
| `/programacion/` | mobile | TBT (ms) | 4751 | ≤ 1200 |
| `/programacion/` | mobile | JS transferido (KB) | 772 | ≤ 700 |
| `/vuelos/` | mobile | TBT (ms) | 1610 | ≤ 1200 |
| `/vuelos/` | mobile | JS transferido (KB) | 757 | ≤ 700 |
| `/vuelos/` | mobile | axe: reglas incumplidas | 1 | ≤ 0 |
| `/evolucion/` | mobile | LCP (ms) | 5853 | ≤ 4000 |
| `/evolucion/` | mobile | TBT (ms) | 1421 | ≤ 1200 |
| `/evolucion/` | mobile | axe: reglas incumplidas | 1 | ≤ 0 |
| `/evolucion/` | mobile | textos < 12 px | 1 | ≤ 0 |
| `/servicios/` | mobile | Lighthouse rendimiento | 49 | ≥ 50 |
| `/servicios/` | mobile | LCP (ms) | 9677 | ≤ 4000 |
| `/servicios/` | mobile | TBT (ms) | 1403 | ≤ 1200 |
| `/servicios/` | mobile | axe: reglas incumplidas | 1 | ≤ 0 |
| `/servicios/` | mobile | axe: elementos con contraste < 4,5:1 | 1 | ≤ 0 |
| `/servicios/` | mobile | textos < 12 px | 9 | ≤ 0 |
| `/pagos/` | mobile | Lighthouse rendimiento | 49 | ≥ 50 |
| `/pagos/` | mobile | Lighthouse accesibilidad | 93 | ≥ 95 |
| `/pagos/` | mobile | LCP (ms) | 9676 | ≤ 4000 |
| `/pagos/` | mobile | TBT (ms) | 1528 | ≤ 1200 |
| `/pagos/` | mobile | axe: reglas incumplidas | 2 | ≤ 0 |
| `/pagos/` | mobile | axe: elementos con contraste < 4,5:1 | 5 | ≤ 0 |
| `/informes/` | mobile | LCP (ms) | 5928 | ≤ 4000 |
| `/informes/` | mobile | TBT (ms) | 1223 | ≤ 1200 |
| `/documentos/` | mobile | Lighthouse rendimiento | 49 | ≥ 50 |
| `/documentos/` | mobile | LCP (ms) | 9676 | ≤ 4000 |
| `/documentos/` | mobile | TBT (ms) | 1439 | ≤ 1200 |

## Resumen · desktop (1440×900)

| Ruta | Rend. | Acces. | B. prácticas | LCP ms | CLS | TBT ms | JS KB (transf.) | JS sin usar KB | Peso total KB | axe | Contraste | Desborde px | Texto <12px | Interacción ms | Cuadro p95 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 50 | 96 | 100 | 3.206 | 0.000 | 3.012 | 503 | 143 | 1.314 | 0 | 0 | 0 | 0 | 0 | 116.6 |
| `/programacion/` | 61 | 100 | 96 | 1.778 | 0.000 | 1.356 | 772 | 138 | 1.625 | 1 | 0 | 0 | 0 | 168 | 100.0 |
| `/vuelos/` | 82 | 97 | 100 | 864 | 0.000 | 390 | 757 | 197 | 1.645 | 2 | 0 | 0 | 0 | 208 | 16.8 |
| `/evolucion/` | 72 | 97 | 100 | 2.396 | 0.000 | 386 | 663 | 164 | 1.538 | 2 | 0 | 0 | 1 | 120 | 33.3 |
| `/servicios/` | 76 | 97 | 100 | 1.863 | 0.000 | 380 | 617 | 145 | 1.333 | 2 | 1 | 0 | 9 | 248 | 33.4 |
| `/pagos/` | 74 | 93 | 100 | 1.862 | 0.000 | 402 | 617 | 144 | 1.333 | 3 | 5 | 0 | 0 | 304 | 33.3 |
| `/informes/` | 84 | 100 | 100 | 762 | 0.055 | 339 | 617 | 97 | 1.329 | 1 | 0 | 0 | 0 | 200 | 16.7 |
| `/documentos/` | 75 | 100 | 100 | 1.863 | 0.000 | 394 | 617 | 144 | 1.332 | 1 | 0 | 0 | 0 | 112 | 16.7 |

**Peso visual** (cuánto hay que pintar y componer):

| Ruta | Nodos DOM | Altura px | backdrop-filter | filter | Capas fijas | Canvas (WebGL) | Animaciones CSS activas | will-change | FPS en reposo | FPS al desplazar | Cuadro p50 / p95 / máx al desplazar (ms) | Tareas largas (n / ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `/` | 521 | 9.210 | 19 | 4 | 9 | 1 (1) | 18 | 1 | 16 | 14 | 66.6 / 116.6 / 333 | 5 / 5.096 |
| `/programacion/` | 799 | 2.635 | 3 | 3 | 6 | 1 (1) | 0 | 1 | 34 | 22 | 50.0 / 100.0 / 100 | 4 / 4.469 |
| `/vuelos/` | 525 | 1.641 | 2 | 3 | 6 | 0 (0) | 2 | 1 | 60 | 56 | 16.7 / 16.8 / 33 | 2 / 381 |
| `/evolucion/` | 544 | 1.603 | 2 | 2 | 6 | 0 (0) | 0 | 1 | 59 | 54 | 16.7 / 33.3 / 33 | 2 / 248 |
| `/servicios/` | 482 | 2.727 | 2 | 2 | 6 | 0 (0) | 0 | 0 | 60 | 53 | 16.7 / 33.4 / 67 | 2 / 403 |
| `/pagos/` | 490 | 2.525 | 3 | 3 | 6 | 0 (0) | 0 | 0 | 60 | 51 | 16.7 / 33.3 / 50 | 2 / 392 |
| `/informes/` | 404 | 1.779 | 2 | 2 | 6 | 0 (0) | 2 | 0 | 60 | 58 | 16.7 / 16.7 / 17 | 2 / 391 |
| `/documentos/` | 433 | 1.909 | 2 | 3 | 6 | 0 (0) | 0 | 0 | 60 | 57 | 16.7 / 16.7 / 33 | 1 / 323 |

## Resumen · mobile (390×844)

| Ruta | Rend. | Acces. | B. prácticas | LCP ms | CLS | TBT ms | JS KB (transf.) | JS sin usar KB | Peso total KB | axe | Contraste | Desborde px | Texto <12px | Interacción ms | Cuadro p95 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 47 | 96 | 100 | 5.488 | 0.089 | 5.867 | 503 | 143 | 1.314 | 0 | 0 | 0 | 0 | 0 | 50.0 |
| `/programacion/` | 45 | 100 | 96 | 7.128 | 0.000 | 4.751 | 772 | 138 | 1.617 | 0 | 0 | 0 | 0 | 232 | 16.8 |
| `/vuelos/` | 60 | 97 | 96 | 3.979 | 0.000 | 1.610 | 757 | 197 | 1.580 | 1 | 0 | 0 | 0 | 360 | 16.8 |
| `/evolucion/` | 52 | 97 | 96 | 5.853 | 0.002 | 1.421 | 663 | 164 | 1.474 | 1 | 0 | 0 | 1 | 56 | 16.7 |
| `/servicios/` | 49 | 96 | 100 | 9.677 | 0.000 | 1.403 | 617 | 145 | 1.333 | 1 | 1 | 0 | 9 | 176 | 16.8 |
| `/pagos/` | 49 | 93 | 100 | 9.676 | 0.000 | 1.528 | 617 | 144 | 1.333 | 2 | 5 | 0 | 0 | 40 | 16.8 |
| `/informes/` | 54 | 100 | 100 | 5.928 | 0.000 | 1.223 | 617 | 97 | 1.329 | 0 | 0 | 0 | 0 | 64 | 16.7 |
| `/documentos/` | 49 | 100 | 100 | 9.676 | 0.001 | 1.439 | 617 | 144 | 1.332 | 0 | 0 | 0 | 0 | 80 | 16.8 |

**Peso visual** (cuánto hay que pintar y componer):

| Ruta | Nodos DOM | Altura px | backdrop-filter | filter | Capas fijas | Canvas (WebGL) | Animaciones CSS activas | will-change | FPS en reposo | FPS al desplazar | Cuadro p50 / p95 / máx al desplazar (ms) | Tareas largas (n / ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `/` | 521 | 14.884 | 19 | 4 | 9 | 1 (1) | 17 | 1 | 59 | 41 | 16.7 / 50.0 / 367 | 4 / 3.930 |
| `/programacion/` | 809 | 4.048 | 3 | 3 | 6 | 1 (1) | 0 | 1 | 60 | 57 | 16.7 / 16.8 / 50 | 3 / 1.521 |
| `/vuelos/` | 519 | 2.521 | 2 | 3 | 6 | 0 (0) | 2 | 1 | 60 | 59 | 16.7 / 16.8 / 17 | 3 / 437 |
| `/evolucion/` | 537 | 2.912 | 2 | 2 | 6 | 0 (0) | 0 | 1 | 59 | 59 | 16.7 / 16.7 / 17 | 1 / 271 |
| `/servicios/` | 482 | 4.453 | 2 | 2 | 6 | 0 (0) | 0 | 0 | 59 | 59 | 16.7 / 16.8 / 17 | 1 / 295 |
| `/pagos/` | 490 | 4.686 | 3 | 3 | 6 | 0 (0) | 0 | 0 | 59 | 58 | 16.7 / 16.8 / 50 | 1 / 298 |
| `/informes/` | 404 | 2.589 | 2 | 2 | 6 | 0 (0) | 2 | 0 | 60 | 59 | 16.7 / 16.7 / 17 | 2 / 294 |
| `/documentos/` | 433 | 3.082 | 2 | 3 | 6 | 0 (0) | 0 | 0 | 59 | 59 | 16.7 / 16.8 / 17 | 1 / 280 |

## Detalle por ruta

### `/` · desktop
- Captura: [base/capturas/inicio-desktop.jpg](base/capturas/inicio-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 1.662 ms · trabajo del hilo principal 5.757 ms · ejecución de JS 5.478 ms · 43 peticiones (JS 503 KB, CSS 78 KB, imágenes 590 KB, tipografías 77 KB)
- Elemento LCP: `<h1 class="MkS3jW_title">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast
- Oportunidades de Lighthouse: render-blocking-resources (); unused-javascript (80 ms 143 KB); uses-responsive-images ( 56 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 156 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 1952 ms en `h1.MkS3jW_title`
- Encabezados visibles: 26, h1: 1

### `/programacion/` · desktop
- Captura: [base/capturas/programacion-desktop.jpg](base/capturas/programacion-desktop.jpg)
- Lighthouse: FCP 366 ms · Speed Index 1.706 ms · trabajo del hilo principal 3.840 ms · ejecución de JS 3.302 ms · 124 peticiones (JS 772 KB, CSS 81 KB, imágenes 651 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="CWmW1q_rail">`
- Lighthouse accesibilidad, auditorías falladas: label-content-name-mismatch
- Oportunidades de Lighthouse: prioritize-lcp-image (); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (150 ms 138 KB); uses-responsive-images ( 55 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 1 contrastes indecidibles
  - `label-content-name-mismatch` (serious, 1 elementos): Elements must have their visible text as part of their accessible name — p. ej. `.topbar-search` · Text inside the element is not included in the accessible name
- LCP observado (sin throttling): 5624 ms en `aside.CWmW1q_rail`
- Encabezados visibles: 7, h1: 1
- Errores de consola: Failed to load resource: the server responded with a status of 404 (Not Found)
- Peticiones fallidas: 404 http://127.0.0.1:3470/models/dji/mavic-3-enterprise.glb

### `/vuelos/` · desktop
- Captura: [base/capturas/vuelos-desktop.jpg](base/capturas/vuelos-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 1.088 ms · trabajo del hilo principal 1.343 ms · ejecución de JS 705 ms · 112 peticiones (JS 757 KB, CSS 80 KB, imágenes 693 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="u_w20G_rail">`
- Lighthouse accesibilidad, auditorías falladas: label-content-name-mismatch, target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (40 ms 197 KB); modern-image-formats ( 77 KB); uses-optimized-images ( 58 KB)
- axe (WCAG 2.0–2.2 A/AA): **2 reglas incumplidas** · 1 contrastes indecidibles
  - `label-content-name-mismatch` (serious, 1 elementos): Elements must have their visible text as part of their accessible name — p. ej. `.topbar-search` · Text inside the element is not included in the accessible name
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 22px by 34px, should be at least 24px by 24px)
- LCP observado (sin throttling): 668 ms en `aside.u_w20G_rail`
- Encabezados visibles: 4, h1: 1

### `/evolucion/` · desktop
- Captura: [base/capturas/evolucion-desktop.jpg](base/capturas/evolucion-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 879 ms · trabajo del hilo principal 1.060 ms · ejecución de JS 692 ms · 111 peticiones (JS 663 KB, CSS 80 KB, imágenes 679 KB, tipografías 30 KB)
- Elemento LCP: `<img alt="" src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServ…" class="leaflet-tile leafle`
- Lighthouse accesibilidad, auditorías falladas: label-content-name-mismatch, target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (274 ms); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (110 ms 164 KB); modern-image-formats (40 ms 77 KB); uses-optimized-images (70 ms 58 KB)
- axe (WCAG 2.0–2.2 A/AA): **2 reglas incumplidas** · 1 contrastes indecidibles
  - `label-content-name-mismatch` (serious, 1 elementos): Elements must have their visible text as part of their accessible name — p. ej. `.topbar-search` · Text inside the element is not included in the accessible name
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 22px by 44px, should be at least 24px by 24px)
- **1 textos por debajo de 12 px**: `tspan` 11.5px ×1 «2026»
- LCP observado (sin throttling): 924 ms en `img.leaflet-tile`
- Encabezados visibles: 4, h1: 1

### `/servicios/` · desktop
- Captura: [base/capturas/servicios-desktop.jpg](base/capturas/servicios-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 604 ms · trabajo del hilo principal 1.011 ms · ejecución de JS 567 ms · 85 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Solicitudes">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast, label-content-name-mismatch
- Oportunidades de Lighthouse: prioritize-lcp-image (201 ms); render-blocking-resources (); unused-javascript (120 ms 145 KB); uses-responsive-images ( 55 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **2 reglas incumplidas** · 28 contrastes indecidibles
  - `color-contrast` (serious, 1 elementos): Elements must meet minimum color contrast ratio thresholds — p. ej. `#request-detail > .text-muted` · Element has insufficient color contrast of 4.49 (foreground color: #6f787f, background color: #ffffff, font size: 10.5pt (14px), font weight
  - `label-content-name-mismatch` (serious, 1 elementos): Elements must have their visible text as part of their accessible name — p. ej. `.topbar-search` · Text inside the element is not included in the accessible name
- **9 textos por debajo de 12 px**: `small` 11.2px ×9 «(»
- LCP observado (sin throttling): 1096 ms en `aside.rail-panel`
- Encabezados visibles: 8, h1: 1

### `/pagos/` · desktop
- Captura: [base/capturas/pagos-desktop.jpg](base/capturas/pagos-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 683 ms · trabajo del hilo principal 977 ms · ejecución de JS 560 ms · 86 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-labelledby="invoice-list-heading">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast, definition-list, label-content-name-mismatch
- Oportunidades de Lighthouse: prioritize-lcp-image (201 ms); render-blocking-resources (); unused-css-rules (40 ms 17 KB); unused-javascript (120 ms 144 KB); uses-responsive-images ( 55 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **3 reglas incumplidas** · 50 contrastes indecidibles
  - `color-contrast` (serious, 5 elementos): Elements must meet minimum color contrast ratio thresholds — p. ej. `.nOF8pa_chip` · Element has insufficient color contrast of 2.56 (foreground color: #ff383c, background color: #f1d4d5, font size: 9.0pt (12px), font weight:
  - `definition-list` (serious, 1 elementos): <dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script>, <template> or <div> elements — p. ej. `.nOF8pa_numbers` · Fix all of the following:
  dl element has direct children that are not allowed: div > small
  - `label-content-name-mismatch` (serious, 1 elementos): Elements must have their visible text as part of their accessible name — p. ej. `.topbar-search` · Text inside the element is not included in the accessible name
- LCP observado (sin throttling): 1036 ms en `aside.rail-panel`
- Encabezados visibles: 7, h1: 1

### `/informes/` · desktop
- Captura: [base/capturas/informes-desktop.jpg](base/capturas/informes-desktop.jpg)
- Lighthouse: FCP 365 ms · Speed Index 739 ms · trabajo del hilo principal 852 ms · ejecución de JS 528 ms · 85 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<header class="app-topbar">`
- Lighthouse accesibilidad, auditorías falladas: label-content-name-mismatch
- Oportunidades de Lighthouse: prioritize-lcp-image (); render-blocking-resources (); unused-css-rules (40 ms 18 KB); unused-javascript (40 ms 97 KB); uses-responsive-images ( 55 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 37 contrastes indecidibles
  - `label-content-name-mismatch` (serious, 1 elementos): Elements must have their visible text as part of their accessible name — p. ej. `.topbar-search` · Text inside the element is not included in the accessible name
- LCP observado (sin throttling): 5892 ms en `aside.rail-panel`
- Encabezados visibles: 6, h1: 1

### `/documentos/` · desktop
- Captura: [base/capturas/documentos-desktop.jpg](base/capturas/documentos-desktop.jpg)
- Lighthouse: FCP 362 ms · Speed Index 746 ms · trabajo del hilo principal 1.131 ms · ejecución de JS 627 ms · 86 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Inventario documental">`
- Lighthouse accesibilidad, auditorías falladas: label-content-name-mismatch
- Oportunidades de Lighthouse: prioritize-lcp-image (201 ms); render-blocking-resources (); unused-css-rules (40 ms 17 KB); unused-javascript (120 ms 144 KB); uses-responsive-images ( 55 KB); legacy-javascript (40 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 38 contrastes indecidibles
  - `label-content-name-mismatch` (serious, 1 elementos): Elements must have their visible text as part of their accessible name — p. ej. `.topbar-search` · Text inside the element is not included in the accessible name
- LCP observado (sin throttling): 1156 ms en `aside.rail-panel`
- Encabezados visibles: 6, h1: 1

### `/` · mobile
- Captura: [base/capturas/inicio-mobile.jpg](base/capturas/inicio-mobile.jpg)
- Lighthouse: FCP 1.652 ms · Speed Index 2.746 ms · trabajo del hilo principal 14.806 ms · ejecución de JS 13.476 ms · 43 peticiones (JS 503 KB, CSS 78 KB, imágenes 590 KB, tipografías 77 KB)
- Elemento LCP: `<h1 class="MkS3jW_title">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast
- Oportunidades de Lighthouse: render-blocking-resources (); unused-javascript (150 ms 143 KB); uses-responsive-images ( 49 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 156 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 896 ms en `h1.MkS3jW_title`
- Encabezados visibles: 26, h1: 1

### `/programacion/` · mobile
- Captura: [base/capturas/programacion-mobile.jpg](base/capturas/programacion-mobile.jpg)
- Lighthouse: FCP 1.522 ms · Speed Index 2.985 ms · trabajo del hilo principal 9.062 ms · ejecución de JS 4.671 ms · 110 peticiones (JS 772 KB, CSS 81 KB, imágenes 643 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="CWmW1q_rail">`
- Oportunidades de Lighthouse: prioritize-lcp-image (); render-blocking-resources (); unused-css-rules (150 ms 17 KB); unused-javascript (600 ms 138 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 1 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 984 ms en `aside.CWmW1q_rail`
- Encabezados visibles: 7, h1: 1
- Errores de consola: Failed to load resource: the server responded with a status of 404 (Not Found)
- Peticiones fallidas: 404 http://127.0.0.1:3470/models/dji/mavic-3-enterprise.glb

### `/vuelos/` · mobile
- Captura: [base/capturas/vuelos-mobile.jpg](base/capturas/vuelos-mobile.jpg)
- Lighthouse: FCP 1.519 ms · Speed Index 2.421 ms · trabajo del hilo principal 3.992 ms · ejecución de JS 2.548 ms · 106 peticiones (JS 757 KB, CSS 80 KB, imágenes 629 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="u_w20G_rail">`
- Lighthouse accesibilidad, auditorías falladas: target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (2554 ms); render-blocking-resources (); unused-css-rules (130 ms 17 KB); unused-javascript (300 ms 197 KB); uses-responsive-images ( 45 KB); legacy-javascript (150 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 1 contrastes indecidibles
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 11px by 34px, should be at least 24px by 24px)
- LCP observado (sin throttling): 264 ms en `aside.u_w20G_rail`
- Encabezados visibles: 4, h1: 1

### `/evolucion/` · mobile
- Captura: [base/capturas/evolucion-mobile.jpg](base/capturas/evolucion-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 2.343 ms · trabajo del hilo principal 3.403 ms · ejecución de JS 2.220 ms · 105 peticiones (JS 663 KB, CSS 80 KB, imágenes 615 KB, tipografías 30 KB)
- Elemento LCP: `<header class="app-topbar">`
- Lighthouse accesibilidad, auditorías falladas: target-size
- Oportunidades de Lighthouse: prioritize-lcp-image (601 ms); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (150 ms 164 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 1 contrastes indecidibles
  - `target-size` (serious, 1 elementos): All touch targets must be 24px large, or leave sufficient space — p. ej. `div[title="Seguimiento de resiembra"]` · Target has insufficient size because it is partially obscured (smallest space is 11px by 44px, should be at least 24px by 24px)
- **1 textos por debajo de 12 px**: `tspan` 11.5px ×1 «2026»
- LCP observado (sin throttling): 276 ms en `header.app-topbar`
- Encabezados visibles: 4, h1: 1

### `/servicios/` · mobile
- Captura: [base/capturas/servicios-mobile.jpg](base/capturas/servicios-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 1.502 ms · trabajo del hilo principal 2.888 ms · ejecución de JS 1.883 ms · 85 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Solicitudes">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast
- Oportunidades de Lighthouse: prioritize-lcp-image (1051 ms); render-blocking-resources (); unused-javascript (750 ms 145 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **1 reglas incumplidas** · 6 contrastes indecidibles
  - `color-contrast` (serious, 1 elementos): Elements must meet minimum color contrast ratio thresholds — p. ej. `#request-detail > .text-muted` · Element has insufficient color contrast of 4.49 (foreground color: #6f787f, background color: #ffffff, font size: 10.5pt (14px), font weight
- **9 textos por debajo de 12 px**: `small` 11.2px ×9 «(»
- LCP observado (sin throttling): 656 ms en `aside.rail-panel`
- Encabezados visibles: 8, h1: 1

### `/pagos/` · mobile
- Captura: [base/capturas/pagos-mobile.jpg](base/capturas/pagos-mobile.jpg)
- Lighthouse: FCP 1.501 ms · Speed Index 1.501 ms · trabajo del hilo principal 3.089 ms · ejecución de JS 2.027 ms · 86 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-labelledby="invoice-list-heading">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast, definition-list
- Oportunidades de Lighthouse: prioritize-lcp-image (1051 ms); render-blocking-resources (); unused-css-rules (150 ms 17 KB); unused-javascript (750 ms 144 KB); uses-responsive-images ( 45 KB); legacy-javascript (150 ms 13 KB)
- axe (WCAG 2.0–2.2 A/AA): **2 reglas incumplidas** · 28 contrastes indecidibles
  - `color-contrast` (serious, 5 elementos): Elements must meet minimum color contrast ratio thresholds — p. ej. `.nOF8pa_chip` · Element has insufficient color contrast of 2.56 (foreground color: #ff383c, background color: #f1d4d5, font size: 9.0pt (12px), font weight:
  - `definition-list` (serious, 1 elementos): <dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script>, <template> or <div> elements — p. ej. `.nOF8pa_numbers` · Fix all of the following:
  dl element has direct children that are not allowed: div > small
- LCP observado (sin throttling): 772 ms en `aside.rail-panel`
- Encabezados visibles: 7, h1: 1

### `/informes/` · mobile
- Captura: [base/capturas/informes-mobile.jpg](base/capturas/informes-mobile.jpg)
- Lighthouse: FCP 1.502 ms · Speed Index 1.872 ms · trabajo del hilo principal 2.730 ms · ejecución de JS 1.681 ms · 85 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<header class="app-topbar">`
- Oportunidades de Lighthouse: prioritize-lcp-image (601 ms); render-blocking-resources (); unused-css-rules ( 18 KB); unused-javascript (150 ms 97 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 15 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 6268 ms en `aside.rail-panel`
- Encabezados visibles: 6, h1: 1

### `/documentos/` · mobile
- Captura: [base/capturas/documentos-mobile.jpg](base/capturas/documentos-mobile.jpg)
- Lighthouse: FCP 1.501 ms · Speed Index 1.508 ms · trabajo del hilo principal 3.008 ms · ejecución de JS 1.947 ms · 86 peticiones (JS 617 KB, CSS 80 KB, imágenes 519 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="rail-panel master-rail" aria-label="Inventario documental">`
- Oportunidades de Lighthouse: prioritize-lcp-image (1050 ms); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (600 ms 144 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- axe (WCAG 2.0–2.2 A/AA): sin violaciones · 16 elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo.
- LCP observado (sin throttling): 676 ms en `aside.rail-panel`
- Encabezados visibles: 6, h1: 1
