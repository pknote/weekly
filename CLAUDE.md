# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**潮流周刊** (Weekly) — a personal blog by Tw93, built with Astro 5.x as a static site. Posts are Markdown files published weekly.

## Commands

```bash
npm run dev      # Start dev server
npm run build   # Build static site + run pagefind index (postbuild hook)
npm run preview # Preview built site
```

## Architecture

### Content Processing Pipeline

Posts live in `src/pages/posts/` as `.md` files named `NNN-title.md`. The pipeline has two stages:

1. **`astro.config.mjs`** — A `defaultLayoutPlugin` remark plugin auto-generates frontmatter for every post:
   - Sets `layout: "@layouts/post.astro"`
   - Extracts `issueNumber` and `issueTitle` from filename
   - Auto-assigns `image` from first `<img>` tag in content, `description` from second paragraph
   - Calculates `date` (uses file creation time, or reverse-counts from issue number for `tw93/weekly`)
   - Generates `numericUrl` (`/posts/NNN`) and `socialImage`

2. **`[id].astro`** (`src/pages/posts/[id].astro`) — Handles routing:
   - `getStaticPaths()` maps both numeric (`241`) and slug (`241-经过长沙`) IDs
   - Redirects legacy slugs to numeric URLs via 301
   - Enhances frontmatter with `url`, `numericUrl`, `legacySlug`, `issueNumber`

### URL Convention

- **Numeric URL**: `/posts/241` — primary, clean URL
- **Legacy slug URL**: `/posts/241-经过长沙` — preserved for backlinks, redirects to numeric
- `util.ts` helpers (`parseTitle`, `getIndex`, `toNumericUrl`) normalize between forms

### Layout Structure

- **`BaseLayout.astro`** — HTML shell with `<HeadSEO>`, `<HeadCommon>`, header/footer
- **`post.astro`** — Article layout with 3-column grid (sidebar / content / TOC), comment system (Giscus), prev/next navigation
- **`Card.astro`** — Homepage post card with lazy image loading (lozad)

### Configuration

`src/config.ts` — Global site metadata (title, author, repo, social links). **Must be updated when forking.**

The `SITE.repo` value in `astro.config.mjs` is used to switch between official behavior and fork behavior (date calculation logic, social images).

### Search

Pagefind runs automatically after build (`postbuild: pagefind --site dist`). Index is generated from the built HTML in `dist/`.

### Comment System

Giscus (GitHub Discussions). The repo and category IDs in `post.astro` are for the original `tw93/weekly` repo — swap for your own when forking.