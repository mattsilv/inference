# Inferencel.Silv.App Inferecne Pricing Table

## Overview

This project will deliver a minimalist, responsive pricing table website at `inference.silv.app`, initially focusing exclusively on text-based AI model inference pricing. It will serve as a reliable source of truth for inference pricing, structured for easy scalability to include other modalities in the future.

## Approach

- **Static Site Generation**: Use Next.js with static generation to compile pricing data at build time
- **Local Development Database**: SQLite with Prisma for schema management and data authoring
- **Deployment**: GitHub integration with Netlify for automatic deployments
- **Data Updates**: Manual developer updates with AI-assisted tooling (no admin interface for MVP)
- **Future Extensibility**: Structure allowing for future API-based data delivery

## Technical Architecture

### Build & Deployment Flow

1. Developers maintain schema and data in SQLite database locally
2. During build process, data is extracted to static JSON files
3. Next.js consumes these JSON files during static site generation
4. Built site deployed to Netlify via GitHub integration

### Data Management

- **Local Development**: SQLite + Prisma for type safety and schema validation
- **Build Process**: Custom script to export SQLite data to structured JSON files
- **Production**: Static JSON files compiled into the application bundle

## Functional Requirements

### UI/UX

- Simple, clean, minimalist table design
- Responsive and mobile-friendly (Tailwind CSS)
- Models grouped by predefined categories
- Sorting capabilities by clicking on column headers
- Default sorting: group by category, then sort by lowest price within each category

### Categories

| ID  | Name                         | Examples                                                                  |
| --- | ---------------------------- | ------------------------------------------------------------------------- |
| 1   | Top-tier General-purpose     | Gemini Ultra, GPT-4o, Command R+                                          |
| 2   | High-performance Open-source | Llama 3 70B, Mistral Large                                                |
| 3   | Mid-range                    | Gemini Pro, GPT-4, Command R                                              |
| 4   | Cost-effective               | Gemini 2.0 Flash, Claude 3.5 Haiku, GPT-3.5                               |
| 5   | Reasoning-focused            | DeepSeek R1, OpenAI 3o-mini, Claude 3.7 Sonnet, Gemini 2.0 Flash Thinking |

## Data Schema

Using Prisma with SQLite for local development:

```typescript
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model AIModel {
  id             Int      @id @default(autoincrement())
  systemName     String   @unique     // e.g., "gemini-2.0-flash-thinking"
  displayName    String               // e.g., "Gemini 2.0 Flash Thinking"
  categoryId     Int                  // e.g., 5
  parametersB    Float                // e.g., 20
  vendorId       Int                  // Reference to Vendor ID
  host           String               // e.g., "inference.net"
  precision      String?              // e.g., "BF16"
  pricing        Pricing?
  category       Category @relation(fields: [categoryId], references: [id])
  vendor         Vendor   @relation(fields: [vendorId], references: [id])
}

model Pricing {
  id             Int      @id @default(autoincrement())
  modelId        Int      @unique
  model          AIModel  @relation(fields: [modelId], references: [id])
  inputText      Float    // Price per million characters for input, e.g., 0.0375
  outputText     Float    // Price per million characters for output, e.g., 0.15
  // Future fields for multimodal pricing expansion
}

model Category {
  id             Int      @id @default(autoincrement())
  name           String   @unique           // e.g., "Reasoning-focused"
  models         AIModel[]
}

model Vendor {
  id             Int      @id @default(autoincrement())
  name           String   @unique           // e.g., "Anthropic"
  pricingUrl     String               // URL to pricing page
  modelsListUrl  String               // URL to list of all models
  models         AIModel[]
}
```

## Project Structure

```
/
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Prisma schema file
│   └── seed.ts              # Seed script for initial data
│
├── scripts/                 # Build-time scripts
│   └── export-data.ts       # Script to export DB data to JSON
│
├── src/
│   ├── components/          # React components
│   │   ├── PricingTable.tsx # Main pricing table component
│   │   └── ...
│   │
│   ├── pages/               # Next.js pages
│   │   └── index.tsx        # Home page with pricing table
│   │
│   ├── lib/                 # Utility functions
│   │   └── types.ts         # TypeScript types matching Prisma schema
│   │
│   └── data/                # Generated JSON data files
│       ├── models.json      # AI model data
│       ├── categories.json  # Category data
│       └── vendors.json     # Vendor data
│
├── tailwind.config.js       # Tailwind CSS configuration
├── next.config.js           # Next.js configuration
└── package.json             # Project dependencies
```

## Development Workflow

1. **Schema Updates**:

   - Modify Prisma schema
   - Run `npx prisma migrate dev` to apply changes to dev DB
   - Update TypeScript types to match schema changes

2. **Data Updates**:

   - Use Prisma Studio (`npx prisma studio`) for visual data editing
   - Or use AI-assisted coding to generate SQL/Prisma queries for bulk updates

3. **Build Process**:
   - Run export script to generate JSON files from SQLite
   - Next.js builds static site using these JSON files
   - Deploy to Netlify

## Future Expansion Path

1. **API-Based Data Delivery**:

   - Move JSON data files to CDN
   - Update frontend to fetch data client-side
   - Implement simple caching strategy

2. **Multimodal Pricing**:

   - Extend Pricing model with additional fields
   - Update UI to display multimodal pricing options

3. **Automated Updates**:
   - Create crawler/scraper for vendor pricing pages
   - Implement automated PR generation for price changes

## Implementation Priorities

1. Set up Next.js + Tailwind + Prisma project structure
2. Implement basic data model and seed with initial data
3. Create export script for SQLite → JSON conversion
4. Build responsive pricing table UI with sorting functionality
5. Configure Netlify deployment
