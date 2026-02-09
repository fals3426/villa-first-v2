'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle2, XCircle, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns/format';
import { fr } from 'date-fns/locale/fr';

interface Incident {
  id: string;
  type: 'CODE_NOT_WORKING' | 'PLACE_DIFFERENT' | 'ACCESS_ISSUE' | 'OTHER';
  description: string;
  status: 'reported' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  booking: {
    id: string;
    tenant: {
      id: string;
      email: string;
      profilePictureUrl: string | null;
    };
    listing: {
      id: string;
      title: string;
      address: string;
      host: {
        id: string;
        email: string;
      };
    };
  };
}

/**
 * Composant pour afficher la liste des incidents (Story 9.2)
 */
export function IncidentsList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadIncidents();
  }, [statusFilter, typeFilter]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }

      const response = await fetch(`/api/admin/incidents?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setIncidents(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reported':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Signalé
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            En cours
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Résolu
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Fermé
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CODE_NOT_WORKING':
        return 'Code inopérant';
      case 'PLACE_DIFFERENT':
        return 'Villa différente';
      case 'ACCESS_ISSUE':
        return 'Problème d\'accès';
      case 'OTHER':
        return 'Autre';
      default:
        return type;
    }
  };

  const getTimeSinceReport = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 30) {
      return { urgent: true, text: `${diffMinutes} min` };
    }
    if (diffMinutes < 60) {
      return { urgent: false, text: `${diffMinutes} min` };
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return { urgent: false, text: `${diffHours}h` };
    }
    const diffDays = Math.floor(diffHours / 24);
    return { urgent: false, text: `${diffDays}j` };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">Tous</option>
                <option value="reported">Signalés</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolus</option>
                <option value="closed">Fermés</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">Tous</option>
                <option value="CODE_NOT_WORKING">Code inopérant</option>
                <option value="PLACE_DIFFERENT">Villa différente</option>
                <option value="ACCESS_ISSUE">Problème d'accès</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des incidents */}
      {incidents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Aucun incident trouvé
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => {
            const timeInfo = getTimeSinceReport(incident.createdAt);
            return (
              <Card key={incident.id} className={timeInfo.urgent ? 'border-destructive' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(incident.status)}
                        <Badge variant="outline">{getTypeLabel(incident.type)}</Badge>
                        {timeInfo.urgent && (
                          <Badge variant="destructive" className="animate-pulse">
                            URGENT ({timeInfo.text})
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">
                        {incident.booking.listing.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {incident.booking.listing.address}
                      </CardDescription>
                    </div>
                    <Link href={`/admin/incidents/${incident.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Description</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {incident.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Locataire</p>
                        <p className="text-muted-foreground">
                          {incident.booking.tenant.email}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Hôte</p>
                        <p className="text-muted-foreground">
                          {incident.booking.listing.host.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Signalé le {format(new Date(incident.createdAt), 'd MMMM yyyy à HH:mm', { locale: fr })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
