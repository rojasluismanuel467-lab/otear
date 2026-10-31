# Auditoría repetible de la interfaz

`npm run audit:ui` mide la interfaz de Otear con las mismas reglas cada vez y deja un informe en Markdown (y un JSON para comparar). Sirve para tres cosas: saber si algo «pesa» antes de quitarlo, comprobar que un cambio mejora lo que dijo mejorar, y avisar si una rama empeora lo que ya estaba bien.

No añade nada a producción: son `devDependencies` (`lighthouse`, `axe-core`, `playwright-core`) y no descarga ningún navegador; usa el Chromium de `~/.cache/ms-playwright` (o `CHROME_PATH`, o Google Chrome).

## Cómo correrlo

```bash
# Lo más corto: compila, sirve out/ en el puerto 3470 y audita las 8 rutas en escritorio y móvil.
npm run audit:ui -- --build --label mi-cambio

# Sin compilar de nuevo (ya hay out/):
npm run audit:ui -- --label mi-cambio

# Contra un servidor que ya está corriendo (p. ej. npm run start, o un despliegue de prueba):
npm run audit:ui -- --url http://localhost:3000 --label local

# Comparar con la corrida base y fallar si hay regresiones:
npm run audit:ui -- --label mi-cambio --compare docs/planning/ui-audit/base.json

# Más repeticiones de Lighthouse (mediana) y los experimentos de costo:
npm run audit:ui -- --label final --lh-runs 3 --experiments
```

Otras opciones: `--routes /,/vuelos/`, `--viewports desktop`, `--no-lighthouse`, `--no-axe`, `--no-screens`, `--no-keyboard` (omite teclado y movimiento reducido), `--full-page` (captura de toda la página), `--report-only` (nunca sale con código 1), `--chrome-flags="<banderas>"` (por ejemplo `--disable-3d-apis --disable-gpu` para medir sin WebGL), `--inject-css="<css>"` (prueba un cambio de CSS sin editar el código; no afecta a Lighthouse), `--out <carpeta>`, `--config <archivo>`. `node scripts/ui-audit.mjs --help` las lista.

**Mida siempre contra la compilación de producción** (`out/`), no contra `npm run dev`: el modo de desarrollo añade mucho JavaScript y falsea todas las cifras. **No corra una compilación ni otra cosa pesada mientras audita**: la medición es sensible a la carga de la máquina. Si va a comparar dos corridas, hágalo en la misma máquina y sin otra cosa abierta.

Salida, en `docs/planning/ui-audit/` (o `--out`): `<etiqueta>.md` (informe), `<etiqueta>.json` (datos, para `--compare`) y `<etiqueta>/capturas/*.jpg`. Código de salida: `0` todo dentro de umbral, `1` hay valores fuera de umbral o regresiones, `2` error de la herramienta.

## Qué mide

