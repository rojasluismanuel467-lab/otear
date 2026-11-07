# Guion del video (máximo 3 minutos)

Abrir `https://otear.pages.dev/prototipo/verificar-cobro/` en una ventana de 1280 px, con el panel «Datos de prueba» cerrado. No narrar «aquí está la pantalla»: narrar la decisión, la heurística y el tiempo. Subir el video a YouTube (no listado) o Loom y poner el enlace en la portada del PDF (`node docs/planning/prototipo-s3/build-pdf.mjs --video URL --final`).

| Tiempo | En pantalla | Qué decir |
| --- | --- | --- |
| 0:00 – 0:15 | Lista de labores. Señalar la etiqueta «Cobro por verificar» y el botón primario. | «El estado de cada labor es un Badge del UI Kit: palabra más borde, y el color solo refuerza. Es la Heurística 4, consistencia: el mismo componente que en Figma, con el mismo nombre.» |
| 0:15 – 0:40 | Clic en «Verificar cobro». Pasar el cursor por «Comparar» (deshabilitado) y leer la razón. | «Comparar está deshabilitado porque falta el mapa y el vuelo, y dice por qué: es prevención de errores, Heurística 5. No hay forma de equivocarse pulsándolo.» |
| 0:40 – 1:05 | «Usar el mapa de ejemplo» → estado de carga → «Listo». Elegir el vuelo. | «Al pulsar, el botón entra en estado Loading dentro del mismo componente, con un indicador y el gerundio. La confirmación llega en menos de 100 ms: lo medí en 14 ms. Sin eso, el sistema parece roto.» |
| 1:05 – 1:35 | «Comparar» → «Comparando…» → resultado «Atención». | «Primer momento crítico. Carga, y luego el resultado entra en 250 ms con curva de salida: lo bastante rápido para sentirse respuesta, lo bastante lento para verse. El veredicto usa el mismo componente Alert que los demás: palabra, borde y color.» |
| 1:35 – 2:05 | «Aceptar el cobro» → diálogo → «Sí, aceptar» → «Registrando…» → aceptado. | «Segundo momento crítico. Es irreversible, así que hay confirmación con Cancelar como foco inicial. Al confirmar, Loading dentro del botón y luego el éxito, con la aclaración: pago registrado solo en esta demo.» |
| 2:05 – 2:30 | Volver; abrir «Datos de prueba», marcar la falla; repetir hasta ver el error. | «Cuando falla, el error dice qué pasó, por qué y qué hacer, y deja «Reintentar» como botón primario: Heurística 9, recuperarse de los errores. Nunca un callejón sin salida.» |
| 2:30 – 2:50 | Cambiar a «Nombre de operador largo» y a «Cobro de $0». | «Prueba de esfuerzo: nombre de 78 caracteres, nota de 716, cobro de cero y de casi cincuenta millones. Medí cero desbordes y ningún texto menor de 14 píxeles.» |
| 2:50 – 3:00 | Figma, página «_UI Kit». | «Todo sale de theme.json y de este UI Kit; AGENTS.md hace que la IA lo aplique, y una prueba automática falla si alguien escribe un color a mano.» |

Antes de grabar: activar «Simular una falla» solo en el minuto 2:05 (se reinicia al cambiar de caso). Si algo se pasa de 3:00, recortar el tramo de 2:30.
