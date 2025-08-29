# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based research blog/portfolio built on the AstroPaper theme, customized for showcasing academic research, publications, and software. The site features two main content types: blog posts (research papers) and software projects.

## Key Commands

```bash
# Development
npm run dev          # Start dev server at localhost:4321
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # ESLint checking
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes
npm run sync         # Generate TypeScript types for Astro modules

# Docker (if needed)
docker compose up -d # Run in Docker
```

## Architecture & Structure

### Content System
- **Blog Collection**: Research papers and academic content in `src/content/blog/`
- **Software Collection**: Software projects and tools in `src/content/software/`
- Content uses Zod schemas with custom fields for academic metadata (DOI, arXiv, ORCID, bibtex, etc.)

### Key Configuration Files
- `src/config.ts`: Site configuration, author info, social links
- `src/content/config.ts`: Content collection schemas and validation
- `astro.config.ts`: Astro configuration with Vercel adapter, hybrid output

### Technology Stack
- **Framework**: Astro v4 with React components
- **Styling**: TailwindCSS with custom typography
- **Search**: FuseJS for fuzzy search
- **Deployment**: Vercel with serverless adapter
- **Content**: Markdown with remark plugins (TOC, collapse)

### Special Features
- Dynamic OG image generation for posts
- Academic paper metadata support (authors, DOI, arXiv, bibtex)
- Software project showcase with repo/docs/demo links  
- AI-powered chatbot integration (see `src/pages/api/ask.ts`)
- Career timeline and skills visualization components

### Component Structure
- React components in TypeScript (`.tsx`)
- Astro components for layouts and static content
- Shared utilities in `src/utils/` for content processing
- Custom components: `CareerTimeline`, `CsvPreview`

### Content Frontmatter
Blog posts support academic fields: `authors`, `doi`, `arxiv`, `journal`, `bibtex`, `isPaper`
Software posts support: `repo`, `docs`, `demo`, `pypi`, `npm`, `license`, `catalogue`