import { inflate, inflateRaw } from "zlib";
import { promisify } from "util";
import JSZip from "jszip";
import {
  extensionOf,
  formatFileSize,
  kindFromName,
  validateChatFiles,
  type ChatAttachmentKind,
  type ChatAttachmentMeta,
} from "@/lib/chat/file-types";

const inflateAsync = promisify(inflate);
const inflateRawAsync = promisify(inflateRaw);

const MAX_TEXT_PER_FILE = 24_000;
const MAX_REPORT_CHARS = 14_000;
const MAX_ZIP_ENTRIES = 40;
const MAX_ZIP_UNCOMPRESSED = 25 * 1024 * 1024;
const SKIP_ZIP_EXT = new Set([
  "exe",
  "dll",
  "so",
  "dylib",
  "bin",
  "dmg",
  "pkg",
  "apk",
  "ipa",
  "bat",
  "cmd",
  "sh",
  "ps1",
  "wasm",
]);

export type AnalyzedChatFile = ChatAttachmentMeta & {
  findings: string[];
  extractedText: string;
};

export type ChatFileAnalysis = {
  attachments: ChatAttachmentMeta[];
  report: string;
  synthesisBrief: string;
};

type IncomingFile = {
  name: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
};

export async function analyzeChatUploads(files: IncomingFile[]): Promise<ChatFileAnalysis> {
  const validationError = validateChatFiles(files);
  if (validationError) {
    throw new Error(validationError);
  }

  const analyzed: AnalyzedChatFile[] = [];
  for (const file of files) {
    analyzed.push(await analyzeOneFile(file));
  }

  const report = buildReport(analyzed);
  return {
    attachments: analyzed.map(({ name, mimeType, size, kind }) => ({
      name,
      mimeType,
      size,
      kind,
    })),
    report,
    synthesisBrief: buildSynthesisBrief(analyzed),
  };
}

async function analyzeOneFile(file: IncomingFile, nested = false): Promise<AnalyzedChatFile> {
  const kind = kindFromName(file.name, file.mimeType);
  const ext = extensionOf(file.name);
  const findings: string[] = [];
  let extractedText = "";

  try {
    if (kind === "image") {
      const image = analyzeImage(file);
      findings.push(...image.findings);
      extractedText = image.text;
    } else if (ext === "zip" && !nested) {
      const archive = await analyzeZip(file);
      findings.push(...archive.findings);
      extractedText = archive.text;
    } else if (ext === "zip" && nested) {
      findings.push("Nested ZIP skipped to avoid unsafe extraction.");
    } else if (ext === "pdf") {
      const pdf = await extractPdf(file.buffer);
      findings.push(...pdf.findings);
      extractedText = pdf.text;
    } else if (ext === "docx" || ext === "odt" || ext === "pptx") {
      const office = await extractOfficeXml(file.buffer, ext);
      findings.push(...office.findings);
      extractedText = office.text;
    } else if (ext === "xlsx") {
      const sheet = await extractXlsx(file.buffer);
      findings.push(...sheet.findings);
      extractedText = sheet.text;
    } else if (ext === "html" || ext === "htm") {
      const html = analyzeHtml(file.buffer.toString("utf8"), file.name);
      findings.push(...html.findings);
      extractedText = html.text;
    } else if (ext === "svg") {
      const svg = analyzeSvg(file);
      findings.push(...svg.findings);
      extractedText = svg.text;
    } else if (ext === "json") {
      extractedText = truncateText(file.buffer.toString("utf8"), MAX_TEXT_PER_FILE);
      findings.push(...analyzeJsonText(extractedText));
    } else if (ext === "csv" || ext === "tsv") {
      const table = analyzeDelimited(file.buffer.toString("utf8"), ext === "tsv" ? "\t" : ",");
      findings.push(...table.findings);
      extractedText = table.text;
    } else if (ext === "xml") {
      extractedText = stripXml(file.buffer.toString("utf8"));
      findings.push(`XML document with ${wordCount(extractedText)} words of readable text.`);
    } else if (ext === "md" || ext === "markdown" || ext === "txt" || ext === "rtf") {
      extractedText =
        ext === "rtf" ? stripRtf(file.buffer.toString("utf8")) : file.buffer.toString("utf8");
      findings.push(...analyzePlainContent(extractedText, file.name));
    } else if (ext === "doc" || ext === "xls" || ext === "ppt") {
      findings.push(
        "Legacy Office binary format. Export to DOCX, XLSX, PDF, or CSV so Suri can read the full contents.",
      );
    } else {
      if (looksLikeText(file.buffer)) {
        extractedText = file.buffer.toString("utf8");
        findings.push(...analyzePlainContent(extractedText, file.name));
      } else {
        findings.push("Binary file stored. No readable text could be extracted.");
      }
    }
  } catch (error) {
    findings.push(
      `Could not fully parse this file (${error instanceof Error ? error.message : "unknown error"}).`,
    );
  }

  extractedText = truncateText(cleanText(extractedText), MAX_TEXT_PER_FILE);
  if (!findings.length) {
    findings.push(
      extractedText
        ? `Extracted ${wordCount(extractedText)} words of readable content.`
        : "No extractable text found.",
    );
  }

  return {
    name: file.name,
    mimeType: file.mimeType || guessMime(file.name),
    size: file.size,
    kind,
    findings,
    extractedText,
  };
}

