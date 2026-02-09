export type ListingStatus = 'draft' | 'published' | 'suspended';
export type ListingType = 'VILLA' | 'ROOM' | 'SHARED_ROOM';
export type PhotoCategory = 'KITCHEN' | 'BEDROOM' | 'BATHROOM' | 'OUTDOOR' | 'OTHER';

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  address: string;
  location?: string;
  capacity: number;
  listingType: ListingType;
  status: ListingStatus;
  pricePerPlace?: number;
  rules?: Record<string, unknown>;
  charter?: string;
  completenessScore?: number;
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListingInput {
  title: string;
  description: string;
  address: string;
  location?: string;
  capacity: number;
  listingType: ListingType;
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  address?: string;
  location?: string;
  capacity?: number;
  listingType?: ListingType;
  pricePerPlace?: number;
  rules?: Record<string, unknown>;
  charter?: string;
}
