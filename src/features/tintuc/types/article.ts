export interface SpaArticle {
  id: string;
  title?: string;
  name?: string;
  summary?: string | null;
  description?: string | null;
  content?: string | null;
  contentHtml?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  coverImageUrl?: string | null;
  categoryName?: string | null;
  typeName?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  status?: string | null;
  viewCount?: number;
  authorName?: string | null;
}
