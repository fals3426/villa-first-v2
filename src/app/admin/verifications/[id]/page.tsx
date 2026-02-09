'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VerificationRequestDetail {
  id: string;
  hostId: string;
  listingId: string;
  status: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  host: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    kycVerification: {
      status: string;
      verifiedAt: string | null;
    } | null;
  };
  documents: {
    id: string;
    storageUrl: string;
    fileType: string;
    fileSize: number;
    originalFileName: string;
  }[];
}

export default function AdminVerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params?.id as string;

  const [request, setRequest] = useState<VerificationRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // États pour les dialogs
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/verifications/${requestId}`);
      const result = await res.json();

      if (!res.ok) {
        setError(result.error?.message || 'Erreur lors du chargement');
        return;
      }

      setRequest(result.data);
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/verifications/${requestId}/approve`, {
        method: 'POST',
      });

      const result = await res.json();

      if (!res.ok) {
        setActionError(result.error?.message || 'Erreur lors de l\'approbation');
        return;
      }

      setActionSuccess('Demande approuvée avec succès');
      fetchRequest();
    } catch (err) {
      setActionError('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setActionError('La raison de rejet est obligatoire');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/verifications/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        setActionError(result.error?.message || 'Erreur lors du rejet');
        return;
      }

      setActionSuccess('Demande rejetée');
      setRejectDialogOpen(false);
      setReason('');
      fetchRequest();
    } catch (err) {
      setActionError('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspend = async () => {
    if (!reason.trim()) {
      setActionError('La raison de suspension est obligatoire');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/verifications/${requestId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        setActionError(result.error?.message || 'Erreur lors de la suspension');
        return;
      }

      setActionSuccess('Badge suspendu');
      setSuspendDialogOpen(false);
      setReason('');
      fetchRequest();
    } catch (err) {
      setActionError('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!reason.trim()) {
      setActionError('La raison de révocation est obligatoire');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/verifications/${requestId}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        setActionError(result.error?.message || 'Erreur lors de la révocation');
        return;
      }

      setActionSuccess('Badge révoqué');
      setRevokeDialogOpen(false);
      setReason('');
      fetchRequest();
    } catch (err) {
      setActionError('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error || 'Demande non trouvée'}
        </div>
        <Button onClick={() => router.push('/admin/verifications')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  const canApprove = request.status === 'pending' || request.status === 'in_review';
  const canReject = request.status === 'pending' || request.status === 'in_review';
  const canSuspend = request.status === 'approved';
  const canRevoke = request.status === 'approved' || request.status === 'suspended';

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Détail de la demande</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ID: {request.id}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/verifications')}>
          Retour à la liste
        </Button>
      </div>

      {actionError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-200" role="status">
          {actionSuccess}
        </div>
      )}

      {/* Informations hôte */}
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Hôte</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Nom:</span>{' '}
            {request.host.firstName} {request.host.lastName}
          </div>
          <div>
            <span className="font-medium">Email:</span> {request.host.email}
          </div>
          <div>
            <span className="font-medium">KYC:</span>{' '}
            {request.host.kycVerification?.status === 'verified' ? (
              <span className="text-green-600">✓ Vérifié</span>
            ) : (
              <span className="text-muted-foreground">Non vérifié</span>
            )}
          </div>
        </div>
      </div>

      {/* Informations annonce */}
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Annonce</h2>
        <div className="text-sm">
          <span className="font-medium">ID:</span> {request.listingId}
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Documents</h2>
        <div className="space-y-2">
          {request.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div>
                <div className="font-medium text-sm">{doc.originalFileName}</div>
                <div className="text-xs text-muted-foreground">
                  {doc.fileType} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer">
                  Télécharger
                </a>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Statut et raison */}
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Statut</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Statut actuel:</span>{' '}
            <span className="capitalize">{request.status}</span>
          </div>
          {request.reason && (
            <div>
              <span className="font-medium">Raison:</span> {request.reason}
            </div>
          )}
          <div>
            <span className="font-medium">Créée le:</span>{' '}
            {new Date(request.createdAt).toLocaleString('fr-FR')}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Actions</h2>
        <div className="flex flex-wrap gap-2">
          {canApprove && (
            <Button onClick={handleApprove} disabled={isSubmitting}>
              Approuver
            </Button>
          )}

          {canReject && (
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={isSubmitting}>
                  Rejeter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rejeter la demande</DialogTitle>
                  <DialogDescription>
                    Veuillez indiquer la raison du rejet. Cette raison sera visible par
                    l&apos;hôte.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="reject-reason">Raison de rejet *</Label>
                  <Input
                    id="reject-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Documents incomplets, titre non valide..."
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleReject} disabled={isSubmitting || !reason.trim()}>
                    Confirmer le rejet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {canSuspend && (
            <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={isSubmitting}>
                  Suspendre
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Suspendre le badge vérifié</DialogTitle>
                  <DialogDescription>
                    Le badge sera retiré de toutes les annonces de cet hôte. Veuillez indiquer la
                    raison.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="suspend-reason">Raison de suspension *</Label>
                  <Input
                    id="suspend-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Fraude détectée, documents falsifiés..."
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSuspend} disabled={isSubmitting || !reason.trim()}>
                    Confirmer la suspension
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {canRevoke && (
            <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={isSubmitting}>
                  Révoquer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Révoquer le badge vérifié</DialogTitle>
                  <DialogDescription>
                    Le badge sera définitivement révoqué. Veuillez indiquer la raison.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="revoke-reason">Raison de révocation *</Label>
                  <Input
                    id="revoke-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Fraude confirmée, violation des règles..."
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleRevoke} disabled={isSubmitting || !reason.trim()}>
                    Confirmer la révocation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
