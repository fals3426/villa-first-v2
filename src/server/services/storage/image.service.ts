import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const imageService = {
  async uploadProfilePicture(
    file: File,
    userId: string
  ): Promise<string> {
    // Lire le buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Valider le format
    const validFormats = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validFormats.includes(file.type)) {
      throw new Error('INVALID_FORMAT');
    }

    // Valider la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('FILE_TOO_LARGE');
    }

    // Redimensionner et optimiser
    const optimized = await sharp(buffer)
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Sauvegarder (stockage local pour MVP)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${userId}-${Date.now()}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, optimized);

    // Retourner l'URL
    return `/uploads/profiles/${filename}`;
  },
};
