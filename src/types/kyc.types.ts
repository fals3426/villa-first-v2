export type KycStatus = 'pending' | 'verified' | 'rejected' | 'not_started';

export interface KycVerification {
  id: string;
  userId: string;
  documentUrl: string;
  status: KycStatus;
  provider: string;
  providerId?: string | null;
  verifiedAt?: Date | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
