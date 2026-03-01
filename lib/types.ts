// Enums
export enum Role {
  ADMIN = "ADMIN",
  USER = "USER"
}

export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED"
}

export enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE"
}

export enum FileKind {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  OTHER = "OTHER"
}

// File Interface
export interface File {
  id: string;
  ownerId: string;
  kind: FileKind;
  visibility: Visibility;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}

// User Interface
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isActive: boolean;
  profilePictureId: string | null;
  profilePicture: File | null;
  profilePicturePath: string | null;
  cvFileId: string | null;
  cvFile: File | null;
  cvFilePath: string | null;
  aboutMe: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  phone: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

// Category Interface
export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

// Post Image Interface
export interface PostImage {
  postId: string;
  fileId: string;
  file: File;
  sort: number;
}

// Post Interface
export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  contentJson: any;
  contentHtml: string | null;
  status: PostStatus;
  visibility: Visibility;
  authorId: string;
  author?: User;
  coverFileId: string | null;
  coverFile?: File | null;
  coverImagePath: string | null;
  categories?: Category[];
  images?: PostImage[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Auth Response
export interface AuthResponse {
  user: User;
  token: string;
}

// Public Profile
export interface PublicProfile {
  id: string;
  name: string | null;
  aboutMe: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  website: string | null;
  profilePicture: File | null;
  profilePicturePath: string | null;
  cvFile: File | null;
  cvFilePath: string | null;
}

// API Request Types
export interface RegisterRequest {
  email: string;
  name?: string;
}

export interface SetPasswordRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  aboutMe?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  phone?: string;
  website?: string;
  profilePictureId?: string;
  profilePicturePath?: string | null;
  cvFileId?: string;
  cvFilePath?: string | null;
}

export interface CreatePostRequest {
  title: string;
  slug: string;
  summary?: string;
  contentJson: any;
  contentHtml?: string;
  status: PostStatus;
  visibility: Visibility;
  coverFileId?: string;
  coverImagePath?: string | null;
  categoryIds?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  slug?: string;
  summary?: string;
  contentJson?: any;
  contentHtml?: string;
  status?: PostStatus;
  visibility?: Visibility;
  coverFileId?: string;
  coverImagePath?: string | null;
  categoryIds?: string[];
}

export interface PostFilters {
  status?: PostStatus;
  visibility?: Visibility;
  authorId?: string;
  categoryId?: string;
  search?: string;
  sort?: 'CREATED_AT_DESC' | 'CREATED_AT_ASC' | 'PUBLISHED_AT_DESC' | 'PUBLISHED_AT_ASC';
  skip?: number;
  take?: number;
}
