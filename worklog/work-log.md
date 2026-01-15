# Work Log: Google Photos parsing + ordering fixes

**Date**: 2026-01-15
**Status**: Verified by user, ready for PR

---

## 1. Issues
- Parsing error: `TypeError: Cannot read properties of null (reading '0')`
- Sorting left single images at the end
- Post-sort verification failed with `Order length mismatch`

---

## 2. Root Causes
- Google Photos page script format changed, breaking regex parsing
- Network calls returned partial metadata, leaving missing filenames
- Batch reordering sometimes applied incompletely, leaving residual items

---

## 3. Fixes Applied
### Parsing Reliability
- Updated script tag regex to current `AF_initDataCallback` format
- Added null checks and clearer error message for missing data

### Sorting Reliability
- Batch reordering with retry/backoff and response validation
- Post-sort verification with single-item correction pass
- Missing metadata recovery with multi-pass fetch
- Duplicate protection when collecting image info

### Localization Cleanup
- Converted runtime logs and comments to English

---

## 4. Files Changed
- `lib/Album.js` (parsing + null handling)
- `lib/Sorter.js` (retry, verification, correction, missing metadata recovery)
- `lib/rq.js` (error/timeout handling)
- `content.js`, `content2.js`, `background.js`, `lib/send_msg.js` (English comments/logs)

---

## 5. Verification
- Manual test on album page: sorting completes successfully
- User confirmed no leftover items after fix

---

## 6. References
- Proposal: `openspec/changes/archive/2026-01-15-fix-null-parsing-error/proposal.md`
- Tasks: `openspec/changes/archive/2026-01-15-fix-null-parsing-error/tasks.md`
- Spec: `openspec/specs/album-parsing/spec.md`
