# Guía UX para Otear

Estado: criterios iniciales propuestos para landing y demo. No fija una plantilla ni autoriza nuevas funcionalidades. Leer antes de tareas de interfaz; ampliar solo la sección necesaria de las fuentes.

## Alcance y requisitos provisionales

La landing y demo actuales validan comprensión e interés. Los requisitos Dorfman entregados posteriormente son contexto provisional y pueden cambiar: no justifican implementar por adelantado autenticación, procesamiento ni toda la arquitectura.

- **Pendiente de resolver:** el PDF inicial permite conservar fotos sin GPS o sin asignación; la matriz posterior propone rechazarlas sin GPS o fuera del lote. No codificar ni presentar una de las dos políticas como definitiva. La demo puede explicar el caso como pendiente de revisión.
- **Diferenciador por validar:** revisión de labores pagadas. La matriz la representa en G5/E3; separar un G6 es una propuesta todavía no confirmada. No presentar cobertura o fotos como prueba de cantidad/calidad aplicada.
- **Arquitectura futura:** C1 corresponde a una app con capacidad offline y C2 al portal. C3–C10 son componentes lógicos; no implican por sí mismos desplegar microservicios. Estos nombres no deben aparecer como navegación ni explicación al usuario del producto.

## Preferencias del usuario

Sombras suaves, formas redondeadas e inspiración visual Apple, con suficiente riqueza visual. El producto debe servir al trabajo de campo y evitar tableros llenos de indicadores decorativos. Estas preferencias vienen de la conversación, no de una prueba de usuarios.

## Reglas de implementación

1. Priorizar el recorrido lote → vuelo → comparación → hallazgo → informe. Cada bloque debe apoyar una tarea o una decisión identificable.
2. Mantener a la vista el contexto de finca, lote y fecha. Usar lenguaje del productor y acciones explícitas.
3. Revelar opciones secundarias en contexto. Las acciones frecuentes deben encontrarse sin recorrer menús ambiguos.
4. Mostrar «Datos de ejemplo» durante la demo y distinguir simulaciones de captación real. No prometer inferencias agronómicas aún no verificadas.
5. Comparar fechas rotuladas del mismo lote; ofrecer lado a lado o control alternativo al arrastre. No inferir cambios del cultivo a partir de encuadres incompatibles.
6. Aplicar radios, sombras, espacio y tipografía desde tokens compartidos. La elevación distingue capas; no cubrir cada bloque con efectos. Usar fotos de campo legibles para aportar identidad.
7. Reutilizar la base elegida y sus componentes. Crear una variante solo ante una necesidad concreta; no introducir otra biblioteca por una diferencia cosmética.
8. Mantener contraste, foco visible, nombres accesibles y controles de teclado. Color y sombra no son la única señal de estado; los textos sobre fotos necesitan fondo legible.
9. Confirmar el resultado de acciones, permitir volver/cancelar y conservar entradas tras errores. Mensajes breves indican cómo continuar.
10. Separar evidencia de utilidad y de negocio: completar tareas demuestra comprensión; solicitar un piloto o comprometer archivos/pago demuestra otro tipo de interés.

## Verificación acotada por entrega

- Recorrer la tarea modificada en escritorio y móvil; revisar teclado/foco y estados relevantes.
- Usar objetivo WCAG 2.2 AA: contraste de texto normal 4.5:1 y texto grande 3:1; no declarar conformidad completa por pasar una herramienta.
- En formularios, verificar etiquetas, errores y confirmación. En comparador, verificar fechas y alternativa al arrastre.
- Hacer una ronda inicial con aproximadamente cinco usuarios representativos, sin guiar sus clics: localizar vuelo, comparar fechas y preparar informe. Registrar éxito sin ayuda, errores y dudas; corregir bloqueos. Esta ronda es cualitativa y no demuestra demanda de mercado.
- Repetir checks solo si cambia el recorrido o aparece un fallo relevante. Evitar auditorías completas por cada ajuste reversible de estilo.

## Fuentes y límites

- [NN/g — Usability 101](https://www.nngroup.com/articles/usability-101-introduction-to-usability/): utilidad, usabilidad y observación de tareas.
- [NN/g — 10 heurísticas](https://www.nngroup.com/articles/ten-usability-heuristics/): estado, lenguaje, control, consistencia, reconocimiento y recuperación. Son principios generales; las reglas concretas anteriores son decisiones propuestas para Otear.
- [Refactoring UI](https://refactoringui.com/): página e índice públicos consultados; referencia para jerarquía, espacio y profundidad. Libro de pago no leído íntegramente.
- [Don't Make Me Think, Revisited](https://sensible.com/dont-make-me-think/): libro de pago, con muestra oficial; consultar para navegación y comprensión. No se revisó el texto completo.
- [Designing Interfaces, 3.ª edición](https://www.oreilly.com/library/view/designing-interfaces-3rd/9781492051954/): índice público revisado; libro de pago/suscripción para patrones concretos.
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/): referencia pública para revisión visual futura; contenido no extraíble en la investigación inicial, sin reglas atribuidas sin verificar.
- [W3C — WCAG 2.2, referencia rápida](https://www.w3.org/WAI/WCAG22/quickref/): requisitos de accesibilidad verificables.

Consultar las [notas de investigación](../research_notes/Base%20visual%20para%20Otear/ux.md) para distinguir hechos, propuestas y pendientes. No descargar ni incorporar libros comerciales completos sin acceso legítimo.
