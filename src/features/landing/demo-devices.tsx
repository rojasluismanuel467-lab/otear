"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { DemoLink } from "./demo-link";
import styles from "./demo-devices.module.css";

/**
 * The first screen's product shot: the demo on a computer and on a phone. It is two real
 * screenshots of the demo (example data), and the whole thing is a link into it. The aircraft
 * flies over this area; the link underneath still receives the clicks.
 */
export function DemoDevices() {
  return (
    <DemoLink className={styles.devices}>
      <span className={styles.stage} aria-hidden="true">
        <span className={styles.laptop}>
          <span className={styles.laptopScreen}>
            <Image
              src="/images/demo-escritorio.webp"
              alt=""
              width={1100}
              height={688}
              priority
              unoptimized
            />
          </span>
          <span className={styles.laptopBase} />
        </span>
        <span className={styles.phone}>
          <span className={styles.phoneScreen}>
            <Image
              src="/images/demo-movil.webp"
              alt=""
              width={390}
              height={844}
              unoptimized
            />
          </span>
        </span>
      </span>
      <span className={styles.caption}>
        <span className={styles.captionMain}>
          Abrir la demo <ArrowRight size={15} aria-hidden="true" />
        </span>
        <span className={styles.captionNote}>
          Capturas de la demo, con datos de ejemplo
        </span>
      </span>
    </DemoLink>
  );
}
