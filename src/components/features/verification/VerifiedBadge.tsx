'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export type VerificationStatus =
  | 'verified'
  | 'partially_verified'
  | 'not_verified'
  | 'pending'
  | 'suspended';

interface VerificationDetails {
  idVerified?: boolean;
  titleVerified?: boolean;
  mandateVerified?: boolean;
  calendarSynced?: boolean;
}

interface VerifiedBadgeProps {
  status: VerificationStatus;
  variant?: 'compact' | 'detailed' | 'list';
  details?: VerificationDetails;
  className?: string;
  showDetails?: boolean;
}

const STATUS_CONFIG: Record<
  VerificationStatus,
  {
    label: string;
    shortLabel: string;
    color: string;
    bgColor: string;
    icon: string;
  }
> = {
  verified: {
    label: 'Annonce vérifiée',
    shortLabel: 'Vérifié',
    color: '#57bd92',
    bgColor: '#57bd92',
    icon: '✓',
  },
  partially_verified: {
    label: 'ID vérifiée',
    shortLabel: 'ID vérifiée',
    color: '#6b7280',
    bgColor: 'transparent',
    icon: '✓',
  },
  not_verified: {
    label: 'Non vérifié',
    shortLabel: 'Non vérifié',
    color: '#6b7280',
    bgColor: 'transparent',
    icon: '',
  },
  pending: {
    label: 'Vérification en cours',
    shortLabel: 'En attente',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    icon: '⏳',
  },
  suspended: {
    label: 'Badge suspendu',
    shortLabel: 'Suspendu',
    color: '#ef4444',
    bgColor: '#fee2e2',
    icon: '⚠',
  },
};

export function VerifiedBadge({
  status,
  variant = 'compact',
  details,
  className,
  showDetails = true,
}: VerifiedBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const config = STATUS_CONFIG[status];

  const badgeContent = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
        variant === 'compact' && 'px-2 py-0.5 text-xs',
        variant === 'detailed' && 'px-3 py-1.5 text-sm',
        status === 'verified' && 'shadow-sm hover:shadow-md',
        showDetails && 'cursor-pointer',
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        color: status === 'verified' ? 'white' : config.color,
        borderColor: config.color,
        borderWidth: status === 'verified' ? 0 : 1,
        transform: status === 'verified' ? 'scale(1.02)' : 'scale(1)',
      }}
      aria-label={`${config.label}, cliquez pour voir les détails de vérification`}
      role={showDetails ? 'button' : undefined}
      tabIndex={showDetails ? 0 : undefined}
      onKeyDown={
        showDetails
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsModalOpen(true);
              }
            }
          : undefined
      }
    >
      <span>{config.icon}</span>
      <span>
        {variant === 'compact' ? config.shortLabel : config.label}
      </span>
      {variant === 'detailed' && showDetails && (
        <span className="text-xs opacity-80 ml-1">(Détails)</span>
      )}
    </span>
  );

  if (!showDetails || !details) {
    return badgeContent;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>{badgeContent}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détails de vérification</DialogTitle>
          <DialogDescription>
            Cette annonce a été vérifiée selon les critères suivants :
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <span className="font-medium">Identité vérifiée</span>
            <span className={cn(
              'text-sm',
              details.idVerified ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {details.idVerified ? '✓ Vérifiée' : 'Non vérifiée'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <span className="font-medium">Titre de propriété</span>
            <span className={cn(
              'text-sm',
              details.titleVerified ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {details.titleVerified ? '✓ Vérifié' : 'Non vérifié'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <span className="font-medium">Mandat</span>
            <span className={cn(
              'text-sm',
              details.mandateVerified ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {details.mandateVerified ? '✓ Vérifié' : 'Non vérifié'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <span className="font-medium">Calendrier synchronisé</span>
            <span className={cn(
              'text-sm',
              details.calendarSynced ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {details.calendarSynced ? '✓ Synchronisé' : 'Non synchronisé'}
            </span>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">
            <strong>Annonce vérifiée</strong> signifie que l'identité de l'hôte a été confirmée,
            le logement contrôlé et les règles clarifiées.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
