import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { DemoProvider } from "@/features/demo/demo-context";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <AppShell>{children}</AppShell>
    </DemoProvider>
  );
}
