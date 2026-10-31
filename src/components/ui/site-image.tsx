import Image from "next/image";
import { illustrationLabel } from "@/lib/illustration";
import styles from "./site-image.module.css";

/**
 * A sample image of a site. When it is one of the project's own illustrations (not a photo)
 * the label is drawn over it, so it is never taken for a capture of the real place.
 */
export function SiteImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  const label = illustrationLabel(src);
  return (
    <span className={styles.frame}>
      <Image
        className={className}
        src={src}
        alt={label ? `${label}. ${alt}` : alt}
        width={width}
        height={height}
        unoptimized
      />
      {label && <span className={styles.tag}>{label}</span>}
    </span>
  );
}
