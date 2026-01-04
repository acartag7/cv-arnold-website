# Changelog

## [0.1.4](https://github.com/acartag7/cv-arnold-website/compare/v0.1.3...v0.1.4) (2026-01-04)


### 🐛 Bug Fixes

* **storage:** implement binary-first read for KV compression support ([#57](https://github.com/acartag7/cv-arnold-website/issues/57)) ([b864a7a](https://github.com/acartag7/cv-arnold-website/commit/b864a7aa87e67bc2aa447a98c8d6822e7bfab0cd))

## [0.1.3](https://github.com/acartag7/cv-arnold-website/compare/v0.1.2...v0.1.3) (2026-01-04)


### 🐛 Bug Fixes

* **proxy:** forward Cloudflare Access auth headers and improve logging ([#54](https://github.com/acartag7/cv-arnold-website/issues/54)) ([7c8e9ed](https://github.com/acartag7/cv-arnold-website/commit/7c8e9ed1ca6f2d6d2bd46b5cea307179fc7bcac0))


### ♻️ Refactoring

* **kv:** unify key format to cv:data:v1 across all components ([#55](https://github.com/acartag7/cv-arnold-website/issues/55)) ([391d671](https://github.com/acartag7/cv-arnold-website/commit/391d671718b04f16bbf4336b11241c77bc504736))

## [0.1.2](https://github.com/acartag7/cv-arnold-website/compare/v0.1.1...v0.1.2) (2026-01-04)


### ✨ Features

* **security:** implement BFF proxy pattern for API authentication ([#50](https://github.com/acartag7/cv-arnold-website/issues/50)) ([7280c35](https://github.com/acartag7/cv-arnold-website/commit/7280c35c28895602d144212a31279c340e960b9d))

## [0.1.1](https://github.com/acartag7/cv-arnold-website/compare/v0.1.0...v0.1.1) (2026-01-03)


### ✨ Features

* add Claude Code GitHub Actions integration ([#4](https://github.com/acartag7/cv-arnold-website/issues/4)) ([509c190](https://github.com/acartag7/cv-arnold-website/commit/509c1906ee8a91b1dfb22bc96fc16af214903e5a))
* add Claude Code GitHub Actions workflow ([9c398b5](https://github.com/acartag7/cv-arnold-website/commit/9c398b5cde773827c6e20058e1e378735ab35584))
* add Claude Code GitHub Workflow ([#10](https://github.com/acartag7/cv-arnold-website/issues/10)) ([a6d3869](https://github.com/acartag7/cv-arnold-website/commit/a6d3869844e67dd0f81c1fbe2b4c632967b23261))
* add comprehensive TypeScript definitions for design token system ([89e93c4](https://github.com/acartag7/cv-arnold-website/commit/89e93c4411868564a9bc46be7eb052dca6336cb7))
* **admin:** Phase 2 - Personal Info Editor with Stripe-style form (Task 16) ([#37](https://github.com/acartag7/cv-arnold-website/issues/37)) ([a85c1d7](https://github.com/acartag7/cv-arnold-website/commit/a85c1d7f47afb308cbfeee8d1c371e38a0b94997))
* **admin:** Phases 2-4 - Complete section editors with Stripe-style UI (Task 16) ([#40](https://github.com/acartag7/cv-arnold-website/issues/40)) ([f6d569c](https://github.com/acartag7/cv-arnold-website/commit/f6d569c6d709e6920d189466e36ea81758945912))
* **api:** add response caching with automatic invalidation (Task 7.8) ([#32](https://github.com/acartag7/cv-arnold-website/issues/32)) ([d8fe8ad](https://github.com/acartag7/cv-arnold-website/commit/d8fe8adce7bde48f197db0a962a3198605f92d0c))
* **api:** add sliding window rate limiting middleware (Task 7.7) ([#30](https://github.com/acartag7/cv-arnold-website/issues/30)) ([84f98f5](https://github.com/acartag7/cv-arnold-website/commit/84f98f53c46fd893ad2023cf5d3f44ad26d231f2))
* **api:** set up Workers API project structure and routing (Task 7.1) ([#27](https://github.com/acartag7/cv-arnold-website/issues/27)) ([d3696bf](https://github.com/acartag7/cv-arnold-website/commit/d3696bf73083587e388f154c1e251dbf8a60d963))
* **api:** YAML export/import with preview mode (Task 7.5, 7.6) ([#28](https://github.com/acartag7/cv-arnold-website/issues/28)) ([4228ead](https://github.com/acartag7/cv-arnold-website/commit/4228eadb0c33bb4cbe622e3979fd87f93d7167d0))
* complete Next.js 15 project foundation and infrastructure ([7f03618](https://github.com/acartag7/cv-arnold-website/commit/7f0361853d85394ff5c5289155b557ad6b0383e3))
* complete project structure with barrel exports and documentation ([493c494](https://github.com/acartag7/cv-arnold-website/commit/493c494e170e81521dd594b21d66c5803bd635c8))
* complete Task 1 infrastructure cleanup and optimization ([52775aa](https://github.com/acartag7/cv-arnold-website/commit/52775aad0dcec8a367e9ce0cf0194802612e87fc))
* configure comprehensive code quality tools and developer experience ([1baa32d](https://github.com/acartag7/cv-arnold-website/commit/1baa32dad111bbee51e135cd489d8bf7816b3225))
* configure git repository with proper file handling and normalization ([304f7b4](https://github.com/acartag7/cv-arnold-website/commit/304f7b4bd4a1b96f40b64ff113ac496b85510828))
* configure Next.js 15 with TypeScript strict mode ([bec6ddc](https://github.com/acartag7/cv-arnold-website/commit/bec6ddcb6ce314c5b8429f5a637d2b18dcad98e6))
* configure Tailwind CSS v4 with design tokens ([2c7da63](https://github.com/acartag7/cv-arnold-website/commit/2c7da636efc7e65194ebcbec626a53eeae465d9e))
* enhance theme system with professional styling and improved UX ([#5](https://github.com/acartag7/cv-arnold-website/issues/5)) ([bd83d5e](https://github.com/acartag7/cv-arnold-website/commit/bd83d5e05e936e2bba3b8e474df3928071bcdbd8))
* error handling and caching system (Task 3.7) ([#23](https://github.com/acartag7/cv-arnold-website/issues/23)) ([a5b9c13](https://github.com/acartag7/cv-arnold-website/commit/a5b9c135465efb9cb20070244e1958fbad9f346a))
* Experience Timeline & Skills Matrix (Task 6 Phase 1) ([#25](https://github.com/acartag7/cv-arnold-website/issues/25)) ([8f7a847](https://github.com/acartag7/cv-arnold-website/commit/8f7a8475d383435a5b047d4a13c21a790dbacbb6))
* implement Claude review suggestions + active consideration workflow ([#15](https://github.com/acartag7/cv-arnold-website/issues/15)) ([8b1178c](https://github.com/acartag7/cv-arnold-website/commit/8b1178c30299af6292da3b7ece4fa00ea4ac3dee))
* implement Cloudflare KV storage adapter (Task 3.5) ([#18](https://github.com/acartag7/cv-arnold-website/issues/18)) ([585cb98](https://github.com/acartag7/cv-arnold-website/commit/585cb98ad03d66c3539b648bb7d661183a386e96))
* implement comprehensive Card and Badge components with documentation system ([#9](https://github.com/acartag7/cv-arnold-website/issues/9)) ([b854046](https://github.com/acartag7/cv-arnold-website/commit/b85404600ad702b181af6994242459a846344dfe))
* implement comprehensive design token system architecture ([a446dc6](https://github.com/acartag7/cv-arnold-website/commit/a446dc64f5a0be5b84a9685d3224afcccb8d8c9d))
* implement comprehensive design token system architecture ([a446dc6](https://github.com/acartag7/cv-arnold-website/commit/a446dc64f5a0be5b84a9685d3224afcccb8d8c9d))
* implement comprehensive design token system architecture ([be4e150](https://github.com/acartag7/cv-arnold-website/commit/be4e150d00a05728febbb87d34a57dceec70bfb1))
* implement comprehensive mock data service (Task 3.4) ([#21](https://github.com/acartag7/cv-arnold-website/issues/21)) ([d85e49a](https://github.com/acartag7/cv-arnold-website/commit/d85e49af62dab8d7775333b4d059e533d452db85))
* implement comprehensive responsive breakpoint system (Task 2.8) ([#7](https://github.com/acartag7/cv-arnold-website/issues/7)) ([543f8b3](https://github.com/acartag7/cv-arnold-website/commit/543f8b34be10938a7731905a81c24bcfdcae569b))
* implement comprehensive responsive grid system with 8px alignment ([#6](https://github.com/acartag7/cv-arnold-website/issues/6)) ([a793fe2](https://github.com/acartag7/cv-arnold-website/commit/a793fe239575e29c6b9fa9b92dca6e61ee81b8a2))
* implement comprehensive testing infrastructure (Task 15) ([#17](https://github.com/acartag7/cv-arnold-website/issues/17)) ([0f50b44](https://github.com/acartag7/cv-arnold-website/commit/0f50b44a233f2a94a09e0b1a092898eaa65b0495))
* implement comprehensive TypeScript data layer interfaces (Task 3.1) ([#11](https://github.com/acartag7/cv-arnold-website/issues/11)) ([b98ab46](https://github.com/acartag7/cv-arnold-website/commit/b98ab462a9cbfb3e2bd2a385cf4d6d089ec1434b))
* implement comprehensive Typography component and scale system ([#8](https://github.com/acartag7/cv-arnold-website/issues/8)) ([7eae2a8](https://github.com/acartag7/cv-arnold-website/commit/7eae2a81f51a737237970fca2382293792d9a8a5))
* implement comprehensive Zod schemas for runtime validation (Task 3.2) ([#13](https://github.com/acartag7/cv-arnold-website/issues/13)) ([27357d3](https://github.com/acartag7/cv-arnold-website/commit/27357d3156aa2a679adde4b91a1b007f9dc32bb0))
* implement optimized CI/CD pipeline with Cloudflare Pages deployment ([b27c6a4](https://github.com/acartag7/cv-arnold-website/commit/b27c6a4727ef6da1d86eeb70de0bf2e56d0b7c8e))
* implement repository pattern service layer (Task 3.3) ([#16](https://github.com/acartag7/cv-arnold-website/issues/16)) ([cd3b669](https://github.com/acartag7/cv-arnold-website/commit/cd3b6691b0b5c4e512aaa5a422814a7f33132771))
* **infra:** add Terraform IaC for Cloudflare resources ([#39](https://github.com/acartag7/cv-arnold-website/issues/39)) ([354786d](https://github.com/acartag7/cv-arnold-website/commit/354786d6d2926efa259d254f8ad9821e7e4fe5b4))
* **infra:** Enterprise architecture with Release Please ([#43](https://github.com/acartag7/cv-arnold-website/issues/43)) ([3999634](https://github.com/acartag7/cv-arnold-website/commit/399963489f1c6552910fecabceabca5ca8f971e5))
* initial project setup with comprehensive documentation ([8b89252](https://github.com/acartag7/cv-arnold-website/commit/8b8925281d7f15bed7e579851ea7eac326ce5569))
* install core dependencies and utility functions ([784ca0b](https://github.com/acartag7/cv-arnold-website/commit/784ca0b75dce063dd440d2d8ca1b97edac386726))
* Modern Header with Navigation (Task 4) ([#24](https://github.com/acartag7/cv-arnold-website/issues/24)) ([e88e074](https://github.com/acartag7/cv-arnold-website/commit/e88e074a8696bfa1e4fd52f24e997de50a525008))
* Next.js 15 foundation setup with TaskMaster integration ([7dcabec](https://github.com/acartag7/cv-arnold-website/commit/7dcabece9919b2df13ab5e3d33a14538ddd4c891))
* optimize pre-commit hooks for file-type specific linting ([d92721f](https://github.com/acartag7/cv-arnold-website/commit/d92721f75d8e659f54d05c77047282ed07c6aae3))
* Phase 0 - KV Data Migration (Task 16.1-16.4) ([#35](https://github.com/acartag7/cv-arnold-website/issues/35)) ([22fedad](https://github.com/acartag7/cv-arnold-website/commit/22fedadb4ff297e02037dc7b64692abdaa963d02))
* Phase 1 - Admin CMS Foundation (Task 16) ([#36](https://github.com/acartag7/cv-arnold-website/issues/36)) ([5a00968](https://github.com/acartag7/cv-arnold-website/commit/5a00968b8ee1d6775e2c5f38883ba886cbd343ff))
* React Context for CV data state management (Task 3.6) ([#22](https://github.com/acartag7/cv-arnold-website/issues/22)) ([38401d1](https://github.com/acartag7/cv-arnold-website/commit/38401d1ba7d91a57005066aee59107126036ada0))
* setup environment variables with TypeScript validation ([038bbb5](https://github.com/acartag7/cv-arnold-website/commit/038bbb577ae7449b245ec1ada8ee623fe338b981))
* **ssr:** Enable real-time CV updates via KV binding ([#44](https://github.com/acartag7/cv-arnold-website/issues/44)) ([7caaa22](https://github.com/acartag7/cv-arnold-website/commit/7caaa22f81ee44b544c7dd22b149011fe5d3f2d6))
* **ui:** Task 14 - Grid System Refactoring & Dashboard Design ([#33](https://github.com/acartag7/cv-arnold-website/issues/33)) ([dda45c7](https://github.com/acartag7/cv-arnold-website/commit/dda45c7c71cd440576c380c199cdc4f86d1a3164))


### 🐛 Bug Fixes

* address rate limiting review feedback ([#31](https://github.com/acartag7/cv-arnold-website/issues/31)) ([aca4e62](https://github.com/acartag7/cv-arnold-website/commit/aca4e6267ce5e5da8ec3e3fa70d8d0ced044a183))
* **ci:** Release Please validation and re-enable dev environment ([#47](https://github.com/acartag7/cv-arnold-website/issues/47)) ([fa78d06](https://github.com/acartag7/cv-arnold-website/commit/fa78d061a235b92d8ec47314cd86f8f290234c09))
* **ci:** use fromJSON to parse release-please pr output ([#48](https://github.com/acartag7/cv-arnold-website/issues/48)) ([0d92c55](https://github.com/acartag7/cv-arnold-website/commit/0d92c5512096a321b3b86d6fa1d4594bc4cb4aa4))
* **docs:** resolve markdown linting errors ([1767130](https://github.com/acartag7/cv-arnold-website/commit/1767130abb6a4f1a4c88910d85915ee11d3ae415))
* **infra:** separate API and frontend worker deployments ([#42](https://github.com/acartag7/cv-arnold-website/issues/42)) ([8bd8a13](https://github.com/acartag7/cv-arnold-website/commit/8bd8a13c52fbf8323897802bff82c19a4cbe8a9e))
* resolve markdown linting issues and improve CI enforcement ([dc0e0c1](https://github.com/acartag7/cv-arnold-website/commit/dc0e0c1dd45ede606d0c75a8b6293b595136350f))
* resolve PR critical issues - align design tokens with existing components ([cc5f5e6](https://github.com/acartag7/cv-arnold-website/commit/cc5f5e6af1d6fd8e6825edf80e2934761d60140a))
* **terraform:** disable dev environment by default ([#45](https://github.com/acartag7/cv-arnold-website/issues/45)) ([a6de2bc](https://github.com/acartag7/cv-arnold-website/commit/a6de2bc2a1760ce142065d94f5bb3b67a3207d47))
* UI improvements and Footer component ([#26](https://github.com/acartag7/cv-arnold-website/issues/26)) ([6d1a0bf](https://github.com/acartag7/cv-arnold-website/commit/6d1a0bf6a76d0d947d3a575c621a8d8b94860731))
* update CI pnpm version to 9 for lockfile compatibility ([d02a3be](https://github.com/acartag7/cv-arnold-website/commit/d02a3be302a0819d014a49346e74b303e929d5f0))


### 📚 Documentation

* add atomic commit workflow for TaskMaster integration ([09d1e59](https://github.com/acartag7/cv-arnold-website/commit/09d1e597467367b1d4dd87d16c0829aa7c6b1174))
* add comprehensive project pitch deck ([#19](https://github.com/acartag7/cv-arnold-website/issues/19)) ([29c900d](https://github.com/acartag7/cv-arnold-website/commit/29c900dd5db87b980129598e13bc0b21e19ec605))
* add pitch deck and update project context ([#20](https://github.com/acartag7/cv-arnold-website/issues/20)) ([dc72be5](https://github.com/acartag7/cv-arnold-website/commit/dc72be5df6a10cc1429676f758940a5fc7cd3524))
* add post-compaction verification to session start checklist ([#14](https://github.com/acartag7/cv-arnold-website/issues/14)) ([977a607](https://github.com/acartag7/cv-arnold-website/commit/977a607a6ac446620286610b87af3432e10abbde))
* fix markdown lint issues and add WCAG contrast requirements ([#34](https://github.com/acartag7/cv-arnold-website/issues/34)) ([e8fe188](https://github.com/acartag7/cv-arnold-website/commit/e8fe188f412e00f1e15d8606613b1f666b09386e))
* update CLAUDE.md with memory-first workflow and TaskMaster philosophy ([#12](https://github.com/acartag7/cv-arnold-website/issues/12)) ([c1b5b3c](https://github.com/acartag7/cv-arnold-website/commit/c1b5b3c0539de8f77499331700e86a70228b4f73))
* update project documentation and guides ([5b2b155](https://github.com/acartag7/cv-arnold-website/commit/5b2b155170c6bc96dba6b1e8c6268430764786e6))