function analyzeImage(file: IncomingFile): { findings: string[]; text: string } {
  const findings: string[] = [];
  const ext = extensionOf(file.name);
  const dim = readImageDimensions(file.buffer, ext);
  const kb = file.size / 1024;
  const slug = file.name.replace(/\.[^.]+$/, "");

  findings.push(
    dim
      ? `Image ${dim.width}×${dim.height}px, ${formatFileSize(file.size)}, ${ext.toUpperCase()} format.`
      : `${ext.toUpperCase()} image, ${formatFileSize(file.size)}. Dimensions could not be read.`,
  );

  if (kb > 300) {
    findings.push(
      `File is ${Math.round(kb)} KB — compress or convert to WebP/AVIF. Hero/content images should usually stay under 200–300 KB.`,
    );
  } else if (kb > 150 && ext !== "svg") {
    findings.push("Moderately large image. Compress further if this appears above the fold.");
  } else {
    findings.push("File size is in a healthy range for web use.");
  }

  if (ext === "png" && kb > 80) {
    findings.push("PNG is often oversized for photos. Use WebP or JPEG unless transparency is required.");
  }
  if (ext === "bmp") {
    findings.push("BMP is not web-safe. Convert to WebP, JPEG, or PNG.");
  }
  if (dim && dim.width > 2400) {
    findings.push(
      `Width is ${dim.width}px. Serve a 1200–1600px version (or srcset) unless this is a product zoom image.`,
    );
  }
  if (/\s/.test(file.name)) {
    findings.push("Filename contains spaces. Use lowercase-hyphenated names (example: gilgit-trekking-guide.jpg).");
  }
  if (/^(img|image|photo|dsc|screenshot|untitled|download)[-_\d]*$/i.test(slug)) {
    findings.push(
      "Generic filename. Rename with a descriptive keyword phrase before uploading to the site.",
    );
  } else if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(slug)) {
    findings.push("Filename is descriptive — good for image SEO.");
  }

  findings.push("Add a specific alt attribute describing the subject; do not stuff keywords.");
  findings.push("Pixel contents are not OCR'd. For SERP or Search Console screenshots, export CSV/PDF with selectable text for a deeper read.");

  const text = [
    `Image: ${file.name}`,
    dim ? `Dimensions: ${dim.width}×${dim.height}` : null,
    `Size: ${formatFileSize(file.size)}`,
    `Format: ${ext}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { findings, text };
}

function analyzeSvg(file: IncomingFile): { findings: string[]; text: string } {
  const raw = file.buffer.toString("utf8");
  const findings = [
    `SVG graphic, ${formatFileSize(file.size)}.`,
    /<script/i.test(raw)
      ? "Contains a <script> tag. Strip scripts before using this SVG on a public page."
      : "No embedded script tag detected.",
  ];
  if (file.size > 80 * 1024) {
    findings.push("SVG is large. Simplify paths or switch to a compressed raster if it is photographic.");
  }
  return { findings, text: truncateText(stripXml(raw), 4000) };
}

async function analyzeZip(file: IncomingFile): Promise<{ findings: string[]; text: string }> {
  const zip = await JSZip.loadAsync(file.buffer);
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  const findings: string[] = [
    `Archive contains ${entries.length} file${entries.length === 1 ? "" : "s"}.`,
  ];

  let uncompressed = 0;
  const innerReports: string[] = [];
  const htmlPages: AnalyzedChatFile[] = [];
  let inspected = 0;

  for (const entry of entries) {
    if (!safeZipPath(entry.name)) {
      findings.push(`Skipped unsafe path: ${entry.name}`);
      continue;
    }
    const ext = extensionOf(entry.name);
    if (SKIP_ZIP_EXT.has(ext)) {
      findings.push(`Skipped potentially unsafe file: ${entry.name}`);
      continue;
    }
    if (inspected >= MAX_ZIP_ENTRIES) {
      findings.push(`Stopped after ${MAX_ZIP_ENTRIES} files to keep analysis bounded.`);
      break;
    }

    const buffer = Buffer.from(await entry.async("uint8array"));
    uncompressed += buffer.length;
    if (uncompressed > MAX_ZIP_UNCOMPRESSED) {
      findings.push("Uncompressed archive exceeded the safety limit. Remaining files were skipped.");
      break;
    }

    inspected += 1;
    const child = await analyzeOneFile(
      {
        name: entry.name.split("/").pop() || entry.name,
        mimeType: guessMime(entry.name),
        size: buffer.length,
        buffer,
      },
      true,
    );

    if (extensionOf(entry.name) === "html" || extensionOf(entry.name) === "htm") {
      htmlPages.push(child);
    }

    innerReports.push(
      `### ${entry.name} (${formatFileSize(buffer.length)})\n${child.findings.map((f) => `- ${f}`).join("\n")}${
        child.extractedText ? `\n\nExcerpt:\n${truncateText(child.extractedText, 1800)}` : ""
      }`,
    );
  }

  const names = entries.map((e) => e.name.toLowerCase());
  if (names.some((n) => n.endsWith("robots.txt"))) {
    findings.push("robots.txt found inside the ZIP — Suri included it in the crawl-style review.");
  }
  if (names.some((n) => n.includes("sitemap") && n.endsWith(".xml"))) {
    findings.push("A sitemap XML file is present in the archive.");
  }
  if (htmlPages.length) {
    findings.push(`Found ${htmlPages.length} HTML page${htmlPages.length === 1 ? "" : "s"} to review for on-page SEO.`);
  }

  const listing = entries
    .slice(0, 30)
    .map((e) => `- ${e.name}`)
    .join("\n");

  return {
    findings,
    text: [`ZIP listing:\n${listing}`, ...innerReports].join("\n\n"),
  };
}

async function extractOfficeXml(
  buffer: Buffer,
  ext: "docx" | "odt" | "pptx",
): Promise<{ findings: string[]; text: string }> {
  const zip = await JSZip.loadAsync(buffer);
  let xml = "";
  if (ext === "docx") {
    xml = (await zip.file("word/document.xml")?.async("string")) || "";
  } else if (ext === "odt") {
    xml = (await zip.file("content.xml")?.async("string")) || "";
  } else {
    const slides = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort();
    const parts: string[] = [];
    for (const name of slides.slice(0, 20)) {
      parts.push((await zip.file(name)?.async("string")) || "");
    }
    xml = parts.join("\n");
  }

  const text = stripXml(xml.replace(/<w:p[\s>]/g, "\n<p ").replace(/<a:p[\s>]/g, "\n<p "));
  const findings = analyzePlainContent(text, `document.${ext}`);
  if (!text) findings.unshift("Office file opened, but no readable text was found.");
  return { findings, text };
}

async function extractXlsx(buffer: Buffer): Promise<{ findings: string[]; text: string }> {
  const zip = await JSZip.loadAsync(buffer);
  const shared = (await zip.file("xl/sharedStrings.xml")?.async("string")) || "";
  const strings = [...shared.matchAll(/<t(?: xml:space="preserve")?>([\s\S]*?)<\/t>/g)].map((m) =>
    decodeEntities(m[1]),
  );
  const text = strings.slice(0, 400).join("\n");
  const findings = [
    `Spreadsheet with ${strings.length} shared string${strings.length === 1 ? "" : "s"}.`,
    ...analyzeDelimited(strings.slice(0, 80).join("\n"), "\n").findings,
  ];
  return { findings, text };
}

function analyzeHtml(html: string, filename: string): { findings: string[]; text: string } {
  const findings: string[] = [];
  const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
  const metaDesc = decodeEntities(readMeta(html, "description")).trim();
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || "";
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1]));
  const h2s = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => stripTags(m[1]));
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const missingAlt = imgs.filter((tag) => !/\balt\s*=\s*["'][^"']+["']/i.test(tag));
  const bodyText = stripTags(html);
  const words = wordCount(bodyText);

  if (!title) findings.push("Missing <title> tag.");
  else if (title.length < 30) findings.push(`Title is short (${title.length} chars): "${title}".`);
  else if (title.length > 60) findings.push(`Title is long (${title.length} chars). Trim toward 50–60 characters.`);
  else findings.push(`Title looks well-sized (${title.length} chars): "${title}".`);

  if (!metaDesc) findings.push("Missing meta description.");
  else if (metaDesc.length < 70 || metaDesc.length > 165) {
    findings.push(`Meta description is ${metaDesc.length} chars. Aim for roughly 120–155.`);
  } else {
    findings.push(`Meta description length is healthy (${metaDesc.length} chars).`);
  }

  if (!h1s.length) findings.push("No H1 found.");
  else if (h1s.length > 1) findings.push(`Multiple H1s (${h1s.length}). Keep a single primary heading.`);
  else findings.push(`H1: "${h1s[0]}".`);

  if (!canonical) findings.push("No canonical URL declared.");
  if (missingAlt.length) findings.push(`${missingAlt.length} of ${imgs.length} images are missing descriptive alt text.`);
  if (words < 300) findings.push(`Thin copy — about ${words} words. Expand with useful, specific detail.`);
  else findings.push(`Body copy is about ${words} words.`);

  if (!/application\/ld\+json/i.test(html)) {
    findings.push("No JSON-LD schema detected. Add Article, FAQ, or Organization markup where relevant.");
  }

  const text = [
    `File: ${filename}`,
    title ? `Title: ${title}` : null,
    metaDesc ? `Meta description: ${metaDesc}` : null,
    h1s.length ? `H1s: ${h1s.join(" | ")}` : null,
    h2s.length ? `H2s: ${h2s.slice(0, 8).join(" | ")}` : null,
    bodyText,
  ]
    .filter(Boolean)
    .join("\n");

  return { findings, text };
}

function analyzeJsonText(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const keys =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? Object.keys(parsed as Record<string, unknown>)
        : [];
    if (Array.isArray(parsed)) return [`JSON array with ${parsed.length} items.`];
    return [`JSON object with keys: ${keys.slice(0, 12).join(", ") || "(none)"}.`];
  } catch {
    return ["File is not valid JSON. Fix syntax before using it in production."];
  }
}

function analyzeDelimited(raw: string, delimiter: string): { findings: string[]; text: string } {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const header = lines[0] || "";
  const columns = header.split(delimiter).filter(Boolean).length;
  const findings = [
    `Table-like file with ${Math.max(lines.length - 1, 0)} data rows and ${columns || 1} column${columns === 1 ? "" : "s"}.`,
  ];
  if (/keyword|query|search volume|cpc|difficulty/i.test(header)) {
    findings.push("Looks like a keyword export. Suri can turn this into clustering and striking-distance priorities.");
  }
  return { findings, text: lines.slice(0, 80).join("\n") };
}

function analyzePlainContent(text: string, name: string): string[] {
  const words = wordCount(text);
  const findings = [`Extracted ${words} words from ${name}.`];
  if (words < 150) findings.push("Copy is thin. Add concrete examples, FAQs, and search-intent coverage.");
  else if (words > 2500) findings.push("Long document. Consider a table of contents, H2s, and a concise intro.");
  if (!/^#\s|^(.*\n)?#+ /m.test(text) && extensionOf(name) === "md") {
    findings.push("Markdown has no headings. Add H1/H2 structure before publishing.");
  }
  return findings;
}

async function extractPdf(buffer: Buffer): Promise<{ findings: string[]; text: string }> {
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return { findings: ["File does not look like a valid PDF."], text: "" };
  }
  if (/\/Encrypt\b/.test(buffer.toString("latin1", 0, Math.min(buffer.length, 20_000)))) {
    return { findings: ["PDF is encrypted, so text could not be extracted."], text: "" };
  }

  const latin = buffer.toString("latin1");
  const pageCount = Math.max((latin.match(/\/Type\s*\/Page\b/g) || []).length, 1);
  const title =
    decodePdfLiteral(latin.match(/\/Title\s*\((?:\\.|[^\\)])*\)/)?.[0]?.replace(/^\/Title\s*/, "") || "") ||
    decodePdfLiteral(latin.match(/\/Title\s*<([0-9A-Fa-f]+)>/)?.[1] || "");

  const chunks: string[] = [];
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;
  while ((match = streamRe.exec(latin)) && chunks.join(" ").length < MAX_TEXT_PER_FILE * 2) {
    const raw = Buffer.from(match[1], "latin1");
    const inflated = await tryInflate(raw);
    const payload = inflated ? inflated.toString("latin1") : raw.toString("latin1");
    const extracted = extractPdfOperators(payload);
    if (extracted) chunks.push(extracted);
  }

  const text = cleanText(chunks.join("\n"));
  const findings = [
    `PDF with about ${pageCount} page${pageCount === 1 ? "" : "s"}${title ? `, title "${title}"` : ""}.`,
  ];
  if (!text) {
    findings.push(
      "No selectable text found — this may be a scanned/image PDF. Export a text-based PDF or attach a DOCX/TXT instead.",
    );
  } else {
    findings.push(...analyzePlainContent(text, "document.pdf"));
  }
  return { findings, text };
}

async function tryInflate(raw: Buffer): Promise<Buffer | null> {
  try {
    return await inflateAsync(raw);
  } catch {
    try {
      return await inflateRawAsync(raw);
    } catch {
      return null;
    }
  }
}

function extractPdfOperators(source: string): string {
  const parts: string[] = [];
  const stringRe = /\((?:\\.|[^\\)])*\)/g;
  let match: RegExpExecArray | null;
  while ((match = stringRe.exec(source))) {
    parts.push(unescapePdfString(match[0].slice(1, -1)));
  }
  const hexRe = /<([0-9A-Fa-f]{4,})>/g;
  while ((match = hexRe.exec(source))) {
    parts.push(decodeHex(match[1]));
  }
  return parts.join(" ");
}

function unescapePdfString(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{1,3})/g, (_, oct: string) => String.fromCharCode(parseInt(oct, 8)));
}

function decodePdfLiteral(value: string): string {
  if (!value) return "";
  if (value.startsWith("(") && value.endsWith(")")) {
    return unescapePdfString(value.slice(1, -1)).trim();
  }
  return decodeHex(value).trim();
}

function decodeHex(hex: string): string {
  const clean = hex.replace(/\s+/g, "");
  if (clean.length % 2 !== 0) return "";
  const bytes = Buffer.from(clean, "hex");
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    const body = Buffer.from(bytes.subarray(2));
    if (body.length % 2 === 1) return body.toString("utf8");
    return body.swap16().toString("utf16le");
  }
  return bytes.toString("utf8");
}

function readImageDimensions(
  buffer: Buffer,
  ext: string,
): { width: number; height: number } | null {
  try {
    if (ext === "png" && buffer.length >= 24) {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
    if (ext === "gif" && buffer.length >= 10) {
      return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
    }
    if (ext === "webp" && buffer.length >= 30) {
      if (buffer.toString("ascii", 8, 12) === "VP8X") {
        return {
          width: 1 + buffer.readUIntLE(24, 3),
          height: 1 + buffer.readUIntLE(27, 3),
        };
      }
      if (buffer.toString("ascii", 8, 12) === "VP8 ") {
        return {
          width: buffer.readUInt16LE(26) & 0x3fff,
          height: buffer.readUInt16LE(28) & 0x3fff,
        };
      }
    }
    if (ext === "jpg" || ext === "jpeg") {
      return readJpegDimensions(buffer);
    }
    if (ext === "svg") {
      const svg = buffer.toString("utf8", 0, Math.min(buffer.length, 4000));
      const w = Number(svg.match(/\bwidth=["'](\d+)/i)?.[1]);
      const h = Number(svg.match(/\bheight=["'](\d+)/i)?.[1]);
      if (w && h) return { width: w, height: h };
      const view = svg.match(/viewBox=["']([\d.\s]+)/i)?.[1]?.trim().split(/\s+/);
      if (view && view.length === 4) return { width: Number(view[2]), height: Number(view[3]) };
    }
  } catch {
    return null;
  }
  return null;
}

function readJpegDimensions(buffer: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset < buffer.length - 8) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const size = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + size;
  }
  return null;
}

function buildReport(files: AnalyzedChatFile[]): string {
  const lines = [
    `Suri reviewed **${files.length} file${files.length === 1 ? "" : "s"}** and extracted the usable text, structure, and SEO signals.`,
    "",
  ];

  for (const file of files) {
    lines.push(`## ${file.name}`);
    lines.push(`*${labelForKind(file.kind)} · ${formatFileSize(file.size)}*`);
    lines.push("");
    for (const finding of file.findings) {
      lines.push(`- ${finding}`);
    }
    if (file.extractedText) {
      lines.push("");
      lines.push("**Extracted excerpt:**");
      lines.push(truncateText(file.extractedText, 2200));
    }
    lines.push("");
  }

  return truncateText(lines.join("\n").trim(), MAX_REPORT_CHARS);
}

