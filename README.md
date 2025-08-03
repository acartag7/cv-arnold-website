# CV Website - Arnold Cartagena

A modern, performance-optimized CV website deployed on Cloudflare Pages with dynamic data management.

## 🚀 Live Site

- **Production**: [cv.arnoldcartagena.com](https://cv.arnoldcartagena.com) _(coming soon)_
- **Preview**: Auto-deployed on PRs

## 📋 Project Status

**Current Phase**: Setting up parallel development workstreams

### Key Objectives

1. Deploy professional portfolio on Cloudflare Pages
2. Migrate CV data to Cloudflare Workers KV
3. Fix header layout issues and improve UX
4. Achieve <2s load times globally
5. Create open-source template (Phase 2)

## 🏗️ Architecture

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + CSS Custom Properties
- **Animations**: Framer Motion
- **Deployment**: Cloudflare Pages + Workers (Free Tier)
- **Data**: Cloudflare Workers KV
- **Domain**: cv.arnoldcartagena.com

## 📚 Documentation

- [**PRD.md**](./PRD.md) - Product Requirements
- [**WORKSTREAMS.md**](./WORKSTREAMS.md) - Parallel Development Plan
- [**TECHNICAL_GUIDELINES.md**](./TECHNICAL_GUIDELINES.md) - Coding Standards
- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - System Design
- [**DESIGN_SYSTEM.md**](./DESIGN_SYSTEM.md) - UI/UX Specifications
- [**DEPLOYMENT_GUIDE.md**](./DEPLOYMENT_GUIDE.md) - Cloudflare Setup
- [**CLAUDE.md**](./CLAUDE.md) - Claude Code Instructions

## 🔧 Development

### Prerequisites

```bash
# Install pnpm globally (faster, more efficient than npm)
npm install -g pnpm
```

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Open http://localhost:3000
```

### Commands

```bash
pnpm run dev          # Development server with Turbopack
pnpm run build        # Production build
pnpm run start        # Production server
pnpm run lint         # ESLint checks
pnpm install <pkg>    # Add dependency
pnpm add -D <pkg>     # Add dev dependency
```

### Why pnpm?

- **⚡ 2x faster** installs than npm
- **💾 50% less** disk space usage
- **🔒 Strict** dependency resolution (prevents phantom dependencies)
- **📦 Better** monorepo support

## 🌊 Workstreams

This project uses 8 parallel development workstreams:

| Workstream | Agent                   | Status     | Description                       |
| ---------- | ----------------------- | ---------- | --------------------------------- |
| **A**      | deployment-engineer     | 🔄 Ready   | Infrastructure & Cloudflare setup |
| **B**      | ui-ux-designer          | 🔄 Ready   | Design system & component specs   |
| **C**      | frontend-developer      | ⏳ Pending | Base component library            |
| **D**      | frontend-developer      | ⏳ Pending | Header & navigation fixes         |
| **E**      | frontend-developer      | ⏳ Pending | Content sections                  |
| **F**      | golang-pro/python-pro   | ⏳ Pending | Data layer & API                  |
| **G**      | ai-engineer/ml-engineer | ⏳ Pending | Advanced features                 |
| **H**      | code-reviewer           | 🔄 Ready   | Quality assurance                 |

## 🤝 Contributing

### For Parallel Development

1. Read [TECHNICAL_GUIDELINES.md](./TECHNICAL_GUIDELINES.md)
2. Check your assigned workstream in [WORKSTREAMS.md](./WORKSTREAMS.md)
3. Create feature branch: `feature/workstream-x-description`
4. Follow branch naming conventions
5. Create PR with detailed description

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/workstream-a-infrastructure

# Make changes and commit
git add .
git commit -m "feat(infrastructure): setup cloudflare pages config"

# Push and create PR
git push -u origin feature/workstream-a-infrastructure
```

## 📊 Performance Targets

- **Lighthouse Score**: >95 all metrics
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3.5s
- **Bundle Size**: <200KB gzipped

## 🔐 Environment Variables

### Development (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
KV_NAMESPACE_ID=your_kv_namespace_id
ADMIN_AUTH_TOKEN=your_secure_admin_token
```

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

## 🙋‍♂️ Author

**Arnold Cartagena** - Platform Engineering Lead

- LinkedIn: [arnold-cartagena](https://linkedin.com/in/arnold-cartagena)
- GitHub: [acartag7](https://github.com/acartag7)
- Email: <cartagena.arnold@gmail.com>

---

_This project showcases modern platform engineering practices through its implementation._
Let's test markdownlint on README
