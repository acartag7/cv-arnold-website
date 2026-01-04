# CV Arnold Website - Claude Code Context

## 🎯 TESTING REQUIREMENTS

**CRITICAL: All PRs must include tests with ≥80% coverage**

### Testing Infrastructure

- **Framework:** Vitest 3.2.4 with V8 coverage
- **Commands:**
  - `pnpm test` - Run all tests
  - `pnpm test:watch` - Watch mode
  - `pnpm test:coverage` - Run with coverage report
  - `pnpm test:ui` - Visual test UI
- **Coverage Thresholds:** 80% for lines, functions, branches, statements
- **CI Enforcement:** Tests run automatically on PRs, merge blocked if failing

### Test File Organization

```
src/
├── schemas/__tests__/
│   └── cv.schema.test.ts          # Zod schema validation tests
├── services/__tests__/
│   └── CVDataService.test.ts      # Service layer tests
├── services/storage/__tests__/
│   └── JSONFileAdapter.test.ts    # Storage adapter tests
└── lib/__tests__/
    ├── errors.test.ts             # Custom error classes
    ├── logger.test.ts             # Logger utility
    └── retry.test.ts              # Retry mechanism
```

### Testing Patterns

**1. Schema Tests (Zod)**

- Test valid data acceptance
- Test invalid data rejection with specific error messages
- Test edge cases (boundary values, date ranges, transformations)
- Test custom validators (URL protocols, email format, codes)

**2. Service Tests**

- Mock dependencies (repositories, file system)
- Test success paths
- Test error handling and error wrapping
- Test validation before operations
- Use `vi.mock()` for external dependencies

**3. Utility Tests**

- Test core functionality
- Test edge cases and boundary conditions
- Test error scenarios
- For retry: use `vi.useFakeTimers()` to control time

**4. Test Structure**

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup mocks and test data
  })

  describe('methodName', () => {
    it('should handle success case', () => {
      // Arrange, Act, Assert
    })

    it('should handle error case', () => {
      // Test error paths
    })
  })
})
```

### Coverage Targets

- `src/schemas/`: >90% (comprehensive validation tests)
- `src/services/`: >80% (core business logic)
- `src/lib/`: >80% (utility functions)

### Before Merging Checklist

- ✅ All tests passing (`pnpm test`)
- ✅ Coverage meets 80% threshold (`pnpm test:coverage`)
- ✅ No skipped/commented tests without justification
- ✅ CI pipeline green (tests + build)

## 🔴 CRITICAL: CMS Fields MUST Have Zod Schemas

**PRODUCTION INCIDENT (2026-01-04):** CMS config fields (themeConfig, sectionTitles, siteConfig) were being silently stripped because Zod's `.strict()` mode rejects unknown fields.

### The Rule

**Every field stored in KV via CMS MUST have a corresponding Zod schema in `src/schemas/cv.schema.ts`.**

If you add a new field to:

- Admin CMS UI
- TypeScript types (`src/types/cv.ts`)
- KV storage

You MUST also add it to:

- Zod schema (`src/schemas/cv.schema.ts`)

### Why This Matters

```typescript
// Zod by default STRIPS unknown fields during validation!
const data = CVDataSchema.parse(kvData)
// If kvData.themeConfig exists but ThemeConfigSchema doesn't,
// data.themeConfig will be UNDEFINED - silently lost!
```

### Schema Mapping

| CMS Section         | TypeScript Type       | Zod Schema                |
| ------------------- | --------------------- | ------------------------- |
| Theme               | `ThemeConfig`         | `ThemeConfigSchema`       |
| Site Config         | `SiteConfig`          | `SiteConfigSchema`        |
| Section Titles      | `SectionTitles`       | `SectionTitlesSchema`     |
| Hero Stats          | `HeroStat[]`          | `HeroStatSchema`          |
| Featured Highlights | `FeaturedHighlight[]` | `FeaturedHighlightSchema` |

### Checklist When Adding CMS Fields

1. ✅ Add TypeScript interface to `src/types/cv.ts`
2. ✅ Add Zod schema to `src/schemas/cv.schema.ts`
3. ✅ Add field to `CVDataSchema` (as optional: `.optional()`)
4. ✅ Add tests for the new schema
5. ✅ Test round-trip: CMS save → KV → public site displays correctly

## 🚨 MANDATORY SESSION START CHECKLIST

**⚠️ DO THIS FIRST - Before responding to ANY user request:**

### For New Sessions

```javascript
// 1. Testing procedures (REQUIRED - Contains standard verification steps)
mcp__memory__recall_memory({
  tags: ['cv-arnold-website', 'testing-procedure'],
  limit: 5,
})

