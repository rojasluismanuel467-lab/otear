# Segunda fase de la revisión por roles

Parte de `main` en el commit `2f2b1fe` (primera fase integrada y publicada). Lee primero `_backlog.md` y los cinco informes de esta carpeta; son hipótesis de personas simuladas, no resultados de usuarios.

## Decisiones del dueño (30 de octubre de 2026)

1. **Precio, datos y piloto:** la landing sigue en «por definir». No prometer piloto gratis, ni propiedad de datos, ni precio.
2. **Cómo entran los vuelos:** **el operador los entrega** (Servicios: el operador entrega, quien contrata verifica). En la demo ya vienen cargados; la carga real de archivos está por construir.
3. **Sectores en la landing:** **agricultura como caso principal**; los otros cuatro (carreteras, construcción, minería, vigilancia) como ejemplos en una franja, más la tarjeta «Su sector». La landing sigue diciendo que sirve a cualquier sector.
4. **Tarifas de ejemplo:** se quedan en unos $30.000/ha, siempre «de ejemplo».
5. **«Motivo de la elección» al asignar:** entra (opcional, texto corto).

Además, el dueño pidió construir las tres funciones que antes quedaron fuera: seguimiento de no conformidades hasta cerrarlas, responder a una disputa, e informe del vuelo firmable.

## Diseño común de las funciones nuevas (para que los lotes encajen)

**F1. Seguimiento hasta el cierre** (Lote H). En `Finding`, campo opcional `followUp?: { owner: string; dueDate: string; status: "open" | "inProgress" | "closed"; closedOn?: string; closure?: string; history: { at: string; text: string }[] }`. Una medida se abre al asignar responsable y plazo, pasa a «en corrección» y solo se cierra con una nota de cierre (qué se hizo y con qué evidencia). Se calcula «vencida» a partir de `dueDate` y la fecha de la demo. Cada cambio queda en `history`. Las sugerencias de IA sin revisar no tienen seguimiento. Los conteos de Evolución e Informes distinguen abiertas, en corrección, cerradas y vencidas.

**F2. Responder a una disputa** (Lote S). En la máquina de estados de Servicios, cuando la entrega está en `disputed` el operador puede: (a) **aceptar el ajuste** (las hectáreas a facturar bajan a lo que el cliente pide), (b) **sostener lo entregado** con una nota (y nombres de archivos de soporte, como ya se hace en la entrega), o (c) corregir y volver a entregar (ya existe). Con (a) o (b) la solicitud vuelve a `delivered` con la respuesta visible para que quien contrata verifique de nuevo. Todo queda en los eventos. Tests puros en `workflow.test.ts`.

**F3. Informe del vuelo firmable** (Lote T). Una plantilla nueva en `traceability/templates.ts`: «Informe del vuelo», con el contenido del `flightBrief` y el registro del vuelo, firmable por «Operador» y «Revisor o interventor». Se firma con el mismo mecanismo de huella y firmas de los demás documentos (si cambia el contenido, las firmas quedan inválidas). El «Acta de entrega» (`delivery-acceptance`) pasa a ser alcanzable desde la interfaz. Punto de entrada: un botón «Firmar el informe del vuelo» en `flights/review/flight-report.tsx`. El informe sigue siendo un borrador de demostración: la firma de la demo no tiene valor legal y el texto lo dice.

**F4. Motivo de la elección** (Lote S). `assign(...)` acepta un motivo opcional; se guarda en la solicitud y se muestra en el detalle y en el informe consolidado (`reports/decisions.ts`, que hoy dice «no se guarda»).

## Lotes (cada uno en su worktree; archivos propios)

| Lote | Archivos que puede editar | Trabajo |
|---|---|---|
| **S. Servicios y Pagos** | `src/features/services/**`, `src/features/billing/**`, `src/features/reports/decisions.ts` (+ su test), la región de **solicitudes de servicio** de `demo-data.ts` y la parte de `ServiceRequest` de `types.ts` | F2, F4. Además: «Área pedida 10 ha» en la vía (`billing/coverage.ts`: una línea no tiene hectáreas; mostrar km); la barra fija «Registrar pago» no debe tapar «Verificación del área» en pantallas bajas; en vías y vigilancia ocultar la cobertura por hectáreas de las entregas (hoy marcador de 1 ha); Servicios crea el vuelo con `aircraftId` (hoy «Por definir»); semilla de una solicitud en disputa para poder probar la respuesta. |
| **H. Hallazgos y seguimiento** | `src/features/flights/**` **excepto** `flights/review/flight-report.tsx`, `src/features/evolution/**`, `src/features/reports/**` **excepto** `reports/decisions.ts`, `src/features/agents/**`, `src/features/demo/demo-context.tsx`, la parte de `Finding` de `types.ts`, la región de **hallazgos** de `demo-data.ts` | F1. Además: los hallazgos viales sembrados todavía hablan de cultivo («confirmar la observación en sitio», fuente «Observación del operador · ejemplo»): que digan lo propio de cada sector; pestaña de Vuelos por URL (`?tab=`); abrir Informes en la pestaña «Informe». |
| **T. Trazabilidad e informe firmable** | `src/features/traceability/**`, `src/features/compliance/**`, `src/features/flights/review/flight-report.tsx` | F3. Además: la plantilla «predio» y su firma «Propietario o administrador» deben hablar de cada sector (vía, obra, mina, parque) en lugar de «predio»; la redacción impersonal de `templates.ts`. |
| **L. Landing, carcasa y mapas** | `src/features/landing/**`, `src/features/entry/**`, `src/features/config/**`, `src/features/sites/**`, `src/components/**`, `src/app/globals.css` | Decisiones 2 y 3 en la landing; botón «Menú» recortado en móvil (comprobar a 390 px y arreglar); mapas: marcar de otro color las líneas de la ruta que el operador declara sin volar, y que los puntos de la lista del Mapa no se confundan con la paleta de la gráfica de Evolución. **No** reescribir en la landing las promesas de las funciones nuevas (seguimiento, disputa, informe firmable): se hace al integrar, cuando existan. |

Si un lote necesita un cambio fuera de sus archivos, lo pide en su informe. Si dos lotes tocan `demo-data.ts` o `types.ts`, cada uno solo su región, y el integrador resuelve.

## Reglas

Las mismas de `_backlog.md`: datos sintéticos, Otear no presta vuelos, nada inventado (todo número nuevo «de ejemplo»), sin resolver la política de fotos sin GPS ni «G6», español de Colombia con «usted», piso de 12 px, vocabulario renombrable con `useTerm()`, ids y etiquetas de preparación intactos. Lo nuevo debe tener tests de comportamiento donde haya lógica pura (`workflow`, seguimiento, firmas), sin snapshots de marcado. No publicar ni subir nada.

## Después de los lotes

Integración en una rama, `npm run check` y `npm test` sobre el conjunto, reescritura de las promesas de la landing a lo que ya existe, y segunda pasada de las cinco personas sobre lo que cambió (prueba de 5 segundos y tareas fallidas), comparando con los informes de la primera fase.
