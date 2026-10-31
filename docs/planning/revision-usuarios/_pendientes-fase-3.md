# Pendientes tras la tercera pasada (31 de octubre de 2026)

Rama `revision-fase-3` (sale de `main` = `origin/main` en `3b3350b`). **No está mezclada en `main`, no se hizo push ni se publicó.** Reemplaza a `_pendientes.md`. Los informes de las personas simuladas (`fase-3/`) son hipótesis, no usuarios.

## Hecho en esta ronda
- **Pendiente 1 (V-03, V-07):** la primera pantalla de la landing trae el panel «Así se ve antes de pagar, en una hacienda» (cifras de ejemplo de la propia demo; en móvil queda bajo el titular y «Otear no hace los vuelos»). Línea de contacto en el hero; «Quién está detrás» solo aparece cuando haya texto del dueño (`behindOtear` en `landing/example-case.ts`).
- **Decisiones del dueño aplicadas:** sin vista propia del operador (nota «por definir» en Equipos, Pagos, Informes y Documentos); ilustraciones propias rotuladas en vez de foto para carreteras, construcción, minería y vigilancia; firma sin verificación de identidad (el texto lo dice); conteo de visitas opcional con Cloudflare Web Analytics; campos de caña (edad y corte) en el preset «Caña de azúcar».
- **Tercera pasada de las cinco personas** y sus arreglos: ver `_fase-3.md`, `fase-3/*.md` y `_fase-3-arreglos.md` (cinco lotes: vocabulario y sectores, evidencia y semillas, móvil y landing, firmas y documentos, medidas y operador).
- **Mantenimiento:** acciones de GitHub con Node 24 (`checkout@v7`, `setup-node@v7`, `wrangler-action@v4`; no se pudo probar el despliegue porque no se hizo push); ramas y worktrees ya integrados borrados.
- Verificación: `npm run check` limpio, `npm test` 340 en verde, `npm run build` correcto y sin `.glb` en `out/`, capturas a ojo de landing (escritorio y móvil) y Vuelos en móvil.

## Para decidir (dueño)
1. **Quién está detrás de Otear:** falta el texto (nombre y contexto). Hasta entonces el hero dice solo «Contacto».
2. **Token de Cloudflare Web Analytics:** crear el sitio en Cloudflare y cargar `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` como variable en GitHub. Sin token no se mide nada. Cuenta visitas, no clics ni envíos.
3. **Cierre de una medida (I3-02 / I2-03):** exigir «verificado por» y evidencia, y no cerrar sobre algo sin confirmar. Cambia el modelo de seguimiento.
4. **Edad y corte por suerte (N3-03):** hoy son un solo valor por vuelo; por suerte exigiría un tipo de registro nuevo.
5. **Palabra de `owner` en vías** («Propietario · Interventoría Vial» en «Ver como»): ¿«Contratante» o «Titular»?
6. **«Uso típico» de los equipos** no incluye vigilancia (qué sectores se anuncian por equipo).
7. Tope de rondas de una disputa; topes de cordura del precio ($10.000.000/ha, $50.000.000/vuelo): sin respuesta, siguen como están.
8. Si se quiere publicar: `git merge revision-fase-3` en `main` y push (dispara el despliegue); construir antes desde copia limpia y comprobar que `out/` no tiene `.glb`.

## Pendiente técnico (sin hacer)
- `billing/readiness.ts:64` («Los hallazgos del vuelo están revisados») y `services/workflow.ts:28` («Monitoreo del cultivo» en todos los sectores; «Área pedida» en servicios por vuelo): vocabulario fijo.
- Textos fijos con «lotes» en `demo-data.ts` («Comparar el estado de los lotes…», «Seguimiento del Lote 4») con el preset de caña.
- `flight-report.tsx:414` («las hectáreas cubiertas…» en una vía).
- V3-06/V3-07: aviso de bienvenida largo en móvil, «Vuelos y evidencias» frente a «Archivo de vuelos», nombres de sector distintos entre chip y barra (`entry/entry.ts`, `app-shell.tsx`).
- N3-07: Informes en móvil abre con los vuelos; abrir por defecto en otra pestaña y renombrar «Informe» a «de todo el periodo».
- El botón «Revisar N hallazgos» del mapa de Vuelos tapa parte del rótulo de ubicación en escritorio.
- Evolución: línea por banco con los m³ de la mina (`evolution/narrative.ts`).
- Verificar con ojo lo que los agentes no vieron: Servicios como operador, Documentos en móvil, Evolución e Informes en escritorio tras los cambios de CSS móvil, teclado y movimiento reducido.
- Prueba con personas reales: guion y hoja en `docs/planning/prueba-con-personas.md` y `.csv`; las pasadas simuladas no la reemplazan.
- Despliegue: `otear.app` no resolvía desde la máquina de desarrollo (conectar el dominio en Cloudflare Pages > Custom domains); `ubuntu-latest` migra solo a Ubuntu 26.

