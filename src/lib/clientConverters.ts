"use client";

import type { FFmpeg } from "@ffmpeg/ffmpeg";
import type { MutableRefObject } from "react";

export type ConversionResult = {
  blob: Blob;
  filename: string;
  notes?: string[];
};

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type Html2PdfModule = typeof import("html2pdf.js/dist/html2pdf.bundle.min.js");
type MammothModule = typeof import("mammoth/mammoth.browser.js");
type TesseractModule = typeof import("tesseract.js");
type XlsxModule = typeof import("xlsx/xlsx.mjs");

type PdfTextItem = {
  hasEOL?: boolean;
  str?: string;
  transform?: number[];
};

type PdfPageLike = {
  getTextContent: () => Promise<{ items: PdfTextItem[] }>;
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }) => { promise: Promise<void> };
};

type OcrRecognition = {
  confidence: number;
  text: string;
};

type ExtractedPdfText = {
  notes: string[];
  ocrPages: number;
  pages: string[];
};

let pdfJsPromise: Promise<PdfJsModule> | null = null;
let tesseractPromise: Promise<TesseractModule> | null = null;
let ocrWorkerPromise: Promise<Awaited<ReturnType<TesseractModule["createWorker"]>>> | null = null;

const toBlobData = (bytes: Uint8Array) => new Uint8Array(bytes);

const stripExtension = (value: string) => value.replace(/\.[^.]+$/, "").trim() || "convertz-file";

const createOutputFilename = (inputName: string, extension: string, suffix = "") =>
  `convertz-${stripExtension(inputName)}${suffix}.${extension}`;

const formatCountLabel = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const normalizeWhitespace = (value: string) =>
  value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const hasMeaningfulText = (value: string) => value.replace(/[^A-Za-z0-9]/g, "").length >= 10;

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality = 0.9) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Unable to export canvas."));
        }
      },
      type,
      quality,
    );
  });

const getPdfJs = async () => {
  if (!pdfJsPromise) {
    pdfJsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((pdfjs) => {
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
      }
      return pdfjs;
    });
  }

  return pdfJsPromise;
};

const getHtml2Pdf = async () => {
  const loadedModule = (await import(
    "html2pdf.js/dist/html2pdf.bundle.min.js"
  )) as Html2PdfModule;
  return loadedModule.default ?? loadedModule;
};

const getMammoth = async () => {
  const loadedModule = (await import("mammoth/mammoth.browser.js")) as MammothModule;
  return loadedModule.default ?? loadedModule;
};

const getTesseract = async () => {
  if (!tesseractPromise) {
    tesseractPromise = import("tesseract.js") as Promise<TesseractModule>;
  }

  return tesseractPromise;
};

const getOcrWorker = async () => {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = (async () => {
      const tesseract = await getTesseract();
      const worker = await tesseract.createWorker("eng", tesseract.OEM.LSTM_ONLY, {
        logger: () => undefined,
      });

      await worker.setParameters({
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: tesseract.PSM.AUTO,
      });

      return worker;
    })().catch((error) => {
      ocrWorkerPromise = null;
      throw error;
    });
  }

  return ocrWorkerPromise;
};

const getXlsx = async () => {
  const loadedModule = (await import("xlsx/xlsx.mjs")) as XlsxModule;
  return loadedModule.default ?? loadedModule;
};

const createPdfFromHtml = async (html: string): Promise<Blob> => {
  const html2pdf = await getHtml2Pdf();
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.padding = "24px";
  container.style.background = "#ffffff";
  document.body.appendChild(container);

  try {
    const blob = await html2pdf()
      .from(container)
      .set({
        margin: 0.4,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .outputPdf("blob");

    return blob;
  } finally {
    document.body.removeChild(container);
  }
};

const splitTextToRows = (text: string) => {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.includes("\t")) {
        return line.split("\t");
      }
      if (line.includes(",")) {
        return line.split(",");
      }
      return line.split(/\s{2,}/);
    });
};

const buildPdfTextLines = (items: PdfTextItem[]) => {
  const lines: string[] = [];
  let currentLine = "";
  let previousY: number | null = null;

  for (const item of items) {
    const text = item.str?.trim() ?? "";
    if (!text) {
      continue;
    }

    const y = Array.isArray(item.transform) ? item.transform[5] ?? null : null;
    const nextLine = previousY !== null && y !== null && Math.abs(previousY - y) > 4;
    if (nextLine && currentLine.trim()) {
      lines.push(currentLine.trim());
      currentLine = "";
    }

    const joinsWithoutSpace = /^[,.;:!?%)\]}]/.test(text);
    currentLine += currentLine && !joinsWithoutSpace ? ` ${text}` : text;
    previousY = y;

    if (item.hasEOL && currentLine.trim()) {
      lines.push(currentLine.trim());
      currentLine = "";
      previousY = null;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
};

