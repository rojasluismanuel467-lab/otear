# Informe final: mejora de la interfaz (31 de octubre de 2026)

Rama `claude/mejora-ui-ux-a9733a` (sale de `main` en `58c4228`). **Sin push, sin mezclar en `main`, sin publicar.** Datos: [`base.md`](base.md) (antes) y [`final.md`](final.md) (después), misma máquina, mismo script, `--lh-runs 3`. Diagnóstico: [`diagnostico.md`](diagnostico.md). Cómo repetirlo: [`README.md`](README.md). Todas las cifras son de laboratorio sin GPU real (WebGL por software): sirven para comparar, no son lo que verá un cliente.

## Qué mejoró (con números)

| Medida | Antes | Después |
| --- | ---: | ---: |
| Landing, rendimiento Lighthouse (escritorio) | 50 | **63** |
| Landing, tiempo de bloqueo TBT (escritorio) | 3.012 ms | **1.944 ms** |
| Landing, LCP (escritorio) | 3.206 ms | **1.522 ms** |
| Landing, superficies con `backdrop-filter` | 19 | **1** |
| Landing, alto de la página (escritorio / móvil) | 9.210 / 14.884 px | **8.699 / 13.892 px** |
| Landing, FPS al desplazar (escritorio / móvil) | 14 / 41 | **20 / 50** |
| Programación, rendimiento (escritorio) | 61 | **77** |
| Programación, TBT (escritorio / móvil) | 1.356 / 4.751 ms | **373 / 1.408 ms** |
| Reglas de axe incumplidas (suma de 16 pantallas) | 17 | **4** (todas el mismo marcador del mapa) |
| Elementos con contraste < 4,5:1 | 12 | **0** |
| Textos por debajo de 12 px | 20 | **0** |
| Valores fuera de umbral | 65 | **48** |

Cambios que lo producen (un commit cada uno):

