'use client';

import { cn } from '@/lib/utils';

export type VibeType = 'calm' | 'social' | 'spiritual' | 'remote';

interface VibeTagProps {
  vibe: VibeType;
  variant?: 'compact' | 'standard' | 'large';
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const VIBE_CONFIG: Record<
  VibeType,
  {
    label: string;
    icon: string;
    color: string;
    description?: string;
  }
> = {
  calm: {
    label: 'Calme',
    icon: '🌙',
    color: '#6BA2FF',
    description: 'Ambiance calme et reposante',
  },
  social: {
    label: 'Social',
    icon: '🎉',
    color: '#FF886B',
    description: 'Ambiance festive et sociale',
  },
  spiritual: {
    label: 'Spiritualité',
    icon: '🧘',
    color: '#B68CFF',
    description: 'Ambiance spirituelle et méditative',
  },
  remote: {
    label: 'Télétravail',
    icon: '💻',
    color: '#4FD4C8',
    description: 'Espace de travail calme',
  },
};

export function VibeTag({
  vibe,
  variant = 'standard',
  selected = false,
  onClick,
  disabled = false,
  className,
}: VibeTagProps) {
  const config = VIBE_CONFIG[vibe];

  if (variant === 'compact') {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm',
          selected && 'ring-2 ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && onClick && 'cursor-pointer hover:scale-110 transition-transform',
          className
        )}
        style={{
          backgroundColor: selected ? config.color : 'transparent',
          borderColor: config.color,
          borderWidth: selected ? 0 : 1,
          color: selected ? 'white' : config.color,
        }}
        onClick={disabled ? undefined : onClick}
        aria-label={`${config.label} tag${selected ? ', sélectionné' : ''}`}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
      >
        {config.icon}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
        selected && 'shadow-sm',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      style={{
        backgroundColor: selected ? config.color : 'transparent',
        borderColor: config.color,
        borderWidth: 1,
        color: selected ? 'white' : config.color,
      }}
      onClick={disabled ? undefined : onClick}
      aria-label={`${config.label} tag${selected ? ', sélectionné' : ''}, ${config.description || ''}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={
        onClick && !disabled
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span className="text-base">{config.icon}</span>
      <span>{config.label}</span>
      {variant === 'large' && config.description && (
        <span className="text-xs opacity-80 ml-1">({config.description})</span>
      )}
    </span>
  );
}