const renderPdfPageToCanvas = async (page: PdfPageLike, scale: number) => {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to initialize canvas.");
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: context, viewport }).promise;

  return canvas;
};

const preprocessCanvasForOcr = (source: HTMLCanvasElement) => {
  const scaledCanvas = document.createElement("canvas");
  const scale = Math.max(1.5, Math.min(2, 2200 / Math.max(source.width, 1)));
  scaledCanvas.width = Math.max(1, Math.round(source.width * scale));
  scaledCanvas.height = Math.max(1, Math.round(source.height * scale));

  const context = scaledCanvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to prepare the image for OCR.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
  context.filter = "grayscale(1) contrast(1.45) brightness(1.08)";
  context.drawImage(source, 0, 0, scaledCanvas.width, scaledCanvas.height);
  context.filter = "none";

  const imageData = context.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height);
  const { data } = imageData;
  for (let index = 0; index < data.length; index += 4) {
    const average = Math.round((data[index] + data[index + 1] + data[index + 2]) / 3);
    const normalized = average > 170 ? 255 : Math.max(0, average - 35);
    data[index] = normalized;
    data[index + 1] = normalized;
    data[index + 2] = normalized;
  }
  context.putImageData(imageData, 0, 0);

  return scaledCanvas;
};

const extractTextFromImage = async (source: Blob | File | HTMLCanvasElement): Promise<OcrRecognition> => {
  try {
    const worker = await getOcrWorker();
    const attempts: Array<Blob | File | HTMLCanvasElement> = [source];
    if (source instanceof HTMLCanvasElement) {
      attempts.unshift(preprocessCanvasForOcr(source));
    }

    let bestResult: OcrRecognition = { text: "", confidence: 0 };

    for (const candidate of attempts) {
      const result = await worker.recognize(candidate, { rotateAuto: true });
      const text = normalizeWhitespace(result.data.text);
      const confidence = result.data.confidence ?? 0;

      if (
        hasMeaningfulText(text) ||
        text.length > bestResult.text.length ||
        confidence > bestResult.confidence
      ) {
        bestResult = { text, confidence };
      }

      if (hasMeaningfulText(text) && confidence >= 35) {
        break;
      }
    }

    return bestResult;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `OCR failed: ${error.message}`
        : "OCR failed while reading the scanned content.",
    );
  }
};

const extractPdfPagesText = async (file: File): Promise<ExtractedPdfText> => {
  const pdfjs = await getPdfJs();
  const pdfData = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
  const pages: string[] = [];
  const weakPages: string[] = [];
  const notes: string[] = [];
  let ocrPages = 0;
  let unreadablePages = 0;

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = (await pdf.getPage(pageIndex)) as PdfPageLike;
    const content = await page.getTextContent();
    const selectableText = normalizeWhitespace(buildPdfTextLines(content.items).join("\n"));

    if (hasMeaningfulText(selectableText)) {
      pages.push(selectableText);
      continue;
    }

    const canvas = await renderPdfPageToCanvas(page, 2);
    const ocrResult = await extractTextFromImage(canvas);
    const ocrText = ocrResult.text;
    if (ocrText.trim().length > 0) {
      ocrPages += 1;
    }

    if (hasMeaningfulText(ocrText)) {
      pages.push(ocrText);
      continue;
    }

    if (ocrText.trim().length > 0) {
      weakPages.push(ocrText);
      continue;
    }

    unreadablePages += 1;
  }

  if (ocrPages > 0) {
    notes.push(`OCR processed ${formatCountLabel(ocrPages, "page")}.`);
  }

  if (weakPages.length > 0) {
    notes.push("Some pages produced low-confidence OCR text. Review the output carefully.");
  }

  if (unreadablePages > 0) {
    notes.push(
      `${formatCountLabel(unreadablePages, "page")} could not be read clearly. A higher-quality scan may improve results.`,
    );
  }

  const nonEmptyPages = pages.filter((pageText) => pageText.trim().length > 0);
  if (nonEmptyPages.length > 0) {
    return { pages: nonEmptyPages, ocrPages, notes };
  }

  if (weakPages.length > 0) {
    notes.push("Returning the best OCR text available instead of failing the conversion.");
    return { pages: weakPages, ocrPages, notes };
  }

  return {
    pages: ["No readable text could be extracted from this file."],
    ocrPages,
    notes: [
      ...notes,
      "This file appears to be image-based or low quality. Try a clearer or higher-resolution PDF for better results.",
    ],
  };
};

