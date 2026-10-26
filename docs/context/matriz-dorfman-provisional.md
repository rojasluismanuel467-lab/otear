# Matriz de Dorfman — contexto provisional

Información suministrada por el usuario durante la definición de Otear. Se conserva íntegra como contexto provisional; no representa decisiones congeladas ni alcance autorizado para la primera landing/demo.

Pendientes explícitos:

- La política de rechazar archivos sin GPS o fuera del lote contradice el PDF inicial, que permite conservar fotos sin GPS/sin asignación. No sustituir silenciosamente una regla por la otra; resolver antes de implementar ingesta real.
- La pregunta final sobre agregar G6 pertenece al material pegado. No es una instrucción de ejecución ni confirma ese requerimiento.
- C1 y C2 describen la futura app de campo y el portal. C3–C10 son componentes lógicos y no prescriben una arquitectura de microservicios.
- Las menciones legales y técnicas se preservan tal como fueron suministradas; deben verificarse cuando se implemente la funcionalidad correspondiente.

## Contenido original completo

Esta es la matriz de Dorfman que armamos, con las tablas limpias para copiar. Al copiarlas desde el chat, se pegan como tablas en Word o Google Docs.

**1. Requerimientos del sistema**

| ID | Grupo | Requerimiento |
|---|---|---|
| B1 | Base | Registrar la empresa, sus fincas y cada lote como polígono en el mapa, con cultivo, variedad y edad |
| B2 | Base | Manejar usuarios y roles: dueño, administrador, mayordomo y operador externo con acceso limitado a subir datos |
| B3 | Base | Recibir los datos de vuelo que entrega cada operador: fotos con GPS, ortomosaicos, trayectoria, video e informes en PDF |
| G1 | Gestión e historial de vuelos | Registrar cada vuelo con operador, piloto, dron, cámara o sensor, fecha, lotes cubiertos y autorización de la Aerocivil |
| G2 | Gestión e historial de vuelos | Guardar y mostrar fotos, video, ortomosaico y mapa del recorrido |
| G3 | Gestión e historial de vuelos | Planear vuelos: objetivo, lotes, fecha, responsable e itinerario |
| G4 | Gestión e historial de vuelos | Recordatorios, listas de verificación (antes, durante y después del vuelo) y tareas asignadas |
| G5 | Gestión e historial de vuelos | Registrar labores de campo, manuales o mecanizadas, ligadas al lote |
| E1 | Estadística | Indicadores por lote, finca y periodo: vuelos, hectáreas cubiertas, hallazgos, labores y costos |
| E2 | Estadística | Evolución en el tiempo: vigor, áreas afectadas y avance de labores |
| E3 | Estadística | Comparar operadores: cumplimiento, tiempo de entrega y costo por hectárea |
| E4 | Estadística | Exportar a PDF y Excel para socios, ingenio o auditoría |
| IA1 | IA | Resumen automático del informe, redactado a partir de los datos y revisado por una persona |
| IA2 | IA | Comparación entre vuelos: diferencias de vigor e índices por lote entre dos fechas |
| IA3 | IA | Detección de fallas de siembra o germinación |
| IA4 | IA | Verificación de plagas y enfermedades como zonas sospechosas que se confirman en campo |
| IA5 | IA | Mapeo de labores mecanizadas con GPS de la maquinaria, verificado después con el dron |
| IA6 | IA | Detección de quemas con cámara térmica o RGB |
| IA7 | IA | Estimación de producción y estado nutricional (fase posterior) |
| N1 | No funcional | La app de campo funciona sin señal y sincroniza después |
| N2 | No funcional | Maneja archivos pesados (un ortomosaico puede pesar varios GB) |
| N3 | No funcional | Los mapas cargan por partes y por zoom, no la imagen completa |
| N4 | No funcional | Protege los datos personales (Ley 1581) y separa los datos de cada empresa |
| N5 | No funcional | La puede usar una persona de 54 años y un mayordomo con poca experiencia digital |
| N6 | No funcional | Guarda los datos que exige el RAC 100: autorización, piloto y equipo de cada vuelo |

