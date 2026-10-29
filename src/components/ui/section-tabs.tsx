import type { ReactNode } from "react";
import { Tabs } from "@heroui/react";
import styles from "./section-tabs.module.css";

export interface SectionTab {
  id: string;
  /** One or two plain words that predict what is inside. */
  label: string;
  /** Small count next to the label, for example open alerts. */
  count?: number;
  content: ReactNode;
}

/**
 * Peer views of the same object, one visible at a time. Meant for a few tabs (up to four or
 * five) whose content does not need to be compared across tabs; critical information must
 * stay visible outside them. The first tab is the default and should be the most used.
 */
export function SectionTabs({
  label,
  tabs,
  selectedKey,
  onSelectionChange,
  containerClassName,
}: {
  label: string;
  tabs: SectionTab[];
  selectedKey: string;
  onSelectionChange: (id: string) => void;
  /** Lets a screen align the tab bar with its own content padding. */
  containerClassName?: string;
}) {
  return (
    <Tabs
      selectedKey={selectedKey}
      onSelectionChange={(key) => onSelectionChange(String(key))}
      className={styles.tabs}
    >
      <Tabs.ListContainer
        className={
          containerClassName
            ? `${styles.container} ${containerClassName}`
            : styles.container
        }
      >
        <Tabs.List aria-label={label} className={styles.list}>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.id} id={tab.id}>
              {tab.label}
              {tab.count ? (
                <span className={styles.count}>{tab.count}</span>
              ) : null}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
      {tabs.map((tab) => (
        <Tabs.Panel key={tab.id} id={tab.id} className={styles.panel}>
          {tab.content}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
