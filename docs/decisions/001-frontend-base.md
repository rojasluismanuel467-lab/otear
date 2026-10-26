# 001 — Base del frontend

Estado: decisión aceptada e instalada el 25 de octubre de 2026: Next.js 16.4.3 + HeroUI 3.2.6, React 19 y Tailwind 4. Las versiones exactas se conservan en package.json y package-lock.json. Las alternativas siguientes se conservan como antecedentes.

## Objetivo

Reducir retrabajo entre landing, demo y una posible aplicación funcional, manteniendo pequeña la primera entrega. La reutilización futura es una intención; el backend y los procesos geoespaciales requieren decisiones propias cuando se validen.

## Alternativas consultadas

| Base | Encaje | Consideración |
| --- | --- | --- |
| [Bloques oficiales shadcn/ui](https://ui.shadcn.com/blocks) | Incorporación selectiva de componentes React y estructuras de navegación | Recomendación inicial. La landing y las vistas agrícolas necesitan composición propia. |
| [TailAdmin para Next.js](https://github.com/TailAdmin/free-nextjs-admin-dashboard) | Dashboard completo como punto de partida | Evaluar cuánto código de ejemplo habría que retirar y su coherencia con la landing. |
| [Next shadcn dashboard starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) | Starter de aplicación con más integraciones | Revisar dependencias y servicios requeridos antes de adoptarlo para una demo pública. |

La comparación se basa en las páginas de sus proyectos, no en una auditoría técnica ni visual completa.

## Base seleccionada

Next.js con App Router, TypeScript estricto, Tailwind CSS y HeroUI. Utilizar los componentes y tokens de HeroUI como base común de landing y demo; no incorporar otra familia de controles por diferencias cosméticas. Fijar versiones compatibles al instalar y guardar un único lockfile. Ver la [investigación previa](../../reports/Base%20visual%20para%20Otear.md) y la [guía UX](../UX_GUIDELINES.md).

La selección es de la librería HeroUI; no autoriza comprar HeroUI Pro ni incorpora automáticamente una plantilla premium. La dirección visual conserva sombras suaves, formas redondeadas y suficiente jerarquía para fotos, lotes y tareas.

## Desarrollo por etapas

Primero frontend y validación de landing/demo con datos sintéticos. Backend en Go después de la validación, con diseño de API y arquitectura pendientes para esa etapa. Mantener separados datos de ejemplo y vistas para facilitar la integración posterior, sin diseñar servicios ni contratos especulativos ahora.

## Criterios de selección visual y técnica

1. La demo prioriza fotografías, lotes y comparación; un dashboard de métricas genéricas no define la experiencia.
2. Navegación por teclado, foco visible, etiquetas de formularios y contraste deben comprobarse en el resultado integrado.
3. Landing adaptable a móvil y escritorio. Demo centrada en escritorio con una alternativa usable en móvil.
4. Tokens compartidos para color, tipografía, espaciado, radios y estados. Elegir una referencia visual antes de extender estilos.
5. Licencia compatible con uso comercial y conservación de los avisos exigidos, verificada para los recursos efectivamente incorporados.
6. Evitar servicios obligatorios, dependencias de pago y módulos ajenos al alcance.
7. Carga inicial contenida: cargar elementos pesados de la demo cuando se necesiten.

## Estructura prevista

```text
src/app/                 Rutas públicas y demo
src/components/ui/       Primitivas de la familia elegida
src/components/          Composición compartida
src/features/            Funcionalidades con UI y lógica propias
src/data/demo/           Escenario sintético coherente
src/lib/                 Utilidades e integraciones concretas
docs/decisions/          Decisiones y motivos
```

Los datos de muestra deben quedar fuera de los componentes. Crear límites de acceso a datos solo donde sean necesarios; no anticipar una plataforma de plugins, microservicios ni repositorios genéricos.

## Condiciones para empezar pantallas

- Seleccionar una referencia visual de landing y una de demo que compartan lenguaje visual.
- Acordar el recorrido y las funcionalidades simuladas.
- Instalar la base, comprobar compilación y guardar las versiones.

## Validación por entrega

Compilación, tipos y lint cuando estén configurados. Verificación del recorrido principal y de los estados de formulario. Una revisión conjunta en escritorio y móvil; corregir defectos encontrados y confirmar. Añadir pruebas automatizadas para comportamiento significativo, sin pruebas que solo repitan markup o estilos.
