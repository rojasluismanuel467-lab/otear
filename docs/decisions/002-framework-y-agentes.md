# 002 — Framework y trabajo con agentes

Estado: Next.js 16.4.3 y HeroUI 3.2.6 instalados el 25 de octubre de 2026. MCP no configurado. Documentación local de Next.js disponible en node_modules/next/dist/docs/.

## Decisión para Otear

Next.js con App Router y TypeScript para mantener landing y demo en un proyecto, con posibilidad de incorporar funcionalidades del portal posteriormente. HeroUI es la librería visual elegida. Primero se valida el frontend; el backend será en Go y se abordará después. La elección del framework no fija por sí sola el diseño visual.

## Evidencia consultada

- [Next.js y agentes](https://nextjs.org/docs/app/guides/ai-agents): documentación correspondiente a la versión instalada, instrucciones de proyecto y herramientas para agentes. La documentación incluida se ofrece desde Next.js 16.2.
- [Next.js MCP](https://nextjs.org/docs/app/guides/mcp): desde Next.js 16, el servidor de desarrollo expone información de errores, rutas, registros y compilación mediante MCP. Requiere conectar el cliente para usarlo; no está configurado aquí.
- [HeroUI y Next.js](https://heroui.com/en/docs/react/getting-started/frameworks): integración y starter oficiales.
- [HeroUI MCP](https://heroui.com/en/docs/react/getting-started/mcp-server) y [skills](https://heroui.com/en/docs/react/getting-started/agent-skills): acceso a documentación de componentes v3, código y estilos. Son herramientas opcionales pendientes de evaluación/configuración.

Estas capacidades favorecen consultar APIs correctas y diagnosticar problemas. No prueban un ahorro concreto de tokens ni garantizan código correcto.

## Alternativas

- [Astro](https://docs.astro.build/en/concepts/why-astro/): candidato si el objetivo fuera principalmente una web de contenido. Cuenta con [documentación accesible para agentes mediante MCP](https://docs.astro.build/en/guides/build-with-ai/). Para Otear se prefiere mantener una base React compartida para landing y portal interactivo; esta es una decisión de proyecto, no una limitación general de Astro.
- [React Router en Framework Mode](https://reactrouter.com/start/modes): alternativa React con Vite, rutas tipadas, carga de datos y renderizado SPA, SSR o estático. Es viable para Otear; la recomendación Next.js prioriza su soporte documentado de diagnóstico para agentes y el encaje con los starters considerados.

## Reglas propuestas para reducir retrabajo

1. Fijar versiones compatibles y conservar un único lockfile.
2. Instrucciones breves en AGENTS.md cuando se prepare la aplicación: comandos reales, estructura y enlaces a contexto; no copiar libros ni documentación completa.
3. Cargar solo la documentación necesaria para la tarea y la versión instalada.
4. Reutilizar los controles y tokens de una colección; no mezclar sistemas por diferencias cosméticas.
5. Separar datos de ejemplo y lógica de negocio de las vistas, sin crear capas genéricas anticipadas.
6. Verificar tipos, compilación y comportamientos importantes; revisar la experiencia con teclado y en los tamaños previstos.
7. Dividir trabajo entre agentes por archivos o funcionalidades con responsabilidades claras.

## Límites

El frontend web no resuelve por sí solo sincronización offline, procesamiento geoespacial, detección de cultivos ni almacenamiento pesado. La matriz de Dorfman sigue siendo contexto provisional para esas capacidades futuras.
