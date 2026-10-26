# Alcance multisector y feedback operativo

Actualización del 25 de octubre de 2026. Fuente: instrucciones del usuario y feedback de un tercero compartido en el chat. No sustituye la matriz original: precisa alcance y añade hipótesis para validación.

## Confirmado por el usuario

Otear debe servir también a carreteras/interventoría, construcción y vigilancia, además de agricultura. Se mantiene Next.js + HeroUI, frontend primero y backend Go posterior. Sigue vigente no crear pantallas hasta indicación expresa.

El núcleo compartido gestiona empresas, sitios/proyectos, zonas, vuelos, responsables, evidencias, hallazgos, tareas, costos y documentos. La finca agrícola es un escenario inicial, no una restricción de todo el producto. Etiquetas y tipos se adaptarán al sector, sin copiar módulos completos para cada industria.

## Necesidades expresadas en el feedback

1. **Seguimiento recurrente:** vuelos diarios o interdiarios y paquetes/contratos de mediano plazo. Evaluar series y acuerdos; distinguir cada ocurrencia programada de los vuelos efectivamente realizados.
2. **Urgencias:** solicitudes de reconocimiento ante quemas/incendios, delimitación de áreas y acciones correctivas. Registrar prioridad y coordinación; disponibilidad, aceptación y ejecución corresponden a responsables identificados y no están garantizadas por el software.
3. **Meteorología:** condiciones actuales y pronóstico para preparar operaciones. Pendientes fuente, cobertura, horizonte, actualización e interpretación profesional; una fecha lejana puede no tener pronóstico disponible.
4. **Permisos y responsabilidades:** el tercero pregunta quién gestiona autorizaciones y sus límites. Queda por definir el responsable de cada trámite y verificar las exigencias aplicables en fuentes oficiales. La afirmación legal aportada es contexto, no una norma verificada por Otear.
5. **Interpretación técnica:** interés en diagnósticos y conceptos profesionales sobre cultivos, evolución y terreno. Distinguir datos capturados, observaciones del operador, sugerencias de IA y revisión de un especialista; también aplica a otros sectores con sus profesionales.
6. **Interventoría vial:** fechas, horarios, tramos y trayectorias acordados, meteorología, permisos y seguimiento para medidas correctivas e informe. No reducir la geometría de zonas únicamente a polígonos agrícolas.
7. **Ciclo de trabajo:** ambientación/acuerdo del objetivo, lugar, fechas, duración y costos; pre-vuelo y preparación de ruta, condiciones y riesgos; ejecución; post-vuelo con revisión y correcciones; informe consolidado contra el alcance contratado.

Son necesidades e hipótesis; no confirman por sí solas prioridades de desarrollo, capacidad operativa ni disposición a pagar.

## Decisiones que no se asumen

- La versión vigente de Otear es plataforma de información y coordinación. El feedback describe además expectativas de un servicio de vuelos; no confirma que Otear se convierta en operador o vendedor de vuelos.
- Una suscripción a Otear y un paquete de vuelos contratado a un operador son conceptos comerciales diferentes.
- Solicitar un vuelo urgente no confirma despacho ni respuesta inmediata. Tampoco se presume detección automática de incendios.
- Ruta planificada, trayectoria registrada, zona de trabajo y documentación de autorización son conceptos distintos.
- La gestión documental no confirma legalidad operacional; mostrar clima no constituye autorización ni garantía para volar.
- Recibir una respuesta de campo no reentrena automáticamente un modelo ni convierte un hallazgo en diagnóstico certificado.

## Consecuencia para la demo

Definir un único escenario coherente y demostrar el recorrido cuando el usuario autorice la primera pantalla. Las capacidades nuevas pueden quedar en el plan de evolución. No crear ahora portales por sector, un centro de emergencias, un sistema contable, integraciones ni nuevos contratos de API.
