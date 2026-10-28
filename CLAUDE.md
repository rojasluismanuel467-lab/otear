# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read first

`AGENTS.md` is the authoritative brief (scope, authorized work, file-ownership rules between agents). Before any UI/UX/iconography/imagery decision, apply the project skill `.agents/skills/otear-product-design/SKILL.md`. Then read only the relevant sections of `docs/UX_GUIDELINES.md`, `docs/MOTION_GUIDELINES.md`, `docs/FRONTEND_CONVENTIONS.md`; `PRODUCT.md` (authorized capabilities) and `DESIGN.md` (visual language) bound what screens may exist. When planning modules, also read `docs/context/alcance-multisector-y-feedback.md` and the matching file in `docs/planning/`.

Hard scope limits:

- Frontend-only validation demo with **synthetic** data. Do not build the Go backend, real ingestion/analysis/storage/sending, auth, or payments. Never present a simulation as real (the UI already says so, e.g. "Pago registrado solo en esta demo").
- Multisector (agricultura, carreteras, construcción, vigilancia). The agro lote → vuelo → comparación → observación → informe flow is one scenario, not the core model.
- `docs/context/matriz-dorfman-provisional.md` is provisional; the GPS-less photo policy and "G6" are unresolved — don't resolve them silently.
- Recurrence, urgent requests, packages and advisory are proposals to validate, not features to build. No landing page exists yet.

## Commands

Node 22, npm, committed `package-lock.json`.

```bash
npm ci
npm run dev             # Turbopack; use dev:webpack / build:webpack if Turbopack hits a port restriction (sandbox)
npm run check           # next typegen + tsc --noEmit, eslint --max-warnings=0, prettier --check
npm test                # unit tests of the pure logic
npm run build
npm run format          # prettier --write (src, root *.ts/json/mjs)
```

`npm test` runs `src/**/*.test.ts` with the Node test runner (`scripts/run-tests.mjs` compiles them first because this Node has no TypeScript support). Test files import siblings with a `.ts` extension and must not use the `@/` alias or React; keep tested logic in pure modules (`geo.ts`, `insights.ts`, `integrity.ts`, `billing/*.ts`). Add behavior tests only for material behavior; no placeholder suites or markup snapshots.

## Architecture

Next.js 16.4.3 (App Router), React 19, TypeScript strict, Tailwind 4, HeroUI 3 (global CSS, no provider), Leaflet, Lucide. `@/*` → `src/*`. Next.js here differs from older versions: check `node_modules/next/dist/docs/` before non-trivial framework work. `next dev` rewrites the "NOT the Next.js you know" block in `AGENTS.md`; commit it with your diff rather than reverting.

**Routing.** `/` just redirects to `/programacion`. All screens live under the `src/app/(workspace)/` route group (`programacion`, `vuelos`, `mapa`, `evolucion`, `equipos`, `informes`, `pagos`, `documentos`); its `layout.tsx` wraps them in `DemoProvider` + `AppShell`. Page files are thin and only render one feature view (e.g. `vuelos/page.tsx` → `FlightReviewView`).

**Shared demo state — the key cross-file concept.** `src/features/demo/demo-context.tsx` is a single client-side store (`useDemo()`) holding sites, flights, findings, invoices, payments, documents, selected site/flight, and a `notice` toast message. Every module reads and mutates through it, so a flight scheduled in `programacion` appears in `vuelos`, `pagos` and `documentos`. Things to know:

- Collections are filtered by the selected `siteId` before being exposed; `payments` is not.
- Changing site resets `selectedFlightId` to `flight-${siteId}-01` — seed data must keep that id convention.
- State is in-memory only; `resetDemo()` restores `demo-data.ts`. Nothing persists across reloads.
- Types (`Site`, `Zone`, `Flight`, `Finding`, `Invoice`, `Payment`, `FlightDocument`) are in `features/demo/types.ts`; sector-specific naming comes from data (`Site.zoneLabel`, `sectorLabel`), not from forked models. Add new shared entities there rather than in a module.
- Mutations that must not rewrite identity (`id`, `siteId`, `flightId`) are guarded inside the update functions — preserve that when adding new ones.

