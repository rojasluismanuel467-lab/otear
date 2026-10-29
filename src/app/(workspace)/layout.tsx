import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { DemoProvider } from "@/features/demo/demo-context";
import { DemoEntry } from "@/features/entry/demo-entry";
import { DemoInvite } from "@/features/entry/demo-invite";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <DemoEntry />
      <AppShell>{children}</AppShell>
      <DemoInvite />
    </DemoProvider>
  );
}