const extractPptSlides = async (file: File) => {
  const JSZipModule = await import("jszip");
  const zip = await JSZipModule.default.loadAsync(await file.arrayBuffer());
  const slideFiles = Object.keys(zip.files)
    .filter((name) => name.startsWith("ppt/slides/slide") && name.endsWith(".xml"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (slideFiles.length === 0) {
    throw new Error("No slides detected in the PowerPoint file.");
  }

  const slides: string[] = [];

  for (const slidePath of slideFiles) {
    const xml = await zip.files[slidePath].async("text");
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const paragraphs = Array.from(doc.getElementsByTagName("a:p"))
      .map((paragraph) =>
        Array.from(paragraph.getElementsByTagName("a:t"))
          .map((node) => node.textContent ?? "")
          .join(" ")
          .trim(),
      )
      .filter(Boolean);
    slides.push(paragraphs.join("\n"));
  }

  return slides;
};

export const convertCsvToExcel = async (file: File): Promise<ConversionResult> => {
  const XLSX = await getXlsx();
  const text = await file.text();
  const rows = text
    .split(/\r?\n/)
    .filter((row) => row.trim().length > 0)
    .map((row) => row.split(","));
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  return {
    blob: new Blob([output], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename: createOutputFilename(file.name, "xlsx"),
  };
};

export const convertImageToPdf = async (file: File): Promise<ConversionResult> => {
  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const bytes = await file.arrayBuffer();
  const image = file.type.includes("png")
    ? await pdfDoc.embedPng(bytes)
    : await pdfDoc.embedJpg(bytes);
  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });
  const pdfBytes = await pdfDoc.save();

  return {
    blob: new Blob([toBlobData(pdfBytes)], { type: "application/pdf" }),
    filename: createOutputFilename(file.name, "pdf"),
  };
};

export const mergePdfs = async (files: File[]): Promise<ConversionResult> => {
  const { PDFDocument } = await import("pdf-lib");
  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const mergedBytes = await merged.save();
  return {
    blob: new Blob([toBlobData(mergedBytes)], { type: "application/pdf" }),
    filename: "convertz-merged-document.pdf",
    notes: [`Merged ${formatCountLabel(files.length, "PDF file")} into one document.`],
  };
};

export const convertPdfToJpgZip = async (file: File): Promise<ConversionResult> => {
  const pdfjs = await getPdfJs();
  const JSZipModule = await import("jszip");
  const zip = new JSZipModule.default();
  const pdfData = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: pdfData }).promise;

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = (await pdf.getPage(pageIndex)) as PdfPageLike;
    const canvas = await renderPdfPageToCanvas(page, 2);
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    zip.file(`page-${pageIndex}.jpg`, blob);
  }

  const zipped = await zip.generateAsync({ type: "blob" });
  return {
    blob: zipped,
    filename: createOutputFilename(file.name, "zip", "-pages"),
    notes: [`Exported ${formatCountLabel(pdf.numPages, "page")} as JPG images in a ZIP archive.`],
  };
};

export const convertPdfToWord = async (file: File): Promise<ConversionResult> => {
  const docxModule = await import("docx");
  const { pages, ocrPages, notes } = await extractPdfPagesText(file);
  const paragraphs = pages.flatMap((pageText, pageIndex) => {
    const pageParagraphs = pageText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map(
        (line) =>
          new docxModule.Paragraph({
            text: line,
            spacing: { after: 120 },
          }),
      );

    if (pageIndex === pages.length - 1) {
      return pageParagraphs;
    }

    return [...pageParagraphs, new docxModule.Paragraph({ text: "" })];
  });

  const doc = new docxModule.Document({
    sections: [{ children: paragraphs }],
  });
  const blob = await docxModule.Packer.toBlob(doc);

  return {
    blob,
    filename: createOutputFilename(file.name, "docx"),
    notes:
      ocrPages > 0
        ? [...notes]
        : notes.length > 0
          ? notes
          : undefined,
  };
};

