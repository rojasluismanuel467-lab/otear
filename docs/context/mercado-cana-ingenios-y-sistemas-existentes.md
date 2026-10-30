# Mercado de caña: ingenios, cañicultores y sistemas de drones existentes

Fecha: 28 de octubre de 2026. Motivo: una ingeniera agrónoma indicó que ya existen sistemas de vuelo de drones, que son herramientas que usan los ingenios y que los ingenios no tienen drones. Esta nota contrasta eso con lo que se pudo encontrar y saca consecuencias para el prototipo.

**Aviso sobre la evidencia.** La búsqueda dio poco material colombiano y casi nada sobre qué sistemas usa cada ingenio. Varias páginas no se pudieron leer (un PDF de Cenicaña llegó comprimido y dos consultas fallaron por un error de la herramienta de lectura). Lo que sigue separa lo encontrado, lo inferido y lo que hay que preguntar a personas del sector. No es un estudio de mercado.

## Qué se encontró

### Estructura del sector (Valle del Cauca)

- Según [Asocaña citada por Blu Radio (22 de octubre de 2024)](https://www.bluradio.com/regiones/pacifico/asocana-a-petro-cultivos-estan-en-5-departamentos-238-000-hectareas-11-000-familias-pr30): 238.000 hectáreas en cinco departamentos; **el 75 % del área sembrada pertenece a unas 11.000 familias** y el resto a **13 ingenios**. Otra presentación atribuida a Asocaña da 1.751 cañicultores y es de fecha anterior; las cifras no coinciden y hay que verificarlas en el informe vigente de Asocaña.
- Consecuencia probable: **la mayor parte de la caña la cultivan proveedores, no los ingenios**. Quien compra servicios de dron puede ser el ingenio (para sus tierras y para apoyar a proveedores) o el cañicultor.

### Qué hacen los ingenios con drones

- **Cenicaña** (centro de investigación de los ingenios) lleva años investigando vehículos aéreos no tripulados en agricultura de precisión para caña: seguir el cultivo por fases, estimar productividad, detectar anomalías (malezas, zonas para resiembra) y estrés nutricional, con cámaras multiespectrales y modelos digitales de altura ([documento de un investigador de Cenicaña en el foro del IDESC de Cali](https://idesc.cali.gov.co/foro_idesc/2do_foro/13_vehiculos_aereos_no_tripulados_agricultura_precision.pdf); solo pude ver su resumen en la búsqueda, el PDF llegó comprimido).
- Una [tesis de la Javeriana de Cali](https://vitela.javerianacali.edu.co/handle/11522/4386) (plan de mercadeo, de calidad limitada) afirma que **cada ingenio tiene su propia unidad de agricultura de precisión** y usa banderilleros satelitales y pilotos automáticos. Esa fuente es antigua y de mercadeo: es una referencia, no un hecho confirmado hoy.
- [AgroLatam](https://www.agrolatam.com/agricultura-latam/colombia-cana-control-biologico-drones-plagas/) cuenta que **un ingenio colombiano (sin nombre)** aplica control biológico con drones, hasta unas 200 hectáreas por día. No pude leer quién opera esos drones.
- Un trabajo de la UNAD evaluó la aplicación de madurantes con dron en predios de menos de 3 hectáreas, en Villa Rica (Cauca): **escala de cañicultor pequeño**, no de ingenio.
- **Verificación de aplicaciones aéreas:** un [artículo de la Universidad Distrital (2016)](https://revistas.udistrital.edu.co/index.php/UDGeo/article/download/7928/12922/58975) parte de la necesidad de los ingenios de cuantificar las labores diarias, entre ellas la aplicación de madurantes, con una rutina que calcula el área aplicada. Dice que el equipo de la aeronave guarda altura, velocidad, producto y cantidad, **pero no calcula el área**, y que esta se cruza con la cartografía de suertes del ingenio (WGS84). Es evidencia de una necesidad real: **comprobar qué se aplicó y dónde**.
- No encontré nada público sobre qué drones o proveedores usan Incauca, Manuelita, Providencia o Riopaila.

### Proveedores de drones y de servicios

- [Drone Innovation y Agromilenio (La República)](https://www.larepublica.co/empresas/drone-innovation-y-agromilenio-hacen-alianza-para-llevar-drones-al-campo-colombiano-3663025): distribuyen DJI Agriculture en Colombia, con financiación, asesoría y capacitación; no dice a quién venden ni a cuánto.
- En **Brasil** (referencia, no Colombia): hay productores que compran sus drones y otros que **contratan el servicio** a terceros; empresas como Arpac atienden a grupos del sector sucroenergético; y los ingenios y haciendas figuran entre los dueños de drones registrados. Es decir, **el modelo es mixto** ([Agência Pública](https://apublica.org/2022/05/cresce-uso-de-drones-para-pulverizar-agrotoxicos-em-plantacoes-no-brasil)).

### Sistemas existentes (de los que ya se investigó)

| Sistema                                                                         | Qué hace                                                                     | Quién lo usa           | Qué no cubre                                                      |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------- |
| DJI FlightHub 2                                                                 | Flota, proyectos y roles de equipos con drones DJI                           | Quien opera los drones | Contratar y verificar el trabajo de un tercero                    |
| DroneDeploy, Pix4D (Pix4Dfields, Matic)                                         | Planificar vuelos, procesar imágenes y exportar ortomosaicos, nubes y mallas | Quien opera o procesa  | Seguimiento entre vuelos de varios proveedores, pagos, documentos |
| Aloft                                                                           | Bitácora, cumplimiento y planificación de vuelo                              | Operadores             | Lo mismo                                                          |
| Unidades de agricultura de precisión de los ingenios y herramientas de Cenicaña | Análisis agronómico y cartografía propia                                     | Ingenios               | Los sistemas internos de los ingenios no son públicos             |

## Lo que dice la ingeniera frente a lo encontrado

- **«Ya hay sistemas de vuelo de drones y los usan los ingenios»:** coincide en parte. Hay muchos productos para operar y procesar; no encontré ninguno público que gestione el servicio contratado de punta a punta.
- **«Los ingenios no tienen drones»:** **no lo puedo confirmar.** Cenicaña investiga con drones y hay un ingenio sin nombre que aplica con drones; en Brasil algunos ingenios tienen los suyos. Es plausible que muchos contraten el servicio, pero hace falta preguntarlo a ingenios concretos (cuáles tienen drones propios, cuáles contratan, y a quiénes).

## Lo que sugiere para el prototipo (propuesta mía, para validar)

1. **Reposicionar: no es un sistema de vuelo, es el control del servicio de drones contratado.** Quien vuela ya tiene DJI Pilot, FlightHub o DroneDeploy. Quien _compra_ vuelos necesita programar, recibir, verificar, pagar y archivar. Eso es lo que el prototipo ya separa (empresa frente a operador; «programar un vuelo y documentar su ejecución son acciones distintas»).
2. **Tres actores, no dos:** ingenio (gestiona), cañicultor (proveedor, con 75 % del área) y operador (presta el servicio). Hoy la demo asume una empresa y un operador. Conviene modelar al ingenio con sus proveedores y varios operadores.
3. **La verificación es el valor más sólido encontrado:** comparar el área pedida con el área realmente volada o aplicada, por suerte, antes de pagar. Es una necesidad documentada en caña y encaja con «Antes de pagar» de Pagos.
4. **Hablar el idioma del ingenio:** en caña la unidad de manejo es la **suerte** (y la hacienda o finca), el corte, la zafra, el madurante, el vigor. Añadir una plantilla «Caña de azúcar» en Configuración (suerte, hacienda, zafra) y las alertas que usan (vigor, resiembra, malezas).
5. **Encajar con lo que ya tienen:** importar la cartografía de suertes (KML, GeoJSON, shapefile) y entregar resultados en formatos abiertos (GeoTIFF, shapefile, CSV). No reemplazar su GIS.
6. **Comparar proveedores:** puntualidad, entregas aceptadas, observaciones por vuelo y costo por hectárea. Solo tiene sentido si el ingenio contrata a varios.
7. **Qué no construir:** planificación de misión, telemetría y control de vuelo (ya cubiertos por DJI y otros).

## Preguntas para validar con la ingeniera y con ingenios

- ¿Qué ingenios tienen drones propios y cuáles contratan? ¿A quién y cómo se paga (por hectárea, por vuelo, por hora)?
- ¿Quién necesita más este servicio: el ingenio o el cañicultor proveedor?
- ¿Cómo verifican hoy las aplicaciones aéreas y los vuelos de monitoreo? ¿Qué herramienta usan para la cartografía de suertes?
- ¿Qué entregables piden a los operadores y en qué formato?
- ¿Qué sistemas internos tienen que respetarse (ERP, GIS, Cenicaña) y con cuáles tendría que conversar Otear?
- ¿Cuánto pagarían por controlar este servicio, y quién decide la compra?

## Qué pulir primero en el prototipo (si se confirma)

Una pasada corta: plantilla «Caña de azúcar», verificación de área pedida frente a volada en Pagos, importación de suertes en Mapa, y un tablero de proveedores. Nada de esto se ha construido todavía.

## Pasada de pulido hecha (28 de octubre de 2026)

Construido a partir de las conclusiones anteriores; sigue siendo una demo con datos de ejemplo.

- **Plantilla «Caña de azúcar»** en Configuración > Nombres y menú: «suertes» en vez de «lotes» (menú, mapas, listas), «Novedad de campo», «Aplicador», «Evolución del cultivo». La palabra de las zonas se puede fijar por sector.
- **Verificación del área en Pagos** (`billing/coverage.ts`): compara el área _pedida_ (suma de las zonas del vuelo en el mapa), la _cubierta_ (la que reporta el operador en su registro de vuelo, campo nuevo «Hectáreas cubiertas») y la _facturada_ (campo nuevo en la factura). Tolerancia de 5 %. Entra en «Antes de pagar». **Límite:** Otear no mide el área volada con las imágenes; depende de lo que reporte el operador. En los datos de ejemplo el primer vuelo termina antes de las últimas líneas del Lote 5 (la ruta lo muestra), cubre cerca del 95 % de lo pedido y la factura cobra cerca de 5,7 % más de lo cubierto.
- **Importar polígonos con nombre** (Mapa y lotes > Polígonos de mis lotes): KML o GeoJSON con varios polígonos; conserva el nombre (`nombre`, `suerte`, `lote`… en GeoJSON; `<name>` en KML). Shapefile no se lee; hay que exportarlo a GeoJSON o KML desde el GIS.
- **Operadores en Informes:** por operador, vuelos, hallazgos confirmados y descartados, facturado, saldo, costo por hectárea facturada y facturas con más área que la cubierta. Con un solo operador es un resumen; sirve para comparar si se contratan varios.

**Construido (demo):** los tres actores (ingenio = gestor, cañicultor = propietario, operador) como entidades de ejemplo y un flujo de contratación en `/servicios`: solicitud → cotizaciones → asignación → programación → entrega → verificación → factura, con «Ver como» para seguir el mismo servicio desde cada lado. Programar crea el vuelo en Programación; la entrega lo marca realizado; facturar crea la factura en Pagos con las hectáreas facturadas, que ahí se contrastan con lo pedido y lo cubierto. El área cubierta es la que declara el operador en la entrega o en su registro de vuelo.

**Sin construir aún:** integración real con el GIS del ingenio; medir el área volada desde las imágenes o el registro de vuelo; cuentas y permisos reales por actor (hoy «Ver como» es solo un selector de la demo); notificaciones; una sola solicitud para varios operadores o varias fincas.
