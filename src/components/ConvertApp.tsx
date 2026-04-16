"use client";

import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ConversionResult } from "@/lib/clientConverters";
import { HISTORY_RETENTION_MS, type ConversionHistoryItem } from "@/lib/conversionHistory";
import { GUEST_CONVERSION_LIMIT, hasReachedGuestConversionLimit } from "@/lib/conversionLimits";
import { getToolSlug, toolIdBySlug } from "@/lib/toolSlugs";
import { toolSeoData } from "@/lib/toolSeo";
import { Navbar } from "@/components/Navbar";
import {
  cleanupExpiredLocalConversions,
  getLocalConversions,
  saveLocalConversion,
} from "@/lib/localDb";

type Tool = {
  id: string;
  name: string;
  cat: string;
  icon: IconName;
  description: string;
};

type IconName =
  | "pdfWord"
  | "wordPdf"
  | "htmlPdf"
  | "jpgPdf"
  | "pdfJpg"
  | "excelPdf"
  | "pngJpg"
  | "pdfMerge"
  | "pdfExcel"
  | "pptPdf"
  | "videoMp3"
  | "compressPdf"
  | "csvExcel"
  | "heicJpg";

type IconTone = {
  stroke: string;
  accent: string;
  panelStart: string;
  panelEnd: string;
  glow: string;
};

type IconBadgeSize = "sm" | "md" | "lg";

const tools: Tool[] = [
  {
    id: "pdf-word",
    name: "PDF to Word",
    icon: "pdfWord",
    cat: "Document",
    description: "Preserve layout and convert pages into editable documents.",
  },
  {
    id: "word-pdf",
    name: "Word to PDF",
    icon: "wordPdf",
    cat: "Document",
    description: "Export polished PDF files ready to share or print.",
  },
  {
    id: "html-pdf",
    name: "HTML to PDF",
    icon: "htmlPdf",
    cat: "Document",
    description: "Turn HTML files into clean, printable PDFs.",
  },
  {
    id: "jpg-pdf",
    name: "JPG to PDF",
    icon: "jpgPdf",
    cat: "Image",
    description: "Bundle photos into a single, clean PDF file.",
  },
  {
    id: "pdf-jpg",
    name: "PDF to JPG",
    icon: "pdfJpg",
    cat: "Image",
    description: "Extract PDF pages as crisp image files.",
  },
  {
    id: "excel-pdf",
    name: "Excel to PDF",
    icon: "excelPdf",
    cat: "Spreadsheet",
    description: "Keep formulas intact and export spreadsheets.",
  },
  {
    id: "png-jpg",
    name: "PNG to JPG",
    icon: "pngJpg",
    cat: "Image",
    description: "Convert images quickly without extra software.",
  },
  {
    id: "pdf-merge",
    name: "PDF Merge",
    icon: "pdfMerge",
    cat: "PDF Tool",
    description: "Combine multiple PDFs into one organized file.",
  },
  {
    id: "pdf-excel",
    name: "PDF to Excel",
    icon: "pdfExcel",
    cat: "Spreadsheet",
    description: "Turn tables into editable worksheets.",
  },
  {
    id: "ppt-pdf",
    name: "PPT to PDF",
    icon: "pptPdf",
    cat: "Document",
    description: "Share presentations with consistent formatting.",
  },
  {
    id: "video-mp3",
    name: "Video to MP3",
    icon: "videoMp3",
    cat: "Media",
    description: "Extract clean audio tracks from your videos.",
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    icon: "compressPdf",
    cat: "PDF Tool",
    description: "Shrink file size without losing readability.",
  },
  {
    id: "csv-excel",
    name: "CSV to Excel",
    icon: "csvExcel",
    cat: "Data",
    description: "Turn raw data into structured spreadsheets.",
  },
  {
    id: "heic-jpg",
    name: "HEIC to JPG",
    icon: "heicJpg",
    cat: "iPhone",
    description: "Make iPhone photos compatible everywhere.",
  },
];

const iconToneByName: Record<IconName, IconTone> = {
  pdfWord: {
    stroke: "#1d4ed8",
    accent: "#93c5fd",
    panelStart: "#eff6ff",
    panelEnd: "#dbeafe",
    glow: "rgba(59, 130, 246, 0.30)",
  },
  wordPdf: {
    stroke: "#7c3aed",
    accent: "#c4b5fd",
    panelStart: "#f5f3ff",
    panelEnd: "#ede9fe",
    glow: "rgba(124, 58, 237, 0.28)",
  },
  htmlPdf: {
    stroke: "#0f766e",
    accent: "#99f6e4",
    panelStart: "#ecfeff",
    panelEnd: "#ccfbf1",
    glow: "rgba(13, 148, 136, 0.26)",
  },
  jpgPdf: {
    stroke: "#c2410c",
    accent: "#fdba74",
    panelStart: "#fff7ed",
    panelEnd: "#ffedd5",
    glow: "rgba(249, 115, 22, 0.28)",
  },
  pdfJpg: {
    stroke: "#be123c",
    accent: "#fda4af",
    panelStart: "#fff1f2",
    panelEnd: "#ffe4e6",
    glow: "rgba(244, 63, 94, 0.28)",
  },
  excelPdf: {
    stroke: "#047857",
    accent: "#86efac",
    panelStart: "#ecfdf5",
    panelEnd: "#d1fae5",
    glow: "rgba(16, 185, 129, 0.30)",
  },
  pngJpg: {
    stroke: "#1e40af",
    accent: "#7dd3fc",
    panelStart: "#eff6ff",
    panelEnd: "#e0f2fe",
    glow: "rgba(56, 189, 248, 0.26)",
  },
  pdfMerge: {
    stroke: "#334155",
    accent: "#cbd5e1",
    panelStart: "#f8fafc",
    panelEnd: "#e2e8f0",
    glow: "rgba(100, 116, 139, 0.25)",
  },
  pdfExcel: {
    stroke: "#166534",
    accent: "#bbf7d0",
    panelStart: "#f0fdf4",
    panelEnd: "#dcfce7",
    glow: "rgba(34, 197, 94, 0.28)",
  },
  pptPdf: {
    stroke: "#b45309",
    accent: "#fcd34d",
    panelStart: "#fffbeb",
    panelEnd: "#fef3c7",
    glow: "rgba(245, 158, 11, 0.30)",
  },
  videoMp3: {
    stroke: "#6d28d9",
    accent: "#c4b5fd",
    panelStart: "#f5f3ff",
    panelEnd: "#ede9fe",
    glow: "rgba(139, 92, 246, 0.28)",
  },
  compressPdf: {
    stroke: "#0f766e",
    accent: "#99f6e4",
    panelStart: "#f0fdfa",
    panelEnd: "#ccfbf1",
    glow: "rgba(45, 212, 191, 0.26)",
  },
  csvExcel: {
    stroke: "#15803d",
    accent: "#86efac",
    panelStart: "#f0fdf4",
    panelEnd: "#dcfce7",
    glow: "rgba(34, 197, 94, 0.26)",
  },
  heicJpg: {
    stroke: "#0369a1",
    accent: "#7dd3fc",
    panelStart: "#f0f9ff",
    panelEnd: "#e0f2fe",
    glow: "rgba(14, 165, 233, 0.28)",
  },
};

