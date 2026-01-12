# Git Rebase Instructions for Bobby's Workshop

## Current Status
- **Current Branch**: `main-tool-kit`
- **Remote**: `https://github.com/Bboy9090/Bobbys-Workshop-.git`
- **Tracking**: `origin/main-tool-kit`

## Option 1: Using Git Bash (Recommended)

If you have Git installed, open **Git Bash** (not PowerShell) and run:

```bash
# Navigate to repository
cd /c/Users/Bobby/Bobbys-Workshop-

# Check current status
git status

# Fetch latest changes from remote
git fetch origin --prune

# Check what branch you're on
git branch

# If you have uncommitted changes, stash them first
git stash push -m "Stashed before rebase - $(date)"

# Rebase with remote main-tool-kit branch
git rebase origin/main-tool-kit

# If you stashed changes, restore them after rebase
git stash pop
```

## Option 2: Using PowerShell Script

Run the provided script:

```powershell
.\rebase-with-remote.ps1
```

## Option 3: Manual Steps (If Git is in PATH)

```powershell
# 1. Check status
git status

# 2. Stash any uncommitted changes (if needed)
git stash push -m "Stashed before rebase"

# 3. Fetch latest from remote
git fetch origin --prune

# 4. Rebase with remote
git rebase origin/main-tool-kit

# 5. If there are conflicts, resolve them:
#    - Review: git status
#    - Fix conflicts in files
#    - Stage: git add <file>
#    - Continue: git rebase --continue

# 6. Restore stashed changes (if you stashed)
git stash pop
```

## Option 4: Using GitHub Desktop

1. Open **GitHub Desktop**
2. Click **Repository → Pull** (this will fetch and merge)
3. Or use **Branch → Update from origin** to rebase

## Resolving Conflicts

If rebase encounters conflicts:

1. **Check status**: `git status`
2. **View conflicts**: Look for files marked as "both modified"
3. **Resolve conflicts**: Edit the files and remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
4. **Stage resolved files**: `git add <file>`
5. **Continue rebase**: `git rebase --continue`
6. **Or abort**: `git rebase --abort` (to cancel the rebase)

## Alternative: Pull with Rebase

Instead of `git rebase`, you can use:

```bash
git pull --rebase origin main-tool-kit
```

This combines fetch + rebase in one command.

## Notes

- The remote URL is correctly configured: `https://github.com/Bboy9090/Bobbys-Workshop-.git`
- Your current branch `main-tool-kit` tracks `origin/main-tool-kit`
- Make sure to commit or stash any local changes before rebasing
- Rebase rewrites commit history, so be careful if you've already pushed commits
