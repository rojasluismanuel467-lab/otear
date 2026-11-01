# Revisión externa de la entrega S2 «Verificar el cobro» (1 nov 2026)

Revisor: sesión independiente. No toqué código, skill, entrega ni capturas. Probé el enlace público https://otear.pages.dev/prototipo/verificar-cobro/ (responde 200, contexto de navegador limpio) con Chromium a 1280×800, 1366×768, 1024×768, 800×600 y 375×812, y comprobé las referencias contra el PDF de S1 (`Otear_Entrega_Prototipo_Baja_Fidelidad_LUIS ROJAS.pdf`). Medí con estilos calculados y archivos propios (`.txt`, `.shp`, KML vacío, KML roto, GeoJSON de puntos, de un lote, de 123 ha, de otra finca, binario de 15 MB), pegué textos de 5.000 caracteres, hice doble clic, recargué y usé «Atrás».

Lo que **no** pude comprobar: cómo se ve la skill «cargada» en Claude Code, qué es la «plantilla B» (no tengo la consigna), si Maze acepta un enlace externo como prototipo, lector de pantalla, Safari/Firefox, y si `npm test` pasa (solo conté 16 `it(...)` en `verification.test.ts`).

---

## (a) Veredicto

1. **El flujo es sólido y se completa sin callejones** (camino feliz, tres errores de mapa, error de vuelo, error de envío, confirmación, «En reclamo», volver). Grises, sin transiciones, foco de 3 px, contraste sin fallas, sin desborde a 1024–1536 px. Eso es lo mejor de la entrega.
2. **El borrador afirma cosas que el prototipo vivo contradice.** La más grave: con cobro de $0, «Enviar evidencia al operador» sigue habilitado y abre un mensaje en blanco, justo lo que D3 dice haber corregido. Si quien califica carga ese caso (el PDF lo invita), lo ve.
3. **Auditoría y prompt log tienen huecos de rúbrica reales**: D4 y D5 no tienen captura antes/después (la ficha dice que las 5 la tienen), la iteración 2 no es un prompt, el primer prompt tiene nueve palabras, faltan la captura de la skill y la «plantilla B», y hay tres cajas «PENDIENTE» dentro del PDF.
4. **Cifras que no cuadran entre secciones** (77 vs 78 caracteres, 7 casos vs 6 u 8, «cuatro rompieron» vs 3, $50.000.000 vs $49.999.994 en pantalla, «Lotes 9 y 16» con una finca de 12 lotes), y la rúbrica califica «contenido real y coherente».
5. **El PDF no está listo para imprimirse**: anexo de la skill al final y no en el orden exigido, tabla de estados partida y con recortes ilegibles, páginas casi vacías, captura con la insignia «N» de Next.js en todas las pantallas.

**Nota estimada hoy, tal como está el borrador (sobre 5):**

| Criterio | Puntos | Estimado | Por qué |
|---|---|---|---|
| Contexto y especificación | 1,0 | **0,45–0,55** | Skill con 7 bloques y reglas verificables, pero 25 de 53 reglas no citan nada de S1, no hay captura de carga y el prompt log no cumple las 3 capas ni la plantilla. |
| Auditoría y resiliencia | 1,5 | **0,95–1,10** | D1–D3 son de fondo y tienen captura; D3 está mal resuelta; D4/D5 sin captura; stress test variado pero con conteos y afirmaciones inexactas. |
| Comportamiento y navegación | 1,5 | **1,10–1,25** | Flujo completo y público; restan el caso $0, el diálogo pegado a la esquina, el viewport real, y que «sin instrucciones» no se cumple del todo. |
| Decisión estratégica | 1,0 | **0,70–0,80** | Matriz buena; hipótesis en formato pero con criterios mezclados; herramienta en más de 2 líneas; el PDF no es autoexplicativo con PENDIENTES y orden alterado. |
| **Total** | 5,0 | **≈ 3,2–3,7** | |

Con los bloqueantes y los importantes corregidos, creo que se llega a **≈ 4,2–4,5**. Lo que más pesa y es más barato: bloqueantes B1–B3.

---

## (b) Hallazgos, por costo estimado

Convenciones: **[bloqueante]** arreglar hoy; **[importante]**; **[menor]**. «Costo» es mi estimación en puntos de los 5.

### B1 · [bloqueante] Cobro de $0: «Enviar evidencia» sigue habilitado y abre un mensaje vacío; D3 afirma lo contrario (costo 0,15–0,30)

