# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**weekly** is a personal weekly blog by Tw93 (潮流周刊), documenting life through photo posts. Built with Astro as a static site, deployed on Vercel.

## Development Commands

```bash
npm run dev      # Start dev server
npm run build   # Build for production (runs pagefind postbuild automatically)
npm run preview # Preview production build
```

## Architecture

### Content Structure
- Posts live in `src/pages/posts/` as markdown files named `{number}-{title}.md` (e.g., `241-经过长沙.md`)
- `posts.json` at root is an index of all posts with metadata (num, title, url, pic)
- Frontmatter fields: `image`, `description`, `date` override auto-detection

### URL/Post Numbering Convention
The `astro.config.mjs` defaultLayoutPlugin remark plugin extracts post number from filename (first `-` separated segment) and populates `issueNumber` and `numericUrl` frontmatter. For `tw93/weekly` repo, dates are calculated backward from issue 100 (2022-10-10).

### Image Processing
`rehype-image.js` automatically appends `?x-oss-process=image/resize,w_3600/format,webp` to CDN images from `cdn.fliggy.com` and `gw.alicdn.com` (excluding .gif/.svg).

### Site Configuration
`src/config.ts` contains `SITE` object with author info, social links, and repo name that controls behavior (e.g., social image generation for issue 110+).

## Key Files

- `astro.config.mjs` — Astro config with custom remark/rehype plugins for post metadata and image processing
- `src/util.ts` — URL parsing utilities: `parseTitle`, `getIndex`, `toNumericUrl`, `sortPosts`
- `src/config.ts` — Site-wide configuration
- `src/layouts/post.astro` — Post article layout
- `src/components/LeftSidebar.astro` — Navigation sidebar with post list