# Workflow Guide - How to Trigger Parallel Development

## 🎯 Overview
This guide explains how to set up and manage the 8-agent parallel development workflow for the CV website project.

---

## Step 1: Create GitHub Repository

### 1.1 Create Repository on GitHub
```bash
# On GitHub.com:
# 1. Go to https://github.com/new
# 2. Repository name: cv-arnold-website
# 3. Description: "Modern CV website deployed on Cloudflare with dynamic data management"
# 4. Set to Public (for open source Phase 2)
# 5. DO NOT initialize with README (we have one)
# 6. Click "Create repository"
```

### 1.2 Push Existing Code
```bash
# Initialize git (if not already done)
git init

# Add remote origin
git remote add origin https://github.com/yourusername/cv-arnold-website.git

# Add all files
git add .

# Initial commit
git commit -m "feat: initial project setup with comprehensive documentation

- Add PRD with project requirements and success criteria
- Add WORKSTREAMS for 8 parallel development streams
- Add TECHNICAL_GUIDELINES for code consistency
- Add ARCHITECTURE with Cloudflare deployment design
- Add DESIGN_SYSTEM with UI/UX specifications
- Add DEPLOYMENT_GUIDE for Cloudflare setup
- Add comprehensive README with workflow instructions

🤖 Generated with Claude Code (claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to main branch
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up Multiple Claude Code Instances

### 2.1 Workstream Assignment Strategy

You'll need to start **8 separate Claude Code sessions**, each with a specific agent and workstream:

#### **Session 1: Infrastructure (deployment-engineer)**
```bash
# Start Claude Code in project directory
cd /path/to/cv-arnold-website

# Assign this session to Workstream A
# Agent should read: WORKSTREAMS.md → Workstream A section
# Key files: DEPLOYMENT_GUIDE.md, ARCHITECTURE.md
```

#### **Session 2: Design System (ui-ux-designer)**
```bash
# Start new Claude Code session
cd /path/to/cv-arnold-website

# Assign to Workstream B
# Agent should read: DESIGN_SYSTEM.md, WORKSTREAMS.md → Workstream B
```

#### **Session 3: Base Components (frontend-developer)**
```bash
# Start new Claude Code session
cd /path/to/cv-arnold-website

# Assign to Workstream C
# Dependencies: Must wait for Workstream B to complete design tokens
```

#### **Session 4: Header Fix (frontend-developer)**
```bash
# Start new Claude Code session
cd /path/to/cv-arnold-website

# Assign to Workstream D - CRITICAL PATH
# This addresses the reported header issues
```

#### **Session 5: Content Sections (frontend-developer)**
```bash
# Start new Claude Code session
cd /path/to/cv-arnold-website

# Assign to Workstream E
# Dependencies: Workstreams B and C
```

#### **Session 6: Data Layer (golang-pro or python-pro)**
```bash
# Start new Claude Code session
cd /path/to/cv-arnold-website

# Assign to Workstream F
# Dependencies: Workstream A (infrastructure)
```

#### **Session 7: Advanced Features (ai-engineer)**
```bash
# Start new Claude Code session
cd /path/to/cv-arnold-website

# Assign to Workstream G
# Dependencies: Workstreams A and F
```

#### **Session 8: Quality Review (code-reviewer)**
```bash
# Start new Claude Code session
cd /path/to/cv-arnold-website

# Assign to Workstream H - Ongoing
# Reviews all PRs from other workstreams
```

### 2.2 Agent Instructions Template

For each Claude Code session, start with:

```
Hi! I'm working on the CV website project. Please read the following files to understand the project:

1. First, read CLAUDE.md for project context
2. Read WORKSTREAMS.md and focus on Workstream [X] (your assigned workstream)
3. Read TECHNICAL_GUIDELINES.md for coding standards
4. Read the specific documentation for your workstream

I am the [agent-type] assigned to Workstream [X]: [workstream-name]

My specific deliverables are:
- [list from WORKSTREAMS.md]

