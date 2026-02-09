'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatButtonProps {
  bookingId: string;
  label?: string;
}

/**
 * Bouton pour ouvrir le chat d'une réservation (Story 6.1)
 */
export function ChatButton({ bookingId, label = 'Ouvrir le chat' }: ChatButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleOpenChat = async () => {
    try {
      setLoading(true);
      // Récupérer ou créer le chat pour cette réservation
      const response = await fetch(`/api/chat/booking/${bookingId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'ouverture du chat');
      }
      const result = await response.json();
      // Rediriger vers la page de chat
      router.push(`/chat/${result.data.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'ouverture du chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleOpenChat} disabled={loading} className="gap-2">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Ouverture...
        </>
      ) : (
        <>
          <MessageSquare className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