| Dato                                                                          | De dónde sale                                            | Para qué                                                                                                  |
| ----------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Rendimiento, accesibilidad y buenas prácticas (0–100)                         | Lighthouse 12 (móvil con su estrangulamiento simulado)   | Visión general                                                                                            |
| LCP, CLS, TBT, FCP, Speed Index, JS/CSS/imágenes/tipografías transferidos     | Lighthouse                                               | Peso real de carga                                                                                        |
| LCP observado sin simulación                                                  | `PerformanceObserver` en la página                       | Contrastar el LCP simulado                                                                                |
| **INP**                                                                       | **No se puede medir en laboratorio.** Se usa una _sonda de interacción_: clics reales en pestañas, resúmenes y botones desplegables, y se toma el evento más lento (`PerformanceObserver` tipo `event`) | Detectar interacciones lentas; el INP real exige usuarios (Cloudflare Web Analytics no lo mide) |
| Violaciones WCAG 2.0–2.2 A/AA                                                 | axe-core 4 (con animaciones apagadas, para no medir contrastes a medio aparecer) | Accesibilidad automática; **no certifica conformidad**, no ve teclado ni lector de pantalla               |
| Contraste menor de 4,5:1                                                      | regla `color-contrast` de axe (más los «indecidibles» sobre fondos con imagen o desenfoque, que hay que mirar a ojo) | Texto legible                                                                                             |
| Desborde horizontal                                                           | `scrollWidth` frente al ancho visible, con los elementos que se pasan | Móvil sin barra horizontal                                                                                |
| Texto por debajo de 12 px                                                     | Recorrido de los nodos de texto visibles con su tamaño calculado | El piso de 12 px del proyecto (se ignora la atribución de Leaflet, que no es nuestra)                      |
| Un solo `h1` visible                                                          | DOM                                                      | Estructura de encabezados                                                                                 |
| **Peso visual**: nodos DOM, altura de página, `backdrop-filter`, `filter`, capas fijas, canvas y contextos WebGL, animaciones CSS activas, `will-change` | DOM y estilos calculados | Distinguir «pesada» por peso real de «pesada» por densidad (ver `diagnostico.md`)                         |
| Fluidez: FPS en reposo y al desplazar (cuadro p50/p95/máx, cuadros > 33 ms), tareas largas | `requestAnimationFrame` mientras se recorre la página a 1.400 px/s; observador de tareas largas | Notar tirones                                                                                             |
| Errores de consola y peticiones fallidas                                      | Playwright                                               | Recursos rotos (p. ej. un 404)                                                                            |
| Capturas                                                                      | Playwright (JPEG, ventana visible)                       | Mirar a ojo qué se midió                                                                                  |
| **Teclado**: recorrido con Tab (hasta 60 paradas, en su propia página) | Playwright: elemento enfocado, anillo de foco (propio o de un contenedor cercano), si está visible y si otro elemento lo tapa, `tabindex` positivo, trampa (el mismo elemento 4 veces seguidas). Los marcadores de los mapas de Leaflet y los campos de fecha nativos se excluyen (se superponen o resaltan por dentro por diseño) | Que todo se alcance y se vea con el teclado (WCAG 2.1.1, 2.4.7); **no** reemplaza probar con teclado y lector de pantalla |
| **Movimiento reducido**: carga con `prefers-reduced-motion: reduce` | `document.getAnimations()`: cuántas animaciones siguen y cuántas son infinitas o de más de 400 ms | Que la preferencia se respete en CSS (no ve el 3D ni el JS propio que no use animaciones del documento) |
| **Experimentos de costo** (`--experiments`)                                   | Quita un efecto por vez con CSS inyectado (sin `backdrop-filter`, sin `filter`, sin fondo, sin animaciones, sin canvas, sin sombras) y repite el recorrido | Saber qué efecto cuesta, antes de decidir quitarlo                                                        |

### Límites que hay que leer antes de usar una cifra

- Es **laboratorio, no usuarios**: Chromium sin GPU real (render por software con SwiftShader) en la máquina de desarrollo. La **WebGL por software es mucho más lenta que en una tarjeta o un teléfono**: el TBT y los FPS de las pantallas con 3D (landing y Programación) están inflados en términos absolutos. Sirven para comparar una corrida con otra en la misma máquina, no como «así lo verá el cliente».
- Lighthouse tiene varianza (±5 puntos de rendimiento entre corridas). Por eso `--lh-runs 3` (mediana) para las comparaciones que importan.
- El servidor local comprime el texto con gzip como Cloudflare Pages, pero no tiene latencia de red real; Lighthouse la simula.
- axe detecta cerca de un tercio de los problemas de accesibilidad; que dé cero no demuestra que sea accesible. Teclado, foco, lector de pantalla y movimiento reducido se revisan a mano.

## Umbrales (`scripts/ui-audit.config.json`)

Son objetivos del equipo, no estándares externos, y se pueden cambiar con una decisión (no para «hacer pasar» una corrida). Cada valor fuera de umbral aparece en la tabla «Resultado» del informe y hace salir con código 1.

| Medida                                  | Escritorio | Móvil | Nota                                                    |
| --------------------------------------- | ---------: | ----: | ------------------------------------------------------- |
| Lighthouse rendimiento                  |      ≥ 80  | ≥ 50  | Móvil con CPU 4× más lenta simulada                     |
| Lighthouse accesibilidad                |      ≥ 95  | ≥ 95  |                                                         |
| Lighthouse buenas prácticas             |      ≥ 90  | ≥ 90  |                                                         |
| LCP                                     |  ≤ 2.500 ms | ≤ 4.000 ms | Umbral «bueno» de Core Web Vitals en escritorio; en móvil es más laxo que el 2.500 ms de Google porque la medición es por software |
| CLS                                     |    ≤ 0,1   | ≤ 0,1 | Umbral «bueno» de Core Web Vitals                        |
| TBT                                     |  ≤ 300 ms  | ≤ 1.200 ms | Sustituto de laboratorio del INP                         |
| JS transferido                          |  ≤ 700 KB  | ≤ 700 KB | El marco y HeroUI ya son ~600 KB: no baja de ahí sin cambiar de marco |
| axe: reglas incumplidas / contrastes    |      0 / 0 | 0 / 0 |                                                         |
| Desborde horizontal                     |       0 px |  0 px |                                                         |
| Textos por debajo de 12 px              |          0 |     0 |                                                         |
| Interacción más lenta (sonda)           |   ≤ 200 ms | ≤ 400 ms | Referencia de INP «bueno»: ≤ 200 ms                   |
| Cuadro p95 al desplazar                 |   ≤ 50 ms |  ≤ 50 ms | 50 ms ≈ 20 FPS; alerta de tirones evidentes            |
| `h1` visibles                           |          1 |     1 |                                                         |
| Teclado: paradas sin anillo / tapadas   |      0 / 0 | 0 / 0 | También trampas de teclado y `tabindex` positivo       |
| Movimiento reducido: animaciones largas o infinitas |  0 |  0 |                                                    |

