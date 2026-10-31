# Auditoría de interfaz · base-sin-webgl

- Fecha: 2026-10-31 16:16 · Compilación: `58c4228 (+cambios sin confirmar)` · Navegador: Chrome/155.0.8059.12
- Servida desde: /tmp/claude-1000/keep/out-base/ (local) (sitio estático de producción, texto comprimido con gzip como en Cloudflare Pages)
- Rutas: /, /programacion/ · Ventanas: desktop 1440×900, mobile 390×844 · Corridas de Lighthouse por ruta: 3
- **Límites de la medición.** Es un laboratorio, no usuarios: Chromium sin GPU real (render por software con SwiftShader), CPU de la máquina de desarrollo y red local. Sirve para comparar una corrida con otra en esta misma máquina, no como cifra absoluta. El INP real exige usuarios; aquí se mide una *sonda de interacción* (clics reales en pestañas y desplegables). Lighthouse y axe no certifican conformidad WCAG.

## Resultado: **4 valores fuera de umbral**

| Ruta | Ventana | Qué | Valor | Umbral |
| --- | --- | --- | --- | --- |
| `/programacion/` | desktop | JS transferido (KB) | 772 | ≤ 700 |
| `/` | mobile | LCP (ms) | 5485 | ≤ 4000 |
| `/programacion/` | mobile | LCP (ms) | 6511 | ≤ 4000 |
| `/programacion/` | mobile | JS transferido (KB) | 772 | ≤ 700 |

## Resumen · desktop (1440×900)

| Ruta | Rend. | Acces. | B. prácticas | LCP ms | CLS | TBT ms | JS KB (transf.) | JS sin usar KB | Peso total KB | axe | Contraste | Desborde px | Texto <12px | Interacción ms | Cuadro p95 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 99 | 96 | 96 | 1.023 | 0.000 | 0 | 503 | 203 | 1.257 | — | — | 0 | 0 | 0 | 33.4 |
| `/programacion/` | 92 | 100 | 96 | 1.257 | 0.000 | 190 | 772 | 197 | 1.622 | — | — | 0 | 0 | 48 | 16.8 |

**Peso visual** (cuánto hay que pintar y componer):

