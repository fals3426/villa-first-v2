'use client';

import { useState } from 'react';
import {
  VIBES_CATEGORIES,
  type VibesPreferences,
} from '@/types/vibes.types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { VibeTag } from '@/components/features/vibes/VibeTag';
import { Button } from '@/components/ui/button';

interface VibesQuestionnaireProps {
  initialValues?: VibesPreferences;
  onSubmit: (preferences: VibesPreferences) => Promise<void>;
  isEditing?: boolean;
}

export function VibesQuestionnaire({
  initialValues = {},
  onSubmit,
  isEditing = false,
}: VibesQuestionnaireProps) {
  const [preferences, setPreferences] =
    useState<VibesPreferences>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = (
    category: keyof VibesPreferences,
    value: string
  ) => {
    setPreferences((prev) => {
      const current = (prev[category] as string[]) || [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: newValues };
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Vérifier qu'au moins une préférence est sélectionnée
    const hasSelection = Object.values(preferences).some(
      (arr) => arr && arr.length > 0
    );

    if (!hasSelection) {
      setError('Sélectionnez au moins une préférence');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(preferences);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Une erreur est survenue'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {Object.entries(VIBES_CATEGORIES).map(([key, category]) => (
        <div key={key} className="space-y-4">
          <Label className="text-lg font-semibold">
            {category.label}
          </Label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {category.options.map((option) => {
              const isChecked =
                (preferences[key as keyof VibesPreferences] as string[])?.includes(
                  option.value
                ) || false;
              return (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent"
                >
                  <Checkbox
                    id={`${key}-${option.value}`}
                    checked={isChecked}
                    onCheckedChange={() =>
                      handleToggle(key as keyof VibesPreferences, option.value)
                    }
                  />
                  <Label
                    htmlFor={`${key}-${option.value}`}
                    className="cursor-pointer flex-1 font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting
            ? 'Enregistrement...'
            : isEditing
              ? 'Mettre à jour'
              : 'Continuer'}
        </Button>
      </div>
    </form>
  );
}
