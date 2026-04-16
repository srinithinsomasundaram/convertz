export type ToolSeoEntry = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroTitle: string;
  heroBody: string;
  intro: string;
  howTo: string[];
  benefits: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
};

export const toolSeoData: Record<string, ToolSeoEntry> = {
  "pdf-to-word": {
    metaTitle: "Free PDF to Word Converter Online (No Signup) – Convert to DOCX",
    metaDescription:
      "Convert PDF to Word online free without signup. Keep exact formatting, fonts, and layout. Fast PDF to DOCX converter for students and professionals.",
    keywords: ["pdf to word free", "convert pdf to word online free india", "pdf to docx no signup", "free pdf converter online"],
    heroTitle: "Convert PDF To Word Online Free",
    heroBody:
      "Turn PDF files into editable DOCX documents in a few clicks. No signup required. Fast, secure, and professional.",
    intro:
      "Use this free PDF to Word converter to edit contracts, invoices, and reports without rebuilding them from scratch.",
    howTo: [
      "Upload your PDF file.",
      "Click convert to extract content.",
      "Download your DOCX file instantly.",
    ],
    benefits: [
      "No signup or installation required.",
      "Maintains layout and formatting.",
      "Works directly in your browser.",
    ],
    faq: [
      {
        question: "Is this PDF to Word tool free?",
        answer: "Yes, it is 100% free with no hidden charges or limits.",
      },
      {
        question: "Is my file safe?",
        answer: "Absolutely. We process files locally or in a secure temporary environment. No one sees your data.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, our converter is fully optimized for mobile browsers. Convert on the go!",
      },
    ],
  },
  "word-to-pdf": {
    metaTitle: "Convert Word to PDF Online Free – DOCX to PDF (No Signup)",
    metaDescription:
      "Convert Word to PDF online free. No signup required. Maintain formatting and create high-quality PDF files instantly.",
    keywords: ["word to pdf free", "docx to pdf online india", "convert word to pdf no signup", "free pdf maker"],
    heroTitle: "Convert Word To PDF Free",
    heroBody:
      "Turn DOCX files into professional PDFs instantly. Maintain layouts, fonts, and styling for a perfect look.",
    intro:
      "Convert Word to PDF free for sharing, printing, and archiving. No software installation needed.",
    howTo: [
      "Upload your DOCX file.",
      "Convert to PDF in seconds.",
      "Download and share your document.",
    ],
    benefits: [
      "100% free with no signup.",
      "Preserves original formatting.",
      "Works on any device or browser.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, Convertz provides this tool for free to all users.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes. We respect your privacy and process files securely.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Definitely. You can convert Word documents to PDF on any mobile phone.",
      },
    ],
  },
  "html-to-pdf": {
    metaTitle: "HTML to PDF Converter Online Free – Save Web Page as PDF",
    metaDescription:
      "Convert HTML or web pages to PDF online free. Preserve layout, styling, and structure for clean printable documents.",
    keywords: ["html to pdf online free", "website to pdf converter india", "save webpage as pdf", "html to pdf tool"],
    heroTitle: "Convert HTML to PDF Free",
    heroBody:
      "Turn HTML files into clean, printable PDF documents. Preserve styles and layouts perfectly.",
    intro:
      "Easily save web pages or HTML codes as PDFs for offline reading, archiving, or sharing.",
    howTo: [
      "Upload your HTML file.",
      "Click convert to generate PDF.",
      "Download your PDF instantly.",
    ],
    benefits: [
      "Preserves web page styling.",
      "No signup or fees required.",
      "Works on all platforms.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, you can convert as many HTML files as you like for free.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes, we prioritize security and private processing.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, it works perfectly on mobile browsers.",
      },
    ],
  },
  "jpg-to-pdf": {
    metaTitle: "JPG to PDF Converter Online Free – Merge Images to PDF",
    metaDescription:
      "Convert JPG to PDF online free. Combine multiple images into a single PDF. Fast, simple, and mobile-friendly tool.",
    keywords: ["jpg to pdf free", "image to pdf online india", "convert photos to pdf mobile", "merge images to pdf"],
    heroTitle: "Convert JPG to PDF Free",
    heroBody:
      "Turn your photos and scans into high-quality PDFs. Fast, free, and no signup needed.",
    intro:
      "Combine your images into a single professional PDF document. Perfect for forms and receipts.",
    howTo: [
      "Upload your JPG images.",
      "Arrange them in the right order.",
      "Download your combined PDF.",
    ],
    benefits: [
      "Works on mobile devices.",
      "Merge multiple images at once.",
      "High-quality output every time.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, Convert JPG to PDF for free.",
      },
      {
        question: "Is my file safe?",
        answer: "Absolutely. Security is our priority.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes! It's built to be mobile-friendly.",
      },
    ],
  },
  "pdf-to-jpg": {
    metaTitle: "PDF to JPG Converter Online Free – Extract Images from PDF",
    metaDescription:
      "Convert PDF to JPG online free. Extract all pages as high-quality images and download instantly.",
    keywords: ["pdf to jpg free", "convert pdf to image online india", "pdf to jpg download", "extract images from pdf"],
    heroTitle: "Convert PDF to JPG Free",
    heroBody:
      "Turn your PDF pages into images or extract images from your PDF files instantly.",
    intro:
      "Convert PDF to JPG free and get high-quality images ready for use in any app.",
    howTo: [
      "Upload your PDF file.",
      "Extract pages as JPG images.",
      "Download the images as a ZIP file.",
    ],
    benefits: [
      "No signup required.",
      "High-resolution image output.",
      "Fast and easy processing.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, convert PDF to JPG at no cost.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes, your data is protected during conversion.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, use it anywhere on your mobile phone.",
      },
    ],
  },
  "excel-to-pdf": {
    metaTitle: "Excel to PDF Converter Online Free – XLSX to PDF",
    metaDescription:
      "Convert Excel to PDF online free. Keep tables, formatting, and formulas intact. Ideal for reports and invoices.",
    keywords: ["excel to pdf free", "xlsx to pdf online india", "convert spreadsheet to pdf", "excel file to pdf free"],
    heroTitle: "Convert Excel to PDF Free",
    heroBody:
      "Turn your spreadsheets into professional PDF documents. No signup, no fees, just fast conversion.",
    intro:
      "Maintain your tables and data structure perfectly while converting XLSX to PDF for easy sharing.",
    howTo: [
      "Upload your Excel (XLSX/XLS) file.",
      "Click convert to generate PDF.",
      "Download your document instantly.",
    ],
    benefits: [
      "Supports large spreadsheets.",
      "Preserves tables and formatting.",
      "100% free and secure.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, Excel to PDF conversion is completely free.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes, we use secure processing to protect your data.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, you can convert spreadsheets on any mobile device.",
      },
    ],
  },
  "png-to-jpg": {
    metaTitle: "PNG to JPG Converter Online Free – Fast Image Converter",
    metaDescription:
      "Convert PNG to JPG online free. Reduce image size and improve compatibility instantly with no signup.",
    keywords: ["png to jpg free", "convert png to jpg online india", "image converter free", "png to jpeg tool"],
    heroTitle: "Convert PNG to JPG Free",
    heroBody:
      "Change PNG images to JPG format instantly. Perfect for reducing file size and improving compatibility.",
    intro:
      "Fast and free image conversion without any software or signup. Works directly in your browser.",
    howTo: [
      "Upload your PNG file.",
      "Convert to JPG in one click.",
      "Download your new image.",
    ],
    benefits: [
      "Reduces file size effectively.",
      "No quality loss in conversion.",
      "Works on all devices.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, you can convert unlimited PNGs to JPG for free.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes, we process images securely in your browser.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, it's fully mobile-compatible.",
      },
    ],
  },
  "merge-pdf": {
    metaTitle: "Merge PDF Files Online Free – Combine PDFs (No Signup)",
    metaDescription:
      "Merge multiple PDF files into one online free. No signup needed. Fast and secure PDF combiner.",
    keywords: ["merge pdf online free india", "combine pdf files free", "pdf joiner no signup", "pdf merger tool"],
    heroTitle: "Merge PDF Files Free",
    heroBody:
      "Combine multiple PDFs into a single document in seconds. Arrange your files in any order.",
    intro:
      "Fast, free, and simple PDF merging. No signup or limits on the number of files.",
    howTo: [
      "Upload multiple PDF files.",
      "Drag and drop to reorder.",
      "Download your merged PDF.",
    ],
    benefits: [
      "No file limits.",
      "Preserves original quality.",
      "Simple drag-and-drop interface.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, merging PDFs is completely free on Convertz.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes, your documents are handled with top-tier security.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, you can merge PDFs easily on your phone.",
      },
    ],
  },
  "pdf-to-excel": {
    metaTitle: "PDF to Excel Converter Online Free – Convert PDF to XLSX",
    metaDescription:
      "Convert PDF to Excel online free. Extract tables accurately into editable spreadsheets instantly.",
    keywords: ["pdf to excel free", "convert pdf to xlsx online india", "extract table from pdf free", "pdf to spreadsheet"],
    heroTitle: "Convert PDF to Excel Free",
    heroBody:
      "Turn your PDF data into editable Excel sheets. Extract tables with precision automatically.",
    intro:
      "No more manual typing. Convert your tables from PDF to Excel XLSX format in seconds.",
    howTo: [
      "Upload your PDF document.",
      "Wait for table extraction.",
      "Download your Excel file.",
    ],
    benefits: [
      "High accuracy extraction.",
      "No signup needed.",
      "Works for scanned PDFs too.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, PDF to Excel conversion is free for all users.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes, your documents are processed securely.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, it is fully optimized for mobile devices.",
      },
    ],
  },
  "ppt-to-pdf": {
    metaTitle: "PPT to PDF Converter Online Free – PowerPoint to PDF",
    metaDescription:
      "Convert PowerPoint to PDF online free. Preserve slide layout and formatting for easy sharing.",
    keywords: ["ppt to pdf free", "powerpoint to pdf online india", "convert slides to pdf free", "pptx to pdf tool"],
    heroTitle: "Convert PPT to PDF Free",
    heroBody:
      "Turn your slides into high-quality PDFs. Maintain layouts and animations' static feel for perfect sharing.",
    intro:
      "Professional PPTX to PDF conversion without any software or signup.",
    howTo: [
      "Upload your PPTX file.",
      "Convert slides to PDF pages.",
      "Download and share your file.",
    ],
    benefits: [
      "Preserves slide resolution.",
      "Works on mobile devices.",
      "100% free and instant.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, you can convert PowerPoint to PDF for free.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes, we prioritize your privacy and security.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, it works beautifully on mobile browsers.",
      },
    ],
  },
  "video-to-mp3": {
    metaTitle: "Video to MP3 Converter Online Free – Extract Audio Fast",
    metaDescription:
      "Convert video to MP3 online free. Extract high-quality audio from MP4 and other formats instantly.",
    keywords: ["video to mp3 free", "convert video to audio online india", "mp4 to mp3 converter free", "extract audio tool"],
    heroTitle: "Convert Video to MP3 Free",
    heroBody:
      "Extract crystal-clear audio from your video files. Supports MP4, AVI, MOV, and more instantly.",
    intro:
      "Free and fast video to MP3 conversion. No signup, no installation, just drop and convert.",
    howTo: [
      "Upload your video file.",
      "Extract audio as MP3.",
      "Download your audio file.",
    ],
    benefits: [
      "High bit-rate audio extraction.",
      "No file size limits for free users.",
      "Works on mobile and desktop.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, extracting audio from video is entirely free.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes, we handle your video files with strict privacy.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, you can extract audio on your phone easily.",
      },
    ],
  },
  "compress-pdf": {
    metaTitle: "Compress PDF Online Free – Reduce File Size (No Signup)",
    metaDescription:
      "Compress PDF online free without losing quality. Reduce file size for faster upload, email, and sharing.",
    keywords: ["compress pdf free india", "reduce pdf size online free", "pdf compressor no signup", "shrink pdf file"],
    heroTitle: "Compress PDF Online Free",
    heroBody:
      "Reduce your PDF file size without sacrificing clarity. Perfect for email attachments and web uploads.",
    intro:
      "Shrink your PDF files in seconds. No signup, no strings attached – just smaller files.",
    howTo: [
      "Upload your heavy PDF.",
      "Optimize and compress.",
      "Download the smaller version.",
    ],
    benefits: [
      "Maintains text and image quality.",
      "No signup or hidden fees.",
      "Mobile-friendly compression.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, compressing PDFs is 100% free.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes, your files are processed securely and privately.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, you can compress files directly on your phone.",
      },
    ],
  },
  "csv-to-excel": {
    metaTitle: "CSV to Excel Converter Online Free – Convert CSV to XLSX",
    metaDescription:
      "Convert CSV to Excel online free. Organize and edit data easily in structured XLSX format.",
    keywords: ["csv to excel free", "convert csv to xlsx online india", "csv file to excel", "data converter tool"],
    heroTitle: "Convert CSV to Excel Free",
    heroBody:
      "Turn your raw CSV data into organized Excel XLSX files instantly. Perfect for data analysis.",
    intro:
      "Fast and free CSV to XLSX conversion. No signup required, works in your browser.",
    howTo: [
      "Upload your CSV file.",
      "Convert to Excel format.",
      "Download your spreadsheet.",
    ],
    benefits: [
      "Accurate data parsing.",
      "No signup needed.",
      "Support for large data sets.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, CSV to Excel conversion is absolutely free.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes, your data remains secure and private.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, you can convert data files on your phone.",
      },
    ],
  },
  "heic-to-jpg": {
    metaTitle: "HEIC to JPG Converter Online Free – iPhone Photo Converter",
    metaDescription:
      "Convert HEIC to JPG online free. Make iPhone photos compatible with all devices instantly.",
    keywords: ["heic to jpg free india", "convert iphone photos to jpg", "heic to jpeg online", "image converter free"],
    heroTitle: "Convert HEIC to JPG Free",
    heroBody:
      "Make your iPhone HEIC photos compatible with Windows, Android, and web apps instantly.",
    intro:
      "Free and fast HEIC to JPG converter. Use it for one photo or many, with no signup.",
    howTo: [
      "Upload your HEIC photo.",
      "Convert to JPG in a second.",
      "Download your compatible image.",
    ],
    benefits: [
      "Resolves compatibility issues.",
      "High-quality JPG output.",
      "100% free for everyone.",
    ],
    faq: [
      {
        question: "Is this tool free?",
        answer: "Yes, HEIC to JPG conversion is completely free.",
      },
      {
        question: "Is my file safe?",
        answer: "Yes, your photos are processed securely.",
      },
      {
        question: "Does it work on mobile?",
        answer: "Yes, it works perfectly on iPhone and Android browsers.",
      },
    ],
  },
};
