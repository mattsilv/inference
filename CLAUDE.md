# CLAUDE.md - Project Reference Guide

## Project Commands
- Start dev server: `npm run dev` (with Turbopack)
- Build project: `npm run build`
- Start production server: `npm run start`
- Lint code: `npm run lint`

## Data Management
- Validate models: `npm run validate-models`
- Generate models.json: `npm run generate-models`
- Run Prisma Studio: `npm run prisma:studio` (NOTE: Do not run this directly; ask user to run it if needed)
- Export DB to JSON: `npm run export-json`
- Complete DB setup: `npm run db:setup`
- Reset database: `npm run db:reset`
- Check database status: `npm run db:check` (automatically runs before dev server starts)
- Backup database: `npm run db:backup` (maintains the last 10 backups in /backup folder)

### Pricing Data Management
- Backup pricing data: `npm run pricing:backup` (preserves pricing history in /backups folder)
- Restore pricing data: `npm run pricing:restore` (restores from latest backup)
- Generate vendor tracking info: `npm run pricing:info`
- Update pricing from data: `npm run pricing:update [path-to-json]`
- Export pricing data to JSON: `npm run pricing:export`

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
  2. Run `npm run export-json` to regenerate JSON files
  3. Run `npm run validate-models` to ensure data is valid

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