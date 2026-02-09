'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Calendar,
  Euro,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns/format';
import Image from 'next/image';
import Link from 'next/link';

interface BookingRequest {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  rejectionReason?: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    location: string | null;
    capacity: number;
  };
  tenant: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profilePictureUrl: string | null;
    kycVerification?: {
      status: string;
    } | null;
  };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    expiresAt: string | null;
  }>;
}

interface BookingRequestCardProps {
  request: BookingRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string, reason?: string) => void;
  accepting?: boolean;
  rejecting?: boolean;
}

/**
 * Carte pour afficher une demande de réservation (Story 7.1)
 */
export function BookingRequestCard({
  request,
  onAccept,
  onReject,
  accepting,
  rejecting,
}: BookingRequestCardProps) {
  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)} €`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Acceptée
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Refusée
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmée
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isKycVerified = request.tenant.kycVerification?.status === 'approved';
  const activePayment = request.payments[0];
  const isPending = request.status === 'pending';

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
      <div className="flex items-start justify-between mb-4">
        {/* Informations locataire */}
        <div className="flex items-center gap-3">
          {request.tenant.profilePictureUrl ? (
            <Image
              src={request.tenant.profilePictureUrl}
              alt={`${request.tenant.firstName || ''} ${request.tenant.lastName || ''}`}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {request.tenant.firstName} {request.tenant.lastName}
              </span>
              {isKycVerified && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  KYC vérifié
                </Badge>
              )}
            </div>
            <Link
              href={`/profile/${request.tenant.id}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Voir le profil
            </Link>
          </div>
        </div>

        {getStatusBadge(request.status)}
      </div>

      {/* Informations réservation */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(request.checkIn), 'd MMM yyyy')} -{' '}
            {format(new Date(request.checkOut), 'd MMM yyyy')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Annonce :</span>
          <Link
            href={`/listings/${request.listingId}`}
            className="text-primary hover:underline"
          >
            {request.listing.title}
          </Link>
        </div>

        {activePayment && (
          <div className="flex items-center gap-2 text-sm">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <span>
              Préautorisation : <strong>{formatPrice(activePayment.amount)}</strong>
              {activePayment.status === 'pending' && ' (en attente)'}
            </span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Demande reçue le {format(new Date(request.createdAt), 'd MMM yyyy à HH:mm')}
        </div>
      </div>

      {/* Raison de refus */}
      {request.status === 'rejected' && request.rejectionReason && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Raison du refus :</strong> {request.rejectionReason}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      {isPending && (onAccept || onReject) && (
        <div className="flex gap-2 mt-4">
          {onAccept && (
            <Button
              onClick={() => onAccept(request.id)}
              disabled={accepting || rejecting}
              className="flex-1"
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Acceptation...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Accepter
                </>
              )}
            </Button>
          )}
          {onReject && (
            <Button
              onClick={() => onReject(request.id)}
              disabled={accepting || rejecting}
              variant="destructive"
              className="flex-1"
            >
              {rejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refus...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Refuser
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
