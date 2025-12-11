# Focus Forge Website

This is the landing page and product website for Focus Forge, built with Next.js.

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Next.js 15** - React framework
- **React 19** - UI library
- **TailwindCSS 4** - Styling
- **TypeScript** - Type safety
- **Radix UI** - Accessible UI components (reused from parent project)
- **Lucide React** - Icons

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Local website components
- `/lib` - Utility functions
- `@/components/ui` - Shared UI components from parent project

## Building for Production

```bash
pnpm build
pnpm start
```

## Deployment

The website can be deployed to Vercel, Netlify, or any platform that supports Next.js.
