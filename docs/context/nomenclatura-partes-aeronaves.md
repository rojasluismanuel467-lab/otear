# Nomenclatura de partes de las aeronaves

Fecha: 26 de octubre de 2026. Código: `src/features/fleet/parts-catalog.ts` (nombres y fuentes) y `parts-anchors.ts` (lugar de cada parte en el modelo 3D).

## Qué se hizo

El mapa de estado de partes (Equipos y mantenimiento) dejó de usar una lista genérica inventada. Cada aeronave tiene ahora su catálogo de partes con el nombre que escribe el fabricante, su traducción al español, el lugar del manual donde aparece (por ejemplo «Aircraft Overview, n.º 7») y la fuente con su licencia. Las marcas guardan el id de la parte, no un texto libre.

## Fuentes y licencias

| Aeronave                           | Documento                                       | Versión                      | Licencia                                         |
| ---------------------------------- | ----------------------------------------------- | ---------------------------- | ------------------------------------------------ |
| Mavic 3 Enterprise                 | Manual de usuario, EN y ES                      | v3.0, 2025.09                | Derechos reservados de DJI                       |
| Matrice 350 RTK                    | Manual de usuario; manual de mantenimiento      | v1.2, 2024.08; v1.0, 2024.03 | Derechos reservados de DJI                       |
| Matrice 4                          | Manual de usuario; manual de mantenimiento      | v1.0, 2025.01                | Derechos reservados de DJI                       |
| Matrice 30                         | Manual de usuario; manual de mantenimiento      | v2.2, 2024.09; v1.0, 2025.01 | Derechos reservados de DJI                       |
| Genéricas (multirrotor)            | [PX4 User Guide](https://docs.px4.io/main/en/)  | rama main                    | CC BY 4.0 (verificado en su página de licencias) |
| Genéricas (multirrotor y ala fija) | Wikipedia, «Quadcopter» y «Fixed-wing aircraft» | consulta de octubre de 2026  | CC BY-SA 4.0                                     |

**Límite importante.** No existe un manual de licencia libre de los equipos DJI: sus manuales son públicos, pero DJI se reserva los derechos y limita su reproducción (el de la M30 dice que son «materiales confidenciales» solo para operar el equipo). Por eso el código solo cita nombres de partes y la numeración de sus diagramas, sin copiar textos ni dibujos. Si se quiere una base 100 % libre, solo sirven las partes genéricas (PX4, Wikipedia). La decisión de seguir usando la nomenclatura de DJI es del usuario.

Las URL de los manuales se tomaron de las páginas de descargas de DJI el 26 de octubre de 2026. El manual de la Matrice 4 salió de una URL de dl.djicdn.com que no aparece en la página oficial de descargas; su encabezado dice v1.0 2025.01, mientras la página lista una v1.2 de abril de 2025.

## Qué es oficial y qué es mío

- **Oficial:** los nombres en inglés y su numeración, tomados de los diagramas «Aircraft» de los manuales de usuario (M3E, M350, M4, M30) y de las tablas de inspección y piezas de desgaste de los manuales de mantenimiento (por ejemplo «Gimbal Dampers», «Propeller Adapters», «Bottom Shell Baffle»). El español del Mavic 3 Enterprise también es el publicado por DJI.
- **Traducción propia:** el español de la M350, la M4 y la M30 (no se pudo obtener su manual en español) y de las partes genéricas. Se mantuvo el vocabulario del manual español de la M3E («estabilizador», «ledes», «baliza», «trenes de aterrizaje»).
- **Sin fuente publicada:** «Tanque», «Bomba» y «Boquillas» del multirrotor de aspersión genérico (`source: "none"`).
- **Numeración de motores de la M350** (motor 1 delantero derecho, luego 2, 3 y 4 en sentido antihorario): sale del manual de mantenimiento.

## Dónde están las partes en el modelo (aproximado)

La posición de cada parte la leí de la forma del modelo CAD simplificado, no de DJI: renders ortogonales desde seis lados con los puntos superpuestos (el script no está en el repositorio). Solo tienen ubicación las partes que se distinguen en esa forma: motores, hélices, brazos, trenes de aterrizaje, estabilizador y cámara (M3E, M4, M30), conector de gimbal (M350) y tren trasero (M30). Las demás (puertos, botones, ledes, sensores) se pueden marcar desde la lista pero no tienen punto. Por eso la interfaz dice «lugar aproximado».

El modelo de la Matrice 350 se gira 180° en `drone-catalog.ts` (`yaw: Math.PI`) para que su frente quede hacia -z, como los demás. Esa orientación se dedujo del conector de gimbal en la cara inferior y no está verificada; si se invirtió, hay que corregir el `yaw` y los puntos de `parts-anchors.ts`.

## Hallazgo para el plan de mantenimiento (pendiente)

Los manuales de mantenimiento traen intervalos propios por modelo que difieren del plan genérico actual (200 h o 6 meses, tomado de la serie M300):

| Modelo          | Mantenimiento                                                                     | Hélices                 | Batería                                           |
| --------------- | --------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------- |
| Matrice 350 RTK | básico a 150 h o 6 meses; estándar a 300 h o 12 meses; premium a 900 h o 36 meses | cambiar a 300 h o 1 año | mantenimiento cada 100 ciclos; nominal 400 ciclos |
| Matrice 4       | amortiguadores del gimbal a 200 h o 1 año                                         | cambiar a 200 h o 1 año | mantenimiento cada 50 ciclos                      |
| Matrice 30      | hélices a 300 h o 1 año                                                           | cambiar a 300 h o 1 año | n. d. en lo leído                                 |

Calibración del sistema de visión de la M350: a 200 h. No se cambió `defaultPlan` en `fleet.ts`; sería razonable que cada modelo traiga su plan con la referencia a su manual.

## Selección de partes y mapa de calor de uso

Al tocar el modelo se selecciona la parte más cercana a su punto de referencia: aparece su nombre sobre el modelo, el área se pinta de azul (las otras del mismo tipo, en azul claro) y una tarjeta muestra el nombre en español y en inglés, el lugar del manual y su uso. Marcar el estado es una acción aparte («Marcar estado»).

El mapa de calor calcula, para cada parte, cuánto de su intervalo se ha usado desde su último servicio o cambio:

- **Horas** (propulsión, sensores, estabilizador y cámara, antenas, luces): horas de vuelo desde el último servicio frente al intervalo del plan de la aeronave (hélices: «Cambio de hélices»; el resto: la inspección periódica).
- **Vuelos** (estructura, puertos, compartimento de batería): vuelos desde la última inspección frente al intervalo de la inspección con **1,5 vuelos por hora de vuelo, un supuesto de ejemplo**.
- **Ciclos** (batería): ciclos medios de los paquetes activos frente a su límite.
- Un registro de mantenimiento con `partId` reinicia solo esa parte; con `taskId` reinicia las que dependen de esa tarea.
- El color es **relativo** entre las partes que tienen lugar en el modelo (azul la menos usada, naranja la más usada) para que el contraste se vea aunque todas estén dentro de su intervalo; el texto y las barras de la lista dan el porcentaje real.
- No usa sensores del equipo ni la carga real de cada vuelo (viento, carga útil); es un conteo de lo registrado.

## Qué falta

- Verificar la orientación de la M350 y los puntos con alguien que tenga el equipo.
- Español oficial de las demás aeronaves (descargar sus manuales en español).
- Puntos para las demás partes (sensores, puertos) si se consigue un modelo CAD segmentado por partes; los GLB actuales son una sola malla fusionada y sin nombres.
- Anclas para las aeronaves genéricas.
