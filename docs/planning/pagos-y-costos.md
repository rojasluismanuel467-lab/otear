# Plan provisional: pagos, facturas y costos

Estado: planificación del 25 de octubre de 2026. No autoriza pantallas, código, contabilidad completa ni transacciones. Datos de demostración sintéticos; cada pestaña se definirá con el usuario.

## Objetivo y tareas

Relacionar servicios de vuelo con lo contratado, el documento recibido y los pagos registrados para entender compromisos y saldos. Alcance multisector confirmado: agro, carreteras, vigilancia y construcción. Usar proyecto/sitio y zona, presentada como lote, tramo, frente o sector según el contexto.

- Localizar el vuelo y operador al que corresponde un cobro.
- Consultar importe acordado, factura o soporte, vencimiento si existe y pagos asociados.
- Registrar conceptualmente un pago parcial o total, con fecha y comprobante.
- Identificar diferencias entre lo acordado y lo facturado para revisión humana.
- Filtrar por proyecto/sitio, zona, operador y periodo conservando el contexto de cada importe.
- Contrastar un plan contratado de vuelos recurrentes con los vuelos realizados; paquetes de mediano plazo e itinerarios diarios/interdiarios son propuestas a validar, no condiciones comerciales aprobadas.

## Trazabilidad con Dorfman

| Referencia | Relación y límite |
|---|---|
| G1–G2 | Vuelo e historial a los que se enlazan cobros y soportes; no define pagos. |
| G5 | Labores ligadas al lote; su inclusión económica y cobro por hectárea siguen pendientes. |
| E1 | Costos por lote, finca y periodo; requiere definir qué fecha y costo se incluyen. |
| E3 | Comparación de operadores y costo por hectárea; comparar servicios equivalentes. |
| B2 / N4 | Acceso y separación por empresa; permisos financieros específicos sin definir. |
| C2 / C4 / C7 / C10 | Portal, archivos, agregaciones e identidad como capacidades lógicas, no microservicios obligatorios. |

Registrar pagos y guardar facturas son una ampliación explícita de los módulos descritos por el usuario; **no tienen un nuevo ID Dorfman confirmado**. G6 sigue pendiente y no se usa como requisito aprobado. La verificación de cobertura no prueba cantidad ni calidad del producto aplicado ni valida automáticamente un cobro.

La terminología agrícola de G5/E1/E3 se conserva como origen. Su extensión a proyecto, sitio, zona y otras unidades proviene de la precisión multisector del usuario; no se presenta como texto original de Dorfman. Otear centraliza información y no se presume vendedor o prestador de los vuelos.

## Información conceptual mínima

- **Compromiso o plan contratado:** referencia a proveedor y cliente, proyecto/sitio, alcance, vigencia, precio/moneda y unidad pactada: paquete, vuelo, hora, hectárea, kilómetro u otra. Registrar cantidad comprometida y relación con vuelos planificados/realizados. Su recurrencia diaria/interdiaria es programación, no prueba de ejecución ni multiplicador automático del precio.
- **Obligación:** cobro que se debe revisar o pagar por un servicio. Empresa, proyecto/sitio y zonas relacionadas, operador, compromiso, vuelo o labor, descripción, importe, moneda, fechas de servicio/registro y vencimiento opcional. Distinguir presupuesto, compromiso y obligación confirmada; el presupuesto y la totalidad del contrato no aumentan automáticamente el saldo.
- **Factura o soporte:** referencia documental, emisor, número si existe, fecha e importe declarado; enlaza el archivo y la obligación. Su carga no significa aprobación, aceptación fiscal ni pago. No contar obligación y factura como dos costos.
- **Pago registrado:** fecha, importe, moneda, destinatario, medio informado y comprobante opcional. Es constancia anotada, no ejecución bancaria ni conciliación automática.
- **Aplicación del pago:** cuánto de un pago se asignó a cada obligación. Permite parciales sin duplicar el desembolso. Pagos sin asignar se muestran por separado; no reducen arbitrariamente el saldo de un vuelo.
- **Costo asignado:** importe reconocido repartido entre vuelos o zonas con un método visible; sus asignaciones no superan ni duplican el total de origen. Un paquete de precio fijo se cuenta una vez, no una vez por vuelo. Importe contratado, costo registrado, factura y efectivo pagado son conceptos distintos.

Si se necesita «pendiente de facturar», su definición y calendario deben acordarse: representa alcance o importe sujeto a facturación según el contrato; no equivale al saldo de obligaciones menos pagos. Para la demo basta mostrar el estado documental y el compromiso enlazado, sin inventar reconocimiento contable ni ciclos de facturación.

Usar COP como moneda de los ejemplos, con importes rotulados; no sumar monedas diferentes ni asumir conversión. No definir impuestos, retenciones, numeración fiscal, devengo normativo ni reglas contables por anticipación. El criterio de reconocer un costo y su fecha debe acordarse antes de mostrar cifras reales.

## Dueño de datos y enlaces compartidos

