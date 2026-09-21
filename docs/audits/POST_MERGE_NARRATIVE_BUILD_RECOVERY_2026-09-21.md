# Post-merge narrative build recovery — 2026-09-21

Purpose: preserve the factual recovery trail after PR #41 was merged and the first Production build exposed latent syntax/module-resolution defects that were not visible while the PR remained draft.

Current facts:
- PR #41 merged to main at `0d49e58928a1c14bb36bfdb83ca8ca3a22b17c7c`.
- The first Production build failed during `npm run build`.
- GitHub PR CI identified escaped template literals in `lib/narrative/engine.ts` and `lib/pipeline/prompts.ts`; these were corrected on main.
- The subsequent Vercel build reported `module_not_found`; Node strip-types module specifiers in the new narrative self-test path were updated to explicit `.ts` imports.
- This recovery branch exists to run the full PR CI path against the current main tree and capture any remaining build defect before closure.

No pedagogical semantics are changed by this recovery work.