**Features vs shared UI.** Domain UI lives in `src/features/<domain>/` (`flights/planning`, `flights/review`, `billing`, `compliance`), each view next to its CSS module. `src/components/` holds only genuinely shared pieces (`app-shell`, `drone-preview`, `maps/`, `ui/`). `src/lib/format.ts` holds shared formatters. Promote code to `components/` only when several consumers exist.

**Modules added after the first four.**

- `mapa` (`features/sites/mapping/`): wizard that proposes a site outline (flight history, KML/GeoJSON, deed area, LiDAR `.las` header, hand drawing) and splits it into zones (equal parts, by flights via k-means + Voronoi, by production CSV, by levels, by chainage). Roads are a polyline split by PK; other sectors are polygons. `replaceZones` in `demo-context` re-links flights and findings by geometry. The geometry lives in `src/lib/geo.ts`.
- `informes` (`features/reports/`): history and insights computed only from session data (`insights.ts`), plus a consolidated text report.
- Traceability (`features/traceability/`): document templates with auto-fill, SHA-256 fingerprints, signatures that become invalid when content changes, and per-item evidence in the pre-flight list (`requirements.ts` maps items to evidence). Items and their labels in `preparation-items.ts` are stored by flights, keep them stable.
- Pagos automation (`features/billing/`): reads UBL electronic-invoice XML, reconciles a bank CSV, and a "before paying" list (`readiness.ts`). Nothing is sent anywhere.

**Layout language.** All four modules share one pattern: a textured rail of rows (`.rail-panel` in `globals.css`; flights use `features/flights/flight-timeline.tsx`, Pagos and Documentos have their own row lists) beside the map/detail, instead of stacked cards or tables. The drone sits in a dark-green "hangar" panel (`DronePreview tone="dark"`). Topographic textures are static SVGs in `public/textures/`. Motion is CSS-only (exponential ease-out, stagger via `--i`).

**Drone 3D.** `components/drone/` renders a procedural quadcopter with `three` (the one extra dependency, lazy-loaded via `next/dynamic`; no animation library). Drag/inertia/keyboard live in `drone-scene.tsx`, geometry in `drone-model.ts`. Four generic aircraft families (`DroneKind`: compact, enterprise, sprayer, fixed-wing) switch live from `features/flights/planning/drone-hangar.tsx`; the labels and equipment-name mapping live in `features/drones/drone-catalog.ts`. It falls back to a text message when WebGL is unavailable. It also loads four official DJI CAD models converted to GLB (`public/models/dji/`, listed in `djiOptions`). Their licence is UNRESOLVED: do not publish or redistribute them; see `docs/context/investigacion-listas-informes-modelos-3d.md` (also covers how they were converted). Research behind reports, itinerary, payments and signatures: `docs/context/investigacion-reportes-itinerario-pagos.md`.

