/**
 * The profile the demo runs as. There is no sign-in: this is the person shown in the sidebar
 * footer («Luis Rojas · Administrador · ejemplo»), and the one every edit, signature and removal
 * is recorded under. It is not an authenticated identity.
 */
export const DEMO_PROFILE = {
  name: "Luis Rojas",
  role: "Administrador · ejemplo",
} as const;

export const DEMO_PROFILE_LABEL = `${DEMO_PROFILE.name} · ${DEMO_PROFILE.role}`;
