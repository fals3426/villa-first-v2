'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface VerificationRequest {
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
    } | null;
  };
  documents: {
    id: string;
    originalFileName: string;
    fileType: string;
    fileSize: number;
  }[];
}

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/verifications');
      const result = await res.json();

      if (!res.ok) {
        setError(result.error?.message || 'Erreur lors du chargement');
        return;
      }

      setRequests(result.data || []);
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      in_review: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      suspended: 'destructive',
      revoked: 'destructive',
    };

    const labels: Record<string, string> = {
      pending: 'En attente',
      in_review: 'En cours',
      approved: 'Approuvée',
      rejected: 'Rejetée',
      suspended: 'Suspendue',
      revoked: 'Révoquée',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto p-6">
          <Card variant="v1-default" className="p-4">
            <p className="text-red-400">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <p className="text-label mb-2">ADMIN</p>
          <h1 className="text-heading-2 mb-2">Demandes de vérification</h1>
          <p className="text-white/90">
            Liste des demandes de vérification d&apos;annonces en attente de traitement
          </p>
        </div>

        {requests.length === 0 ? (
          <Card variant="v1-default" className="p-12 text-center">
            <p className="text-zinc-400">Aucune demande en attente</p>
          </Card>
        ) : (
          <Card variant="v1-default" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Hôte</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Annonce</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">KYC</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Statut</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Documents</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium text-white">
                            {request.host.firstName} {request.host.lastName}
                          </div>
                          <div className="text-zinc-400 text-xs">{request.host.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{request.listingId}</td>
                      <td className="px-4 py-3">
                        {request.host.kycVerification?.status === 'verified' ? (
                          <span className="text-xs text-green-400">✓ Vérifié</span>
                        ) : (
                          <span className="text-xs text-zinc-400">Non vérifié</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                      <td className="px-4 py-3 text-sm text-white">{request.documents.length} fichier(s)</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/verifications/${request.id}`}>
                          <Button variant="v1-outline" size="sm">
                            Voir détails
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
