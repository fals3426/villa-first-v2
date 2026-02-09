'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ShieldCheck, Calendar, Users, Home, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DashboardStatsProps {
  stats: {
    incidents: {
      total: number;
      reported: number;
      in_progress: number;
      resolved: number;
      closed: number;
      urgent: number;
    };
    verifications: {
      pending: number;
      inReview: number;
      total: number;
    };
    bookings: {
      active: number;
      withIncidents: number;
    };
    users: {
      activeLast30Days: number;
    };
    listings: {
      suspended: number;
    };
  };
}

/**
 * Composant pour afficher les statistiques du dashboard support (Story 9.1)
 */
export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      {/* Alerte incidents urgents */}
      {stats.incidents.urgent > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Incidents urgents</AlertTitle>
          <AlertDescription>
            {stats.incidents.urgent} incident(s) signalé(s) dans les 30 dernières minutes nécessitent une attention immédiate.
            <Link href="/admin/incidents?status=reported" className="ml-2 underline">
              Voir les incidents urgents
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.incidents.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.incidents.reported} signalés, {stats.incidents.in_progress} en cours
            </p>
            {stats.incidents.urgent > 0 && (
              <p className="text-xs text-destructive font-medium mt-1">
                {stats.incidents.urgent} urgent(s)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Vérifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vérifications</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifications.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.verifications.pending} en attente, {stats.verifications.inReview} en cours
            </p>
          </CardContent>
        </Card>

        {/* Réservations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookings.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.bookings.withIncidents} avec incidents
            </p>
          </CardContent>
        </Card>

        {/* Utilisateurs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.activeLast30Days}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nouveaux (30 derniers jours)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Détails incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Détails des incidents</CardTitle>
            <CardDescription>Répartition par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Signalés</span>
                <span className="font-medium">{stats.incidents.reported}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">En cours</span>
                <span className="font-medium">{stats.incidents.in_progress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Résolus</span>
                <span className="font-medium">{stats.incidents.resolved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Fermés</span>
                <span className="font-medium">{stats.incidents.closed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Autres statistiques */}
        <Card>
          <CardHeader>
            <CardTitle>Autres indicateurs</CardTitle>
            <CardDescription>Informations complémentaires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Annonces suspendues
                </span>
                <span className="font-medium">{stats.listings.suspended}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
