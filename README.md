# Inference.silv.app

A comprehensive comparison tool for AI model pricing and specifications.

## 🚀 Quick Setup (2 Terminal Setup)

**Terminal 1: Database & Data**
```bash
# First time or after restart
pnpm install              # Install dependencies
pnpm run db:check         # Verify database is ready
pnpm run dev:fast         # Start development server with improved hot-reloading
pnpm run dev              # Start standard development server (use if dev:fast has issues)

# Data workflow
pnpm run export-json      # Export database to JSON (with validation)
```

**Terminal 2: Database Management**
```bash
# Only when needed
pnpm run db:backup        # Backup database before changes
pnpm run db:reset         # Reset database if issues occur
```

## All Commands

```bash
# Development
pnpm run dev:fast         # Start development server with improved hot-reloading
pnpm run dev              # Start standard development server
pnpm run build            # Build for production
pnpm run start            # Start production server

# Data Management
pnpm run export-json      # Export database to JSON (with validation)
pnpm run db:backup        # Backup database
pnpm run db:check         # Verify database is ready
pnpm run db:setup         # Set up database (create and seed)
pnpm run db:reset         # Reset database (drop and recreate)

# Pricing Automation  
pnpm run pricing:backup   # Backup pricing data
pnpm run pricing:info     # Generate vendor tracking info for AI agent
pnpm run pricing:update   # Update pricing from AI agent JSON output
pnpm run models:hide      # Hide specific models from UI
```

## About This Project

This Next.js application provides a simple, clean interface to compare different AI models across various providers, displaying pricing information, model parameters, and key specifications in an easy-to-read format.

## Features

- Interactive pricing table with model filtering and sorting
- Detailed model information cards
- Vendor and category filtering
- Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/mattsilverman/inference.git
```

2. Install dependencies:

```bash
cd inference
npm install
```

### Development

Run the development server:

```bash
pnpm run dev:fast   # For improved hot-reloading (recommended)
```

Or use the standard server if you encounter issues:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Working with Model Data

The model data is organized in a vendor-based directory structure:

- Individual vendor model files are stored in `src/data/vendors/` (e.g., `openai.json`, `anthropic.json`)
- Vendor and category metadata are stored in `src/data/vendors.json` and `src/data/categories.json`
- The combined model data is automatically generated into `src/data/models.json`

#### Data Management

##### Source of Truth

The SQLite database (managed by Prisma) is the primary source of truth for all model, vendor, and category data.

- The database schema is defined in `prisma/schema.prisma`
- JSON files in `/src/data` are generated from the database
- All data changes should be made through the database first, then exported to JSON

##### Data Management Commands

- `npm run prisma:studio` - Open Prisma Studio for database management
- `npm run db:setup` - Set up database (create and seed)
- `npm run db:reset` - Reset database (drop and recreate)
- `npm run validate-models` - Check data for errors without generating models.json
- `npm run generate-models` - Merge vendor files into models.json (runs automatically during build)
- `npm run export-json` - Export database to JSON files

##### Development Workflow

1. Make data changes using Prisma Studio (`npm run prisma:studio`)
2. Export changes to JSON files with `npm run export-json`
3. Validate data with `npm run validate-models`
4. Generate combined models.json with `npm run generate-models`

##### Automated Pricing Updates

The project includes an automated system for keeping model pricing up-to-date:

1. Generate tracking information with `pnpm run pricing:info`

   - This outputs a JSON file with all necessary vendor URLs and model information
   - Example: `pnpm run pricing:info > vendor-tracking-info.json`

2. Share this JSON file with an AI agent to fetch latest pricing:

   - The agent should use the exact URLs provided in the `pricingUrl` and `modelListUrl` fields
   - For each model, the agent should extract current input and output pricing
   - Agent must output data in the required format (see detailed process below)

3. Update the database with agent output using `npm run pricing:update <json-file-path>`

   - Example: `npm run pricing:update agent-pricing-output.json`
   - The system automatically records pricing history when changes are detected

4. Export the updated data to JSON files with `npm run pricing:export`
   - This updates all files in the `src/data` directory

##### Detailed Pricing Update Process

To update model pricing with the AI agent:

1. **Generate vendor tracking information**:

   ```bash
   npm run pricing:info
   ```
   
   This command automatically creates the vendor-tracking-info.json file in the project root.

2. **Share this file with your AI agent**, with these specific instructions:

   - "Use the exact URLs in pricingUrl and modelListUrl fields to visit vendor websites"
   - "For each model listed, extract the current price per 1M tokens for input and output"
   - "Return a JSON array with entries for each model in this exact format:"

   ```json
   [
     {
       "vendorName": "openai",
       "modelName": "gpt-4o",
       "inputPrice": 5.00,
       "outputPrice": 15.00,
       "finetuningInputPrice": null,
       "finetuningOutputPrice": null,
       "trainingCost": null
     },
     ...
   ]
   ```

3. **Update the database with agent output**:

   ```bash
   npm run pricing:update agent-pricing-output.json
   ```

4. **Export to JSON files**:
   ```bash
   npm run pricing:export
   ```

The system will automatically detect price changes and record them in the pricing history table.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