1. **Herramienta** (`d377dd1`): `npm run audit:ui` con Lighthouse, axe (WCAG 2.0–2.2 A/AA), desbordes, texto < 12 px, peso visual, fluidez, sonda de interacción, experimentos de costo, capturas y comparación con una corrida base.
2. **3D diferido** (`67bd390`): el avión de la landing se monta cuando el navegador está libre (máx. 1,5 s) y el hangar 3D de Programación solo cuando está cerca de la pantalla. No se quitó ningún 3D.
3. **Landing** (`3b7ca4d`): sin el segundo desenfoque de fondo en las tarjetas (ya estaban sobre un fondo desenfocado; no se notaba), textos más cortos conservando las advertencias de honestidad, y las tres columnas del operador en un desplegable.
4. **Accesibilidad** (`21d95a8`): rojo de texto `--danger-text` (#b42318, el #ff383c de HeroUI daba 3,1–3,6:1), `.text-muted` más oscuro, nombre accesible del buscador igual al texto visible, piso de 12 px en `<small>` y en la gráfica, `<dl>` válido en Pagos.
5. **Ejemplos de uso** (`6e7f5b3`), por su comentario de que «le quita estética y formalidad». Se miró cómo lo resuelven Planet (industrias en tarjetas iguales con una frase) y Skydio (columnas iguales, título y una frase). Antes: caso principal + lista compacta + tarjeta discontinua de otro tamaño. Ahora: caso principal con las tres cifras en columnas, **cuatro tarjetas iguales** (icono, sector, título, una frase) y «Su sector» como **franja** de ancho completo. Mismo texto de honestidad.
6. **Carta de navegación sobre el azul** (`dfa8079`), por su comentario de que el mapa casi no se notaba: relieve, curvas y cotas reales, **cuadrícula de latitud y longitud cada 15′** con coordenadas rotuladas (calculadas con la proyección del mosaico, norte arriba) y **rosa de los vientos**; velo difuminado tras el texto del hero para que se lea. También en la franja «Entre a la demo». `scripts/generate-chart-dark.py` lo regenera.

## Respuesta a «¿es peso real o densidad?»

Las dos cosas, en sitios distintos (detalle y pruebas en `diagnostico.md`): el peso real estaba en las dos pantallas con WebGL (sin WebGL la landing sube de 50 a 99 en la misma máquina); las seis pantallas de trabajo pesan poco (400–550 nodos, 60 FPS) y lo «pesado» ahí es densidad de información, que se decide con personas.

## Lo que no mejoró, o empeoró, y por qué

- **El 3D sigue costando en esta medición** (landing TBT 1.944 ms): la tarea larga ya no bloquea la primera pintura, pero sigue existiendo, ahora más tarde. Con GPU real será mucho menor; no está comprobado.
- **Programación, cuadro p95 al desplazar 100 → 917 ms (empeoró).** El hangar ahora arranca cuando se acerca a la pantalla, y en esta medición ese arranque cae durante el recorrido. Es el precio del diferimiento: se pagó en la carga y se paga al llegar al hangar. Con GPU real debería ser mucho menor, pero conviene mirarlo en un teléfono. Alternativa si molesta: arrancarlo en reposo sin esperar a acercarse.
- **Móvil, Lighthouse:** landing LCP 5.488 → 8.111 ms y Vuelos 60 → 51 son ruido (Vuelos no se tocó); la varianza móvil con CPU simulada es grande. Para decidir algo con móvil hay que repetir con más corridas o en un teléfono real.
- **JavaScript compartido (617–772 KB):** es del marco y de HeroUI; no se tocó. Sin cambiar de librería no baja de forma apreciable.
- **Marcador del mapa «Seguimiento de resiembra»** (WCAG 2.5.8, tamaño del objetivo 22×34 px, tapado por otro marcador de los datos de ejemplo): sigue. Se arregla separando esos dos puntos en las semillas o agrupándolos; es decisión sobre datos de ejemplo.
- **No se tocó la densidad de las pantallas de trabajo** (Vuelos, Evolución, Pagos, Informes, Servicios): ahí el medidor no señala un problema y rediseñarlas sin personas sería adivinar. `DemoInvite` y el aviso de bienvenida ya son discretos y descartables; no se cambiaron. La franja «Ejemplo, no real» se conserva (honestidad de la demo).
- **Cursor-dron:** no se midió aparte ni se tocó. Es decisión de gusto.
- **Falsa alarma que conviene saber:** el script informa `404 /models/dji/mavic-3-enterprise.glb` en Programación. No es un fallo del código: los GLB de DJI están fuera del repositorio (licencia sin resolver), así que faltan en cualquier copia limpia.
- **No se verificó:** teclado y movimiento reducido en lo cambiado (se probó a ojo escritorio y móvil con capturas; no una pasada completa de teclado), ni el comportamiento con GPU real.
- **Búsqueda de ejemplos:** no pude explorar Figma Community (no hay una herramienta de búsqueda de ese catálogo, y el conector de Figma pide autorización). Usé páginas publicadas de empresas de dron y de observación de la Tierra, vistas en el navegador (Planet, Skydio). Si quiere partir de un archivo de Figma concreto, pásemelo.

## Decisiones que quedan para usted

1. **¿Diferir el hangar solo cuando se acerca, o arrancarlo al estar en reposo?** Lo primero ahorra carga; lo segundo evita el tirón al llegar.
2. **¿Mantener el cursor-dron y el avión como están?** No pesan mucho aislados; son identidad. Si se quiere aligerar más, la palanca es arrancar el avión solo con pantalla de escritorio y GPU (no en teléfonos de gama baja) y mostrar la versión plana.
3. **Fondo del hero:** el contraste de la carta con el texto está medido a ojo, no con una herramienta (axe lo marca «indecidible» sobre fondos con imagen). Si el titular o las notas pequeñas se sienten cargados, baje `opacity` de `.heroContours` o suba el velo `.heroCopy::before`.
4. **Los umbrales del script** (`scripts/ui-audit.config.json`) son propuestas: rendimiento ≥ 80 escritorio y ≥ 50 móvil, TBT ≤ 300 ms. Con ellos, 48 valores siguen fuera, casi todos TBT por el JS del marco. O se afloja ese umbral o se acepta que el marco lo supera.
5. **Separar los dos marcadores que se tapan en las semillas** (ver arriba).
6. **Franja «Ejemplo, no real» en cada pantalla** (una fila completa): se dejó por honestidad. Si se vuelve pesada, podría pasar a una línea más baja o plegarse tras la primera visita (cambio de producto).

## Herramientas

**Instalado como devDependency** (en `package.json`): `lighthouse` 12.8.2, `axe-core` 4.14.0, `playwright-core` 1.64.1 (sin navegador propio). Nada en producción.

**Recomendado instalar del catálogo** (no instalé ninguno):

- `audit-suite` (comunidad): sirve como segunda opinión de diseño, UX, rendimiento y accesibilidad por pantalla; hay que leer su código antes de confiar en sus informes.
- `frontend-design` (Anthropic): útil al diseñar una sección nueva desde cero; para pulir las existentes ya alcanzan `impeccable` y las habilidades del proyecto.
- `ui-consistency` (comunidad): **revisar primero el gancho de inicio de sesión que trae**; el valor sería detectar valores sueltos frente a los tokens, pero eso se cubre en parte con Stylelint.

**Si falta algo, lo que más aportaría y es libre:** Lighthouse CI en GitHub Actions (el script ya sirve, solo habría que correrlo en cada PR), regresión visual con capturas de Playwright (el script ya hace las capturas, falta compararlas), Stylelint con una regla contra colores literales fuera de `globals.css` (para que no vuelva a aparecer un rojo de 3:1), y `eslint-plugin-jsx-a11y` (ya viene con `eslint-config-next`).

## Para repetir esta ronda

1. `npm run audit:ui -- --build --label base --lh-runs 3 --experiments` antes de empezar (no borrar la anterior).
2. Mirar qué efecto cuesta (experimentos), cambiar, medir solo esa ruta con `--compare`.
3. A ojo: escritorio y móvil, teclado, movimiento reducido. Con personas reales (`docs/planning/prueba-con-personas.md`) para la densidad.
