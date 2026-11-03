"use client";
import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return value;
}

type Direction = "up" | "left" | "right" | "scale" | "none";

const INITIAL: Record<Direction, string> = {
  up: "translateY(36px)",
  left: "translateX(-44px)",
  right: "translateX(44px)",
  scale: "scale(0.90)",
  none: "none",
};

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  threshold = 0.12,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold, rootMargin: "0px 0px -32px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : INITIAL[direction],
        transition: `opacity 0.72s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.72s cubic-bezier(.16,1,.3,1) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
