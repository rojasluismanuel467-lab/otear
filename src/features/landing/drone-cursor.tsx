"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./drone-cursor.module.css";

type CursorState = "idle" | "hover" | "active" | "text";

// Elements that get the "lock" hover state.
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [data-cursor-interactive]';
const TEXT_SELECTOR = "input, textarea, [contenteditable='true']";

export function DroneCursor() {
  const craftRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Respect fine-pointer only — skip on touch.
    const mql = window.matchMedia("(pointer: fine)");
    if (!mql.matches) return;

    const html = document.documentElement;
    html.setAttribute("data-cursor", "on");

    const craft = craftRef.current;
    if (!craft) {
      return () => html.removeAttribute("data-cursor");
    }

    // Position tracking (lerped). Target follows mouse exactly; current eases toward it.
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: target.x, y: target.y };
    const previous = { x: target.x, y: target.y };

    let state: CursorState = "idle";
    let currentRotation = 0;
    let raf = 0;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function render() {
      const smoothing = reduced ? 1 : 0.22;
      current.x += (target.x - current.x) * smoothing;
      current.y += (target.y - current.y) * smoothing;

      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      const speed = Math.hypot(dx, dy);

      if (speed > 0.4) {
        // Point toward motion direction. Base art faces up, so offset 90°.
        const desired = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        let diff = desired - currentRotation;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        currentRotation += diff * (reduced ? 1 : 0.18);
      }

      previous.x = current.x;
      previous.y = current.y;

      if (craft) {
        craft.style.transform = `translate3d(${current.x - 22}px, ${current.y - 22}px, 0) rotate(${currentRotation.toFixed(2)}deg)`;
      }

      raf = requestAnimationFrame(render);
    }

    function handleMove(event: PointerEvent) {
      target.x = event.clientX;
      target.y = event.clientY;

      // Detect theme at cursor position by probing the element under it.
      const el = document.elementFromPoint(event.clientX, event.clientY);
      if (el instanceof HTMLElement) {
        const marker = el.closest<HTMLElement>("[data-cursor-theme]");
        const detected =
          marker?.dataset.cursorTheme === "dark" ? "dark" : "light";
        setTheme((prev) => (prev === detected ? prev : detected));
      }
    }

    function setState(next: CursorState) {
      if (next === state) return;
      state = next;
      craft?.setAttribute("data-state", next);
    }

    function handlePointerOver(event: PointerEvent) {
      const t = event.target;
      if (!(t instanceof Element)) return;
      if (t.closest(TEXT_SELECTOR)) {
        setState("text");
        return;
      }
      if (t.closest(INTERACTIVE_SELECTOR)) {
        setState("hover");
        return;
      }
      setState("idle");
    }

    function handlePointerDown() {
      if (state === "text") return;
      setState("active");
    }

    function handlePointerUp(event: PointerEvent) {
      const t = event.target;
      if (t instanceof Element && t.closest(TEXT_SELECTOR)) {
        setState("text");
        return;
      }
      if (t instanceof Element && t.closest(INTERACTIVE_SELECTOR)) {
        setState("hover");
        return;
      }
      setState("idle");
    }

    function handleLeave() {
      target.x = -200;
      target.y = -200;
    }

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointerleave", handleLeave);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointerleave", handleLeave);
      html.removeAttribute("data-cursor");
    };
  }, []);

  return (
    <div className={styles.wrap} aria-hidden="true">
      <div
        ref={craftRef}
        className={`${styles.craft} ${theme === "dark" ? styles.dark : styles.light}`}
        data-state="idle"
      >
        <span className={styles.ring} />
        <span className={styles.ticks}>
          <span className={`${styles.tick} ${styles.tickTL}`} />
          <span className={`${styles.tick} ${styles.tickTR}`} />
          <span className={`${styles.tick} ${styles.tickBL}`} />
          <span className={`${styles.tick} ${styles.tickBR}`} />
        </span>
        <svg
          className={styles.body}
          viewBox="0 0 44 44"
          width="44"
          height="44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Central body */}
          <rect x="18" y="18" width="8" height="8" rx="1.5" />
          {/* Arms (X configuration) */}
          <line x1="22" y1="22" x2="10" y2="10" />
          <line x1="22" y1="22" x2="34" y2="10" />
          <line x1="22" y1="22" x2="10" y2="34" />
          <line x1="22" y1="22" x2="34" y2="34" />
          {/* Rotors (hollow circles) */}
          <circle className={styles.rotor} cx="10" cy="10" r="4" />
          <circle className={styles.rotor} cx="34" cy="10" r="4" />
          <circle className={styles.rotor} cx="10" cy="34" r="4" />
          <circle className={styles.rotor} cx="34" cy="34" r="4" />
          {/* Forward antenna / camera indicator */}
          <circle cx="22" cy="18" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </div>
    </div>
  );
}