// 2. Workflow & TaskMaster philosophy (REQUIRED - How to document and track work)
mcp__memory__recall_memory({
  tags: ['cv-arnold-website', 'workflow'],
  limit: 5,
})

// 3. Current project state (RECOMMENDED - Recent completions and context)
mcp__memory__recall_memory({
  tags: ['cv-arnold-website', 'current-state'],
  limit: 3,
})
```

### For Continued Sessions (After Compaction)

**🔍 CRITICAL: Carefully read and verify the compaction summary!**

Compaction can lose context or introduce misunderstandings. Before continuing:

1. **Read the entire summary carefully** - Don't skip or skim
2. **Verify key details**:
   - Task IDs and status (what's done vs in-progress)
   - File paths and code changes
   - Decisions made and their rationale
   - Any errors encountered and how they were fixed
3. **Check for red flags**:
   - Missing context about WHY decisions were made
   - Unclear state of PRs or branches
   - Incomplete error resolution
4. **Recall relevant memories** to fill gaps:
   ```javascript
   // If summary mentions Task X, recall that task's context
   mcp__memory__recall_memory({ tags: ['task-X.Y'], limit: 3 })
   ```
5. **Ask user for clarification** if summary is ambiguous

**✅ Checklist Complete?** Now proceed with your work.

**Why this matters:**

- 🎯 Ensures consistency across all sessions
- 📋 Prevents skipping critical testing steps
- 🧠 Loads lessons learned from previous tasks
- ⚡ Faster decisions with established patterns

---

## 📚 MEMORY TAG REGISTRY

**Quick tag reference for finding the right context:**

### Core Tags (Use These Regularly)

| Tag                 | Content                                            | When to Use                                       |
| ------------------- | -------------------------------------------------- | ------------------------------------------------- |
| `testing-procedure` | Standard testing & verification steps              | Every task completion, before PR, troubleshooting |
| `workflow`          | TaskMaster philosophy, git workflow, PR process    | Session start, documentation decisions            |
| `architecture`      | Design patterns, code organization, service layers | Implementing features, refactoring                |
| `current-state`     | Recent completions, project status, blockers       | Session start, understanding context              |

### Task-Specific Tags

| Tag            | Content                                             | When to Use                              |
| -------------- | --------------------------------------------------- | ---------------------------------------- |
| `task-3.1`     | TypeScript data layer completion, migration notes   | Reference for type system work           |
| `task-3.2`     | Zod schemas implementation, validation patterns     | Runtime validation, schema work          |
| `task-3.5`     | KV storage adapter, compression, security decisions | KV implementation, Cloudflare deployment |
| `oss-platform` | Open source vision, admin portal, setup wizard      | Understanding project scope              |
| `admin-portal` | Tasks 16-24 (CMS, wizard, docs, themes, AI)         | Admin features, OSS capabilities         |
| `vision`       | Project goals, stakeholder communication            | Strategic decisions, pitch deck          |
| `meta`         | Memory-first workflow instructions                  | Understanding how to use memory system   |

### Scenario-Based Search Guide

**Starting a new session?**

```javascript
mcp__memory__recall_memory({ tags: ['testing-procedure'], limit: 5 })
mcp__memory__recall_memory({ tags: ['workflow'], limit: 5 })
```

**Starting a new task?**

```javascript
mcp__memory__recall_memory({
  tags: ['testing-procedure', 'workflow'],
  limit: 5,
})
mcp__memory__recall_memory({ tags: ['architecture'], limit: 3 })
```

**Hit an error or need patterns?**

```javascript
mcp__memory__recall_memory({ tags: ['architecture', 'task-3.1'], limit: 3 })
```

**Creating a PR?**

```javascript
mcp__memory__recall_memory({
  tags: ['testing-procedure', 'workflow'],
  limit: 5,
})
```

**Need project status?**

```javascript
mcp__memory__recall_memory({ tags: ['current-state'], limit: 3 })
```

---

## PROJECT PHILOSOPHY: Open Source CV Platform

**CRITICAL: This is NOT just a personal CV - it's an open-source platform!**

This project serves **three interconnected purposes:**

1. **Personal Brand Platform** - Showcase Arnold's experience and skills
2. **Technical Expertise Demonstration** - Exemplify enterprise-grade development practices
3. **🌍 Open Source Platform** - **Enable ANYONE to deploy their own CV for free**

### The Open Source Vision

**Goal:** Anyone can fork, configure, and deploy their professional CV in 5 minutes.

**Key Features for OSS:**

- **Admin CMS Portal** (Task 16) - No coding required to manage content
- **Setup Wizard** (Task 17) - First-run configuration with example data
- **Triple Authentication** - Magic link (easiest), Google OAuth, admin password
- **Theme Framework** (Task 20) - Easy customization without design skills
- **AI Enhancement** (Task 23) - OpenRouter free models for content improvement
- **Image Management** (Task 22) - Cloudflare R2 for photos/logos
- **Free Forever** - Cloudflare free tier ($0/month)

**Two-Repository Strategy:**

- `cv-arnold-website` (private) - Arnold's personal CV with real data
- `cv-platform-template` (public) - Clean OSS template with example data (Task 24)

**This context affects ALL architectural decisions** - we're building a reusable platform, not a one-off website.

### Technical Excellence Standards

- **Infrastructure as Code**: OpenTofu/Terraform with enterprise patterns, proper secrets management
- **Development**: TypeScript strict mode, comprehensive testing, security-first approach, WCAG AA compliance
- **DevOps**: Advanced CI/CD pipelines, infrastructure testing, monitoring/alerting
- **Architecture**: Clean patterns, SOLID principles, scalable design systems

## TaskMaster Philosophy

**CRITICAL: TaskMaster is for TRACKING, not for detailed documentation!**

### What Goes in TaskMaster ✅

- Task titles and descriptions (high-level)
- Status updates (pending → in-progress → done)
- Dependencies and complexity scores
- Brief progress timestamps

### What Goes in Markdown Files ✅

- Detailed implementation notes → `.taskmaster/docs/task-X-implementation.md`
- **Architecture decisions with rationale** → Document WHY and WHY NOT for every choice
- Code examples and migration patterns
- Troubleshooting notes and lessons learned

**CRITICAL: Architecture Decisions**

Every significant technical decision must include:

- ✅ **What** was chosen (library, pattern, approach)
- ✅ **Why** it was chosen (benefits, requirements it meets)
- ✅ **Why NOT** alternatives (what was considered and rejected)
- ✅ **Trade-offs** (what we gain vs what we lose)

Example:

```markdown
## Key Decisions

