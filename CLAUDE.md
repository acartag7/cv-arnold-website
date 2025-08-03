# CV Arnold Website - Claude Code Context

## PROJECT PHILOSOPHY: Technical Excellence Showcase

**IMPORTANT: This CV website serves dual purposes:**

1. **Personal Brand Platform** - Showcase Arnold's experience and skills
2. **Technical Expertise Demonstration** - Exemplify enterprise-grade development practices

### Technical Excellence Standards

- **Infrastructure as Code**: OpenTofu/Terraform with enterprise patterns, proper secrets management
- **Development**: TypeScript strict mode, comprehensive testing, security-first approach, WCAG AA compliance
- **DevOps**: Advanced CI/CD pipelines, infrastructure testing, monitoring/alerting
- **Architecture**: Clean patterns, SOLID principles, scalable design systems

## TaskMaster Integration

### Essential Commands

```bash
# Core workflow
task-master next                    # Get next available task
task-master show <id>              # View task details
task-master set-status --id=<id> --status=done  # Mark complete
task-master expand --id=<id> --research         # Break into subtasks
task-master update-subtask --id=<id> --prompt="notes"  # Log progress

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
task-master next           # Find next task
task-master show <id>     # Review details
```

### 2. During Implementation

```bash
task-master update-subtask --id=<id> --prompt="implementation notes"
task-master set-status --id=<id> --status=in-progress
```

### 3. Task Completion

```bash
task-master set-status --id=<id> --status=done
```

### 4. Complex Workflows

For large changes:

1. Create PRD file: `touch new-feature.md`
2. Parse with: `task-master parse-prd --append new-feature.md`
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

## Best Practices

### Context Management

- Use `/clear` between different tasks
- Use `task-master show <id>` for specific context
- This CLAUDE.md file provides persistent context

### Research Mode

- Add `--research` flag for AI enhancement
- Requires Perplexity API key for research-backed operations
- Recommended for complex technical tasks

### Multi-Task Updates

- `update --from=<id>` - Update multiple future tasks
- `update-task --id=<id>` - Single task updates
- `update-subtask --id=<id>` - Implementation logging

## API Keys Required

At least one required:

- `ANTHROPIC_API_KEY` (Claude) - **Recommended**
- `PERPLEXITY_API_KEY` (Research) - **Highly recommended**
- `OPENAI_API_KEY`, `GOOGLE_API_KEY`, etc.

Configure with: `task-master models --setup`

---

_This guide provides essential TaskMaster functionality for enterprise-grade development workflows._
