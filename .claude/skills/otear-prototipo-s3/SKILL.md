---
name: otear-prototipo-s3
description: "Reglas para aplicar el sistema de diseño de Otear (Semana 3, Prototipado de Alta Fidelidad) al prototipo «Verificar el cobro»: valores en theme.json, componentes con el nombre del UI Kit de Figma, micro-interacciones de estado y auditoría. Úsese al modificar estilos o componentes bajo src/features/prototype/ o src/app/prototipo/, junto con otear-prototipo-s2 (flujo y contenido)."
---

# Skill del proyecto: prototipo S3 de Otear (sistema de diseño aplicado)

El flujo, los datos y el contenido siguen siendo los de la skill `otear-prototipo-s2` (pantallas 10, 11 y 12 de S1). Esta skill **reemplaza solo su capa visual**: las reglas 4.1 (solo grises), 4.2 (Arial), 4.3 (sin transiciones), 7.1, 7.2 y 7.6 ya no aplican. Todo lo demás de S2 sigue vigente (una sola persona, lenguaje del productor, estados Normal/Cargando/Error/Deshabilitado, razón escrita junto a un botón deshabilitado, errores con qué pasó, por qué y qué hacer, 12 px de piso ahora 14 px).

Las reglas del sistema (colores, tipografía, espaciado, radios, foco, movimiento, estados, tabla de componentes Figma ↔ código) están en `AGENTS.md`, sección «Sistema de diseño del prototipo». Los valores están en `theme.json`.

| # | Regla | Cómo se comprueba |
|---|---|---|
| 1 | Ningún color, tamaño de letra ni duración escritos a mano en `prototype.module.css`: solo `var(--ds-*)`. | `npm test` (`theme.test.ts`) |
| 2 | `theme.css` se genera: cambiar `theme.json`, correr `npm run theme`. | `npm run theme:check` |
| 3 | Cada componente lleva su nombre del UI Kit en `data-ds` y los mismos estados que en Figma. | Buscar `data-ds=` en el DOM; comparar con la página `_UI Kit` |
| 4 | No se agregan pantallas ni se cambia el flujo de S2; no se toca `verification.ts`. | `npm test` (16 pruebas de lógica) y recorrido con `npm run capture:prototype` |
| 5 | El estado de carga responde en ≤ 100 ms dentro del mismo botón; el resultado entra en 250 ms; con reducir movimiento es instantáneo. | `npm run capture:prototype` imprime `loadingResponseMs` |
| 6 | Un estado nunca va solo en color: palabra + forma de borde. | Revisión visual en escala de grises de `capturas/despues/` |
| 7 | Contraste 4,5:1 en texto y 3:1 en bordes de controles; objetivos de 44 px; texto ≥ 14 px. | `theme.test.ts` y `metricas.json` (`textBelow14px: 0`) |
