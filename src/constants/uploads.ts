import { join } from 'path';

export const PRIVATE_UPLOAD_DIR = join(process.cwd(), 'uploads');
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
