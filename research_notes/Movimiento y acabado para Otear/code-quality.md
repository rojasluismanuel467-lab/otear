# Calidad y convenciones de frontend

## ¿Qué estructura respalda Next.js?

### Takeaway
Next.js define convenciones de rutas y permite diferentes organizaciones del resto del código. La separación por funcionalidades de Otear es una decisión local, no un requisito del framework.

### Cited Findings
- `src` es opcional. `page`, `layout`, `loading` y `error` tienen significado específico; se puede colocar código junto a rutas sin exponerlo automáticamente como página. — [Estructura oficial](https://nextjs.org/docs/app/getting-started/project-structure)
- Páginas y layouts son Server Components por defecto; estado, eventos y APIs del navegador justifican Client Components. `use client` establece un límite del grafo de módulos. — [Servidor y cliente](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### Inferences
- `app` ligero, `features` con dominio y datos de ejemplo, componentes compartidos por uso real y `lib` para adaptadores concretos. Evitar convertir toda la aplicación en cliente por comodidad.

### Gaps
- Estas páginas no prescriben kebab-case, arquitectura feature-first ni patrón de repositorios. No atribuirles esas decisiones locales.

## ¿Qué reglas reducen errores de estado y tipos?

### Takeaway
Menos estado duplicado y tipos estrictos facilitan cambios pequeños sin crear sincronización adicional.

### Cited Findings
- React recomienda agrupar estado relacionado y evitar contradicciones, redundancia, duplicación y anidación profunda. Los valores calculables desde props/estado no necesitan guardarse como estado adicional. — [React](https://react.dev/learn/choosing-the-state-structure)
- `strict` activa una familia de comprobaciones; futuras versiones pueden añadir más exigencia. — [TypeScript](https://www.typescriptlang.org/tsconfig/strict.html)

### Inferences
- Guardar identificadores seleccionados y derivar entidades; uniones para estados excluyentes; props tipadas y validación de datos externos. Conservar render sin efectos externos y hooks propios solo cuando aporten una responsabilidad con estado comprensible.

### Gaps
- Investigación acotada a cuatro páginas oficiales. No se auditó configuración, dependencias ni código de aplicación. Las recomendaciones de efectos/hooks no se investigaron en una página adicional; se consignan como convenciones del proyecto.

## ¿Cómo aplicar esto sin sobrearquitectura?

### Takeaway
La guía práctica quedó en `docs/FRONTEND_CONVENTIONS.md`; se centra en landing y demo, preparada para futuras integraciones sin diseñarlas por anticipación.

### Cited Findings
- Las convenciones oficiales de rutas y límites de render permiten mantener composición y partes interactivas diferenciadas. — [Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### Inferences
- Nombres de código en inglés y contenido en español; funciones y tests colocados junto a su dominio; separación de muestras y datos reales; evitar wrappers universales, repositorios genéricos y nuevas dependencias sin una necesidad concreta.
- Validar comportamiento relevante, tipos, lint/build y estados de error/carga/vacío. No crear tests triviales de estilo ni prometer reutilización nativa/offline del frontend web.

### Gaps
- Faltan implementación y herramientas instaladas: no se ejecutaron checks ni se prescribieron comandos que todavía no existen.
