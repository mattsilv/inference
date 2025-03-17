# CLAUDE.md - Project Reference Guide

## Project Commands

- Build check: `pnpm build` to test the build
- Start dev server: `pnpm dev` for local development with Next.js
- Lint code: `pnpm lint` to check for code issues
- Run tests: `pnpm test` to run all tests (Jest)
- Run specific tests: `pnpm test src/components/pricing/__tests__/formatters.test.js` to run specific tests
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

### Data Synchronization Guidelines

CRITICAL: Always ensure the database and JSON files are kept in sync.

1. **Export after DB changes**: Any time you modify the database, run `npm run export-json` to update the JSON files.
2. **Pre-commit hook**: Use `npm run prepare-hooks` to install the pre-commit hook that automatically exports database changes.
3. **Netlify build process**: The Netlify build process has been updated to validate and ensure data consistency.
4. **GitHub Actions**: CI/CD workflows validate database exports match expected formats.
5. **Deployment checks**: Before deployments, run `npm run pricing:validate` to catch pricing errors.

These are the critical points where database changes are exported to JSON:
- During `npm run build` (prebuild hook)
- After database seeding (`prisma/seed.js`)
- After database restoration (`scripts/check-db.js`)
- During the Netlify build process
- When the pre-commit hook runs
- After running `npm run db:reset`

Always verify the JSON files reflect the latest database state before deploying to production.

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
sqlite3 prisma/dev.db "SELECT * FROM Pricing;"
```

## Schema Enhancement Roadmap

The following enhancements are planned for the database schema:

1. **Caching Pricing Fields**: Add fields to support prompt caching pricing for models like Claude 3.5 Haiku:
   ```sql
   -- Future fields to add to Pricing table
   cachingWriteText REAL,  -- Price per million tokens for caching writes
   cachingReadText REAL,   -- Price per million tokens for caching reads
   ```

2. **Until schema migration is performed**: Store caching pricing information in the model description field.

### Pricing Data Management

- Backup pricing data: `npm run pricing:backup` (preserves pricing history in /backups folder)
- Restore pricing data: `npm run pricing:restore` (restores from latest backup)
- Generate vendor tracking info: `npm run pricing:info`
- Update pricing from data: `npm run pricing:update [path-to-json]`
- Export pricing data to JSON: `npm run pricing:export`
- Validate pricing data: `npm run pricing:validate` (detects potential pricing errors)

### LLM Pricing Format

CRITICAL: All pricing in the database and UI is stored and displayed in dollars per MILLION tokens.
This is the industry standard used by OpenAI, Anthropic, Google, and other LLM providers.

- Example: If a model costs $0.0375 per million characters for input text, store it as `0.0375` in the database
- Example: If a model costs $0.15 per million characters for output text, store it as `0.15` in the database
- The UI shows prices with the column labels "($/1M)" to clarify they are per million tokens
- Always show raw values (never divide by 1000 or other values) when displaying prices
- The price formatter includes validation to warn about unusually high or low values

### Pricing Validation Safeguards

To prevent pricing errors, we've implemented multiple validation mechanisms:

1. **Development-time warnings**: The formatters.ts file contains validation that shows visual errors in the UI for suspicious prices
2. **Build-time validation**: The dataValidator.ts file validates pricing during build and model generation
3. **Command-line validator**: Run `npm run pricing:validate` to check all prices for potential errors
4. **Vendor-specific checks**: Special validation for Google, OpenAI, and Anthropic typical pricing patterns
5. **Database constraints**: Ensures pricing values remain within expected ranges
6. **Automatic backup system**: Preserves pricing data with backups before any database operations

Always run `npm run pricing:validate` after updating any pricing data to catch potential issues.

### Model Visibility Management

- List hidden models: `npm run models:hide` (with no arguments)
- Hide models: `npm run models:hide model1 model2` (specify system names)
- Unhide specific models: `npm run models:unhide model1 model2` (specify system names)
- Unhide a model directly: `node scripts/hide-models.js -model-name`

### Database Reset Safety

The system now automatically backs up and restores data when resetting or reseeding the database.
When you run `npm run db:reset`, `npm run prisma:seed`, or when the check-db.js script detects issues:

1. A full database backup is created in `/backup` directory
2. Pricing data is specifically backed up through multiple mechanisms:
   - File-based backup in `/backups` folder
   - In-memory backup during the seeding process
3. User confirmation is required if backup fails before proceeding
4. Emergency database copy is created as an additional safety measure
5. Database is reset with migrations and seed data
6. Pricing data is automatically restored using three fallback methods:
   - From in-memory backup (preserves the most recent changes)
   - From file-based backup if in-memory restoration fails
   - From the check-db.js backup mechanism if all else fails
7. If no database is found, the system will offer to restore from the most recent backup

This comprehensive approach ensures all manual changes to pricing data are preserved even when running seed commands or resetting the database. Other non-pricing data will be overwritten during seeding.

### Data Source of Truth

- The **Prisma database** is the primary source of truth for all data
- JSON files in `/src/data` are generated from the database
- Changes made directly to the database are preserved through multiple safety mechanisms
- To update data:
  1. Use Prisma Studio (`npm run prisma:studio`) to edit the database
  2. Run `npm run export-json` to regenerate JSON files (includes data integrity validation)
  3. Run `npm run validate-models` to ensure data is valid
  4. Run `npm run db:backup` to create a full database backup after important changes
  5. Run `npm run pricing:backup` when making critical pricing changes

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
