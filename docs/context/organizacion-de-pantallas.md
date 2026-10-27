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
