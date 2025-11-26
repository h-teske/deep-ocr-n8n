# GitHub Copilot Instructions for deep-ocr-n8n

## Language Guidelines

- **Code**: Always write code in English (variable names, function names, class names)
- **Comments**: Always write comments in English
- **Commit messages**: Write in English
- **Documentation**: Write technical documentation in English

## Git Workflow

- **Never commit directly to the `main` branch**
- Always create a feature branch for changes (e.g., `feature/add-ocr-endpoint`, `fix/error-handling`)
- Branch naming convention: `feature/`, `fix/`, `docs/`, `refactor/`, `test/`

### Pull Request Requirements (MANDATORY)

**ALWAYS use the pull request template when creating PRs:**

1. When using `gh pr create`, ALWAYS use `--fill` flag to use the template:
   ```bash
   gh pr create --fill
   ```

2. NEVER create a PR without the template structure from `.github/pull_request_template.md`

3. Fill out ALL sections of the PR template:
   - Description
   - Type of Change (check appropriate boxes)
   - Changes Made (list all changes)
   - Testing (confirm testing was done)
   - All other applicable sections

## Project Context

This is an n8n community node for the Deep-OCR service, developed using GitHub Spec-kit (Spec-Driven Development).

### Tech Stack
- Node.js 22 with TypeScript
- n8n Community Node Framework
- GitHub Spec-kit for structured development

### Development Workflow (Spec-Driven Development)
1. `/speckit.constitution` - Establish project principles
2. `/speckit.specify` - Define requirements (what & why)
3. `/speckit.plan` - Create technical plan (how)
4. `/speckit.tasks` - Generate actionable tasks
5. `/speckit.implement` - Execute implementation

## Code Style

- Use TypeScript strict mode
- Follow n8n node development conventions
- Use async/await for asynchronous operations
- Handle errors appropriately with try/catch blocks
- Add JSDoc comments for public functions and classes
