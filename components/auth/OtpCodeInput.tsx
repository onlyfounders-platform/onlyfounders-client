"use client";
import { useEffect, useRef } from "react";

const LENGTH = 6;

// Six individually-focused boxes rather than one text input — lets people
// paste the whole code from their email client in one go (distributed
// across boxes) while still supporting normal type-one-digit-at-a-time entry.
export default function OtpCodeInput({
  value,
  onChange,
  onComplete,
  disabled,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(LENGTH, " ").split("").slice(0, LENGTH);

  useEffect(() => {
    refs.current[Math.min(value.length, LENGTH - 1)]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDigit = (index: number, char: string) => {
    const chars = value.split("");
    chars[index] = char;
    const next = chars.join("").slice(0, LENGTH).replace(/\s/g, "");
    onChange(next);
    if (next.length === LENGTH) onComplete?.(next);
  };

  const handleChange = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (!clean) { setDigit(index, ""); return; }
    if (clean.length > 1) {
      // Pasted content landed in one box — distribute it from here on.
      const next = (value.slice(0, index) + clean).slice(0, LENGTH);
      onChange(next);
      refs.current[Math.min(next.length, LENGTH - 1)]?.focus();
      if (next.length === LENGTH) onComplete?.(next);
      return;
    }
    setDigit(index, clean);
    if (index < LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index].trim() && index > 0) {
      refs.current[index - 1]?.focus();
      setDigit(index - 1, "");
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < LENGTH - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }} onPaste={e => {
      const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
      if (text) { e.preventDefault(); onChange(text); if (text.length === LENGTH) onComplete?.(text); }
    }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          value={d.trim()}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          className="ds-field" style={{width: 44, height: 52, textAlign: "center"}}
        />
      ))}
    </div>
  );
}