1. **Zod for runtime validation**
   - Why: Type-safe schemas, excellent TypeScript integration, small bundle size
   - Why NOT Yup: Less TypeScript support, larger bundle
   - Why NOT io-ts: Steeper learning curve, more verbose
   - Trade-offs: Runtime overhead acceptable for data integrity guarantee
```

### Essential Commands

```bash
# Core workflow
task-master next                    # Get next available task
task-master show <id>              # View task details
task-master set-status --id=<id> --status=done  # Mark complete
task-master expand --id=<id> --research         # Break into subtasks
task-master update-subtask --id=<id> --prompt="brief milestone note"  # Log progress

# Analysis
task-master analyze-complexity --research
task-master expand --all --research
```

### MCP Tools Available

```javascript
// Daily workflow
;(get_tasks, next_task, get_task, set_task_status)
// Management
;(add_task, expand_task, update_task, update_subtask)
// Analysis
;(analyze_project_complexity, complexity_report)
```

## Git Workflow - Atomic Commits by TaskMaster Tasks

**CRITICAL: Always align commits with TaskMaster tasks**

### Commit Message Format

```
<type>: <description>

- Implementation details
- Key technical decisions

TaskMaster: ✅ Task X.Y - <Task Title>
```

### Workflow

1. Map changes to specific TaskMaster tasks/subtasks
2. Create separate commits per completed task
3. Use TaskMaster task IDs in commit messages
4. Commit in dependency order

## Development Workflow

### 1. Session Start

```bash
# FIRST: Check MCP Memory (see top of file)
task-master next           # Find next task
task-master show <id>     # Review details
```

Create implementation doc:

```bash
touch .taskmaster/docs/task-X-implementation.md
```

### 2. During Implementation

```bash
# Update TaskMaster status
task-master set-status --id=<id> --status=in-progress

