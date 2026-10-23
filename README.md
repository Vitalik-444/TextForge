# TextForge

A browser-based text-to-file converter built with React, TypeScript, Vite, Tailwind CSS, jsPDF, and docx. Text is processed locally in the browser; there is no backend or database.

## Features

- Export text as UTF-8 TXT, PDF, and DOCX
- PDF page size, font size, margins, and font family settings
- DOCX font, size, and paragraph alignment settings
- Live approximate preview, character/word/line counts, clipboard helpers
- Local draft saving and restoration with `localStorage`
- Responsive layout and toast feedback

## Requirements

- Node.js 20 or newer
- npm

## Install and run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The production output is written to `dist/`.

## Deploy to Vercel

Import this repository into Vercel and use the default Vite settings:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

No environment variables are required. The Unicode-capable DejaVu Sans font is served from `public/DejaVuSans.ttf` and embedded into PDFs when non-ASCII characters are present.

## Privacy

The app does not upload document content. Drafts are stored in the current browser's `localStorage` only when the user chooses **Save draft**; an existing saved draft is restored on the next visit.
