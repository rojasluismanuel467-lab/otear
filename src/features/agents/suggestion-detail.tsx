import { AiBadge } from "@/components/ui/ai-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Finding, Flight } from "@/features/demo/types";
import { useFindingWords } from "@/features/flights/use-finding-words";
import {
  caution,
  confidenceLabels,
  historyNote,
  photoRangeText,
  type Suggested,
} from "./image-candidates";
import styles from "./suggestions.module.css";

/** Why the assistant proposes this finding and what it cannot tell, next to the review buttons. */
export function SuggestionDetail({
  finding,
  flight,
  findings,
  flights,
}: {
  finding: Suggested;
  flight: Flight;
  findings: Finding[];
  flights: Flight[];
}) {
  const words = useFindingWords();
  const { suggestion } = finding;
  const photos = photoRangeText(suggestion, flight.photoCount);
  const past = historyNote(finding, findings, flights);
  const warning = caution(finding, words);
  return (
    <div className={styles.detail}>
      <div className={styles.badges}>
        <AiBadge>Sugerencia automática · ejemplo</AiBadge>
        <StatusBadge
          tone={suggestion.confidence === "low" ? "warning" : "neutral"}
        >
          {confidenceLabels[suggestion.confidence]}
        </StatusBadge>
      </div>
      {warning && (
        <p className={styles.caution} role="note">
          {warning}
        </p>
      )}
      <h4>En qué se basó</h4>
      <ul>
        {suggestion.evidence.map((item) => (
          <li key={item}>{item}</li>
        ))}
        {photos && <li>{photos}.</li>}
        {past && <li>{past}</li>}
      </ul>
      <h4>Qué no puede saber</h4>
      <p>{suggestion.limits}</p>
    </div>
  );
}
