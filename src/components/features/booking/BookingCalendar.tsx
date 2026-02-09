'use client';

import { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AvailabilitySlot {
  id: string;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
}

interface BookingRange {
  checkIn: string;
  checkOut: string;
}

interface BookingCalendarProps {
  listingId: string;
  checkIn: string;
  checkOut: string;
  onDatesChange: (checkIn: string, checkOut: string) => void;
  disabled?: boolean;
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);
  return d >= s && d <= e;
}

export function BookingCalendar({
  listingId,
  checkIn,
  checkOut,
  onDatesChange,
  disabled = false,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<BookingRange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/listings/${listingId}/availability?month=${currentMonth}&year=${currentYear}`
        );
        if (!res.ok) throw new Error('Erreur chargement');
        const data = await res.json();
        setSlots(data.data.slots || []);
        setBookings(data.data.bookings || []);
      } catch {
        setSlots([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [listingId, currentMonth, currentYear]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateOccupied = (date: Date): boolean => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);

    for (const slot of slots) {
      if (slot.isAvailable) continue;
      const start = new Date(slot.startDate);
      const end = new Date(slot.endDate);
      if (isDateInRange(d, start, end)) return true;
    }

    for (const b of bookings) {
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      if (isDateInRange(d, start, end)) return true;
    }

    return false;
  };

  const isDateAvailable = (date: Date): boolean => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    if (d < today) return false;
    return !isDateOccupied(date);
  };

  const handleDateClick = (date: Date) => {
    if (disabled || !isDateAvailable(date)) return;

    const dateStr = format(date, 'yyyy-MM-dd');

    if (!checkIn || (checkIn && checkOut)) {
      onDatesChange(dateStr, '');
    } else if (dateStr <= checkIn) {
      onDatesChange(dateStr, '');
    } else {
      onDatesChange(checkIn, dateStr);
    }
  };

  const getDateStatus = (date: Date): 'past' | 'occupied' | 'available' | 'selected' | 'in-range' => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    if (d < today) return 'past';
    if (isDateOccupied(date)) return 'occupied';

    const dateStr = format(date, 'yyyy-MM-dd');
    if (dateStr === checkIn || dateStr === checkOut) return 'selected';
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      if (isDateInRange(date, start, end)) return 'in-range';
    }

    return 'available';
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
    if (dir === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthName = format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy', { locale: fr });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 animate-spin text-emerald-400 relative" />
        </div>
        <p className="mt-4 text-sm text-zinc-400 animate-pulse">Chargement des disponibilités...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm p-5 md:p-6 shadow-xl shadow-black/20 animate-slide-up">
      {/* Header avec gradient subtil */}
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl bg-white/5 ring-1 ring-white/10">
          <CalendarDays className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Choisissez vos dates</p>
          <p className="text-sm text-zinc-300">Sélectionnez arrivée puis départ</p>
        </div>
      </div>

      {/* Navigation mois - boutons modernes */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => navigateMonth('prev')}
          className="group p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
        </button>
        <h3 className="text-lg font-semibold text-white capitalize tracking-tight">
          {monthName}
        </h3>
        <button
          type="button"
          onClick={() => navigateMonth('next')}
          className="group p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Grille calendrier */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const date = new Date(currentYear, currentMonth - 1, day);
          const status = getDateStatus(date);

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(date)}
              disabled={disabled || status === 'past' || status === 'occupied'}
              className={`
                aspect-square rounded-xl text-sm font-semibold transition-all duration-200
                ease-out
                ${status === 'past'
                  ? 'text-zinc-600/60 bg-zinc-800/30 cursor-not-allowed'
                  : ''
                }
                ${status === 'occupied'
                  ? 'text-red-400/70 bg-red-500/10 border border-red-500/20 cursor-not-allowed'
                  : ''
                }
                ${status === 'available'
                  ? 'text-white bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-transparent cursor-pointer hover:scale-105 active:scale-95'
                  : ''
                }
                ${status === 'selected'
                  ? 'text-black bg-white shadow-lg shadow-white/20 ring-2 ring-emerald-400/50 cursor-pointer scale-105'
                  : ''
                }
                ${status === 'in-range'
                  ? 'text-white bg-emerald-500/15 border border-emerald-500/30 cursor-pointer'
                  : ''
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Légende - design épuré */}
      <div className="flex flex-wrap gap-6 mt-6 pt-5 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-3 rounded-full bg-emerald-500/30 ring-2 ring-emerald-500/50" />
          <span className="text-xs text-zinc-400">Disponible</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-3 rounded-full bg-red-500/30 ring-2 ring-red-500/30" />
          <span className="text-xs text-zinc-400">Occupé</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-3 rounded-full bg-zinc-700/50" />
          <span className="text-xs text-zinc-400">Passé</span>
        </div>
      </div>
    </div>
  );
}
