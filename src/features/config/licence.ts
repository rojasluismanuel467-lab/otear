/**
 * How much of the product a company can adapt depends on its licence. The plans are
 * examples to show the model: names, limits and prices are not defined yet: they are agreed with each customer.
 */
export type PlanId = "base" | "pro" | "enterprise";

export type Feature =
  | "vocabulary"
  | "modules"
  | "branding"
  | "whiteLabel"
  | "exportImport"
  | "customFields"
  | "addons";

export interface Plan {
  id: PlanId;
  name: string;
  summary: string;
  features: Feature[];
}

export const featureLabels: Record<
  Feature,
  { label: string; detail: string; available: boolean }
> = {
  vocabulary: {
    label: "Vocabulario propio",
    detail: "Renombrar hallazgo, piloto, aeronave y los demás términos.",
    available: true,
  },
  modules: {
    label: "Módulos a la medida",
    detail: "Renombrar, ocultar y reordenar los módulos del menú.",
    available: true,
  },
  branding: {
    label: "Marca de la empresa",
    detail: "Nombre, logo y color principal.",
    available: true,
  },
  whiteLabel: {
    label: "Sin marca Otear",
    detail: "Quitar la mención «con tecnología de Otear».",
    available: true,
  },
  exportImport: {
    label: "Exportar e importar la configuración",
    detail: "Llevar la misma configuración a otra instalación.",
    available: true,
  },
  customFields: {
    label: "Campos propios",
    detail: "Agregar campos a vuelos, hallazgos, aeronaves y pagos.",
    available: true,
  },
  addons: {
    label: "Complementos",
    detail: "Piezas propias de su sector, construidas con usted.",
    available: false,
  },
};

export const plans: Plan[] = [
  {
    id: "base",
    name: "Base",
    summary: "La herramienta tal como viene, con los nombres del sector.",
    features: [],
  },
  {
    id: "pro",
    name: "Profesional",
    summary: "Adaptada a cómo habla y trabaja la empresa.",
    features: ["vocabulary", "modules", "branding", "exportImport"],
  },
  {
    id: "enterprise",
    name: "Empresarial",
    summary: "Marca propia y extensible.",
    features: [
      "vocabulary",
      "modules",
      "branding",
      "whiteLabel",
      "exportImport",
      "customFields",
      "addons",
    ],
  },
];

export function planById(id: PlanId): Plan {
  return plans.find((plan) => plan.id === id) ?? plans[0];
}

export function can(planId: PlanId, feature: Feature): boolean {
  return planById(planId).features.includes(feature);
}

/** First plan that includes a feature, to tell people what to upgrade to. */
export function planFor(feature: Feature): Plan | undefined {
  return plans.find((plan) => plan.features.includes(feature));
}
