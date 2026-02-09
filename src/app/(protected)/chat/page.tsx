import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { chatService } from '@/server/services/chat/chat.service';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Page de liste des chats (Story 6.1)
 */
export default async function ChatListPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const chats = await chatService.getUserChats(session.user.id);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-white" />
            <div>
              <p className="text-label mb-1">MESSAGES</p>
              <h1 className="text-heading-2">Messages</h1>
              <p className="text-white/90 mt-2">
                {chats.length === 0
                  ? 'Aucun message pour le moment'
                  : `${chats.length} conversation${chats.length > 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
        </div>

        {chats.length === 0 ? (
          <Card variant="v1-default" className="p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-zinc-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Aucun message</h2>
            <p className="text-zinc-400 mb-6">
              Tes conversations avec les hôtes et locataires apparaîtront ici une fois que tu auras réservé une coloc.
            </p>
            <Link href="/listings">
              <Button variant="v1-primary">
                Explorer les annonces
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <Link key={chat.id} href={`/chat/${chat.id}`}>
                <Card variant="v1-default" interactive className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white">
                        {chat.listing?.title || 'Annonce'}
                      </h3>
                      {chat.messages && chat.messages.length > 0 && (
                        <p className="text-sm text-zinc-400 mt-1 line-clamp-1">
                          {chat.messages[chat.messages.length - 1]?.content}
                        </p>
                      )}
                      {chat.messages && chat.messages.length > 0 && chat.messages[chat.messages.length - 1]?.createdAt && (
                        <p className="text-xs text-zinc-500 mt-2">
                          {new Date(chat.messages[chat.messages.length - 1]!.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-zinc-400 ml-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
