"use client";

import { useEffect, useRef } from "react";
import { Eraser } from "lucide-react";
import styles from "./traceability.module.css";

/** Draw a signature with mouse, finger or pen. Reports a PNG data URL, or "" when empty. */
export function SignaturePad({
  onChange,
  label,
}: {
  onChange: (image: string) => void;
  label: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    context.lineWidth = 2.4;
    context.lineCap = "round";
    context.strokeStyle = "#173f31";
  }, []);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * event.currentTarget.width,
      y:
        ((event.clientY - rect.top) / rect.height) * event.currentTarget.height,
    };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    const { x, y } = point(event);
    context.beginPath();
    context.moveTo(x, y);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const { x, y } = point(event);
    context.lineTo(x, y);
    context.stroke();
    hasInk.current = true;
  }

  function end(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(hasInk.current ? event.currentTarget.toDataURL("image/png") : "");
  }

  function clear() {
    const element = canvas.current;
    element?.getContext("2d")?.clearRect(0, 0, element.width, element.height);
    hasInk.current = false;
    onChange("");
  }

  return (
    <div className={styles.pad}>
      <canvas
        ref={canvas}
        width={560}
        height={160}
        aria-label={label}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      />
      <button type="button" onClick={clear}>
        <Eraser size={15} aria-hidden="true" />
        Borrar
      </button>
    </div>
  );
}