- **Dónde:** `src/features/prototype/verify-charge/verify-screen.tsx:447-458` (botón `send`, solo se deshabilita si no hay `verification`); `entrega.md:135-141` (D3), `:158`, `prompt-log.md:25`, `entrega.md:105-106`; captura `despues-B2-cobro-cero-verificar.png`.
- **Qué falla:** probé el caso «Cobro de $0» en el sitio publicado: `Enviar evidencia al operador disabled=false`; al pulsarlo abre «Compartir evidencia · diferencia de 0 ha ($0)» con «0 de 500 caracteres» y «Escriba el mensaje.». Es el «mensaje en blanco» que el registro dice haber eliminado. Además el veredicto del estado nuevo aún imprime «(-100 % frente a lo aplicado)», el «−100 %» que D3 cita como parte del error. La propia captura «después» muestra «Enviar evidencia» con trazo sólido (activo) y solo «Aceptar» discontinuo.
- **Por qué baja nota:** «Auditoría» exige corrección real de qué es irreversible/salidas; «Comportamiento», que lo que se declara se vea en el navegador. Es el caso que el PDF invita a cargar.
- **Arreglo (código, 2 líneas):** en `verify-screen.tsx` el `reason` del botón `send` debe ser
  `verification ? (verification.noCharge ? "No hay diferencia que reclamar: la factura está en $0." : undefined) : "Compare primero para ver qué enviar."`
  y en `verification.ts` no imprimir el porcentaje cuando `noCharge`. Recapturar `despues-B2-…` y volver a desplegar. Si no da tiempo de desplegar: reescribir D3 y el stress test diciendo lo que sí está (solo «Aceptar» deshabilitado y «Enviar» abre mensaje vacío) y dejarlo como límite declarado; es menos malo que una afirmación falsa.

### B2 · [bloqueante] D4 y D5 no tienen captura antes/después, y la ficha dice que sí (costo 0,20–0,30)

- **Dónde:** `entrega.md:28` («5 decisiones … con captura antes y después»); D4 (`:143-145`) y D5 (`:146-147`); `registro-auditoria.md:29` y `:33` («no lo captura una imagen»).
- **Qué falla:** solo D1, D2 y D3 tienen par de imágenes. D4 cita `13-compartir-error.png`, que muestra el error, no el antes/después, y no está en el PDF. D5 no tiene imagen. Además hay un solo commit (`76038c7`), así que el «antes» de D4/D5 ya no se puede reconstruir sin inventarlo.
- **Por qué baja nota:** «cada una con captura antes/después» es literal en la rúbrica y la afirmación del PDF es falsa tal como está.
- **Arreglo:** (1) corregir la ficha a «3 con captura antes y después, 2 documentadas sin captura»; (2) mejor, **convertir los defectos reales que encontré hoy en la iteración 2** (ver B3): cada uno se puede capturar «antes» **ahora** desde el sitio publicado y «después» tras corregir. Así D4/D5 quedan como «de fondo, sin captura previa» y D6–D8 nacen con captura honesta. No simule un «antes» editando el DOM.

### B3 · [bloqueante] Prompt log, plantilla B, captura de la skill, 3 cajas PENDIENTE, enlace (costo 0,40–0,60 en total)

- **Dónde:** `entrega.md:70`, `:76`, `:111`, `:189`; `prompt-log.md:5`, `:19-29`.
- **Qué falla:**
  1. **Iteración 1:** el único prompt real es «Flujo B, empieza con la skill y la ruta del prototipo» (9 palabras). Las «tres capas» se le atribuyen porque «las heredó de la skill»; quien califica leerá: el estudiante no escribió pantalla/comportamiento/contenido, la herramienta lo adivinó.
  2. **Iteración 2:** «por emitir». Lo de D1–D5 se hizo conversando. Reescribirlo como si fuera un prompt (aunque con «Nota de honestidad») es el peor de los dos mundos: si es post-hoc no es un prompt; si lo llama prompt, suena a reconstruido.
  3. Sin captura de la skill cargada, sin plantilla B, enlace «pendiente» (ya está publicado y responde).