# Log brief milestones in TaskMaster
task-master update-subtask --id=<id> --prompt="Completed API integration"

# Document details in markdown (NOT TaskMaster!)
# Edit: .taskmaster/docs/task-X-implementation.md
```

### 3. Testing & Verification

**CRITICAL: Always follow standard testing procedure from MCP Memory**

Quick reference:

```bash
# 1. TypeScript check
pnpm exec tsc --noEmit

# 2. Build check
pnpm build

# 3. Visual test (after merge)
pnpm dev  # Note the port (3000 or 3001)
# Use Playwright to navigate and screenshot
```

Full procedure: Search MCP Memory for `testing-procedure`

### 4. PR Review Process

**CRITICAL: Always read and act on Claude Code Review feedback**

After pushing and creating a PR:

```bash
# 1. Wait for CI checks to complete
gh pr view <number> --json statusCheckRollup

# 2. Once checks complete, read ALL comments (especially from Claude review)
gh pr view <number> --comments

# 3. Look for automated review feedback
# Claude Code Review posts detailed feedback as PR comments
```

**Review feedback categories:**

- 🚨 **CRITICAL/MUST FIX** - Address immediately before merging
- ⚠️ **SHOULD FIX** - Strong recommendations (document if skipping)
- 💡 **SUGGESTIONS** - **Actively consider for THIS PR** (don't auto-defer!)
- 📝 **FUTURE** - Only after careful evaluation

**CRITICAL: For every suggestion, ask yourself:**

1. **Can I implement this now?** (effort vs value)
2. **Will it be harder to add later?** (architectural dependencies)
3. **Does it improve code quality significantly?** (maintainability, security, performance)
4. **Is "future" just procrastination?** (be honest!)

**Decision framework:**

- ✅ **Implement now** if: Low effort, high value, or foundational
- 📝 **Defer to future** if: Needs research, unclear requirements, or genuinely separate concern
- ❌ **Skip with rationale** if: Not applicable or actively harmful

**Do NOT merge until:**

- ✅ All CI checks GREEN
- ✅ Claude review feedback READ and understood
- ✅ Critical items ADDRESSED
- ✅ **Every suggestion actively considered** (not auto-deferred!)
- ✅ Decision documented with WHY/WHY NOT for skipped items

### 5. Task Completion

```bash
# Mark done in TaskMaster
task-master set-status --id=<id> --status=done

# Finalize implementation notes in markdown
# .taskmaster/docs/task-X-implementation.md
```

**CRITICAL: Update MCP Memory after completing tasks!**

After completing a task or major milestone:

```javascript
// Store a memory with lessons learned
mcp__memory__store_memory({
  content: `TASK X.Y COMPLETED: [Brief Summary]

  ## What Was Accomplished
  - [Key deliverables]
  - [Files created/modified]
  - [Tests added with coverage]

  ## Key Decisions & Rationale
  - [Technical decisions made]
  - [Why chosen vs alternatives]
  - [Trade-offs accepted]

  ## Lessons Learned
  - [What worked well]
  - [What didn't work]
  - [Patterns to follow/avoid]

  ## Production Impact
  - [Performance implications]
  - [Breaking changes]
  - [Migration notes]

  ## Next Steps
  - [Follow-up tasks]
  - [Technical debt created]
  - [Future improvements]`,
  tags: ['cv-arnold-website', 'task-X.Y', 'completed', 'lessons-learned'],
  importance: 0.9,
})

