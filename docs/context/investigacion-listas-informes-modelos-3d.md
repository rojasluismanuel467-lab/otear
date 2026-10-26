# Investigación: listas de chequeo, informes y modelos 3D de drones

Fecha: 25 de octubre de 2026. Fuentes públicas; la mayoría son plantillas y blogs de proveedores, no normas. Úsese como guía de estructura, no como requisito legal.

## Listas de chequeo previas al vuelo

Plantillas consultadas: [GoAudits](https://goaudits.com/checklist/drone-preflight-checklist/913/32/), [LE Drones](https://ledrones.org/pre-flight-checklist), [Process Street](https://www.process.st/checklist/drone-pre-flight-checklist/), [SafetyCulture](https://safetyculture.com/library/transport-and-logistics/suas-frcs), [UAV Coach](https://learn.uavcoach.com/courses/275280/lectures/54389936).

Categorías que se repiten:

1. Permisos y espacio aéreo: permiso del predio, restricciones cercanas, soportes del piloto, póliza y registro del equipo.
2. Sitio y clima: viento, precipitación, visibilidad, obstáculos, interferencia, zona de despegue y aterrizaje de emergencia, personas en el área.
3. Aeronave: baterías, hélices, motores, brazos, tornillería, gimbal, control remoto.
4. Estación y carga útil: cargas, memoria, cámara fijada, repuestos.
5. Calibración y software: firmware, brújula, GPS, punto de origen.
6. Prueba de estabilidad a baja altura (unos 10 s a ~3 m) antes de iniciar la misión.

Aplicado en `features/flights/planning/preparation-items.ts` (15 ítems en 5 grupos). Los textos de cada lista deben seguir siendo estables porque los vuelos de ejemplo los guardan.

Colombia: el RAC 100 (Resolución 01983 de 2023) rige las UAS; la [circular de registro MAUT-5.0-22-010](https://www.aerocivil.gov.co/autoridad-de-la-aviacion-civil/biblioteca-tecnica/Circulares%20Drones%20y%20Movilidad%20Urbana/100-MAUT-5.0-22-010-CI%20Registro%20de%20Sistemas%20de%20Aeronaves%20No%20tripuladas%20UAS%20y-o%20equipos%20tecnol%C3%B3gicos.pdf) describe el registro. No se encontró en la búsqueda un formato oficial de lista prevuelo ni de bitácora; no se afirma uno en la UI. Pendiente de validar con un operador certificado.

## Informes y bitácora

Fuentes: [DroneDesk: flight log](https://blog.dronedesk.io/ultimate-drone-flight-log-template-professional-guide-pilots/), [DroneDesk: bitácora vs registro](https://blog.dronedesk.io/drone-logbook-vs-flight-log-what-operators-should-keep/), [The Drone U](https://www.thedroneu.com/blog/faa-requirements-recordkeeping/), [DroneBundle](https://dronebundle.com/blog/roof-inspection-report), [Nebraska Extension](https://cropwatch.unl.edu/2018/using-drones-early-season-stand-assessment-weed-scouting), [DroneDeploy: stand count](https://help.dronedeploy.com/hc/en-us/articles/6171361780759).

Estructura recurrente de un informe:

- Encabezado y propósito, con el lector previsto.
- Registro del vuelo: fecha y hora, sitio, piloto y roles, aeronave, baterías y carga útil, duración, clima, referencia de autorización.
- Hallazgos con categoría, severidad, ubicación (coordenadas) y fotografía ligada.
- Límites y vacíos de datos, dichos explícitamente.
- Recomendaciones priorizadas.
- Agro: conteo de plantas, fallas ("skips"), mapa de malezas y verificación en campo con muestras manuales.

Aplicado en `flight-report.tsx`: sección "Registro del vuelo", prioridad y coordenadas por hallazgo, siguiente paso según estado y "Límites de los datos". Faltan en el modelo (no inventados): baterías por vuelo, clima real, referencia de autorización, conteos agrícolas. Candidatos para una próxima ronda de datos sintéticos.

## Modelos 3D publicados por DJI

El [Centro de descargas de DJI](https://www.dji.com/downloads/products/mavic-3-enterprise) publica archivos CAD en formato STEP (`.stp`) para algunos equipos. Verificado el 25 de octubre de 2026 (no se descargó ningún archivo):

| Equipo | Archivo | Fecha |
| --- | --- | --- |
| Mavic 3 Enterprise | `dl.djicdn.com/downloads/DJI_Mavic_3_Enterprise/M3E.stp` | 2024-10-18 |
| Matrice 4 Series | `dl.djicdn.com/downloads/DJI_Matrice_4_Series/M4T_v2.stp` | 2025-10-31 |
| Matrice 350 RTK | `dl.djicdn.com/downloads/matrice_350_rtk/Matrice_350_RTK_3D_Model.stp` | 2023-05-30 |
| Matrice 30 Series | `dl.djicdn.com/downloads/matrice-30-series/20220624STP/M30T.stp` | 2022-06-24 |

Sin modelo: Mavic 3 Pro (solo PDF). No se pudo comprobar la página de Agras (la URL probada redirigió a 404).

Consideraciones antes de usarlos:

- La página no muestra licencia ni términos junto al archivo. DJI conserva sus marcas; el [acuerdo del Payload SDK](https://developer.dji.com/policies/psdk_agreement) prohíbe usar sus marcas sin acuerdo aparte. Confirmar por escrito con DJI antes de redistribuirlos en el repositorio o en una app.
- STEP es un sólido CAD de ingeniería (puede pesar decenas de MB). Para la web hay que convertirlo a glTF/GLB, simplificarlo (decimar, quitar interiores) y comprimirlo (Draco o meshopt). No es una conversión automática y requiere revisión visual.
- Alternativas de terceros (Fab, RenderHub, Superhive) son de pago y varias restringen el uso a fines editoriales; modelos en Sketchfab con CC BY exigen atribución. Verificar licencia caso por caso.

Estado actual (26 de octubre de 2026): con permiso del usuario se descargaron los cuatro `.stp` y se convirtieron a GLB en `public/models/dji/` (`mavic-3-enterprise`, `matrice-4`, `matrice-350-rtk`, `matrice-30`; 0,6–0,7 MB cada uno, 25–35 mil triángulos). Proceso: `cascadio` (OpenCascade) teselado con 0,4 mm → `scripts/optimize-drone-glb.mjs` (quita normales, suelda, simplifica con meshopt, recalcula normales, cuantiza y comprime). Los STEP no están en el repositorio. Las piezas del CAD no traen nombres ni colores; las envolventes planas de las hélices se marcan como material `disc` y el visor las dibuja translúcidas. En el Mavic 3 Enterprise, el Matrice 4 y el Matrice 30 las hélices son discos/elipses sólidos en el CAD; en el Matrice 350 RTK sí son aspas.

**Sin resolver:** la licencia. Los GLB son derivados de archivos de DJI y no hay términos publicados junto a la descarga; no deben publicarse ni distribuirse hasta confirmar el permiso con DJI. Si no se obtiene, borrar `public/models/dji/` y quitar `djiOptions` de `features/drones/drone-catalog.ts`; el visor sigue funcionando con las cuatro aeronaves genéricas.