**Evolución (`/evolucion`, the product differentiator).** `features/evolution/`: `evolution.ts` (pure, tested: `buildCaptures` from completed flights' `Flight.capture`, plan vs actual via `Site.schedule`, pace/projection, stalled zones, sustained NDVI declines, comparison reliability from `Flight.log`), `narrative.ts` (plain-language reading), `line-chart.tsx` (SVG, table fallback), `evolution-view.tsx` (time rail + slider/play + compare; per-sector visual). The building is `components/evolution/building-scene.tsx` (schematic three.js, not a reconstruction); roads/agro/security colour `ParcelMap` zones through `zoneColors`. Values are seeded in `demo-data.ts` (`captureSeries`). Concept and what real data would need: `docs/context/evolucion-en-el-tiempo.md`. For construction sites the stage can show a survey file per capture date (LAS, XYZ, GLB, OBJ, PLY) read in the browser (`components/evolution/model-loader.ts`, pure parsers and the deliverables table in `features/evolution/point-cloud.ts`); everything else is refused with advice. What surveys deliver and what is supported: `docs/context/entregables-levantamiento-obra.md`.

**Fleet (`/equipos`).** `features/fleet/`: `fleet.ts` holds the maintenance logic (plans by hours/months, battery cycles, alerts, airworthiness, costs, pilot summaries); aircraft, batteries and maintenance live in `demo-context`; flights reference `aircraftId`. Part condition on a 3D model: `fleet/condition-map.tsx` (UI) + `components/drone/condition-scene.tsx` (three.js). Marks (`PartMark`, `demo-context` `partMarks`) store a point in the model's own coordinates plus the `modelKey` they were placed on; the scene paints a coloured spot per mark with a patched `MeshStandardMaterial` (`onBeforeCompile`, up to 24 marks) so it works on any mesh granularity, including user-loaded `.glb` scans (read locally via object URLs, kept per aircraft in a module-level map, never uploaded). Open "Cambiar" marks raise a danger alert in `aircraftAlerts`; seeded points were picked on the DJI GLBs, so changing those models invalidates them. Marks store a part id from `fleet/parts-catalog.ts` (manufacturer names from the manuals, free-licence names for generic aircraft; anchors in `parts-anchors.ts` are approximate and in the model's own coordinates, front toward -z, which is why the M350 spec has `yaw: Math.PI`). DJI manuals are not free-licensed: only names and diagram numbers are cited. Sources, what is official vs my translation, and the per-model maintenance intervals found: `docs/context/nomenclatura-partes-aeronaves.md`. Clicking the model selects a part (name label + painted area, `PartCard`); marking a condition is a separate action. The usage heat map (`parts-usage.ts`, `usage-panel.tsx`) is computed from logged hours, flights and battery cycles since each part's last service against the aircraft's own plan intervals (flight-driven parts assume 1.5 flights/hour); colours are relative between the parts shown on the model. `MaintenanceRecord.partId` restarts a part's count.

**Configuración por empresa (`/configuracion`).** `features/config/`: `config.ts` (pure, tested) holds `CompanyConfig` (vocabulary, module names/order/visibility, brand colour/logo), `term()`/`moduleLabel()`/`visibleModules()` fall back to the product's own words, `accentTokens()` rejects colours below 4.5:1 against white, `validateConfig()` cleans imported files; `licence.ts` gates layers by plan (base/pro/enterprise are examples); `presets.ts` are sector starting points; the store is `localStorage` via `useSyncExternalStore` (`config-store.ts`, `use-config.ts`). New copy that should be renameable goes through `useTerm()` / `useModuleTitle()`. The plan is only a demo switch: real licence checks must run on a server. Custom fields are built (`custom-fields.ts` pure rules: types text/paragraph/number/list/date, type immutable after creation, archive instead of delete when in use, 15 per record kind, options in use can't be removed; `custom-fields-admin.tsx` in Configuración > Campos propios; `CustomFieldsPanel` renders them on flights, findings, aircraft and invoices, values in `customValues` on those records). Fields are not yet assigned per type/category, not in exports, and the demo starts on the Empresarial plan. Add-ons are NOT built. Model and sources: `docs/context/modelo-de-personalizacion.md`, `docs/context/personalizacion-por-empresa.md`.

**Maps.** `components/maps/site-map.tsx` is the public wrapper; it loads `site-map-canvas.tsx` (Leaflet, imperative `useEffect` setup) through `next/dynamic` with `ssr: false`. Tiles come from OpenStreetMap, so the map is the one place the demo makes an external network request. Map imagery/weather/drone visuals are illustrative, not real captures.

**Styling.** Tokens (`--accent`, `--background`, `--muted`, `--border`, `--otear-shadow`, etc.) are defined once in `src/app/globals.css`, which also holds the shared hand-written classes (`.button--primary`, `.status-badge--*`, `.nav-item--active`, keyframes, breakpoints at 1100/800px). Feature-specific layout goes in the feature's `*.module.css`. Reuse HeroUI and these tokens before adding variants; no extra animation library. Honor `prefers-reduced-motion`. Sample images are in `public/images/` and are illustrative.

