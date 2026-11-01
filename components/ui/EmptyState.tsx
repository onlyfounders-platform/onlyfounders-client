import type { LucideIcon } from "lucide-react";
export interface EmptyStateProps { icon?: LucideIcon; title: string; description?: string; action?: React.ReactNode; }
export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return <div className="ds-empty">
    {Icon && <Icon size={36} className="ds-empty-icon" aria-hidden="true" />}
    <h2>{title}</h2>
    {description && <p>{description}</p>}
    {action && <div className="ds-empty-action">{action}</div>}
  </div>;
}
