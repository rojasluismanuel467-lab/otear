# Prompt log — prototipo S2 «Verificar el cobro»

Herramienta: Claude Code (Claude Sonnet 5.5) sobre el repositorio de Otear, código Next.js/TypeScript. Contexto cargado: la skill `.claude/skills/otear-prototipo-s2/SKILL.md` (7 bloques) y `CLAUDE.md`/`AGENTS.md`.

> Pendiente: la «plantilla B» de la consigna no estaba disponible al escribir esto. Las iteraciones están en capas (pantalla, comportamiento, contenido) pero hay que pasarlas a su formato antes de entregar.

## Iteración 1 — construir el flujo completo (real)

**Prompt tal como se envió** (después de analizar la consigna y de elegir el flujo):
> «Flujo B, empieza con la skill y la ruta del prototipo»

**Capas que el prompt heredó de la skill y del Brief de S1:**
- *Pantalla:* 10 Labores y tareas → 11 Verificar cobro → 12 Compartir evidencia, ruta `/prototipo/verificar-cobro/`, 1280 × 800, grises, sin marca (skill, bloque 4).
- *Comportamiento:* leer el mapa del operador (cargando / error / listo), comparar con un vuelo propio posterior, veredicto por la tolerancia de 5 %, enviar evidencia o aceptar el cobro con confirmación; error «sin vuelo posterior», «mapa ilegible» y «mensaje no entregado» con salida (skill, bloque 6).
- *Contenido:* Hacienda Santa Rita, Agrodron del Valle, 18,4 ha cobradas, 17,1 ha en su mapa, 20,8 ha de los lotes 5 y 6, diferencia de 1,3 ha = $117.000 a $90.000/ha (skill, regla 5.2).

**Qué generó la herramienta:** la ruta, la lógica pura con 16 pruebas y las tres pantallas. Capturas: `capturas/01-labores.png` a `capturas/06-veredicto.png`.

## Iteración 2 — corregir lo que encontró la auditoría (por emitir)

Se emite como prompt real, con su captura de lo generado, a partir de `registro-auditoria.md`:

> **Pantalla:** en «Verificar cobro» a 1280 × 800 el botón «Comparar» debe verse completo sin desplazarse, y el veredicto debe verse en la primera pantalla con cualquier nota del operador.
> **Comportamiento:** si la factura está en $0 no hay cobro que aceptar ni diferencia que reclamar: ambas acciones deshabilitadas con el motivo escrito al lado. La instrucción para provocar el error del WhatsApp no debe aparecer en el flujo.
> **Contenido:** los textos de error y de soportes se construyen con los lotes y las fechas de la labor abierta, no con los de la fumigación de ejemplo.

Lo que generó: los cambios D1 a D5 del registro de auditoría. Capturas `antes-*` y `despues-*`.

> Nota de honestidad: los cambios D1 a D5 ya están hechos. Para que el log sea fiel, la Iteración 2 debe quedar registrada como lo que fue: una corrección pedida en la conversación después de ver las capturas. Si la entrega exige un prompt separado, se vuelve a emitir y se captura la respuesta, sin reescribir la historia.