## Gotchas found while testing

- **HeroUI `Modal` animations:** react-aria waits for the backdrop/container CSS animations before mounting/unmounting and silently gets stuck (dialog stays open after Escape/Cancel/save). `globals.css` therefore sets `animation: none` on `[data-slot="modal-backdrop"|"modal-container"]` and animates entry on `[data-slot="modal-dialog"]` instead. Keep new overlay animations on inner elements, not those two.
- **Focus after closing a controlled modal:** react-aria doesn't restore focus to the trigger when the button doesn't take focus on press; `scheduling-view.tsx` refocuses it explicitly (`handleOpenChange`).
- **Map in dialogs:** `.site-map` has a fixed height; inside a smaller container override it (see `.formMap` in `scheduling-view.module.css`) or the edit controls get clipped.
- **WebGL in the in-app browser is disabled**, so the 3D drone only shows its fallback there. To see it, drive headless Chromium from `~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome` over CDP with `--use-angle=swiftshader --enable-unsafe-swiftshader`.
- **HeroUI `Tabs.Tab` is `w-full`:** don't put `flex-wrap` on `Tabs.List` or every tab takes its own row; use `width: auto` on the tabs (see `flight-review.module.css`).
- **Type floor is 12px** (the primary user is a 56-year-old on a desktop); don't reintroduce 8–11px text.
- **Verification:** `npm run dev`/`dev:webpack` often already runs on :3000 (check `ss -ltnp`); don't run `npm run build` against a live dev server without checking it still responds. In the in-app browser, HeroUI buttons ignore JS `.click()` (use real clicks) and screenshots may not paint portals — confirm with DOM queries.

## Conventions that aren't obvious from the code

- Identifiers in English, user-facing copy in Spanish (`es-CO`, plain producer language). Core names: `company`, `site`, `zone`, `flight`, `finding`, `report`; `farm`/`plot` only for agro-specific context.
- Keep pages/layouts as server components; place `use client` at the narrowest interactive component. Model mutually exclusive UI states as a union type, not boolean combos.
- Every data view needs loading/empty/error/content states; every action needs a visible result and recovery path.
- When several agents work in parallel, they own distinct files; shared changes (tokens, `demo-context`, `types.ts`, `globals.css`) go through the integrator. Verify the changed flow on desktop and mobile, keyboard, and reduced motion, then run `npm run check`.
- WCAG 2.2 AA is the target; never claim certification.
- Screen organisation: one primary object per page (big, first), master → detail in `components/ui/stage-drawer.tsx`, at most four peer tabs via `components/ui/section-tabs.tsx` (critical alerts stay visible outside tabs), long or secondary text in `<details>`. Reasoning and sources: `docs/context/organizacion-de-pantallas.md`.

**Pre-flight checklist.** `features/flights/planning/preparation-items.ts` defines 15 items in 5 groups. `Flight.checklist` stores completed item labels, so the seeded labels in `demo-data.ts` must keep matching those strings.

## Project background outside the repo

The course deliverable `~/Downloads/Otear_Entrega_Prototipo_Baja_Fidelidad_LUIS ROJAS.pdf` (Icesi prototyping, 44 pp.) holds the persona (Hernando, 56, Hacienda Santa Rita), validated IA (7 sections: Inicio, Vuelos y fotos, Lotes, Hallazgos, Labores y tareas, Programar, Informes y cifras), pain points PP1–PP4 and the 15 low-fi screens. The current demo's 4 tabs (Programación, Vuelos, Pagos, Documentos) do not match that IA yet; don't reconcile them without the user's decision.

## Stale docs

`README.md` still says the root route returns `null` and that no screens exist; the code now has the four workspace modules above. Trust the code, and update the README when touching it.
