# Tercera pasada de las personas simuladas (31 de octubre de 2026)

Mismas cinco personas de las fases 1 y 2 (visitante frío, Hernando, gerente de ingenio, operador, interventora). Son hipótesis de un agente, no usuarios reales. Cada una lee su informe anterior (`<persona>.md` y `fase-2/<persona>.md`), el `_brief.md` común y este documento, y escribe **solo** `fase-3/<persona>.md`; no edita código.

## Qué cambió desde la segunda pasada (rama `revision-fase-3`)

- Landing: la primera pantalla trae el panel «Así se ve antes de pagar» (cifras de ejemplo de la demo; en móvil, bajo el titular), una línea «Quién está detrás» (hoy sin nombre: el dueño no lo ha dado) y, solo si hay token, un aviso de que se cuentan visitas sin cookies.
- Decisiones del dueño aplicadas: el operador no tiene vista propia, pero las pantallas dicen «por definir» quién ve qué de su flota y sus costos; la evidencia de carreteras usa una ilustración vial propia en vez de un cultivo; la firma del informe sigue sin verificación de identidad y lo dice; el preset «Caña de azúcar» trae campos propios de edad y corte.
- Corrección de lo que quedaba abierto del informe del operador (O-14, O2-01 a O2-08).

## Qué debe cubrir cada pasada (lo que antes no se vio en pantalla)

1. **Prueba de 5 segundos** del hero nuevo, en escritorio (1440 × 900) y móvil (390 × 844). ¿El panel ayuda o estorba? ¿Se entiende quién está detrás?
2. **Diálogo del informe firmable** (Vuelos › Informe › «Firmar el informe del vuelo») y **«Verificar un archivo descargado»**; sección **«Informes y actas firmados»** de Documentos.
3. **Descartar con motivo** un hallazgo con medida abierta (qué pasa con la medida y con los conteos).
4. **Móvil (390 px) fuera de la landing**: Programación, Vuelos, Mapa, Evolución, Servicios, Pagos, Informes, Documentos. Qué se corta, se solapa o no se alcanza con el pulgar.
5. **Sectores no probados**: construcción, minería y vigilancia. ¿El vocabulario, los ejemplos, la evidencia y los textos hablan de ese sector o se filtra el cultivo, el predio o la hacienda?
6. **Estado de los hallazgos anteriores** de su persona (fase 1 y 2): resuelto / mejorado / igual / empeorado, con evidencia.

Se reparte así para no repetir: cada persona cubre los puntos que le tocan por rol, y **todas** hacen 1 y 6.

| Persona | Puntos extra |
|---|---|
| Visitante frío | 4 (solo landing y entrada a la demo), 5 (landing y selector de sector) |
| Hernando (cañicultor) | 3, 4 (Evolución, Mapa, Informes), campos de caña (edad y corte) y vocabulario «Suertes» |
| Gerente de ingenio | 2 (leer lo firmado), 4 (Servicios, Pagos, Informes), 5 (minería) |
| Operador | 4 (Servicios, Pagos, Equipos), 5 (vigilancia), la línea «por definir» de su flota y costos |
| Interventora | 2, 3, 4 (Vuelos, Documentos), 5 (construcción) |

## Plantilla y reglas

Use la plantilla de hallazgo, la estructura y las reglas de `_brief.md`, con IDs `V3-`, `N3-`, `G3-`, `O3-`, `I3-` (máximo 12 hallazgos, ordenados por gravedad), y agregue al principio una tabla «Estado de los hallazgos de la pasada anterior». Datos sintéticos; Otear no presta vuelos; nada inventado; es-CO con «usted»; piso de 12 px; no resolver fotos sin GPS ni «G6».

No marque como hallazgo lo que es una decisión del dueño ya tomada (arriba) ni la verificación de identidad real (la demo dice que no la hay).