const iconBadgeSizeClasses: Record<IconBadgeSize, { shell: string; glyph: string }> = {
  sm: {
    shell: "h-16 w-14 rounded-[22px]",
    glyph: "h-8 w-7",
  },
  md: {
    shell: "h-[4.75rem] w-[4.1rem] rounded-[26px]",
    glyph: "h-10 w-9",
  },
  lg: {
    shell: "h-24 w-20 rounded-[32px]",
    glyph: "h-12 w-10",
  },
};

type StatusType = "success" | "error" | "info";

type StatusMessage = {
  type: StatusType;
  message: string;
};

type ConversionStatus = "converting" | "uploading" | "done" | "failed" | null;

const historyLimit = 30;
const createConversionId = () => crypto.randomUUID();

const formatHistoryTimestamp = (value: number) => {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const acceptedTypesByTool: Record<string, string> = {
  "pdf-word": ".pdf",
  "word-pdf": ".docx",
  "html-pdf": ".html,.htm",
  "jpg-pdf": ".jpg,.jpeg",
  "pdf-jpg": ".pdf",
  "excel-pdf": ".xlsx,.xls",
  "png-jpg": ".png",
  "pdf-merge": ".pdf",
  "pdf-excel": ".pdf",
  "ppt-pdf": ".pptx",
  "video-mp3": ".mp4,.mov,.mkv,.webm,.avi",
  "compress-pdf": ".pdf",
  "csv-excel": ".csv",
  "heic-jpg": ".heic,.heif",
};

const outputLabelByTool: Record<string, string> = {
  "pdf-word": "DOCX document",
  "word-pdf": "PDF document",
  "html-pdf": "PDF document",
  "jpg-pdf": "PDF document",
  "pdf-jpg": "ZIP of JPG images",
  "excel-pdf": "PDF document",
  "png-jpg": "JPG image",
  "pdf-merge": "Merged PDF",
  "pdf-excel": "XLSX spreadsheet",
  "ppt-pdf": "PDF document",
  "video-mp3": "MP3 audio",
  "compress-pdf": "Compressed PDF",
  "csv-excel": "XLSX spreadsheet",
  "heic-jpg": "JPG image",
};

const capabilityByTool: Record<string, string> = {
  "pdf-word": "Scanned PDFs use OCR automatically.",
  "pdf-excel": "Scanned PDFs use OCR automatically.",
  "pdf-merge": "Combine multiple PDF files in order.",
  "pdf-jpg": "Each page is exported as a JPG image.",
  "compress-pdf": "Optimized for smaller file size.",
  "video-mp3": "Extracts the audio track only.",
};

const allowedExtensionsByTool: Record<string, string[]> = {
  "pdf-word": ["pdf"],
  "word-pdf": ["docx"],
  "html-pdf": ["html", "htm"],
  "jpg-pdf": ["jpg", "jpeg"],
  "pdf-jpg": ["pdf"],
  "excel-pdf": ["xlsx", "xls"],
  "png-jpg": ["png"],
  "pdf-merge": ["pdf"],
  "pdf-excel": ["pdf"],
  "ppt-pdf": ["pptx"],
  "video-mp3": ["mp4", "mov", "mkv", "webm", "avi"],
  "compress-pdf": ["pdf"],
  "csv-excel": ["csv"],
  "heic-jpg": ["heic", "heif"],
};

const getFileExtension = (name: string) => {
  const segments = name.split(".");
  if (segments.length < 2) return "";
  return segments[segments.length - 1]?.toLowerCase() ?? "";
};

const isFileAllowedForTool = (file: File, toolId: string | null) => {
  if (!toolId) return true;
  const allowed = allowedExtensionsByTool[toolId];
  if (!allowed || allowed.length === 0) return true;
  const ext = getFileExtension(file.name);
  return allowed.includes(ext);
};

const getAllowedExtensionsLabel = (toolId: string | null) => {
  if (!toolId) return "supported file types";
  const allowed = allowedExtensionsByTool[toolId];
  if (!allowed || allowed.length === 0) return "supported file types";
  return allowed.map((ext) => `.${ext}`).join(", ");
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unitIndex]}`;
};

const moveItem = <T,>(items: T[], from: number, to: number) => {
  if (to < 0 || to >= items.length || from === to) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

function BaseToolIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={className ?? "h-6 w-6"}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

function ToolIcon({ name, className }: { name: IconName; className?: string }) {
  switch (name) {
    case "pdfWord":
      return (
        <BaseToolIcon className={className}>
          <rect x="4" y="4" width="24" height="30" rx="3" fill="#E53935" />
          <text x="16" y="23" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">
            PDF
          </text>
          <path d="M30 19 L38 19" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" />
          <path d="M35 15 L39 19 L35 23" fill="none" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="32" y="22" width="20" height="26" rx="3" fill="#1565C0" />
          <rect x="35" y="28" width="14" height="2" rx="1" fill="white" />
          <rect x="35" y="33" width="11" height="2" rx="1" fill="white" />
          <rect x="35" y="38" width="13" height="2" rx="1" fill="white" />
        </BaseToolIcon>
      );
    case "wordPdf":
      return (
        <BaseToolIcon className={className}>
          <rect x="4" y="4" width="22" height="28" rx="3" fill="#1565C0" />
          <rect x="7" y="10" width="14" height="2" rx="1" fill="rgba(255,255,255,0.8)" />
          <rect x="7" y="15" width="10" height="2" rx="1" fill="rgba(255,255,255,0.6)" />
          <rect x="7" y="20" width="12" height="2" rx="1" fill="rgba(255,255,255,0.6)" />
          <path d="M28 18 L36 18" stroke="#E53935" strokeWidth="2" strokeLinecap="round" />
          <path d="M33 14 L37 18 L33 22" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="30" y="24" width="22" height="28" rx="3" fill="#E53935" />
          <text x="41" y="41" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">
            PDF
          </text>
        </BaseToolIcon>
      );
    case "htmlPdf":
      return (
        <BaseToolIcon className={className}>
          <rect x="2" y="8" width="30" height="22" rx="3" fill="#FF7043" />
          <text x="10" y="20" fontFamily="monospace" fontSize="8" fontWeight="700" fill="white">
            {"</>"}
          </text>
          <path d="M34 18 L42 18" stroke="#E53935" strokeWidth="2" strokeLinecap="round" />
          <path d="M39 14 L43 18 L39 22" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="32" y="24" width="22" height="28" rx="3" fill="#E53935" />
          <text x="43" y="41" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">
            PDF
          </text>
        </BaseToolIcon>
      );
    case "jpgPdf":
      return (
        <BaseToolIcon className={className}>
          <rect x="2" y="6" width="28" height="22" rx="3" fill="#43A047" />
          <polygon points="6,24 14,14 20,20 24,16 30,24" fill="rgba(255,255,255,0.5)" />
          <circle cx="23" cy="12" r="3" fill="rgba(255,255,255,0.7)" />
          <path d="M32 16 L40 16" stroke="#E53935" strokeWidth="2" strokeLinecap="round" />
          <path d="M37 12 L41 16 L37 20" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="30" y="22" width="24" height="28" rx="3" fill="#E53935" />
          <text x="42" y="39" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">
            PDF
          </text>
        </BaseToolIcon>
      );
    case "pdfJpg":
      return (
        <BaseToolIcon className={className}>
          <rect x="2" y="6" width="22" height="28" rx="3" fill="#E53935" />
          <text x="13" y="23" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">
            PDF
          </text>
          <path d="M26 20 L34 20" stroke="#43A047" strokeWidth="2" strokeLinecap="round" />
          <path d="M31 16 L35 20 L31 24" fill="none" stroke="#43A047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="28" y="24" width="26" height="22" rx="3" fill="#43A047" />
          <polygon points="32,42 40,32 46,38 50,34 54,42" fill="rgba(255,255,255,0.5)" />
          <circle cx="48" cy="30" r="3" fill="rgba(255,255,255,0.7)" />
        </BaseToolIcon>
      );
    case "excelPdf":
      return (
        <BaseToolIcon className={className}>
          <rect x="2" y="6" width="28" height="24" rx="3" fill="#217346" />
          <line x1="2" y1="16" x2="30" y2="16" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="2" y1="22" x2="30" y2="22" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="12" y1="6" x2="12" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="21" y1="6" x2="21" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <rect x="2" y="6" width="10" height="10" rx="0" fill="rgba(255,255,255,0.2)" />
          <path d="M32 18 L40 18" stroke="#E53935" strokeWidth="2" strokeLinecap="round" />
          <path d="M37 14 L41 18 L37 22" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="32" y="24" width="22" height="28" rx="3" fill="#E53935" />
          <text x="43" y="41" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">
            PDF
          </text>
        </BaseToolIcon>
      );
    case "pngJpg":
      return (
        <BaseToolIcon className={className}>
          <rect x="2" y="6" width="24" height="20" rx="3" fill="#7B1FA2" />
          <polygon points="5,22 11,14 16,18 20,14 26,22" fill="rgba(255,255,255,0.5)" />
          <circle cx="20" cy="11" r="3" fill="rgba(255,255,255,0.7)" />
          <path d="M28 16 L36 16" stroke="#FF8F00" strokeWidth="2" strokeLinecap="round" />
          <path d="M33 12 L37 16 L33 20" fill="none" stroke="#FF8F00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="30" y="22" width="24" height="20" rx="3" fill="#FF8F00" />
          <polygon points="33,38 39,30 44,34 48,30 54,38" fill="rgba(255,255,255,0.5)" />
          <circle cx="49" cy="27" r="3" fill="rgba(255,255,255,0.7)" />
        </BaseToolIcon>
      );
    case "pdfMerge":
      return (
        <BaseToolIcon className={className}>
          <rect x="2" y="4" width="18" height="24" rx="3" fill="#E53935" />
          <rect x="8" y="10" width="18" height="24" rx="3" fill="#EF5350" />
          <rect x="14" y="16" width="18" height="24" rx="3" fill="#FFCDD2" stroke="#E53935" strokeWidth="1.5" />
          <text x="23" y="31" fontFamily="sans-serif" fontSize="6" fontWeight="700" fill="#E53935" textAnchor="middle">
            PDF
          </text>
          <path d="M34 28 L44 28" stroke="#E53935" strokeWidth="2" strokeLinecap="round" />
          <path d="M41 24 L45 28 L41 32" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="44" y="18" width="10" height="20" rx="3" fill="#B71C1C" />
        </BaseToolIcon>
      );
    case "pdfExcel":
      return (
        <BaseToolIcon className={className}>
          <rect x="2" y="6" width="22" height="28" rx="3" fill="#E53935" />
          <text x="13" y="23" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">
            PDF
          </text>
          <path d="M26 20 L34 20" stroke="#217346" strokeWidth="2" strokeLinecap="round" />
          <path d="M31 16 L35 20 L31 24" fill="none" stroke="#217346" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="28" y="6" width="26" height="26" rx="3" fill="#217346" />
          <line x1="28" y1="18" x2="54" y2="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="28" y1="24" x2="54" y2="24" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="40" y1="6" x2="40" y2="32" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <rect x="28" y="6" width="12" height="12" rx="0" fill="rgba(255,255,255,0.2)" />
        </BaseToolIcon>
      );
    case "pptPdf":
      return (
        <BaseToolIcon className={className}>
          <rect x="2" y="8" width="28" height="20" rx="3" fill="#D84315" />
          <rect x="5" y="11" width="14" height="10" rx="2" fill="rgba(255,255,255,0.3)" />
          <rect x="21" y="13" width="6" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
          <rect x="21" y="17" width="5" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
          <path d="M32 18 L40 18" stroke="#E53935" strokeWidth="2" strokeLinecap="round" />
          <path d="M37 14 L41 18 L37 22" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="32" y="24" width="22" height="28" rx="3" fill="#E53935" />
          <text x="43" y="41" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">
            PDF
          </text>
        </BaseToolIcon>
      );
    case "videoMp3":
      return (
        <BaseToolIcon className={className}>
          <rect x="2" y="8" width="30" height="22" rx="3" fill="#1565C0" />
          <polygon points="10,26 10,12 24,19" fill="white" />
          <path d="M34 18 L42 18" stroke="#FF8F00" strokeWidth="2" strokeLinecap="round" />
          <path d="M39 14 L43 18 L39 22" fill="none" stroke="#FF8F00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="36" y="24" width="18" height="24" rx="3" fill="#FF8F00" />
          <path d="M40 36 Q45 30 50 36" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M38 39 Q45 28 52 39" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="45" cy="41" r="2" fill="white" />
        </BaseToolIcon>
      );
    case "compressPdf":
      return (
        <BaseToolIcon className={className}>
          <rect x="8" y="2" width="28" height="36" rx="3" fill="#E53935" />
          <text x="22" y="23" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">
            PDF
          </text>
          <path d="M22 36 L22 44" stroke="#E53935" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 40 L22 46 L28 40" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="10" y="46" width="24" height="8" rx="3" fill="#B71C1C" />
          <rect x="13" y="49" width="18" height="2" rx="1" fill="rgba(255,255,255,0.6)" />
        </BaseToolIcon>
      );
    case "csvExcel":
      return (
        <BaseToolIcon className={className}>
          <rect x="2" y="8" width="24" height="22" rx="3" fill="#546E7A" />
          <rect x="5" y="11" width="18" height="2" rx="1" fill="rgba(255,255,255,0.7)" />
          <rect x="5" y="16" width="14" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
          <rect x="5" y="21" width="16" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
          <rect x="5" y="26" width="12" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
          <path d="M28 18 L36 18" stroke="#217346" strokeWidth="2" strokeLinecap="round" />
          <path d="M33 14 L37 18 L33 22" fill="none" stroke="#217346" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="30" y="6" width="24" height="26" rx="3" fill="#217346" />
          <line x1="30" y1="18" x2="54" y2="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="30" y1="24" x2="54" y2="24" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="42" y1="6" x2="42" y2="32" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </BaseToolIcon>
      );
    case "heicJpg":
      return (
        <BaseToolIcon className={className}>
          <rect x="2" y="6" width="26" height="32" rx="5" fill="#455A64" />
          <rect x="6" y="10" width="18" height="14" rx="2" fill="rgba(255,255,255,0.2)" />
          <polygon points="6,22 12,16 17,20 21,16 24,22" fill="rgba(255,255,255,0.5)" />
          <circle cx="20" cy="13" r="2.5" fill="rgba(255,255,255,0.7)" />
          <rect x="8" y="26" width="14" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
          <path d="M30 22 L38 22" stroke="#43A047" strokeWidth="2" strokeLinecap="round" />
          <path d="M35 18 L39 22 L35 26" fill="none" stroke="#43A047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="30" y="24" width="24" height="20" rx="3" fill="#43A047" />
          <polygon points="33,40 40,30 46,36 50,32 54,40" fill="rgba(255,255,255,0.5)" />
          <circle cx="49" cy="29" r="2.5" fill="rgba(255,255,255,0.7)" />
        </BaseToolIcon>
      );
    default:
      return null;
  }
}

function ToolIconBadge({
  name,
  size = "md",
  className = "",
}: {
  name: IconName;
  size?: IconBadgeSize;
  className?: string;
}) {
  const tone = iconToneByName[name];
  const sizeClasses = iconBadgeSizeClasses[size];
  const style = {
    ["--icon-stroke" as string]: tone.stroke,
    ["--icon-accent" as string]: tone.accent,
  } as CSSProperties;

  return (
    <div
      className={`flex items-center justify-center ${sizeClasses.shell} ${className}`.trim()}
      style={style}
    >
      <ToolIcon
        name={name}
        className={`${sizeClasses.glyph} transition duration-500 group-hover:scale-[1.04]`}
      />
    </div>
  );
}

export default function ConvertApp({
  initialToolSlug,
  initialHistory = [],
}: {
  initialToolSlug?: string;
  initialHistory?: ConversionHistoryItem[];
}) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [activeToolId, setActiveToolId] = useState<string | null>(
    initialToolSlug ? toolIdBySlug[initialToolSlug] || null : null,
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [status, setStatus] = useState<ConversionStatus>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [download, setDownload] = useState<{
    blob: Blob;
    filename: string;
    url: string;
    expiresAt: number;
    id: string;
  } | null>(null);
  const [resultNotes, setResultNotes] = useState<string[]>([]);
  const [history, setHistory] = useState<ConversionHistoryItem[]>(() => initialHistory);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const conversionStatusRef = useRef<HTMLDivElement | null>(null);
  const downloadBannerRef = useRef<HTMLDivElement | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const isAuthenticated = Boolean(session?.user?.id);

  useEffect(() => {
    if ((status === "converting" || status === "uploading") && conversionStatusRef.current) {
      conversionStatusRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (status === "done" && downloadBannerRef.current) {
      downloadBannerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  const handleConvert = async () => {
    if (!activeTool || selectedFiles.length === 0) return;

    if (!isAuthenticated && hasReachedGuestConversionLimit(history.length)) {
      notify(
        "error",
        `You have reached the limit of ${GUEST_CONVERSION_LIMIT} free conversions. Please sign in to continue.`,
      );
      return;
    }

    setStatusMessage(null);
    setIsConverting(true);
    setStatus("converting");
    setDownload(null);
    setResultNotes([]);
    setProgress(20);

    const conversionId = createConversionId();
    try {
      let result: ConversionResult;
      const file = selectedFiles[0];
      const converters = await import("@/lib/clientConverters");

      switch (activeTool.id) {
        case "csv-excel": result = await converters.convertCsvToExcel(file); break;
        case "png-jpg": result = await convertImage(file, "image/jpeg"); break;
        case "jpg-pdf": result = await converters.convertImageToPdf(file); break;
        case "pdf-merge": result = await converters.mergePdfs(selectedFiles); break;
        case "pdf-jpg": result = await converters.convertPdfToJpgZip(file); break;
        case "pdf-word": result = await converters.convertPdfToWord(file); break;
        case "word-pdf": result = await converters.convertWordToPdf(file); break;
        case "html-pdf": result = await converters.convertHtmlToPdf(file); break;
        case "excel-pdf": result = await converters.convertExcelToPdf(file); break;
        case "pdf-excel": result = await converters.convertPdfToExcel(file); break;
        case "compress-pdf": result = await converters.compressPdf(file); break;
        case "heic-jpg": result = await converters.convertHeicToJpg(file); break;
        case "ppt-pdf": result = await converters.convertPptToPdf(file); break;
        case "video-mp3": result = await converters.convertVideoToMp3(file, ffmpegRef); break;
        default: throw new Error("Tool not implemented yet.");
      }

      setProgress(60);
      setStatus("uploading");

      const formData = new FormData();
      formData.append("file", result.blob, result.filename);
      formData.append("conversionId", conversionId);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(errText || "Failed to upload file.");
      }

      const uploadData = await uploadRes.json();
      const uploadUrl = uploadData?.secure_url as string | undefined;
      const cloudinaryPublicId = uploadData?.public_id as string | undefined;
      const cloudinaryResourceType = uploadData?.resource_type as string | undefined;

      if (!uploadUrl) {
        throw new Error("Upload failed. Missing file URL.");
      }

      let conversionItem: ConversionHistoryItem;

      if (isAuthenticated) {
        const recordRes = await fetch("/api/conversions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: conversionId,
            toolId: activeTool.id,
            toolSlug: getToolSlug(activeTool.id),
            toolName: activeTool.name,
            fileName: result.filename,
            status: "completed",
            uploadUrl,
            cloudinaryPublicId,
            cloudinaryResourceType,
          }),
        });

        if (!recordRes.ok) {
          const errText = await recordRes.text();
          throw new Error(errText || "Failed to save conversion.");
        }

        const recordPayload = (await recordRes.json()) as {
          conversion?: ConversionHistoryItem;
        };

        if (!recordPayload.conversion) {
          throw new Error("Failed to save conversion.");
        }
        conversionItem = recordPayload.conversion;
      } else {
        conversionItem = {
          id: conversionId,
          toolId: activeTool.id,
          toolSlug: getToolSlug(activeTool.id),
          toolName: activeTool.name,
          fileName: result.filename,
          status: "completed",
          createdAt: Date.now(),
          uploadUrl,
          expiresAt: Date.now() + HISTORY_RETENTION_MS,
        };
        await saveLocalConversion(conversionItem);
      }

      addHistoryItem(conversionItem);
      setDownloadResult(result, conversionId);
      setResultNotes(result.notes ?? []);
      setStatus("done");
      setProgress(100);
      notify("success", "File converted successfully!");
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Conversion failed. Please try again.";
      setStatus("failed");
      notify("error", message);
    } finally {
      setIsConverting(false);
    }
  };

  const activeTool = useMemo(
    () => tools.find((tool) => tool.id === activeToolId) ?? null,
    [activeToolId],
  );
  const activeToolSlug = activeTool ? getToolSlug(activeTool.id) : null;
  const activeToolSeo = activeToolSlug ? toolSeoData[activeToolSlug] : null;
  const relatedTools = useMemo(() => {
    if (!activeTool) return [];
    return tools
      .filter((tool) => tool.id !== activeTool.id)
      .sort((left, right) => {
        const leftScore = left.cat === activeTool.cat ? 0 : 1;
        const rightScore = right.cat === activeTool.cat ? 0 : 1;
        return leftScore - rightScore;
      })
      .slice(0, 3);
  }, [activeTool]);

  const isMultiSelect = activeTool?.id === "pdf-merge";
  const acceptedTypes = activeTool?.id
    ? acceptedTypesByTool[activeTool.id]
    : undefined;

  const addHistoryItem = useCallback((item: ConversionHistoryItem) => {
    setHistory((prev) => {
      const next = [item, ...prev.filter((existing) => existing.id !== item.id)];
      return next.slice(0, historyLimit);
    });
  }, []);

  const clearDownload = useCallback(() => {
    setDownload((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return null;
    });
  }, []);

  const openTool = (id: string) => {
    const slug = getToolSlug(id);
    router.push(`/${slug}`);
  };

  const showHome = () => {
    router.push("/");
  };

  const setDownloadResult = (result: ConversionResult, conversionId: string) => {
    setDownload((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      const url = URL.createObjectURL(result.blob);
      const expiresAt = Date.now() + HISTORY_RETENTION_MS;
      return {
        blob: result.blob,
        filename: result.filename,
        url,
        expiresAt,
        id: conversionId,
      };
    });
  };

  useEffect(() => {
    const nextToolId = initialToolSlug ? toolIdBySlug[initialToolSlug] || null : null;
    if (nextToolId !== activeToolId) {
      setActiveToolId(nextToolId);
      setStatus(null);
      setStatusMessage(null);
      setSelectedFiles([]);
      setIsDragging(false);
      setResultNotes([]);
      clearDownload();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [initialToolSlug, activeToolId, clearDownload]);

  useEffect(() => {
    const loadGuestHistory = async () => {
      if (!isAuthenticated && authStatus === "unauthenticated") {
        await cleanupExpiredLocalConversions();
        const local = await getLocalConversions();
        setHistory(local);
      }
    };
    loadGuestHistory();
  }, [isAuthenticated, authStatus]);

  useEffect(() => {
    if (!download) return;
    const remaining = download.expiresAt - Date.now();
    if (remaining <= 0) {
      clearDownload();
      return;
    }
    const timeout = window.setTimeout(() => {
      clearDownload();
    }, remaining);
    return () => window.clearTimeout(timeout);
  }, [clearDownload, download]);

  const notify = (type: StatusType, message: string) => {
    setStatusMessage({ type, message });
  };

  const handleFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const array = Array.from(files);
    const toolId = activeTool?.id ?? null;
    const filtered = toolId
      ? array.filter((file) => isFileAllowedForTool(file, toolId))
      : array;
    const hadInvalid = Boolean(toolId && filtered.length !== array.length);
    if (hadInvalid) {
      notify(
        "error",
        `Only ${getAllowedExtensionsLabel(toolId)} files are allowed for ${activeTool?.name ?? "this tool"}.`,
      );
    }
    if (filtered.length === 0) {
      return;
    }
    if (toolId === "pdf-merge") {
      setSelectedFiles((prev) => [...prev, ...filtered]);
    } else {
      setSelectedFiles(filtered.slice(0, 1));
    }
    setResultNotes([]);
    if (!hadInvalid) {
      setStatus(null);
      setStatusMessage(null);
    }
    clearDownload();
  };

  const clearFile = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setStatus(null);
    setStatusMessage(null);
    setResultNotes([]);
    clearDownload();
  };

  const moveSelectedFile = (from: number, direction: "up" | "down") => {
    setSelectedFiles((current) =>
      moveItem(current, from, direction === "up" ? from - 1 : from + 1),
    );
  };

  const removeSelectedFileAt = (index: number) => {
    setSelectedFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleDownload = async () => {
    if (!download) return;
    const link = document.createElement("a");
    link.href = download.url;
    link.download = download.filename;
    link.click();
  };

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

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });

  const loadImageElement = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image."));
      img.src = src;
    });

  const convertImage = async (
    file: File,
    format: string,
  ): Promise<ConversionResult> => {
    const dataUrl = await readFileAsDataUrl(file);
    const img = await loadImageElement(dataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to initialize canvas.");
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const blob = await canvasToBlob(canvas, format, 0.92);
    return {
      blob,
      filename: `convertz-${file.name.replace(/\.[^.]+$/, format === "image/jpeg" ? ".jpg" : ".png")}`,
    };
  };

  if (authStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            <div className="absolute inset-[34%] rounded-full bg-indigo-600 animate-pulse" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">
            Authenticating
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-purple-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }} />
      </div>
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />
      {status === "done" && download && (
        <>
          {/* Toast notification banner - mobile friendly */}
          <div ref={downloadBannerRef} className="mx-auto w-full max-w-7xl px-3 pt-3 sm:px-8 sm:pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3.5">
              {/* File info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-emerald-800">Your file is ready!</p>
                  <p className="text-xs font-medium text-emerald-600 truncate">{download.filename}</p>
                </div>
              </div>
              {/* Pulsing download button — full width on mobile */}
              <button
                onClick={handleDownload}
                className="relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/40 transition active:scale-95 hover:bg-emerald-500 hover:shadow-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto sm:py-2.5"
              >
                <span className="absolute -inset-1 rounded-xl animate-ping bg-emerald-400 opacity-30" />
                <svg className="relative h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="relative">Download</span>
              </button>
            </div>
          </div>
        </>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        {!activeTool && (
          <div className="py-12 md:py-20">
            <div className="max-w-4xl px-6 sm:px-0 text-center mx-auto mb-20">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-6 drop-shadow-sm leading-[1.1]">
                Free PDF Tools Online &ndash; <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Convert, Merge & Compress</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                Convert, compress, merge, and manage your files online for free. Fast, secure, and works on all devices &mdash; no login, no limits.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a href="#popular-tools" className="rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95">
                  Get Started →
                </a>
              </div>
            </div>

            <div id="popular-tools" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 scroll-mt-24">
              {tools.map((tool) => (
                <button
                  type="button"
                  key={tool.id}
                  onClick={() => openTool(tool.id)}
                  className="tool-card group flex min-h-[285px] flex-col items-start cursor-pointer rounded-[30px] border border-slate-200/70 p-6 text-left shadow-[0_18px_40px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl"
                >
                  <div className="mb-5 flex w-full items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200/80 bg-white/85 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                        {tool.cat}
                      </span>
                      <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-indigo-600 shadow-sm flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        Free
                      </span>
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-600 shadow-sm">
                        No Signup
                      </span>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-400 transition-all duration-300 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17 17 7" />
                        <path d="M8.5 7H17v8.5" />
                      </svg>
                    </span>
                  </div>
                  <ToolIconBadge name={tool.icon} size="md" className="mb-6" />
                  <h3 className="mb-2 text-lg font-black tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-indigo-700">{tool.name}</h3>
                  <p className="text-sm leading-6 text-slate-600">
                    {tool.description}
                  </p>
                  <div className="mt-auto flex w-full items-center justify-between border-t border-slate-200/70 pt-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Output
                    </p>
                    <p className="max-w-[65%] text-right text-sm font-semibold text-slate-700">
                      {outputLabelByTool[tool.id] ?? "Converted file"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          
            {/* Why Choose Section */}
            <section className="mt-32 pt-20 border-t border-slate-100">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">Why Choose Convertz?</h2>
                <p className="text-slate-500 font-medium">Fast, secure, and always free. The only tool you'll ever need.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { 
                    icon: <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m13 2-2 10h8l-2 10" /></svg>, 
                    title: "100% Free", 
                    desc: "No hidden charges, no premium tiers. Everything is free." 
                  },
                  { 
                    icon: <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="22" y2="13"/><line x1="22" y1="8" x2="17" y2="13"/></svg>, 
                    title: "No Signup Required", 
                    desc: "Start converting instantly without creating an account or login." 
                  },
                  { 
                    icon: <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="m9 10 2 2 4-4"/></svg>, 
                    title: "Fast Processing", 
                    desc: "Get your results in seconds with our optimized converter engine." 
                  },
                  { 
                    icon: <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, 
                    title: "Mobile Friendly", 
                    desc: "Works perfectly on iPhones, Android, and tablets anywhere." 
                  },
                  { 
                    icon: <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>, 
                    title: "Secure File Handling", 
                    desc: "Your files are auto-deleted after 30 minutes for total privacy." 
                  },
                  { 
                    icon: <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M2 17h20M2 7h20M5 2v20M19 2v20"/></svg>, 
                    title: "Multiple Formats", 
                    desc: "Support for PDF, Word, Excel, JPG, PNG, MP3 and more." 
                  }
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 transition hover:bg-white hover:shadow-xl hover:shadow-slate-100 duration-500">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 shadow-sm border border-indigo-100/50">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* How It Works */}
            <section className="mt-32">
              <div className="rounded-[48px] bg-indigo-600 p-12 lg:p-20 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                <h2 className="text-4xl font-black mb-16 relative">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                  {[
                    { step: "1", icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, title: "Upload your file", desc: "Select or drag files into the tool area." },
                    { step: "2", icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="m13 2-2 10h8l-2 10" /></svg>, title: "Choose the tool", desc: "The conversion happens in seconds." },
                    { step: "3", icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>, title: "Download instantly", desc: "Your file is ready to use immediately." }
                  ].map((item, i) => (
                    <div key={i} className="space-y-4 group">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white mb-4 transition-all duration-300 group-hover:bg-white group-hover:text-indigo-600 group-hover:scale-110 shadow-xl">
                        {item.icon}
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="h-6 w-6 flex items-center justify-center rounded-full bg-white text-indigo-600 text-xs font-black shadow-md">{item.step}</span>
                      </div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-indigo-100 font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Use Cases */}
            <section className="mt-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">Built for Everyday Use</h2>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed">
                    Convertz is designed for anyone who needs to manage files without technical hurdles. Whether you’re a student, professional, or home user, we've got you covered.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Student submitting assignments & reports",
                      "Job seeker uploading resumes and portfolios",
                      "Office user managing invoices and data"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                        <div className="h-6 w-6 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4 pt-8">
                    <div className="rounded-3xl bg-amber-50 p-6 border border-amber-100 space-y-2">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-indigo-600 mb-2"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
                        <h4 className="font-bold">PDF to Word</h4>
                        <p className="text-xs text-amber-900/60 font-medium">Editable documents in seconds.</p>
                    </div>
                    <div className="rounded-3xl bg-indigo-50 p-6 border border-indigo-100 space-y-2">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-indigo-600 mb-2"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M4 22V10"/><path d="M20 22V4"/><path d="M4 14h16"/></svg></div>
                        <h4 className="font-bold">Merge PDF</h4>
                        <p className="text-xs text-indigo-900/60 font-medium">Combine all your pages.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-3xl bg-emerald-50 p-6 border border-emerald-100 space-y-2">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-indigo-600 mb-2"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 20h.01"/><path d="M7 10v4a5 5 0 0 0 10 0v-4"/><path d="M8 8a4 4 0 1 1 8 0"/></svg></div>
                        <h4 className="font-bold">Video to MP3</h4>
                        <p className="text-xs text-emerald-900/60 font-medium">Extract audio tracks.</p>
                    </div>
                    <div className="rounded-3xl bg-rose-50 p-6 border border-rose-100 space-y-2">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-indigo-600 mb-2"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M4 14l6-6 4 4 6-6"/><path d="M20 12v6h-6"/></svg></div>
                        <h4 className="font-bold">Compress</h4>
                        <p className="text-xs text-rose-900/60 font-medium">Smaller file size instantly.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Home FAQ */}
            <section className="mt-32 pb-20 border-t border-slate-100 pt-20">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-12 text-center flex items-center justify-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm">?</span>
                    Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {[
                    { q: "Is this tool free?", a: "Yes, all tools on Convertz are completely free to use with no hidden charges or premium tiers." },
                    { q: "Do I need to sign up?", a: "No, you can use all tools instantly without creating an account or providing any personal information." },
                    { q: "Is my file safe?", a: "Yes, files are processed securely and automatically deleted from our servers after 30 minutes." },
                    { q: "Does it work on mobile?", a: "Yes! The entire platform is built with a mobile-first approach and works beautifully on any phone or tablet browser." }
                  ].map((item, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200">
                      <h4 className="font-black text-slate-900 mb-2">{item.q}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-16 p-8 rounded-[32px] bg-indigo-50 border border-indigo-100 text-center">
                    <h3 className="text-lg font-black text-indigo-900 mb-2">Try Free PDF Tools Now</h3>
                    <p className="text-sm text-indigo-600 font-medium mb-6">Experience fast, secure, and instant file conversion.</p>
                    <a href="#popular-tools" className="inline-block rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700">Start Using Tools →</a>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTool && (
          <div className="space-y-8">
            <button
              type="button"
              onClick={showHome}
              className="flex w-fit items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-indigo-600"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 19-7-7 7-7" />
              </svg>
              Back to Tools
            </button>
            <div className="space-y-6">
                {statusMessage && (
                  <div
                    className={`rounded-2xl border p-4 text-sm font-semibold ${
                      statusMessage.type === "error"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : statusMessage.type === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {statusMessage.message}
                  </div>
                )}

                {(status || isConverting) && (
                  <div 
                    ref={conversionStatusRef}
                    className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
                      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-xl p-2 ${status === "failed" ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"}`}>
                            {status === "converting" && (
                              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                <path className="opacity-25" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                <path className="opacity-75" d="M12 4v4m0 8v4M4 12H0m24 0h-4M18.364 5.636l-2.828 2.828m-9.072 9.072l-2.828 2.828m0-14.144l2.828 2.828m9.072 9.072l2.828 2.828" />
                              </svg>
                            )}
                            {status === "uploading" && (
                              <svg className="h-5 w-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                              </svg>
                            )}
                            {status === "done" && (
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                            {status === "failed" && (
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-widest text-slate-400">
                              {status === "converting" ? "Converting File" : status === "uploading" ? "Finalizing" : status === "done" ? "Success" : "Error"}
                            </p>
                            <h4 className="text-lg font-bold text-slate-800">
                              {status === "converting" ? "Processing your assets..." : status === "uploading" ? "Generating download link..." : status === "done" ? "Your file is ready" : "Something went wrong"}
                            </h4>
                          </div>
                        </div>
                        {status === "done" ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                            100%
                          </span>
                        ) : null}
                      </div>

                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full transition-all duration-500 ease-out ${status === "failed" ? "bg-rose-500" : "gradient-bg"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {status === "done" && download && (
                        <p className="mt-4 text-sm font-medium text-slate-500">
                          {download.filename}
                        </p>
                      )}

                      {status === "done" && resultNotes.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {resultNotes.map((note) => (
                            <span
                              key={note}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      )}

                      {status === "failed" && (
                        <button
                          onClick={handleConvert}
                          className="mt-8 w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95"
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div
                  className={`relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-300/80 bg-white/50 backdrop-blur-md p-8 sm:p-14 text-center transition-all duration-300 ${
                    isDragging ? "border-indigo-500 bg-indigo-50/50 scale-[1.02]" : "hover:border-slate-400 hover:bg-white/80"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center">
                    <ToolIconBadge name={activeTool.icon} size="lg" className="mb-7" />
                    <h2 className="mb-2 text-lg font-semibold text-slate-900">
                      {isMultiSelect ? "Drop files here" : "Drop file here"}
                    </h2>
                    <p className="mb-2 text-sm text-slate-500">
                      Accepts {getAllowedExtensionsLabel(activeTool.id)}. Output:{" "}
                      {outputLabelByTool[activeTool.id] ?? "converted file"}.
                    </p>
                    <p className="mb-6 text-xs font-medium text-slate-400">
                      {capabilityByTool[activeTool.id] ?? "Processed locally in your browser."}
                    </p>
                    <button
                      type="button"
                      className="rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                    >
                      {isMultiSelect ? "Browse Files" : "Browse File"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple={isMultiSelect}
                      accept={acceptedTypes}
                      className="hidden"
                      onChange={(event) => handleFiles(event.target.files)}
                    />
                  </div>

                                    {/* SEO Trust Badges */}
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-slate-100/50 pt-8">
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.05em] text-slate-600">Free Forever</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.05em] text-slate-600">No Signup Need</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.05em] text-slate-600">Works on Mobile</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.05em] text-slate-600">Instant Download</span>
                    </div>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                      {isMultiSelect ? (
                        /* Modern PDF Merge File List */
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                          {/* Header */}
                          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white">
                                {selectedFiles.length}
                              </div>
                              <span className="text-xs font-bold text-slate-700">PDFs selected · merge order ↓</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 transition active:bg-indigo-200 hover:bg-indigo-100"
                              >
                                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                                </svg>
                                Add Files
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-rose-500 transition active:bg-rose-50 hover:bg-rose-50"
                              >
                                Clear all
                              </button>
                            </div>
                          </div>
                          {/* File rows */}
                          <div className="divide-y divide-slate-100">
                            {selectedFiles.map((file, index) => (
                              <div
                                key={`${file.name}-${file.size}-${index}`}
                                draggable
                                onDragStart={(e) => {
                                  draggedIndexRef.current = index;
                                  e.dataTransfer.effectAllowed = "move";
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.dataTransfer.dropEffect = "move";
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const from = draggedIndexRef.current;
                                  if (from === null || from === index) return;
                                  setSelectedFiles((prev) => {
                                    const next = [...prev];
                                    const [moved] = next.splice(from, 1);
                                    next.splice(index, 0, moved);
                                    return next;
                                  });
                                  draggedIndexRef.current = null;
                                }}
                                onDragEnd={() => { draggedIndexRef.current = null; }}
                                className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50 cursor-default"
                              >
                                {/* PDF icon */}
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                  </svg>
                                </div>
                                {/* Badge + name */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-black text-slate-600">{index + 1}</span>
                                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                                  </div>
                                  <p className="mt-0.5 text-[11px] text-slate-400 font-medium">{formatFileSize(file.size)}</p>
                                </div>
                                {/* Controls: mobile tap buttons + desktop drag handle */}
                                <div className="flex shrink-0 items-center gap-1">
                                  {/* Mobile-only: up/down tap buttons */}
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); moveSelectedFile(index, "up"); }}
                                    disabled={index === 0}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition active:bg-slate-100 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed sm:hidden"
                                    title="Move up"
                                  >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m18 15-6-6-6 6"/></svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); moveSelectedFile(index, "down"); }}
                                    disabled={index === selectedFiles.length - 1}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition active:bg-slate-100 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed sm:hidden"
                                    title="Move down"
                                  >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m6 9 6 6 6-6"/></svg>
                                  </button>
                                  {/* Remove */}
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeSelectedFileAt(index); }}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition active:bg-rose-50 hover:bg-rose-50 hover:text-rose-500"
                                    title="Remove"
                                  >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6 6 18M6 6l12 12"/></svg>
                                  </button>
                                  {/* Desktop-only: drag handle */}
                                  <div
                                    className="hidden sm:flex h-8 w-8 cursor-grab active:cursor-grabbing items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                                    title="Drag to reorder"
                                  >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Single file display */
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0"/></svg>
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-emerald-800">{selectedFiles[0].name}</p>
                                <p className="text-xs font-medium text-emerald-600">{formatFileSize(selectedFiles[0].size)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); clearFile(); }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-400 hover:bg-emerald-100 hover:text-emerald-700 transition"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6 6 18M6 6l12 12"/></svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-2 text-lg font-semibold text-slate-900">{activeTool.name}</h2>
                  <p className="mb-6 text-sm text-slate-600">{activeTool.description}</p>

                  <div className="mb-6 grid gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Input
                      </p>
                      <p className="mt-1 font-semibold text-slate-700">
                        {getAllowedExtensionsLabel(activeTool.id)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Output
                      </p>
                      <p className="mt-1 font-semibold text-slate-700">
                        {outputLabelByTool[activeTool.id] ?? "Converted file"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Mode
                      </p>
                      <p className="mt-1 font-semibold text-slate-700">
                        {isMultiSelect ? "Multiple files" : "Single file"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={handleConvert}
                      disabled={isConverting || selectedFiles.length === 0}
                      className="w-full rounded-lg bg-slate-900 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                    >
                      {`Convert to ${outputLabelByTool[activeTool.id] ?? "output"}`}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600">
                  <div className="flex gap-3">
                    <svg className="h-5 w-5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                      <path d="M12 6V12L16 14" />
                    </svg>
                    <p>
                      Conversions run locally. Downloads are stored securely in the
                      cloud for 30 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {activeToolSeo && (
              <section className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    How To Use {activeTool.name}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {activeToolSeo.intro}
                  </p>
                  <ol className="mt-6 space-y-4">
                    {activeToolSeo.howTo.map((step, index) => (
                      <li key={step} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white">
                          {index + 1}
                        </span>
                        <p className="text-sm font-medium leading-6 text-slate-700">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Why Use This Tool
                  </h2>
                  <div className="mt-6 space-y-3">
                    {activeToolSeo.benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="rounded-2xl bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700"
                      >
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeToolSeo && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {activeTool.name} FAQ
                </h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {activeToolSeo.faq.map((item) => (
                    <article key={item.question} className="rounded-2xl bg-slate-50 p-5">
                      <h3 className="text-base font-bold text-slate-900">{item.question}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {relatedTools.length > 0 && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Related Tools
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {relatedTools.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => openTool(tool.id)}
                      className="related-tool-card rounded-[26px] border border-slate-200/80 p-5 text-left"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <ToolIconBadge name={tool.icon} size="sm" />
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 shadow-sm">
                          {tool.cat}
                        </span>
                      </div>
                      <h3 className="text-base font-black tracking-tight text-slate-900">{tool.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4">
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Output
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {outputLabelByTool[tool.id] ?? "Converted file"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-[32px] border border-slate-200/70 bg-white/70 p-8 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-500">
                Online Converter Tool
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {activeToolSeo?.heroTitle ?? activeTool.name}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {activeToolSeo?.heroBody ?? activeTool.description}
              </p>
              {activeToolSeo?.benefits?.length ? (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {activeToolSeo.benefits.slice(0, 3).map((benefit) => (
                    <div
                      key={benefit}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-600"
                    >
                      {benefit}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        )}
      </main>

      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isHistoryOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsHistoryOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-out border-l border-slate-100 ${isHistoryOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Conversion History</h2>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Your recent work</p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-slate-50 p-6 text-slate-300">
                    <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </div>
                  <p className="mt-4 font-bold text-slate-400">No conversions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="group relative flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-indigo-200 hover:bg-white"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-bold text-slate-800">{item.toolName}</p>
                          <p className="text-[10px] font-bold text-slate-400" suppressHydrationWarning>{formatHistoryTimestamp(item.createdAt)}</p>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{item.fileName}</p>
                        <p className="mt-1 font-mono text-[9px] text-indigo-500">ID: {item.id}</p>
                      </div>

                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!item.uploadUrl) {
                            window.location.href = `/${item.toolSlug}/${item.id}`;
                            return;
                          }
                          const res = await fetch(item.uploadUrl);
                          if (!res.ok) {
                            window.location.href = `/${item.toolSlug}/${item.id}`;
                            return;
                          }
                          const blob = await res.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = item.fileName;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-md transition hover:bg-indigo-700 active:scale-[0.98]"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Auto-deleted after 30 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
