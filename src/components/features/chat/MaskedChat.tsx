'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns/format';
import { useSocket } from '@/lib/socket';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: 'tenant' | 'host';
  createdAt: string;
}

interface MaskedChatProps {
  chatId: string;
  listingTitle: string;
}

/**
 * Composant de chat masqué (Story 6.1, 6.2)
 */
export function MaskedChat({ chatId, listingTitle }: MaskedChatProps) {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Charger l'historique des messages
  useEffect(() => {
    loadHistory();
  }, [chatId]);

  // Polling pour nouveaux messages (temporaire, sera remplacé par Socket.IO)
  // Initialisation différée pour ne pas bloquer le bf-cache
  useEffect(() => {
    if (!chatId) return;

    // Différer le démarrage du polling après le chargement initial
    const startPolling = () => {
      const interval = setInterval(() => {
        loadHistory();
      }, 3000); // Poll toutes les 3 secondes
      return interval;
    };

    let interval: NodeJS.Timeout;
    
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        const id = requestIdleCallback(() => {
          interval = startPolling();
        }, { timeout: 1000 });
        return () => {
          cancelIdleCallback(id);
          if (interval) clearInterval(interval);
        };
      } else {
        const timeoutId = setTimeout(() => {
          interval = startPolling();
        }, 100);
        return () => {
          clearTimeout(timeoutId);
          if (interval) clearInterval(interval);
        };
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chatId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setMessages(data.data.messages || []);
      scrollToBottom();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async () => {
    if (!messageContent.trim() || sending) return;

    try {
      setSending(true);
      setError(null);

      // Envoyer via API REST (Story 6.1)
      // TODO: Migrer vers Socket.IO pour temps réel
      const response = await fetch(`/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      const result = await response.json();
      
      // Ajouter le message à la liste localement
      setMessages((prev) => [...prev, result.data]);
      setMessageContent('');
      scrollToBottom();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    // TODO: Implémenter avec Socket.IO
    // Pour l'instant, pas d'indicateur de frappe
  };

  const getSenderLabel = (message: Message) => {
    if (message.senderId === session?.user?.id) {
      return 'Vous';
    }
    return message.senderType === 'tenant' ? 'Locataire' : 'Hôte';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-card">
      {/* En-tête */}
      <div className="border-b p-4 bg-muted/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-semibold">{listingTitle}</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Chat masqué - Vos coordonnées sont protégées
        </p>
        {!isConnected && (
          <p className="text-xs text-yellow-600 mt-1">
            Reconnexion en cours...
          </p>
        )}
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Aucun message pour le moment.</p>
            <p className="text-sm mt-2">Commencez la conversation !</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === session?.user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {getSenderLabel(message)}
                    </span>
                    <span className="text-xs opacity-70">
                      {format(new Date(message.createdAt), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground italic">
                {getSenderLabel({ senderType: 'tenant' } as Message)} est en train d'écrire...
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="border-t p-4">
        {error && (
          <div className="mb-2 text-sm text-destructive">{error}</div>
        )}
        <div className="flex gap-2">
          <Input
            value={messageContent}
            onChange={(e) => {
              setMessageContent(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tapez votre message..."
            disabled={!isConnected || sending}
            maxLength={5000}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!messageContent.trim() || !isConnected || sending}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {messageContent.length}/5000 caractères
        </p>
      </div>
    </div>
  );
}