**Regresiones** (solo con `--compare`): rendimiento −5 puntos, accesibilidad −1 punto, LCP +15 %, JS transferido +10 %, y cualquier violación de axe, texto menor de 12 px o píxel de desborde nuevos frente a la corrida base.

## Cuándo correrlo (el proceso repetible)

1. Antes de empezar una ronda de mejora: `npm run audit:ui -- --build --label base --lh-runs 3 --experiments`. Se queda como punto de comparación (no se borra).
2. Por cada pantalla o efecto que se vaya a tocar: mirar el experimento que lo señala (¿cuesta algo de verdad?), cambiar, y volver a medir solo esa ruta (`--routes /vuelos/ --viewports desktop,mobile --compare …/base.json`).
3. Al terminar: corrida completa con `--label final --lh-runs 3 --compare docs/planning/ui-audit/base.json`, y un informe corto de qué mejoró (con números), qué no se hizo y qué decide el dueño.
4. Después, a ojo: escritorio y móvil, teclado, movimiento reducido. La auditoría no sustituye esa revisión ni las pruebas con personas (`docs/planning/prueba-con-personas.md`).

Las capturas de cada corrida van en `docs/planning/ui-audit/<etiqueta>/capturas/`; se confirman solo las de las corridas de referencia (`base`, `final`).

## Bucle por pantalla y prompt-plantilla

Lo que funcionó y lo que recomiendan Anthropic y practicantes (guía de buenas prácticas de Claude Code, «Prompting for Frontend Aesthetics»): dar al agente un **chequeo pasa/falla** y exigir **evidencia** (comando y salida, o captura), no «todo pasa».

1. **Una pantalla por agente, en su worktree** (`npm ci` en cada uno; 3–5 en paralelo como máximo y nunca dos sobre los mismos archivos).
2. **Antes:** captura solo de la zona (no la página entera) y `npm run audit:ui -- --routes /ruta/ --label antes`.
3. **Un cambio concreto y medible por ciclo** (tamaño, espaciado, contraste, un efecto). Nueva captura y medición. Si no converge en 1–2 intentos, cambiar de enfoque.
4. **Chequeo:** `npm run check`, `npm test` y `npm run audit:ui -- --routes /ruta/ --compare docs/planning/ui-audit/base.json` (sale con 1 si empeora algo).
5. **Revisión independiente de solo lectura** (subagente nuevo o `/code-review`), pidiendo solo fallos de corrección, no estilo.
6. Un commit por cambio, con los números antes/después en el mensaje. La dirección estética ya está fijada (`DESIGN.md`, Instrument Sans + EB Garamond cursiva, tokens): se usa como restricción, no se reinventa.

Plantilla de prompt:

> En `src/features/<pantalla>/<archivo>`: <síntoma observable, con la captura y la cifra de `base.md`>. Está «arreglado» cuando <criterio medible: p. ej. `npm run audit:ui -- --routes /ruta/` baja X o sube Y sin nuevas violaciones, y la captura muestra Z>. Siga el patrón de <componente existente>; sin librerías nuevas; respete los tokens de `globals.css`, el piso de 12 px, `useTerm()` y las reglas de honestidad del `CLAUDE.md`. Incluya estados vacío y de error, teclado y `prefers-reduced-motion`. Termine solo cuando `npm run check`, `npm test` y la auditoría pasen, y muéstreme la salida y las capturas antes/después.

Lighthouse, axe y las capturas no sustituyen las pruebas funcionales ni a las personas: tras cada cambio, mirar también el diff.
