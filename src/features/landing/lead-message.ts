/** What a visitor typed in the contact form. Nothing here is stored or sent by the site. */
export type Lead = {
  name: string;
  email: string;
  sector: string;
  company: string;
  role: string;
  whatsapp: string;
  message: string;
};

/** Collapses line breaks and runs of spaces so single-line fields stay on one line. */
function oneLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

/** The message the visitor sends from their own mail or WhatsApp client. */
export function leadText(lead: Lead): string {
  const name = oneLine(lead.name);
  const sector = oneLine(lead.sector);
  const company = oneLine(lead.company);
  const role = oneLine(lead.role);
  const phone = oneLine(lead.whatsapp);
  const email = oneLine(lead.email);
  const note = lead.message.trim();

  const lines = [`Hola, soy ${name || "un visitante"}.`];
  const about = [
    sector && `opero en ${sector}`,
    company && `trabajo en ${company}`,
    role && `mi cargo es ${role.toLowerCase()}`,
  ].filter(Boolean);
  if (about.length) lines.push(`${capitalise(about.join(", "))}.`);
  lines.push("Vi Otear y quisiera conversar.");
  if (note) lines.push("", note);
  const reach = [email && `Correo: ${email}`, phone && `WhatsApp: ${phone}`];
  const contact = reach.filter(Boolean);
  if (contact.length) lines.push("", ...contact);
  return lines.join("\n");
}

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** wa.me link with the message ready to send; null when no number is configured. */
export function whatsappHref(
  number: string | undefined,
  lead: Lead,
): string | null {
  const digits = (number ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(leadText(lead))}`;
}

/** mailto link with subject and body ready to send; null when no address is configured. */
export function mailtoHref(
  address: string | undefined,
  lead: Lead,
): string | null {
  const to = (address ?? "").trim();
  if (!/^[^\s@,;?&]+@[^\s@,;?&]+\.[^\s@,;?&]+$/.test(to)) return null;
  const who = oneLine(lead.company) || oneLine(lead.name);
  const subject = `Interés en Otear${who ? ` — ${who}` : ""}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(leadText(lead))}`;
}
