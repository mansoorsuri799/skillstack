export const MAX_CHAT_FILE_SIZE = 8 * 1024 * 1024;
export const MAX_CHAT_FILES = 5;
export const MAX_CHAT_TOTAL_SIZE = 20 * 1024 * 1024;

export const CHAT_FILE_ACCEPT = [
  ".zip",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".avif",
  ".pdf",
  ".doc",
  ".docx",
  ".rtf",
  ".odt",
  ".txt",
  ".md",
  ".markdown",
  ".html",
  ".htm",
  ".csv",
  ".tsv",
  ".json",
  ".xml",
  ".xlsx",
  ".xls",
  ".pptx",
  ".ppt",
].join(",");

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif", "ico"]);
const ARCHIVE_EXT = new Set(["zip"]);
const SPREADSHEET_EXT = new Set(["csv", "tsv", "xlsx", "xls"]);
const DOCUMENT_EXT = new Set([
  "pdf",
  "doc",
  "docx",
  "rtf",
  "odt",
  "txt",
  "md",
  "markdown",
  "html",
  "htm",
  "json",
  "xml",
  "pptx",
  "ppt",
]);

export const CHAT_ALLOWED_EXTENSIONS = new Set([
  ...IMAGE_EXT,
  ...ARCHIVE_EXT,
  ...SPREADSHEET_EXT,
  ...DOCUMENT_EXT,
]);

export type ChatAttachmentKind = "image" | "document" | "archive" | "spreadsheet";

export type ChatAttachmentMeta = {
  name: string;
  mimeType: string;
  size: number;
  kind: ChatAttachmentKind;
};

export const DEFAULT_FILE_ANALYSIS_PROMPT =
  "Analyze the uploaded files for SEO, content quality, technical issues, and next steps.";

export function extensionOf(name: string): string {
  const base = name.split(/[/\\]/).pop() || name;
  const i = base.lastIndexOf(".");
  return i >= 0 ? base.slice(i + 1).toLowerCase() : "";
}

export function kindFromName(name: string, mimeType = ""): ChatAttachmentKind {
  const ext = extensionOf(name);
  const mime = mimeType.toLowerCase();
  if (IMAGE_EXT.has(ext) || mime.startsWith("image/")) return "image";
  if (ARCHIVE_EXT.has(ext) || mime.includes("zip") || mime.includes("compressed")) return "archive";
  if (SPREADSHEET_EXT.has(ext) || mime.includes("spreadsheet") || mime.includes("excel") || mime === "text/csv") {
    return "spreadsheet";
  }
  return "document";
}

export function isAllowedChatFile(name: string): boolean {
  return CHAT_ALLOWED_EXTENSIONS.has(extensionOf(name));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateChatFiles(files: Array<{ name: string; size: number }>): string | null {
  if (files.length === 0) return null;
  if (files.length > MAX_CHAT_FILES) {
    return `You can attach up to ${MAX_CHAT_FILES} files per message.`;
  }
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_CHAT_TOTAL_SIZE) {
    return `Total upload size must stay under ${formatFileSize(MAX_CHAT_TOTAL_SIZE)}.`;
  }
  for (const file of files) {
    if (!isAllowedChatFile(file.name)) {
      return `"${file.name}" is not a supported type. Upload ZIP, images, PDF, Word, CSV, HTML, or similar documents.`;
    }
    if (file.size <= 0) {
      return `"${file.name}" is empty.`;
    }
    if (file.size > MAX_CHAT_FILE_SIZE) {
      return `"${file.name}" is larger than ${formatFileSize(MAX_CHAT_FILE_SIZE)}.`;
    }
  }
  return null;
}
