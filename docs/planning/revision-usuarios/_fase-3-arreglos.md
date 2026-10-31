# Arreglos de la tercera pasada (31 de octubre de 2026)

Fuente: `fase-3/*.md` (cinco informes de personas simuladas; hipótesis, no usuarios). Se reparte en cinco lotes con archivos propios. Cada agente lee su lote en esos informes (por ID), verifica en navegador que el hallazgo sigue reproduciéndose antes de tocar nada, corrige, y hace **un commit por hallazgo o grupo pequeño**. Si necesita un archivo de otro lote, lo dice en su informe en vez de editarlo.

| Lote | Hallazgos | Archivos propios |
|---|---|---|
| **A. Vocabulario y cambio de sector (demo)** | V3-02, G3-07, I3-09, I3-10, O3-02, N3-02, N3-04, V3-01 (lado demo: «Otro sector» abre una hacienda con «Mapa y lotes»), I3-11 y O3-03 (al cambiar de sector por la barra superior se queda el vocabulario del anterior), N3-10 | `src/features/config/**`, `src/features/entry/**`, concordancia de género/número en textos de `src/features/flights/review/*.tsx` (solo texto), `src/components/app-shell.tsx` (barra de sectores), `src/features/demo/demo-context.tsx` si hace falta |
| **B. Evidencia y semillas por sector** | V3-/G3-01, I3-01, O3-01 (la «evidencia» de construcción, minería y vigilancia es la foto de un cultivo, la misma en todas las tarjetas), G3-05 (minería sin un solo volumen), O3-07 (vigilancia: Evolución abre en un vuelo sin novedades y dice «mejoró»), G3-06 (conteo «6 facturas de 5 vuelos») | `public/images/**`, `src/lib/illustration.ts`, `src/components/ui/site-image*`, `src/features/demo/demo-data.ts` y `types.ts`, `src/features/reports/*` solo para el conteo G3-06 |
| **C. Móvil y landing** | V3-03, V3-04, V3-05, V3-06, V3-07, V3-08, V3-09, V3-10, I3-05, G3-02, G3-08, N3-05, N3-07, N3-08, O3-08 | `src/features/landing/**`, `src/app/globals.css`, `*.module.css` de cualquier módulo (solo estilos y orden de bloques), tablas de cotizaciones (`services/`), de operadores (`reports/`), de equipos (`fleet/`) solo en estilo/diseño responsivo |
| **D1. Firmas y documentos** | G3-03, I3-08 (verificar un archivo con lo que se ve en pantalla), G3-09 e I3-06 (la hora de la firma es la del computador; un solo «hoy»), N3-09 y G3-11 (códigos internos y restos en lo firmado), N3-06 (roles del diálogo en una finca), I3-07 (lista de firmados en Documentos), G3-04 (lo firmado en el informe consolidado), O3-05 (el informe que firma el operador incluye medidas del cliente) | `src/features/traceability/**`, `src/features/compliance/**`, `src/features/flights/review/flight-report.tsx`, `src/features/reports/decisions.ts` |
| **D2. Medidas, descartar y operador** | N3-01 y I3-03 (descartar con motivo: la ficha sigue viva, el tablero de Vuelos no lo cuenta, «No aplica» se acepta), I3-04 (tablero de medidas se sale en móvil), N3-11, O3-04 (la línea «por definir» no llega a Documentos; la flota muestra al piloto del otro operador), O3-06 (la entrega suma 25 min si se deja vacío), O3-09, O3-10, O3-11, O3-12, G3-10 | `src/features/flights/review/measure-board.tsx`, `follow-up-panel.tsx`, `follow-up.ts` (+ tests), `src/features/services/**`, `src/features/billing/**`, `src/features/fleet/**`, `src/components/ui/operator-scope-note.tsx` |

## Se deja para el dueño (no se construye sin su decisión)

- **I3-02 / I2-03:** cierre de una medida con «verificado por» y evidencia adjunta, y la regla de que no se cierre sobre algo sin confirmar (cambia el modelo de seguimiento).
- **N3-03:** edad y corte por suerte (los campos propios existen solo para vuelo, hallazgo, aeronave y factura; una suerte/zona sería un tipo de registro nuevo).
- **O3-08 (parte):** si el segundo equipo y «Papeles y costos» deben verse en teléfono o solo en escritorio.
- **V3-08:** el nombre de quién está detrás (falta el texto del dueño).
- Tope de rondas de disputa (O2-08), identidad real al firmar, vista del operador: ya decididos o ya preguntados.

## Reglas (las de siempre)

Datos sintéticos; Otear no presta vuelos; nada inventado (todo número nuevo «de ejemplo»); español de Colombia con «usted»; piso de 12 px; vocabulario con `useTerm()`; no resolver fotos sin GPS ni «G6»; ids `flight-${siteId}-01` y etiquetas de `preparation-items.ts` intactos; tests de comportamiento solo donde haya lógica pura; `npm run check` limpio y `npm test` en verde antes de cada commit. Sin push, sin merge a `main`.
