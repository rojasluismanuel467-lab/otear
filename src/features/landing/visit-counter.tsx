import Script from "next/script";

/** Public token of a Cloudflare Web Analytics site; empty means «not measured». */
export const analyticsToken = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN ?? "";

/**
 * Counts visits to the landing (pages and where they come from) with
 * Cloudflare Web Analytics, which sets no cookies and stores nothing in the
 * visitor's browser. It is loaded only on the landing, never inside the demo,
 * and never without a token: without `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` nothing
 * is requested and the page says nothing about being measured.
 */
export function VisitCounter() {
  if (!analyticsToken) return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token: analyticsToken })}
    />
  );
}

/** The line the footer shows, only when visits are being counted. */
export function VisitCounterNotice() {
  if (!analyticsToken) return null;
  return (
    <>
      <br />
      Esta página cuenta visitas con Cloudflare Web Analytics, que no usa
      cookies; no mide la demo ni lo que escriba en el formulario.
    </>
  );
}
