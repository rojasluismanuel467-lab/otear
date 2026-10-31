# Diagnóstico: ¿«pesada» es peso real o densidad?

Fecha: 31 de octubre de 2026 · Compilación medida: `58c4228` (la que está publicada) · Datos: [`base.md`](base.md), [`base-sin-webgl.md`](base-sin-webgl.md), [`base-experimentos.md`](base-experimentos.md). Es una medición de laboratorio sin GPU real (WebGL por software): sirve para comparar, no como cifra absoluta (ver [`README.md`](README.md), «Límites»).

## Respuesta corta

**Las dos cosas, en lugares distintos.**

- **Peso real, concentrado en dos pantallas: la landing y Programación**, las únicas con WebGL (el avión de la landing y el hangar 3D). Las otras seis pantallas pesan poco.
- **Densidad visual y de texto en la landing** (9.210 px de alto en escritorio, 14.884 px en móvil, ~18 animaciones CSS activas, 19 superficies con `backdrop-filter`) y bloques repetidos que dicen casi lo mismo.
- **En las pantallas de trabajo (Vuelos, Evolución, Servicios, Pagos, Informes, Documentos) no hay un problema de peso**: 400–550 nodos, 60 FPS en reposo, 2–3 `backdrop-filter`. Lo que se siente ahí es densidad de información, y eso se decide con personas, no con un medidor.

## Las pruebas

| Pantalla (escritorio) | Rendimiento Lighthouse | TBT | LCP | FPS al desplazar | Qué la pesa |
| --- | ---: | ---: | ---: | ---: | --- |
| Landing `/` | **50** | **3.012 ms** | 3.206 ms | 14 | Tarea larga de ~4 s al cargar |
| Programación `/programacion/` | **61** | **1.356 ms** | 1.778 ms | 22 | Igual (hangar 3D) |
| Vuelos, Evolución, Servicios, Pagos, Informes, Documentos | 72–84 | 339–402 ms | 0,8–2,4 s | 51–58 | JavaScript compartido del marco y de HeroUI |

En móvil (CPU 4× más lenta simulada) la landing saca **43** (LCP 12,4 s, TBT 6,6 s) y Programación **45**.

### 1. El 3D es lo que pesa

Misma compilación, mismo servidor, mismas rutas, pero con Chromium sin WebGL (`--disable-3d-apis --disable-gpu`):

| | Con WebGL | Sin WebGL |
| --- | ---: | ---: |
| Landing, rendimiento (escritorio) | 50 | **99** |
| Landing, TBT (escritorio) | 3.012 ms | **0 ms** |
| Landing, rendimiento (móvil) | 43 | **79** |
| Programación, rendimiento (escritorio) | 61 | **92** |
| Programación, TBT (escritorio) | 1.356 ms | **190 ms** |

El desglose de Lighthouse sobre la landing (una corrida aparte, servida sin compresión) lo confirma: la evaluación de script está en el trozo de `three` (276 KB sin comprimir), dentro de una sola tarea larga (~4 s en la medición base) que bloquea el hilo principal. El titular ya está en pantalla a los 0,4 s (captura intermedia), pero el LCP observado es ~2 s con un FCP de 0,36 s; lo más probable es que el navegador no presente ese cuadro hasta que la tarea termine (no se comprobó más allá de esa coincidencia).

**Advertencia importante:** la WebGL por software (SwiftShader) es mucho más lenta que una tarjeta o un teléfono (no se midió cuánto). En un equipo con GPU el costo será menor. La conclusión sólida es la **dirección** (el 3D carga y se inicia en el camino crítico, bloqueando el hilo principal) y no la cifra; los teléfonos de gama baja se parecen más a esta medición que un portátil. Por eso la mejora que se aplica no quita el 3D: lo **difiere** (se inicia cuando el navegador está libre y, en Programación, solo cuando el hangar está cerca de la pantalla).

### 2. Qué efecto visual cuesta (experimentos)

Quitando un efecto a la vez y recorriendo la página (`base-experimentos.md`, 2 repeticiones; los cuadros salen de 16,7 en 16,7 ms, así que un escalón es ruido):

