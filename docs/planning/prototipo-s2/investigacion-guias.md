# Investigación previa a la matriz, las hipótesis y el PDF (1 nov 2026)

Qué se buscó y qué cambia en nuestra entrega. Lo que no pude confirmar en la fuente original lo digo.

## 1. Matriz de fidelidad

**Fuente base.** McCurdy et al., «Breaking the Fidelity Barrier», CHI 2006: la fidelidad no es una escala de bajo a alto, sino **cinco dimensiones independientes**: refinamiento visual, amplitud, profundidad, riqueza de interactividad y riqueza del modelo de datos. Un prototipo puede ser alto en una y bajo en otra (*mixed-fidelity*). No pude abrir el artículo completo; los datos salen de resúmenes ([Cambridge/Design Society](https://www.cambridge.org/core/product/23493A4B701F93BBC2D8F4085C2C4A1A), [documento alojado en Apache](https://corpora.tika.apache.org/base/docs/govdocs1/544/544653.pdf)) y de [TPX Impact](https://www.tpximpact.com/knowledge-hub/blogs/design/fidelity-in-prototyping/), que sí define niveles por dimensión.

**Niveles por dimensión (TPX Impact):**

| Dimensión | Bajo | Medio | Alto |
|---|---|---|---|
| Refinamiento visual | Bocetos a mano | Wireframes en bloques o semirrealistas | Diseño con estilo completo |
| Amplitud | Una función | Algunas | Todas |
| Profundidad | Existe la tarea, sin flujo | Algunos caminos, con pasos saltados | Camino completo |
| Interactividad | Imágenes estáticas | Responden los elementos clave de una tarea | Responde todo |
| Datos / contenido | Bloques de contenido | Etiquetas o datos de ejemplo representativos | Datos del mundo real |

TPX da tres ejemplos mixtos: wireframes detallados de pocos pasos con datos reales; contenido real en un Word; WhatsApp con contenido real para probar una app de mensajes. **Lo útil para nosotros:** el nivel se elige «según para qué se necesita el prototipo», no por costumbre. Una de las guías añade que la amplitud es cara y rara vez se prueba, así que se construye solo lo que piden las tareas.

**NN/g** ([UX Prototypes: Low vs High Fidelity](https://www.nngroup.com/articles/ux-prototype-hi-lo-fidelity/)) usa tres dimensiones (interactividad, visuales, contenido). El nivel depende de los objetivos de la prueba y de cuán completo esté el diseño. Con baja fidelidad es más fácil cambiar entre sesiones, hay menos apego del diseñador y el participante se presiona menos; con alta fidelidad el participante se comporta más como con software real.

**Qué implica para la matriz.** Cada fila debe decir *qué pregunta de la prueba* justifica ese nivel y *qué no se podrá concluir* por haberlo elegido. Las justificaciones del tipo «bajo porque son wireframes» son las que la rúbrica castiga.

## 2. Hipótesis y criterio de éxito

- **Formato de la consigna** («Creo que… logrará… en… porque… Lo sabré si…»): es una variante de la [Test Card de Strategyzer](https://www.strategyzer.com/library/validate-your-ideas-with-the-test-card), que obliga a explicitar cuatro cosas: la hipótesis (qué debe ser cierto), la prueba, la métrica y el **umbral de éxito**. La página no da consejos de redacción; lo de «falsable y numérica» es mío, no de la fuente.
- **Criterio medible** ([UX Planet](https://uxplanet.org/how-to-define-success-criteria-for-ux-research-ce0c26c63b49), [MeasuringU](https://measuringu.com/wp-content/uploads/2017/08/IntroMetrics2017.pdf)): fijar de antemano la regla de éxito, sin crédito parcial; escribirla como una acción observable («envía la evidencia») y no como un estado vago («entiende el flujo»); medir juntos éxito y tiempo, porque un éxito lento puede ser a la fuerza.
- **El hallazgo importante: con 5 personas el «80 %» no es un número preciso.** MeasuringU recomienda reportar el intervalo de confianza (Wald ajustado) y explica que 1 de 5 equivale a 2–64 %; con una referencia general de 78 % de éxito en tareas ([completion rates](https://measuringu.com/completion-rates/)). Calculé el mismo método para nuestros casos:

| Resultado | Intervalo de confianza al 95 % |
|---|---|
| 5 de 5 | 51–100 % |
| 4 de 5 | 36–98 % |
| 3 de 5 | 23–88 % |

  **Consecuencia:** la prueba con 5 personas es **formativa** (encontrar y corregir problemas), no confirma una tasa. Las hipótesis deben decir «al menos 4 de 5» como regla de decisión y el PDF debe decir que no es una estimación estadística. Esto también aplica a la OB1 del Brief de S1 (≥ 80 %).

## 3. Prompts y skill para herramientas con IA

- **[Lovable, guía de prompting](https://docs.lovable.dev/prompting/prompting-one):** estructurar por contexto (producto, audiencia, acción clave), tarea (un componente a la vez), restricciones (qué no se toca) y **estados** (vacío, cargando, fallando). Usar **contenido real**, no lorem ipsum, porque revela problemas de diseño pronto. Iterar en pasos pequeños. Guardar las decisiones estables en las instrucciones del proyecto (*Knowledge*) para no repetirlas.
- **[Figma Make, cómo escribir prompts](https://help.figma.com/hc/articles/40097793879191):** definir alcance, restricciones y estado final desde el primer prompt; acotar el contexto a marcos o archivos concretos; empezar de cero cuando el historial crece. El `guidelines.md` se lee en cada prompt; conviene un archivo madre que enlace a archivos más pequeños por tarea, sin repetir lo que ya está en otra fuente. La página **no** aclara «reglas frente a descripciones»; eso queda como criterio nuestro (reglas verificables) por la consigna.
- **Patrón útil para la sección de iteraciones:** pedir un cambio junto con el estado que falta («no cambies la estructura; agrega los estados cargando, vacío y error»).

**Qué implica:** la skill ya trae los bloques de estados y contenido real; el prompt log debe mostrar prompts de **una sola pantalla o cambio**, con lo que no se debe tocar. Nuestro primer prompt («Flujo B, empieza con la skill y la ruta») fue amplio; su contexto está en la skill. El log debe decirlo con franqueza y mostrar al menos una iteración corta y específica.

## 4. El PDF ejecutivo

No encontré un estándar; lo que hay son guías de estudios de caso de UX (por ejemplo [UXfolio](https://blog.uxfol.io/ux-case-study-structure/)) con una convergencia clara: resumen que se lee solo, problema antes que funciones, **la hipótesis explícita**, dos o tres decisiones clave con su razón, **resultado con cifras al inicio** y una imagen o video del prototipo. Que se pueda escanear: si las respuestas están enterradas, el documento no funciona.

**Qué implica:** la consigna fija el orden (hipótesis → matriz → skill → prompt log → auditoría → enlace). Antes de eso va una **ficha de una página** (qué es el producto, quién es el usuario, qué flujo se probó y por qué) para que se entienda sin abrir el prototipo, y cada sección abre con su conclusión en una línea.

## 5. Decisiones que tomo a partir de esto

1. La matriz tendrá, por fila: nivel, detalle observable, hipótesis o semana 4 a la que se conecta, y **qué no se puede concluir**.
2. Las hipótesis usan el formato exacto de la consigna y fijan «al menos 4 de 5» como regla de decisión, con la advertencia del intervalo.
3. El tiempo máximo (2 minutos) es una propuesta mía: S1 no fijó un tiempo para esta tarea (los 3 minutos de OB2 son para subir un vuelo). Va marcado como punto de partida a confirmar con la prueba.
4. La espera simulada (0,9 s por paso) se declara, porque suma a los tiempos medidos.

## Fuentes
- [McCurdy et al., resumen en Cambridge](https://www.cambridge.org/core/product/23493A4B701F93BBC2D8F4085C2C4A1A) y [documento en Apache](https://corpora.tika.apache.org/base/docs/govdocs1/544/544653.pdf)
- [TPX Impact, Fidelity in prototyping](https://www.tpximpact.com/knowledge-hub/blogs/design/fidelity-in-prototyping/)
- [NN/g, UX Prototypes: Low vs High Fidelity](https://www.nngroup.com/articles/ux-prototype-hi-lo-fidelity/)
- [Strategyzer, Test Card](https://www.strategyzer.com/library/validate-your-ideas-with-the-test-card)
- [UX Planet, Success criteria](https://uxplanet.org/how-to-define-success-criteria-for-ux-research-ce0c26c63b49) · [MeasuringU, intro to metrics](https://measuringu.com/wp-content/uploads/2017/08/IntroMetrics2017.pdf) · [MeasuringU, completion rates](https://measuringu.com/completion-rates/)
- [Lovable, prompting](https://docs.lovable.dev/prompting/prompting-one) · [Figma Make, prompts](https://help.figma.com/hc/articles/40097793879191)
- [UXfolio, estructura de un estudio de caso](https://blog.uxfol.io/ux-case-study-structure/)
