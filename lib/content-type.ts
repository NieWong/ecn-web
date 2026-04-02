import { Category, Post } from '@/lib/types';

export enum ContentType {
  CONTENT = 'CONTENT',
  NEWS = 'NEWS',
}

export const ContentTypeLabels: Record<ContentType, string> = {
  [ContentType.CONTENT]: 'Контент / Нийтлэл',
  [ContentType.NEWS]: 'Мэдээ, мэдээлэл',
};

const NEWS_CATEGORY_SLUGS = new Set(['ecn-news', 'news']);

export const isNewsCategory = (category: Pick<Category, 'slug'>) => NEWS_CATEGORY_SLUGS.has(category.slug.toLowerCase());

export const inferContentTypeFromCategories = (categories?: Pick<Category, 'slug'>[] | null): ContentType => {
  if (!categories || categories.length === 0) return ContentType.CONTENT;
  return categories.some((category) => isNewsCategory(category)) ? ContentType.NEWS : ContentType.CONTENT;
};

export const inferContentTypeFromPost = (post: Pick<Post, 'categories'>): ContentType => {
  return inferContentTypeFromCategories(post.categories);
};

export const getNewsCategory = (categories: Pick<Category, 'id' | 'slug'>[]) => {
  return categories.find((category) => isNewsCategory(category));
};

export const normalizeCategoryIdsByContentType = (
  selectedCategoryIds: string[],
  categories: Pick<Category, 'id' | 'slug'>[],
  contentType: ContentType
) => {
  const newsCategoryIds = new Set(categories.filter((category) => isNewsCategory(category)).map((category) => category.id));

  const withoutNewsCategory = selectedCategoryIds.filter((categoryId) => !newsCategoryIds.has(categoryId));

  if (contentType === ContentType.NEWS) {
    const newsCategory = getNewsCategory(categories);
    if (!newsCategory) return null;
    return Array.from(new Set([...withoutNewsCategory, newsCategory.id]));
  }

  return withoutNewsCategory;
};
