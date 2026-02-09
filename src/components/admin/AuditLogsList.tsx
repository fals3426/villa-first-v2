'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Download } from 'lucide-react';
import { format } from 'date-fns/format';
import { fr } from 'date-fns/locale/fr';

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    userType: string;
  } | null;
}

/**
 * Composant pour afficher la liste des logs d'audit (Story 9.4, 9.9)
 */
export function AuditLogsList() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    userId: '',
    entityType: '',
    action: '',
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
    hasMore: false,
  });

  useEffect(() => {
    loadLogs();
  }, [filters, pagination.offset]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.action) params.append('action', filters.action);
      params.append('limit', pagination.limit.toString());
      params.append('offset', pagination.offset.toString());

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setLogs(data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: data.meta.total,
        hasMore: data.meta.hasMore,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Utilisateur', 'Action', 'Type Entité', 'ID Entité', 'Détails'].join(','),
      ...logs.map((log) =>
        [
          format(log.createdAt, 'yyyy-MM-dd HH:mm:ss'),
          log.user?.email || 'Système',
          log.action,
          log.entityType,
          log.entityId || '',
          JSON.stringify(log.details).replace(/"/g, '""'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Utilisateur (ID)</label>
              <Input
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                placeholder="ID utilisateur"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type d'entité</label>
              <Input
                value={filters.entityType}
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                placeholder="Ex: Booking, Listing, User"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Input
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                placeholder="Ex: BOOKING_ACCEPTED"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={loadLogs}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      {error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Aucun log trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{log.action}</Badge>
                        <Badge variant="secondary">{log.entityType}</Badge>
                        {log.user && (
                          <Badge variant="outline">
                            {log.user.email} ({log.user.userType})
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {format(log.createdAt, 'd MMMM yyyy à HH:mm:ss', { locale: fr })}
                      </p>
                      {log.entityId && (
                        <p className="text-xs text-muted-foreground">
                          ID: {log.entityId}
                        </p>
                      )}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-sm cursor-pointer text-muted-foreground">
                            Détails
                          </summary>
                          <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Affichage {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} sur {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, offset: Math.max(0, pagination.offset - pagination.limit) })}
                disabled={pagination.offset === 0}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, offset: pagination.offset + pagination.limit })}
                disabled={!pagination.hasMore}
              >
                Suivant
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
