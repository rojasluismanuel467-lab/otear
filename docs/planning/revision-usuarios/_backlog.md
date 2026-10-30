# Síntesis y reparto de la primera revisión

Fuente: cinco informes en esta carpeta (V = visitante frío, N = Hernando, G = gerente de ingenio, O = operador, I = interventora), 69 hallazgos. Las evidencias son de una simulación de personas: son hipótesis para probar con gente real, no resultados de usuarios.

## Lo que se repite en varios roles (pesa más)

| Tema | Quién lo sufre | Resumen |
|---|---|---|
| Qué es Otear y qué no es | V-01, V-03, N-11, G-06 | El titular no nombra la categoría; «vuelo de la semana pasada» suena a avión; «se cubrió de verdad» promete más de lo que la demo muestra (la cifra la declara el operador). |
| La landing promete lo que la demo no tiene | I-01, I-03, O-02, G-03, G-06 | «hasta cerrar cada medida correctiva», «informes firmados», «la zona exacta», «qué decisiones salieron de ahí». Hay que ajustar el texto a lo que existe o dejarlo marcado como propuesta. |
| Las cifras no cuadran entre pantallas | N-01, G-02, G-08, O-09, I-08 | Mismo vuelo con distintas hectáreas y kilómetros; $/ha de Informes 4–12 veces las tarifas de Servicios; un servicio de $97.607 facturado por $850.000. |
| Primer minuto sin camino | V-04, N-10, I-11 | La demo cae en Programación (agenda del piloto) y el valor queda a varios clics. |
| Vocabulario de otro sector se filtra, y al recargar queda a medias | V-12, I-05, I-13, G-11, N-08 | «predio», «ingenio», «suerte» en la vía; tras recargar se conserva el vocabulario pero los datos vuelven a agricultura; cinco nombres para lo mismo. |
| Precio, datos y piloto no se dicen | V-02, G-12, O-04 | Decisiones del dueño del proyecto. Solo se redacta «por definir». |
| Qué es real y qué es ejemplo | N-07, V-10 | Repartido en letra de 12 px; «Funciona offline» no es del todo cierto (el mapa usa internet). |

## Reparto en lotes (cada uno en su propia rama y worktree, con archivos propios)

| Lote | Archivos que puede editar | Hallazgos |
|---|---|---|
| **A. Landing, entrada y configuración** | `src/features/landing/**`, `src/features/entry/**`, `src/features/config/**` | V-01..V-11, V-12 (recarga), I-13, V-14 (solo texto), G-06, G-12, G-13, N-10, N-11, I-11, O-12, y ajustar promesas de la landing a lo que existe |
| **B. Programación y Vuelos** | `src/features/flights/**`, `src/features/agents/**` | N-01 (en lo que dependa de vuelos), N-03, N-04, N-06, N-07 (en vuelos), I-08, O-07 (formulario del vuelo ↔ aeronave), O-13, G-04 y G-09 (solo texto y datos mostrados), I-12 (informe del vuelo), nombres de N-08 |
| **C. Servicios, Pagos, Documentos** | `src/features/services/**`, `src/features/billing/**`, `src/features/compliance/**` | G-01 (lógica), G-07, N-02, O-01 (mostrar la cifra, no cambiar la regla), O-02 (mostrar zona y hectáreas), O-05, O-06, O-10, O-11, O-14, I-04 (confirmar al borrar firmado), I-10, G-05 (solo texto) |
| **D. Evolución, Mapa, Informes, Equipos** | `src/features/evolution/**`, `src/features/sites/**`, `src/features/reports/**`, `src/features/fleet/**` | G-02 (cálculo y etiquetas), G-03, N-05, N-14, I-07, I-09, I-06 (mostrar PK/abscisa si el dato existe), I-12 (informes), nombres de N-08 |
| **E. Datos de ejemplo y estilos (solo este lote toca estos archivos)** | `src/features/demo/demo-data.ts`, `src/features/demo/types.ts`, `src/app/globals.css`, `public/images/**` | O-09, G-01 (semilla sin vuelo), G-02 (tarifas coherentes), G-08, O-11 (fechas), I-05 (semillas viales), I-06 (PK en datos), I-02 (la foto de campo de cultivo en la vía), N-09 (cifras clave a un tamaño legible; piso 12 px) |

Regla: cada lote cambia solo lo suyo. Si necesita un cambio en un archivo ajeno (por ejemplo un dato de `demo-data.ts`), lo pide en su informe final; no lo edita.

## No se hace en esta ronda: requiere su decisión o es una función nueva

