# DailyLogic

A micro-tools platform built with Next.js 15, TypeScript, and Tailwind CSS. Every tool runs entirely in the browser — no server-side processing of user data.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Tool directory (home)
│   ├── layout.tsx            # Root layout
│   └── tool/[slug]/page.tsx  # Dynamic tool route
├── components/
│   ├── layout/               # Shared layout components
│   └── tools/                # One standalone component per tool
├── hooks/
│   └── use-local-storage.ts  # Persisted user preferences
└── lib/
    └── tools-registry.ts     # Slug → metadata + component map
```

## Adding a New Tool

1. Create `src/components/tools/my-tool.tsx` as a `"use client"` component.
2. Register it in `src/lib/tools-registry.ts` with metadata and a dynamic import (`ssr: false`).
3. The tool is automatically available at `/tool/my-slug` and listed on the home page.

## Design

Light, airy aesthetic: `bg-slate-50` base, white cards with soft shadows, blue accent, rounded corners, friendly typography.
