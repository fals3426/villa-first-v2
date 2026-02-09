import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load MaskedChat pour réduire le bundle initial (composant lourd avec date-fns)
// Note: ssr: true par défaut car c'est un Server Component
const MaskedChat = dynamic(
  () => import('@/components/features/chat/MaskedChat').then((mod) => ({ default: mod.MaskedChat })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    ),
  }
);

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

/**
 * Page de chat masqué (Story 6.1)
 */
export default async function ChatPage(props: ChatPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { chatId } = await props.params;

  // Vérifier l'accès au chat
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!chat) {
    redirect('/bookings');
  }

  // Vérifier que l'utilisateur est participant
  if (chat.tenantId !== session.user.id && chat.hostId !== session.user.id) {
    redirect('/bookings');
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-8">
          <p className="text-label mb-2">MESSAGES</p>
          <h1 className="text-heading-2 mb-2">Chat masqué</h1>
          <p className="text-white/90">
            Communique en toute sécurité - Tes coordonnées sont protégées
          </p>
        </div>

        <MaskedChat chatId={chatId} listingTitle={chat.listing.title} />
      </div>
    </div>
  );
}
