"use client";
import { forwardRef, useId } from "react";
interface FieldWrapperProps { label?: string; hint?: string; error?: string; }
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, FieldWrapperProps {}
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldWrapperProps {}
function FieldChrome({ id, label, hint, error, required, children }: FieldWrapperProps & { id: string; required?: boolean; children: React.ReactNode }) {
  return <div className="ds-field-group">
    {label && <label htmlFor={id} className="ds-label">{label}{required && <span className="ds-error"> *</span>}</label>}
    {children}
    {(error || hint) && <p id={`${id}-help`} className={error ? "ds-field-help ds-error" : "ds-field-help"}>{error || hint}</p>}
  </div>;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ id, label, hint, error, required, className = "", ...props }, ref) {
  const generatedId = useId(); const fieldId = id ?? generatedId;
  return <FieldChrome id={fieldId} label={label} hint={hint} error={error} required={required}>
    <input {...props} ref={ref} id={fieldId} required={required} aria-invalid={!!error} aria-describedby={[props["aria-describedby"], (error || hint) ? `${fieldId}-help` : ""].filter(Boolean).join(" ") || undefined} className={`ds-field ${className}`} />
  </FieldChrome>;
});
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ id, label, hint, error, required, className = "", ...props }, ref) {
  const generatedId = useId(); const fieldId = id ?? generatedId;
  return <FieldChrome id={fieldId} label={label} hint={hint} error={error} required={required}>
    <textarea {...props} ref={ref} id={fieldId} required={required} aria-invalid={!!error} aria-describedby={[props["aria-describedby"], (error || hint) ? `${fieldId}-help` : ""].filter(Boolean).join(" ") || undefined} className={`ds-field ${className}`} />
  </FieldChrome>;
});
