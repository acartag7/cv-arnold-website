---
description: Intelligent git commit workflow with atomic commit logic and Pull Request creation
allowed-tools: [Bash, Read, Grep, Glob]
---

# Save Changes

💾 **Smart git workflow with atomic commit analysis and Pull Request integration**

**Usage:**

- `/save` - Atomic commits only
- `/save "message"` - Custom commit message
- `/save --pr` - Commits + create Pull Request
- `/save "message" --pr` - Custom commit + PR
- `/save pr` - Quick PR creation

**Arguments:** $ARGUMENTS

## Intelligent Git Workflow

_Analyzing changes and creating atomic commits..._

## Process Overview

### 1. **Change Analysis**

Automatically analyzes git status and diffs to identify logical groupings:

- **New features/tools** → `feat:` commits
- **Documentation changes** → `docs:` commits
- **Configuration updates** → `chore:` commits
- **File cleanup/removal** → `cleanup:` commits
- **Bug fixes** → `fix:` commits
- **Refactoring** → `refactor:` commits

### 2. **Atomic Commit Strategy**

Creates separate commits for different types of changes:

- Groups related files together
- Maintains logical separation
- Uses conventional commit format
- Provides meaningful commit messages

### 3. **Commit Types and Patterns**

#### 🚀 **Feature Commits** (`feat:`)

- New functionality or tools
- New files that add capabilities
- Example: `feat: add user authentication system`

#### 📚 **Documentation Commits** (`docs:`)

- README updates
- Documentation additions/changes
- Comment improvements
- Example: `docs: update API documentation`

#### 🔧 **Configuration Commits** (`chore:`)

- Config file updates
- Build system changes
- Dependency updates
- Example: `chore: update project configuration`

#### 🧹 **Cleanup Commits** (`cleanup:`)

- File deletions
- Unused code removal
- Reorganization
- Example: `cleanup: remove obsolete documentation files`

#### 🐛 **Fix Commits** (`fix:`)

- Bug fixes
- Error corrections
- Issue resolutions
- Example: `fix: resolve authentication timeout issue`

#### 🔄 **Refactor Commits** (`refactor:`)

- Code restructuring
- Performance improvements
- Code quality improvements
- Example: `refactor: optimize database query performance`

## Workflow Steps

### 1. **Status Assessment**

```bash
git status --porcelain
git diff --name-only
git diff --cached --name-only
```

### 2. **Change Categorization**

- Analyze file types and modifications
- Group related changes together
- Determine appropriate commit types
- Plan commit sequence

### 3. **Staging and Committing**

- Stage files by logical groups
- Create descriptive commit messages
- Execute commits in logical order
- Validate each commit

### 4. **Validation**

- Ensure no files are left unstaged
- Verify commit messages follow conventional format
- Check that all changes are properly committed

## Commit Message Format

### Standard Format:

```
<type>: <description>

[optional body]
```

### Examples:

```bash
feat: add TaskMaster integration with slash commands
docs: update README with new installation steps
chore: update gitignore for TaskMaster files
cleanup: remove obsolete TODO and documentation files
fix: resolve MCP server startup issue
refactor: improve error handling in authentication
```

## Safety Features

### Pre-commit Validation:

- Checks for sensitive information in commits
- Validates conventional commit format
- Ensures meaningful commit messages
- Prevents empty or trivial commits

### File Analysis:

- Identifies configuration files
- Detects documentation changes
- Recognizes feature additions
- Spots cleanup opportunities

### Conflict Prevention:

- Checks for merge conflicts
- Validates repository state
- Ensures clean working directory

## Advanced Features

### Interactive Mode:

- Review changes before committing
- Modify commit messages if needed
- Skip or combine commits as appropriate
- Provide detailed commit descriptions

### Branch Integration:

- Works with feature branches
- Handles main branch commits
- Manages pull request preparation
- Supports various git workflows

### Customization:

- Adapts to project conventions
- Recognizes project-specific patterns
- Maintains consistency with existing commits
- Follows repository best practices

## Pull Request Integration

### When to Use PR Mode:

- **Team Collaboration**: Code review required before merge
- **Feature Completion**: Major milestone or feature ready
- **Quality Assurance**: Additional testing and validation needed
- **Documentation Review**: Changes need team approval
- **Following Team Workflow**: Project requires Pull Request process

