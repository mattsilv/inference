# CLAUDE.md - Project Reference Guide

## Project Commands

- Build check: `pnpm build` to test the build
- Start dev server: `pnpm dev` for local development with Next.js
- Lint code: `pnpm lint` to check for code issues
- TypeScript check: `pnpm typecheck` to verify type correctness
- Netlify build simulation: `pnpm build:netlify` runs typecheck and build
- Run tests: `pnpm test` to run all tests (Jest)
- Run specific tests: `pnpm test src/components/pricing/__tests__/formatters.test.js` to run specific tests
- Use our MPC servers when they will make it faster to solve issues

### Development and Build Process

- Always use `pnpm` instead of `npm` for all commands
- After code changes, run `pnpm lint`, `pnpm typecheck`, and `pnpm build` to catch issues
- CRITICAL: Always run `pnpm typecheck` before creating PRs or pushing to main
- TypeScript checking is mandatory for deployment success - Netlify builds will fail if types don't match
- Special attention to Category and AIModel interfaces in types.ts:
  - New fields like description and useCase have been added
  - Components accessing these properties require proper optional property handling
- For Netlify deployment:
  - The build process bypasses database operations and uses JSON files directly
  - When adding new model properties, update both the schema and the JSON files
  - Type errors from one component can cause the entire build to fail
- If runtime errors occur with Turbopack:
  1. Remove turbo flags completely (e.g., just `pnpm dev`)
  2. Clean the build directory: `rm -rf .next` before rebuilding
  3. Avoid experimental Next.js features unless explicitly required

## Data Management

### Data Source of Truth

**IMPORTANT**: This project no longer uses SQLite/Prisma database. All model data is now sourced from the external API endpoint at **https://data.silv.app/ai/models.json**.

The application:
- Fetches data from `https://data.silv.app/ai/models.json` at build time and runtime
- Applies data transformation and filtering logic in `src/lib/dataService.ts`
- Caches the API response for 1 hour to balance freshness and performance
- Falls back to minimal data if the API is unavailable during production builds

### Data Management Process

To update model data:
1. **External API Update**: Model data is managed through the data.silv.app system
2. **Automatic Sync**: The application automatically pulls the latest data from the API
3. **Local Development**: Run `pnpm dev` to fetch the latest data during development
4. **Build Process**: The build process fetches data at build time for static generation

### Data Filtering and Display Logic

The `silvDataMapping()` function in `dataService.ts` handles:
- **Model Filtering**: Only shows models from approved vendors (Anthropic, Google, Meta, DeepSeek, Inference.net)
- **Hidden Models**: Filters out models where `isHidden: true`
- **Version Management**: Shows only the latest versions of each model family
- **Category Classification**: Automatically categorizes models based on their capabilities

### Model Visibility Management

Model visibility is controlled through the `isHidden` field in the source data at data.silv.app. 

To check which models are being filtered:
1. Inspect the API response: `https://data.silv.app/ai/models.json`
2. Check the filtering logic in `src/lib/dataService.ts:handleStructuredData()`
3. Review the approved vendors list in `transformOpenRouterData()`

### LLM Pricing Format

CRITICAL: All pricing is stored and displayed in dollars per MILLION tokens.
This is the industry standard used by OpenAI, Anthropic, Google, and other LLM providers.

- Example: If a model costs $0.0375 per million characters for input text, it's stored as `0.0375`
- Example: If a model costs $0.15 per million characters for output text, it's stored as `0.15`
- The UI shows prices with column labels "($/1M)" to clarify they are per million tokens
- Always show raw values (never divide by 1000 or other values) when displaying prices

### Data Validation

The application includes validation to ensure data integrity:
- **Type Safety**: TypeScript interfaces ensure all required fields are present
- **Price Validation**: Formatters include warnings for suspicious pricing values
- **Vendor Filtering**: Only approved vendors are displayed to maintain quality
- **Model Relationships**: Proper category and vendor relationships are established

## Code Style Guidelines

- **TypeScript**: 
  - Use strict typing, avoid `any` types
  - For optional properties, use `property?: type` notation in interfaces
  - When accessing optional properties, use `property !== undefined` instead of truthy checks
  - For rendering optional properties, use `property || ''` to handle undefined values safely
  - Always run `pnpm typecheck` to find TypeScript errors before they cause build failures
  - Common TypeScript issues in this project:
    - Non-null assertions on optional properties
    - Undefined checks on Category properties (description, useCase)
    - Type assertions for inputText/outputText in MobileView components
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
