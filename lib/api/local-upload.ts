/**
 * Local file upload utilities
 * Handles uploading files to the Next.js public folder
 */

export type UploadCategory = 'profile' | 'article' | 'cv' | 'general';

export interface UploadResult {
  success: boolean;
  path: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: UploadCategory;
}

export interface UploadError {
  error: string;
}

/**
 * Upload a file locally to the Next.js public folder
 */
export async function uploadLocal(
  file: File,
  category: UploadCategory = 'general'
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error: UploadError = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

/**
 * Delete a locally uploaded file
 */
export async function deleteLocal(filePath: string): Promise<void> {
  const response = await fetch(`/api/upload/delete?path=${encodeURIComponent(filePath)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error: UploadError = await response.json();
    throw new Error(error.error || 'Delete failed');
  }
}

/**
 * Upload profile picture
 */
export async function uploadProfilePicture(file: File): Promise<string> {
  const result = await uploadLocal(file, 'profile');
  return result.path;
}

/**
 * Upload article cover image
 */
export async function uploadArticleCover(file: File): Promise<string> {
  const result = await uploadLocal(file, 'article');
  return result.path;
}

/**
 * Upload CV/resume PDF
 */
export async function uploadCV(file: File): Promise<string> {
  const result = await uploadLocal(file, 'cv');
  return result.path;
}
