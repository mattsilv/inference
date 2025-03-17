# CLAUDE.md - Project Reference Guide

## Project Commands

- Build check: `pnpm build` to test the build
- Start dev server: `pnpm dev` for local development with Next.js
- Lint code: `pnpm lint` to check for code issues
- Use our MPC servers when they will make it faster to solve issues

### Development and Build Process

- Always use `pnpm` instead of `npm` for all commands
- After code changes, run both `pnpm lint` and `pnpm build` to catch issues
- If runtime errors occur with Turbopack:
  1. Remove turbo flags completely (e.g., just `pnpm dev`)
  2. Clean the build directory: `rm -rf .next` before rebuilding
  3. Avoid experimental Next.js features unless explicitly required

## Data Management

IMPORTANT: Do NOT run Prisma Studio, npx commands, or other database commands directly. Ask the user first; they will often have these running in the background.

- Validate models: `npm run validate-models`
- Generate models.json: `npm run generate-models`
- Export DB to JSON: `npm run export-json`
- Complete DB setup: `npm run db:setup`
- Reset database: `npm run db:reset`
- Check database status: `npm run db:check`
- Backup database: `npm run db:backup` (maintains the last 10 backups in /backup folder)

### Database Queries

Use the SQLite MCP server for direct database queries when needed:

```sql
-- Check for hidden models
sqlite3 prisma/dev.db "SELECT id, systemName, displayName, isHidden FROM AIModel WHERE isHidden = 1;"

-- List all tables
sqlite3 prisma/dev.db ".tables"

-- Other common queries
sqlite3 prisma/dev.db "SELECT * FROM AIModel;"
sqlite3 prisma/dev.db "SELECT * FROM Vendor;"
```

### Pricing Data Management

- Backup pricing data: `npm run pricing:backup` (preserves pricing history in /backups folder)
- Restore pricing data: `npm run pricing:restore` (restores from latest backup)
- Generate vendor tracking info: `npm run pricing:info`
- Update pricing from data: `npm run pricing:update [path-to-json]`
- Export pricing data to JSON: `npm run pricing:export`

### LLM Pricing Format

CRITICAL: All pricing in the database and UI is stored and displayed in dollars per MILLION tokens.
This is the industry standard used by OpenAI, Anthropic, Google, and other LLM providers.

- Example: If a model costs $0.0375 per million characters for input text, store it as `37.5` in the database
- Example: If a model costs $0.15 per million characters for output text, store it as `150.0` in the database
- The UI shows prices with the column labels "($/1M)" to clarify they are per million tokens
- Always show raw values (never divide by 1000 or other values) when displaying prices
- The price formatter includes validation to warn about unusually high or low values

### Model Visibility Management

- List hidden models: `npm run models:hide` (with no arguments)
- Hide models: `npm run models:hide model1 model2` (specify system names)
- Unhide specific models: `npm run models:unhide model1 model2` (specify system names)
- Unhide a model directly: `node scripts/hide-models.js -model-name`

### Database Reset Safety

The system now automatically backs up and restores pricing data when resetting the database.
When you run `npm run db:reset` or when the check-db.js script detects issues and resets:

1. All pricing and pricing history data is backed up
2. Database is reset with migrations and seed data
3. Pricing data is restored from the backup
   This ensures you won't lose important pricing updates when fixing database issues.

### Data Source of Truth

- The **Prisma database** is the primary source of truth for all data
- JSON files in `/src/data` are generated from the database
- To update data:
  1. Use Prisma Studio (`npm run prisma:studio`) to edit the database
  2. Run `npm run export-json` to regenerate JSON files (includes data integrity validation)
  3. Run `npm run validate-models` to ensure data is valid

### Export Data Integrity

The export-to-json scripts include a built-in validation system that:

- Ensures all required fields (including isHidden) are exported to JSON
- Validates proper mapping between database and JSON representation
- Fails with a detailed error if any required field is missing
- Shows helpful stats about total models and hidden model counts

This safeguard prevents issues where critical fields might be missing from exported JSON files.

## Code Style Guidelines

- **TypeScript**: Use strict typing, avoid `any` types
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Imports**: Group imports - React first, libraries, then project imports
- **Components**: 'use client' directive for client components
- **Tailwind**: Use Tailwind classes for all styling
- **State Management**: Use React hooks (useState, useMemo) for component state
- **Error Handling**: Use try/catch for async operations with proper user feedback
- **Formatting**: Use 2-space indentation
- **Component Structure**: Props interface defined above component
- **Responsive Design**: All components should be mobile-friendly using Tailwind responsive classes
- **File Organization**: Keep similar files in appropriate directories (lib, components, data)
