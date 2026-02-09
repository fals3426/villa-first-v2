'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface ListingCalendarSectionProps {
  listingId: string;
}

interface AvailabilitySlot {
  id: string;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
}

export function ListingCalendarSection({ listingId }: ListingCalendarSectionProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadCalendar();
  }, [listingId, currentMonth, currentYear]);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/listings/${listingId}/calendar?month=${currentMonth}&year=${currentYear}`
      );
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setSlots(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const isDateInSlot = (date: Date, slot: AvailabilitySlot) => {
    const slotStart = new Date(slot.startDate);
    const slotEnd = new Date(slot.endDate);
    return date >= slotStart && date <= slotEnd;
  };

  const getDateStatus = (date: Date): 'available' | 'unavailable' | null => {
    for (const slot of slots) {
      if (isDateInSlot(date, slot)) {
        return slot.isAvailable ? 'available' : 'unavailable';
      }
    }
    return null;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDates((prev) => {
      if (prev.some((d) => d.getTime() === date.getTime())) {
        return prev.filter((d) => d.getTime() !== date.getTime());
      }
      return [...prev, date].sort((a, b) => a.getTime() - b.getTime());
    });
  };

  const handleSetAvailability = async (isAvailable: boolean) => {
    if (selectedDates.length === 0) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const startDate = new Date(selectedDates[0]);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDates[selectedDates.length - 1]);
      endDate.setHours(23, 59, 59, 999);

      const response = await fetch(`/api/listings/${listingId}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isAvailable,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setSelectedDates([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadCalendar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/listings/${listingId}/calendar/sync`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la synchronisation');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadCalendar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Calendrier de disponibilité</h2>
        <p className="text-muted-foreground">
          Gérez les dates disponibles et indisponibles pour votre colocation
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-200 flex items-center gap-2" role="status">
          <CheckCircle2 className="h-4 w-4" />
          Disponibilité mise à jour avec succès
        </div>
      )}

      {/* Navigation mois */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth - 1]} {currentYear}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Synchroniser
              </>
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendrier */}
      <div className="rounded-lg border p-4">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const date = new Date(currentYear, currentMonth - 1, day);
            const status = getDateStatus(date);
            const isSelected = selectedDates.some((d) => d.getTime() === date.getTime());

            return (
              <button
                key={day}
                onClick={() => handleDateClick(date)}
                className={`aspect-square rounded border p-1 text-sm transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : status === 'available'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300'
                    : status === 'unavailable'
                    ? 'bg-red-100 dark:bg-red-900/30 border-red-300'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border bg-red-100 dark:bg-red-900/30 border-red-300" />
          <span>Indisponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border bg-primary" />
          <span>Sélectionné</span>
        </div>
      </div>

      {/* Actions */}
      {selectedDates.length > 0 && (
        <div className="space-y-2 rounded-lg border p-4">
          <Label>
            {selectedDates.length === 1
              ? `Date sélectionnée : ${selectedDates[0].toLocaleDateString('fr-FR')}`
              : `Plage sélectionnée : ${selectedDates[0].toLocaleDateString('fr-FR')} - ${selectedDates[selectedDates.length - 1].toLocaleDateString('fr-FR')}`}
          </Label>
          <div className="flex gap-2">
            <Button
              onClick={() => handleSetAvailability(true)}
              disabled={saving}
              variant="default"
              className="flex-1"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Marquer disponible
            </Button>
            <Button
              onClick={() => handleSetAvailability(false)}
              disabled={saving}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Marquer indisponible
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
