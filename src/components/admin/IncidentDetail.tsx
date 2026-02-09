'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  User,
  Home,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns/format';
import { fr } from 'date-fns/locale/fr';
import Image from 'next/image';

interface IncidentDetailProps {
  incident: {
    id: string;
    type: string;
    description: string;
    photos: any;
    status: string;
    isUrgent: boolean;
    acknowledgedAt: Date | null;
    acknowledgedBy: string | null;
    resolvedAt: Date | null;
    resolvedBy: string | null;
    createdAt: Date;
    booking: {
      id: string;
      checkIn: Date;
      checkOut: Date;
      tenant: {
        id: string;
        email: string;
        profilePictureUrl: string | null;
        createdAt: Date;
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
      checkIns: Array<{
        id: string;
        photoUrl: string;
        createdAt: Date;
      }>;
    };
  };
}

/**
 * Composant pour afficher le détail d'un incident (Story 9.2, 9.3)
 */
export function IncidentDetail({ incident }: IncidentDetailProps) {
  const [loading, setLoading] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const minutesSinceReport = Math.floor(
    (Date.now() - incident.createdAt.getTime()) / (1000 * 60)
  );
  const isOverSLA = minutesSinceReport >= 30 && !incident.acknowledgedAt;

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
        return 'Villa différente des photos';
      case 'ACCESS_ISSUE':
        return 'Problème d\'accès';
      case 'OTHER':
        return 'Autre';
      default:
        return type;
    }
  };

  const handleAcknowledge = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/incidents/${incident.id}/acknowledge`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Erreur lors de l\'accusé de réception');
      setSuccess('Incident pris en charge avec succès');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/incidents/${incident.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNotes: resolutionNotes || undefined }),
      });
      if (!response.ok) throw new Error('Erreur lors de la résolution');
      setSuccess('Incident résolu avec succès');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/incidents/${incident.id}/close`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Erreur lors de la fermeture');
      setSuccess('Incident fermé avec succès');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const photos = incident.photos ? (Array.isArray(incident.photos) ? incident.photos : [incident.photos]) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/incidents">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Détail de l'incident</h1>
            <p className="text-muted-foreground mt-1">{incident.booking.listing.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(incident.status)}
          {incident.isUrgent && (
            <Badge variant="destructive" className="animate-pulse">
              URGENT
            </Badge>
          )}
        </div>
      </div>

      {isOverSLA && !incident.acknowledgedAt && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Délai SLA dépassé</AlertTitle>
          <AlertDescription>
            Cet incident n'a pas été pris en charge dans les 30 minutes. Action immédiate requise.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'incident</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Type</p>
                <Badge variant="outline">{getTypeLabel(incident.type)}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {incident.description}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Signalé le</p>
                <p className="text-sm text-muted-foreground">
                  {format(incident.createdAt, 'd MMMM yyyy à HH:mm', { locale: fr })} ({minutesSinceReport} min)
                </p>
              </div>
              {incident.acknowledgedAt && (
                <div>
                  <p className="text-sm font-medium mb-1">Pris en charge le</p>
                  <p className="text-sm text-muted-foreground">
                    {format(incident.acknowledgedAt, 'd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
              )}
              {incident.resolvedAt && (
                <div>
                  <p className="text-sm font-medium mb-1">Résolu le</p>
                  <p className="text-sm text-muted-foreground">
                    {format(incident.resolvedAt, 'd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos */}
          {photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos jointes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photoUrl: string, index: number) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={photoUrl}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preuves de check-in */}
          {incident.booking.checkIns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preuves de check-in</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incident.booking.checkIns.map((checkIn) => (
                    <div key={checkIn.id} className="border rounded-lg p-4">
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                        <Image
                          src={checkIn.photoUrl}
                          alt="Photo check-in"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(checkIn.createdAt, 'd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions et informations */}
        <div className="space-y-4">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incident.status === 'reported' && (
                <Button
                  onClick={handleAcknowledge}
                  disabled={loading}
                  className="w-full"
                  variant={isOverSLA ? 'destructive' : 'default'}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      En cours...
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Prendre en charge
                    </>
                  )}
                </Button>
              )}
              {incident.status === 'in_progress' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes de résolution</label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Décrivez la résolution..."
                      maxLength={2000}
                      className="mb-2"
                    />
                  </div>
                  <Button
                    onClick={handleResolve}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Résoudre
                      </>
                    )}
                  </Button>
                </>
              )}
              {incident.status === 'resolved' && (
                <Button
                  onClick={handleClose}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      En cours...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Fermer
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Informations réservation */}
          <Card>
            <CardHeader>
              <CardTitle>Informations réservation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                  <Home className="h-4 w-4" />
                  Annonce
                </p>
                <p className="text-sm text-muted-foreground">{incident.booking.listing.title}</p>
                <p className="text-xs text-muted-foreground">{incident.booking.listing.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  Dates
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(incident.booking.checkIn, 'd MMM yyyy', { locale: fr })} -{' '}
                  {format(incident.booking.checkOut, 'd MMM yyyy', { locale: fr })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  Locataire
                </p>
                <p className="text-sm text-muted-foreground">{incident.booking.tenant.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  Hôte
                </p>
                <p className="text-sm text-muted-foreground">
                  {incident.booking.listing.host.email}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
