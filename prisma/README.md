# Prisma Database Setup

This directory contains the Prisma ORM configuration for the Inference app.

## Development Workflow

The Inference app uses Prisma with SQLite for local development, but builds to a static site for production. This hybrid approach gives you the best of both worlds:

1. **Development**: Edit data with a real database and Prisma Studio UI
2. **Production**: Generate static JSON for optimal performance and easy deployment

## Setup Instructions

### First-time setup

1. Install dependencies
```bash
npm install
```

2. Set up the database
```bash
npm run db:setup
```
This will:
- Generate the Prisma client
- Run migrations to create the database schema
- Seed the database with initial data from `/src/data/vendors/` JSON files

### Editing Data

You can edit the data in multiple ways:

1. Use Prisma Studio UI (recommended)
```bash
npm run prisma:studio
```

2. Directly edit the vendor JSON files in `/src/data/vendors/`
Then sync them to the database:
```bash
npm run prisma:seed
```

### Exporting Changes

After making changes in the database, export them back to JSON:
```bash
npm run export-json
```

This will:
- Generate updated JSON files for each vendor in `/src/data/vendors/`
- Create an updated `models.json` file
- These files are used in production or when the database isn't available

## Commands

- `npm run prisma:studio` - Open Prisma Studio UI to view/edit data
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database from JSON files
- `npm run db:setup` - Complete setup (generate, migrate, seed)
- `npm run db:reset` - Reset database (delete all data and rerun migrations)
- `npm run export-json` - Export database to JSON files

## Schema Changes

If you need to modify the database schema:

1. Edit `schema.prisma`
2. Run `npm run prisma:migrate` to create a new migration
3. Run `npm run prisma:generate` to update the client

## Data Location

- Development: SQLite database at `prisma/dev.db`
- JSON files: 
  - Vendor files: `/src/data/vendors/*.json`
  - Combined data: `/src/data/models.json`
  - Categories: `/src/data/categories.json`
  - Vendors: `/src/data/vendors.json`