- `backdrop-filter`: es el único con mejora **consistente**: baja el cuadro p95 un escalón en la landing (escritorio −16,7 ms y móvil −16,6 ms) y en Evolución. Sobre la landing hay 19 superficies con él, la mayoría **encima de un fondo que ya está desenfocado**, así que el segundo desenfoque no se ve.
- Quitar `filter`, los pseudo-elementos del fondo, las animaciones CSS, los canvas o las sombras: sin diferencia que se distinga del ruido en escritorio y móvil, salvo sombras en Evolución (−16,7 ms, un escalón). No es donde está el costo.
- Cursor-dron: solo existe con mouse y sin `prefers-reduced-motion`; no se midió aparte (su costo es una capa pequeña que se mueve con `transform`). Queda como decisión de gusto, no de rendimiento.

### 3. El JavaScript compartido es del marco, no de Otear

Todas las pantallas de trabajo cargan 617–772 KB de JS comprimido; de ellos el marco (React, Next) y HeroUI/react-aria son ~400 KB. Hay ~140–200 KB «sin usar» por ruta (Lighthouse), repartidos en trozos pequeños. No hay una ganancia grande sin cambiar de librería. El umbral de 700 KB del script se supera solo en Programación (772) y Vuelos (757) por su código propio (mapas de Leaflet, hangar).

### 4. Densidad visual (la parte que no se mide con un script)

- La landing son 9.210 px en escritorio. Las secciones «Qué resuelve» (3 pasos), «Ejemplos de uso» (caso principal + 4 sectores + «Su sector»), «Para quién» (2 roles + tarjeta de operador con 3 columnas), «A su medida» (3 pasos) y «Qué hay hoy» (3 columnas) repiten el mensaje «sirve a cualquier sector, se adapta, Otear no hace los vuelos» con párrafos de 40–85 palabras.
- En las pantallas de trabajo, la franja «Ejemplo, no real» ocupa una fila completa en todas (es honestidad de la demo y se conserva), más la barra superior con selector de sector, «Demo interactiva» y buscador. No se midieron como defecto.

## Fallos de accesibilidad y de reglas del proyecto encontrados en la base

Valores de la corrida base (con animaciones apagadas durante axe):

| Hallazgo | Dónde | Detalle |
| --- | --- | --- |
| Contraste < 4,5:1 del texto rojo (`--danger` #ff383c da 3,1 a 3,6:1) | Pagos (móvil, 5 elementos), Informes, Servicios | Lo usan 29 reglas de CSS como color de texto |
| `.text-muted` #6f787f sobre grises | Servicios, diálogos | 3,9–4,5:1 |
| Etiqueta accesible del buscador no contiene el texto visible | Todas las pantallas de la app | «Buscar vuelos» frente a «Buscar un vuelo» (WCAG 2.5.3) |
| `<small>` de 11,2 px | Servicios (9), tabla de cotizaciones | Rompe el piso de 12 px |
| Año de la gráfica a 11,5 px | Evolución | Rompe el piso de 12 px |
| `<small>` dentro de `<dl>` | Pagos | HTML no válido para lectores de pantalla |
| Marcador del mapa de 22×34 px tapado por otro | Vuelos, Evolución (datos de ejemplo) | WCAG 2.5.8; pendiente (ver informe final) |
| Un `404` en Programación | Programación | Se anotará la URL en la corrida siguiente (el script ahora la imprime) |

## Qué se hace con esto

Orden por beneficio medido:

1. Diferir el 3D (landing y hangar de Programación) — la única pieza con peso real.
2. Quitar el `backdrop-filter` redundante de la landing.
3. Acortar y plegar la landing sin quitar honestidad.
4. Corregir contrastes, etiquetas y tamaños mínimos (llevan los umbrales a cero).
5. Documentar lo que queda para decidir con el dueño (cursor-dron, franja «Ejemplo, no real», 3D por defecto en teléfonos gama baja).

Los resultados antes y después están en `final.md` y en el informe final.
