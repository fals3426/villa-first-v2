'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Filter, X } from 'lucide-react';
import { BookingRequestCard } from './BookingRequestCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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

/**
 * Liste des demandes de réservation avec filtres (Story 7.1)
 */
export function BookingRequestsList() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    listingId: '',
    status: '',
  });
  const [listings, setListings] = useState<Array<{ id: string; title: string }>>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentRejectId, setCurrentRejectId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    loadListings();
  }, [filters]);

  const loadListings = async () => {
    try {
      const response = await fetch('/api/listings?status=published');
      if (!response.ok) return;
      const data = await response.json();
      setListings(data.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des annonces:', err);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.listingId) params.append('listingId', filters.listingId);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/host/bookings/requests?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setRequests(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir accepter cette demande ?')) {
      return;
    }

    try {
      setAcceptingId(id);
      setError(null);

      const response = await fetch(`/api/host/bookings/${id}/accept`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'acceptation');
      }

      // Recharger les demandes
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'acceptation');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    try {
      setRejectingId(id);
      setError(null);

      const response = await fetch(`/api/host/bookings/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du refus');
      }

      // Recharger les demandes
      await loadRequests();
      setRejectDialogOpen(false);
      setRejectReason('');
      setCurrentRejectId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du refus');
    } finally {
      setRejectingId(null);
    }
  };

  const openRejectDialog = (id: string) => {
    setCurrentRejectId(id);
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (currentRejectId) {
      handleReject(currentRejectId, rejectReason);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="listing-filter">Annonce</Label>
            <select
              id="listing-filter"
              value={filters.listingId}
              onChange={(e) => setFilters({ ...filters, listingId: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="">Toutes les annonces</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="status-filter">Statut</Label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptées</option>
              <option value="rejected">Refusées</option>
              <option value="confirmed">Confirmées</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Liste des demandes */}
      {requests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucune demande de réservation trouvée.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <BookingRequestCard
              key={request.id}
              request={request}
              onAccept={handleAccept}
              onReject={openRejectDialog}
              accepting={acceptingId === request.id}
              rejecting={rejectingId === request.id}
            />
          ))}
        </div>
      )}

      {/* Dialog de refus */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande</DialogTitle>
            <DialogDescription>
              Vous pouvez optionnellement fournir une raison pour le refus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Raison du refus (optionnel)</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: Dates déjà réservées, profil non conforme..."
                maxLength={500}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {rejectReason.length}/500 caractères
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={rejectingId !== null}>
              {rejectingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refus...
                </>
              ) : (
                'Confirmer le refus'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
