import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// Upload categories and their directories
const UPLOAD_DIRS: Record<string, string> = {
  profile: 'images/profile',
  article: 'images/article',
  cv: 'files/cv',
  general: 'uploads',
};

// Allowed file types per category
const ALLOWED_TYPES: Record<string, string[]> = {
  profile: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  article: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  cv: ['application/pdf'],
  general: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
};

// Max file sizes in bytes
const MAX_SIZES: Record<string, number> = {
  profile: 5 * 1024 * 1024, // 5MB
  article: 10 * 1024 * 1024, // 10MB
  cv: 10 * 1024 * 1024, // 10MB
  general: 25 * 1024 * 1024, // 25MB
};

function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate category
    if (!UPLOAD_DIRS[category]) {
      return NextResponse.json(
        { error: 'Invalid upload category' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ALLOWED_TYPES[category];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed for ${category}` },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = MAX_SIZES[category];
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', UPLOAD_DIRS[category]);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename and save file
    const filename = generateFilename(file.name);
    const filePath = path.join(uploadDir, filename);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the public URL path
    const publicPath = `/${UPLOAD_DIRS[category]}/${filename}`;

    return NextResponse.json({
      success: true,
      path: publicPath,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      category,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
