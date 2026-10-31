"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const route = demoStart(launchEntry(entry, viewAs)).route;
  return (
    <Link
      {...rest}
      href={`${route}/`}
      // The demo's JS (maps, 3D) is fetched when the visitor shows intent, not for every visitor.
      prefetch={false}
      onPointerEnter={() => router.prefetch(`${route}/`)}
      onFocus={() => router.prefetch(`${route}/`)}
      onClick={(event) => {
        writeEntry(launchEntry(entry, viewAs));
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
