'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { CreateListingInput } from '@/types/listing.types';

interface ListingFormProps {
  initialData?: Partial<CreateListingInput>;
  listingId?: string;
  onSubmit: (data: CreateListingInput) => Promise<void>;
}

export function ListingForm({ initialData, listingId, onSubmit }: ListingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateListingInput>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    location: initialData?.location || '',
    capacity: initialData?.capacity || 1,
    listingType: initialData?.listingType || 'VILLA',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de la sauvegarde'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          Titre de l&apos;annonce <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Ex: Villa moderne à Canggu avec piscine"
          required
          minLength={10}
          aria-describedby="title-help"
        />
        <p id="title-help" className="text-xs text-muted-foreground">
          Minimum 10 caractères
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Décrivez votre coloc en détail..."
          required
          minLength={50}
          rows={6}
          aria-describedby="description-help"
        />
        <p id="description-help" className="text-xs text-muted-foreground">
          Minimum 50 caractères
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="address">
            Adresse complète <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="Ex: Jl. Pantai Berawa, Canggu"
            required
            minLength={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Zone (optionnel)</Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="Ex: Canggu, Ubud, Seminyak"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="capacity">
            Nombre de places <span className="text-destructive">*</span>
          </Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                capacity: parseInt(e.target.value) || 1,
              }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="listingType">
            Type de coloc <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.listingType}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                listingType: value as 'VILLA' | 'ROOM' | 'SHARED_ROOM',
              }))
            }
            required
          >
            <SelectTrigger id="listingType">
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VILLA">Villa entière</SelectItem>
              <SelectItem value="ROOM">Chambre privée</SelectItem>
              <SelectItem value="SHARED_ROOM">Chambre partagée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Enregistrement...'
            : listingId
              ? 'Mettre à jour'
              : 'Créer l\'annonce'}
        </Button>
      </div>
    </form>
  );
}