function buildSynthesisBrief(files: AnalyzedChatFile[]): string {
  return files
    .map((file) => {
      const excerpt = file.extractedText ? truncateText(file.extractedText, 500) : "No text extracted.";
      return `${file.name} (${labelForKind(file.kind)}, ${formatFileSize(file.size)}): ${file.findings.slice(0, 4).join(" ")} Excerpt: ${excerpt}`;
    })
    .join("\n\n")
    .slice(0, 2800);
}

function labelForKind(kind: ChatAttachmentKind): string {
  if (kind === "image") return "Image";
  if (kind === "archive") return "ZIP archive";
  if (kind === "spreadsheet") return "Spreadsheet / table";
  return "Document";
}

function guessMime(name: string): string {
  const ext = extensionOf(name);
  const map: Record<string, string> = {
    zip: "application/zip",
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    html: "text/html",
    htm: "text/html",
    json: "application/json",
    csv: "text/csv",
    txt: "text/plain",
    md: "text/markdown",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
  };
  return map[ext] || "application/octet-stream";
}

function safeZipPath(name: string): boolean {
  const normalized = name.replace(/\\/g, "/");
  return !normalized.startsWith("/") && !normalized.includes("../") && !normalized.includes(":\\");
}

function looksLikeText(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, Math.min(buffer.length, 800));
  let suspicious = 0;
  for (const byte of sample) {
    if (byte === 0) return false;
    if (byte < 9 || (byte > 13 && byte < 32)) suspicious += 1;
  }
  return suspicious / sample.length < 0.1;
}

function stripXml(xml: string): string {
  return stripTags(xml.replace(/<(w:p|text:p|a:p|p)\b/gi, "\n<$1"));
}

function stripRtf(rtf: string): string {
  return rtf
    .replace(/\\'[0-9a-fA-F]{2}/g, " ")
    .replace(/\\[a-z]+\d* ?/gi, " ")
    .replace(/[{}]/g, " ");
}

function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCharCode(parseInt(n, 16)));
}

function readMeta(html: string, name: string): string {
  const named = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const reversed = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
    "i",
  );
  return html.match(named)?.[1] || html.match(reversed)?.[1] || "";
}

function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function cleanText(text: string): string {
  return text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
}

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}
