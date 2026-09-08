import React from 'react';

export type StatusVariant = 'optimal' | 'warning' | 'danger' | 'standby' | 'active';

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  icon?: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'optimal',
  icon,
  className = '',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'optimal':
      case 'active':
        return {
          border: 'border-emerald-600',
          text: 'text-emerald-700',
          dot: 'bg-emerald-600',
        };
      case 'warning':
        return {
          border: 'border-amber-500',
          text: 'text-amber-700',
          dot: 'bg-amber-500',
        };
      case 'danger':
        return {
          border: 'border-rose-500',
          text: 'text-rose-700',
          dot: 'bg-rose-500',
        };
      case 'standby':
      default:
        return {
          border: 'border-slate-300',
          text: 'text-slate-500',
          dot: 'bg-slate-400',
        };
    }
  };

  const current = getStyles();

  return (
    <span
      className={`w-24 h-7 inline-flex items-center justify-center gap-1.5 px-2.5 rounded-full text-xs font-bold border bg-white whitespace-nowrap shadow-2xs ${current.border} ${current.text} ${className}`}
    >
      {icon ? (
        icon
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      )}
      <span className="truncate">{status}</span>
    </span>
  );
};
