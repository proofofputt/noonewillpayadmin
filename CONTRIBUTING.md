# Contributing to No One Will Pay

Thank you for your interest in contributing to **No One Will Pay**! This document provides guidelines and instructions for contributing to the project.

## 🌟 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We pledge to make participation in our project a harassment-free experience for everyone, regardless of:

- Age, body size, disability, ethnicity
- Gender identity and expression
- Level of experience, education, socio-economic status
- Nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behaviors include:**

- ✅ Being respectful of differing viewpoints and experiences
- ✅ Gracefully accepting constructive criticism
- ✅ Focusing on what is best for the community
- ✅ Showing empathy towards other community members

**Unacceptable behaviors include:**

- ❌ Trolling, insulting/derogatory comments, and personal or political attacks
- ❌ Public or private harassment
- ❌ Publishing others' private information without permission
- ❌ Other conduct which could reasonably be considered inappropriate

## 🚀 How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**

- Clear, descriptive title
- Steps to reproduce the behavior
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)
- Any error messages or logs

**Example:**

```markdown
**Bug**: Survey submission fails with validation error

**Steps to Reproduce:**
1. Navigate to survey page
2. Fill in all fields correctly
3. Click "Submit Survey"
4. Error appears: "Invalid survey data"

**Expected:** Survey should submit successfully
**Actual:** Validation error despite valid inputs

**Environment:**
- OS: macOS 14.0
- Browser: Chrome 120
- Node: 18.17.0
```

### Suggesting Features

Feature suggestions are welcome! Please:

1. **Check existing feature requests** first
2. **Provide clear description** of the feature
3. **Explain why it's needed** (use case)
4. **Consider implementation** (optional but helpful)

**Example:**

```markdown
**Feature**: Email reminders for incomplete surveys

**Use Case:**
Users who start surveys but don't complete them could benefit
from a reminder email after 24 hours.

**Proposed Implementation:**
- Background job checks for incomplete surveys
- Sends reminder via SendGrid
- User can opt-out in settings
```

### Pull Requests

We actively welcome pull requests!

#### Before You Start

1. **Fork the repository** and create your branch from `main`
2. **Check existing PRs** to avoid duplicate work
3. **Discuss major changes** in an issue first

#### Development Workflow

```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/noonewillpay.git
cd noonewillpay/Website

# 2. Create a branch
git checkout -b feature/amazing-feature

# 3. Install dependencies
npm install

# 4. Create .env file
cp .env.example apps/web/.env
# Fill in your local database credentials

# 5. Run migrations
cd apps/web
npx drizzle-kit push

# 6. Start development server
npm run dev

# 7. Make your changes
# ... code ...

# 8. Test your changes
npm run build  # Must succeed
npm run lint   # Should pass

# 9. Commit with clear message
git add .
git commit -m "feat: add email reminder system"

# 10. Push to your fork
git push origin feature/amazing-feature

# 11. Open Pull Request
```

#### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(auth): add OAuth login support
fix(survey): resolve validation error on submit
docs(readme): update installation instructions
refactor(db): optimize user queries
test(api): add integration tests for auth routes
chore(deps): update Next.js to v14.2.33
```

#### Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Code builds successfully (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript types are correct (no `any` types without justification)
- [ ] New features have appropriate comments
- [ ] Database migrations are included (if applicable)
- [ ] .env.example updated (if new env vars added)
- [ ] README updated (if user-facing changes)
- [ ] Tested locally with real database

#### Pull Request Template

Your PR description should include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] My changes generate no new warnings
- [ ] I have tested my changes locally
```

## 🏗️ Project Structure

Understanding the codebase:

```
Website/
├── apps/
│   ├── web/              # Main application
│   │   ├── app/          # Next.js App Router
│   │   │   ├── api/      # API routes
│   │   │   └── */        # Pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── drizzle/      # Database schema
│   └── admin/            # Admin dashboard
├── packages/             # Shared code (if any)
├── .env.example          # Environment template
└── README.md
```

## 💻 Development Guidelines

### TypeScript

- **Use TypeScript** for all new code
- **Define types** for function parameters and returns
- **Avoid `any`** - use proper types or `unknown`
- **Use interfaces** for object shapes

**Good:**
```typescript
interface UserData {
  email: string
  username: string
}

async function createUser(data: UserData): Promise<User> {
  // ...
}
```

**Bad:**
```typescript
async function createUser(data: any): Promise<any> {
  // ...
}
```

### Database

- **Use Drizzle ORM** for all database operations
- **Create migrations** for schema changes
- **Never use raw SQL** unless absolutely necessary
- **Test migrations** on dev branch first

```typescript
// Good - Using Drizzle
const user = await db.select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1)

// Avoid - Raw SQL
const user = await db.query('SELECT * FROM users WHERE email = $1', [email])
```

### API Routes

- **Validate all inputs** with Zod schemas
- **Return consistent responses** (success/error structure)
- **Handle errors gracefully**
- **Use proper HTTP status codes**

```typescript
// Good
export async function POST(request: NextRequest) {
  try {
    const data = RequestSchema.parse(await request.json())
    // ... process
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Internal error' },
      { status: 500 }
    )
  }
}
```

### React Components

- **Use functional components** with hooks
- **Extract reusable logic** into custom hooks
- **Keep components focused** (single responsibility)
- **Use TypeScript** for props

```typescript
interface SurveyFormProps {
  onSubmit: (data: SurveyData) => void
  initialData?: Partial<SurveyData>
}

export function SurveyForm({ onSubmit, initialData }: SurveyFormProps) {
  // ...
}
```

## 🧪 Testing

While we don't have comprehensive tests yet, we encourage:

- **Manual testing** of all changes
- **Testing edge cases**
- **Testing error scenarios**
- **Cross-browser testing** (Chrome, Firefox, Safari)

Future: We plan to add Jest/Vitest for unit tests and Playwright for E2E tests.

## 📚 Documentation

When adding features:

- **Update README.md** if user-facing
- **Update DEPLOYMENT.md** if affects deployment
- **Update DATABASE.md** if schema changes
- **Add JSDoc comments** for complex functions

```typescript
/**
 * Calculates allocation points for a user based on their activity
 *
 * @param userId - The user's unique identifier
 * @param activity - Type of activity (survey, referral, purchase)
 * @returns Total allocation points earned
 */
async function calculatePoints(
  userId: string,
  activity: ActivityType
): Promise<number> {
  // ...
}
```

## 🐛 Issue Labels

We use the following labels:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `wontfix` - This will not be worked on
- `duplicate` - Issue or PR already exists

## 🎯 Areas Needing Help

We especially welcome contributions in:

- ✅ **Testing** - Writing unit and integration tests
- ✅ **Documentation** - Improving guides and examples
- ✅ **Accessibility** - Making the app more accessible
- ✅ **Performance** - Optimizing queries and rendering
- ✅ **Mobile UX** - Improving mobile experience
- ✅ **GitBook Content** - Creating educational content

## ❓ Questions?

- **Check existing issues** first
- **Ask in Discussions** for general questions
- **Create an issue** for bug reports or feature requests

## 🙏 Recognition

Contributors will be:

- Listed in our README
- Thanked in release notes
- Part of building the Bitcoin education ecosystem!

## 📞 Contact

- **GitHub Issues**: https://github.com/proofofputt/noonewillpay/issues
- **Email**: (if applicable)
- **Twitter/X**: @proofofputt (if applicable)

---

**Thank you for contributing to No One Will Pay! Together we're making Bitcoin education accessible to everyone.** ⚡

