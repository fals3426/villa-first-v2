import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Obtenir la clé de chiffrement (32 bytes)
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY || '';
  if (key.length === 64) {
    // Clé hexadécimale de 32 bytes
    return Buffer.from(key, 'hex');
  }
  // Générer une clé depuis une chaîne
  return crypto.createHash('sha256').update(key || 'default-key-change-in-production').digest();
};

export const encryptionService = {
  encrypt(text: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Retourner iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  },

  decrypt(encryptedData: string): string {
    const key = getEncryptionKey();
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  },
};