Please confirm you understand your role and are ready to start.
```

---

## Step 3: Coordination Strategy

### 3.1 Branch Strategy
```bash
# Each workstream creates its own branch
git checkout -b feature/workstream-a-infrastructure    # Workstream A
git checkout -b feature/workstream-b-design-system     # Workstream B
git checkout -b feature/workstream-c-base-components   # Workstream C
git checkout -b feature/workstream-d-header-fix        # Workstream D
git checkout -b feature/workstream-e-content-sections  # Workstream E
git checkout -b feature/workstream-f-data-layer        # Workstream F
git checkout -b feature/workstream-g-advanced-features # Workstream G
# Workstream H reviews all branches
```

### 3.2 Communication Protocol

#### **PR-Based Communication**
- Each workstream creates PRs for their features
- Use PR descriptions to communicate with other workstreams
- Tag relevant workstreams in PR comments
- Example: `@workstream-c This affects your Button component`

#### **Integration Points**
- **Design Tokens** (B→C,D,E): Workstream B publishes tokens, others consume
- **Base Components** (C→D,E): Components available for header and sections
- **API Contracts** (F→E,G): Data layer provides types and endpoints
- **Infrastructure** (A→F,G): Provides deployment and KV setup

### 3.3 Daily Sync
Each workstream should:
1. **Morning**: Check for new PRs affecting their work
2. **Midday**: Update progress in PR comments
3. **Evening**: Push daily progress, create draft PRs early

---

## Step 4: Execution Timeline

### Week 1: Foundation
**Day 1-2:**
- Start Workstreams A (Infrastructure) and B (Design System)
- These have no dependencies and can start immediately

**Day 3-4:**
- Start Workstream C (Base Components) after B completes tokens
- Start Workstream F (Data Layer) after A sets up infrastructure

**Day 5-7:**
- Start Workstreams D (Header Fix) and E (Content Sections)
- Begin integration testing

### Week 2: Core Development
- All workstreams active
- Focus on integration between components
- Workstream H actively reviewing all code

### Week 3: Advanced Features
- Start Workstream G (Advanced Features)
- Performance optimization
- Bug fixes and polish

### Week 4: Integration & Launch
- Final integration testing
- Deployment to production
- Documentation updates

---

## Step 5: Quality Gates

### Before Starting Any Workstream:
- [ ] Repository created and pushed to GitHub
- [ ] All documentation read and understood
- [ ] Dependencies identified and tracked
- [ ] Communication channels established

### Before Merging Any PR:
- [ ] Code review by Workstream H (code-reviewer)
- [ ] All tests passing (when implemented)
- [ ] Performance budgets met
- [ ] Documentation updated
- [ ] Integration points tested

### Before Launch:
- [ ] All workstreams complete
- [ ] Full integration testing
- [ ] Performance targets achieved
- [ ] Cloudflare deployment working
- [ ] Custom domain configured

---

## Step 6: Monitoring Progress

### GitHub Project Board (Recommended)
Create a GitHub Project with columns:
- **Ready**: Tasks ready to start
- **In Progress**: Currently being worked on
- **Review**: Waiting for code review
- **Testing**: Integration testing
- **Done**: Completed tasks

### Status Updates
Each workstream should update status daily in:
- PR descriptions
- GitHub Project board
- README.md workstream table

---

## Step 7: Troubleshooting

### Common Issues:

#### **Merge Conflicts**
```bash
# Stay up to date with main
git checkout main
git pull origin main
git checkout feature/workstream-x-name
git merge main
# Resolve conflicts and commit
```

#### **Dependency Blocking**
- Check WORKSTREAMS.md for dependency matrix
- Communicate with blocking workstream via PR comments
- Consider temporary mocks for unblocked development

#### **Integration Issues**
- Use Workstream H (code-reviewer) for mediation
- Create integration tests to catch issues early
- Document all API contracts clearly

---

## Step 8: Success Metrics

Track these throughout development:

### Technical Metrics:
- [ ] All 8 workstreams complete
- [ ] Zero critical bugs
- [ ] Performance targets met
- [ ] All documentation updated

### Process Metrics:
- [ ] PRs reviewed within 24 hours
- [ ] Integration issues resolved quickly
- [ ] Communication effective between teams
- [ ] Timeline adherence

---

## Quick Start Checklist

Ready to start? Follow this checklist:

1. **Repository Setup**
   - [ ] Create GitHub repository
   - [ ] Push existing code
   - [ ] Set up branch protection rules

2. **Claude Code Sessions**
   - [ ] Start 8 Claude Code sessions
   - [ ] Assign each to specific workstream
   - [ ] Verify each agent understands their role

3. **Coordination**
   - [ ] Create GitHub Project board
   - [ ] Set up PR templates
   - [ ] Define communication protocols

4. **Begin Development**
   - [ ] Start Workstreams A and B immediately
   - [ ] Track dependencies
   - [ ] Monitor progress daily

---

This workflow enables true parallel development while maintaining project cohesion. Each workstream operates independently but integrates seamlessly through well-defined interfaces and communication protocols.