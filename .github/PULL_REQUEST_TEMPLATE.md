## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark the relevant option with an 'x' -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Code style update (formatting, renaming)
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Build/CI update
- [ ] 🔒 Security update

## Related Issue

<!-- Link to the issue this PR addresses -->

Closes #(issue number)

## Changes Made

<!-- List the main changes you made -->

-
-
-

## Screenshots (if applicable)

<!-- Add screenshots to help reviewers understand your changes -->

| Before | After |
|--------|-------|
| ![before](url) | ![after](url) |

## How Has This Been Tested?

<!-- Describe the tests you ran to verify your changes -->

**Test Configuration:**
- Node version:
- Database: (local/NeonDB dev branch)
- Browser(s):

**Test Cases:**
- [ ] Test case 1
- [ ] Test case 2
- [ ] Test case 3

## Checklist

<!-- Mark completed items with an 'x' -->

### Code Quality
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors
- [ ] I have removed any console.logs or debugging code

### TypeScript
- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] No use of `any` type (or justified with comments)
- [ ] Proper types defined for new functions/components

### Testing
- [ ] I have tested my changes locally
- [ ] I have tested on multiple browsers (if UI changes)
- [ ] I have tested edge cases and error scenarios
- [ ] Existing tests still pass

### Database (if applicable)
- [ ] Database migrations created (`npx drizzle-kit generate`)
- [ ] Migrations tested on dev branch
- [ ] Schema changes documented in DATABASE.md
- [ ] No breaking changes to existing data

### Documentation
- [ ] I have updated the README (if user-facing changes)
- [ ] I have updated DEPLOYMENT.md (if deployment changes)
- [ ] I have updated DATABASE.md (if schema changes)
- [ ] I have added/updated JSDoc comments
- [ ] .env.example updated (if new env vars added)

### Security
- [ ] No secrets or sensitive data committed
- [ ] Input validation added for new endpoints
- [ ] Authentication checks added where needed
- [ ] No SQL injection vulnerabilities

### Dependencies
- [ ] No new dependencies added (or justified)
- [ ] All dependencies are up to date
- [ ] No high/critical security vulnerabilities (`npm audit`)

## Breaking Changes

<!-- If this is a breaking change, describe the impact and migration path -->

**Impact:**
-

**Migration:**
-

## Additional Notes

<!-- Any additional information for reviewers -->

## Deployment Notes

<!-- Special instructions for deployment (if any) -->

- [ ] Requires database migration
- [ ] Requires new environment variables
- [ ] Requires manual steps (describe below)

**Manual Steps:**
1.
2.

---

## For Reviewers

<!-- Help reviewers know what to focus on -->

**Focus areas:**
-

**Known limitations:**
-

**Future improvements:**
-

---

<!-- Thank you for contributing to No One Will Pay! ⚡ -->