## Recomendaciones anotadas (31 de octubre de 2026, tras publicar)

**Estado de la publicación:** `revision-fase-3` está en `main` (`7a3b029`) y publicada en https://otear.pages.dev/. El token de Cloudflare Web Analytics (`NEXT_PUBLIC_CF_ANALYTICS_TOKEN`, variable de GitHub Actions) ya está cargado y el contador se carga en la landing. Ojo: el sitio de Web Analytics está registrado para `otear.app`, pero la página se sirve hoy desde `otear.pages.dev` (el dominio no resuelve): si no aparecen visitas en Cloudflare, falta conectar `otear.app` en Pages > Custom domains o crear otro sitio de Web Analytics para `otear.pages.dev` y cambiar el token. Mide visitas y origen, no clics ni envíos del formulario.

**Sesión de mejora de la interfaz (la interfaz «se ha vuelto pesada»).**
1. Medir antes de quitar: Lighthouse y el rendimiento de la landing y de 2–3 pantallas (Vuelos, Evolución) en escritorio y móvil, para saber si «pesada» es peso real (WebGL, mapas, fondo desenfocado, avión, cursor) o densidad visual. La landing creció ~3 % en escritorio y ~6 % en móvil en esta ronda (V3-09) y mide unos 9.000 px (V2-02).
2. Candidatos a aligerar, sin decidir por el dueño: el fondo fijo desenfocado con grano de la landing, el cursor-dron y el avión, los paneles de cristal (`backdrop-filter`) apilados, los tres bloques de «ejemplos de uso» y «A su medida» que repiten el mensaje, y las barras de avisos y tarjetas flotantes (`DemoInvite`, bienvenida). Quitar 3D, galería o simulación (N-12) es decisión de producto del dueño.
3. Reglas que no se rompen: piso de 12 px, contraste 4,5:1, `prefers-reduced-motion`, un solo `h1` por ruta, honestidad de demo («de ejemplo», «Otear no presta vuelos»), vocabulario por `useTerm()`. Ver `DESIGN.md` y `docs/UX_GUIDELINES.md`.
4. Automatizar el «embellecido»: ya están instaladas la habilidad `impeccable` (pulir, destilar, optimizar, adaptar, accesibilidad, rendimiento; ejecutar por pantalla o por sección, pidiendo antes la dirección de diseño), `design:design-critique` y `design:accessibility-review`, las de `chrome-devtools-mcp` (auditoría Lighthouse, LCP, accesibilidad) y las del proyecto `.agents/skills/otear-product-design` y `otear-reviewer`. Del catálogo (sin instalar): `frontend-design` (Anthropic), `audit-suite` (comunidad: auditorías de diseño, UX, rendimiento y accesibilidad) y `ui-consistency` (comunidad; trae un gancho de inicio de sesión: revisar antes de instalar). Recomendación: empezar con lo ya instalado; un solo agente por pantalla, en su worktree, con `npm run check` y `npm test` antes de cada commit y revisión a ojo en escritorio y móvil.
5. Patrón que funcionó en esta ronda: personas simuladas → informes → lotes con archivos disjuntos → un commit por hallazgo → integración en una rama → verificación → publicar solo cuando el dueño lo pide.

**Otras recomendaciones**
- Conectar `otear.app` en Cloudflare Pages (Custom domains) y volver a correr el despliegue.
- Mantener cifras de `landing/example-case.ts` alineadas con las semillas si estas cambian.
- Hacer la prueba con personas reales antes de otra ronda de hipótesis (`docs/planning/prueba-con-personas.md`).
- Dar el texto de «Quién está detrás» (`behindOtear`) para que el hero deje de decir solo «Contacto».
