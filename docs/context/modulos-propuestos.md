# Módulos propuestos por el usuario

Estado: descripción provisional recibida el 25 de octubre de 2026. El usuario indicó expresamente no empezar pantallas hasta que lo diga. Registrar requisitos no autoriza implementar vistas ni integrar servicios. Se conserva como evolución de la idea, sin reemplazar silenciosamente decisiones pendientes del PDF o la matriz.

## Programación de vuelos

- Programar un vuelo y describir su objetivo.
- Planear y consultar la ruta en un mapa interactivo.
- Predicción automática del clima para la fecha prevista.
- Recomendaciones de seguridad, listas de chequeo y regulaciones pertinentes.
- Nombre del piloto, encargado de la empresa, proveedor u operador y modelo del dron.
- Interés en una representación 3D del dron.
- Consultar vuelos pasados con la misma información de contexto.

Pendientes: diferenciar ruta planificada de trayectoria registrada; origen y horizonte real del pronóstico; disponibilidad/licencia/peso del modelo 3D; alcance de cada lista y de las recomendaciones. La descripción no confirma ninguna integración ni regla aeronáutica específica.

## Detalle de un vuelo

- Consultar lo sucedido, informe y fotografías o videos entregados por el operador.
- Explorar hallazgos ubicados en el mapa y abrir su evidencia y detalle.
- Investigar cómo IA puede ayudar a interpretar y navegar las entregas del operador.

Oportunidades por evaluar: resumen con referencias a evidencia, búsqueda en fotos/informes, agrupación por lote o tema y propuestas de tareas. Diferenciar resultados entregados por el operador de inferencias nuevas de IA; mantener revisión humana e incertidumbre. No se eligieron modelos ni se autorizó una integración API.

## Pagos y contabilidad

- Registrar pagos relacionados con vuelos.
- Guardar facturas.
- Definir estadísticas útiles a partir de necesidades reales.

Pendientes: si el módulo solo registra cuentas/pagos o ejecuta transacciones; moneda, impuestos y alcance contable; relación con labores por hectárea y verificación de cobros del planteamiento anterior. No implementar contabilidad completa ni pasarela por anticipación.

## Regulaciones y documentos

- Centralizar la documentación requerida para operaciones de vuelo frente a la Aeronáutica Civil.

Pendientes: documentos por persona, empresa, aeronave y operación; vigencias, permisos de acceso y fuentes oficiales actualizadas. No afirmar que una operación está autorizada solo por tener archivos cargados.

## Objetivo transversal

Centralizar información hoy repartida entre plataformas. El usuario está explorando otros módulos; no hay navegación final aprobada. Fincas/lotes, responsables, archivos y trazabilidad podrían ser capacidades compartidas antes que pestañas independientes. La cantidad y organización de pestañas se decidirán con el usuario.

## Restricción vigente

Mantener la base Next.js + HeroUI sin pantallas hasta la siguiente indicación expresa. Frontend primero; backend en Go después de validar. La representación inicial de capacidades futuras debe identificarse como datos de ejemplo, sin pronósticos, análisis, pagos ni autorizaciones ficticios presentados como reales.