| Tema | Hallazgos | Por qué se aparta |
|---|---|---|
| Precio, modelo de cobro, qué incluye un piloto | V-02, G-12, H3, H5 | Decisión de negocio. La landing solo dice «por definir». |
| De quién son los datos y cómo se sale | O-04, H4 | Decisión de negocio y de producto. |
| Cómo entran los vuelos (quién sube las fotos) | V-05, O-06, H2 | Otear no procesa imágenes en esta demo; la respuesta de fondo es suya. Se redacta qué hace la demo y qué no. |
| Multisector con cinco casos iguales o un caso principal | V-09 | Tensión con el alcance multisector ya confirmado. |
| Seguimiento de una no conformidad hasta cerrarla (responsable, plazo, cierre) | I-01 | Función nueva. La landing deja de prometerla. |
| Responder a una disputa, adjuntar, aceptar un ajuste | O-03 | Cambia la máquina de estados de Servicios (con tests). |
| Tolerancia de cobertura pactada en el pedido o la cotización | O-01 | Es una regla comercial. |
| Informe o acta de vuelo firmable con valor para una interventoría | I-03 | Función nueva; la política de firma es otra decisión. |
| Quién paga y quién es el Gestor frente al Propietario | G-05 | Modelo de actores. |
| Vista propia del operador; vista de un ingenio con muchos cañicultores | O-08, G-10 | Pantallas nuevas. |
| Flota y papeles del operador dentro del proyecto del cliente | O-04 | Modelo de datos. |
| Quitar 3D, galería o simulación porque no ayudan a las tareas | N-12 | Decisión de producto. |
| Campos propios de caña (edad, corte) en los lotes | N-13 | Función nueva. |
| Medición de la landing | H9 | La landing dice que no guarda nada. |
| El avión animado se pasa sobre el texto | V-13 | Animación; riesgo alto de romper el vuelo de la Viper. |
| Móvil: página larga, botón de menú recortado | V-14 | Revisar con calma en una segunda ronda. |

## Reglas para todos los lotes

- Datos sintéticos: nada se presenta como real. Otear no presta vuelos.
- No inventar clientes, tarifas, testimonios ni cifras de mercado. Todo número nuevo en un texto es «de ejemplo».
- No resolver la política de fotos sin GPS ni «G6». Recurrencia, urgencias, paquetes y asesoría siguen siendo propuestas.
- Español de Colombia, trato de usted, lenguaje del sector. Vocabulario renombrable por `useTerm()` / `useModuleTitle()`.
- Piso de 12 px; títulos con los tokens `--heading-*`.
- Las etiquetas de `preparation-items.ts` y los ids `flight-${siteId}-01` no se tocan.
- Cada cambio debe responder a un hallazgo con ID; nada de refactors por gusto.

## Estado tras la integración (30 de octubre de 2026)

Cinco lotes integrados en la rama `revision-por-usuarios` sin conflictos. `npm run check` limpio y `npm test` 240/240. Verificado a ojo en navegador: landing (escritorio y móvil), Evolución y Pagos de agricultura. **No** verificado en navegador: el recorrido de carreteras, construcción, minería y vigilancia, y móvil fuera de la landing.

Hecho por el integrador (no tenía dueño): «Guía de la demo» en tres pasos con enlaces (`app-shell.tsx`); historial de documentos con campo y valor antes/después y confirmación al eliminar (`traceability/**`, I-04); los PK sembrados de la vía se respetan en `chainage.ts` (D los contaba desde 0+000 y E sembró 12+000); PK en el informe del vuelo; «35 vuelos» en la landing.

### Queda pendiente (sin decidir o sin hacer)
- Decisiones: ver la tabla «No se hace en esta ronda».
- `traceability/templates.ts`: plantilla «predio» y redacción impersonal.
- `billing/coverage.ts`: «Área pedida 10 ha» en la vía, y cobertura marcador de 1 ha en entregas viales.
- Vuelos: pestaña por URL (`?tab=`); abrir Informes en la pestaña «Informe».
- `components/maps/*`: marcar las líneas que el operador declara sin volar; colores de la lista de Mapa parecidos a los de la gráfica.
- Seeds: los hallazgos viales sembrados aún hablan de cultivo; la fuente dice «Observación del operador · ejemplo».
- Servicios crea el vuelo sin aeronave («Por definir»).
- Pagos: la barra fija «Registrar pago» puede tapar la «Verificación del área» en pantallas bajas.
- Móvil: botón de menú recortado (V-14) sin comprobar; botón del mapa «Revisar 5 hallazgos (2 son sugerencias sin revisar)» puede apretarse.
- Cifras de la landing escritas a mano (`example` y «35 vuelos»): se revisan si cambian las semillas.