| Ruta | Nodos DOM | Altura px | backdrop-filter | filter | Capas fijas | Canvas (WebGL) | Animaciones CSS activas | will-change | FPS en reposo | FPS al desplazar | Cuadro p50 / p95 / máx al desplazar (ms) | Tareas largas (n / ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `/` | 520 | 9.210 | 19 | 4 | 9 | 0 (0) | 17 | 1 | 48 | 49 | 16.7 / 33.4 / 50 | 0 / 0 |
| `/programacion/` | 813 | 2.635 | 2 | 3 | 6 | 0 (0) | 0 | 1 | 60 | 57 | 16.7 / 16.8 / 33 | 1 / 193 |

## Resumen · mobile (390×844)

| Ruta | Rend. | Acces. | B. prácticas | LCP ms | CLS | TBT ms | JS KB (transf.) | JS sin usar KB | Peso total KB | axe | Contraste | Desborde px | Texto <12px | Interacción ms | Cuadro p95 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 79 | 96 | 96 | 5.485 | 0.089 | 118 | 503 | 203 | 1.257 | — | — | 0 | 0 | 0 | 16.8 |
| `/programacion/` | 55 | 100 | 96 | 6.511 | 0.000 | 1.000 | 772 | 197 | 1.614 | — | — | 0 | 0 | 32 | 16.7 |

**Peso visual** (cuánto hay que pintar y componer):

| Ruta | Nodos DOM | Altura px | backdrop-filter | filter | Capas fijas | Canvas (WebGL) | Animaciones CSS activas | will-change | FPS en reposo | FPS al desplazar | Cuadro p50 / p95 / máx al desplazar (ms) | Tareas largas (n / ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `/` | 520 | 14.884 | 19 | 4 | 9 | 0 (0) | 17 | 1 | 59 | 60 | 16.7 / 16.8 / 17 | 0 / 0 |
| `/programacion/` | 799 | 4.048 | 2 | 3 | 6 | 0 (0) | 0 | 1 | 60 | 59 | 16.7 / 16.7 / 17 | 1 / 176 |

## Detalle por ruta

### `/` · desktop
- Lighthouse: FCP 362 ms · Speed Index 362 ms · trabajo del hilo principal 491 ms · ejecución de JS 68 ms · 42 peticiones (JS 503 KB, CSS 78 KB, imágenes 533 KB, tipografías 77 KB)
- Elemento LCP: `<h1 class="MkS3jW_title">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast
- Oportunidades de Lighthouse: render-blocking-resources (); unused-javascript ( 203 KB); uses-responsive-images ( 56 KB); legacy-javascript ( 13 KB)
- LCP observado (sin throttling): 212 ms en `h1.MkS3jW_title`
- Encabezados visibles: 26, h1: 1
- Errores de consola: THREE.WebGLRenderer: A WebGL context could not be created. Reason:  disabled by enterprise policy or commandline switch | THREE.WebGLRenderer: THREE.WebGLRenderer: Error creating WebGL context.

### `/programacion/` · desktop
- Lighthouse: FCP 362 ms · Speed Index 704 ms · trabajo del hilo principal 854 ms · ejecución de JS 422 ms · 123 peticiones (JS 772 KB, CSS 81 KB, imágenes 651 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="CWmW1q_rail">`
- Lighthouse accesibilidad, auditorías falladas: label-content-name-mismatch
- Oportunidades de Lighthouse: prioritize-lcp-image (); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (190 ms 197 KB); uses-responsive-images ( 55 KB); legacy-javascript ( 13 KB)
- LCP observado (sin throttling): 512 ms en `aside.CWmW1q_rail`
- Encabezados visibles: 7, h1: 1
- Errores de consola: THREE.WebGLRenderer: A WebGL context could not be created. Reason:  disabled by enterprise policy or commandline switch | THREE.WebGLRenderer: THREE.WebGLRenderer: Error creating WebGL context.

### `/` · mobile
- Lighthouse: FCP 1.652 ms · Speed Index 1.652 ms · trabajo del hilo principal 1.602 ms · ejecución de JS 355 ms · 42 peticiones (JS 503 KB, CSS 78 KB, imágenes 533 KB, tipografías 77 KB)
- Elemento LCP: `<h1 class="MkS3jW_title">`
- Lighthouse accesibilidad, auditorías falladas: color-contrast
- Oportunidades de Lighthouse: render-blocking-resources (); unused-javascript (150 ms 203 KB); uses-responsive-images ( 49 KB); legacy-javascript ( 13 KB)
- LCP observado (sin throttling): 232 ms en `h1.MkS3jW_title`
- Encabezados visibles: 26, h1: 1
- Errores de consola: THREE.WebGLRenderer: A WebGL context could not be created. Reason:  disabled by enterprise policy or commandline switch | THREE.WebGLRenderer: THREE.WebGLRenderer: Error creating WebGL context.

### `/programacion/` · mobile
- Lighthouse: FCP 1.522 ms · Speed Index 1.860 ms · trabajo del hilo principal 2.908 ms · ejecución de JS 1.703 ms · 109 peticiones (JS 772 KB, CSS 81 KB, imágenes 643 KB, tipografías 30 KB)
- Elemento LCP: `<aside class="CWmW1q_rail">`
- Oportunidades de Lighthouse: prioritize-lcp-image (); render-blocking-resources (); unused-css-rules ( 17 KB); unused-javascript (900 ms 197 KB); uses-responsive-images ( 45 KB); legacy-javascript ( 13 KB)
- LCP observado (sin throttling): 440 ms en `aside.CWmW1q_rail`
- Encabezados visibles: 7, h1: 1
- Errores de consola: THREE.WebGLRenderer: A WebGL context could not be created. Reason:  disabled by enterprise policy or commandline switch | THREE.WebGLRenderer: THREE.WebGLRenderer: Error creating WebGL context.
