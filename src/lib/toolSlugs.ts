export const toolSlugById: Record<string, string> = {
  "pdf-word": "pdf-to-word",
  "word-pdf": "word-to-pdf",
  "html-pdf": "html-to-pdf",
  "jpg-pdf": "jpg-to-pdf",
  "pdf-jpg": "pdf-to-jpg",
  "excel-pdf": "excel-to-pdf",
  "png-jpg": "png-to-jpg",
  "pdf-merge": "merge-pdf",
  "pdf-excel": "pdf-to-excel",
  "ppt-pdf": "ppt-to-pdf",
  "video-mp3": "video-to-mp3",
  "compress-pdf": "compress-pdf",
  "csv-excel": "csv-to-excel",
  "heic-jpg": "heic-to-jpg",
};

export const toolIdBySlug = Object.fromEntries(
  Object.entries(toolSlugById).map(([id, slug]) => [slug, id]),
) as Record<string, string>;

export const getToolSlug = (toolId: string) =>
  toolSlugById[toolId] ?? toolId.replace(/-/g, "");
