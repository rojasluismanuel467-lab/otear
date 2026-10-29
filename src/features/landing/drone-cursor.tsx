"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./drone-cursor.module.css";

type CursorState = "idle" | "hover" | "active" | "text";

// Elements that get the "lock" hover state.
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [data-cursor-interactive]';
const TEXT_SELECTOR = "input, textarea, [contenteditable='true']";

// The wing's nose sits at this point of its 44px box; it is the pointer's hotspot.
const HOTSPOT = 9.27;

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
    let bank = 0;
    let raf = 0;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function render() {
      const smoothing = reduced ? 1 : 0.35;
      current.x += (target.x - current.x) * smoothing;
      current.y += (target.y - current.y) * smoothing;

      // Like a pointer, the wing keeps its heading (nose up-left, the click point);
      // it only banks a little with horizontal speed.
      const dx = current.x - previous.x;
      const desiredBank = Math.max(-14, Math.min(14, dx * 1.6));
      bank += (desiredBank - bank) * (reduced ? 1 : 0.14);

      previous.x = current.x;
      previous.y = current.y;

      if (craft) {
        craft.style.transform = `translate3d(${current.x - HOTSPOT}px, ${current.y - HOTSPOT}px, 0) rotate(${bank.toFixed(2)}deg)`;
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
        <svg
          className={styles.body}
          viewBox="0 0 44 44"
          width="44"
          height="44"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Delta wing seen from above, nose toward the upper left like a pointer */}
          <g transform="rotate(-45 22 22)">
            <path className={styles.wing} d="M22 4 L36 33 L22 27 L8 33 Z" />
            {/* Keel and cross spar */}
            <path className={styles.rib} d="M22 4 V27 M13 22.6 H31" />
          </g>
        </svg>
      </div>
    </div>
  );
}