Este módulo mantiene referencias económicas de compromisos, obligaciones, relaciones documentales, pagos y aplicaciones dentro de la empresa correspondiente. Reutiliza identificadores compartidos de empresa, proyecto/sitio, zona, vuelo/labor, operador y archivo; no crea un segundo directorio ni copias independientes de registros o documentos.

Los módulos de programación/vuelos/labores conservan itinerarios, ejecución y cancelaciones; archivos conserva el documento; este módulo relaciona y explica importes. Usa referencias a planes/vuelos reales sin mantener otra agenda. Roles para registrar, corregir, aprobar y consultar importes quedan pendientes; no se otorgan al operador externo por defecto.

## Demo local y futuro backend

**Demo posterior, cuando se autorice:** un paquete sintético ligado a un proyecto/sitio y varias zonas, vuelos previstos/realizados de muestra, un cobro, documento y pago parcial. Datos locales y cambios simulados; el detalle explica el importe y permite volver al vuelo/plan. No subir soportes personales, emitir facturas, confirmar transferencias, enviar comprobantes ni afirmar persistencia real.

**Etapa futura:** Go validará permisos, importes, aplicaciones, separación por empresa y trazabilidad de cambios; se decidirán almacenamiento documental y persistencia. La forma de API, conciliación y cualquier proveedor se definirá entonces. Esto no prescribe endpoints, tablas ni arquitectura de despliegue.

## Tres cifras que apoyan decisiones

1. **Saldo pendiente a una fecha:** suma de obligaciones confirmadas vigentes hasta el corte menos pagos aplicados hasta ese corte, en la misma moneda y empresa. No limitar pagos al mes si corresponden a deudas anteriores; mostrar fecha de corte y pagos sin asignar aparte. Si una aplicación excede la obligación, señalar inconsistencia y no ocultarla con un saldo cero.
2. **Pagos registrados del periodo:** suma de cada pago vigente una sola vez cuya fecha de pago esté dentro del intervalo, con su moneda. Es salida de efectivo registrada; no es costo ni prueba de transferencia ejecutada. Si se filtra por vuelo/zona, usar solo sus aplicaciones y rotular «pagos aplicados»; no atribuir el pago completo a cada relación.
3. **Costo por unidad del servicio:** costo reconocido asignado ÷ cantidad ejecutada compatible con la unidad/alcance pactados (vuelo, hora, ha, km). Denominador mayor que cero, con origen y método visibles. No mezclar unidades o servicios. En paquetes, distinguir precio contratado por unidad prevista de costo observado por unidad ejecutada; este último cambia mientras se ejecuta el plan y no es una tarifa cobrada por vuelo. Para hectáreas recurrentes, aclarar ha-servicio acumuladas frente a superficie única. Si falta base válida, mostrar «sin datos suficientes».

No sumar estas tres cifras entre sí. Evitar comparaciones de operador sin explicar tarea, unidad, cantidad, fecha, moneda y alcance incluidos.

## Criterios de aceptación para una futura demo

1. Se identifica que todos los importes, documentos y pagos son de ejemplo y ninguna acción mueve dinero.
2. Un cobro de ejemplo de COP 1.000.000 y un pago aplicado de COP 400.000 muestran COP 600.000 pendientes; adjuntar una factura del mismo servicio no duplica el costo.
3. Un paquete de COP 1.000.000 vinculado a cuatro vuelos mantiene ese total; un pago repartido cuenta una vez y solo por su aplicación al consultar cada vuelo. Pagos sin asignar quedan aparte.
4. Cada importe muestra moneda, tipo y fecha; cantidad/unidad ausente o incompatible impide calcular costo unitario. Los vuelos pendientes no se presentan como realizados ni «pendiente de facturar» como deuda impagada.
5. Desde un registro se consulta su vuelo, operador y soporte de muestra; la ausencia de soporte y una discrepancia de importes tienen explicación explícita, sin declarar aprobación automática.

## Preguntas y límites antes de implementar

- ¿Solo registro y seguimiento, o se pretende ejecutar pagos en una etapa posterior?
- ¿Quién confirma una obligación y registra correcciones? ¿Se necesita aprobación del dueño?
- ¿Un cobro puede cubrir varios vuelos, sitios, zonas o labores? ¿Cómo se acuerda su reparto y unidad contractual?
- ¿Quién contrata con quién y qué incluye el paquete? ¿Qué sucede con cancelaciones, vuelos adicionales, cambios de frecuencia o ejecución parcial? Validar vigencia, alcance, calendario de cobros y enlace al itinerario sin asumir que Otear presta el servicio.
- ¿La factura origina el cobro o documenta uno ya pactado? ¿Qué documentos puede haber sin factura?
- ¿Qué fecha y criterio definen el costo mostrado? ¿Se registrarán anticipos, anulaciones o devoluciones? No simularlos como resueltos.
- ¿Verificar labores pagadas será parte de este módulo, del detalle de vuelo o una capacidad separada? G6 no está confirmado.

Referencias locales: [módulos del usuario](../context/modulos-propuestos.md), [matriz provisional](../context/matriz-dorfman-provisional.md) y [guía UX](../UX_GUIDELINES.md). Sin investigación fiscal o normativa en este plan.
