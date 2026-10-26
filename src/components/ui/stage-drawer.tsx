import type { ReactNode } from "react";
import styles from "./stage-drawer.module.css";

/**
 * A large stage with the thing being studied (a 3D model, a map) and a drawer beside it
 * that shows the detail of whatever is touched. On narrow containers the drawer goes below.
 */
export function StageDrawer({
  stage,
  drawer,
  drawerLabel,
}: {
  stage: ReactNode;
  drawer: ReactNode;
  drawerLabel: string;
}) {
  return (
    <div className={styles.frame}>
      <div className={styles.layout}>
        <div className={styles.stage}>{stage}</div>
        <aside className={styles.drawerFrame} aria-label={drawerLabel}>
          <div className={styles.drawer}>{drawer}</div>
        </aside>
      </div>
    </div>
  );
}
