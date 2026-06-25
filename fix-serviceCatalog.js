const fs = require('fs');

let path = 'src/shared/services/serviceCatalog.service.ts';
let content = fs.readFileSync(path, 'utf8');

const corrupted = `const normalizeBanner = (banner: RawRecord): SpaBanner => ({
};

export const getSpaCombos = async (): Promise<unknown[]> => {`;

const fixed = `const normalizeBanner = (banner: RawRecord): SpaBanner => ({
  id: asString(banner.id),
  imageUrl: asString(banner.imageUrl),
  title: asString(banner.title) || null,
  link: asString(banner.link) || null,
});

const normalizeArticle = (article: RawRecord): SpaArticle => ({
  id: asString(article.id),
  title: asString(article.title) || undefined,
  name: asString(article.name) || undefined,
  summary: asString(article.summary) || null,
  description: asString(article.description) || null,
  content: asString(article.content) || null,
  contentHtml: asString(article.contentHtml) || null,
  imageUrl: asString(article.imageUrl) || null,
  thumbnailUrl: asString(article.thumbnailUrl) || null,
  coverImageUrl: asString(article.coverImageUrl) || null,
  categoryName: asString(article.categoryName) || null,
  typeName: asString(article.typeName) || null,
  publishedAt: asString(article.publishedAt) || null,
  createdAt: asString(article.createdAt) || null,
  status: asString(article.status) || null,
  viewCount: Number(article.viewCount) || Number(article.views) || 0,
  authorName: asString(article.authorName) || asString(article.author) || asString(article.createdByName) || null,
});

export const getSpaServices = async (): Promise<SpaService[]> => {
  try {
    const res = await httpClient.get({ url: API_ENDPOINTS.services });
    if (res.data && res.data.success) {
       return asRawArray(res.data.data).map(normalizeService);
    }
    return [];
  } catch (error) {
    console.error("Fetch services failed:", error);
    return [];
  }
};

export const getSpaCombos = async (): Promise<unknown[]> => {`;

content = content.replace(corrupted.replace(/\r/g, ''), fixed.replace(/\r/g, ''));
fs.writeFileSync(path, content, 'utf8');
console.log("Fixed serviceCatalog.service.ts");
