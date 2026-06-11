const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..", "src");
const checkedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".json"]);
const suspiciousPatterns = [
  { name: "replacement character", regex: /\uFFFD/ },
  { name: "likely mojibake", regex: /(?:Ã[\u0080-\u00BF]|Ä[\u0080-\u00BF]|Æ[\u0080-\u00BF]|á[\u0080-\u00BF]{1,2}|ðŸ)/ },
];
const unicodeEscapePattern = /\\u[0-9a-fA-F]{4}/;

const issues = [];

const shouldIgnoreUnicodeEscape = (line) => {
  const trimmed = line.trim();
  return (
    trimmed.includes(".replace(") ||
    trimmed.includes("RegExp(") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("*")
  );
};

const scanFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const relPath = path.relative(path.resolve(__dirname, ".."), filePath).replace(/\\/g, "/");

  content.split(/\r?\n/).forEach((line, index) => {
    suspiciousPatterns.forEach((pattern) => {
      if (pattern.regex.test(line)) {
        issues.push(`${relPath}:${index + 1} ${pattern.name}`);
      }
    });

    if (unicodeEscapePattern.test(line) && !shouldIgnoreUnicodeEscape(line)) {
      issues.push(`${relPath}:${index + 1} unicode escape in UI/source text`);
    }
  });
};

const walk = (dir) => {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(filePath);
      return;
    }
    if (checkedExtensions.has(path.extname(entry.name))) {
      scanFile(filePath);
    }
  });
};

walk(rootDir);

if (issues.length > 0) {
  console.error("UTF-8 scan failed:");
  console.error(issues.join("\n"));
  process.exit(1);
}

console.log("UTF-8 scan passed.");
