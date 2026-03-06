/**
 * Local file upload utilities
 * Uses backend file upload API and returns public file URLs
 */

import { filesAPI } from './files';
import { Visibility } from '@/lib/types';

export type UploadCategory = 'profile' | 'article' | 'cv' | 'general';

export interface UploadResult {
  success: boolean;
  path: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: UploadCategory;
  fileId: string;
}

export interface UploadError {
  error: string;
}

/**
 * Upload a file using backend file service
 */
export async function uploadLocal(
  file: File,
  category: UploadCategory = 'general'
): Promise<UploadResult> {
  try {
    const uploadedFile = await filesAPI.upload(file, Visibility.PUBLIC);
    return {
      success: true,
      path: filesAPI.getUrl(uploadedFile.storageKey),
      filename: uploadedFile.storageKey,
      originalName: uploadedFile.originalName,
      mimeType: uploadedFile.mimeType,
      size: uploadedFile.size,
      category,
      fileId: uploadedFile.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    throw new Error(message);
  }
}

/**
 * Delete a locally uploaded file
 */
export async function deleteLocal(filePath: string): Promise<void> {
  throw new Error(`Delete by path is not supported in production: ${filePath}`);
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
