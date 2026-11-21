---
name: git-commit
description: Safe Git commit protocol enforcing explicit user requests, strict pre-commit diff review, and no automatic pushing.
when_to_use: "When the user explicitly asks to commit changes or craft a commit. NOT for unsolicited commits, and NEVER for automatic pushing without explicit user instruction."
allowed-tools: run_command, read_file
effort: low
version: 1.0.0
---

# git-commit — Safe Git Commit Protocol

> Commit with intention and explicit user approval; never push without a direct command.

## Overview

This skill establishes a safe, disciplined workflow for preparing and executing Git commits. It guarantees that commits are only created upon explicit user request, ensures changes are reviewed for secrets and unintended edits, adheres to Conventional Commits standards, and strictly prohibits pushing to remote repositories without separate, explicit user authorization.

## When to Use

✅ **Good for:**
- The user explicitly instructs to commit changes (e.g., "commit code", "tạo commit", "commit these fixes").
- Reviewing git diffs and staging only clean, verified files.
- Formatting structured Conventional Commit messages matching project conventions.

❌ **Not for:**
- Unsolicited commits without prior user permission (AGENTS.md strictly forbids committing without permission).
- Pushing to remote repositories (`git push`) unless the user explicitly commands it in their prompt.
- Destructive operations (`git reset --hard`, `git push --force`, deleting branches/stashes) without explicit approval.

---

## Protocol

### Step 1: Verify Permission & Inspect Status

1. **Verify user intent**: Ensure the user has explicitly requested a commit. If not requested, do **not** initiate a commit.
2. **Inspect repository status**:
   ```bash
   git status
   ```
3. **Review changes**:
   ```bash
   git diff
   ```
   Verify that:
   - No accidental modifications occurred outside the assigned task scope.
   - No sensitive information (passwords, tokens, API keys, `.env` files) is present.
   - No generated/cache/local files are included (`.codegraph/`, `.impeccable/config.local.json`, build outputs `dist/`/`bin/`/`obj/`, temporary test logs).

### Step 2: Stage Relevant Files Accurately

1. Stage specific files or paths intentionally:
   ```bash
   git add <path/to/file1> <path/to/file2>
   ```
2. **Avoid blind staging** (`git add .` or `git add -A`) when untracked secret files, temporary logs, or scratch files exist in the repository.
3. Verify staged files:
   ```bash
   git status
   ```

### Step 3: Craft Conventional Commit Message

Follow the project's commit message format:
- Structure: `<type>(<scope>): <short description>` or `<type>: <short description>`
- Common types:
  - `feat`: A new user-facing feature or enhancement
  - `fix`: A bug fix
  - `refactor`: Code change that neither fixes a bug nor adds a feature
  - `style`: Changes that do not affect the meaning of code (formatting, missing semicolons, etc.)
  - `chore`: Build tasks, auxiliary tools, configuration, or dependency updates
  - `docs`: Documentation changes only
- Keep the message clear, concise, and written in the imperative mood (or Vietnamese as defined in project rules, e.g., `feat: thêm trang danh sách việc làm`, `fix(drawer): sửa lỗi alert copy link`).

### Step 4: Execute Commit

1. Run the commit command:
   ```bash
   git commit -m "<commit message>"
   ```
2. Verify commit success and check the new HEAD:
   ```bash
   git log -1 --oneline
   ```

### Step 5: Strict Stop — Do NOT Auto-Push

> [!CAUTION]
> **NEVER run `git push` unless the user explicitly requested to push in their prompt.**

- If the user asked only to commit (e.g., "tạo commit", "commit code"), complete the commit, verify working tree status, and **STOP**.
- Report to the user:
  - Commit hash and message.
  - List of committed files.
  - Inform them that the commit was created locally and is ready to push whenever they instruct.

---

## Best Practices & Safety Boundaries

1. **Never commit without explicit user request**: Always require user initiation or explicit confirmation.
2. **Never push automatically**: Treat committing and pushing as two separate actions. Pushing affects shared remotes.
3. **Prevent secret leaks**: Always verify `.gitignore` and never stage `.env`, credentials, or local configs.
4. **Clean and atomic commits**: Keep each commit focused on a single logical change.
