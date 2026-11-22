---
name: auto-merge-resolver
description: Safe and intelligent Git branch merging, rebasing, and automated conflict resolution protocol with mandatory build verification and safe rollback.
when_to_use: "When the user asks to merge branches, rebase a branch, sync develop/main into a feature branch, or resolve Git merge/rebase conflicts. NOT for automatic pushing or unsolicited branch merges."
allowed-tools: run_command, read_file, edit_file, write_file
effort: medium
version: 1.0.0
---

# auto-merge-resolver — Safe Git Merge, Rebase & Conflict Resolution

> Merge with precision, resolve conflicts through contextual understanding, verify with builds, and rollback safely when blocked.

## Overview

This skill establishes a safe, disciplined, and automated workflow for Git branch operations:
1. **Branch Operations**: Merging (`git merge`) or Rebasing (`git rebase`) branches upon explicit user instruction.
2. **Context-Aware Conflict Resolution**: Detecting conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), analyzing surrounding code intent, and intelligently reconciling code without breaking existing functionality.
3. **Mandatory Verification**: Enforcing local builds (`Frontend: pnpm build`, `Backend: dotnet build`) before completing the merge/rebase.
4. **Safety & Rollback Guardrails**: Automatically aborting (`git merge --abort` or `git rebase --abort`) if conflicts or build failures cannot be resolved, restoring the repository to a pristine state. Never auto-pushing to remotes.

## When to Use

✅ **Good for:**
- The user requests to merge a branch into another (e.g., "merge develop vào branch hiện tại", "rebase lên main").
- Git conflicts arise during a merge, rebase, or cherry-pick operation.
- Resolving conflicts in code files, project configurations, or DTOs.
- Verifying merge integrity before committing or continuing the rebase.

❌ **Not for:**
- Unsolicited merges or rebases without user request.
- Pushing to remote repositories (`git push` or `git push --force`) without separate, explicit user command.
- Destructive operations (`git reset --hard`) that could erase uncommitted local work.

---

## Protocol

### Phase 1: Pre-flight Checks & Safety Preparation

1. **Verify user intent & target branch**:
   - Confirm current working branch and the target source branch to merge/rebase from.
   ```bash
   git branch --show-current
   git status
   ```
2. **Ensure clean working tree**:
   - The working tree MUST be clean before attempting a merge or rebase.
   - If uncommitted changes exist, ask the user to commit or stash them first. Do NOT run merge/rebase on a dirty working tree.
3. **Fetch latest remote references (if requested by user)**:
   ```bash
   git fetch origin
   ```

---

### Phase 2: Initiate Merge or Rebase

1. **Execute branch operation**:
   - For Merge:
     ```bash
     git merge <source-branch>
     ```
   - For Rebase:
     ```bash
     git rebase <source-branch>
     ```
2. **Assess result**:
   - If merge/rebase succeeds cleanly (Fast-forward or no conflict): Proceed directly to **Phase 4 (Verification)**.
   - If conflicts occur: Git will pause and report conflicting files. Proceed to **Phase 3 (Conflict Resolution)**.

---

### Phase 3: Intelligent Conflict Resolution

1. **Identify all conflicting files**:
   ```bash
   git status --short
   # Conflicting files are marked with 'UU' or 'AA'
   ```
2. **Process each conflicted file systematically**:
   - Read the file content around the conflict markers:
     - `<<<<<<< HEAD` (or current branch changes)
     - `=======` (separator)
     - `>>>>>>> <branch-or-commit>` (incoming changes)
3. **Analyze context & reconcile logic**:
   - **Imports / Package References**: Combine both sides, remove duplicates, sort cleanly.
   - **Independent Functions / Methods**: Retain both sides without overwriting.
   - **Modified Shared Logic**: Analyze the semantic purpose of both sides:
     - If incoming contains bug fixes or new parameters and local contains UI refinement, synthesize both.
     - Never arbitrarily pick one side (`ours` or `theirs`) without checking what logic is being dropped.
   - **Lockfiles (`pnpm-lock.yaml`, etc.)**:
     - Do NOT manually resolve conflict markers inside binary/massive lockfiles.
     - Run the package manager's resolution command (e.g., `pnpm install` outside sandbox on Windows) to let the tool recompute the lockfile cleanly.
4. **Escalate when truly ambiguous (Socratic Escalation)**:
   - If two changes represent mutually exclusive business logic or conflicting architectural directions, STOP and ask the user:
     - Present the exact conflict block.
     - Explain the consequences of Option A (Current) vs Option B (Incoming) vs Option C (Combined).
     - Wait for user instruction before editing.
5. **Stage resolved files**:
   - After resolving and verifying no conflict markers remain in the file:
     ```bash
     git add <path/to/resolved-file>
     ```

---

### Phase 4: Mandatory Build & Type Verification

> [!IMPORTANT]
> A conflict resolution is NEVER complete until project builds succeed. Never mark a merge as done if compilation or typing is broken.

1. **Run verification according to affected scope**:
   - **Frontend changes**:
     ```bash
     cd Frontend && pnpm exec tsc -b && pnpm exec vite build
     ```
   - **Backend changes**:
     ```bash
     cd Backend && dotnet build
     ```
2. **Handle verification failures**:
   - If build fails due to missing symbols, mismatching types, or duplicate declarations:
     - Inspect compiler error messages.
     - Apply targeted fixes to make both sides compatible.
     - Re-run build until exit code is 0.
   - **Safety Rollback Rule**:
     - If fixes lead to cascading unresolvable errors or breaking regressions that cannot be fixed within 2 attempts, execute safe abort:
       ```bash
       # For merge:
       git merge --abort
       # For rebase:
       git rebase --abort
       ```
     - Report the exact compilation roadblocks to the user and restore the repository to its pre-operation state.

---

### Phase 5: Complete Operation & Report

1. **Finalize the merge or rebase**:
   - For Merge:
     ```bash
     git commit -m "merge: resolve conflicts merging <source-branch> into <current-branch>"
     ```
   - For Rebase:
     ```bash
     git rebase --continue
     # Repeat Phase 3 & 4 if next commits conflict, until rebase completes
     ```
2. **Strict Stop — NEVER Auto-Push**:
   - Confirm status and show HEAD:
     ```bash
     git status
     git log -1 --oneline
     ```
   - Report clearly to the user:
     - List of resolved conflict files.
     - Summary of reconciled logic.
     - Successful build verification results.
     - Notice that changes are committed **locally** and ready for manual push whenever instructed.

---

## Best Practices & Safety Boundaries

1. **Never commit conflict markers**: Always ensure no `<<<<<<<`, `=======`, `>>>>>>>` remain in any file.
2. **Zero Auto-Push**: Never push to remote without separate explicit instruction.
3. **Preserve Working Trees**: Always abort and restore if a merge or rebase becomes broken or unsafe.
4. **Respect Project Stack**: Keep lockfiles generated by respective package managers, not hand-edited.
