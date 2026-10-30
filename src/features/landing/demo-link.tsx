"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { demoStart, launchEntry } from "@/features/entry/entry";
import { useEntry, writeEntry } from "@/features/entry/entry-store";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  /** Open the demo seen as the drone operator. */
  viewAs?: "operator";
};

/**
 * Every button that opens the demo. It goes to the screen that answers the
 * visitor's main question (their sector's, or the default example's) and asks
 * the demo to show its welcome once; it never opens on the pilot's schedule.
 */
export function DemoLink({ viewAs, onClick, children, ...rest }: Props) {
  const entry = useEntry();
  const route = demoStart(launchEntry(entry, viewAs)).route;
  return (
    <Link
      {...rest}
      href={`${route}/`}
      onClick={(event) => {
        writeEntry(launchEntry(entry, viewAs));
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
