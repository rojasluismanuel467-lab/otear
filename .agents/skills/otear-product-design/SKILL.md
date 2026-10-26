---
name: otear-product-design
description: Diseñar, implementar o revisar funcionalidades de Otear combinando UI, UX, ergonomía y validación de negocio. Aplicar al decidir recorridos, controles, movimiento, iconos, imágenes o prioridades del producto; no a cambios mecánicos ni trabajo de backend sin impacto en la experiencia.
---

# Decisiones de producto y diseño en Otear

Trabajar como diseñador de producto e ingeniero frontend: cada decisión debe facilitar una tarea, dar carácter a Otear o probar una hipótesis de negocio identificable. No prometer la mejor solución sin observar su uso.

## Contexto y alcance

- Encontrar la raíz del repositorio mediante `AGENTS.md`; leer `README.md` y la descripción vigente de la tarea. El alcance confirmado es multisector: agro, carreteras, construcción y vigilancia.
- Reutilizar Next.js, TypeScript, Tailwind y HeroUI. Leer solo las secciones pertinentes de las guías enlazadas abajo. No reabrir la elección de stack ni introducir dependencias para cada efecto.
- La matriz y el feedback contienen hipótesis. Separar lo confirmado por el usuario, lo observado en pruebas y lo supuesto. Aplicar el sector seleccionado sin duplicar módulos ni imponer campos agrícolas a todos.
- Respetar el alcance autorizado: esta skill no autoriza pantallas pendientes, integraciones, compras ni backend. Hasta que el usuario indique lo contrario, la base permanece sin pantallas. Una autorización posterior para una pantalla concreta permite construirla sin volver a pedir aprobación por decisiones rutinarias.

## Decidir antes de extender código

Para una funcionalidad nueva o una decisión material, expresar brevemente:

1. Usuario/sector, situación y tarea principal.
2. Resultado útil y señal observable de éxito; distinguir éxito de uso de interés comercial.
3. Alcance de esta entrega y capacidad real frente a datos de ejemplo.
4. Si habrá implementación, componentes existentes que se reutilizan y propietario de los archivos afectados; omitir este detalle en propuestas puramente conceptuales.

No producir un documento nuevo para cada ajuste. Registrar solo decisiones que afecten a otros módulos o trabajos futuros. Si falta información no bloqueante, proponer una opción reversible y marcar el supuesto; preguntar cuando la respuesta cambie sustancialmente la tarea.

## Criterios de decisión

- **Composición:** que la tarea y el contexto de sitio/zona/fecha se reconozcan. Organizar por frecuencia y consecuencia; mostrar opciones secundarias cuando correspondan. No añadir indicadores o tarjetas sin una decisión que apoyen.
- **Ergonomía:** acciones próximas al contenido que afectan, zonas de pulsación cómodas y separadas, foco estable y control de teclado. Diferenciar el movimiento del puntero, el desplazamiento de la página y la animación visual. No hacer perseguir controles móviles ni depender de hover, arrastre o gestos precisos para una tarea esencial.
- **Iconos:** una familia coherente y significado estable. En navegación y acciones del dominio, preferir texto visible junto al icono. Un tooltip no sustituye nombre accesible ni claridad en táctil.
- **Imágenes:** definir si son evidencia, explicación o decoración. Conservar procedencia y contexto de la evidencia, legibilidad y proporciones. El acabado visual nunca debe aparentar un resultado técnico que los datos no respaldan.
- **Movimiento y acabado:** preservar los controles de HeroUI; aplicar sombras, textura y transiciones con jerarquía y propósito. La landing puede tener una escena expresiva; la herramienta debe responder de inmediato y conservar orientación. Seguir la variante de movimiento reducido y el presupuesto visual de la guía existente.
- **Negocio:** priorizar la menor entrega que permita comprobar valor. El recorrido y la llamada a la acción deben corresponder a una oferta real o un piloto claramente explicado; no inventar testimonios, clientes, precios verificados ni disponibilidad de operadores.

Leer [criterios específicos](references/decision-checklist.md) cuando la tarea afecte iconos, medios, ergonomía, métricas o compromisos comerciales.

## Construir y revisar en equipo

Reutilizar componentes y datos compartidos; conservar la propiedad de archivos acordada. El agente del módulo propone cambios comunes y el integrador los aplica. No crear versiones particulares de vuelo, operador, archivo o informe para avanzar por separado.

Verificar el recorrido cambiado, estados relevantes y alternativas de interacción. En cambios visuales sustanciales, hacer una revisión conjunta de escritorio/móvil, teclado y movimiento reducido, corregir defectos y confirmar. En ajustes pequeños, comprobar solo lo afectado. No iniciar ciclos de pulido indefinidos ni usar una herramienta automática como certificación de UX.

Al entregar, explicar qué mejora la tarea, qué hipótesis sigue abierta y qué se comprobó. No prometer porcentajes de ahorro ni resultados comerciales a partir de una demo.

## Referencias locales según la tarea

- [UX](../../../docs/UX_GUIDELINES.md): contexto, estados, comparación y pruebas con personas.
- [Movimiento](../../../docs/MOTION_GUIDELINES.md): tiempos iniciales, profundidad, texturas, rendimiento y accesibilidad.
- [Código](../../../docs/FRONTEND_CONVENTIONS.md): nombres, estructura, estado y límites de datos.
- [Coordinación](../../../docs/planning/plan-de-trabajo.md): responsabilidades y secuencia propuesta.
- [Alcance multisector](../../../docs/context/alcance-multisector-y-feedback.md): decisiones confirmadas frente a necesidades por validar.
