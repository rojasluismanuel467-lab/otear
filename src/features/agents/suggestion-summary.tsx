import { Button } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { AiBadge } from "@/components/ui/ai-badge";
import type { Finding, Flight } from "@/features/demo/types";
import { useFindingWords } from "@/features/flights/use-finding-words";
import { isSuggested, reviewQueue, suggestionStats } from "./image-candidates";
import styles from "./suggestions.module.css";

/** Top of the findings tab: how many candidates came from the photos and how past ones fared. */
export function SuggestionSummary({
  flight,
  flightFindings,
  siteFindings,
  onReview,
}: {
  flight: Flight;
  flightFindings: Finding[];
  siteFindings: Finding[];
  onReview: (id: string) => void;
}) {
  const words = useFindingWords();
  const mine = flightFindings.filter(isSuggested);
  if (!mine.length) return null;
  const queue = reviewQueue(flightFindings);
  const stats = suggestionStats(siteFindings);
  return (
    <section className={`surface ${styles.summary}`}>
      <div className={styles.summaryText}>
        <AiBadge>Sugerencia automática · ejemplo</AiBadge>
        <p className={styles.summaryTitle}>
          {mine.length} {mine.length === 1 ? "sugerencia" : "sugerencias"} tras
          revisar las {flight.photoCount} fotos de este vuelo
          {queue.length
            ? ` · ${queue.length} por revisar`
            : " · todas revisadas"}
        </p>
        <p className={styles.summaryHint}>
          {stats.reviewed
            ? `Sugerencias anteriores: ${stats.confirmed} de ${stats.reviewed} revisadas se confirmaron.${stats.small ? " Son pocas para medir su acierto." : ""}`
            : "Aún no hay sugerencias revisadas para medir su acierto."}{" "}
          Ninguna cuenta como {words.singular} hasta que usted la confirme.
        </p>
      </div>
      {queue.length > 0 && (
        <Button variant="secondary" onPress={() => onReview(queue[0].id)}>
          Revisar la más importante
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      )}
    </section>
  );
}