export const convertWordToPdf = async (file: File): Promise<ConversionResult> => {
  const mammoth = await getMammoth();
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const blob = await createPdfFromHtml(result.value);

  return { blob, filename: createOutputFilename(file.name, "pdf") };
};

export const convertHtmlToPdf = async (file: File): Promise<ConversionResult> => {
  const html = await file.text();
  const blob = await createPdfFromHtml(html);

  return { blob, filename: createOutputFilename(file.name, "pdf") };
};

export const convertExcelToPdf = async (file: File): Promise<ConversionResult> => {
  const XLSX = await getXlsx();
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const html = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
  const blob = await createPdfFromHtml(html);

  return { blob, filename: createOutputFilename(file.name, "pdf") };
};

export const convertPdfToExcel = async (file: File): Promise<ConversionResult> => {
  const XLSX = await getXlsx();
  const { pages, ocrPages, notes } = await extractPdfPagesText(file);
  const rows = splitTextToRows(pages.join("\n\n"));
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  return {
    blob: new Blob([output], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename: createOutputFilename(file.name, "xlsx"),
    notes:
      ocrPages > 0
        ? [...notes]
        : notes.length > 0
          ? notes
          : undefined,
  };
};

export const compressPdf = async (file: File): Promise<ConversionResult> => {
  const pdfjs = await getPdfJs();
  const { PDFDocument } = await import("pdf-lib");
  const pdfData = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
  const compressed = await PDFDocument.create();

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = (await pdf.getPage(pageIndex)) as PdfPageLike;
    const canvas = await renderPdfPageToCanvas(page, 1.2);
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.7);
    const imageBytes = await blob.arrayBuffer();
    const image = await compressed.embedJpg(imageBytes);
    const newPage = compressed.addPage([image.width, image.height]);
    newPage.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const pdfBytes = await compressed.save();
  return {
    blob: new Blob([toBlobData(pdfBytes)], { type: "application/pdf" }),
    filename: createOutputFilename(file.name, "pdf", "-compressed"),
  };
};

export const convertHeicToJpg = async (file: File): Promise<ConversionResult> => {
  const heicModule = await import("heic2any");
  const output = await heicModule.default({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });
  const blob = Array.isArray(output) ? output[0] : output;

  return { blob, filename: createOutputFilename(file.name, "jpg") };
};

export const convertPptToPdf = async (file: File): Promise<ConversionResult> => {
  const { PDFDocument, StandardFonts } = await import("pdf-lib");
  const slides = await extractPptSlides(file);
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const slideText of slides) {
    const page = pdfDoc.addPage([960, 540]);
    page.drawText(slideText || "(No text content detected)", {
      x: 48,
      y: page.getHeight() - 72,
      size: 20,
      font,
      lineHeight: 26,
      maxWidth: page.getWidth() - 96,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return {
    blob: new Blob([toBlobData(pdfBytes)], { type: "application/pdf" }),
    filename: createOutputFilename(file.name, "pdf"),
  };
};

export const convertVideoToMp3 = async (
  file: File,
  ffmpegStore: MutableRefObject<FFmpeg | null>,
): Promise<ConversionResult> => {
  const ffmpegModule = await import("@ffmpeg/ffmpeg");
  const utilModule = await import("@ffmpeg/util");

  if (!ffmpegStore.current) {
    const ffmpeg = new ffmpegModule.FFmpeg();
    const coreURL = "/ffmpeg/ffmpeg-core.js";
    const wasmURL = "/ffmpeg/ffmpeg-core.wasm";
    await ffmpeg.load({ coreURL, wasmURL });
    ffmpegStore.current = ffmpeg;
  }

  const ffmpeg = ffmpegStore.current;
  const extension = file.name.split(".").pop() || "mp4";
  const inputName = `input-${Date.now()}.${extension}`;
  const outputName = `output-${Date.now()}.mp3`;
  await ffmpeg.writeFile(inputName, await utilModule.fetchFile(file));
  await ffmpeg.exec(["-i", inputName, "-q:a", "0", "-map", "a", outputName]);
  const data = await ffmpeg.readFile(outputName);
  if (typeof data === "string") {
    throw new Error("Unexpected FFmpeg output type.");
  }
  const blob = new Blob([toBlobData(data)], { type: "audio/mpeg" });
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return {
    blob,
    filename: createOutputFilename(file.name, "mp3"),
  };
};
