# Convenciones de frontend de Otear

Estado: guía previa a implementación. Alcance: landing y demo en Next.js, React, TypeScript y HeroUI. Estas son decisiones de este proyecto; los nombres y carpetas no constituyen reglas universales de los frameworks.

## Nombres que expliquen la intención

- Identificadores de código en inglés; textos visibles del producto en español. Núcleo multisector propuesto: empresa = `company`, sitio/proyecto de operación = `site`, zona = `zone`, vuelo = `flight`, hallazgo = `finding`, informe = `report`. El nombre visible de zona se adapta: lote, tramo, frente o sector. `farm` y `plot` se reservan al contexto agrícola; no crear una copia del modelo de vuelo por industria. Confirmar la distinción entre proyecto contractual y sitio físico cuando haga falta; no crear ambos por anticipación.
- Componentes y tipos en PascalCase: `FlightGallery`, `FindingFormProps`. Archivos propios en kebab-case: `flight-gallery.tsx`, `finding-form.test.tsx`. Respetar los nombres especiales de Next.js: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`.
- Variables y funciones en camelCase: `selectedPlotId`, `formatFlightDate`. Booleanos legibles: `isLoading`, `hasPhotos`, `canSubmit`. Eventos públicos como `onSelectPlot`; manejadores internos como `handleSelectPlot`.
- Preferir nombres del dominio a `data2`, `item`, `manager`, `common` o `utils` sin propósito. Reservar MAYÚSCULAS para constantes de configuración estables; no convertir toda variable `const` en mayúsculas.

## Estructura por responsabilidad

```text
src/
  app/                         # Rutas y composición ligera
  features/
    flights/
      components/              # UI del dominio de vuelos
      demo-data.ts             # Ejemplos explícitos
      types.ts                 # Tipos propios del dominio
      format-flight-date.ts    # Función local con propósito concreto
  components/                  # UI compartida con uso real
  lib/                         # Adaptadores técnicos concretos
public/                        # Recursos públicos
```

Este árbol muestra destinos posibles; crear carpetas cuando exista contenido. Colocar tests, estilos locales y utilidades junto a su funcionalidad. Las páginas componen funcionalidades; no concentran todos los datos, filtros, formularios y estilos en un solo archivo.

Una función o componente permanece en `features/<domain>` mientras pertenezca a ese dominio. Moverlo a `components` cuando varios consumidores reales compartan el mismo comportamiento. `lib` contiene adaptadores concretos, por ejemplo formato compartido de fechas o acceso a un servicio; no es un depósito de lógica sin dueño.

Evitar dependencias circulares y acceso a archivos internos de otra funcionalidad sin una razón clara. Exportar únicamente la superficie que necesita el consumidor; no crear archivos `index.ts` masivos que reexporten toda la aplicación.

Next.js permite varias estrategias de organización; `src` es opcional y sus convenciones especiales determinan las rutas. Nuestra separación por funcionalidades es una elección mantenible para Otear. [Referencia oficial](https://nextjs.org/docs/app/getting-started/project-structure)

## React y límites de cliente

Conservar páginas y layouts como componentes de servidor por defecto. Crear límites `use client` para interactividad, estado o APIs del navegador, cerca del componente que los necesita. No marcar todo el layout como cliente para resolver una interacción local. Respetar también los límites que requiera la versión instalada de HeroUI. [Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components)

Cada componente tiene una responsabilidad comprensible: mostrar una galería, editar un hallazgo o componer una vista. Extraer componentes cuando mejore la comprensión, haya una responsabilidad distinta o reutilización real; no aplicar un límite arbitrario de líneas.

El render calcula UI a partir de props y estado; no modifica datos externos ni dispara solicitudes. Los eventos gestionan acciones del usuario. Los efectos sincronizan con sistemas externos cuando sea necesario, no duplican cálculos que pueden hacerse durante el render. Crear hooks propios cuando exista lógica con estado que merezca nombre y reutilización; no envolver cada `useState` en un hook nuevo.

Mantener el estado mínimo cerca de su consumidor. Guardar `selectedPlotId` y derivar el lote seleccionado; no mantener copias que deban sincronizarse. Calcular filtros y contadores desde datos existentes. Modelar estados excluyentes con una unión como `idle | submitting | success | error`, evitando combinaciones contradictorias de booleanos. [React: estructura del estado](https://react.dev/learn/choosing-the-state-structure)

## Tipos, datos y reutilización

Activar TypeScript `strict`; props y límites de datos deben tener tipos explícitos. No usar `any` o aserciones para silenciar problemas: usar `unknown` y validación cuando el origen sea externo. El tipado estático no valida datos de red en ejecución. `strict` incorpora comprobaciones más exigentes y futuras actualizaciones pueden descubrir nuevos errores. [TypeScript](https://www.typescriptlang.org/tsconfig/strict.html)

Separar los datos de demostración de los componentes y señalar su naturaleza simulada en el producto. No mezclar archivos de muestra con solicitudes reales. Cuando llegue una API en Go, definir su contrato y mapear sus DTO a los modelos de presentación donde haga falta; no diseñar ahora un backend imaginario.

Preferir composición y props concretas. Evitar componentes con decenas de booleanos que cubran situaciones incompatibles. Añadir una abstracción cuando resuelva duplicación o variación comprobada; no crear repositorios genéricos, motores de formularios, microservicios o un monorepo por anticipación.

Reutilizar HeroUI y los tokens acordados antes de escribir controles equivalentes. Crear un wrapper únicamente cuando codifique una regla estable de Otear; evitar envolver todos los controles sin añadir comportamiento. La reutilización del frontend web no promete reutilización automática en aplicaciones nativas ni funcionamiento offline.

## Estados y verificación

Toda vista con datos contempla carga, vacío, error y contenido; toda acción muestra su resultado y un camino de recuperación cuando falle. Una colección vacía, una búsqueda sin resultados y un fallo de carga son situaciones diferentes. Usar límites de ruta de Next.js cuando correspondan y estados locales para acciones locales.

Verificar cambios con tipos, lint y build disponibles. Añadir pruebas para comportamiento material: seleccionar lote y conservar contexto, filtrar vuelos, validar formularios, guardar hallazgos y recuperarse de un error. No crear snapshots triviales de estilos ni tests que repitan la implementación. Revisar teclado, foco, legibilidad, móvil y movimiento reducido cuando la interacción cambie.

No introducir dependencias para tareas que resuelvan la plataforma o las herramientas ya adoptadas. Registrar nuevas dependencias y decisiones que cambien convenciones, junto con su motivo y alcance. Actualizar el lockfile cuando se instalen paquetes; no instalar durante una tarea de documentación.

## Contexto breve para agentes

Antes de editar: leer la tarea, esta guía y las decisiones aplicables; localizar la funcionalidad con `rg` y abrir los archivos necesarios. Trabajar sobre un recorrido acotado, reutilizar sus componentes y evitar cambios de estilo fuera de alcance. Al entregar: explicar comportamiento cambiado, archivos relevantes, verificaciones y limitaciones. Actualizar la decisión correspondiente si se modifica una regla, sin copiar toda la documentación en cada archivo.