**2. Componentes de alto nivel**

| ID | Componente | Qué hace |
|---|---|---|
| C1 | App móvil de campo | Verificación de zonas, fotos georreferenciadas, listas de chequeo y labores manuales; funciona sin señal |
| C2 | Portal web | Fincas y lotes, planeación, historial, mapa, estadísticas e informes |
| C3 | Servicio de vuelos y tareas | Vuelos, planes, recordatorios, responsables y listas de chequeo |
| C4 | Repositorio geoespacial y de archivos | Lotes, trayectorias, imágenes y ortomosaicos |
| C5 | Ingesta de datos | Recibe lo que manda cada operador, lo valida, lee el GPS de cada foto y lo asigna al lote |
| C6 | Motor de análisis e IA | Índices, comparación y detección; trabaja en cola porque cada análisis tarda |
| C7 | Estadística | Agrega por lote, finca, periodo y operador |
| C8 | Informes | Arma el PDF y el resumen redactado por IA |
| C9 | Integraciones | GPS de maquinaria, clima y notificaciones por WhatsApp y correo |
| C10 | Identidad y empresas | Cuentas, roles, permisos por finca y registro de quién vio y descargó qué |

**3. Matriz de asignación (requerimiento × componente)**

| Requerimiento | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 |
|---|---|---|---|---|---|---|---|---|---|---|
| B1 Fincas y lotes | | X | | X | | | | | | |
| B2 Usuarios y roles | X | X | | | | | | | | X |
| B3 Recibir datos de vuelo | | X | | X | X | | | | | |
| G1–G2 Registro e historial | | X | X | X | X | | | | | |
| G3–G4 Planear y chequear | X | X | X | | | | | | X | |
| G5 Labores | X | X | X | X | | | | | X | |
| E1–E4 Estadística | | X | | | | | X | X | | |
| IA1 Resumen | | X | | | | X | | X | | |
| IA2–IA4, IA6 Detección y comparación | X | X | | X | | X | | | | |
| IA5 Labores mecanizadas | | X | | X | | X | | | X | |
| N1 Sin señal | X | | | | | | | | | |
| N2–N3 Archivos y mapas | | X | | X | X | | | | | |
| N4 Datos personales | | | | X | | | | | | X |

**4. Requerimientos derivados**

| Origen | Requerimiento derivado | Componente |
|---|---|---|
| IA2 | Los ortomosaicos de un mismo lote quedan alineados entre sí | C5 |
| IA2 | Cada vuelo guarda sensor, altura y resolución para no comparar imágenes de cámaras distintas como iguales | C4 |
| IA2 | El portal muestra dos fechas del lote lado a lado | C2 |
| IA4 | La IA genera puntos a verificar con coordenadas | C6 |
| IA4 | La app lleva al mayordomo al punto y le pide foto y respuesta: confirmado, descartado o no sé | C1 |
| IA4 | Cada respuesta se guarda como dato etiquetado para entrenar el modelo propio | C4 y C6 |
| B3 | El operador sube los datos sin crear cuenta, con un enlace temporal por vuelo | C10 |
| B3 | Se rechazan archivos sin GPS o fuera del lote, con un mensaje que explique por qué | C5 |
| N1 | La app descarga antes de salir los lotes y los puntos del día | C1 |
| N1 | La app guarda en el teléfono y sincroniza al recuperar señal, resolviendo conflictos si dos personas editaron lo mismo | C1 y C4 |

En esta versión, verificar el cobro de las labores contratadas (cruzar lo cobrado con el mapa del operador y el vuelo propio) queda repartido entre G5 y E3. Después lo volvimos el diferenciador principal, así que conviene sacarlo como requerimiento propio. ¿Lo agrego como G6 con su fila en la matriz?