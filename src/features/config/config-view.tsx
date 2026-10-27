"use client";

import { useRef, useState } from "react";
import { Button } from "@heroui/react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  Lock,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { SectionTabs } from "@/components/ui/section-tabs";
import { downloadText } from "@/lib/format";
import {
  accentTokens,
  contrast,
  moduleDefs,
  moveModule,
  termDefs,
  validateConfig,
  type ModuleId,
  type PresetId,
  type TermKey,
} from "./config";
import {
  can,
  featureLabels,
  plans,
  planFor,
  type Feature,
  type PlanId,
} from "./licence";
import { applyPreset, presets } from "./presets";
import { useConfig } from "./use-config";
import styles from "./config-view.module.css";

const swatches = [
  "#1c6f8d",
  "#2a5d8f",
  "#46508f",
  "#7a4f8f",
  "#a04a5c",
  "#b5651d",
];
const MAX_LOGO_KB = 150;

function Locked({ feature }: { feature: Feature }) {
  const plan = planFor(feature);
  return (
    <p className={styles.locked} role="note">
      <Lock size={15} aria-hidden="true" />
      Disponible desde el plan {plan?.name ?? "Empresarial"}.
    </p>
  );
}

export function ConfigView() {
  const { config, update, setConfig, reset } = useConfig();
  const [tab, setTab] = useState("brand");
  const [message, setMessage] = useState<{
    tone: "ok" | "error";
    text: string;
  } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const allowed = (feature: Feature) => can(config.planId, feature);

  function exportConfig() {
    downloadText(
      "otear-configuracion.json",
      JSON.stringify({ ...config, planId: undefined }, null, 2),
    );
    setMessage({
      tone: "ok",
      text: "Configuración exportada. No incluye el plan, que lo fija la licencia.",
    });
  }

  async function importConfig(file?: File) {
    if (!file) return;
    try {
      const result = validateConfig(JSON.parse(await file.text()));
      if (!result.ok) return setMessage({ tone: "error", text: result.error });
      setConfig({ ...result.config, planId: config.planId });
      setMessage({ tone: "ok", text: "Configuración importada." });
    } catch {
      setMessage({
        tone: "error",
        text: "No se pudo leer el archivo. Debe ser un .json exportado desde Otear.",
      });
    }
  }

  return (
    <div className={styles.view}>
      <PageHeading
        title="Configuración"
        description="Adapte Otear a cómo habla y trabaja su empresa. Los cambios se ven de inmediato en todo el menú."
        actions={
          <div className={styles.actions}>
            {allowed("exportImport") && (
              <>
                <Button variant="secondary" onPress={exportConfig}>
                  <Download size={16} aria-hidden="true" />
                  Exportar
                </Button>
                <Button
                  variant="secondary"
                  onPress={() => importRef.current?.click()}
                >
                  <Upload size={16} aria-hidden="true" />
                  Importar
                </Button>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={(event) => {
                    void importConfig(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </>
            )}
            <Button variant="ghost" onPress={reset}>
              <RotateCcw size={16} aria-hidden="true" />
              Restablecer
            </Button>
          </div>
        }
      />
      {message && (
        <p className={styles.message} data-tone={message.tone} role="status">
          {message.tone === "ok" ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <X size={16} aria-hidden="true" />
          )}
          {message.text}
        </p>
      )}
      <section className={`surface ${styles.surface}`}>
        <SectionTabs
          label="Qué personalizar"
          selectedKey={tab}
          onSelectionChange={setTab}
          tabs={[
            {
              id: "brand",
              label: "Empresa y marca",
              content: renderBrand(),
            },
            {
              id: "terms",
              label: "Vocabulario",
              content: renderTerms(),
            },
            {
              id: "modules",
              label: "Módulos",
              content: renderModules(),
            },
            {
              id: "licence",
              label: "Licencia",
              content: renderLicence(),
            },
          ]}
        />
      </section>
    </div>
  );

  function renderBrand() {
    const branding = allowed("branding");
    const tokens = accentTokens(config.company.accent);
    const ratio =
      config.company.accent && /^#[0-9a-f]{6}$/i.test(config.company.accent)
        ? contrast(config.company.accent, "#ffffff")
        : null;
    return (
      <div className={styles.panel}>
        {!branding && <Locked feature="branding" />}
        <label className={styles.field}>
          <span>Nombre de la empresa</span>
          <input
            className="field-input"
            value={config.company.name}
            maxLength={80}
            disabled={!branding}
            placeholder="Por ejemplo: Hacienda Santa Rita"
            onChange={(event) =>
              update((c) => ({
                ...c,
                company: { ...c.company, name: event.target.value },
              }))
            }
          />
          <small>Aparece en el menú junto al logo.</small>
        </label>

        <div className={styles.field}>
          <span>Logo</span>
          <div className={styles.logoRow}>
            {config.company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.company.logo}
                alt="Logo de la empresa"
                className={styles.logo}
              />
            ) : (
              <span className={styles.logoEmpty}>Sin logo</span>
            )}
            <label className={styles.fileButton} aria-disabled={!branding}>
              <Upload size={15} aria-hidden="true" />
              {config.company.logo ? "Cambiar logo" : "Subir logo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                disabled={!branding}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  if (file.size > MAX_LOGO_KB * 1024) {
                    return setMessage({
                      tone: "error",
                      text: `El logo pesa más de ${MAX_LOGO_KB} KB. Use una versión más liviana.`,
                    });
                  }
                  const reader = new FileReader();
                  reader.onload = () =>
                    update((c) => ({
                      ...c,
                      company: { ...c.company, logo: String(reader.result) },
                    }));
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {config.company.logo && (
              <Button
                variant="ghost"
                onPress={() =>
                  update((c) => ({
                    ...c,
                    company: { ...c.company, logo: undefined },
                  }))
                }
              >
                Quitar
              </Button>
            )}
          </div>
          <small>
            PNG, JPG, SVG o WebP de hasta {MAX_LOGO_KB} KB. Queda en este
            navegador.
          </small>
        </div>

        <fieldset className={styles.field} disabled={!branding}>
          <legend>Color principal</legend>
          <div className={styles.colorRow}>
            {swatches.map((hex) => (
              <button
                key={hex}
                type="button"
                className={styles.swatch}
                style={{ background: hex }}
                aria-label={`Usar ${hex}`}
                aria-pressed={config.company.accent === hex}
                onClick={() =>
                  update((c) => ({
                    ...c,
                    company: { ...c.company, accent: hex },
                  }))
                }
              />
            ))}
            <input
              type="color"
              aria-label="Elegir otro color"
              value={tokens?.accent ?? "#1c6f8d"}
              onChange={(event) =>
                update((c) => ({
                  ...c,
                  company: { ...c.company, accent: event.target.value },
                }))
              }
            />
            <input
              className="field-input"
              aria-label="Código del color"
              value={config.company.accent ?? ""}
              placeholder="#1c6f8d"
              maxLength={7}
              onChange={(event) =>
                update((c) => ({
                  ...c,
                  company: {
                    ...c.company,
                    accent: event.target.value || undefined,
                  },
                }))
              }
            />
            {config.company.accent && (
              <Button
                variant="ghost"
                onPress={() =>
                  update((c) => ({
                    ...c,
                    company: { ...c.company, accent: undefined },
                  }))
                }
              >
                Usar el de Otear
              </Button>
            )}
          </div>
          {ratio !== null && (
            <small data-bad={tokens ? undefined : "true"}>
              {tokens
                ? `Contraste con texto blanco: ${ratio.toFixed(1)} a 1. Cumple.`
                : `Contraste con texto blanco: ${ratio.toFixed(1)} a 1. Hace falta 4,5 a 1 para que los botones se lean; elija un tono más oscuro.`}
            </small>
          )}
        </fieldset>

        <div className={styles.field}>
          <label className={styles.switchRow}>
            <input
              type="checkbox"
              role="switch"
              checked={Boolean(config.company.hideVendor)}
              disabled={!allowed("whiteLabel")}
              onChange={(event) =>
                update((c) => ({
                  ...c,
                  company: { ...c.company, hideVendor: event.target.checked },
                }))
              }
            />
            <span>Ocultar «Con tecnología de Otear»</span>
          </label>
          {!allowed("whiteLabel") && <Locked feature="whiteLabel" />}
        </div>
      </div>
    );
  }

  function renderTerms() {
    const open = allowed("vocabulary");
    return (
      <div className={styles.panel}>
        {!open && <Locked feature="vocabulary" />}
        <div className={styles.presetRow}>
          <label className={styles.field}>
            <span>Plantilla de partida</span>
            <select
              className="field-select"
              value={config.presetId}
              disabled={!open}
              onChange={(event) =>
                update((c) => applyPreset(c, event.target.value as PresetId))
              }
            >
              {config.presetId === "custom" && (
                <option value="custom">Personalizada</option>
              )}
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
            <small>
              {presets.find((preset) => preset.id === config.presetId)
                ?.description ??
                "Cambió algo a mano. Elegir una plantilla reemplaza los nombres personalizados."}
            </small>
          </label>
        </div>
        <table className={styles.table}>
          <caption className={styles.caption}>
            Si deja un campo vacío se usa el nombre de Otear. Las zonas (lote,
            tramo, frente) se nombran en cada sitio.
          </caption>
          <thead>
            <tr>
              <th scope="col">Término</th>
              <th scope="col">En singular</th>
              <th scope="col">En plural</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(termDefs) as TermKey[]).map((key) => {
              const def = termDefs[key];
              const own = config.terms[key];
              const set = (form: "singular" | "plural", value: string) =>
                update((c) => ({
                  ...c,
                  presetId: "custom",
                  terms: {
                    ...c.terms,
                    [key]: {
                      singular: own?.singular ?? "",
                      plural: own?.plural ?? "",
                      [form]: value,
                    },
                  },
                }));
              return (
                <tr key={key}>
                  <th scope="row">
                    {def.singular}
                    <small>{def.hint}</small>
                  </th>
                  <td>
                    <input
                      className="field-input"
                      aria-label={`${def.singular}, singular`}
                      value={own?.singular ?? ""}
                      placeholder={def.singular}
                      maxLength={40}
                      disabled={!open}
                      onChange={(event) => set("singular", event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="field-input"
                      aria-label={`${def.singular}, plural`}
                      value={own?.plural ?? ""}
                      placeholder={def.plural}
                      maxLength={40}
                      disabled={!open}
                      onChange={(event) => set("plural", event.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className={styles.note}>
          Hoy el vocabulario se aplica al menú, a los títulos y a las pestañas
          de vuelos; el resto de textos se irá sumando. Los términos van sin
          artículo («Nuevo» y «Nueva» no cambian según el género).
        </p>
      </div>
    );
  }

  function renderModules() {
    const open = allowed("modules");
    const order = config.order;
    return (
      <div className={styles.panel}>
        {!open && <Locked feature="modules" />}
        <ol className={styles.modules}>
          {order.map((id, index) => {
            const def = moduleDefs.find((item) => item.id === id)!;
            const own = config.modules[id];
            return (
              <li key={id}>
                <span className={styles.moveButtons}>
                  <button
                    type="button"
                    aria-label={`Subir ${def.label}`}
                    disabled={!open || index === 0}
                    onClick={() =>
                      update((c) => ({
                        ...c,
                        order: moveModule(c.order, id as ModuleId, -1),
                      }))
                    }
                  >
                    <ArrowUp size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Bajar ${def.label}`}
                    disabled={!open || index === order.length - 1}
                    onClick={() =>
                      update((c) => ({
                        ...c,
                        order: moveModule(c.order, id as ModuleId, 1),
                      }))
                    }
                  >
                    <ArrowDown size={15} aria-hidden="true" />
                  </button>
                </span>
                <input
                  className="field-input"
                  aria-label={`Nombre de ${def.label}`}
                  value={own?.label ?? ""}
                  placeholder={def.label.replace("{zona}", "lotes")}
                  maxLength={40}
                  disabled={!open}
                  onChange={(event) =>
                    update((c) => ({
                      ...c,
                      presetId: "custom",
                      modules: {
                        ...c.modules,
                        [id]: { ...c.modules[id], label: event.target.value },
                      },
                    }))
                  }
                />
                <label className={styles.switchRow}>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={!own?.hidden}
                    disabled={!open}
                    onChange={(event) =>
                      update((c) => ({
                        ...c,
                        modules: {
                          ...c.modules,
                          [id]: {
                            ...c.modules[id],
                            hidden: !event.target.checked,
                          },
                        },
                      }))
                    }
                  />
                  <span>{own?.hidden ? "Oculto" : "Visible"}</span>
                </label>
              </li>
            );
          })}
        </ol>
        <p className={styles.note}>
          Ocultar un módulo solo lo quita del menú; sus datos siguen existiendo.
          «Configuración» siempre está disponible para el administrador.
        </p>
      </div>
    );
  }

  function renderLicence() {
    const features = Object.keys(featureLabels) as Feature[];
    return (
      <div className={styles.panel}>
        <fieldset className={styles.field}>
          <legend>Plan activo en esta demostración</legend>
          <div className={styles.planChoices}>
            {plans.map((plan) => (
              <label key={plan.id} className={styles.planChoice}>
                <input
                  type="radio"
                  name="plan"
                  checked={config.planId === plan.id}
                  onChange={() =>
                    update((c) => ({ ...c, planId: plan.id as PlanId }))
                  }
                />
                <span>
                  <strong>{plan.name}</strong>
                  <small>{plan.summary}</small>
                </span>
              </label>
            ))}
          </div>
          <small>
            En el producto real el plan lo fija la licencia que usted emite al
            cliente. Aquí se puede cambiar para ver cómo cambia lo que cada
            empresa puede adaptar.
          </small>
        </fieldset>
        <table className={styles.table}>
          <caption className={styles.caption}>
            Planes de ejemplo para ilustrar el modelo. Los nombres, límites y
            precios los define el propietario del software.
          </caption>
          <thead>
            <tr>
              <th scope="col">Qué se puede adaptar</th>
              {plans.map((plan) => (
                <th key={plan.id} scope="col">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature}>
                <th scope="row">
                  {featureLabels[feature].label}
                  <small>
                    {featureLabels[feature].detail}
                    {featureLabels[feature].available
                      ? ""
                      : " Aún no está construido."}
                  </small>
                </th>
                {plans.map((plan) => (
                  <td key={plan.id}>
                    {plan.features.includes(feature) ? (
                      <span className={styles.yes}>
                        <Check size={16} aria-hidden="true" />
                        <span className={styles.srOnly}>Incluido</span>
                      </span>
                    ) : (
                      <span className={styles.no} aria-hidden="true">
                        —
                      </span>
                    )}
                    {!plan.features.includes(feature) && (
                      <span className={styles.srOnly}>No incluido</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <section className={styles.core} aria-label="Lo que no se personaliza">
          <h3>Lo que siempre queda en el núcleo</h3>
          <ul>
            <li>
              Los cálculos (horas, ciclos, desgaste, avance) y su integridad.
            </li>
            <li>
              Los datos mínimos que exige la norma para la bitácora y el libro
              de la aeronave.
            </li>
            <li>Los nombres de las piezas, que son los del fabricante.</li>
            <li>La huella y la firma de las evidencias.</li>
          </ul>
        </section>
      </div>
    );
  }
}
