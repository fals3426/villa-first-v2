import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

// S'assurer que la clé fait 32 bytes
const getEncryptionKey = (): Buffer => {
  const key = ENCRYPTION_KEY.length === 64 
    ? Buffer.from(ENCRYPTION_KEY, 'hex')
    : crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  return key.slice(0, 32);
};

export const secureStorageService = {
  async uploadDocument(
    file: File,
    userId: string,
    type: 'kyc'
  ): Promise<string> {
    // Lire le buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Chiffrer
    const iv = crypto.randomBytes(16);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final(),
    ]);

    // Sauvegarder avec IV préfixé
    const uploadsDir = path.join(process.cwd(), 'secure', type, userId);
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);

    // Préfixer avec IV pour le déchiffrement
    const fileWithIv = Buffer.concat([iv, encrypted]);
    await writeFile(filepath, fileWithIv);

    // Retourner l'URL (sans révéler le chemin réel complet)
    return `/secure/${type}/${userId}/${filename}`;
  },

  async getDocument(url: string): Promise<Buffer> {
    // Extraire le chemin depuis l'URL
    const urlPath = url.replace(/^\/secure\//, '');
    const filepath = path.join(process.cwd(), 'secure', urlPath);

    // Lire le fichier chiffré
    const encrypted = await import('fs/promises').then((fs) =>
      fs.readFile(filepath)
    );

    // Extraire IV (16 premiers bytes)
    const iv = encrypted.slice(0, 16);
    const encryptedData = encrypted.slice(16);

    // Déchiffrer
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted;
  },
};
