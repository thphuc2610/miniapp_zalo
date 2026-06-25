const fs = require('fs');

let path = 'src/shared/services/serviceCatalog.service.ts';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `  status: asString(article.status) || null,\n});`;
const replacementStr = `  status: asString(article.status) || null,\n  viewCount: Number(article.viewCount || article.views || 0),\n  authorName: asString(article.authorName) || null,\n});`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync(path, content, 'utf8');
console.log('Done patching normalizeArticle');
