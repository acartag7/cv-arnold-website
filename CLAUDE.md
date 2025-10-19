# CV Arnold Website - Claude Code Context

## 🧠 MEMORY-FIRST WORKFLOW (NEW!)

**CRITICAL: Always check MCP Memory before starting any task!**

```javascript
// Start EVERY session by recalling relevant memories
mcp__memory__recall_memory({
  tags: ['cv-arnold-website', 'testing-procedure'],
  limit: 5,
})

mcp__memory__recall_memory({
  tags: ['cv-arnold-website', 'workflow'],
  limit: 5,
})
```

**Why:** MCP Memory contains:

- ✅ Standard testing & verification procedures
- ✅ TaskMaster philosophy and best practices
- ✅ Architecture patterns and migration guides
- ✅ Project status and recent completions

**Search tags:** `testing-procedure`, `workflow`, `architecture`, `patterns`, `current-state`

---

## PROJECT PHILOSOPHY: Technical Excellence Showcase

**IMPORTANT: This CV website serves dual purposes:**

1. **Personal Brand Platform** - Showcase Arnold's experience and skills
2. **Technical Expertise Demonstration** - Exemplify enterprise-grade development practices

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
- Architecture decisions and rationale
- Code examples and migration patterns
- Troubleshooting notes and lessons learned

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

### 4. Task Completion

```bash
# Mark done in TaskMaster
task-master set-status --id=<id> --status=done

# Finalize implementation notes in markdown
# .taskmaster/docs/task-X-implementation.md
```

### 5. Complex Workflows

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