// Update current-state memory
mcp__memory__store_memory({
  content: `PROJECT STATE UPDATE: [Date]

  ## Recently Completed
  - ✅ Task X.Y: [Title] (PR #N merged)
  - ✅ Task A.B: [Title] (PR #M merged)

  ## Currently Available
  - Task N: [Title] (dependencies met)
  - Task M: [Title] (ready to start)

  ## Recent PRs
  - PR #N: [Description] (merged)
  - PR #M: [Description] (pending review)

  ## Key Metrics
  - X of Y tasks completed (Z%)
  - A of B subtasks completed (C%)
  - Test coverage: D%

  ## Blockers / Notes
  - [Any current issues]
  - [Important context]`,
  tags: ['cv-arnold-website', 'current-state', 'progress'],
  importance: 0.95,
})
```

**Why this matters:**

- 📊 Maintains accurate project state across sessions
- 🧠 Preserves lessons learned for future tasks
- 🔄 Prevents repetition of mistakes
- ⚡ Faster onboarding after compaction/breaks
- 📈 Tracks progress and decision evolution

**When to update:**

- ✅ After completing any task/subtask
- ✅ After merging PRs
- ✅ After discovering important lessons
- ✅ When project state changes significantly
- ✅ Before ending long sessions

### 6. Complex Workflows

For large changes:

1. Create PRD file: `touch .taskmaster/docs/feature-X-prd.md`
2. Parse with: `task-master parse-prd --append .taskmaster/docs/feature-X-prd.md`
3. Expand: `task-master expand --all --research`
4. Work systematically through generated tasks

## Key Configuration Files

- `.taskmaster/tasks/tasks.json` - Main task database (auto-managed)
- `.taskmaster/config.json` - AI model config (use `task-master models`)
- `CLAUDE.md` - This context file (auto-loaded)
- `.mcp.json` - MCP server configuration

## Task Management

### Task ID Format

- Main: `1`, `2`, `3`
- Subtasks: `1.1`, `1.2`, `2.1`
- Sub-subtasks: `1.1.1`, `1.1.2`

### Status Values

- `pending` - Ready to work
- `in-progress` - Currently working
- `done` - Completed and verified
- `blocked` - Waiting on dependencies

## Testing & Quality Standards

**Standard procedures are stored in MCP Memory - always recall them!**

### Pre-Commit Checks (Automatic)

- ESLint, Prettier, Markdown linting
- TypeScript type checking
- All must pass before commit accepted

### Pre-Merge Checks (Manual)

1. TypeScript compilation: `pnpm exec tsc --noEmit`
2. Production build: `pnpm build`
3. Visual testing with Playwright

### Post-Merge Verification

1. Pull main, run build
2. Start dev server
3. Navigate with Playwright
4. Screenshot verification
5. Manual checklist (Hero, Experience, Skills, etc.)

**Full procedure:** Search MCP Memory with tag `testing-procedure`

---

## Best Practices

### Context Management

- **START EVERY SESSION:** Recall MCP Memory (see top of file)
- Use `/clear` between different tasks
- Use `task-master show <id>` for specific context
- This CLAUDE.md file provides persistent context

### Documentation Strategy

**TaskMaster:** High-level tracking only
**Markdown Files:** Detailed implementation notes

```
.taskmaster/
├── tasks/tasks.json          # Auto-managed, don't bloat
├── docs/
│   ├── task-X-implementation.md    # YOUR detailed notes
│   └── architecture-notes.md       # Cross-cutting concerns
└── reports/
    └── task-complexity-report.json
```

### Research Mode

- Add `--research` flag for AI enhancement
- Requires Perplexity API key for research-backed operations
- Recommended for complex technical tasks

### Multi-Task Updates

- `update --from=<id>` - Update multiple future tasks
- `update-task --id=<id>` - Single task updates
- `update-subtask --id=<id>` - Brief milestone logging (details go in markdown!)

## API Keys Required

At least one required:

- `ANTHROPIC_API_KEY` (Claude) - **Recommended**
- `PERPLEXITY_API_KEY` (Research) - **Highly recommended**
- `OPENAI_API_KEY`, `GOOGLE_API_KEY`, etc.

Configure with: `task-master models --setup`

---

_This guide provides essential TaskMaster functionality for enterprise-grade development workflows._
