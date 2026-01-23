export type VibesCategory =
  | 'work'
  | 'lifestyle'
  | 'activities'
  | 'social'
  | 'wellness';

export type VibesPreferences = {
  work?: ('remote' | 'office' | 'hybrid')[];
  lifestyle?: ('calm' | 'festive' | 'balanced')[];
  activities?: ('yoga' | 'sport' | 'music' | 'art' | 'reading')[];
  social?: ('introvert' | 'extrovert' | 'mixed')[];
  wellness?: ('meditation' | 'fitness' | 'spa' | 'nature')[];
};

export const VIBES_CATEGORIES: Record<
  VibesCategory,
  {
    label: string;
    options: { value: string; label: string }[];
  }
> = {
  work: {
    label: 'Travail',
    options: [
      { value: 'remote', label: 'Télétravail' },
      { value: 'office', label: 'Bureau' },
      { value: 'hybrid', label: 'Hybride' },
    ],
  },
  lifestyle: {
    label: 'Style de vie',
    options: [
      { value: 'calm', label: 'Calme' },
      { value: 'festive', label: 'Festif' },
      { value: 'balanced', label: 'Équilibré' },
    ],
  },
  activities: {
    label: 'Activités',
    options: [
      { value: 'yoga', label: 'Yoga' },
      { value: 'sport', label: 'Sport' },
      { value: 'music', label: 'Musique' },
      { value: 'art', label: 'Art' },
      { value: 'reading', label: 'Lecture' },
    ],
  },
  social: {
    label: 'Social',
    options: [
      { value: 'introvert', label: 'Introverti' },
      { value: 'extrovert', label: 'Extraverti' },
      { value: 'mixed', label: 'Mixte' },
    ],
  },
  wellness: {
    label: 'Bien-être',
    options: [
      { value: 'meditation', label: 'Méditation' },
      { value: 'fitness', label: 'Fitness' },
      { value: 'spa', label: 'Spa' },
      { value: 'nature', label: 'Nature' },
    ],
  },
};
