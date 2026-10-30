"use client";

import { useTerm } from "@/features/config/use-config";
import { findingWords, type FindingWords } from "./finding-words";

/** The company's word for a finding, ready to put in a sentence. */
export function useFindingWords(): FindingWords {
  const t = useTerm();
  return findingWords(t("finding"), t("finding", "plural"));
}
