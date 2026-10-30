# Brief común de la revisión por roles

Lea esto completo antes de empezar. El plan general está en `docs/planning/revision-por-usuarios.md` (léalo también; las secciones «Huecos» H1–H9 y «Reglas» son obligatorias).

## Qué es esto

Usted es una persona real que podría usar Otear, no un revisor técnico. Mira la landing y la demo con los ojos, el vocabulario y la paciencia de esa persona. Su trabajo es encontrar qué no se entiende y qué ayudaría, en tres ejes:

1. **texto**: lo que se dice y debe cambiarse.
2. **componente**: lo que se presenta (qué ayuda a su tarea, qué es adorno, qué confunde, qué falta).
3. **caso-de-uso**: si el escenario de ejemplo de su sector es creíble y trae la información que esa persona esperaría para decidir.

## Qué NO es

- No es una revisión de código, accesibilidad ni rendimiento (eso lo cubre `.agents/skills/otear-reviewer`).
- No edite ningún archivo del proyecto. **Solo** escribe su informe en `docs/planning/revision-usuarios/<persona>.md` (el nombre se lo da su encargo).
- No simule resultados de usuarios reales: ni porcentajes, ni citas inventadas, ni «el 80 % de los agricultores». Escriba «yo, como esta persona, entendería X». Son hipótesis.

## Cómo recorrerlo

La demo corre en `http://localhost:3000` (ya está encendida; no la reinicie ni ejecute `npm run build`). Rutas: `/` (landing), `/programacion`, `/vuelos`, `/mapa`, `/evolucion`, `/equipos`, `/informes`, `/pagos`, `/documentos`, `/servicios`, `/configuracion`.

Orden obligatorio:
1. **Prueba de 5 segundos.** Abra solo la primera pantalla de la landing (hero) y, **antes de leer nada más**, escriba en su informe tres respuestas con las palabras de su persona: ¿qué cree que hace Otear?, ¿para quién es?, ¿qué haría ahora? Sea franco si no lo sabe.
2. Lea el resto de la landing como su persona.
3. Entre a la demo (la landing guarda el sector elegido en `localStorage` `otear.entry` y la demo cae en `/programacion`). **Primer minuto:** anote qué hizo y dónde dudó.
4. Intente **sus tareas** (están en su encargo) sin ayuda, en ese orden. Anote si las pudo terminar, dónde se atascó, qué palabra no entendió y qué esperaba encontrar.

Herramientas: lea el código de la pantalla (`src/features/<módulo>/`, `src/features/landing/landing-page.tsx`, `src/features/demo/demo-data.ts`) para citar texto exacto y `archivo:línea`. Para ver la pantalla, use un Chromium sin interfaz propio, nunca el navegador integrado ni el de otros agentes:

```bash
CHROME=$(ls ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome | tail -1)
# Captura estática (landing y vistas iniciales):
$CHROME --headless=new --no-sandbox --disable-gpu --window-size=1280,900 \
  --virtual-time-budget=9000 --screenshot=$SCRATCH/pantalla.png http://localhost:3000/
# Para hacer clic y navegar: --remote-debugging-port=<SU PUERTO> --user-data-dir=$SCRATCH/profile
# y maneje CDP con un script de Node 22 (WebSocket global). Los botones de HeroUI
# ignoran .click() desde JS: use Input.dispatchMouseEvent con coordenadas.
```

Use móvil (`--window-size=390,844`) al menos en la landing. Lea las capturas con la herramienta Read. Para el resto del trabajo temporal use su directorio `$SCRATCH` (se lo da su encargo). Si no consigue interactuar con una pantalla, dígalo y marque la evidencia como «lectura de código», no «navegador».

## Plantilla de hallazgo (use exactamente estos campos)

```
### [ID] Título corto
- Eje: texto | componente | caso-de-uso
- Dónde: ruta y archivo:línea
- Lo que ve la persona: (cita literal o descripción)
- Qué entiende o hace mal:
- Por qué importa para su tarea:
- Propuesta: (texto nuevo en es-CO con «usted», o cambio de componente, o dato que falta)
- Gravedad: bloquea la tarea | confunde | menor
- Evidencia: navegador (captura/paso) | lectura de código
- Huecos relacionados: H1…H9 si aplica
```

IDs: la inicial de su persona + número (p. ej. `C-01`). Máximo **14 hallazgos**, ordenados de más a menos grave. Un problema que se repite en varias pantallas es un solo hallazgo. Incluya además al menos **3 cosas que ya funcionan bien** para su persona (qué conservar), porque la fase de mejora no debe romperlas.

## Estructura del informe

1. Persona y tareas (una línea cada una).
2. Prueba de 5 segundos (antes de leer más).
3. Primer minuto en la demo.
4. Tareas: ¿pudo terminar cada una? (sí / con ayuda / no, y por qué).
5. Hallazgos (plantilla).
6. Lo que funciona y hay que conservar.
7. Huecos H1–H9: cuáles le estorban a esta persona, cuáles le son indiferentes (una línea cada uno).
8. Qué le preguntaría a una persona real como ella para comprobar lo anterior (3 preguntas sobre su pasado, no sobre «si usaría» Otear).
9. Límites: qué no pudo verificar.

## Reglas que no se pueden saltar

- Es un frontend con **datos sintéticos**. No proponga presentar una simulación como real.
- Otear **no presta vuelos**; es la plataforma donde se reúnen y se revisan.
- No invente clientes, logos, cifras de mercado, testimonios ni tarifas. Si propone un texto con números, márquelo «de ejemplo».
- No resuelva en silencio la política de fotos sin GPS ni «G6»; la matriz de Dorfman es provisional.
- Recurrencia, urgencias, paquetes y asesoría son propuestas a validar, no funciones construidas. Los complementos por sector se describen «Se construye con usted».
- Español de Colombia, trato de usted, lenguaje del productor/operador, no de software. Identificadores del código en inglés.
- No proponga pantallas ni módulos nuevos; sí puede decir que falta un dato o un paso en uno existente.
- Precio, propiedad de datos y cómo entran los vuelos son decisiones del dueño del proyecto: puede señalar el hueco y sugerir una redacción honesta («por definir»), no decidir.
- Tipografía mínima 12 px; el usuario principal es de 56 años y usa escritorio.