- **Por qué baja nota:** es el 1 punto de «Contexto y especificación» (skill + prompt log) y parte de la formalidad del PDF.
- **Arreglo más honesto y sólido (2–3 h):**
  - Dejar la iteración 1 **como fue**, con el prompt corto, y decir en una frase que la especificación completa estaba en la skill (esa es la tesis de la entrega: la skill sustituye al prompt largo).
  - **Emitir hoy una iteración 2 real** sobre defectos reales que siguen abiertos, con tres capas escritas por usted y captura de la respuesta de la herramienta. Candidatos medibles, ya verificados (ver B4, B11): *Enviar en pantalla 12 queda en y = 851*, *«Cobro de $0» deja «Enviar» habilitado*, *«Sin leer» junto a «17,1 ha»*, *el diálogo de confirmación aparece pegado a la esquina superior izquierda*. Ejemplo de prompt (pantalla 11, estado $0):
    > **Pantalla:** «Verificar cobro» a 1280×800, tarjetas, veredicto y los dos botones sin cambiar la estructura de tres columnas.
    > **Comportamiento:** si la factura está en $0, al pulsar «Enviar evidencia al operador» no pasa nada porque el botón está deshabilitado y dice «No hay diferencia que reclamar: la factura está en $0.»; «Aceptar el cobro» igual; el veredicto no imprime porcentaje. Si falla, no hay salida nueva: el estado ya explica por qué y «Volver a Labores y tareas» sigue activo.
    > **Contenido:** «El operador no cobró esta labor ($0)» y la frase de arriba; mismos números de S1.
    Guardar el diff y una captura de antes (sitio hoy) y de después.
  - Si quiere una iteración 3, que sea la pantalla 12 (Enviar a 851 px): es otra pantalla clave.
  - Si la «plantilla B» exige campos (modelo, fecha, prompt, respuesta, decisión), llénelos con lo real; si no los tiene, dígalo al docente hoy, no a las 23:50.
  - La captura de la skill: abrir sesión nueva, escribir `/`, capturar la lista con `otear-prototipo-s2` y la descripción visible. Solo ese gesto vale ~0,1–0,15.
  - Borrar las tres cajas PENDIENTE y poner el enlace (https://otear.pages.dev/prototipo/verificar-cobro/). `build-pdf.mjs --final` ya rechaza el PDF si queda alguna.

### B4 · [importante] El «arreglo» D1 solo vale con un viewport de exactamente 800 px; la pantalla 12 repite el defecto (costo 0,10–0,20)

- **Dónde:** `entrega.md:120`; paso «Compartir evidencia» del prototipo.
- **Evidencia (medido):** «Comparar» queda entre y=722 y 770. A 1366×768 se corta 2 px; a 1536×730 y en cualquier ventana real (la pantalla de 800 px menos barra del navegador deja ~650–720 de alto) queda fuera o a medias. En la pantalla 12, «Enviar» arranca en y = 851 con 800 de alto (a 1280×650 está en 477 tras desplazar; sin desplazar no se ve). Es el defecto de D1 en otra pantalla, **no mencionado**.
- **Por qué baja nota:** «un evaluador externo lo completa sin instrucciones»: el que abre en un portátil ve un «Comparar» a medias. Y el PDF declara «medido a 1280×800» sin decir que es el viewport, no la ventana.
- **Arreglo:** (1) en el PDF, escribir «viewport de 1280×800 (no la ventana del navegador)»; (2) para Comparar, subir el paso 1 o mover el botón a la columna derecha junto al veredicto; (3) para la pantalla 12, reducir el área de vista previa o poner «Enviar/Cancelar» antes de los soportes. Si no hay tiempo, solo (1) y declararlo como límite.

### B5 · [importante] El veredicto no usa las 20,8 ha ni el vuelo propio; la hipótesis H1 queda ambigua (costo 0,10–0,25)

- **Dónde:** `entrega.md:36-38` (H1), tarjeta «LOTES 5 Y 6 · 20,8 ha · Pedido» de la pantalla 11.
- **Qué falla:** el veredicto compara **factura (18,4) contra el mapa del propio operador (17,1)**. El vuelo de Hernando solo aporta la tarjeta «20,8 ha»; no entra en ninguna cuenta (elegir el vuelo del 18 o del 12 produce error, el del 24 cambia solo la tarjeta). Pero la pregunta de la tarea es «revise si las hizo»: frente a lo pedido (20,8), el mapa deja **3,7 ha sin aplicar**, y eso no sale en el veredicto. El criterio de H1 («dicen que el operador cobró 1,3 ha de más») deja fuera a un participante que diga con razón «no aplicó 3,7 ha». Otras dos fricciones: el vuelo es del 24 oct, ocho días después de la labor, y fotos de esa fecha no demuestran qué se aplicó el 16; y la etiqueta «Pedido» no dice «pedido por quién».
- **Por qué baja nota:** Decisión estratégica (criterio medible y sin ambigüedad) y Comportamiento (que el elemento «vuelo propio» tenga efecto).
- **Arreglo:** una de estas dos, en el PDF (no hace falta tocar código): (a) en H1 cambiar el criterio a «dicen que el operador **cobró 1,3 ha más de las que muestra su propio mapa**»; (b) añadir una línea en el PDF: «Las 20,8 ha son el área de los lotes medida con su vuelo; el veredicto se refiere a lo cobrado frente a lo aplicado. Que falten 3,7 ha respecto de lo pedido se queda como pregunta para la semana 4». Cambiar «Pedido» por «Área de los lotes».

### B6 · [importante] La skill: 25 de 53 reglas sin hallazgo de S1, varias no se verifican como dicen, y el anexo «sin cambios» no lo es (costo 0,15–0,25)

- **Sin hallazgo de S1 (25 de 53):** 2.3, 2.6, 3.4, 3.5, 3.6, 4.2, 4.3, 4.8, 5.1, 5.3, 5.6, 6.5, 6.8 y las 12 del bloque 7 citan «Consigna S2», `CLAUDE.md`, `AGENTS.md`, «Rúbrica», «decisión del dueño». La consigna pide que cada regla cite **el hallazgo de la Semana 1**; citar «Rúbrica» como fuente de una regla se lee como diseñado para el calificador. La cita «Decisión del dueño (30 oct)» o «`AGENTS.md`» no le dice nada a quien califica.
- **No se verifican como dice:**
  - 2.4 «Cargar un `.shp`, un `.txt` y un KML vacío: tres errores distintos» → `.txt` y `.shp` dan **el mismo** mensaje (y el de `.txt` habla de Shapefile: «Otear lee mapas en KML o GeoJSON; los Shapefile (.shp) y los archivos comprimidos todavía no»).
  - 4.2 «No se carga Instrument Sans»: el navegador descarga `instrument-sans-latin-wght-normal.woff2` (viene del sitio completo); el cuerpo del prototipo usa Arial, pero el `body` de la página sigue en Instrument Sans.
  - 4.3 «sin `scroll-behavior: smooth`»: `getComputedStyle(documentElement).scrollBehavior` es `smooth` (heredado de la demo). En la práctica no se ve porque el que desplaza es el contenedor raíz, pero la regla se verifica con estilos calculados y falla.
  - 4.7 «objetivos ≥ 44 px»: el `<summary>` de «Datos de prueba» mide 958×32.
  - 6.4 «Variar las hectáreas cobradas y observar el cambio»: no hay control para variar el cobro; «Coincide» solo se alcanza en una prueba unitaria, no en el navegador.
  - 4.8 «Teclado completo» queda sin verificar (el propio PDF lo admite en «Qué no se verificó»); una regla que se declara sin verificar no debería estar como «verificable».
  - 5.4 dice «los cuatro errores»; el PDF (`entrega.md:60`) dice «cinco errores» y S1 (Tabla 10) lista tres.
  - 1.5 / matriz: «sin versión móvil» aparece solo en la skill; a 375 px el prototipo se deshace (menú de 230 px fijo, títulos partidos letra por letra). El PDF no lo dice ni en «Qué no se verificó».
- **Anexo:** `entrega.md:68` y `build-pdf.mjs` dicen «Se reproduce sin cambios», pero el script quita el front-matter (`name`/`description`, lo que hace que sea una skill) y renumera encabezados.
- **Arreglo:** (1) para las 25 reglas, citar el hallazgo de S1 que sí las motiva (p. ej. 7.1/7.2 → «S1 era escala de grises y baja fidelidad», Tabla 11; 7.5 → «Tabla 3 fila 3, 56 años: un `alert()` interrumpe»; 4.8 → persona de 56 años) y dejar «Consigna S2» solo como segunda fuente; (2) corregir 2.4 («dos errores distintos de formato/sin zonas más uno de otra finca») y 4.2/4.3 (ver código: `font-family`/`scroll-behavior` aplicados dentro de `.root`, o cambiar la regla a «el contenido del prototipo usa…»); (3) incluir el front-matter en el anexo y cambiar «sin cambios» por «sin cambios de contenido».

### B7 · [importante] Cifras inconsistentes entre secciones y con el prototipo (costo 0,10–0,15)

| Dato | En el PDF/skill | En el prototipo/código |
|---|---|---|
| Nombre del operador extremo | **77** caracteres (`entrega.md:162,160`; skill 5.7; auditoría) | **78** (el propio selector lo dice: «Operador con un nombre de 78 caracteres»; `data.ts:211`) |
| Casos extremos | «7 casos» (ficha, resumen), «siete casos extremos» (matriz) | el selector tiene 7 opciones **incluyendo** «Datos de S1 (normal)» → 6 extremos; la tabla de stress tiene 8 filas |
| «Cuatro rompieron algo» | `entrega.md:115` | la tabla muestra 3 (716 caracteres, $0, 40 labores); D1 y D4 no salieron del stress |
| Errores del mapa | «cinco errores» (matriz) / «cuatro errores» (skill 5.4) / tres (S1 Tabla 10) | cuatro mensajes distintos de mapa (formato, sin zonas, otra finca, demasiado grande) más vuelo y envío |
| Cobro de $50.000.000 | caso «Cobro de $50.000.000» | la tarjeta muestra **$49.999.994** (18,4 × 2.717.391); además el encabezado dice «$90.000 por hectárea» y la diferencia sale a $3.532.608 → dos precios por hectárea a la vez en la misma pantalla |
| Lotes de la hacienda | Hacienda con **12 lotes** (S1, perfil demográfico) | «Plateo · **Lotes 9 y 16**» (`data.ts:182`) |
| `MeasuringU, 2026` | cita en texto | la referencia no trae año (`entrega.md:199`); el artículo de «completion rates» es anterior |

- **Arreglo:** una pasada de buscar y reemplazar (77→78; 7→6 extremos o «siete escenarios, seis extremos»; «cuatro»→«tres»), cambiar «Lotes 9 y 16» por «Lotes 9 y 10» o «Lotes 11 y 12», y para $50.000.000 decir «$49.999.994 (redondeo por hectárea)» o ajustar la semilla; el contraste con los $90.000 por hectárea es en sí un hallazgo del stress test, no un «no se rompió» (ver B9).

### B8 · [importante] Diseño del PDF (costo 0,10–0,20)

- **Orden exigido:** Hipótesis → Matriz → Skill (anexo completo) + captura + herramienta → Prompt log → Registro → Link. El anexo está **después de Referencias** (pp. 14–23). Una lectura literal del orden lo considera fuera de lugar. Arreglo: dejar la sección 3 con herramienta + captura + una nota «Anexo A completo, p. X» y mantener el anexo al final, o mover el anexo justo después de la sección 3.
- **Anexo de 9 páginas ahoga el resto:** las tablas del anexo dan el mismo ancho a «#» que a «Regla» (4 columnas iguales), y «Regla» queda en una columna angosta de 7 palabras por línea. Con `table.skill th:first-child{width:6%}` y `td:nth-child(2){width:46%}` pasa a 5–6 páginas. «Cómo se usa esta skill» queda sola en p. 23.
- **Tabla de estados (pp. 10–11):** la fila de encabezado y la primera fila quedan al final de p. 10 y el resto en p. 11. Las miniaturas están a escalas distintas: «Enviar» normal es un bloque negro enorme (89 px de ancho ampliado a la celda), las de error son ilegibles al imprimir (texto de 6–7 pt). Es la evidencia central del criterio de 4 estados y es la menos legible. Arreglo: una tabla por elemento (4 columnas con la misma altura) o 2×2 por elemento a ancho completo, sin ampliar los recortes pequeños.
- **Páginas casi vacías:** p. 11 (43 palabras), p. 12 (el enlace, 102), p. 13 (referencias, 98), p. 23 (69). `h1 { break-before: page }` en `entrega.css` crea cada una; quitarlo para «6. Enlace» y «Referencias».
- **Texto de D1–D5 pegado:** pandoc une «Qué decidió la IA / Por qué es inadecuado / Corrección» en un solo párrafo (pp. 8–9) y se pierde el esquema que la rúbrica pide ver. Separar con línea en blanco o lista.
- **Título:** «Otear · Prototipo de mediana fidelidad (Semana\n2)» se parte feo.
- **Insignia «N» de Next.js** (círculo oscuro, abajo a la izquierda, 51,51,51) en todas las capturas de 1280×800 del PDF (`01`, `06`, `10`, `15`, `antes/despues-*`, `stress-*`): son capturas de modo desarrollo y rompen «sin marca». Se corrige recortando 60 px o recapturando contra el sitio publicado (también demuestra que se probó el enlace público).
- La ficha de la p. 1 ayuda y la página es breve; la dejaría. Sí falta una frase al comienzo de la ficha que diga qué es «S1» y «el Brief» (ver B10).

### B9 · [importante] El stress test sobreafirma y no prueba lo que dice (costo 0,10–0,20)

- **Dónde:** `entrega.md:160-161`, `registro-auditoria.md:53-54`.
- **Qué falla:** «Mapa vacío, roto, `.shp`, `.txt` o de otra finca: cada uno da su propio error». Medido: `.txt` = `.shp` (mismo texto, y habla de Shapefile para un `.txt`); KML vacío = KML roto = GeoJSON roto = GeoJSON de puntos («No encontré zonas aplicadas»). Y hay un caso no probado que sí rompe la lógica: un mapa válido de **123,4 ha** («Todo») se acepta como «123,4 ha leídas» y el veredicto dice «Facturó 105 ha menos… (−85,1 %)». La suma de áreas no se limita a los lotes 5 y 6 (el chequeo de «otra finca» solo mira 3 km). El mapa de un solo lote también pasa. Con «Nada se rompió» cuatro veces, un lector escéptico pensará que las pruebas fueron elegidas para no romper.
- **Arreglo:** (1) dejar de decir «cada uno da su propio error»: escribir «cuatro mensajes distintos para siete archivos»; (2) añadir una fila honesta: «Mapa válido pero de 123 ha: el prototipo lo acepta; no se recorta a los lotes 5 y 6. Decisión pendiente» (o hacerlo y corregirlo, con captura); (3) pasar «$50.000.000» a la columna «qué se rompió» como inconsistencia de precio por hectárea (ya lo notan, es el mejor ejemplo de contenido incoherente); (4) quitar las negritas en «Nada se rompió».

### B10 · [importante] Voz: el PDF no suena a quien tomó las decisiones, y se entiende a medias sin el Brief (costo 0 a 0,3; depende de cuánto penalice el docente)

**Lo que sí penalizaría un docente** (contenido, no estilo):
- Tercera persona y metatexto de borrador: «PENDIENTE (lo hace el autor)», «Las decisiones de alcance, flujo y criterios son del autor; la herramienta escribió el código» (`:66`). El estudiante habla de sí mismo como de otro. Es un tell fuerte de texto generado para ser leído, no escrito.
- Jerga y siglas de S1 sin definir en la sección donde aparecen: «PP3», «OD1», «Tabla 3, fila 3», «T2», «OB2», «supuesto de valor n.º 2», «Brief de S1», «la demo». Quien califica tiene el Brief, pero el PDF debe entenderse sin él; la definición de las abreviaturas **solo está en el anexo** (la skill, pp. 14–15). Una línea en la ficha («PP = punto de dolor; OD = objetivo de diseño; T2 = tarea 2 de la prueba») basta. «La demo» se usa para el proyecto de Otear anterior y para el prototipo (`Referencia de la demo: 5 %`, «La demo simuló una falla»): confunde.
- Citas de la IA que no están en ningún registro: D2 «porque «explica el cobro»»; D4 aparece con dos redacciones distintas (`entrega.md:144` vs `registro-auditoria.md:27`). Si no son literales, quite las comillas; si lo son, guarde la captura del chat.
- H1 y H2 mezclan criterios y una cifra de otra hipótesis (ver B12).

**Patrones que huelen a plantilla** (estilo; reescribir si queda tiempo):
- «*Resumen: …*» en cursiva abre cada sección con la misma forma. Déjelo solo donde de verdad resuma.
- Cada fila de la matriz termina con «**No se podrá concluir:** …» (×5), las cinco filas siguen «Nivel + detalle / Lo que X pone a prueba es… / No se podrá concluir». La fila de refinamiento visual tiene un argumento propio muy bueno («sin rojo y verde…»); el resto repite el molde.
- Títulos de D1–D5 con la etiqueta de la rúbrica entre paréntesis: «(acción primaria)», «(jerarquía de información)», «(qué es irreversible)», «(contenido real y coherente)». Se ven copiados del enunciado.
- «Honestidad» anunciada: «Límite que se declara», «Qué no se verificó», «Nota de honestidad», «no se reescribe como si hubiera ocurrido antes», «**No hubo prueba con personas**» en negrita. Decirlo una vez, en una caja «Límites», y quitar el resto. Las dos o tres veces que sí aporta («la prueba formativa no estima una tasa») son buenas; el exceso suena a postura.
- Negritas en medio de la prosa («**Producto.** … **Usuario.** … **Problema** …») y listas numeradas de cuatro razones paralelas (`:19-24`).
- Prosa con florituras: «la respuesta quedaba detrás del texto de quien más interés tiene en que se pague».
- Tablas perfectas con cada celda en la misma estructura; ningún error humano reconocido, ninguna duda («qué no sé todavía»).

**Cómo sonaría con voz propia (ejemplo, D2):**
> «Le pedí a la herramienta que mostrara la nota del operador y la puso arriba del veredicto. Con la nota larga (716 caracteres) el veredicto bajó a y = 701 y los botones quedaron fuera de pantalla. Yo, como Hernando, lo que quiero saber primero es si me cobraron de más; la nota es el argumento de quien quiere cobrar y puede ir después. Cambié el orden y la nota queda plegada con su largo en el título.»

Otro: en vez de «Se eligió porque: 1… 2… 3… 4…» → «Elegí este flujo porque es donde Hernando decide si paga, y eso es irreversible. Los otros dos de S1 (subir un vuelo, del hallazgo a la tarea) tienen patrones conocidos o dependen de cosas que todavía no decido, como la política de fotos sin GPS.»

### B11 · [menor/importante] Defectos del prototipo vivo (cada uno 0,02–0,10; juntos pesan en «Comportamiento»)

1. **Diálogo «¿Aceptar el cobro de $1.656.000?» pegado a la esquina superior izquierda** (480 px de ancho, encima del menú y del título), no centrado. Se ve igual en su propia `09-dialogo-aceptar.png`. Probable causa: el reset global quita el `margin: auto` del `<dialog>`; añadir `margin: auto` en `.dialog` de `prototype.module.css:503` (no verificado, es la hipótesis).
2. **«Sin leer» junto a «17,1 ha»** (`verify-screen.tsx:375`): después de leer el mapa y antes de comparar, la tarjeta «Aplicado» dice «17,1 ha / Sin leer / Según el mapa…». Contradictorio. Poner «Falta comparar» o el valor en pesos.
3. **El aviso «Todavía no hay una comparación. Lea el mapa del operador, elija uno de sus vuelos…»** sigue pidiendo leer el mapa cuando ya está leído.
4. **Mensaje del `.txt` habla de Shapefile** (ver B6).
5. **«Pedir el mapa al operador»**: «Mapa pedido al operador (simulación). … No se envió nada» se contradice dentro de la misma caja; es una salida que no avanza: la persona queda con el paso 1 vacío (puede usar el ejemplo, pero no lo dice).
6. **En «Ver reclamo» el enlace superior dice «← Volver a verificar el cobro» pero lleva a «Labores y tareas»** (`share-screen.tsx:113`).
7. **El `<summary>` «Datos de prueba» al fondo** es la única forma de ver el error de envío y la falla de «Aceptar»; alguien «sin instrucciones» nunca los ve. Está bien como diseño de prueba, pero el PDF debe decirlo (ver B13).
8. **Jerga**: «Referencia de la demo: 5 %» y «La demo simuló una falla al guardar» (un producto no se refiere a sí mismo como «la demo»; usar «Simulación»).
9. «Hacienda Santa Rita» parece un campo de texto/selector (caja con borde) y es un `div`; el borde discontinuo significa a la vez «deshabilitado», «aviso» y «placeholder» (menú lateral, nota de simulación y botones inactivos).
10. A **375 px** el prototipo es inutilizable (sidebar de 230 px fijo, contenido de ~145 px, título partido letra por letra). La skill (1.5) lo declara fuera de alcance; si el PDF afirma «navegable» sin mencionar viewport mínimo, alguien lo abrirá en un celular. Agregar a «Límites»: «Solo escritorio ≥ 1024 px».
11. «Atrás» del navegador sale del prototipo (la URL no cambia, por la regla 3.4) y recargar a mitad del flujo vuelve a la lista. Es consistente con la skill, pero quien califica lo tocará; una línea en la guía de recorrido («use los botones «Volver»; el botón Atrás del navegador sale del prototipo») evita una mala primera impresión.
12. El campo de mensaje y los soportes funcionan con extremos: 5.000 caracteres, espacios, emoji y `<script>` no desbordan, «Enviar» se deshabilita con motivo. Bien.

### B12 · [menor] Hipótesis, matriz y herramienta (costo 0,05–0,15)

- **H1/H2 usan el formato pero mezclan criterios.** H1: éxito 4/5 + tiempo < 2 min + confianza ≥ 4,5 en una sola frase «y». H2: 4/5 envían la evidencia **y** 3/5 cuentan una diferencia de cobro del último año (ese segundo es el criterio de la fila 2 de S1, no el de la pantalla). «Lo sabré si» debería ser un criterio con un número, y los otros dos pasan a métricas secundarias. H2 dice «pantallas 11 y 12» (el formato pide una).
- **Cita débil:** H1 cita «Tabla 3, fila 3 de usabilidad». En S1 esa fila es «una persona de 56 años sube un vuelo y lo deja en sus lotes sola, en 3 minutos» (subir un vuelo), no comprender un cobro. Cite la fila 2 y OD1 para H1, o diga «análogo a la fila 3».
- **H2 es casi una tautología con la tarea:** T2 dice «mándele la evidencia»; el prototipo ya cambia el botón principal. El PDF lo admite («Límite que se declara»); bien, pero el criterio «envían la evidencia sin pulsar Aceptar» no mide la hipótesis. Mejor: «al menos 3 de 5 deciden enviar la evidencia **antes de que se les diga qué hacer** (tarea abierta: «¿Qué haría con esta factura?»)».
- **Maze:** «éxito, tiempo y la pregunta de confianza se registran en Maze» — no puedo confirmar que Maze mida éxito/tiempo sobre un sitio externo con las tareas de S1; dígalo como «propuesto».
- **Herramienta justificada en dos líneas:** son cuatro y media (`:66`). Reducir a: «Código con Claude Code: el riesgo está en una cuenta (ha cobradas vs. aplicadas), en leer un KML real y en estados con espera; un generador de pantallas no da esa lógica ni pruebas.»
- **Referencias:** de 8, cinco no se citan en el texto (NN/g, TPX, Strategyzer, Lovable, Figma Make) y el formato no es APA como S1.
- **Falta una declaración de uso de IA**, que S1 sí tiene; aquí la herramienta escribió el código y la skill. Tres líneas bastan.

### B13 · [menor] «Cómo recorrerlo sin instrucciones» contiene instrucciones (`entrega.md:191`)

El título promete «sin instrucciones» y a continuación da un guion de siete pasos con un número de teléfono para provocar el error. Renombrar «Guía para quien califica (opcional)» y dejar el recorrido de un minuto; reservar «sin instrucciones» para lo que de verdad hace el prototipo solo (primera pantalla con un solo botón «Verificar cobro»; eso sí es cierto y es lo mejor que tiene).

---

## (c) Lo que está bien y no hay que tocar

- **Flujo y salidas:** pantalla 10 → 11 → 12 con volver en cada una, «Cambiar el mapa/la comparación», 4 salidas, sin dead ends comprobables; «Verificar cobro» es el único botón en la primera pantalla.
- **Estados con salida:** error de mapa, de vuelo y de envío tienen «qué pasó / por qué / qué puede hacer» y botones; «Corregir el número» devuelve el foco al campo; «Copiar el mensaje y el enlace» copia el texto y avisa «Copiado: péguelo en su WhatsApp»; el enlace vence el lun 9 nov 2026 (25 oct + 15 días, correcto).
- **Confirmación de lo irreversible:** el diálogo dice qué cambia, el foco arranca en «Cancelar», Escape lo cierra, doble clic en «Comparar» y en «Usar el mapa de ejemplo» no duplica nada.
- **Validación del WhatsApp y del mensaje:** acepta 10 dígitos con o sin +57, rechaza otros, límite de 500 caracteres con aviso, «Enviar» deshabilitado con motivo.
- **Escala de grises, sin sombras ni transiciones:** ningún elemento visible con matiz; transición y animación en 0 s; sin sombras; 0 textos bajo 12 px; 0 fallas de contraste en las tres pantallas (el gris de los deshabilitados pasa).
- **Foco visible de 3 px en todos los controles.**
- **Aritmética de S1:** 18,4 / 17,1 / 20,8 ha, 1,3 ha = $117.000 a $90.000/ha, 18,4 × 90.000 = $1.656.000 y 17,1 × 90.000 = $1.539.000 cuadran; las fechas con día de la semana (vie 16, sáb 24, mar 27, lun 12 oct 2026) son correctas; el formato colombiano de miles y decimales es consistente.
- **Extremos que sí se comportan:** nota de 716 caracteres (veredicto en y = 416, botones en 563), nombre de operador largo, 40 y 0 labores, $0 (aparte de B1). D1, D2 y D3 son argumentos de usuario, no de gusto, y sus capturas antes/después se distinguen a simple vista.
- **Matriz de fidelidad:** las cinco dimensiones de McCurdy con «qué no se podrá concluir» por fila; la de refinamiento visual (sin rojo/verde, entonces el texto debe sostener el veredicto) es el mejor argumento del PDF. Conviene dejarla casi igual y recortar solo el estribillo.
- **Honestidad sobre la prueba formativa** (4 de 5 como regla de decisión, intervalos 36–98 %): el cálculo es correcto (verifiqué Wald ajustado). Una sola vez, en una caja de límites.
- **Los 16 `it(...)`** de `verification.test.ts` existen (conté 16); la afirmación «16 pruebas automáticas» es cierta en lo que verifiqué, aunque no las ejecuté.
- **Enlace público:** responde 200 y funciona en contexto limpio.

### Resumen de qué hacer primero (orden sugerido, ~4–5 h)

1. B1 (código de 2 líneas + redeploy + recaptura) y B7 (buscar/reemplazar cifras).
2. B3: prompt de la iteración 2 sobre un defecto real con 3 capas, captura antes/después, captura de la skill, borrar PENDIENTE, poner enlace.
3. B2: corregir la ficha y la sección de D4/D5; sumar los defectos nuevos como D6–D8 con captura real.
4. B4/B5/B6/B9: texto del PDF (viewport, rol de las 20,8 ha, citas de S1 de la skill, stress test sin sobreafirmar).
5. B8 y B10: maquetación del PDF (orden, tabla de estados, anexo a 5–6 páginas, quitar la «N») y una pasada de voz en primera persona.
