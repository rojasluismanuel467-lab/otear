# Cómo organizar la información de una pantalla

Fecha: 26 de octubre de 2026. Motivo: algunas pantallas (Equipos, Evolución) acumulaban demasiado contenido en una sola página.

## Qué dice la investigación consultada

**Pestañas** ([Nielsen Norman Group, «Tabs, Used Right»](https://www.nngroup.com/articles/tabs-used-right/), leído completo):

- Úselas para contenido largo con grupos claros que **no hay que comparar** entre sí, y cuando las pestañas no predeterminadas guardan contenido **complementario**, no crítico.
- No las use si el contenido no tiene grupos claros (mejor una página con subtítulos), si hay que comparar entre pestañas, si la información crítica quedaría en una pestaña oculta o si las etiquetas son largas (en móvil, mejor acordeones).
- «Cuantas menos pestañas, mejor». Evite barras que se desbordan en carrusel: lo oculto no se descubre.
- Etiquetas de una o dos palabras, que anticipen el contenido; no en mayúsculas.
- Una sola fila, encima del panel y unida visualmente a él; al menos dos indicadores de selección; una pestaña seleccionada por defecto, la más usada; no avanzar sola; no mezclar pestañas de página con pestañas de navegación; no hacer que un enlace parezca pestaña.
- Teclado (Enter o Espacio), foco visible y roles ARIA.

**Cuántas pestañas o segmentos.** NN/g no da un número. Otras guías de sistemas de diseño dicen: etiquetas cortas y pocas pestañas; las pestañas fijas son para un número limitado y las desplazables para muchas o variables (Material Design 2, citado por [SAP Fiori](https://www.sap.com/design-system/fiori-design-android/v26-4/components/m3-standard-components/tabs/usage)). La cifra «2–5» aparece en guías no oficiales; es una convención, no una regla de Google ni de Apple. No pude leer la página de segmentos de Apple, así que no cito su cifra.

**Cuántos componentes por ventana.** No existe un número respaldado. El «7 ± 2» de Miller se aplica mal a interfaces: trata de memoria de corto plazo, no de cuántos elementos mostrar, y trabajos posteriores (Cowan) apuntan a unos cuatro elementos ([Stéphanie Walter](https://stephaniewalter.design/blog/your-menu-doesnt-need-millers-7%C2%B12-rule/)). Lo que sí se sostiene es agrupar bien (chunking), reducir opciones donde importa el tiempo de decisión (ley de Hick) y la **divulgación progresiva**: mostrar por defecto lo primario y diferir lo secundario ([NN/g](https://www.nngroup.com/videos/progressive-disclosure/)). Un resumen secundario añade: no esconder campos obligatorios ni las consecuencias de acciones destructivas, y decidir qué es primario con tareas reales de los usuarios, no por intuición.

## Reglas que adopta Otear (propuesta mía, apoyada en lo anterior)

1. **Una pantalla, un objeto y una tarea principal.** Aquí es el dron (Equipos) o el sitio en el tiempo (Evolución). Va primero y grande.
2. **Maestro y detalle.** Se elige algo y el detalle aparece al lado (cajón) o debajo en pantallas estrechas; no se navega a otra página para ver una ficha. Es `StageDrawer`.
3. **Contenido crítico siempre visible.** La aptitud para volar y las alertas más graves están en el encabezado, sea cual sea la pestaña abierta.
4. **Pestañas solo para vistas hermanas**, máximo cuatro, una o dos palabras, la más usada primero (`SectionTabs`). Equipos: Piezas, Mantenimiento, Papeles y costos, Historial.
5. **Lo largo o secundario, plegado** (`<details>`): cómo se calcula el desgaste, lectura completa de los datos, fuentes, notas sobre los datos.
6. **Tareas con orden, en pasos, no en pestañas** (asistente de mapeo, registro de mantenimiento).
7. **Comparar es una vista, no dos pestañas**: si hay que comparar (fecha contra fecha), va en la misma superficie (escenario con línea de tiempo y selector de comparación).
8. **No es un límite duro:** el número de bloques visibles por pantalla se valida observando a personas usándola; aquí no hay datos de uso, solo estas guías.

## Pendiente

Aplicar el mismo criterio a Vuelos (ya usa cuatro pestañas), Informes y Pagos, y revisar con personas si «Papeles y costos» es la etiqueta que esperan.

## Segunda ronda: patrones de pantalla en sistemas de este tipo (29 de octubre de 2026)

Motivo: la demo es un sistema de trabajo con un objeto principal, listas, mapa y acciones que cierran un proceso (como un panel de operaciones o un ERP ligero). Se buscó cómo organizan esas pantallas los sistemas de diseño publicados. Las fuentes son páginas de sistemas de diseño y guías de terceros; no se pudieron abrir los artículos originales de NN/g sobre paneles ni sobre formularios, así que no se citan cifras suyas.

**Qué dicen las fuentes**

- **Elegir la plantilla por la tarea** ([SAP Fiori, «When to use which floorplan»](https://www.sap.com/design-system/fiori-design-web/v1-148/page-types/floorplans/when-to-use-which-floorplan)): lista para encontrar y actuar sobre muchos elementos, bandeja de trabajo cuando hay que decidir qué procesar primero, página de objeto para ver o editar uno solo, asistente de 3 a 8 pasos para tareas largas. En la bandeja de trabajo con pestañas, la barra de pestañas y la cabecera de la tabla quedan fijas al desplazar, y las acciones que **finalizan** el proceso van en una barra inferior, no en la cabecera ([Fiori, Worklist](https://www.sap.com/design-system/fiori-design-web/v1-142/page-types/floorplans/work-list/usage)).
- **Maestro y detalle** ([SAP](https://www.sap.com/design-system/hcm/patterns/structure-and-layout/master-detail/usage), [Microsoft Azure DevOps](https://developer.microsoft.com/en-ca/azure-devops/components/master-detail), [Microsoft Windows](https://blogs.windows.com/windowsdeveloper/2017/05/01/master-master-detail-pattern/)): sirve cuando se cambia a menudo de elemento sin perder el contexto; el título del detalle repite el nombre del elemento elegido; por debajo de unos 720 px se apila y nada esencial puede depender de la lista oculta.
- **Mapa + lista + detalle** ([Apple HIG, vistas divididas](https://glama.ai/mcp/servers/@tmaasen/apple-dev-mcp/blob/b82f0efe2115dc4539c83a2374a714a84aeb350a/content/universal/split-views.md), [Esri, mapas en paneles](https://gis.arboretum.harvard.edu/arcgis/help/en/dashboards/11.5/reference/create-web-maps-for-dashboards.htm)): navegación en un solo lado, selección siempre resaltada en la lista, un único título para toda la vista, pocas capas visibles y paneles que se pueden ocultar. El mapa y la lista dan la visión general; el detalle, la profundidad.
- **Tablas** ([Visa](https://design.visa.com/components/table/usage/), [GitLab Pajamas](https://design.gitlab.com/components/table), [SAP](https://www.sap.com/design-system/btp/dna-design/floorplans/table/usage)): números y fechas alineados a la derecha, texto a la izquierda, encabezado igual que la celda; cabecera fija si hay desplazamiento vertical; columnas con ancho según el dato; densidad elegible. Las alturas de fila de 40/48/56 px salen de un blog, no de una norma.
- **Ancho útil** ([Gobierno de Singapur](https://designsystem.tech.gov.sg/foundations/layout/responsive-grid), [Wix](https://dev.wix.com/docs/build-apps/develop-your-app/frameworks/wix-blocks/dashboard-pages/ux-guidelines-for-dashboard-pages-in-blocks)): barra lateral de ancho fijo (200–280 px) y contenido con tope (≈1200–1300 px) centrado; los 1440 y 1920 px cambian márgenes y columnas, no estiran el contenido.
- **Formularios**: una columna y etiqueta encima del campo; campos relacionados (ciudad, departamento) pueden compartir fila ([resumen de NN/g en commpro](https://commpro.biz/news/do-your-web-forms-measure-up), [web.dev](https://web.dev/learn/forms/design-basics)). No se encontró fuente sobre dónde alinear el botón principal.

**Qué se aplicó en la demo**

1. **Informes**: ocho bloques apilados (2 855 px) pasaron a cuatro pestañas (Atención, Evolución, Costos, Informe) bajo el vuelo seleccionado, que sigue visible. La página pasó de 3 187 a 1 435 px. Cumple la regla 4 de arriba.
2. **Lista fija en Pagos, Documentos, Servicios e Informes** (clase compartida `.rail-sticky` en `globals.css`): la lista maestra se queda a la vista mientras se desplaza el detalle, como ya hacía Vuelos. El `.stage` de cada una pasó de `overflow: hidden` a `clip`, que recorta igual pero no rompe `position: sticky`. Por debajo de 900 px la lista se apila y deja de ser fija.
3. **Pagos**: «Registrar pago» estaba a ~1 400 px del inicio del detalle. La barra de acciones queda fija al borde inferior mientras se revisa la factura (`overflow: clip` en `.stage`, para no romper `position: sticky`).

4. **CSS unificado de lista y detalle** (`.master-detail`, `.master-rail`, `.master-rail-header` en `globals.css`): Pagos, Documentos, Servicios e Informes dejaron de repetir su propio `.stage` / `.rail` (anchos de 372 a 400 px). Ahora la lista mide 380 px (340 por debajo de 1200 px) y se apila por debajo de 900 px. Vuelos (`.layout`, tarjeta flotante) y Mapa (asistente) quedan fuera a propósito: son otro patrón.
5. **Prueba de Informes en móvil (375 px)**, con estos fallos corregidos: la barra de pestañas se salía de la pantalla (la última pestaña quedaba cortada); el contenido del detalle tenía una columna de 377 px dentro de 346 y se recortaba su borde derecho; enlaces y botones de 18–42 px de alto (ahora 44); elegir un vuelo en la lista no mostraba nada porque el detalle queda ~600 px más abajo (ahora la vista salta al detalle). Misma causa de desborde corregida en Servicios (columna `1fr` que no podía encogerse y acciones del encabezado sin salto de línea).

**Regla para pantallas nuevas con lista y detalle:** usar esas clases; en cualquier `grid` de una sola columna escribir `minmax(0, 1fr)`, no `1fr`, o un hijo ancho (tabla, texto largo) ensancha toda la página.

**Pendiente (no aplicado)**

- Barra de acción fija en Documentos y Servicios (hoy sus detalles caben casi en una pantalla: 759 y 1 025 px).
- Móvil: la lista apilada va primero y el detalle de Informes empieza ~830 px más abajo. Ahora hay salto al detalle al elegir un vuelo; falta decidir si en pantallas estrechas la lista debe plegarse (`<details>`) mostrando solo el vuelo elegido. Lo mismo vale para Pagos, Documentos y Servicios, que aún no saltan al detalle.
- Densidad de tablas elegible y alineación numérica a la derecha: auditar `operators.ts` / tablas de Informes antes de tocarlas.
- Probar con personas si «Atención», «Evolución», «Costos» e «Informe» son las etiquetas que esperan.
