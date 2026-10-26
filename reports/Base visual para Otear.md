# Elijamos una base que acelere Otear

**HeroUI es mi primera candidata gratuita por afinidad visual; Untitled UI React, la alternativa de pago para resolver más composición de landing y aplicación desde una sola colección.** Shadcnblocks merece consideración si priorizamos variedad de bloques; Mantine si pesan más los controles operativos. Ninguna trae resuelto el recorrido agrícola. La elección debe partir de una muestra de lote, fotos y hallazgo, no de un dashboard financiero atractivo. La recomendación previa de shadcn/ui sigue abierta: todavía no constituye una decisión de producto. Esta investigación documental se realizó el **25 de octubre de 2026**; no hubo instalación, compra, auditoría de código ni pruebas de accesibilidad.

## Cuatro alternativas resuelven distintos tipos de trabajo

Conviene distinguir una **librería**, que entrega controles y reglas visuales, de una **colección de bloques o plantilla**, que también resuelve composiciones de página. Las segundas ahorran más montaje si sus ejemplos encajan con Otear; una plantilla cargada de funciones ajenas también cuesta trabajo de limpieza.

| Opción | Qué podemos incorporar | Encaje propuesto y esfuerzo pendiente |
| --- | --- | --- |
| **[HeroUI](https://heroui.com/en/docs/react/getting-started)** · gratuita | Componentes React estilizados, animaciones y tema; integración documentada con Next.js. | Mejor candidata para formas redondeadas y superficies suaves. Hay que componer landing, galería, mapa y comparación. |
| **[Untitled UI React](https://www.untitledui.com/react)** · colección premium, con parte gratuita | Código React/TypeScript sobre Tailwind y React Aria; ejemplos de marketing y aplicación. | Reduce decisiones entre web pública y demo. Adaptar fotografías, elevación y densidad; comprar React, no confundirlo con el kit Figma. |
| **[Shadcnblocks](https://www.shadcnblocks.com/)** · bloques gratuitos y planes premium | Bloques React copiables o instalables, páginas de marketing, shells, galerías y tablas. | Buena opción para ensamblar rápido. Seleccionar una familia coherente: su amplitud facilita mezclar estilos accidentalmente. |
| **[Mantine](https://mantine.dev/getting-started/)** · gratuita | Controles React, tema con radios/sombras y starters oficiales Next.js. | Alternativa práctica para una herramienta operativa. La landing y la personalidad visual requieren más composición. |

La clasificación visual es nuestra valoración, no una prueba comparativa. HeroUI documenta React Aria y Tailwind 4; Mantine ofrece un tema central y un starter mínimo. Esas bases permiten fijar estilos una vez, pero no eliminan las vistas propias de Otear. ([HeroUI](https://heroui.com/en/docs/react/getting-started), [tema Mantine](https://mantine.dev/theming/theme-object/), [Next.js con Mantine](https://mantine.dev/guides/next/))

**Elegiría HeroUI si queremos empezar sin compra y favorecer el acabado visual. Elegiría Untitled UI React si hay presupuesto y queremos más páginas y componentes coordinados desde el inicio.** Shadcnblocks pasa al primer lugar si una comparación concreta muestra mejores bloques para galería, navegación y formulario. No hay evidencia para prometer un porcentaje de ahorro.

## La estética se decide con contenido de campo

La dirección propuesta combina fondos claros cálidos, fotografías amplias, radios consistentes y sombras visibles pero suaves. La elevación distinguiría el visor, los controles superpuestos y los diálogos. Evitaría aplicar efectos a todas las tarjetas: las fotos y los mapas ya aportan riqueza visual. Esta interpretación nace de la preferencia expresada por el usuario; no representa una evaluación de usuarios ni una regla atribuida a Apple.

La demo conservaría el recorrido **lote → vuelo → comparación → hallazgo → informe**. Su inicio mostraría dónde está la persona y qué puede revisar, sin gráficas de ventas, métricas inventadas ni módulos administrativos decorativos. Una biblioteca de controles no determina la navegación: debemos seleccionar cada elemento según su función en ese recorrido.

Antes de descargar una base completa, compararíamos una composición equivalente de los dos finalistas: contexto de finca/lote, galería de fotos, filtro de fecha y formulario de hallazgo. Revisaríamos móvil, teclado, foco, contraste y estados vacío/error. Después fijaríamos tema, componentes y versiones en una sola entrega técnica. No mezclaríamos librerías para resolver diferencias cosméticas.

## Los agentes necesitan criterios breves y fuentes precisas

El artículo compartido de **NN/g** define usabilidad mediante aprendizaje, eficiencia, recuerdo, errores y satisfacción, y recomienda observar tareas con personas representativas. Sus heurísticas añaden estado visible, lenguaje familiar, control y consistencia. Para Otear se traduce en fechas y lote siempre reconocibles, acciones explícitas y confirmaciones que expliquen qué ocurrió. ([Usability 101](https://www.nngroup.com/articles/usability-101-introduction-to-usability/), [10 heurísticas](https://www.nngroup.com/articles/ten-usability-heuristics/))

Recomiendo tres libros con funciones distintas. **[Refactoring UI](https://refactoringui.com/)** sirve para jerarquía, espacio, color y profundidad, y encaja especialmente con las sombras solicitadas. **[Don't Make Me Think, Revisited](https://sensible.com/dont-make-me-think/)** aporta un marco de comprensión y navegación. **[Designing Interfaces, tercera edición](https://www.oreilly.com/library/view/designing-interfaces-3rd/9781492051954/)** sirve como consulta de patrones cuando aparezca un problema concreto. Se revisaron páginas públicas, índices o muestras; los libros completos son comerciales y no fueron leídos ni descargados.

La [guía UX del repositorio](../docs/UX_GUIDELINES.md) convierte estas referencias en reglas breves para trabajar: reutilizar componentes, mantener contexto, señalar datos de ejemplo, ofrecer una comparación alternativa al arrastre y comprobar interacciones relevantes. [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) aporta requisitos verificables. Cargar solo la sección necesaria para cada tarea evita repetir investigación y consumir contexto sin necesidad.

## La matriz amplía el contexto, sin ampliar esta entrega

La [matriz de Dorfman](../docs/context/matriz-dorfman-provisional.md) queda como información provisional. Sus componentes describen capacidades futuras; no convierten la demo en una aplicación funcional ni obligan a desplegar microservicios. Hay una contradicción pendiente: el PDF permite guardar fotos sin GPS o sin asignación y la matriz propone rechazarlas. **No debemos implementar todavía una política definitiva.** La separación de verificación de labores como G6 tampoco está confirmada.

HeroUI publica su base bajo Apache-2.0 y Mantine bajo MIT. Los productos premium tienen condiciones propias: Untitled UI y Shadcnblocks restringen exponer su código comercial en repositorios públicos. Antes de incorporar archivos, registraríamos la licencia aplicable; si se elige premium, mantendríamos privado el repositorio. ([HeroUI](https://github.com/heroui-inc/heroui/blob/v3/LICENSE), [Mantine](https://mantine.dev/getting-started/#license), [Untitled UI](https://www.untitledui.com/license), [Shadcnblocks](https://www.shadcnblocks.com/license))

La próxima decisión útil es escoger entre **acabado gratuito con más composición propia** y **colección premium con más composición preparada**. Una muestra pequeña permitirá decidirlo antes de extender pantallas; el resultado del piloto comercial determinará qué merece convertirse después en software funcional.
