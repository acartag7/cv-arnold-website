# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

**Testing:**
No specific test commands are configured in this project.

## Project Overview

This is a Next.js 15 CV/portfolio website for Arnold Cartagena, a Platform Engineering Lead. The project is being transformed into a modern, Cloudflare-deployed portfolio with dynamic data management.

### Current State
- Basic portfolio site with static JSON data
- Multiple theme support
- Responsive design with some header issues

### Target State
- Deployed on Cloudflare Pages (cv.arnoldcartagena.com)
- CV data stored in Cloudflare Workers KV
- Modern UI with fixed header issues
- Performance optimized (<2s load time)

## Architecture

- **Framework:** Next.js 15 with App Router and React 19
- **Styling:** Tailwind CSS v4 with CSS custom properties for theming
- **Theme System:** next-themes for light/dark mode switching with custom theme variants
- **UI Components:** Custom components with Lucide React icons
- **Data Management:** Currently static JSON, migrating to Cloudflare Workers KV
- **Deployment:** Cloudflare Pages + Workers (free tier)

### Project Structure

- `/src/app/` - Next.js App Router pages and layout
- `/src/components/layout/` - Layout components (Header)
- `/src/components/sections/` - Page section components (Hero, Experience, Skills, etc.)
- `/src/data/` - Static CV data in JSON format (to be migrated)
- `/src/types/` - TypeScript interface definitions
- `/src/app/admin/` - Admin page for data management
- `/workers/` - Cloudflare Workers for API
- `/docs/` - Project documentation (PRD, Architecture, etc.)

## Project Documentation

### Key Documents
1. **PRD.md** - Product requirements and objectives
2. **TECHNICAL_GUIDELINES.md** - Coding standards for all agents
3. **WORKSTREAMS.md** - Parallel development tasks (8 workstreams)
4. **ARCHITECTURE.md** - System design and data flow
5. **DESIGN_SYSTEM.md** - UI/UX specifications
6. **DEPLOYMENT_GUIDE.md** - Cloudflare setup instructions
7. **IMPROVEMENT_PLAN.md** - Detailed improvement analysis

### Development Approach
The project uses 8 parallel workstreams for different Claude Code agents:
- Workstream A: Infrastructure (deployment-engineer)
- Workstream B: Design System (ui-ux-designer)
- Workstream C: Base Components (frontend-developer)
- Workstream D: Header Fix (frontend-developer)
- Workstream E: Content Sections (frontend-developer)
- Workstream F: Data Layer (golang-pro/python-pro)
- Workstream G: Advanced Features (ai-engineer/ml-engineer)
- Workstream H: Quality (code-reviewer)

### Key Technical Decisions
- **Performance First**: Every decision optimizes for speed
- **Edge Computing**: Leverage Cloudflare's global network
- **Type Safety**: TypeScript strict mode always
- **Component Architecture**: Atomic design principles
- **Progressive Enhancement**: Core functionality without JS

## Current Issues to Address

### Header Component
- Inconsistent responsive breakpoints
- Theme dropdown positioning issues
- Poor mobile navigation experience
- Missing accessibility features
- See IMPROVEMENT_PLAN.md for detailed analysis

### Performance
- Bundle size optimization needed
- Image loading improvements required
- Animation performance tuning

## Data Schema

CV data follows a structured TypeScript schema defined in `src/types/index.ts`:
- Personal information, summary, achievements
- Work experience with detailed responsibilities and technologies
- Skills with proficiency ratings
- Certifications and education
- Languages with proficiency levels

### Migration to KV
Data will be migrated from static JSON to Cloudflare Workers KV for dynamic updates without redeployment.

## Dependencies

Key libraries used:
- `@react-pdf/renderer` & `react-pdf` - PDF generation capabilities
- `framer-motion` - Animations
- `lucide-react` - Icon system
- `next-themes` - Theme management
- `wrangler` - Cloudflare Workers CLI (dev dependency)