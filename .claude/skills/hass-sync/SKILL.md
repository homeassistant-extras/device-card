---
name: hass-sync
description: Maintains synchronization between src/hass folder and Home Assistant frontend source code. Verifies file locations, checks code matches upstream, and identifies unused code. Use when working with src/hass files, syncing Home Assistant code, or verifying code synchronization.
---

# Home Assistant Code Synchronization

Maintains the `src/hass` folder which contains minimal code copied from Home Assistant frontend (`home-assistant/frontend`). Each file has a GitHub link comment at the top for reference.

## Upstream Source

The upstream Home Assistant frontend is cloned locally at:

- **Path**: `../frontend/` (relative to device-card project root)
- **Full path**: `/Users/patrickmasters/Desktop/src.nosync/homeassistant/frontend/`

### Keeping Upstream Updated

**Before comparing**, ensure the local frontend clone is up to date:

1. **Check git status**:

   ```bash
   cd ../frontend && git status
   ```

2. **Check if behind upstream**:

   ```bash
   cd ../frontend && git fetch && git status
   ```

3. **Update if needed**:
   - Ask user: "Frontend clone may be outdated. Pull latest changes?"
   - If yes: `cd ../frontend && git pull`
   - If no: Proceed with current state (user may want to compare against specific version)

The agent can ensure latest or ask for a git pull before comparisons.

## Core Tasks

### 1. Verify File Locations

Check if files are in the correct location relative to upstream:

1. **Extract GitHub URLs** from file comments:

   ```typescript
   /**
    * https://github.com/home-assistant/frontend/blob/dev/src/common/const.ts
    */
   ```

   → Expected local path: `src/hass/common/const.ts`
   → Upstream path: `../frontend/src/common/const.ts`

2. **Path mapping rule**:
   - Upstream: `../frontend/src/[path]`
   - Local: `src/hass/[path]`

3. **Check for moved files**:
   - If GitHub URL path doesn't match current file location → flag as moved
   - Verify if upstream file still exists at that path in local clone
   - **Action**: Move the file in this project to match upstream structure (not just update the URL)

### 2. Verify Code Matches Upstream

Ensure copied code matches upstream as closely as possible:

1. **Read upstream content** from local frontend clone:
   - Extract path from GitHub URL comment
   - Read file from `../frontend/src/[path]`
2. **Compare structure**:
   - Export order (should match)
   - Function/class order (should match)
   - Import order (can differ if using local paths)
3. **Identify intentional changes**:
   - Look for comments like `// MODIFIED:` or `// CHANGED:`
   - Check if imports use `@hass/` paths (local) vs original paths
4. **Flag differences**:
   - Reordered exports/functions
   - Missing code from upstream (unless intentional - e.g., partial types)
   - Extra code not in upstream
   - Code improvements without documentation comments

### 3. Identify Unused Code

Ensure unnecessary code isn't copied:

1. **Check imports**:
   - Search project for usage of imported symbols
   - Flag unused imports
2. **Check exports**:
   - Search project for usage of exported symbols
   - Flag unused exports (unless they're re-exported for convenience)
3. **Check internal code**:
   - Functions/types only used internally in hass folder
   - Verify they're actually needed by other hass files

## Workflow

### When syncing a file:

```
1. Ensure frontend clone is up to date (ask user or check git status)
2. Extract GitHub URL from comment
3. Map to local upstream path: ../frontend/src/[path]
4. Read upstream content from local clone
5. Compare:
   - [ ] File location matches expected path
   - [ ] Code structure matches (order, exports)
   - [ ] No unintentional changes
   - [ ] All imports/exports are used
6. Report findings
```

### When checking all files:

```
1. Ensure frontend clone is up to date (ask user or check git status)
2. Scan all files in src/hass/
3. For each file:
   - Extract GitHub URL
   - Map to upstream path: ../frontend/src/[path]
   - Verify location
   - Check if upstream file exists in local clone
   - Read and compare content structure
   - Check usage
4. Generate report:
   - Files in wrong location
   - Files with mismatched content
   - Files with unused code
   - Files that may have moved upstream
```

## GitHub URL Pattern

Files follow this pattern:

```typescript
/**
 * https://github.com/home-assistant/frontend/blob/dev/src/[path]
 */
```

**Path mapping**:

- GitHub URL path: `src/[path]`
- Local file: `src/hass/[path]`
- Upstream file: `../frontend/src/[path]`

The GitHub URL is kept for reference, but comparisons use the local frontend clone.

## Intentional Modifications

Files may have intentional changes:

- Import paths changed to use `@hass/` aliases
- Comments added with `// MODIFIED:` or `// CHANGED:`
- Partial code copied (only needed parts)
- **Code improvements**: Intentional improvements (e.g., SonarQube code smell cleanups) should be documented with comments explaining they are intentional
- **Minimal types**: Types/interfaces can be minimal or partial - only include fields that are actually used in this project

Always respect intentional modifications - only flag unintentional differences.

## Usage Examples

**Check a specific file:**

```
Verify src/hass/data/entity.ts matches upstream
```

**Check all files:**

```
Audit all files in src/hass for sync issues
```

**Find unused code:**

```
Find unused imports/exports in src/hass
```

**Verify file locations:**

```
Check if any files need to be moved due to upstream changes
```