### PR Creation Process:

1. **Parse Arguments**: Detect `--pr`, `pr` flags in command arguments
2. **Execute Commits**: Run normal atomic commit workflow first
3. **Branch Safety Check**: Ensure not committing directly to main branch
4. **Create Feature Branch**: Auto-create feature branch if on main
5. **Push Changes**: Push commits to remote repository
6. **Generate PR**: Create Pull Request with intelligent title and description
7. **Link Integration**: Connect to TaskMaster issues and project board if available

### PR Safety Features:

- **Branch Protection**: Prevents direct commits to main branch in PR mode
- **Remote Validation**: Ensures GitHub remote exists and is accessible
- **Authentication Check**: Verifies GitHub CLI (`gh`) is installed and authenticated
- **Commit Verification**: Only creates PR if all commits were successful
- **Conflict Detection**: Checks for merge conflicts before PR creation

### Intelligent PR Generation:

- **Smart Titles**: Generated from commit messages and change analysis
- **Detailed Descriptions**: Summarizes atomic commits with categories
- **Change Summary**: Lists files changed, features added, bugs fixed
- **Review Checklist**: Adds appropriate review criteria based on changes
- **TaskMaster Integration**: Links related tasks and project board items

## Usage Examples

### Basic Commit Workflow:

- `/save` - Automatically analyze and commit all changes
- `/save "custom message"` - Use custom message for single commit

### Pull Request Workflow:

- `/save --pr` - Commit changes and create Pull Request
- `/save "implement user authentication" --pr` - Custom commit message + PR
- `/save pr` - Quick PR creation after atomic commits
- `/save "fix navigation bug" --pr` - Bug fix with PR for review

### Advanced Scenarios:

- **Multiple unrelated changes** → Creates separate atomic commits, then PR if requested
- **Mixed feature and documentation** → Separates into feat: and docs: commits + PR
- **Configuration updates** → Groups into chore: commits + PR for team review
- **File cleanup** → Organizes into cleanup: commits + PR for approval

### PR Creation Examples:

#### Feature Development:

```bash
# Working on new feature
/save "feat: add baby feeding tracker with timer functionality" --pr
# → Creates atomic commits + PR titled "Add baby feeding tracker feature"
```

#### Bug Fixes:

```bash
# Fixed critical issue
/save "fix: resolve data sync issue in CloudKit integration" --pr
# → Creates commit + PR with bug fix details and testing checklist
```

#### Documentation Updates:

```bash
# Updated project docs
/save --pr
# → Analyzes doc changes, creates "docs:" commits + PR for team review
```

### Branch Workflow Integration:

- **On Feature Branch**: Creates PR to merge into main
- **On Main Branch**: Auto-creates feature branch, commits, then creates PR
- **Safety Check**: Prevents accidental direct commits to main in PR mode

## Implementation Logic

### Argument Parsing:

The command analyzes `$ARGUMENTS` to detect:

- **PR Flags**: `--pr`, `pr` (case-insensitive)
- **Custom Messages**: Any non-flag text becomes commit message
- **Combined Usage**: `"custom message" --pr` or `--pr "custom message"`

### Execution Flow:

1. **Parse Arguments**: Extract PR flags and custom commit messages
2. **Safety Checks**: Verify git status, branch state, GitHub CLI availability
3. **Atomic Commits**: Execute intelligent commit analysis and creation
4. **Branch Management**: Create feature branch if needed for PR mode
5. **Push & PR**: Push commits and create Pull Request if requested
6. **Integration**: Link to TaskMaster issues and project board
7. **Success Report**: Provide commit SHAs, PR URL, and next steps

### Error Handling:

- **Git Conflicts**: Detect and report merge conflicts
- **Authentication**: Verify GitHub CLI authentication
- **Branch Protection**: Prevent direct main branch commits in PR mode
- **Network Issues**: Handle remote repository connection problems
- **Partial Success**: Report successful commits even if PR creation fails

---

**Ready to intelligently save your changes with atomic commits and Pull Request integration!**

_Use `/save` for quick commits or `/save --pr` for team collaboration workflow._
