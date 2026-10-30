"use client";
import { forwardRef } from "react";

const fieldBase: React.CSSProperties = {
  width: "100%",
  padding: "9px 13px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  fontSize: "var(--font-base)",
  color: "var(--text)",
  outline: "none",
  background: "var(--bg)",
  boxSizing: "border-box",
  transition: "border-color var(--transition-fast)",
};

interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, FieldWrapperProps {}
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldWrapperProps {}

function FieldChrome({ label, hint, error, required, children }: FieldWrapperProps & { children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <label style={{ display: "block", fontSize: "var(--font-sm)", fontWeight: 600, marginBottom: 5, color: "var(--text-secondary)" }}>
          {label} {required && <span style={{ color: "var(--red)" }}>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p style={{ fontSize: 11.5, color: "var(--red)", marginTop: 5 }}>{error}</p>
      ) : hint ? (
        <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 5 }}>{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, style, ...rest },
  ref
) {
  return (
    <FieldChrome label={label} hint={hint} error={error} required={required}>
      <input
        ref={ref}
        style={{ ...fieldBase, borderColor: error ? "var(--red)" : "var(--border)", ...style }}
        onFocus={(e) => { if (!error) (e.currentTarget as HTMLInputElement).style.borderColor = "var(--accent-border)"; }}
        onBlur={(e) => { if (!error) (e.currentTarget as HTMLInputElement).style.borderColor = "var(--border)"; }}
        {...rest}
      />
    </FieldChrome>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, style, ...rest },
  ref
) {
  return (
    <FieldChrome label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        style={{ ...fieldBase, resize: "vertical", borderColor: error ? "var(--red)" : "var(--border)", ...style }}
        onFocus={(e) => { if (!error) (e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--accent-border)"; }}
        onBlur={(e) => { if (!error) (e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--border)"; }}
        {...rest}
      />
    </FieldChrome>
  );
});
