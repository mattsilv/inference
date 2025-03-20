/**
 * This script exports data from the Prisma database to JSON files.
 * It's designed to be run during the build process to generate the
 * static data files used by the site.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

// Check if we're in Netlify environment
const isNetlify = process.env.NETLIFY === "true";

// Initialize Prisma client only if not in Netlify environment
let prisma;
if (!isNetlify) {
  prisma = new PrismaClient();
}

/**
 * Required fields for each model export
 * IMPORTANT: Update this list when new required fields are added to the schema
 */
const REQUIRED_MODEL_FIELDS = [
  "id",
  "systemName",
  "displayName",
  "categoryId",
  "parametersB",
  "vendorId",
  "host",
  "isHidden",
];

/**
 * Validates that a database model has been properly mapped to JSON
 * @param {Object} dbModel Original database model
 * @param {Object} jsonModel Exported JSON model
 * @returns {Array} Array of missing fields
 */
function validateModelExport(dbModel, jsonModel) {
  const missingFields = [];

  // Check that all required fields are present
  for (const field of REQUIRED_MODEL_FIELDS) {
    if (jsonModel[field] === undefined) {
      missingFields.push(field);
    }
  }

  // Check isHidden specifically since this has caused issues
  if (dbModel.isHidden !== undefined && jsonModel.isHidden === undefined) {
    missingFields.push("isHidden");
  }

  return missingFields;
}

async function main() {
  console.log("Starting export process...");

  const dataDir = path.join(process.cwd(), "src", "data");
  const vendorsDir = path.join(dataDir, "vendors");

  // Ensure directories exist
  if (!fs.existsSync(vendorsDir)) {
    fs.mkdirSync(vendorsDir, { recursive: true });
  }

  // Export categories
  console.log("Exporting categories...");
  const categories = await prisma.category.findMany();
  fs.writeFileSync(
    path.join(dataDir, "categories.json"),
    JSON.stringify(categories, null, 2)
  );

  // Export vendors
  console.log("Exporting vendors...");
  const vendors = await prisma.vendor.findMany();
  fs.writeFileSync(
    path.join(dataDir, "vendors.json"),
    JSON.stringify(vendors, null, 2)
  );

  // Export models by vendor
  console.log("Exporting models by vendor...");

  // Get all models with pricing
  const allModels = await prisma.aIModel.findMany({
    include: {
      pricing: true,
    },
    where: {
      isHidden: false, // Only include models that aren't hidden
    },
  });

  // Format date fields
  const formattedModels = allModels.map((model) => ({
    id: model.id,
    systemName: model.systemName,
    displayName: model.displayName,
    categoryId: model.categoryId,
    parametersB: model.parametersB,
    vendorId: model.vendorId,
    host: model.host,
    precision: model.precision || undefined,
    description: model.description || undefined,
    contextWindow: model.contextWindow || undefined,
    tokenLimit: model.tokenLimit || undefined,
    releaseDate: model.releaseDate
      ? model.releaseDate.toISOString().split("T")[0]
      : undefined,
    isOpenSource: model.isOpenSource || false,
    isHidden: model.isHidden || false,
    pricing: model.pricing
      ? {
          id: model.pricing.id,
          modelId: model.pricing.modelId,
          inputText: model.pricing.inputText,
          outputText: model.pricing.outputText,
          finetuningInput: model.pricing.finetuningInput || undefined,
          finetuningOutput: model.pricing.finetuningOutput || undefined,
          trainingCost: model.pricing.trainingCost || undefined,
        }
      : undefined,
  }));

  // VALIDATION CHECK: Verify all models have required fields
  const validationErrors = [];

  for (let i = 0; i < allModels.length; i++) {
    const dbModel = allModels[i];
    const jsonModel = formattedModels[i];

    const missingFields = validateModelExport(dbModel, jsonModel);
    if (missingFields.length > 0) {
      validationErrors.push({
        modelName: dbModel.systemName,
        missingFields,
      });
    }
  }

  // If validation errors are found, abort the export
  if (validationErrors.length > 0) {
    console.error("❌ EXPORT VALIDATION FAILED!");
    console.error("The following required fields are missing from exports:");

    validationErrors.forEach(({ modelName, missingFields }) => {
      console.error(
        `- Model "${modelName}" is missing: ${missingFields.join(", ")}`
      );
    });

    throw new Error(
      "Export failed: Required fields are missing from JSON exports. See errors above."
    );
  }

  // Group models by vendor
  const modelsByVendor = new Map();

  for (const model of formattedModels) {
    if (!modelsByVendor.has(model.vendorId)) {
      modelsByVendor.set(model.vendorId, []);
    }
    modelsByVendor.get(model.vendorId).push(model);
  }

  // Save each vendor's models to a separate file
  for (const [vendorId, models] of modelsByVendor.entries()) {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) continue;

    const filename = vendor.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    fs.writeFileSync(
      path.join(vendorsDir, `${filename}.json`),
      JSON.stringify(models, null, 2)
    );
  }

  // Export all models to a single file
  console.log("Exporting combined models.json...");
  fs.writeFileSync(
    path.join(dataDir, "models.json"),
    JSON.stringify(formattedModels, null, 2)
  );

  console.log("✅ Export completed successfully with validation!");
  console.log(`Total models exported: ${formattedModels.length}`);
  console.log(
    `Hidden models count: ${formattedModels.filter((m) => m.isHidden).length}`
  );
}

// Basic connection test before running the full export
async function testPrismaConnection() {
  // Skip connection test in Netlify environment
  if (isNetlify) {
    console.log(
      "Running in Netlify environment - skipping database connection test"
    );
    return true;
  }

  try {
    // Test a simple query that should always work
    const categoryCount = await prisma.category.count();
    console.log(`Connection test passed: Found ${categoryCount} categories`);
    return true;
  } catch (error) {
    console.error("❌ PRISMA CONNECTION TEST FAILED:");
    console.error(
      "This may be due to a missing DATABASE_URL environment variable"
    );
    console.error("or a database that needs migration.");
    console.error("\nDetailed error:");
    console.error(error);
    return false;
  }
}

async function runWithErrorHandling() {
  try {
    // First test the connection (unless we're in Netlify)
    const connectionValid = await testPrismaConnection();
    if (!connectionValid) {
      process.exit(1);
    }

    // If in Netlify environment, skip database operations
    if (isNetlify) {
      console.log("Running in Netlify environment - using existing JSON files");
      return;
    }

    // If connection is valid, run the main export
    await main();
  } catch (e) {
    console.error("❌ Error during export:");
    console.error(e);
    // Don't exit with error in Netlify environment
    if (!isNetlify) {
      process.exit(1);
    } else {
      console.warn("Continuing despite error in Netlify environment");
    }
  } finally {
    if (!isNetlify && prisma) {
      await prisma.$disconnect();
    }
  }
}

runWithErrorHandling();
